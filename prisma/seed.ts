import { PrismaClient } from '@prisma/client';
import mammoth from 'mammoth';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient({});

const CATEGORIES = [
  "Veg. Appetizers",
  "Non-Veg. Appetizers",
  "Soups",
  "Salad",
  "Chicken Main Course",
  "Lamb Main Course",
  "Goat Main Course",
  "Veg. Main Course",
  "Sea Food Main Course",
  "Tandoori Grill Main Course",
  "Bread",
  "Whole Wheat Bread",
  "Rice",
  "Biryani",
  "Side Orders"
];

const CATEGORY_MAP: Record<string, string> = {
  "Chicken Main Course (All White Meat)": "Chicken Main Course",
  "Rice (All Basmati Rice)": "Rice",
};

// Map menu item names to image paths
const IMAGE_MAP: Record<string, string> = {
  // Appetizers
  "Aloo Tikki Chaat": "/assets/OMIndianRestaurant_AlooTikkiChaat.jpg",
  "Seek Kabab": "/assets/OMIndianRestaurant_SeekhKebab.jpg",
  "Malai Chicken Kabab": "/assets/OMIndianRestaurant_ChickenMalaKebab.jpg",
  // Chicken
  "Chicken Tikka Masala / Butter Chicken": "/assets/OMIndianRestaurant_ChickenTikkaMasala.jpg",
  "Chicken Chettinad": "/assets/OMIndianRestaurant_ChickenChettinad.jpg",
  // Lamb
  "Lamb Rogan Josh": "/assets/OMIndianRestaurant_LambRojhanjosh.jpg",
  "Lamb Curry": "/assets/OMIndianRestaurant_LambCurry.jpg",
  "Lamb Chop": "/assets/OMIndianRestaurant_LambChops.jpg",
  // Goat
  "Goat Curry": "/assets/OMIndianRestaurant_GoatCurry.jpg",
  // Veg
  "Navratan Korma": "/assets/OMIndianRestaurant_XlavaratanKorma.jpg",
  "Paneer Tikka Masala": "/assets/OMIndianRestaurant_PaneertikkaMasala.jpg",
  "Methi Saag Alo": "/assets/OMIndianRestaurant_RailwayPalak.jpg",
  // Seafood
  "Salmon Tikka": "/assets/OMIndianRestaurant_SalmonTikka.jpg",
  "Chili Shrimp": "/assets/OMIndianRestaurant_JumboPrawn.jpg",
  // Tandoori
  "Tandoori Chicken": "/assets/OMIndianRestaurant_TandoonChicken.jpg",
  "Tandoori Grilled Paneer": "/assets/OMIndianRestaurant_TandoonPaneer.jpg",
  "Lamb Seekh Kebab": "/assets/OMIndianRestaurant_SeekhKebab.jpg",
  // Bread
  "Garlic Naan": "/assets/OMIndianRestaurant_GarlicNaan.jpg",
  "Special 3 Cheese Naan": "/assets/OMIndianRestaurant_3CheeseBlendNaan.jpg",
  // Biryani
  "Chicken Biryani": "/assets/OMIndianRestaurant_ChickenRice.jpg",
  // Desserts (side orders)
  "Gulab Jamun": "/assets/OMIndianRestaurant_GulabJamun.jpg",
  "Kheer": "/assets/OMIndianRestaurant_Kheer.jpg",
};

function getImageForItem(name: string): string | null {
  // Direct match
  if (IMAGE_MAP[name]) return IMAGE_MAP[name];
  
  // Partial match
  for (const [key, value] of Object.entries(IMAGE_MAP)) {
    if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
      return value;
    }
  }
  return null;
}

async function parseMenu(filePath: string) {
  let { value: text } = await mammoth.extractRawText({ path: filePath });
  
  // Pre-processing fixes for extraction artifacts
  text = text.replace(/SaladOm/g, "Salad\nOm");
  text = text.replace(/Chicken Main Course \(All White Meat\)/g, "Chicken Main Course");
  text = text.replace(/Rice \(All Basmati Rice\)/g, "Rice");

  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  const result: { category: string; items: { name: string; price: number; description: string }[] }[] = [];
  let currentCategory = "Appetizers"; 
  let currentItems: any[] = [];

  const priceRegex = /(\d+\.\d{2})/;

  for (const line of lines) {
    // Check for Category
    // Exact match or known start
    const matchedCat = CATEGORIES.find(c => line.toLowerCase() === c.toLowerCase() || line.toLowerCase().startsWith(c.toLowerCase()));
    
    // Avoid treating items as categories if they happen to start with a category name (rare but possible)
    // e.g. "Chicken Tikka" starts with "Chicken" but "Chicken Main Course" is the category.
    // Heuristic: If it has a price, it's an item.
    const hasPrice = priceRegex.test(line);

    if (matchedCat && !hasPrice) {
        // Push previous category
        if (currentItems.length > 0) {
            result.push({ category: currentCategory, items: currentItems });
            currentItems = [];
        }
        currentCategory = CATEGORY_MAP[matchedCat] || matchedCat;
        continue;
    }

    // Check Item
    const priceMatch = line.match(priceRegex);
    if (priceMatch) {
      const priceStr = priceMatch[1];
      const parts = line.split(priceStr);
      const name = parts[0].trim();
      
      if (name) {
          const price = parseFloat(priceStr);
          currentItems.push({
              name,
              price,
              description: parts[1]?.trim() || ""
          });
          continue;
      }
    }

    // Description
    if (currentItems.length > 0) {
      const lastItem = currentItems[currentItems.length - 1];
      lastItem.description = (lastItem.description + " " + line).trim();
    }
  }

  if (currentItems.length > 0) {
    result.push({ category: currentCategory, items: currentItems });
  }

  return result;
}

async function main() {
  console.log("Starting seed...");
  
  // Clean DB
  try {
    // await prisma.orderItemNote?.deleteMany?.().catch(() => {}); // If exists
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.category.deleteMany();
  } catch (e) {
    console.warn("Error cleaning DB (might be first run):", e);
  }

  const menuPath = path.join(process.cwd(), '_original_assets', 'OM menu in house NEW.docx');
  
  if (!fs.existsSync(menuPath)) {
    console.warn("Menu file not found:", menuPath);
    return;
  }

  const parsed = await parseMenu(menuPath);
  console.log(`Found ${parsed.length} categories.`);

  let sortOrder = 0;
  for (const catData of parsed) {
    console.log(`Creating category: ${catData.category} with ${catData.items.length} items`);
    const category = await prisma.category.create({
      data: { 
        name: catData.category,
        sortOrder: sortOrder++
      }
    });

    for (const item of catData.items) {
      // Cleanup description
      let desc = item.description.replace(/^[-–]\s*/, '').trim();
      
      // Cleanup name
      let name = item.name.replace(/[\.\s]+$/, '');

      const imageUrl = getImageForItem(name);
      await prisma.menuItem.create({
        data: {
          name,
          description: desc,
          price: item.price,
          categoryId: category.id,
          imageUrl
        }
      });
    }
  }
  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

