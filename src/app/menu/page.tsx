import { Metadata } from 'next';
import Image from 'next/image';
import MenuDisplay from '@/components/MenuDisplay';
import OrderingMaintenanceModal from '@/components/OrderingMaintenanceModal';

export const metadata: Metadata = {
  title: 'Menu - OM Indian Restaurant',
  description: 'Browse our extensive menu of authentic Indian dishes.',
};

// OM Special menu items (from the OM Special menu image)
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
      { id: "kachori-chaat", name: "Kachori Chaat", description: "Crispy refined flour puffs filled with lentils and mild spices", price: 8.95, image: null },
      { id: "papri-chaat", name: "Papri Chaat", description: "Whole wheat crisps tossed with yogurt, mint and tamarind sauces", price: 8.95, image: null },
      { id: "onion-bhajjias", name: "Onion Bhajjias", description: "Savory deep fried onion fritters made with Bengal gram flours.", price: 9.95, image: null },
      { id: "assorted-pakora", name: "Assorted Pakora", description: "Vegetable medley chickpea batter fried and served with sweet and sour chutney.", price: 9.95, image: null },
      { id: "tandoori-mix-veg", name: "Tandoori Mix Veg.", description: "Florets of mixed veggies marinated with spices, ginger, garlic and grilled.", price: 10.95, image: null },
      { id: "tandoori-mushroom", name: "Tandoori Mushroom", description: "Mushrooms marinated with roasted spices, hung yogurt and pickles", price: 10.95, image: null },
      { id: "tandoori-paneer", name: "Tandoori Paneer", description: "Large chunks of Indian cottage cheese marinated in a spiced hung yogurt and grilled to perfection.", price: 11.95, image: "/assets/OMIndianRestaurant_TandoonPaneer.jpg" },
    ]
  },
  {
    id: "non-veg-appetizers",
    name: "Non-Veg. Appetizers",
    items: [
      { id: "chicken-tikka-app", name: "Chicken Tikka", description: "Boneless chicken marinated in hung yogurt with tandoori spices and grilled.", price: 11.95, image: null },
      { id: "malai-chicken-app", name: "Malai Chicken", description: "Chicken marinated in white peppercorn, yogurt.", price: 11.95, image: "/assets/OMIndianRestaurant_ChickenMalaKebab.jpg" },
      { id: "achari-chicken-tikka-app", name: "Achari Chicken Tikka", description: "Tandoori grilled with pickling spices.", price: 11.95, image: null },
      { id: "lamb-seekh-kabab-app", name: "Lamb Seek Kabab", description: "Ground lamb seasoned in green chili paste, spices, mint, cilantro, ginger.", price: 12.95, image: "/assets/OMIndianRestaurant_SeekhKebab.jpg" },
      { id: "lamb-boti-kabab-app", name: "Lamb Boti Kabab", description: "Tender chunks of lamb marinated in hung yogurt, garlic, ginger, mint.", price: 12.95, image: null },
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
      { id: "chicken-chettinad", name: "Chicken Chettinad", description: "Fresh ground pepper, temper with mustard seeds and curry leaves, with coconut milk.", price: 18.95, image: "/assets/OMIndianRestaurant_ChickenChettinad.jpg" },
      { id: "chicken-curry", name: "Chicken Curry", description: "Traditional Indian style chicken curry, very savory with aromatic spices.", price: 18.95, image: null },
      { id: "chicken-kadhai", name: "Chicken Kadhai", description: "Chunks of chicken braised in a masala of coarse ground spices with sauteed onions, bell peppers.", price: 18.95, image: null },
      { id: "chicken-korma", name: "Chicken Korma", description: "Roasted cashew nut, raisin, golden fried onion, saffron milk, cream and mild spices.", price: 18.95, image: null },
      { id: "chicken-saag", name: "Chicken Saag", description: "Chicken sauteed in spinach with a hint of spices.", price: 18.95, image: null },
      { id: "chicken-tikka-curry", name: "Chicken Tikka Curry", description: "Grilled chicken tikka pieces in a rich curry sauce.", price: 18.95, image: null },
      { id: "chicken-vindaloo", name: "Chicken Vindaloo", description: "Cooked with freshly ground spices, toddy vinegar, whole dry chili sauce.", price: 18.95, image: null },
      { id: "mango-chicken", name: "Mango Chicken", description: "Chicken cooked in a sweet and savory mango sauce with aromatic spices.", price: 18.95, image: null },
    ]
  },
  {
    id: "lamb-main-course",
    name: "Lamb Main Course",
    items: [
      { id: "lamb-bhuna", name: "Lamb Bhuna", description: "Lamb intensely sauteed with onion & spices and cooked in its own juices.", price: 20.95, image: null },
      { id: "lamb-chettinad", name: "Lamb Chettinad", description: "Cooked with crushed black pepper, curry leaves, mustard seeds finished with coconut milk.", price: 20.95, image: null },
      { id: "lamb-dhansaak", name: "Lamb Dhansaak", description: "Dhansaak is a flavorful and aromatic curry, Fenugreek, lentil.", price: 20.95, image: null },
      { id: "lamb-jalfrez", name: "Lamb Jalfrez", description: "Tender chunks of lamb cooked in a spicy tomato gravy with chunky onions, peppers and tomatoes.", price: 20.95, image: null },
      { id: "lamb-kadai", name: "Lamb Kadai", description: "Lamb and assorted fresh vegetables with bell peppers and special sauce", price: 20.95, image: null },
      { id: "lamb-korma", name: "Lamb Korma", description: "Roasted cashew nut, raisin, golden fried onion, saffron coconut milk and spices.", price: 20.95, image: null },
      { id: "lamb-rogan-josh", name: "Lamb Rogan Josh", description: "Slow cooked lamb with intense spices in an onion and tomato curry sauce", price: 20.95, image: "/assets/OMIndianRestaurant_LambRojhanjosh.jpg" },
      { id: "lamb-saag", name: "Lamb Saag", description: "Cubes of lamb sautéed with fresh spinach and spices", price: 20.95, image: null },
      { id: "lamb-tikka-masala", name: "Lamb Tikka Masala", description: "Grilled marinated lamb in a creamy tomato fenugreek sauce.", price: 20.95, image: null },
      { id: "lamb-vindaloo", name: "Lamb Vindaloo", description: "Tender lamb in a spicy curry made from vinegar, chilies and garlic.", price: 20.95, image: null },
    ]
  },
  {
    id: "goat-main-course",
    name: "Goat Main Course",
    items: [
      { id: "goat-bhuna", name: "Goat Bhuna", description: "Goat intensely sauteed with onion & spices and cooked in its own juices", price: 23.95, image: null },
      { id: "goat-curry", name: "Goat Curry", description: "Traditional Indian style goat curry, very savory with aromatic spices", price: 23.95, image: "/assets/OMIndianRestaurant_GoatCurry.jpg" },
      { id: "goat-kadai", name: "Goat Kadai", description: "Goat cooked with bell peppers and special kadai spices", price: 23.95, image: null },
      { id: "goat-vindaloo", name: "Goat Vindaloo", description: "Freshly ground spices, whole dry chili, toddy vinegar.", price: 23.95, image: null },
    ]
  },
  {
    id: "veg-main-course",
    name: "Veg. Main Course",
    items: [
      { id: "om-daal", name: "OM Daal", description: "Mix black lentils cooked with butter and in a fresh tomato sauce", price: 17.95, image: null },
      { id: "om-bhurji", name: "OM Bhurji", description: "Scrambled paneer with onions, tomatoes, and spices", price: 17.95, image: null },
      { id: "paneer-tikka-masala", name: "Paneer Tikka Masala", description: "Indian cottage cheese cooked in creamy tomato and onion sauce", price: 17.95, image: "/assets/OMIndianRestaurant_PaneertikkaMasala.jpg" },
      { id: "achari-bainghan", name: "Achari Bainghan", description: "Baby eggplant cooked with pickling spices.", price: 17.95, image: null },
      { id: "aloo-gobi-matar", name: "Aloo Gobi Matar", description: "Potato, cauliflower & green peas cooked with cumin, ginger, and spices.", price: 17.95, image: null },
      { id: "bhindi-masala", name: "Bhindi Masala", description: "Fresh cut okra with cumin, onion, tomato masala", price: 17.95, image: null },
      { id: "chana-masala", name: "Chana Masala", description: "Chickpeas with onion & tomato (gravy-based curry)", price: 17.95, image: null },
      { id: "chana-saag", name: "Chana Saag", description: "Chickpeas cooked with spinach, herbs and spices", price: 17.95, image: null },
      { id: "delhi-masala-daal", name: "Delhi Masala Daal", description: "Yellow lentils cooked slowly with herbs and spices", price: 17.95, image: null },
      { id: "malai-kofta", name: "Malai Kofta", description: "Vegetable balls in tomato cream sauce", price: 17.95, image: null },
      { id: "saag-paneer", name: "Saag Paneer", description: "Cottage cheese cooked with spinach, herbs & spices", price: 17.95, image: "/assets/OMIndianRestaurant_RailwayPalak.jpg" },
      { id: "veg-curry", name: "Veg. Curry", description: "Mixed vegetables cooked in home-style cooking", price: 17.95, image: null },
      { id: "vegetable-korma", name: "Vegetable Korma", description: "Fresh vegetables cooked mildly spiced Almond cream sauce", price: 17.95, image: null },
    ]
  },
  {
    id: "seafood-main-course",
    name: "Sea Food Main Course",
    items: [
      { id: "fish-masala", name: "Fish Masala", description: "Pan seared salmon cooked with an onion, fenugreek leaves & tomato spiced sauce.", price: 23.95, image: null },
      { id: "goan-salmon-curry", name: "Goan Salmon Curry", description: "Salmon fillet cooked with fresh coconut milk with cumin, curry leaves, lime juice & spices.", price: 23.95, image: null },
      { id: "goan-shrimp-curry", name: "Goan Shrimp Curry", description: "Shrimp cooked with fresh coconut milk with onions, lime juice, & spices.", price: 23.95, image: null },
      { id: "shrimp-curry", name: "Shrimp Curry", description: "Shrimp cooked in traditional Indian style curry.", price: 23.95, image: null },
      { id: "shrimp-korma", name: "Shrimp Korma", description: "Roasted cashew nut, raisin, golden fried onion, mix fruits, saffron and spices.", price: 23.95, image: null },
      { id: "shrimp-saag", name: "Shrimp Saag", description: "Onions, tomatoes with fresh sautéed spinach with ginger & garlic.", price: 23.95, image: null },
      { id: "shrimp-vindaloo", name: "Shrimp Vindaloo", description: "Freshly ground spices, whole dry chili, toddy vinegar.", price: 23.95, image: null },
      { id: "salmon-vindaloo", name: "Salmon Vindaloo", description: "Freshly ground spices, whole dry chili, toddy vinegar.", price: 23.95, image: null },
      { id: "shrimp-tikka-masala", name: "Shrimp Tikka Masala", description: "Grilled marinated shrimp in a creamy tomato fenugreek sauce.", price: 23.95, image: null },
    ]
  },
  {
    id: "tandoori-grill",
    name: "Tandoori Grill Main Course",
    items: [
      { id: "om-mixed-grill", name: "OM Mixed Grill", description: "Assortment of Chicken, Lamb and Seafood.", price: 30.95, image: null },
      { id: "achari-chicken-grill", name: "Achari Chicken", description: "Tandoori grilled chicken with pickling spices.", price: 20.95, image: null },
      { id: "malai-kabab", name: "Malai Kabab", description: "Chicken marinated with cheddar cheese, saffron, white pepper, hung yogurt.", price: 20.95, image: null },
      { id: "tandoori-chicken", name: "Tandoori Chicken", description: "Bone-in half chicken marinated in hung yogurt and classic tandoori spices.", price: 20.95, image: "/assets/OMIndianRestaurant_TandoonChicken.jpg" },
      { id: "tandoori-chicken-tikka", name: "Tandoori Chicken Tikka", description: "Chicken marinated with fresh basil, yogurt, roasted garlic paste, spices, & olive oil.", price: 20.95, image: null },
      { id: "lamb-boti-kebab", name: "Lamb Boti Kebab", description: "Tender chunks of lamb marinated in hung yogurt, garlic, ginger, mint", price: 22.95, image: null },
      { id: "lamb-seekh-kebab", name: "Lamb Seekh Kebab", description: "Oven cooked grounded lamb seasoned with cumin, ginger, & mint.", price: 22.95, image: null },
      { id: "salmon-tikka", name: "Salmon Tikka", description: "Atlantic salmon fillets marinated in hung yogurt and herbs", price: 25.95, image: "/assets/OMIndianRestaurant_SalmonTikka.jpg" },
      { id: "tandoori-shrimp", name: "Tandoori Shrimp", description: "Jumbo shrimp marinated in a spiced hung yogurt mixture.", price: 25.95, image: "/assets/OMIndianRestaurant_JumboPrawn.jpg" },
    ]
  },
  {
    id: "bread",
    name: "Bread",
    items: [
      { id: "plain-naan", name: "Plain Naan", description: "Leavened flatbread cooked in a clay oven.", price: 3.95, image: null },
      { id: "garlic-naan", name: "Garlic Naan", description: "Garlic stuffed bread", price: 4.95, image: "/assets/OMIndianRestaurant_GarlicNaan.jpg" },
      { id: "onion-naan", name: "Onion Naan", description: "Leavened flatbread stuffed with spiced diced onions.", price: 4.95, image: null },
      { id: "chicken-tikka-naan", name: "Chicken Tikka Naan", description: "Chicken tikka stuffed bread", price: 5.95, image: null },
      { id: "om-bread-sweet", name: "Om Bread (Sweet)", description: "Sweet stuffed bread", price: 5.95, image: null },
      { id: "paneer-naan", name: "Paneer Naan", description: "Cheese stuffed bread", price: 5.95, image: null },
      { id: "special-3-cheese-naan", name: "Special 3 Cheese Naan", description: "Three cheese stuffed naan", price: 6.95, image: null },
      { id: "special-chili-garlic-naan", name: "Special Chili Garlic Naan", description: "Chili and garlic stuffed naan", price: 6.95, image: null },
      { id: "bread-basket", name: "Bread Basket", description: "Plain Naan, Garlic Naan, Onion Naan, and Plain Roti", price: 13.95, image: null },
    ]
  },
  {
    id: "whole-wheat-bread",
    name: "Whole Wheat Bread",
    items: [
      { id: "plain-roti", name: "Plain Roti", description: "Whole wheat flatbread", price: 4.95, image: null },
      { id: "aloo-paratha", name: "Aloo Paratha", description: "Tandoor-baked whole wheat bread with a stuffing of mildly spiced potatoes and onions.", price: 5.95, image: null },
      { id: "laccha-paratha", name: "Laccha Paratha", description: "Tandoor-baked whole wheat multi layered flaky bread", price: 5.95, image: null },
      { id: "mint-paratha", name: "Mint Paratha", description: "Whole wheat bread with mint", price: 5.95, image: null },
    ]
  },
  {
    id: "rice",
    name: "Rice",
    items: [
      { id: "plain-basmati-rice", name: "Plain Basmati Rice", description: "Steamed aromatic basmati rice.", price: 3.95, image: null },
      { id: "om-sweet-pulao", name: "OM Sweet Pulao", description: "Saffron rice cooked with fruits and nuts.", price: 7.95, image: null },
      { id: "lemon-rice", name: "Lemon Rice", description: "Cooked with lemon juice, mustard seeds, fried peanuts, and curry leaves.", price: 7.95, image: null },
      { id: "matar-pulao", name: "Matar Pulao", description: "With cumin and green peas.", price: 7.95, image: null },
    ]
  },
  {
    id: "biryani",
    name: "Biryani",
    items: [
      { id: "veg-biryani", name: "Veg. Biryani", description: "Fresh vegetables cooked with basmati rice, herbs, and spices.", price: 18.95, image: null },
      { id: "chicken-biryani-hyderabadi", name: "Chicken Biryani Hyderabadi", description: "Basmati rice with Chicken cooked with spices in the style of Hyderabadi Nawabs", price: 20.95, image: null },
      { id: "lamb-biryani", name: "Lamb Biryani", description: "Basmati Rice with Lamb cooked with herbs and spices.", price: 22.95, image: null },
      { id: "goat-biryani", name: "Goat Biryani", description: "Basmati Rice with Goat meat cooked with herbs and spices.", price: 23.95, image: null },
      { id: "shrimp-biryani", name: "Shrimp Biryani", description: "Basmati Rice with Shrimps cooked with herbs and spices.", price: 23.95, image: null },
    ]
  },
  {
    id: "side-orders",
    name: "Side Order",
    items: [
      { id: "mint-chutney", name: "Mint Chutney", description: "Fresh mint and coriander chutney", price: 2.95, image: null },
      { id: "mixed-pickle", name: "Mixed Pickle", description: "Traditional Indian mixed vegetable pickle", price: 2.95, image: null },
      { id: "onion-relish", name: "Onion Relish", description: "Chopped onions marinated with a blend of tomato purée, vinegar", price: 2.95, image: null },
      { id: "tamarind-chutney", name: "Tamarind Chutney", description: "Sweet and tangy tamarind sauce", price: 2.95, image: null },
      { id: "papadum", name: "Papadum", description: "Crispy Indian dried lentil crackers.", price: 3.95, image: null },
      { id: "mango-chutney", name: "Mango Chutney", description: "A blend of ripe mangoes, sugar, and select spices", price: 4.95, image: null },
      { id: "raita", name: "Raita", description: "Yogurt with carrots & Cucumbers and spices", price: 4.95, image: null },
      { id: "jeera-aloo", name: "Jeera Aloo", description: "Cumin Flavored Potatoes.", price: 9.95, image: null },
      { id: "om-daal-side", name: "Om Daal", description: "Mix black lentils cooked with butter and in a fresh tomato sauce", price: 9.95, image: null },
      { id: "delhi-masala-daal-side", name: "Delhi Masala Daal", description: "Yellow lentils cooked slowly with herbs and spices", price: 9.95, image: null },
    ]
  },
  {
    id: "dessert",
    name: "Dessert",
    items: [
      { id: "om-kheer", name: "OM Kheer", description: "Almond and apple flavored rice pudding in cardamom", price: 5.95, image: "/assets/OMIndianRestaurant_Kheer.jpg" },
      { id: "gulab-jamun", name: "Gulab Jamun", description: "Soft dumplings of milk, flour simmered in simple syrup, rose water, cardamom", price: 6.95, image: "/assets/OMIndianRestaurant_GulabJamun.jpg" },
      { id: "mango-kulfi", name: "Mango Kulfi", description: "Traditional Indian ice cream with mango", price: 6.95, image: null },
      { id: "pistachio-kulfi", name: "Pistachio Kulfi", description: "Traditional Indian ice cream with pistachio", price: 6.95, image: null },
      { id: "ras-malai", name: "Ras Malai", description: "Steamed cottage cheese dumplings with saffron milk", price: 6.95, image: null },
    ]
  },
  {
    id: "beverages",
    name: "Beverage",
    items: [
      { id: "soft-drinks", name: "Soft Drinks", description: "Coke, Diet Coke, Sprite, Ginger Ale", price: 2.95, image: null, options: ["Coke", "Diet Coke", "Sprite", "Ginger Ale"] },
      { id: "water", name: "Water", description: "Bottled water", price: 2.95, image: null },
      { id: "sparkling-water", name: "Sparkling Water", description: "Sparkling mineral water", price: 3.95, image: null },
      { id: "mango-lassi", name: "Mango Lassi", description: "Sweet yogurt drink blended with mango", price: 6.95, image: null },
    ]
  },
];

