import OrderInterface from '@/components/OrderInterface';
import { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Order Online - OM Indian Restaurant',
  description: 'Place your order online for pickup or delivery.',
};

// OM Special menu items (from the OM Special menu image)
// These are the ONLY items available for the OM Special builder
const omSpecialMenu = {
  appetizers: {
    chicken: [
      { name: "Chicken Tikka", description: "Boneless chicken marinated in a hung yogurt with tandoori spices and tandoor grilled" },
      { name: "Malai Kabab", description: "Chicken marinated with cheddar cheese, saffron, white pepper, hung yogurt" },
    ],
    lamb: [
      { name: "Lamb Seek Kabab", description: "Tandoor grilled freshly ground lamb sausages seasoned with cumin, ginger and mint" },
      { name: "Lamb Boti Kebab", description: "Marinated with fenugreek, ginger, yogurt, lemon juice" },
    ],
    vegetable: [
      { name: "Samosa", description: "Turnovers filled with seasoned potatoes and green peas. Served with house chutneys" },
      { name: "Assorted Pakora", description: "Vegetable medley chickpea batter fried and served sweet and sour chutney" },
      { name: "Kachori Chaat", description: "Crispy refined flour puffs filled with lentils and mild spices" },
      { name: "Papri Chaat", description: "Whole wheat crisps tossed with yogurt, mint and tamarind sauces" },
      { name: "Onion Bhajjias", description: "Battered and fried onion fritters served with house chutneys" },
      { name: "Gobi Sweet & Sour", description: "Crispy florets, tossed with garlic tomato sauce" },
    ],
  },
  soups: [
    { name: "Chicken Soup", description: "Broth simmered in diced chicken, spices" },
    { name: "Lentil Soup", description: "Lentil broth, turmeric milafu spices and a hint of lime juice" },
  ],
  salad: [
    { name: "Green Salad", description: "Iceburg lettuce, carrots, cucumber and tomato, served with balsamic dressing" },
  ],
  entrees: {
    chicken: [
      { name: "Chicken Curry", description: "Traditional Indian style chicken curry, very savory with aromatic spices" },
      { name: "Chicken Tikka Masala", description: "Grilled marinated chicken in a creamy tomato fenugreek sauce" },
      { name: "Chicken Korma", description: "Roasted cashew nut, raisin, golden fried onion, saffron milk, cream and mild spices" },
      { name: "Chicken Palak", description: "Fresh spinach, fenugreek leaves, garlic, nutmeg, roasted spices" },
      { name: "Chicken Vindaloo", description: "Freshly ground spices, toddy vinegar, whole dry chili sauce" },
    ],
    lamb: [
      { name: "Lamb Palak (Spinach)", description: "Lamb cooked with spinach and a touch of cream" },
      { name: "Lamb Rogan Josh", description: "Slow cooked lamb with intense spices in a onion and tomato curry sauce" },
      { name: "Lamb Curry", description: "Lamb seasoned with curry leaves, ginger, garlic, onion tomato sauce" },
      { name: "Lamb Vindaloo", description: "Lamb cooked hot and spicy vinegar and hot chili sauce" },
    ],
    vegetable: [
      { name: "Om Daal", description: "Mix black lentils cooked with butter and in a fresh tomato sauce" },
      { name: "Delhi Masala Daal", description: "Yellow lentils cooked slowly with herbs and spices" },
      { name: "Vegetable Korma", description: "Fresh vegetable mix cooked in a mildly spiced almond cream sauce" },
      { name: "Bhindi Masala", description: "Fresh diced okra, tossed in cumin, ginger, whole chili, onion tomato" },
      { name: "Palak Paneer", description: "Freshly cooked spinach with Indian cheese" },
      { name: "Chana Saag", description: "Chickpeas, fresh spinach, cooked with onion tomato and ginger garlic" },
      { name: "Mushroom Palak", description: "Mushroom sorted with fresh spinach, ginger, garlic, cumin seeds" },
      { name: "Malai Kofta", description: "Vegetable dumplings simmered in a creamy fenugreek, tomato sauce" },
      { name: "Chana Masala", description: "White chickpeas in a spicy, tangy, onion and tomato gravy-based curry" },
      { name: "Aloo Gobi Matar", description: "Diced potato, cauliflower florets, and green peas seasoned with cumin, ginger, and spices" },
    ],
  },
};

