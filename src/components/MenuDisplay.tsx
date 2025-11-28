"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number; // This is the take-out price
  image: string | null;
};

// Database now stores take-out prices directly (the .95 prices)

type Category = {
  id: string;
  name: string;
  items: MenuItem[];
};

type MenuType = "takeout" | "dinein" | "catering";

interface MenuDisplayProps {
  dinnerCategories: Category[];
  barMenu: BarMenuItem[];
  cateringMenu: CateringCategory[];
  lunchMenu: LunchMenu;
}

interface BarMenuItem {
  category: string;
  items: { name: string; description?: string; price: string }[];
}

interface CateringCategory {
  name: string;
  items: { name: string; description: string; halfTray?: string; fullTray?: string; perPiece?: string }[];
}

interface LunchMenuItem {
  name: string;
  description?: string;
}

interface LunchMenuSection {
  name: string;
  items: LunchMenuItem[];
}

interface LunchMenu {
  pricing: { veg: string; lamb: string };
  hours: string;
  includes: string;
  sections: LunchMenuSection[];
  happyHour: {
    wines: { name: string; description: string; price: string }[];
    beverages: { name: string; price: string }[];
    beers: { name: string; price: string }[];
    desserts: { name: string; description: string; price: string }[];
  };
}

// Dine-in menu items from OM menu in house NEW.docx (with dine-in prices)
const dineInMenu = {
  vegAppetizers: [
    { name: "Samosa", description: "Crispy turnover with potatoes & green peas", price: "$8.00" },
    { name: "Bhel Puri", description: "Puffed rice with tangy tamarind and mint sauce", price: "$9.00" },
    { name: "Sweet & Sour Gobi", description: "Cauliflower cooked in sweet & sour sauce", price: "$9.00" },
    { name: "Onion Bhajjias", description: "Savory deep fried onion fritters made with Bengal gram flours", price: "$10.00" },
    { name: "Tandoori Grilled Mix Veg", description: "Florets of mixed veggies marinated with spices, ginger, garlic and grilled", price: "$12.00" },
    { name: "Tandoori Mushroom", description: "Mushrooms marinated with roasted spices, hung yogurt and pickles", price: "$12.00" },
    { name: "Tandoori Grilled Paneer", description: "Grilled Indian cottage cheese marinated with spice & yogurt", price: "$13.00" },
  ],
  nonVegAppetizers: [
    { name: "Chicken 65", description: "Stir-fried chicken sautéed with bell pepper, onion, ginger and garlic", price: "$12.00" },
    { name: "Malai Chicken Kabab", description: "Marinated in yogurt, saffron, spices & herbs", price: "$12.00" },
    { name: "Achari Chicken", description: "Tandoori grilled with pickling spices", price: "$12.00" },
    { name: "Seek Kabab", description: "Ground lamb seasoned with onions & spices", price: "$13.00" },
    { name: "Chili Shrimp", description: "Indo-Chinese tossed with bell peppers, onions, chilis, garlic and ginger", price: "$14.00" },
  ],
  soups: [
    { name: "Lentil Soup", description: "Lentil broth with turmeric and spices", price: "$7.00" },
    { name: "Chicken Soup", description: "Broth simmered with diced chicken and spices", price: "$7.00" },
  ],
  salad: [
    { name: "Om Green Salad", description: "Lettuce, bell pepper, carrot, cucumber, tomatoes chef's dressing", price: "$8.00" },
  ],
  chickenMainCourse: [
    { name: "Chicken Tikka Masala / Butter Chicken", description: "Grilled marinated chicken in a creamy tomato fenugreek sauce", price: "$20.00" },
    { name: "Madras Chicken Curry", description: "White poppy seeds, sliced onions, toasted grated coconut, and large dried red chili", price: "$20.00" },
    { name: "Chicken Korma", description: "Roasted cashew(almond) nut, raisin, golden onion, saffron milk, cream and mild spices", price: "$20.00" },
    { name: "Chicken Vindaloo", description: "Cooked with freshly ground spices, toddy vinegar, whole dry chili sauce", price: "$20.00" },
    { name: "Chicken Kadhai", description: "Chunks of chicken braised in a masala of coarse ground spices with sauteed onions, bell peppers", price: "$20.00" },
    { name: "Chicken Saagwala", description: "Chicken sauteed in spinach with a hint of spices", price: "$20.00" },
    { name: "Chicken Curry", description: "Traditional Indian style chicken curry, very savory with aromatic spices", price: "$20.00" },
    { name: "Chicken Chettinad", description: "Fresh ground pepper, temper with mustard seeds and curry leaves, with coconut milk", price: "$20.00" },
  ],
  lambMainCourse: [
    { name: "Lamb Dhansaak", description: "Dhansaak is a flavorful and aromatic curry, Fenugreek, lentil", price: "$22.00" },
    { name: "Lamb Korma", description: "Roasted cashew nut, raisin, golden fried onion, saffron coconut milk and spices", price: "$22.00" },
    { name: "Lamb Rogan Josh", description: "Slow cooked lamb with intense spices in an onion and tomato curry sauce", price: "$22.00" },
    { name: "Lamb Vindaloo", description: "Tender lamb in a spicy curry made from vinegar, chilies and garlic", price: "$22.00" },
    { name: "Lamb Bhuna", description: "Lamb intensely sauteed with onion & spices and cooked in its own juices", price: "$22.00" },
    { name: "Lamb Jalfrezi", description: "Chunks of lamb cooked with stir fried onions and bell peppers in a classic curry sauce", price: "$22.00" },
    { name: "Lamb Chettinad", description: "Cooked with crushed black pepper, curry leaves, mustard seeds finished with coconut milk", price: "$22.00" },
  ],
  goatMainCourse: [
    { name: "Goat Curry", description: "Traditional Indian style goat curry, very savory with aromatic spices", price: "$24.00" },
    { name: "Goat Vindaloo", description: "Freshly ground spices, whole dry chili, toddy vinegar", price: "$24.00" },
    { name: "Goat Bhuna", description: "Goat intensely sauteed with onion & spices and cooked in its own juices", price: "$24.00" },
  ],
  vegMainCourse: [
    { name: "Saag Paneer / Chana Saag", description: "Cottage cheese cooked with spinach / Chickpeas cooked with herbs & spices", price: "$18.00" },
    { name: "Chana Masala", description: "Chickpeas with onion & tomato (gravy-based curry)", price: "$18.00" },
    { name: "Bhindi Masala", description: "Fresh cut okra with cumin, onion, tomato masala", price: "$18.00" },
    { name: "Vegetable Korma", description: "Fresh vegetables cooked mildly spiced Almond cream sauce", price: "$18.00" },
    { name: "OM Daal", description: "Mix black lentils cooked with butter and in a fresh tomato sauce", price: "$18.00" },
    { name: "Seasonal Vegetable Vindaloo", description: "Fiery pepper, vinegar, roasted spices", price: "$18.00" },
    { name: "Delhi Masala Daal", description: "Yellow lentils cooked slowly with herbs and spices", price: "$18.00" },
    { name: "Paneer Tikka Masala", description: "Indian cottage cheese cooked in creamy tomato and onion sauce", price: "$18.00" },
    { name: "Methi Saag Aloo", description: "Potatoes, fenugreek leaves, spinach, cumin seeds", price: "$18.00" },
    { name: "Malai Kofta", description: "Vegetable balls in tomato cream sauce", price: "$18.00" },
    { name: "Aloo Gobi Matar", description: "Potato, cauliflower & green peas cooked with cumin, ginger, and spices", price: "$18.00" },
    { name: "Achari Bainghan", description: "Baby eggplant cooked with pickling spices", price: "$18.00" },
  ],
  seafoodMainCourse: [
    { name: "Shrimp/Salmon Vindaloo", description: "Freshly ground spices, whole dry chili, toddy vinegar", price: "$25.00" },
    { name: "Shrimp Korma", description: "Roasted cashew nut, raisin, golden fried onion, mix fruits, saffron and spices", price: "$25.00" },
    { name: "Goan Shrimp Curry", description: "Shrimp cooked with fresh coconut milk with onions, lime juice, & spices", price: "$25.00" },
    { name: "Shrimp Saag", description: "Onions, tomatoes with fresh sautéed spinach with ginger & garlic", price: "$25.00" },
    { name: "Goan Salmon Curry", description: "Salmon fillet cooked with fresh coconut milk with cumin, curry leaves, lime juice & spices", price: "$25.00" },
    { name: "Fish Masala", description: "Pan seared salmon cooked with an onion, fenugreek leaves & tomato spiced sauce", price: "$25.00" },
  ],
  tandooriGrill: [
    { name: "Tandoori Chicken", description: "Bone-in half chicken marinated in hung yogurt and classic tandoori spices", price: "$22.00" },
    { name: "Tandoori Chicken Tikka", description: "Chicken marinated with fresh basil, yogurt, roasted garlic paste, spices, & olive oil", price: "$22.00" },
    { name: "Malai Kabab", description: "Chicken marinated with cheddar cheese, saffron, white pepper, hung yogurt", price: "$22.00" },
    { name: "Lamb Boti Kebab", description: "Tender chunks of lamb marinated in hung yogurt, garlic, ginger, mint", price: "$23.00" },
    { name: "Lamb Seekh Kebab", description: "Oven cooked grounded lamb seasoned with cumin, ginger, & mint", price: "$24.00" },
    { name: "Lamb Chops", description: "Marinated with a special house sauce", price: "$32.00" },
    { name: "Salmon Tikka", description: "Atlantic salmon fillets marinated in hung yogurt and herbs", price: "$26.00" },
    { name: "Tandoori Shrimp", description: "Jumbo shrimp marinated in a spiced hung yogurt mixture", price: "$26.00" },
    { name: "OM Mixed Grill", description: "Assortment of Chicken, Lamb and Seafood", price: "$30.00" },
  ],
  bread: [
    { name: "Plain Naan", price: "$4.00" },
    { name: "Onion Naan", price: "$5.00" },
    { name: "Garlic Naan", price: "$5.00" },
    { name: "Om Bread (Sweet)", price: "$6.00" },
    { name: "Special 3 Cheese Naan", price: "$7.00" },
  ],
  wholeWheatBread: [
    { name: "Plain Roti", price: "$4.00" },
    { name: "Laccha Paratha", price: "$6.00" },
    { name: "Mint Paratha", price: "$6.00" },
    { name: "Aloo Paratha", price: "$6.00" },
    { name: "Chicken Tikka Naan", price: "$6.00" },
    { name: "Special Chili Garlic Naan", price: "$7.00" },
  ],
  rice: [
    { name: "Matar Pulao", description: "With cumin and green peas", price: "$7.00" },
    { name: "Om Sweet Pulao", description: "Saffron rice cooked with fruits and nuts", price: "$7.00" },
    { name: "Lemon Rice", description: "Cooked with lemon juice, mustard seeds, fried peanuts, and curry leaves", price: "$7.00" },
  ],
  biryani: [
    { name: "Veg. Biryani", description: "Fresh vegetables cooked with basmati rice, herbs, and spices", price: "$20.00" },
    { name: "Chicken Biryani Hyderabadi", description: "Basmati rice with Chicken cooked with spices in the style of Hyderabadi Nawabs", price: "$22.00" },
    { name: "Lamb Biryani", description: "Basmati Rice with Lamb cooked with herbs and spices", price: "$23.00" },
    { name: "Goat Biryani", description: "Basmati Rice with Goat meat cooked with herbs and spices", price: "$24.00" },
    { name: "Shrimp Biryani", description: "Basmati Rice with Shrimps cooked with herbs and spices", price: "$25.00" },
  ],
  sideOrders: [
    { name: "Mango Chutney", description: "A blend of ripe mangoes, sugar, and select spices", price: "$3.00" },
    { name: "Onion Relish", description: "Chopped onions marinated with a blend of tomato purée, vinegar", price: "$3.00" },
    { name: "Papadum", description: "Crispy Indian dried lentil crackers", price: "$4.00" },
    { name: "Raita", description: "Yogurt with carrots & Cucumbers and spices", price: "$5.00" },
    { name: "Jeera Aloo", description: "Cumin Flavored Potatoes", price: "$10.00" },
    { name: "Om Daal / Delhi Masala Daal", description: "Mix black lentils with butter or yellow lentils cooked slowly with herbs & spices", price: "$10.00" },
  ],
};

