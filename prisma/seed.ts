import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({});

// Take-out menu items - ONLY items from the take-out menu images
// Prices are the take-out prices you provided (ending in .95)

const TAKEOUT_MENU = {
  "Veg. Appetizers": [
    { name: "Samosa", description: "Crispy turnover with potatoes & green peas", price: 8.95 },
    { name: "Sweet & Sour Gobi", description: "Cauliflower cooked in sweet & sour sauce.", price: 8.95 },
    { name: "Onion Bhajjias", description: "Savory deep fried onion fritters made with Bengal gram flours.", price: 9.95 },
    { name: "Assorted Pakora", description: "Vegetable medley chickpea batter fried and served with sweet and sour chutney.", price: 9.95 },
    { name: "Tandoori Mix Veg.", description: "Florets of mixed veggies marinated with spices, ginger, garlic and grilled.", price: 10.95 },
    { name: "Tandoori Mushroom", description: "Mushrooms marinated with roasted spices, hung yogurt and pickles", price: 10.95 },
    { name: "Tandoori Paneer", description: "Large chunks of Indian cottage cheese marinated in a spiced hung yogurt and grilled to perfection.", price: 12.95 },
  ],
  "Non-Veg. Appetizers": [
    { name: "Chicken 65", description: "Stir-fried chicken sautéed with bell pepper, onion, ginger and garlic.", price: 11.95 },
    { name: "Malai Chicken Kabab", description: "Marinated in yogurt, saffron, spices & herbs.", price: 11.95 },
    { name: "Achari Chicken", description: "Tandoori grilled with pickling spices.", price: 11.95 },
    { name: "Seek Kabab", description: "Ground lamb seasoned with onions & spices", price: 12.95 },
    { name: "Chili Shrimp", description: "Indo-Chinese tossed with bell peppers, onions, chilis, garlic and ginger.", price: 13.95 },
  ],
  "Soups": [
    { name: "Lentil Soup", description: "Lentil broth with turmeric and spices", price: 6.95 },
    { name: "Chicken Soup", description: "Broth simmered with diced chicken and spices", price: 7.95 },
  ],
  "Salad": [
    { name: "Om Green Salad", description: "Lettuce, bell pepper, carrot, cucumber, tomatoes with chef's dressing.", price: 7.95 },
  ],
  "Chicken Main Course": [
    { name: "Chicken Tikka Masala", description: "Grilled marinated chicken in a creamy tomato fenugreek sauce.", price: 18.95 },
    { name: "Butter Chicken", description: "Marinated chicken cooked in a rich tomato and butter sauce", price: 18.95 },
    { name: "Chicken Korma", description: "Roasted cashew nut, raisin, golden fried onion, saffron milk, cream and mild spices.", price: 18.95 },
    { name: "Chicken Chettinad", description: "Fresh ground pepper, temper with mustard seeds and curry leaves, with coconut milk.", price: 18.95 },
    { name: "Chicken Vindaloo", description: "Cooked with freshly ground spices, toddy vinegar, whole dry chili sauce.", price: 17.95 },
    { name: "Chicken Saag", description: "Chicken sauteed in spinach with a hint of spices.", price: 17.95 },
    { name: "Chicken Curry", description: "Traditional Indian style chicken curry, very savory with aromatic spices.", price: 17.95 },
    { name: "Chicken Kadhai", description: "Chunks of chicken braised in a masala of coarse ground spices with sauteed onions, bell peppers.", price: 17.95 },
    { name: "Madras Chicken Curry", description: "White poppy seeds, sliced onions, toasted grated coconut, and large dried red chili", price: 17.95 },
  ],
  "Lamb Main Course": [
    { name: "Lamb Tikka Masala", description: "Grilled marinated lamb in a creamy tomato fenugreek sauce.", price: 20.95 },
    { name: "Lamb Korma", description: "Roasted cashew nut, raisin, golden fried onion, saffron coconut milk and spices.", price: 20.95 },
    { name: "Lamb Rogan Josh", description: "Slow cooked lamb with intense spices in an onion and tomato curry sauce", price: 20.95 },
    { name: "Lamb Vindaloo", description: "Tender lamb in a spicy curry made from vinegar, chilies and garlic.", price: 20.95 },
    { name: "Lamb Bhuna", description: "Lamb intensely sauteed with onion & spices and cooked in its own juices.", price: 20.95 },
    { name: "Lamb Chettinad", description: "Cooked with crushed black pepper, curry leaves, mustard seeds finished with coconut milk.", price: 20.95 },
    { name: "Lamb Kadai", description: "Lamb and assorted fresh vegetables with bell peppers and special sauce", price: 20.95 },
    { name: "Lamb Saag", description: "Cubes of lamb sautéed with fresh spinach and spices", price: 20.95 },
    { name: "Lamb Jalfrez", description: "Tender chunks of lamb cooked in a spicy tomato gravy with chunky onions, peppers and tomatoes.", price: 20.95 },
    { name: "Lamb Dhansaak", description: "Dhansaak is a flavorful and aromatic curry, Fenugreek, lentil.", price: 21.95 },
  ],
  "Goat Main Course": [
    { name: "Goat Curry", description: "Traditional Indian style goat curry, very savory with aromatic spices", price: 23.95 },
    { name: "Goat Vindaloo", description: "Freshly ground spices, whole dry chili, toddy vinegar.", price: 23.95 },
    { name: "Goat Bhuna", description: "Goat intensely sauteed with onion & spices and cooked in its own juices", price: 23.95 },
  ],
  "Veg. Main Course": [
    { name: "OM Daal", description: "Mix black lentils cooked with butter and in a fresh tomato sauce", price: 17.95 },
    { name: "Delhi Masala Daal", description: "Yellow lentils cooked slowly with herbs and spices", price: 17.95 },
    { name: "Paneer Tikka Masala", description: "Indian cottage cheese cooked in creamy tomato and onion sauce", price: 17.95 },
    { name: "Malai Kofta", description: "Vegetable balls in tomato cream sauce", price: 17.95 },
    { name: "Aloo Gobi Matar", description: "Potato, cauliflower & green peas cooked with cumin, ginger, and spices.", price: 17.95 },
    { name: "Achari Bainghan", description: "Baby eggplant cooked with pickling spices.", price: 17.95 },
    { name: "Saag Paneer", description: "Cottage cheese cooked with spinach, herbs & spices", price: 17.95 },
    { name: "Veg. Curry", description: "Mixed vegetables cooked in home-style cooking", price: 17.95 },
    { name: "Chana Saag", description: "Chickpeas cooked with spinach, herbs and spices", price: 17.95 },
    { name: "Chana Masala", description: "Chickpeas with onion & tomato (gravy-based curry)", price: 17.95 },
    { name: "Bhindi Masala", description: "Fresh cut okra with cumin, onion, tomato masala", price: 17.95 },
    { name: "Vegetable Korma", description: "Fresh vegetables cooked mildly spiced Almond cream sauce", price: 17.95 },
  ],
  "Sea Food Main Course": [
    { name: "Shrimp Tikka Masala", description: "Grilled marinated shrimp in a creamy tomato fenugreek sauce.", price: 23.95 },
    { name: "Shrimp Curry", description: "Shrimp cooked in traditional Indian style curry.", price: 23.95 },
    { name: "Goan Shrimp Curry", description: "Shrimp cooked with fresh coconut milk with onions, lime juice, & spices.", price: 23.95 },
    { name: "Shrimp Korma", description: "Roasted cashew nut, raisin, golden fried onion, mix fruits, saffron and spices.", price: 23.95 },
    { name: "Shrimp Saag", description: "Onions, tomatoes with fresh sautéed spinach with ginger & garlic.", price: 23.95 },
    { name: "Goan Salmon Curry", description: "Salmon fillet cooked with fresh coconut milk with cumin, curry leaves, lime juice & spices.", price: 23.95 },
    { name: "Fish Masala", description: "Pan seared salmon cooked with an onion, fenugreek leaves & tomato spiced sauce.", price: 24.95 },
    { name: "Shrimp/Salmon Vindaloo", description: "Freshly ground spices, whole dry chili, toddy vinegar.", price: 24.95 },
  ],
  "Tandoori Grill Main Course": [
    { name: "Tandoori Chicken", description: "Bone-in half chicken marinated in hung yogurt and classic tandoori spices.", price: 20.95 },
    { name: "Tandoori Chicken Tikka", description: "Chicken marinated with fresh basil, yogurt, roasted garlic paste, spices, & olive oil.", price: 20.95 },
    { name: "Malai Kabab", description: "Chicken marinated with cheddar cheese, saffron, white pepper, hung yogurt.", price: 21.95 },
    { name: "Lamb Boti Kebab", description: "Tender chunks of lamb marinated in hung yogurt, garlic, ginger, mint", price: 22.95 },
    { name: "Lamb Seekh Kebab", description: "Oven cooked grounded lamb seasoned with cumin, ginger, & mint.", price: 23.95 },
    { name: "Lamb Chops", description: "Marinated with a special house sauce.", price: 31.95 },
    { name: "Salmon Tikka", description: "Atlantic salmon fillets marinated in hung yogurt and herbs", price: 25.95 },
    { name: "Tandoori Shrimp", description: "Jumbo shrimp marinated in a spiced hung yogurt mixture.", price: 25.95 },
    { name: "OM Mixed Grill", description: "Assortment of Chicken, Lamb and Seafood.", price: 28.95 },
  ],
  "Bread": [
    { name: "Plain Naan", description: "Leavened flatbread cooked in a clay oven.", price: 3.95 },
    { name: "Garlic Naan", description: "Garlic stuffed bread", price: 4.95 },
    { name: "Onion Naan", description: "Leavened flatbread stuffed with spiced diced onions.", price: 4.95 },
    { name: "Om Bread (Sweet)", description: "Sweet stuffed bread", price: 5.95 },
    { name: "Special 3 Cheese Naan", description: "Three cheese stuffed naan", price: 6.95 },
    { name: "Paneer Naan", description: "Cheese stuffed bread", price: 5.95 },
    { name: "Chicken Tikka Naan", description: "Chicken tikka stuffed bread", price: 5.95 },
  ],
  "Whole Wheat Bread": [
    { name: "Plain Roti", description: "Whole wheat flatbread", price: 4.95 },
    { name: "Laccha Paratha", description: "Tandoor-baked whole wheat multi layered flaky bread", price: 5.95 },
    { name: "Mint Paratha", description: "Whole wheat bread with mint", price: 5.95 },
    { name: "Aloo Paratha", description: "Tandoor-baked whole wheat bread with a stuffing of mildly spiced potatoes and onions.", price: 5.95 },
    { name: "Special Chili Garlic Naan", description: "Chili and garlic stuffed naan", price: 6.95 },
  ],
  "Rice": [
    { name: "Matar Pulao", description: "With cumin and green peas.", price: 7.95 },
    { name: "Om Sweet Pulao", description: "Saffron rice cooked with fruits and nuts.", price: 7.95 },
    { name: "Lemon Rice", description: "Cooked with lemon juice, mustard seeds, fried peanuts, and curry leaves.", price: 7.95 },
  ],
  "Biryani": [
    { name: "Veg. Biryani", description: "Fresh vegetables cooked with basmati rice, herbs, and spices.", price: 18.95 },
    { name: "Chicken Biryani Hyderabadi", description: "Basmati rice with Chicken cooked with spices in the style of Hyderabadi Nawabs", price: 20.95 },
    { name: "Lamb Biryani", description: "Basmati Rice with Lamb cooked with herbs and spices.", price: 22.95 },
    { name: "Shrimp Biryani", description: "Basmati Rice with Shrimps cooked with herbs and spices.", price: 23.95 },
    { name: "Goat Biryani", description: "Basmati Rice with Goat meat cooked with herbs and spices.", price: 23.95 },
  ],
  "Side Orders": [
    { name: "Onion Relish", description: "Chopped onions marinated with a blend of tomato purée, vinegar", price: 2.95 },
    { name: "Papadum", description: "Crispy Indian dried lentil crackers.", price: 3.95 },
    { name: "Mango Chutney", description: "A blend of ripe mangoes, sugar, and select spices", price: 4.95 },
    { name: "Raita", description: "Yogurt with carrots & Cucumbers and spices", price: 4.95 },
    { name: "Jeera Aloo", description: "Cumin Flavored Potatoes.", price: 9.95 },
    { name: "Om Daal / Delhi Masala Daal", description: "Mix black lentils with butter or yellow lentils cooked slowly with herbs & spices", price: 9.95 },
  ],
  "Dessert": [
    { name: "OM Kheer", description: "Almond and apple flavored rice pudding in cardamom", price: 5.95 },
    { name: "Gulab Jamun", description: "Soft dumplings of milk, flour simmered in simple syrup, rose water, cardamom", price: 6.95 },
    { name: "Ras Malai", description: "Steamed cottage cheese dumplings with saffron milk", price: 6.95 },
    { name: "Pistachio Kulfi", description: "Traditional Indian ice cream with pistachio", price: 6.95 },
    { name: "Mango Kulfi", description: "Traditional Indian ice cream with mango", price: 6.95 },
  ],
  "Beverages": [
    { name: "Mango Lassi", description: "Sweet yogurt drink blended with mango", price: 5.95 },
    { name: "Sweet Lassi", description: "Sweet yogurt drink", price: 4.95 },
    { name: "Salted Lassi", description: "Traditional salted yogurt drink", price: 4.95 },
    { name: "Masala Chai", description: "Spiced Indian tea", price: 3.95 },
    { name: "Soft Drinks", description: "Coke, Diet Coke, Sprite, Ginger Ale", price: 2.95 },
  ],
};

