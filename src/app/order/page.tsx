import { prisma } from '@/lib/prisma';
import OrderInterface from '@/components/OrderInterface';
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Order Online - OM Indian Restaurant',
  description: 'Place your order online for pickup or delivery.',
};

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic';

// Lunch menu data (served 12:00 PM - 2:45 PM)
const lunchMenu = {
  pricing: { veg: "$17.95", lamb: "$18.95" },
  hours: "12:00 PM - 2:45 PM",
  includes: "Served with basmati rice, naan bread, and lentil of the day",
  sections: [
    {
      name: "Appetizers",
      items: [
        { name: "Onion Bhajias", description: "Battered and fried onion fritters" },
        { name: "Aloo Tikki Chaat", description: "Fried potato patties with yogurt, tamarind chutney, green chutney" },
        { name: "Sweet & Sour Gobi", description: "Cauliflower cooked in sweet & sour sauce" },
        { name: "Malai Kabab", description: "Marinated in cheese, saffron, white pepper, yogurt" },
        { name: "Seek Kebab", description: "Minced lamb cooked on skewers in clay oven" },
      ]
    },
    {
      name: "Veg & Chicken Main Courses",
      items: [
        { name: "Navratan Korma", description: "Vegetables cooked in almond cream sauce" },
        { name: "Saag Aloo", description: "Potatoes cooked in spinach and spices" },
        { name: "Panir Tikka Masala", description: "Cottage cheese cooked in tomato sauce" },
        { name: "Chana Masala", description: "Chickpeas with onion & tomato sauce" },
        { name: "Vegetable Curry", description: "Vegetables in traditional home style curry" },
        { name: "Chicken Tikka Masala", description: "Chicken marinated in creamy tomato sauce" },
        { name: "Chicken Vindaloo", description: "Chicken cooked in spicy vinegar & chili sauce" },
      ]
    },
    {
      name: "Lamb & Seafood Main Courses",
      items: [
        { name: "Lamb Rogan Josh", description: "Lamb with intense spices in an onion and tomato curry sauce" },
        { name: "Railway Lamb Curry", description: "Anglo-style, tempered with mustard seeds and curry leaves, coconut milk and tomato sauce" },
        { name: "Lamb Saag", description: "Lamb cooked with fresh spinach and spices" },
        { name: "Goan Salmon Curry", description: "Salmon cooked with fresh coconut milk, cumin, curry leaves, lime juice & spices" },
        { name: "Salmon Saag", description: "Salmon cooked with fresh spinach and spices" },
        { name: "Chicken Tikka (Grilled)", description: "Chicken marinated with fresh basil, yogurt, roasted garlic paste, spices, and olive oil" },
      ]
    },
  ],
  happyHour: {
    wines: [
      { name: "Riesling, Alsace FR", description: "Defined by its graceful, delicate fruit aromas and refreshing finish.", price: "$9" },
      { name: "Rosé, Mi Mi, Provence FR", description: "Bright Salmon. Inviting Watermelon. Violets. Refreshing, dry strawberry.", price: "$9" },
      { name: "Malbec Vista Flores, Catena, Mendoza AR", description: "Dark violet color with black reflections. Dark and red fruit aromas.", price: "$9" },
      { name: "Rioja Crianza, Bujanda, Spain", description: "Aromas of blackberry with spicy tones, mild tobacco and light balsamic notes.", price: "$9" },
    ],
    beverages: [
      { name: "Black Tea", price: "$3" },
      { name: "Masala Tea", price: "$3" },
      { name: "Ice Tea", price: "$3" },
      { name: "Soda", price: "$3" },
      { name: "Still Water", price: "$6" },
      { name: "Sparkling Water", price: "$5" },
      { name: "Mango Lassi", price: "$6" },
    ],
    beers: [
      { name: "Stella", price: "$7" },
      { name: "Kingfisher", price: "$7" },
    ],
    desserts: [
      { name: "Ras Malai", description: "Steamed cottage cheese dumplings with saffron milk", price: "$5" },
      { name: "Gulab Jamun", description: "Cake balls in a warm rose syrup", price: "$5" },
      { name: "OM Kheer", description: "Almond & apple flavored rice pudding in cardamom", price: "$5" },
    ],
  },
};