// Dine-in menu sections for sidebar navigation
const dineInSections = [
  { id: "dinein-lunch-special", label: "Lunch Special" },
  { id: "dinein-happy-hour", label: "Happy Hour" },
  { id: "dinein-veg-appetizers", label: "Veg. Appetizers" },
  { id: "dinein-nonveg-appetizers", label: "Non-Veg. Appetizers" },
  { id: "dinein-soups", label: "Soups" },
  { id: "dinein-salad", label: "Salad" },
  { id: "dinein-chicken", label: "Chicken" },
  { id: "dinein-lamb", label: "Lamb" },
  { id: "dinein-goat", label: "Goat" },
  { id: "dinein-veg-main", label: "Veg. Main Course" },
  { id: "dinein-seafood", label: "Seafood" },
  { id: "dinein-tandoori", label: "Tandoori Grill" },
  { id: "dinein-bread", label: "Bread" },
  { id: "dinein-rice", label: "Rice" },
  { id: "dinein-biryani", label: "Biryani" },
  { id: "dinein-sides", label: "Side Orders" },
  { id: "dinein-bar", label: "Bar Menu" },
];

// Catering menu sections for sidebar navigation
const cateringSections = [
  { id: "catering-appetizers", label: "Appetizers" },
  { id: "catering-tandoori", label: "Tandoori Specials" },
  { id: "catering-veg", label: "Vegetarian Entrees" },
  { id: "catering-chicken", label: "Chicken Entrees" },
  { id: "catering-lamb", label: "Lamb Entrees" },
  { id: "catering-seafood", label: "Seafood Entrees" },
  { id: "catering-biryani", label: "Biryani" },
  { id: "catering-breads", label: "Breads" },
  { id: "catering-rice", label: "Rice & Sides" },
  { id: "catering-desserts", label: "Desserts & Beverages" },
];