// Lunch menu data (served 12:00 PM - 2:45 PM) - Dine-in only
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
    wines: [],
    beverages: [],
    beers: [],
    desserts: [],
  },
};

// Bar menu data - Dine In only, display purposes
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
      { name: "Piña Colada", description: "Rum, Pineapple juice, Coconut milk", price: "$13" },
      { name: "Strawberry Daiquiri", description: "Rum, Lime Juice, Simple syrup", price: "$13" },
      { name: "Vodka Daiquiri", description: "Vodka, Peach Blossom, Lime Juice", price: "$13" },
      { name: "Aperol Spritz", description: "Prosecco, Aperol, Splash of Club Soda", price: "$13" },
      { name: "Lychee Martini", description: "Vodka, Lychee juice, Lime juice", price: "$13" },
    ]
  },
  {
    category: "Wine by the Glass — Red Wines",
    items: [
      { name: "Malbec Vista Flores, Catena", description: "Mendoza AR — Dark violet color with black reflections. Dark and red fruit aromas with floral notes of lavender, violet, and mocha; rich with notes of sweet spice.", price: "$11" },
      { name: "Cabernet Sauvignon, Ryder", description: "California — Rich, smooth, and powerful at first, carrying hints of mocha along with flavors of cherry and black berries.", price: "$12" },
      { name: "Rioja Crianza, Bujanda", description: "Rioja SP — Aromas of blackberry with spicy tones (clove and cinnamon), mild tobacco and light balsamic notes.", price: "$12" },
      { name: "Valpolicella Classico Superiore, Zenato", description: "Veneto IT — Ruby red, fleshy aromas of wild berries, blackcurrants, black cherries, and spices, hints of chocolate.", price: "$12" },
      { name: "Pinot Noir", description: "Napa Valley — Made from hand selected grapes, embodying tradition and family heritage.", price: "$12" },
    ]
  },
  {
    category: "Wine by the Glass — Rosé",
    items: [
      { name: "Rosé, Mont Gravet", description: "Languedoc FR — Light pink color and aromas of strawberries and raspberries. Fresh and harmonious on the palate, long lasting fruit flavors.", price: "$11" },
    ]
  },
  {
    category: "Wine by the Glass — White Wines",
    items: [
      { name: "Dr. L Riesling", description: "Mosel DE — A bright, refreshing, fruit-driven wine, with a juicy mid-palate and a crisp, drying finish.", price: "$11" },
      { name: "Pinot Grigio, Zenato", description: "Delle Venezia IT — Pale sunlight color. Soft texture with a hint of cantaloupe and a medium dry finish.", price: "$12" },
      { name: "Villa Maria Sauvignon Blanc", description: "Marlborough NZ — Overflowing with aromas of gooseberry and passionfruit with hint of lime and nettles.", price: "$12" },
      { name: "Chardonnay, Black's Station", description: "California — With flavors of melon, mango, and toasty oak, boasts lovely aromas of pineapple and barrel spice.", price: "$12" },
    ]
  },
  {
    category: "Wine by the Glass — Bubbles",
    items: [
      { name: "Zardetto Spumante", description: "Veneto IT — Brilliant straw-yellow in color with a delicate pelage, with notes of pears, apples, and peaches with a hint of wildflowers.", price: "$11" },
    ]
  },
  {
    category: "Wine by the Bottle — Red Wines",
    items: [
      { name: "Cabernet Sauvignon, Ryder", description: "California — Rich, smooth, and powerful at first, carrying hints of mocha along with flavors of cherry and black berries.", price: "$46" },
      { name: "Rioja Crianza, Bujanda", description: "Rioja SP — Aromas of blackberry with spicy tones (clove and cinnamon), mild tobacco and light balsamic notes.", price: "$45" },
      { name: "Chianti Classico, Cultusboni", description: "Tuscany IT — Medium body, bright red fruit, notes of ripe cherries, cinnamon and clove, bright finish.", price: "$45" },
      { name: "Valpolicella Classico Superiore, Zenato", description: "Veneto IT — Ruby red, fleshy aromas of wild berries, blackcurrants, black cherries, and spices, hints of chocolate.", price: "$46" },
      { name: "Malbec Vista Flores, Catena", description: "Mendoza AR — Dark violet color with black reflections. Dark and red fruit aromas with floral notes of lavender, violet, and mocha; rich with notes of sweet spice.", price: "$45" },
      { name: "Côtes du Rhône, Kermit Lynch", description: "France — Rich purple, spice box and forest floor nose with robust dark fruits on palate and supple mouthfeel.", price: "$46" },
      { name: "Pinot Noir", description: "Napa Valley — Made from hand selected grapes, embodying tradition and family heritage.", price: "$45" },
    ]
  },
  {
    category: "Wine by the Bottle — White Wines",
    items: [
      { name: "Pinot Grigio, Zenato", description: "Delle Venezia IT — Pale sunlight color. Soft texture with a hint of cantaloupe and a medium dry finish.", price: "$45" },
      { name: "Villa Maria Sauvignon Blanc", description: "Marlborough NZ — Overflowing with aromas of gooseberry and passionfruit with hint of lime and nettles.", price: "$46" },
      { name: "Chardonnay, Black's Station", description: "California — With flavors of melon, mango, and toasty oak, boasts lovely aromas of pineapple and barrel spice.", price: "$45" },
      { name: "Dr. L Riesling", description: "Mosel DE — A bright, refreshing, fruit-driven wine, with a juicy mid-palate and a crisp, drying finish.", price: "$44" },
      { name: "Grüner Veltliner, Stadt Krems", description: "Kremstal AT — Savory aromas, spicy flavors, and good acidity. Fresh tasting with notes of green apple, lemon, radish, arugula.", price: "$46" },
    ]
  },
  {
    category: "Wine by the Bottle — Rosé & Bubbles",
    items: [
      { name: "Rosé, Mont Gravet", description: "Languedoc FR — Light pink color and aromas of strawberries and raspberries. Fresh and harmonious on the palate, long lasting fruit flavors.", price: "$42" },
      { name: "Zardetto Spumante", description: "Veneto IT — Brilliant straw-yellow in color with a delicate pelage, with notes of pears, apples, and peaches with a hint of wildflowers.", price: "$42" },
    ]
  },
  {
    category: "Reserve Wines — Red",
    items: [
      { name: "Château Beau-Site", description: "Château FR — Dark ruby red with aromas of tobacco leaf, leather, and blackcurrant. The palate is savory and herbal with an earthy minerality.", price: "$80" },
      { name: "Bordeaux Rouge, Beau Rivage", description: "Bordeaux FR — Ruby with violet reflections, fragrant blackberry, raspberry, and boysenberry, fruity typicity on the nose.", price: "$45" },
      { name: "Château Laplagnotte-Bellevue", description: "Bordeaux FR — Blend of Merlot and Cabernet Franc, fruit-driven with deep plum and ruby hue, aromas of black currant, black cherry, licorice, and graphite.", price: "$60" },
      { name: "Château Gaudin", description: "Pauillac FR — Aromas of cider, ripe berries, and cherries. Blackcurrant touches of vanilla and leather. Softens with age.", price: "$70" },
      { name: "Châteauneuf Du Pape Rouge, Domaine De La Solitude", description: "France — Bouquet nose of garrigue, flowers of cistus, blackcurrant buds. Mouth full of freshness and balanced with aromas of cocoa and morello cherry.", price: "$85" },
    ]
  },
  {
    category: "Half Bottles",
    items: [
      { name: "Cabernet Sauvignon, Textbook", description: "Napa Valley CA — Aromas of anise, blueberry, dried cranberry, and sage. Palate includes blackberry jam and mocha. Rich and full-bodied with a long finish.", price: "$30" },
      { name: "Pinot Noir, King Estate", description: "Willamette Valley OR — Deep garnet, aromas of fresh fruits, mocha, toast, clove, graphite, and tea. Soft and bright entrance.", price: "$30" },
    ]
  },
  {
    category: "Bourbon / Rye / Whiskey",
    items: [
      { name: "Old Crow", description: "", price: "$12" },
      { name: "Jack Daniels", description: "", price: "$13" },
      { name: "Woodford Reserve", description: "", price: "$15" },
      { name: "Maker's Mark", description: "", price: "$15" },
      { name: "Jameson", description: "", price: "$15" },
      { name: "Bulleit Rye", description: "", price: "$15" },
    ]
  },
  {
    category: "Blended & Single Malt Scotch",
    items: [
      { name: "Johnnie Walker Black 12 Yrs", description: "Blended Scotch", price: "$15" },
      { name: "Macallan 12 Yrs", description: "Single Malt", price: "$16" },
      { name: "Glenfiddich 12 Yrs", description: "Single Malt", price: "$16" },
      { name: "Glenlivet 12 Yrs", description: "Single Malt", price: "$16" },
    ]
  },
  {
    category: "Tequila",
    items: [
      { name: "Jose Cuervo", description: "Silver/Gold", price: "$11" },
      { name: "Partida", description: "", price: "$12" },
      { name: "Herradura", description: "", price: "$14" },
      { name: "Don Julio Blanco", description: "", price: "$15" },
      { name: "Silver Patrón", description: "", price: "$15" },
    ]
  },
  {
    category: "Gin",
    items: [
      { name: "Hendrick's", description: "", price: "$13" },
      { name: "Bombay Sapphire", description: "", price: "$13" },
      { name: "Tanqueray", description: "", price: "$13" },
      { name: "Beefeater", description: "", price: "$13" },
    ]
  },
  {
    category: "Vodka",
    items: [
      { name: "Tito's", description: "", price: "$13" },
      { name: "Ketel One", description: "", price: "$14" },
      { name: "Ketel One Citroen", description: "", price: "$14" },
      { name: "Absolut", description: "", price: "$14" },
      { name: "Grey Goose", description: "", price: "$15" },
    ]
  },
  {
    category: "Rum",
    items: [
      { name: "Bacardi", description: "", price: "$12" },
      { name: "Captain Morgan", description: "", price: "$12" },
    ]
  },
  {
    category: "Cognac",
    items: [
      { name: "Hennessy VSOP", description: "", price: "$16" },
    ]
  },
  {
    category: "Liqueurs",
    items: [
      { name: "Baileys", description: "", price: "$10" },
      { name: "St Germain", description: "", price: "$10" },
      { name: "Domaine de Canton", description: "", price: "$10" },
      { name: "Amaro Lucano", description: "", price: "$10" },
      { name: "Peach Blossom", description: "", price: "$10" },
      { name: "Sour Apple", description: "", price: "$10" },
      { name: "Blue Curaçao", description: "", price: "$10" },
      { name: "Campari", description: "", price: "$10" },
    ]
  },
  {
    category: "Beer",
    items: [
      { name: "Taj Mahal", description: "650ml", price: "$12" },
      { name: "Kingfisher", description: "", price: "$8" },
      { name: "Stella", description: "", price: "$8" },
      { name: "Non-Alcoholic Beer", description: "", price: "$8" },
    ]
  },
  {
    category: "Dessert Wine",
    items: [
      { name: "Vietti Moscato d'Asti", description: "Taste of juicy yellow fruits (pears, apricots, and peaches) with a strong floral scent (rose petals)", price: "$8" },
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
      { name: "Lamb Rogan Josh", description: "Lamb with onions, tomatoes, Kashmiri red chiles, spices, aniseed.", halfTray: "$97.00", fullTray: "$191.00" },
      { name: "Lamb Tikka Masala", description: "Lamb cooked in clay oven with rich tomato & fenugreek sauce.", halfTray: "$97.00", fullTray: "$191.00" },
      { name: "Lamb Korma", description: "Boneless lamb in cashew-saffron cream sauce.", halfTray: "$97.00", fullTray: "$191.00" },
      { name: "Lamb Vindaloo", description: "Lamb in fiery Goan sauce with garlic, vinegar, cumin.", halfTray: "$97.00", fullTray: "$191.00" },
      { name: "Lamb Saag", description: "Cubes of lamb sautéed with fresh spinach and spices.", halfTray: "$95.00", fullTray: "$185.00" },
    ]
  },
  {
    name: "Seafood Entrees",
    items: [
      { name: "Goan Salmon Curry", description: "Salmon fillet cooked with coconut milk, cumin, curry leaves, lime juice.", halfTray: "$115.00", fullTray: "$200.00" },
      { name: "Goan Shrimp Curry", description: "In coconut, tomato, tamarind sauce with mustard seeds & curry leaves.", halfTray: "$120.00", fullTray: "$220.00" },
      { name: "Shrimp Tikka Masala", description: "Shrimp cooked in clay oven with rich tomato & fenugreek sauce.", halfTray: "$120.00", fullTray: "$220.00" },
    ]
  },
  {
    name: "Biryani",
    items: [
      { name: "Vegetable Biryani", description: "Fried basmati rice with vegetables, nuts, and spices. Served with raita.", halfTray: "$79.00", fullTray: "$149.00" },
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
      { name: "Gulab Jamun", description: "Soft dumplings of milk, flour simmered in simple syrup, rose water, cardamom.", perPiece: "$2.25/person" },
      { name: "OM Kheer", description: "Almond and apple flavored rice pudding in cardamom.", halfTray: "$60.00", fullTray: "$140.00" },
      { name: "Soda", description: "Diet Coke, Coke, Ginger Ale, Sprite.", perPiece: "$1.99/person" },
      { name: "Mango Lassi", description: "Refreshing mango yogurt drink.", perPiece: "$3.95/person" },
    ]
  },
];

export default function MenuPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[300px]">
        <Image
          src="/assets/OMIndianRestaurant_Hero.jpg"
          alt="Our Menu"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">OUR MENU</h1>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-lg text-gray-600">Authentic flavors prepared with care</p>
          </div>

          <MenuDisplay 
            dinnerCategories={takeOutMenu}
            lunchMenu={lunchMenu}
            barMenu={barMenu}
            cateringMenu={cateringMenu}
            omSpecialMenu={omSpecialMenu}
          />

          {/* Order CTA */}
          <div className="mt-16 bg-[#C41E3A] rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Order?</h3>
            <p className="text-white/90 mb-6">Order online for pickup or delivery</p>
            <a 
              href="/order" 
              className="inline-block bg-white text-[#C41E3A] px-8 py-3 rounded font-semibold hover:bg-gray-100 transition-colors"
            >
              Order Online
            </a>
          </div>
        </div>
      </div>

      <OrderingMaintenanceModal allowDismiss />
    </div>
  );
}