// Bar menu data
const barMenu = [
  {
    category: "Special House Cocktails",
    items: [
      { name: "Bar Special", description: "Tequila, Ginger Beer, Blue Curacao, Lime wedge, Granulated Sugar", price: "$13" },
      { name: "York Ave Sour", description: "Bourbon whiskey, Lemon juice, Red wine, Simple Syrup", price: "$13" },
      { name: "Gin Daiquiri", description: "Gin, Ginger Liqueur, Kahlua", price: "$13" },
      { name: "Mango Martini", description: "Vodka, Mango Juice, Fresh Lime Juice", price: "$13" },
      { name: "Rum Punch", description: "Dark rum, Lime juice, Simple syrup, 3 Dashes Bitter, Grenadine, Splash soda water", price: "$13" },
      { name: "From Chef", description: "Vodka, Turmeric, Lime, Ginger Beer", price: "$13" },
      { name: "Coffee Negroni", description: "Coffee, Tequila, Campari, Sweet Vermouth", price: "$13" },
    ]
  },
  {
    category: "Classic Cocktails",
    items: [
      { name: "Moscow Mule", description: "Vodka, Ginger beer, splash of lime", price: "$13" },
      { name: "Pina Colada", description: "Rum, Pineapple juice, Coconut milk", price: "$13" },
      { name: "Strawberry Daiquiri", description: "Rum, Lime Juice, simple syrup", price: "$13" },
      { name: "Vodka Daiquiri", description: "Vodka, Peach Blossom, Lime Juice", price: "$13" },
      { name: "Aperol Spritz", description: "Prosecco, Aperol Spritz, Splash of Club Soda", price: "$13" },
      { name: "Lychee Martini", description: "Vodka, lychee juice, lime juice", price: "$13" },
    ]
  },
  {
    category: "Wine by the Glass - Red",
    items: [
      { name: "Malbec Vista Flores, Catena", description: "Mendoza AR - Dark violet with floral notes of lavender, violet, and mocha", price: "$11" },
      { name: "Cabernet Sauvignon, Ryder", description: "CA - Rich, smooth with hints of mocha, cherry and black berries", price: "$12" },
      { name: "Rioja Crianza, Bujanda", description: "Rioja SP - Aromas of blackberry with spicy tones, mild tobacco", price: "$12" },
      { name: "Valpolicella Classico Superiore, Zenato", description: "Veneto IT - Wild berries, blackcurrants, black cherries, hints of chocolate", price: "$12" },
      { name: "Pinot Noir, Napa Valley", description: "Hand selected grapes, tradition and family heritage", price: "$12" },
    ]
  },
  {
    category: "Wine by the Glass - White",
    items: [
      { name: "Dr. L Riesling", description: "Mosel DE - Bright, refreshing, fruit-driven with crisp finish", price: "$11" },
      { name: "Pinot Grigio, Zenato", description: "Delle Venezia IT - Soft texture with hint of cantaloupe", price: "$12" },
      { name: "Villa Maria Sauvignon Blanc", description: "Marlborough NZ - Aromas of gooseberry and passionfruit", price: "$12" },
      { name: "Chardonnay, Black's Station", description: "CA - Flavors of melon, mango, and toasty oak", price: "$12" },
    ]
  },
  {
    category: "Rosé & Bubbles",
    items: [
      { name: "Rosé, Mont Gravet", description: "Languedoc FR - Light pink with strawberries and raspberries", price: "$11" },
      { name: "Zardetto Spumante", description: "Veneto IT - Notes of pears, apples, and peaches", price: "$11" },
    ]
  },
  {
    category: "Beer",
    items: [
      { name: "Taj Mahal (650ml)", price: "$12" },
      { name: "Kingfisher", price: "$8" },
      { name: "Stella", price: "$8" },
      { name: "Non-Alcoholic Beer", price: "$8" },
    ]
  },
];