// Static Take Out menu data - prices are take-out prices (ending in .95)
const takeOutMenu = [
  {
    id: "veg-appetizers",
    name: "Veg. Appetizers",
    items: [
      { id: "samosa", name: "Samosa", description: "Crispy turnover with potatoes & green peas", price: 8.95, image: null },
      { id: "sweet-sour-gobi", name: "Sweet & Sour Gobi", description: "Cauliflower cooked in sweet & sour sauce.", price: 8.95, image: null },
      { id: "onion-bhajjias", name: "Onion Bhajjias", description: "Savory deep fried onion fritters made with Bengal gram flours.", price: 9.95, image: null },
      { id: "assorted-pakora", name: "Assorted Pakora", description: "Vegetable medley chickpea batter fried and served with sweet and sour chutney.", price: 9.95, image: null },
      { id: "kachori-chaat", name: "Kachori Chaat", description: "Crispy refined flour puffs filled with lentils and mild spices", price: 9.95, image: null },
      { id: "papri-chaat", name: "Papri Chaat", description: "Whole wheat crisps tossed with yogurt, mint and tamarind sauces", price: 9.95, image: null },
      { id: "tandoori-mix-veg", name: "Tandoori Mix Veg.", description: "Florets of mixed veggies marinated with spices, ginger, garlic and grilled.", price: 10.95, image: null },
      { id: "tandoori-mushroom", name: "Tandoori Mushroom", description: "Mushrooms marinated with roasted spices, hung yogurt and pickles", price: 10.95, image: null },
      { id: "tandoori-paneer", name: "Tandoori Paneer", description: "Large chunks of Indian cottage cheese marinated in a spiced hung yogurt and grilled to perfection.", price: 11.95, image: "/assets/OMIndianRestaurant_TandoonPaneer.jpg" },
    ]
  },
  {
    id: "non-veg-appetizers",
    name: "Non-Veg. Appetizers",
    items: [
      { id: "malai-chicken-kabab", name: "Malai Chicken Kabab", description: "Marinated in yogurt, saffron, spices & herbs.", price: 11.95, image: "/assets/OMIndianRestaurant_ChickenMalaKebab.jpg" },
      { id: "achari-chicken", name: "Achari Chicken", description: "Tandoori grilled with pickling spices.", price: 11.95, image: null },
      { id: "seek-kabab", name: "Seek Kabab", description: "Ground lamb seasoned with onions & spices", price: 12.95, image: "/assets/OMIndianRestaurant_SeekhKebab.jpg" },
    ]
  },
  {
    id: "soups",
    name: "Soup",
    items: [
      { id: "lentil-soup", name: "Lentil Soup", description: "Lentil broth with turmeric and spices", price: 6.95, image: null },
      { id: "chicken-soup", name: "Chicken Soup", description: "Broth simmered with diced chicken and spices", price: 7.95, image: null },
    ]
  },
  {
    id: "salad",
    name: "Salad",
    items: [
      { id: "om-green-salad", name: "Om Green Salad", description: "Lettuce, bell pepper, carrot, cucumber, tomatoes with chef's dressing.", price: 7.95, image: null },
    ]
  },
  {
    id: "chicken-main-course",
    name: "Chicken Main Course",
    items: [
      { id: "chicken-tikka-masala", name: "Chicken Tikka Masala", description: "Grilled marinated chicken in a creamy tomato fenugreek sauce.", price: 18.95, image: "/assets/OMIndianRestaurant_ChickenTikkaMasala.jpg" },
      { id: "butter-chicken", name: "Butter Chicken", description: "Marinated chicken cooked in a rich tomato and butter sauce", price: 18.95, image: "/assets/OMIndianRestaurant_ChickenTikkaMasala.jpg" },
      { id: "chicken-korma", name: "Chicken Korma", description: "Roasted cashew nut, raisin, golden fried onion, saffron milk, cream and mild spices.", price: 18.95, image: null },
      { id: "chicken-chettinad", name: "Chicken Chettinad", description: "Fresh ground pepper, temper with mustard seeds and curry leaves, with coconut milk.", price: 18.95, image: "/assets/OMIndianRestaurant_ChickenChettinad.jpg" },
      { id: "chicken-vindaloo", name: "Chicken Vindaloo", description: "Cooked with freshly ground spices, toddy vinegar, whole dry chili sauce.", price: 17.95, image: null },
      { id: "chicken-saag", name: "Chicken Saag", description: "Chicken sauteed in spinach with a hint of spices.", price: 17.95, image: null },
      { id: "chicken-curry", name: "Chicken Curry", description: "Traditional Indian style chicken curry, very savory with aromatic spices.", price: 17.95, image: null },
      { id: "chicken-kadhai", name: "Chicken Kadhai", description: "Chunks of chicken braised in a masala of coarse ground spices with sauteed onions, bell peppers.", price: 17.95, image: null },
      { id: "madras-chicken-curry", name: "Madras Chicken Curry", description: "White poppy seeds, sliced onions, toasted grated coconut, and large dried red chili", price: 17.95, image: null },
    ]
  },
  {
    id: "lamb-main-course",
    name: "Lamb Main Course",
    items: [
      { id: "lamb-tikka-masala", name: "Lamb Tikka Masala", description: "Grilled marinated lamb in a creamy tomato fenugreek sauce.", price: 20.95, image: null },
      { id: "lamb-korma", name: "Lamb Korma", description: "Roasted cashew nut, raisin, golden fried onion, saffron coconut milk and spices.", price: 20.95, image: null },
      { id: "lamb-rogan-josh", name: "Lamb Rogan Josh", description: "Slow cooked lamb with intense spices in an onion and tomato curry sauce", price: 20.95, image: "/assets/OMIndianRestaurant_LambRojhanjosh.jpg" },
      { id: "lamb-vindaloo", name: "Lamb Vindaloo", description: "Tender lamb in a spicy curry made from vinegar, chilies and garlic.", price: 20.95, image: null },
      { id: "lamb-bhuna", name: "Lamb Bhuna", description: "Lamb intensely sauteed with onion & spices and cooked in its own juices.", price: 20.95, image: null },
      { id: "lamb-chettinad", name: "Lamb Chettinad", description: "Cooked with crushed black pepper, curry leaves, mustard seeds finished with coconut milk.", price: 20.95, image: null },
      { id: "lamb-kadai", name: "Lamb Kadai", description: "Lamb and assorted fresh vegetables with bell peppers and special sauce", price: 20.95, image: null },
      { id: "lamb-saag", name: "Lamb Saag", description: "Cubes of lamb sautéed with fresh spinach and spices", price: 20.95, image: null },
      { id: "lamb-jalfrez", name: "Lamb Jalfrez", description: "Tender chunks of lamb cooked in a spicy tomato gravy with chunky onions, peppers and tomatoes.", price: 20.95, image: null },
      { id: "lamb-dhansaak", name: "Lamb Dhansaak", description: "Dhansaak is a flavorful and aromatic curry, Fenugreek, lentil.", price: 21.95, image: null },
    ]
  },
  {
    id: "goat-main-course",
    name: "Goat Main Course",
    items: [
      { id: "goat-curry", name: "Goat Curry", description: "Traditional Indian style goat curry, very savory with aromatic spices", price: 23.95, image: "/assets/OMIndianRestaurant_GoatCurry.jpg" },
      { id: "goat-vindaloo", name: "Goat Vindaloo", description: "Freshly ground spices, whole dry chili, toddy vinegar.", price: 23.95, image: null },
      { id: "goat-bhuna", name: "Goat Bhuna", description: "Goat intensely sauteed with onion & spices and cooked in its own juices", price: 23.95, image: null },
    ]
  },
  {
    id: "veg-main-course",
    name: "Veg. Main Course",
    items: [
      { id: "om-daal", name: "OM Daal", description: "Mix black lentils cooked with butter and in a fresh tomato sauce", price: 17.95, image: null },
      { id: "delhi-masala-daal", name: "Delhi Masala Daal", description: "Yellow lentils cooked slowly with herbs and spices", price: 17.95, image: null },
      { id: "paneer-tikka-masala", name: "Paneer Tikka Masala", description: "Indian cottage cheese cooked in creamy tomato and onion sauce", price: 17.95, image: "/assets/OMIndianRestaurant_PaneertikkaMasala.jpg" },
      { id: "malai-kofta", name: "Malai Kofta", description: "Vegetable balls in tomato cream sauce", price: 17.95, image: null },
      { id: "aloo-gobi-matar", name: "Aloo Gobi Matar", description: "Potato, cauliflower & green peas cooked with cumin, ginger, and spices.", price: 17.95, image: null },
      { id: "achari-bainghan", name: "Achari Bainghan", description: "Baby eggplant cooked with pickling spices.", price: 17.95, image: null },
      { id: "saag-paneer", name: "Saag Paneer", description: "Cottage cheese cooked with spinach, herbs & spices", price: 17.95, image: "/assets/OMIndianRestaurant_RailwayPalak.jpg" },
      { id: "veg-curry", name: "Veg. Curry", description: "Mixed vegetables cooked in home-style cooking", price: 17.95, image: null },
      { id: "chana-saag", name: "Chana Saag", description: "Chickpeas cooked with spinach, herbs and spices", price: 17.95, image: null },
      { id: "chana-masala", name: "Chana Masala", description: "Chickpeas with onion & tomato (gravy-based curry)", price: 17.95, image: null },
      { id: "bhindi-masala", name: "Bhindi Masala", description: "Fresh cut okra with cumin, onion, tomato masala", price: 17.95, image: null },
      { id: "vegetable-korma", name: "Vegetable Korma", description: "Fresh vegetables cooked mildly spiced Almond cream sauce", price: 17.95, image: null },
    ]
  },
  {
    id: "seafood-main-course",
    name: "Sea Food Main Course",
    items: [
      { id: "shrimp-tikka-masala", name: "Shrimp Tikka Masala", description: "Grilled marinated shrimp in a creamy tomato fenugreek sauce.", price: 23.95, image: null },
      { id: "shrimp-curry", name: "Shrimp Curry", description: "Shrimp cooked in traditional Indian style curry.", price: 23.95, image: null },
      { id: "goan-shrimp-curry", name: "Goan Shrimp Curry", description: "Shrimp cooked with fresh coconut milk with onions, lime juice, & spices.", price: 23.95, image: null },
      { id: "shrimp-korma", name: "Shrimp Korma", description: "Roasted cashew nut, raisin, golden fried onion, mix fruits, saffron and spices.", price: 23.95, image: null },
      { id: "shrimp-saag", name: "Shrimp Saag", description: "Onions, tomatoes with fresh sautéed spinach with ginger & garlic.", price: 23.95, image: null },
      { id: "goan-salmon-curry", name: "Goan Salmon Curry", description: "Salmon fillet cooked with fresh coconut milk with cumin, curry leaves, lime juice & spices.", price: 23.95, image: null },
      { id: "fish-masala", name: "Fish Masala", description: "Pan seared salmon cooked with an onion, fenugreek leaves & tomato spiced sauce.", price: 24.95, image: null },
      { id: "shrimp-salmon-vindaloo", name: "Shrimp/Salmon Vindaloo", description: "Freshly ground spices, whole dry chili, toddy vinegar.", price: 24.95, image: null },
    ]
  },
  {
    id: "tandoori-grill",
    name: "Tandoori Grill Main Course",
    items: [
      { id: "tandoori-chicken", name: "Tandoori Chicken", description: "Bone-in half chicken marinated in hung yogurt and classic tandoori spices.", price: 20.95, image: "/assets/OMIndianRestaurant_TandoonChicken.jpg" },
      { id: "tandoori-chicken-tikka", name: "Tandoori Chicken Tikka", description: "Chicken marinated with fresh basil, yogurt, roasted garlic paste, spices, & olive oil.", price: 20.95, image: null },
      { id: "malai-kabab", name: "Malai Kabab", description: "Chicken marinated with cheddar cheese, saffron, white pepper, hung yogurt.", price: 21.95, image: null },
      { id: "lamb-boti-kebab", name: "Lamb Boti Kebab", description: "Tender chunks of lamb marinated in hung yogurt, garlic, ginger, mint", price: 22.95, image: null },
      { id: "lamb-seekh-kebab", name: "Lamb Seekh Kebab", description: "Oven cooked grounded lamb seasoned with cumin, ginger, & mint.", price: 23.95, image: null },
      { id: "lamb-chops", name: "Lamb Chops", description: "Marinated with a special house sauce.", price: 31.95, image: "/assets/OMIndianRestaurant_LambChops.jpg" },
      { id: "salmon-tikka", name: "Salmon Tikka", description: "Atlantic salmon fillets marinated in hung yogurt and herbs", price: 25.95, image: "/assets/OMIndianRestaurant_SalmonTikka.jpg" },
      { id: "tandoori-shrimp", name: "Tandoori Shrimp", description: "Jumbo shrimp marinated in a spiced hung yogurt mixture.", price: 25.95, image: "/assets/OMIndianRestaurant_JumboPrawn.jpg" },
      { id: "om-mixed-grill", name: "OM Mixed Grill", description: "Assortment of Chicken, Lamb and Seafood.", price: 28.95, image: null },
    ]
  },
  {
    id: "bread",
    name: "Bread",
    items: [
      { id: "plain-naan", name: "Plain Naan", description: "Leavened flatbread cooked in a clay oven.", price: 3.95, image: null },
      { id: "garlic-naan", name: "Garlic Naan", description: "Garlic stuffed bread", price: 4.95, image: "/assets/OMIndianRestaurant_GarlicNaan.jpg" },
      { id: "onion-naan", name: "Onion Naan", description: "Leavened flatbread stuffed with spiced diced onions.", price: 4.95, image: null },
      { id: "om-bread-sweet", name: "Om Bread (Sweet)", description: "Sweet stuffed bread", price: 5.95, image: null },
      { id: "special-3-cheese-naan", name: "Special 3 Cheese Naan", description: "Three cheese stuffed naan", price: 6.95, image: null },
      { id: "paneer-naan", name: "Paneer Naan", description: "Cheese stuffed bread", price: 5.95, image: null },
      { id: "chicken-tikka-naan", name: "Chicken Tikka Naan", description: "Chicken tikka stuffed bread", price: 5.95, image: null },
    ]
  },
  {
    id: "whole-wheat-bread",
    name: "Whole Wheat Bread",
    items: [
      { id: "plain-roti", name: "Plain Roti", description: "Whole wheat flatbread", price: 4.95, image: null },
      { id: "laccha-paratha", name: "Laccha Paratha", description: "Tandoor-baked whole wheat multi layered flaky bread", price: 5.95, image: null },
      { id: "mint-paratha", name: "Mint Paratha", description: "Whole wheat bread with mint", price: 5.95, image: null },
      { id: "aloo-paratha", name: "Aloo Paratha", description: "Tandoor-baked whole wheat bread with a stuffing of mildly spiced potatoes and onions.", price: 5.95, image: null },
      { id: "special-chili-garlic-naan", name: "Special Chili Garlic Naan", description: "Chili and garlic stuffed naan", price: 6.95, image: null },
    ]
  },
  {
    id: "rice",
    name: "Rice",
    items: [
      { id: "matar-pulao", name: "Matar Pulao", description: "With cumin and green peas.", price: 7.95, image: null },
      { id: "om-sweet-pulao", name: "Om Sweet Pulao", description: "Saffron rice cooked with fruits and nuts.", price: 7.95, image: null },
      { id: "lemon-rice", name: "Lemon Rice", description: "Cooked with lemon juice, mustard seeds, fried peanuts, and curry leaves.", price: 7.95, image: null },
    ]
  },
  {
    id: "biryani",
    name: "Biryani",
    items: [
      { id: "veg-biryani", name: "Veg. Biryani", description: "Fresh vegetables cooked with basmati rice, herbs, and spices.", price: 18.95, image: null },
      { id: "chicken-biryani-hyderabadi", name: "Chicken Biryani Hyderabadi", description: "Basmati rice with Chicken cooked with spices in the style of Hyderabadi Nawabs", price: 20.95, image: null },
      { id: "lamb-biryani", name: "Lamb Biryani", description: "Basmati Rice with Lamb cooked with herbs and spices.", price: 22.95, image: null },
      { id: "shrimp-biryani", name: "Shrimp Biryani", description: "Basmati Rice with Shrimps cooked with herbs and spices.", price: 23.95, image: null },
      { id: "goat-biryani", name: "Goat Biryani", description: "Basmati Rice with Goat meat cooked with herbs and spices.", price: 23.95, image: null },
    ]
  },
  {
    id: "side-orders",
    name: "Side Order",
    items: [
      { id: "onion-relish", name: "Onion Relish", description: "Chopped onions marinated with a blend of tomato purée, vinegar", price: 2.95, image: null },
      { id: "papadum", name: "Papadum", description: "Crispy Indian dried lentil crackers.", price: 3.95, image: null },
      { id: "mango-chutney", name: "Mango Chutney", description: "A blend of ripe mangoes, sugar, and select spices", price: 4.95, image: null },
      { id: "raita", name: "Raita", description: "Yogurt with carrots & Cucumbers and spices", price: 4.95, image: null },
      { id: "jeera-aloo", name: "Jeera Aloo", description: "Cumin Flavored Potatoes.", price: 9.95, image: null },
      { id: "om-daal-side", name: "Om Daal / Delhi Masala Daal", description: "Mix black lentils with butter or yellow lentils cooked slowly with herbs & spices", price: 9.95, image: null },
    ]
  },
  {
    id: "dessert",
    name: "Dessert",
    items: [
      { id: "om-kheer", name: "OM Kheer", description: "Almond and apple flavored rice pudding in cardamom", price: 5.95, image: "/assets/OMIndianRestaurant_Kheer.jpg" },
      { id: "gulab-jamun", name: "Gulab Jamun", description: "Soft dumplings of milk, flour simmered in simple syrup, rose water, cardamom", price: 6.95, image: "/assets/OMIndianRestaurant_GulabJamun.jpg" },
      { id: "ras-malai", name: "Ras Malai", description: "Steamed cottage cheese dumplings with saffron milk", price: 6.95, image: null },
      { id: "pistachio-kulfi", name: "Pistachio Kulfi", description: "Traditional Indian ice cream with pistachio", price: 6.95, image: null },
      { id: "mango-kulfi", name: "Mango Kulfi", description: "Traditional Indian ice cream with mango", price: 6.95, image: null },
    ]
  },
  {
    id: "beverages",
    name: "Beverage",
    items: [
      { id: "mango-lassi", name: "Mango Lassi", description: "Sweet yogurt drink blended with mango", price: 6.95, image: null },
      { id: "sweet-lassi", name: "Sweet Lassi", description: "Sweet yogurt drink", price: 4.95, image: null },
      { id: "salted-lassi", name: "Salted Lassi", description: "Traditional salted yogurt drink", price: 4.95, image: null },
      { id: "masala-chai", name: "Masala Chai", description: "Spiced Indian tea", price: 3.95, image: null },
      { id: "water", name: "Water", description: "Bottled water", price: 2.95, image: null },
      { id: "sparkling-water", name: "Sparkling Water", description: "Sparkling mineral water", price: 3.95, image: null },
      { id: "soft-drinks", name: "Soft Drinks", description: "Coke, Diet Coke, Sprite, Ginger Ale", price: 2.95, image: null },
    ]
  },
];

