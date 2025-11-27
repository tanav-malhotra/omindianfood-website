"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
};

type Category = {
  id: string;
  name: string;
  items: MenuItem[];
};

type MenuType = "dinner" | "lunch" | "bar" | "catering";

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

// Extended item type for bar/catering items
type SelectedItemExtended = MenuItem & {
  itemType?: 'dinner' | 'bar' | 'catering';
  halfTray?: string;
  fullTray?: string;
  perPiece?: string;
};

export default function MenuDisplay({ dinnerCategories, barMenu, cateringMenu, lunchMenu }: MenuDisplayProps) {
  const [menuType, setMenuType] = useState<MenuType>("dinner");
  const [selectedItem, setSelectedItem] = useState<SelectedItemExtended | null>(null);
  const { addItem } = useCart();
  const router = useRouter();

  // Lunch special builder state
  const [lunchSpecialAppetizer, setLunchSpecialAppetizer] = useState<string | null>(null);
  const [lunchSpecialMain, setLunchSpecialMain] = useState<string | null>(null);
  const [lunchSpecialMainType, setLunchSpecialMainType] = useState<'veg' | 'lamb'>('veg');
  const [lunchBreadUpgrade, setLunchBreadUpgrade] = useState<'garlic' | 'onion' | 'paratha' | null>(null);

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

  // Add lunch special to cart and go to order page
  const handleAddLunchSpecial = () => {
    if (lunchSpecialAppetizer && lunchSpecialMain) {
      const basePrice = lunchSpecialMainType === 'lamb' ? 18.95 : 17.95;
      const upgradePrice = lunchBreadUpgrade ? 1 : 0;
      const totalPrice = basePrice + upgradePrice;
      const breadText = lunchBreadUpgrade 
        ? (lunchBreadUpgrade === 'garlic' ? 'garlic naan' : lunchBreadUpgrade === 'onion' ? 'onion naan' : 'plain paratha')
        : 'naan';
      
      addItem({
        menuItemId: `lunch-special-${Date.now()}`,
        name: `Lunch Special`,
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
    { id: "lunch", label: "Lunch" },
    { id: "dinner", label: "Dinner" },
    { id: "bar", label: "Bar" },
    { id: "catering", label: "Catering" },
  ];

  return (
    <>
      {/* Menu Type Buttons */}
      <div className="flex justify-center gap-2 sm:gap-4 mb-12 flex-wrap">
        {menuTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setMenuType(type.id)}
            className={`px-6 sm:px-8 py-3 rounded font-semibold text-sm sm:text-base transition-all ${
              menuType === type.id
                ? "bg-[#C41E3A] text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 shadow border border-gray-200"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Dinner Menu */}
      {menuType === "dinner" && (
        <div className="space-y-12">
          {dinnerCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
      )}

      {/* Lunch Menu */}
      {menuType === "lunch" && (
        <div className="space-y-8">
          {/* Lunch Special Header */}
          <div className="bg-[#C41E3A] text-white p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-2 text-center">BUILD YOUR LUNCH SPECIAL</h2>
            <p className="text-white/90 mb-4 text-center">{lunchMenu.hours}</p>
            
            {/* Pricing - clickable to select type */}
            <div className="flex justify-center gap-6 flex-wrap mb-4">
              <button
                onClick={() => setLunchSpecialMainType('veg')}
                className={`px-6 py-3 rounded-lg text-center transition-all cursor-pointer ${
                  lunchSpecialMainType === 'veg' ? 'bg-white text-[#C41E3A]' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <span className="font-bold text-xl">{lunchMenu.pricing.veg}</span>
                <p className="text-sm mt-1">Veg or Chicken</p>
              </button>
              <button
                onClick={() => setLunchSpecialMainType('lamb')}
                className={`px-6 py-3 rounded-lg text-center transition-all cursor-pointer ${
                  lunchSpecialMainType === 'lamb' ? 'bg-white text-[#C41E3A]' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <span className="font-bold text-xl">{lunchMenu.pricing.lamb}</span>
                <p className="text-sm mt-1">Lamb or Seafood</p>
              </button>
            </div>

            {/* How it works */}
            <div className="bg-white/10 rounded-lg p-4 mt-4">
              <p className="text-sm text-center text-white/90">
                Choose <span className="font-bold">1 Appetizer</span> + <span className="font-bold">1 Main Course</span> below
              </p>
              <p className="text-sm text-center text-white/80 mt-2">{lunchMenu.includes}</p>
            </div>
          </div>

          {/* Selection Summary - Sticky */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-20 z-20 border-2 border-[#C41E3A]">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-grow">
                  <p className="text-sm text-gray-500 mb-2">Your Lunch Special:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${lunchSpecialAppetizer ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {lunchSpecialAppetizer ? `✓ ${lunchSpecialAppetizer}` : '① Pick Appetizer'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${lunchSpecialMain ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {lunchSpecialMain ? `✓ ${lunchSpecialMain}` : '② Pick Main Course'}
                    </span>
                    {lunchBreadUpgrade && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                        +$1 {lunchBreadUpgrade === 'garlic' ? 'Garlic Naan' : lunchBreadUpgrade === 'onion' ? 'Onion Naan' : 'Plain Paratha'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {(lunchSpecialAppetizer || lunchSpecialMain || lunchBreadUpgrade) && (
                    <button
                      onClick={() => {
                        setLunchSpecialAppetizer(null);
                        setLunchSpecialMain(null);
                        setLunchSpecialMainType('veg');
                        setLunchBreadUpgrade(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 text-sm underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddLunchSpecial}
                    disabled={!lunchSpecialAppetizer || !lunchSpecialMain}
                    className={`px-6 py-3 rounded-xl font-bold transition-all cursor-pointer ${
                      lunchSpecialAppetizer && lunchSpecialMain
                        ? 'bg-[#C41E3A] text-white hover:bg-[#a01830] shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Add to Cart & Order • ${((lunchSpecialMainType === 'lamb' ? 18.95 : 17.95) + (lunchBreadUpgrade ? 1 : 0)).toFixed(2)}
                  </button>
                </div>
              </div>

              {/* Bread Upgrade Options */}
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600 mb-2">Bread upgrade (+$1):</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setLunchBreadUpgrade(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      !lunchBreadUpgrade ? 'bg-[#C41E3A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Regular Naan
                  </button>
                  <button
                    onClick={() => setLunchBreadUpgrade('garlic')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      lunchBreadUpgrade === 'garlic' ? 'bg-[#C41E3A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Garlic Naan +$1
                  </button>
                  <button
                    onClick={() => setLunchBreadUpgrade('onion')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      lunchBreadUpgrade === 'onion' ? 'bg-[#C41E3A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Onion Naan +$1
                  </button>
                  <button
                    onClick={() => setLunchBreadUpgrade('paratha')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      lunchBreadUpgrade === 'paratha' ? 'bg-[#C41E3A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Plain Paratha +$1
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Appetizers Section */}
          {lunchMenu.sections.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-[#1A1A1A] px-6 py-4">
                <h2 className="text-xl font-bold text-white">{lunchMenu.sections[0].name}</h2>
                <p className="text-white/70 text-sm">Click to select your appetizer</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lunchMenu.sections[0].items.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      onClick={() => setLunchSpecialAppetizer(item.name)}
                      className={`text-left p-4 rounded-xl transition-all cursor-pointer ${
                        lunchSpecialAppetizer === item.name
                          ? 'bg-[#C41E3A] text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {lunchSpecialAppetizer === item.name && (
                          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <h3 className={`font-semibold ${lunchSpecialAppetizer === item.name ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </h3>
                      </div>
                      {item.description && (
                        <p className={`text-sm mt-1 ${lunchSpecialAppetizer === item.name ? 'text-white/80' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Veg & Chicken Main Courses */}
          {lunchMenu.sections.length > 1 && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-[#1A1A1A] px-6 py-4">
                <h2 className="text-xl font-bold text-white">{lunchMenu.sections[1].name}</h2>
                <p className="text-white/70 text-sm">Click to select your main course • {lunchMenu.pricing.veg}</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lunchMenu.sections[1].items.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      onClick={() => {
                        setLunchSpecialMain(item.name);
                        setLunchSpecialMainType('veg');
                      }}
                      className={`text-left p-4 rounded-xl transition-all cursor-pointer ${
                        lunchSpecialMain === item.name && lunchSpecialMainType === 'veg'
                          ? 'bg-[#C41E3A] text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {lunchSpecialMain === item.name && lunchSpecialMainType === 'veg' && (
                          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <h3 className={`font-semibold ${lunchSpecialMain === item.name && lunchSpecialMainType === 'veg' ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </h3>
                      </div>
                      {item.description && (
                        <p className={`text-sm mt-1 ${lunchSpecialMain === item.name && lunchSpecialMainType === 'veg' ? 'text-white/80' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lamb & Seafood Main Courses */}
          {lunchMenu.sections.length > 2 && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-[#1A1A1A] px-6 py-4">
                <h2 className="text-xl font-bold text-white">{lunchMenu.sections[2].name}</h2>
                <p className="text-white/70 text-sm">Click to select your main course • {lunchMenu.pricing.lamb}</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lunchMenu.sections[2].items.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      onClick={() => {
                        setLunchSpecialMain(item.name);
                        setLunchSpecialMainType('lamb');
                      }}
                      className={`text-left p-4 rounded-xl transition-all cursor-pointer ${
                        lunchSpecialMain === item.name && lunchSpecialMainType === 'lamb'
                          ? 'bg-[#C41E3A] text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {lunchSpecialMain === item.name && lunchSpecialMainType === 'lamb' && (
                          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <h3 className={`font-semibold ${lunchSpecialMain === item.name && lunchSpecialMainType === 'lamb' ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </h3>
                      </div>
                      {item.description && (
                        <p className={`text-sm mt-1 ${lunchSpecialMain === item.name && lunchSpecialMainType === 'lamb' ? 'text-white/80' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Happy Hour Section */}
          <div className="bg-[#1A1A1A] text-white p-6 rounded-2xl text-center mb-6">
            <h2 className="text-2xl font-bold">LUNCHTIME HAPPY HOUR</h2>
            <p className="text-white/70 mt-2">Click any item to add to your order</p>
          </div>

          {/* Wines */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-[#1A1A1A] px-6 py-4">
              <h2 className="text-xl font-bold text-white">Wines</h2>
            </div>
            <div className="p-6 space-y-4">
              {lunchMenu.happyHour.wines.map((wine, idx) => {
                const priceNum = parseFloat(wine.price.replace('$', ''));
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedItem({
                      id: `lunch-wine-${idx}`,
                      name: wine.name,
                      description: wine.description || null,
                      price: priceNum,
                      image: null,
                      itemType: 'bar'
                    })}
                    className="w-full flex justify-between items-start gap-4 py-2 border-b border-gray-100 last:border-0 text-left hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">{wine.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">{wine.description}</p>
                    </div>
                    <span className="text-[#C41E3A] font-bold">{wine.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Beverages */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-[#1A1A1A] px-6 py-4">
              <h2 className="text-xl font-bold text-white">Non-Alcoholic Beverages</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {lunchMenu.happyHour.beverages.map((bev, idx) => {
                  const priceNum = parseFloat(bev.price.replace('$', ''));
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedItem({
                        id: `lunch-bev-${idx}`,
                        name: bev.name,
                        description: null,
                        price: priceNum,
                        image: null,
                        itemType: 'bar'
                      })}
                      className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <span className="font-medium text-gray-900">{bev.name}</span>
                      <span className="text-[#C41E3A] font-bold">{bev.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Beers */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-[#1A1A1A] px-6 py-4">
              <h2 className="text-xl font-bold text-white">Beers</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {lunchMenu.happyHour.beers.map((beer, idx) => {
                  const priceNum = parseFloat(beer.price.replace('$', ''));
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedItem({
                        id: `lunch-beer-${idx}`,
                        name: beer.name,
                        description: null,
                        price: priceNum,
                        image: null,
                        itemType: 'bar'
                      })}
                      className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <span className="font-medium text-gray-900">{beer.name}</span>
                      <span className="text-[#C41E3A] font-bold">{beer.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desserts */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-[#1A1A1A] px-6 py-4">
              <h2 className="text-xl font-bold text-white">Desserts</h2>
            </div>
            <div className="p-6 space-y-4">
              {lunchMenu.happyHour.desserts.map((dessert, idx) => {
                const priceNum = parseFloat(dessert.price.replace('$', ''));
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedItem({
                      id: `lunch-dessert-${idx}`,
                      name: dessert.name,
                      description: dessert.description || null,
                      price: priceNum,
                      image: null,
                      itemType: 'bar'
                    })}
                    className="w-full flex justify-between items-start gap-4 py-2 border-b border-gray-100 last:border-0 text-left hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">{dessert.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">{dessert.description}</p>
                    </div>
                    <span className="text-[#C41E3A] font-bold">{dessert.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm italic">
            Please speak to our staff regarding food allergies/intolerances before ordering
          </p>
        </div>
      )}

      {/* Bar Menu */}
      {menuType === "bar" && (
        <div className="space-y-12">
          <div className="bg-[#1A1A1A] text-white p-4 rounded-xl text-center">
            <p className="text-sm">Must be 21+ to consume alcohol. Valid ID required.</p>
          </div>
          {barMenu.map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-[#1A1A1A] px-6 py-4">
                <h2 className="text-xl font-bold text-white">{section.category}</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {section.items.map((item, itemIdx) => {
                    const priceNum = parseFloat(item.price.replace('$', ''));
                    return (
                      <button
                        key={itemIdx}
                        onClick={() => setSelectedItem({
                          id: `bar-${idx}-${itemIdx}`,
                          name: item.name,
                          description: item.description || null,
                          price: priceNum,
                          image: null,
                          itemType: 'bar'
                        })}
                        className="w-full flex justify-between items-start gap-4 py-3 border-b border-gray-100 last:border-0 text-left hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex-grow">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          {item.description && (
                            <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                          )}
                        </div>
                        <span className="text-[#C41E3A] font-bold whitespace-nowrap">{item.price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Catering Menu */}
      {menuType === "catering" && (
        <div className="space-y-12">
          <div className="bg-[#C41E3A] text-white p-6 rounded-2xl text-center mb-8">
            <h2 className="text-xl font-bold mb-2">Catering Services</h2>
            <p className="text-lg font-semibold">$75 Delivery Minimum • Serves 15-35 guests</p>
            <p className="mt-2 text-white/90">Click any item to add to your order, or call (212) 628-4500</p>
          </div>
          {cateringMenu.map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
          ))}
          <p className="text-center text-gray-500 text-sm italic">
            Catering orders require 24-48 hours advance notice
          </p>
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