// Catering menu data
const cateringMenu = [
  {
    name: "Appetizers",
    items: [
      { name: "Samosas", description: "Crispy turnovers stuffed with spiced potatoes and green peas.", perPiece: "$2.75/piece" },
      { name: "Onion Bhajia", description: "Onion fritters in chickpea flour, spices, and herbs.", halfTray: "$65.00", fullTray: "$115.00" },
      { name: "Vegetable Pakora", description: "Mixed vegetable fritters in chickpea flour, spices, and herbs.", halfTray: "$65.00", fullTray: "$125.00" },
      { name: "Sweet & Sour Gobi", description: "Crispy battered cauliflower tossed in tangy sweet and sour sauce.", halfTray: "$75.00", fullTray: "$145.00" },
      { name: "Tandoori Mushroom", description: "Made with cream cheese, onion, peppers, cilantro chutney.", halfTray: "$65.00", fullTray: "$150.00" },
      { name: "Paneer Tikka", description: "Large chunks of Indian cottage cheese marinated in spiced yogurt and grilled.", halfTray: "$83.00", fullTray: "$160.00" },
    ]
  },
  {
    name: "Tandoori Specials",
    items: [
      { name: "Tandoori Chicken", description: "Chicken marinated in ginger, garlic paste, yogurt, Kashmiri red chiles.", halfTray: "$90.00", fullTray: "$170.00" },
      { name: "Chicken Tikka", description: "Boneless chicken marinated in spiced yogurt, cooked on live charcoal.", halfTray: "$85.00", fullTray: "$155.00" },
      { name: "Malai Kebab", description: "Minced chicken skewers with herbs & spices, grilled in clay oven.", halfTray: "$85.00", fullTray: "$155.00" },
      { name: "Lamb Seekh Kebab", description: "Minced lamb skewers with cilantro, onions, garlic, ginger, spices.", halfTray: "$95.00", fullTray: "$190.00" },
      { name: "Salmon Tikka", description: "Marinated in ground spices, yogurt, and Kashmiri chilies.", halfTray: "$150.00", fullTray: "$290.00" },
    ]
  },
  {
    name: "Vegetarian Entrees",
    items: [
      { name: "Bhindi Masala", description: "Okra sauteed with onions, tomato, ginger, garlic.", halfTray: "$87.00", fullTray: "$169.00" },
      { name: "Aloo Gobi Matar", description: "Potatoes, cauliflower, green peas in tomato cumin sauce.", halfTray: "$87.00", fullTray: "$169.00" },
      { name: "OM Daal", description: "Slow-cooked black lentils with tomatoes, ginger, garlic, spices.", halfTray: "$87.00", fullTray: "$169.00" },
      { name: "Chana Masala", description: "Chickpeas prepared with pomegranate seeds, dry mango powder, ginger.", halfTray: "$87.00", fullTray: "$169.00" },
      { name: "Vegetable Korma", description: "Nine-vegetable stew with cashews, dried fruit, and saffron.", halfTray: "$87.00", fullTray: "$169.00" },
      { name: "Saag Paneer", description: "Soft Indian cheese with pureed spinach, onions, ginger, garlic.", halfTray: "$89.00", fullTray: "$172.00" },
      { name: "Paneer Tikka Masala", description: "Indian cottage cheese in tomato-cream sauce.", halfTray: "$89.00", fullTray: "$172.00" },
    ]
  },
  {
    name: "Chicken Entrees",
    items: [
      { name: "Butter Chicken", description: "Chicken tossed in spice marinade, lightly charred in buttery, creamy tomato sauce.", halfTray: "$93.00", fullTray: "$179.00" },
      { name: "Chicken Tikka Masala", description: "Chicken cooked in clay oven with rich tomato & fenugreek sauce.", halfTray: "$93.00", fullTray: "$179.00" },
      { name: "Chicken Saag", description: "Chicken with pureed spinach, ginger, garlic, and spices.", halfTray: "$93.00", fullTray: "$179.00" },
      { name: "Chicken Korma", description: "Chicken pieces cooked in almond cream sauce.", halfTray: "$93.00", fullTray: "$179.00" },
      { name: "Chicken Vindaloo", description: "Chicken in fiery Goan sauce with garlic, vinegar, cumin.", halfTray: "$93.00", fullTray: "$179.00" },
    ]
  },
  {
    name: "Lamb Entrees",
    items: [
      { name: "Lamb Rogan Josh", description: "Lamb with onions, tomatoes, Kashmiri red chiles, spices.", halfTray: "$97.00", fullTray: "$191.00" },
      { name: "Lamb Tikka Masala", description: "Lamb cooked in clay oven with rich tomato & fenugreek sauce.", halfTray: "$97.00", fullTray: "$191.00" },
      { name: "Lamb Korma", description: "Boneless lamb in cashew-saffron cream sauce.", halfTray: "$97.00", fullTray: "$191.00" },
      { name: "Lamb Vindaloo", description: "Lamb in fiery Goan sauce with garlic, vinegar, cumin.", halfTray: "$97.00", fullTray: "$191.00" },
      { name: "Lamb Saag", description: "Cubes of lamb sautéed with fresh spinach and spices.", halfTray: "$95.00", fullTray: "$185.00" },
    ]
  },
  {
    name: "Seafood Entrees",
    items: [
      { name: "Goan Salmon Curry", description: "Salmon fillet cooked with coconut milk, cumin, curry leaves.", halfTray: "$115.00", fullTray: "$200.00" },
      { name: "Goan Shrimp Curry", description: "In coconut, tomato, tamarind sauce with mustard seeds & curry leaves.", halfTray: "$120.00", fullTray: "$220.00" },
      { name: "Shrimp Tikka Masala", description: "Shrimp cooked in clay oven with rich tomato & fenugreek sauce.", halfTray: "$120.00", fullTray: "$220.00" },
    ]
  },
  {
    name: "Biryani",
    items: [
      { name: "Vegetable Biryani", description: "Fried basmati rice with vegetables, nuts, and spices.", halfTray: "$79.00", fullTray: "$149.00" },
      { name: "Chicken Biryani", description: "Fried basmati rice with chicken, vegetables, nuts, and spices.", halfTray: "$93.00", fullTray: "$179.00" },
      { name: "Lamb Biryani", description: "Fried basmati rice with lamb, vegetables, nuts, and spices.", halfTray: "$99.00", fullTray: "$189.00" },
      { name: "Goat Biryani", description: "Basmati rice with goat cooked with herbs and spices.", halfTray: "$120.00", fullTray: "$235.00" },
    ]
  },
  {
    name: "Breads",
    items: [
      { name: "Naan", description: "Leavened flatbread cooked in clay oven.", perPiece: "$3.00/piece" },
      { name: "Roti", description: "Whole wheat flatbread.", perPiece: "$3.00/piece" },
      { name: "Garlic Naan", description: "Garlic stuffed bread.", perPiece: "$3.50/piece" },
      { name: "Onion Naan", description: "Leavened flatbread stuffed with spiced diced onions.", perPiece: "$4.50/piece" },
    ]
  },
  {
    name: "Rice & Sides",
    items: [
      { name: "Basmati Rice", description: "Aromatic long grain rice.", halfTray: "$40.00", fullTray: "$75.00" },
      { name: "OM Sweet Rice", description: "Saffron rice cooked with fruits and nuts.", halfTray: "$45.00", fullTray: "$85.00" },
      { name: "Green Salad", description: "Tomato, carrot, lettuce, balsamic dressing.", halfTray: "$40.00", fullTray: "$75.00" },
    ]
  },
  {
    name: "Desserts & Beverages",
    items: [
      { name: "Gulab Jamun", description: "Soft dumplings of milk, flour simmered in rose water, cardamom.", perPiece: "$2.25/person" },
      { name: "OM Kheer", description: "Almond and apple flavored rice pudding in cardamom.", halfTray: "$60.00", fullTray: "$140.00" },
      { name: "Soda", description: "Diet Coke, Coke, Ginger Ale, Sprite.", perPiece: "$1.99/person" },
      { name: "Mango Lassi", description: "Refreshing mango yogurt drink.", perPiece: "$3.95/person" },
    ]
  },
];

// Serialize the data to convert Decimals to numbers
function serializeCategories(categories: any[]) {
  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    items: cat.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      image: item.imageUrl,
    }))
  }));
}

export default async function OrderPage() {
  let dinnerCategories: ReturnType<typeof serializeCategories> = [];
  
  try {
    const categories = await prisma.category.findMany({
      include: { items: true },
      orderBy: { sortOrder: 'asc' }
    });
    dinnerCategories = serializeCategories(categories);
  } catch (error) {
    console.error('Database error:', error);
    // Fallback: empty dinner categories, other menus still work from static data
  }
  
  return (
    <div className="bg-stone-50 min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Hero - matching menu page */}
      <div className="relative h-[30vh] min-h-[200px]">
        <Image
          src="/assets/OMIndianRestaurant_Hero.jpg"
          alt="Order Online"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Order Online</h1>
          <p className="text-white/80 mt-2 text-lg">Pickup or delivery • Fresh, authentic Indian cuisine</p>
        </div>
      </div>
      
      <OrderInterface 
        dinnerCategories={dinnerCategories}
        lunchMenu={lunchMenu}
        barMenu={barMenu}
        cateringMenu={cateringMenu}
      />
    </div>
  );
}