// Extended item type for bar/catering items
type SelectedItemExtended = MenuItem & {
  itemType?: 'dinner' | 'bar' | 'catering' | 'dinein';
  halfTray?: string;
  fullTray?: string;
  perPiece?: string;
};

export default function MenuDisplay({ dinnerCategories, barMenu, cateringMenu, lunchMenu }: MenuDisplayProps) {
  const [menuType, setMenuType] = useState<MenuType>("takeout");
  const [activeSection, setActiveSection] = useState<string>("dinein-lunch-special");
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Check if lunch special is currently available (12:00 PM - 2:45 PM US Eastern Time)
  const isLunchTime = () => {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const hours = easternTime.getHours();
    const minutes = easternTime.getMinutes();
    const currentTime = hours * 60 + minutes;
    const lunchStart = 12 * 60; // 12:00 PM
    const lunchEnd = 14 * 60 + 45; // 2:45 PM
    return currentTime >= lunchStart && currentTime <= lunchEnd;
  };
  
  const lunchAvailable = isLunchTime();
  const [selectedItem, setSelectedItem] = useState<SelectedItemExtended | null>(null);
  const { addItem } = useCart();
  const router = useRouter();

  // Lunch special builder state
  const [lunchSpecialAppetizer, setLunchSpecialAppetizer] = useState<string | null>(null);
  const [lunchSpecialMain, setLunchSpecialMain] = useState<string | null>(null);
  const [lunchSpecialMainType, setLunchSpecialMainType] = useState<'veg' | 'lamb'>('veg');
  const [lunchBreadUpgrade, setLunchBreadUpgrade] = useState<'garlic' | 'onion' | 'paratha' | null>(null);
  
  // OM Special builder state (for Take Out menu)
  const [omSpecialAppetizer, setOmSpecialAppetizer] = useState<string | null>(null);
  const [omSpecialEntree, setOmSpecialEntree] = useState<string | null>(null);
  const [showOmSpecialBuilder, setShowOmSpecialBuilder] = useState(false);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedItem) {
        setSelectedItem(null);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedItem]);

  // Scroll to section when clicked in sidebar
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleOrderItem = (customPrice?: number, customName?: string) => {
    if (selectedItem) {
      addItem({
        menuItemId: selectedItem.id,
        name: customName || selectedItem.name,
        price: customPrice ?? selectedItem.price,
        quantity: 1,
        note: ""
      });
      setSelectedItem(null);
      router.push("/order");
    }
  };

  // Add OM Special to cart and go to order page
  const handleAddOmSpecial = () => {
    if (omSpecialAppetizer && omSpecialEntree) {
      addItem({
        menuItemId: `om-special-${Date.now()}`,
        name: 'OM Special',
        price: 18.95,
        quantity: 1,
        note: `Appetizer: ${omSpecialAppetizer}, Entrée: ${omSpecialEntree}. Includes basmati rice, naan bread, raita & mango chutney.`
      });
      
      // Reset selections
      setOmSpecialAppetizer(null);
      setOmSpecialEntree(null);
      setShowOmSpecialBuilder(false);
      
      router.push("/order?menu=takeout");
    }
  };

  // Add lunch special to cart and go to order page
  const handleAddLunchSpecial = () => {
    if (!lunchAvailable) {
      alert('Lunch Special is only available from 12:00 PM - 2:45 PM Eastern Time');
      return;
    }
    if (lunchSpecialAppetizer && lunchSpecialMain) {
      const basePrice = lunchSpecialMainType === 'lamb' ? 18.95 : 17.95;
      const upgradePrice = lunchBreadUpgrade ? 1 : 0;
      const totalPrice = basePrice + upgradePrice;
      const breadText = lunchBreadUpgrade 
        ? (lunchBreadUpgrade === 'garlic' ? 'garlic naan' : lunchBreadUpgrade === 'onion' ? 'onion naan' : 'plain paratha')
        : 'naan';
      
      // Determine specific lunch special name based on main course selection
      let lunchSpecialName = 'Lunch Special';
      const mainLower = lunchSpecialMain.toLowerCase();
      if (lunchSpecialMainType === 'veg') {
        // Veg & Chicken section
        if (mainLower.includes('chicken')) {
          lunchSpecialName = 'Chicken Lunch Special';
        } else {
          lunchSpecialName = 'Veg. Lunch Special';
        }
      } else {
        // Lamb & Seafood section
        if (mainLower.includes('lamb') || mainLower.includes('goat')) {
          lunchSpecialName = 'Lamb Lunch Special';
        } else {
          lunchSpecialName = 'Seafood Lunch Special';
        }
      }
      
      addItem({
        menuItemId: `lunch-special-${Date.now()}`,
        name: lunchSpecialName,
        price: totalPrice,
        quantity: 1,
        note: `Appetizer: ${lunchSpecialAppetizer}, Main: ${lunchSpecialMain}. Includes rice, ${breadText} & lentil of the day.`
      });
      
      // Reset selections
      setLunchSpecialAppetizer(null);
      setLunchSpecialMain(null);
      setLunchSpecialMainType('veg');
      setLunchBreadUpgrade(null);
      
      router.push("/order?menu=lunch");
    }
  };

  const menuTypes: { id: MenuType; label: string }[] = [
    { id: "dinein", label: "Dine In" },
    { id: "takeout", label: "Take Out" },
    { id: "catering", label: "Catering" },
  ];

  // Render a dine-in menu section
  const renderDineInSection = (title: string, items: { name: string; description?: string; price: string }[], sectionId: string) => (
    <div id={sectionId} className="bg-white rounded-2xl shadow-lg overflow-hidden scroll-mt-28">
      <div className="bg-[#1A1A1A] px-6 py-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start gap-4 py-3 border-b border-gray-100 last:border-0">
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                {item.description && (
                  <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                )}
              </div>
              <span className="text-[#C41E3A] font-bold whitespace-nowrap">{item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Menu Type Buttons */}
      <div className="flex justify-center gap-2 mb-12">
        {menuTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setMenuType(type.id)}
            className={`px-4 sm:px-8 py-2 sm:py-3 rounded font-semibold text-xs sm:text-base transition-all whitespace-nowrap ${
              menuType === type.id
                ? "bg-[#C41E3A] text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 shadow border border-gray-200"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Take Out Menu */}
      {menuType === "takeout" && (
        <div className="flex gap-6">
          {/* Sidebar Navigation - Hidden on Mobile */}
          <div className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl shadow-lg p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Menu Sections</h3>
              <nav className="space-y-1">
                <button
                  onClick={() => scrollToSection('takeout-om-special')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                    activeSection === 'takeout-om-special'
                      ? 'bg-[#C41E3A] text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  OM Special
                </button>
                {dinnerCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => scrollToSection(`takeout-${category.id}`)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      activeSection === `takeout-${category.id}`
                        ? 'bg-[#C41E3A] text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Mobile Section Selector */}
          <div className="lg:hidden mb-4 w-full">
            <select
              value={activeSection}
              onChange={(e) => scrollToSection(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm text-gray-900 font-medium"
            >
              <option value="takeout-om-special">OM Special</option>
              {dinnerCategories.map((category) => (
                <option key={category.id} value={`takeout-${category.id}`}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Main Content */}
          <div className="flex-grow space-y-12 min-w-0">
          {/* OM Special Deal */}
          <div id="takeout-om-special" className="bg-[#C41E3A] text-white p-6 rounded-2xl scroll-mt-28">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">OM SPECIAL</h2>
                <p className="text-white/90 text-xl font-semibold">$18.95</p>
                <p className="text-white/80 text-sm mt-1">
                  One Appetizer + One Entrée • Includes basmati rice, naan bread, raita & mango chutney
                </p>
              </div>
              <button
                onClick={() => setShowOmSpecialBuilder(!showOmSpecialBuilder)}
                className="bg-white text-[#C41E3A] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                {showOmSpecialBuilder ? 'Hide Builder' : 'Build Your OM Special'}
              </button>
            </div>
            
            {showOmSpecialBuilder && (
              <div className="mt-6 bg-white/10 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Appetizer Selection */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">1. Choose Appetizer</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {dinnerCategories
                        .filter(c => c.name.toLowerCase().includes('appetizer'))
                        .flatMap(c => c.items)
                        .map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => setOmSpecialAppetizer(item.name)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                              omSpecialAppetizer === item.name 
                                ? 'bg-white text-[#C41E3A] font-semibold' 
                                : 'bg-white/20 hover:bg-white/30'
                            }`}
                          >
                            {omSpecialAppetizer === item.name && (
                              <span className="mr-2">✓</span>
                            )}
                            {item.name}
                          </button>
                        ))}
                    </div>
                  </div>
                  
                  {/* Entrée Selection */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">2. Choose Entrée</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {dinnerCategories
                        .filter(c => c.name.toLowerCase().includes('main course') || c.name.toLowerCase().includes('entree'))
                        .flatMap(c => c.items)
                        .map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => setOmSpecialEntree(item.name)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                              omSpecialEntree === item.name 
                                ? 'bg-white text-[#C41E3A] font-semibold' 
                                : 'bg-white/20 hover:bg-white/30'
                            }`}
                          >
                            {omSpecialEntree === item.name && (
                              <span className="mr-2">✓</span>
                            )}
                            {item.name}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
                
                {/* Summary and Add to Cart */}
                <div className="mt-4 pt-4 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm">
                    <span className={omSpecialAppetizer ? 'text-green-300' : 'text-white/60'}>
                      {omSpecialAppetizer ? `✓ ${omSpecialAppetizer}` : '① Pick Appetizer'}
                    </span>
                    <span className="mx-2">+</span>
                    <span className={omSpecialEntree ? 'text-green-300' : 'text-white/60'}>
                      {omSpecialEntree ? `✓ ${omSpecialEntree}` : '② Pick Entrée'}
                    </span>
                  </div>
                  <button
                    onClick={handleAddOmSpecial}
                    disabled={!omSpecialAppetizer || !omSpecialEntree}
                    className={`px-6 py-3 rounded-lg font-bold transition-all cursor-pointer ${
                      omSpecialAppetizer && omSpecialEntree
                        ? 'bg-white text-[#C41E3A] hover:bg-gray-100'
                        : 'bg-white/30 text-white/60 cursor-not-allowed'
                    }`}
                  >
                    Add to Cart & Order • $18.95
                  </button>
                </div>
              </div>
            )}
          </div>

          {dinnerCategories.map((category) => (
            <div id={`takeout-${category.id}`} key={category.id} className="bg-white rounded-2xl shadow-lg overflow-hidden scroll-mt-28">
              <div className="bg-[#1A1A1A] px-6 py-4">
                <h2 className="text-xl font-bold text-white">{category.name}</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="w-full flex justify-between items-start gap-4 py-3 border-b border-gray-100 last:border-0 text-left hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {item.description && (
                          <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                        )}
                      </div>
                      <span className="text-[#C41E3A] font-bold whitespace-nowrap">
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Dine In Menu (Full In-House Menu + Bar - Display Only) */}
      {menuType === "dinein" && (
        <div className="flex gap-6">
          {/* Sidebar Navigation - Hidden on Mobile */}
          <div 
            ref={sidebarRef}
            className="hidden lg:block w-48 flex-shrink-0"
          >
            <div className="sticky top-24 bg-white rounded-xl shadow-lg p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Menu Sections</h3>
              <nav className="space-y-1">
                {dineInSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      activeSection === section.id
                        ? 'bg-[#C41E3A] text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Mobile Section Selector */}
          <div className="lg:hidden mb-4 w-full">
            <select
              value={activeSection}
              onChange={(e) => scrollToSection(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm text-gray-900 font-medium"
            >
              {dineInSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>

          {/* Main Content */}
          <div className="flex-grow space-y-8 min-w-0">
            {/* Dine In Only Notice */}
            <div className="bg-amber-50 border-2 border-amber-400 text-amber-800 p-6 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-bold">Dine In Menu Only</h2>
              </div>
              <p className="text-amber-700">
                These items are available for dine-in customers only. For takeout orders, please use our{' '}
                <button onClick={() => setMenuType('takeout')} className="underline font-semibold hover:text-amber-900 cursor-pointer">
                  Take Out menu
                </button>.
              </p>
            </div>

            {/* Lunch Special Info */}
            <div id="dinein-lunch-special" className="bg-[#C41E3A] text-white p-6 rounded-2xl scroll-mt-28">
              <h2 className="text-2xl font-bold mb-2 text-center">LUNCH SPECIAL</h2>
              <p className="text-white/90 mb-4 text-center">{lunchMenu.hours}</p>
              
              {/* Pricing */}
              <div className="flex justify-center gap-6 flex-wrap mb-4">
                <div className="px-6 py-3 rounded-lg text-center bg-white/20">
                  <span className="font-bold text-xl">{lunchMenu.pricing.veg}</span>
                  <p className="text-sm mt-1">Veg or Chicken</p>
                </div>
                <div className="px-6 py-3 rounded-lg text-center bg-white/20">
                  <span className="font-bold text-xl">{lunchMenu.pricing.lamb}</span>
                  <p className="text-sm mt-1">Lamb or Seafood</p>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4 mt-4">
                <p className="text-sm text-center text-white/90">
                  Choose <span className="font-bold">1 Appetizer</span> + <span className="font-bold">1 Main Course</span>
                </p>
                <p className="text-sm text-center text-white/80 mt-2">{lunchMenu.includes}</p>
                <p className="text-sm text-center text-white/80 mt-2">
                  Upgrade to Garlic Naan, Onion Naan, or Plain Paratha for +$1
                </p>
              </div>
            </div>

            {/* Lunchtime Happy Hour - Right after Lunch Special */}
            <div id="dinein-happy-hour" className="bg-[#1A1A1A] text-white p-6 rounded-2xl text-center scroll-mt-28">
              <h2 className="text-2xl font-bold">LUNCHTIME HAPPY HOUR</h2>
              <p className="text-white/70 mt-2">Available during lunch hours (12:00 PM - 2:45 PM ET)</p>
            </div>

            {/* Non-Alcoholic Beverages */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-[#1A1A1A] px-6 py-4">
                <h2 className="text-xl font-bold text-white">Non-Alcoholic Beverages</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {lunchMenu.happyHour.beverages.map((bev, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-lg bg-gray-50">
                      <span className="font-medium text-gray-900">{bev.name}</span>
                      <span className="text-[#C41E3A] font-bold">{bev.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desserts */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-[#1A1A1A] px-6 py-4">
                <h2 className="text-xl font-bold text-white">Desserts</h2>
              </div>
              <div className="p-6 space-y-4">
                {lunchMenu.happyHour.desserts.map((dessert, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-4 py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <h3 className="font-semibold text-gray-900">{dessert.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">{dessert.description}</p>
                    </div>
                    <span className="text-[#C41E3A] font-bold">{dessert.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Food Menu Sections */}
            {renderDineInSection("Veg. Appetizers", dineInMenu.vegAppetizers, "dinein-veg-appetizers")}
            {renderDineInSection("Non-Veg. Appetizers", dineInMenu.nonVegAppetizers, "dinein-nonveg-appetizers")}
            {renderDineInSection("Soups", dineInMenu.soups, "dinein-soups")}
            {renderDineInSection("Salad", dineInMenu.salad, "dinein-salad")}
            {renderDineInSection("Chicken Main Course (All White Meat)", dineInMenu.chickenMainCourse, "dinein-chicken")}
            {renderDineInSection("Lamb Main Course", dineInMenu.lambMainCourse, "dinein-lamb")}
            {renderDineInSection("Goat Main Course", dineInMenu.goatMainCourse, "dinein-goat")}
            {renderDineInSection("Veg. Main Course", dineInMenu.vegMainCourse, "dinein-veg-main")}
            {renderDineInSection("Sea Food Main Course", dineInMenu.seafoodMainCourse, "dinein-seafood")}
            {renderDineInSection("Tandoori Grill Main Course", dineInMenu.tandooriGrill, "dinein-tandoori")}
            {renderDineInSection("Bread", dineInMenu.bread.map(b => ({ name: b.name, price: b.price })), "dinein-bread")}
            {renderDineInSection("Whole Wheat Bread", dineInMenu.wholeWheatBread.map(b => ({ name: b.name, price: b.price })), "dinein-bread")}
            {renderDineInSection("Rice (All Basmati Rice)", dineInMenu.rice, "dinein-rice")}
            {renderDineInSection("Biryani", dineInMenu.biryani, "dinein-biryani")}
            {renderDineInSection("Side Orders", dineInMenu.sideOrders, "dinein-sides")}

            {/* Bar Menu Header */}
            <div id="dinein-bar" className="bg-[#1A1A1A] text-white p-6 rounded-2xl text-center scroll-mt-28">
              <h2 className="text-2xl font-bold">BAR MENU</h2>
              <p className="text-white/70 mt-2">Must be 21+ to consume alcohol. Valid ID required.</p>
            </div>

            {/* Bar Menu Sections */}
            {barMenu.map((section, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-[#1A1A1A] px-6 py-4">
                  <h2 className="text-xl font-bold text-white">{section.category}</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {section.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex justify-between items-start gap-4 py-3 border-b border-gray-100 last:border-0">
                        <div className="flex-grow">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          {item.description && (
                            <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                          )}
                        </div>
                        <span className="text-[#C41E3A] font-bold whitespace-nowrap">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <p className="text-center text-gray-500 text-sm italic">
              Please speak to our staff regarding food allergies/intolerances before ordering
            </p>
          </div>
        </div>
      )}


      {/* Catering Menu */}
      {menuType === "catering" && (
        <div className="flex gap-6">
          {/* Sidebar Navigation - Hidden on Mobile */}
          <div className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl shadow-lg p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Menu Sections</h3>
              <nav className="space-y-1">
                {cateringSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      activeSection === section.id
                        ? 'bg-[#C41E3A] text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Mobile Section Selector */}
          <div className="lg:hidden mb-4 w-full">
            <select
              value={activeSection}
              onChange={(e) => scrollToSection(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm text-gray-900 font-medium"
            >
              {cateringSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>

          {/* Main Content */}
          <div className="flex-grow space-y-12 min-w-0">
            <div className="bg-[#C41E3A] text-white p-6 rounded-2xl text-center mb-8">
              <h2 className="text-xl font-bold mb-2">Catering Services</h2>
              <p className="text-lg font-semibold">$75 Delivery Minimum • Serves 15-35 guests</p>
              <p className="mt-2 text-white/90">Click any item to add to your order, or call (212) 628-4500</p>
            </div>
            {cateringMenu.map((section, idx) => {
              // Map section names to IDs
              const sectionIdMap: Record<string, string> = {
                'Appetizers': 'catering-appetizers',
                'Tandoori Specials': 'catering-tandoori',
                'Vegetarian Entrees': 'catering-veg',
                'Chicken Entrees': 'catering-chicken',
                'Lamb Entrees': 'catering-lamb',
                'Seafood Entrees': 'catering-seafood',
                'Biryani': 'catering-biryani',
                'Breads': 'catering-breads',
                'Rice & Sides': 'catering-rice',
                'Desserts & Beverages': 'catering-desserts',
              };
              const sectionId = sectionIdMap[section.name] || `catering-section-${idx}`;
              
              return (
                <div id={sectionId} key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden scroll-mt-28">
                  <div className="bg-[#1A1A1A] px-6 py-4">
                    <h2 className="text-xl font-bold text-white">{section.name}</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {section.items.map((item, itemIdx) => {
                        const halfTrayPrice = item.halfTray ? parseFloat(item.halfTray.replace('$', '')) : null;
                        const fullTrayPrice = item.fullTray ? parseFloat(item.fullTray.replace('$', '')) : null;
                        const perPiecePrice = item.perPiece ? parseFloat(item.perPiece.replace(/[^0-9.]/g, '')) : null;
                        const defaultPrice = fullTrayPrice || halfTrayPrice || perPiecePrice || 0;
                        
                        return (
                          <button
                            key={itemIdx}
                            onClick={() => setSelectedItem({
                              id: `catering-${idx}-${itemIdx}`,
                              name: item.name,
                              description: item.description || null,
                              price: defaultPrice,
                              image: null,
                              itemType: 'catering',
                              halfTray: item.halfTray,
                              fullTray: item.fullTray,
                              perPiece: item.perPiece
                            })}
                            className="w-full text-left py-4 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            {item.description && (
                              <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                            )}
                            <div className="flex flex-wrap gap-4 mt-3 text-sm">
                              {item.halfTray && (
                                <span className="bg-white px-3 py-1 rounded-full text-[#C41E3A] font-medium border border-[#C41E3A]/20">
                                  Half Tray: {item.halfTray}
                                </span>
                              )}
                              {item.fullTray && (
                                <span className="bg-white px-3 py-1 rounded-full text-[#C41E3A] font-medium border border-[#C41E3A]/20">
                                  Full Tray: {item.fullTray}
                                </span>
                              )}
                              {item.perPiece && (
                                <span className="bg-white px-3 py-1 rounded-full text-[#C41E3A] font-medium border border-[#C41E3A]/20">
                                  {item.perPiece}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="bg-amber-50 border border-amber-400 text-amber-800 p-4 rounded-xl text-center">
              <p className="font-semibold">⚠️ Catering orders require at least 24 hours advance notice</p>
              <p className="text-sm mt-1">Please call (212) 628-4500 to confirm availability for your event date.</p>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.image ? (
              <div className="relative h-64">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="relative bg-gradient-to-br from-[#C41E3A] to-[#8B0000] h-32">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h3>
                {selectedItem.itemType !== 'catering' && (
                  <span className="text-[#C41E3A] font-bold text-xl">
                    ${Number(selectedItem.price).toFixed(2)}
                  </span>
                )}
              </div>
              {selectedItem.description && (
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
              )}
              
              {/* Catering items - show tray size options */}
              {selectedItem.itemType === 'catering' ? (
                <div className="space-y-3 mt-4">
                  <p className="text-sm text-gray-500 font-medium">Select size:</p>
                  {selectedItem.halfTray && (
                    <button
                      onClick={() => {
                        const price = parseFloat(selectedItem.halfTray!.replace('$', ''));
                        handleOrderItem(price, `${selectedItem.name} (Half Tray)`);
                      }}
                      className="w-full bg-white border-2 border-[#C41E3A] text-[#C41E3A] py-3 rounded-lg font-semibold hover:bg-[#C41E3A] hover:text-white transition-colors cursor-pointer"
                    >
                      Half Tray • {selectedItem.halfTray}
                    </button>
                  )}
                  {selectedItem.fullTray && (
                    <button
                      onClick={() => {
                        const price = parseFloat(selectedItem.fullTray!.replace('$', ''));
                        handleOrderItem(price, `${selectedItem.name} (Full Tray)`);
                      }}
                      className="w-full bg-[#C41E3A] text-white py-3 rounded-lg font-semibold hover:bg-[#a01830] transition-colors cursor-pointer"
                    >
                      Full Tray • {selectedItem.fullTray}
                    </button>
                  )}
                  {selectedItem.perPiece && (
                    <button
                      onClick={() => {
                        const price = parseFloat(selectedItem.perPiece!.replace(/[^0-9.]/g, ''));
                        handleOrderItem(price, selectedItem.name);
                      }}
                      className="w-full bg-[#C41E3A] text-white py-3 rounded-lg font-semibold hover:bg-[#a01830] transition-colors cursor-pointer"
                    >
                      {selectedItem.perPiece}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleOrderItem()}
                  className="mt-4 block w-full bg-[#C41E3A] text-white text-center py-3 rounded-lg font-semibold hover:bg-[#a01830] transition-colors cursor-pointer"
                >
                  Add to Cart & Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