// Image URL mapping for menu items
function getImageForItem(name: string): string | null {
  const imageMap: Record<string, string> = {
    "Samosa": "/images/menu/samosa.jpg",
    "Chicken Tikka Masala": "/images/menu/chicken-tikka-masala.jpg",
    "Butter Chicken": "/images/menu/butter-chicken.jpg",
    "Lamb Rogan Josh": "/images/menu/lamb-rogan-josh.jpg",
    "Saag Paneer": "/images/menu/palak-paneer.jpg",
    "Biryani": "/images/menu/biryani.jpg",
    "Naan": "/images/menu/naan.jpg",
    "Tandoori Chicken": "/images/menu/tandoori-chicken.jpg",
  };
  return imageMap[name] || null;
}

async function main() {
  console.log('Starting seed...');
  
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  
  // Create categories and items from TAKEOUT_MENU
  const categoryNames = Object.keys(TAKEOUT_MENU);
  console.log(`Found ${categoryNames.length} categories.`);
  
  for (let i = 0; i < categoryNames.length; i++) {
    const categoryName = categoryNames[i];
    const items = TAKEOUT_MENU[categoryName as keyof typeof TAKEOUT_MENU];
    
    console.log(`Creating category: ${categoryName} with ${items.length} items`);
    
    const category = await prisma.category.create({
      data: {
        name: categoryName,
        sortOrder: i + 1,
      }
    });
    
    for (const item of items) {
      const imageUrl = getImageForItem(item.name);
      await prisma.menuItem.create({
        data: {
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: category.id,
          imageUrl
        }
      });
    }
  }
  
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