// Lunch menu data (served 12:00 PM - 2:45 PM) - Dine-in only, display purposes
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

// Bar menu data - Dine-in only, display purposes
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
];

// Catering menu data
const cateringMenu = [
  {
    name: "Appetizers",
    items: [
      { name: "Samosas", description: "Crispy turnovers stuffed with spiced potatoes and green peas. Served with tamarind and mint-cilantro chutneys.", perPiece: "$2.75/piece" },
      { name: "Onion Bhajia", description: "Onion fritters in chickpea flour, spices, and herbs. Served with chutneys.", halfTray: "$65.00", fullTray: "$115.00" },
      { name: "Vegetable Pakora", description: "Mixed vegetable fritters in chickpea flour, spices, and herbs.", halfTray: "$65.00", fullTray: "$125.00" },
      { name: "Sweet & Sour Gobi", description: "Crispy battered cauliflower tossed in tangy sweet and sour sauce with bell peppers and onions.", halfTray: "$75.00", fullTray: "$145.00" },
      { name: "Tandoori Mushroom", description: "Made with cream cheese, onion, peppers, cilantro chutney, coated in yogurt marinade.", halfTray: "$65.00", fullTray: "$150.00" },
      { name: "Paneer Tikka", description: "Large chunks of Indian cottage cheese marinated in spiced yogurt and grilled.", halfTray: "$83.00", fullTray: "$160.00" },
      { name: "Tandoori Vegetable", description: "Florets of mix veggies marinated with spices, ginger, garlic and grilled.", halfTray: "$85.00", fullTray: "$160.00" },
    ]
  },
  {
    name: "Tandoori Specials",
    items: [
      { name: "Tandoori Chicken", description: "Chicken marinated in ginger, garlic paste, yogurt, Kashmiri red chiles. Served with basmati rice.", halfTray: "$90.00", fullTray: "$170.00" },
      { name: "Chicken Tikka", description: "Boneless chicken marinated in spiced yogurt, cooked on live charcoal.", halfTray: "$85.00", fullTray: "$155.00" },
      { name: "Achari Chicken Tikka", description: "Boneless chicken chunks marinated in Achari masala, yogurt, and spices.", halfTray: "$85.00", fullTray: "$155.00" },
      { name: "Malai Kebab", description: "Minced chicken skewers with herbs & spices, grilled in clay oven.", halfTray: "$85.00", fullTray: "$155.00" },
      { name: "Lamb Seekh Kebab", description: "Minced lamb skewers with cilantro, onions, garlic, ginger, spices.", halfTray: "$95.00", fullTray: "$190.00" },
      { name: "Salmon Tikka", description: "Marinated in ground spices, yogurt, and Kashmiri chilies. Baked in clay oven.", halfTray: "$150.00", fullTray: "$290.00" },
      { name: "Tandoori Shrimp", description: "Marinated in ginger, yogurt, and spices.", halfTray: "$155.00", fullTray: "$290.00" },
    ]
  },
  {
    name: "Vegetarian Entrees",
    items: [
      { name: "Bhindi Masala", description: "Okra sauteed with onions, tomato, ginger, garlic, pomegranate seeds.", halfTray: "$87.00", fullTray: "$169.00" },
      { name: "Aloo Gobi Matar", description: "Potatoes, cauliflower, green peas in tomato cumin sauce.", halfTray: "$87.00", fullTray: "$169.00" },
      { name: "OM Daal", description: "Slow-cooked black lentils with tomatoes, ginger, garlic, spices.", halfTray: "$87.00", fullTray: "$169.00" },
      { name: "Yellow Daal", description: "Yellow lentils with tomatoes, ginger, garlic, turmeric, cilantro.", halfTray: "$80.00", fullTray: "$160.00" },
      { name: "Vegetable Curry", description: "Mixed vegetables cooked in home-style cooking.", halfTray: "$80.00", fullTray: "$160.00" },
      { name: "Chana Saag", description: "Chana masala sauteed with pureed baby spinach, spices, and herbs.", halfTray: "$87.00", fullTray: "$169.00" },
      { name: "Chana Masala", description: "Chickpeas prepared with pomegranate seeds, dry mango powder, ginger.", halfTray: "$87.00", fullTray: "$169.00" },
      { name: "Vegetable Korma", description: "Nine-vegetable stew with cashews, dried fruit, and saffron.", halfTray: "$87.00", fullTray: "$169.00" },
      { name: "Malai Kofta", description: "Cottage cheese, potato & dried fruit dumplings in saffron-cashew sauce.", halfTray: "$89.00", fullTray: "$173.00" },
      { name: "Saag Paneer", description: "Soft Indian cheese with pureed spinach, onions, ginger, garlic.", halfTray: "$89.00", fullTray: "$172.00" },
      { name: "Paneer Tikka Masala", description: "Indian cottage cheese in tomato-cream sauce.", halfTray: "$89.00", fullTray: "$172.00" },
      { name: "Paneer Makhani", description: "Indian cottage cheese in tomato-cream sauce.", halfTray: "$89.00", fullTray: "$172.00" },
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
      { name: "Chicken Do Pyaza", description: "Chicken cooked with onions, peppers and spices.", halfTray: "$93.00", fullTray: "$179.00" },
      { name: "Chicken Curry", description: "Chicken with whole spices, poppy seeds, mustard seeds, curry leaves.", halfTray: "$93.00", fullTray: "$179.00" },
      { name: "Mango Chicken", description: "Chicken cooked in mango and sesame sauce.", halfTray: "$93.00", fullTray: "$179.00" },
    ]
  },
  {
    name: "Lamb Entrees",
    items: [
      { name: "Lamb Rogan Josh", description: "Lamb with onions, tomatoes, Kashmiri red chiles, spices, aniseed.", halfTray: "$97.00", fullTray: "$191.00" },
      { name: "Lamb Tikka Masala", description: "Lamb cooked in clay oven with rich tomato & fenugreek sauce.", halfTray: "$97.00", fullTray: "$191.00" },
      { name: "Lamb Korma", description: "Boneless lamb in cashew-saffron cream sauce.", halfTray: "$97.00", fullTray: "$191.00" },
      { name: "Lamb Vindaloo", description: "Lamb in fiery Goan sauce with garlic, vinegar, cumin.", halfTray: "$97.00", fullTray: "$191.00" },
      { name: "Lamb Chettinad", description: "Curry with fresh curry leaves, mustard seed, black peppers, coconut milk.", halfTray: "$97.00", fullTray: "$191.00" },
      { name: "Lamb Bhuna", description: "Lamb cooked in spices, onions, and tomatoes.", halfTray: "$97.00", fullTray: "$191.00" },
      { name: "Lamb Kadai", description: "Lamb with fresh vegetables, bell peppers and special sauce.", halfTray: "$97.00", fullTray: "$191.00" },
      { name: "Lamb Saag", description: "Cubes of lamb sautéed with fresh spinach and spices.", halfTray: "$95.00", fullTray: "$185.00" },
    ]
  },
  {
    name: "Seafood Entrees",
    items: [
      { name: "Goan Salmon Curry", description: "Salmon fillet cooked with coconut milk, cumin, curry leaves, lime juice.", halfTray: "$115.00", fullTray: "$200.00" },
      { name: "Fish Masala (Salmon)", description: "Fish cooked in onion, tomatoes, ginger, garlic, ground spice.", halfTray: "$115.00", fullTray: "$200.00" },
      { name: "Goan Shrimp Curry", description: "In coconut, tomato, tamarind sauce with mustard seeds & curry leaves.", halfTray: "$120.00", fullTray: "$220.00" },
      { name: "Shrimp Korma", description: "Shrimp in creamy cashew based curry.", halfTray: "$120.00", fullTray: "$220.00" },
      { name: "Shrimp Saag", description: "Shrimp with pureed spinach, ginger, garlic, and spices.", halfTray: "$120.00", fullTray: "$220.00" },
      { name: "Shrimp Tikka Masala", description: "Shrimp cooked in clay oven with rich tomato & fenugreek sauce.", halfTray: "$120.00", fullTray: "$220.00" },
      { name: "Shrimp Curry", description: "Shrimp cooked in traditional home style curry.", halfTray: "$120.00", fullTray: "$220.00" },
    ]
  },
  {
    name: "Biryani",
    items: [
      { name: "Vegetable Biryani", description: "Fried basmati rice with vegetables, nuts, and spices. Served with raita.", halfTray: "$79.00", fullTray: "$149.00" },
      { name: "Chicken Biryani", description: "Fried basmati rice with chicken, vegetables, nuts, and spices.", halfTray: "$93.00", fullTray: "$179.00" },
      { name: "Lamb Biryani", description: "Fried basmati rice with lamb, vegetables, nuts, and spices.", halfTray: "$99.00", fullTray: "$189.00" },
      { name: "Goat Biryani", description: "Basmati rice with goat cooked with herbs and spices.", halfTray: "$120.00", fullTray: "$235.00" },
      { name: "Shrimp Biryani", description: "Fried basmati rice with shrimp, vegetables, nuts, and spices.", halfTray: "$120.00", fullTray: "$235.00" },
    ]
  },
  {
    name: "Breads",
    items: [
      { name: "Naan", description: "Leavened flatbread cooked in clay oven.", perPiece: "$3.00/piece" },
      { name: "Roti", description: "Whole wheat flatbread.", perPiece: "$3.00/piece" },
      { name: "OM Bread", description: "Sweet stuffed bread.", perPiece: "$4.50/piece" },
      { name: "Paneer Naan", description: "Cheese stuffed bread.", perPiece: "$4.50/piece" },
      { name: "Garlic Naan", description: "Garlic stuffed bread.", perPiece: "$3.50/piece" },
      { name: "Onion Naan", description: "Leavened flatbread stuffed with spiced diced onions.", perPiece: "$4.50/piece" },
      { name: "Lacha Paratha", description: "Tandoor-baked whole wheat multi layered flaky bread.", perPiece: "$3.50/piece" },
      { name: "Aloo Paratha", description: "Tandoor-baked whole wheat bread with mildly spiced potatoes.", perPiece: "$4.50/piece" },
    ]
  },
  {
    name: "Rice & Sides",
    items: [
      { name: "Basmati Rice", description: "Aromatic long grain rice.", halfTray: "$40.00", fullTray: "$75.00" },
      { name: "OM Sweet Rice", description: "Saffron rice cooked with fruits and nuts.", halfTray: "$45.00", fullTray: "$85.00" },
      { name: "Lemon Rice", description: "Cooked with lemon juice, mustard seeds, fried peanuts, curry leaves.", halfTray: "$45.00", fullTray: "$85.00" },
      { name: "Matar Pulao", description: "Cooked with cumin and green peas.", halfTray: "$45.00", fullTray: "$85.00" },
      { name: "Green Salad", description: "Tomato, carrot, lettuce, balsamic dressing.", halfTray: "$40.00", fullTray: "$75.00" },
    ]
  },
  {
    name: "Desserts & Beverages",
    items: [
      { name: "Gulab Jamun", description: "Soft dumplings of milk, flour simmered in simple syrup, rose water, cardamom.", perPiece: "$2.25/person" },
      { name: "OM Kheer", description: "Almond and apple flavored rice pudding in cardamom.", halfTray: "$60.00", fullTray: "$140.00" },
      { name: "Soda", description: "Diet Coke, Coke, Ginger Ale, Sprite.", perPiece: "$1.99/person" },
      { name: "Mango Lassi", description: "Refreshing mango yogurt drink.", perPiece: "$3.95/person" },
    ]
  },
];

export default function OrderPage() {
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
      
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C41E3A]"></div>
        </div>
      }>
        <OrderInterface 
          dinnerCategories={takeOutMenu}
          lunchMenu={lunchMenu}
          barMenu={barMenu}
          cateringMenu={cateringMenu}
          omSpecialMenu={omSpecialMenu}
        />
      </Suspense>
    </div>
  );
}
