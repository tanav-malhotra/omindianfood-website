"use client";

import { useState, useEffect, useRef } from "react";
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

type MenuType = "takeout" | "catering";

interface OmSpecialItem {
  name: string;
  description?: string;
}

interface OmSpecialMenu {
  appetizers: {
    chicken: OmSpecialItem[];
    lamb: OmSpecialItem[];
    vegetable: OmSpecialItem[];
  };
  soups: OmSpecialItem[];
  salad: OmSpecialItem[];
  entrees: {
    chicken: OmSpecialItem[];
    lamb: OmSpecialItem[];
    vegetable: OmSpecialItem[];
  };
}

interface MenuDisplayProps {
  dinnerCategories: Category[];
  barMenu: { category: string; items: { name: string; description?: string; price: string }[] }[];
  cateringMenu: { name: string; items: { name: string; description: string; halfTray?: string; fullTray?: string; perPiece?: string }[] }[];
  lunchMenu: {
    pricing: { veg: string; lamb: string };
    hours: string;
    includes: string;
    sections: { name: string; items: { name: string; description?: string }[] }[];
    happyHour: {
      wines: { name: string; description: string; price: string }[];
      beverages: { name: string; price: string }[];
      beers: { name: string; price: string }[];
      desserts: { name: string; description: string; price: string }[];
    };
  };
  omSpecialMenu?: OmSpecialMenu;
}

// Catering item type for modal
interface CateringItem {
  name: string;
  description: string;
  halfTray?: string;
  fullTray?: string;
  perPiece?: string;
}

export default function MenuDisplay({ dinnerCategories, barMenu, cateringMenu, lunchMenu, omSpecialMenu }: MenuDisplayProps) {
  const { addItem, items: cartItems } = useCart();
  const router = useRouter();
  const [menuType, setMenuType] = useState<MenuType>("takeout");
  const [activeSection, setActiveSection] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCateringItem, setSelectedCateringItem] = useState<CateringItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [imageError, setImageError] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [selectedCateringOption, setSelectedCateringOption] = useState<'half' | 'full' | 'piece' | null>(null);

  // Check if cart has catering items
  const hasCateringItems = cartItems.some(item => item.isCatering);

  // Get categories for current menu type
  const getCurrentCategories = () => {
    if (menuType === "takeout") {
      return [
        { id: "lunch-special", name: "Lunch Special (Dine-In)" },
        ...dinnerCategories.map(c => ({ id: c.id, name: c.name }))
      ];
    } else {
      return cateringMenu.map((cat, idx) => ({ id: `catering-${idx}`, name: cat.name }));
    }
  };

  // Handle adding item to cart
  const handleAddToCart = () => {
    if (!selectedItem) return;
    
    if (menuType === "takeout" && hasCateringItems) {
      alert("Take out items cannot be mixed with catering items. Please place separate orders.");
      return;
    }

    addItem({
      menuItemId: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity,
      note: note || '',
      isCatering: false
    });

    setSelectedItem(null);
    setQuantity(1);
    setNote("");
    router.push("/order");
  };

  // Handle adding catering item to cart
  const handleAddCateringToCart = () => {
    if (!selectedCateringItem || !selectedCateringOption) return;
    
    const hasTakeoutItems = cartItems.some(item => !item.isCatering);
    if (hasTakeoutItems) {
      alert("Catering items cannot be mixed with take out items. Please place separate orders.");
      return;
    }

    let price = 0;
    let itemName = selectedCateringItem.name;
    
    if (selectedCateringOption === 'half' && selectedCateringItem.halfTray) {
      price = parseFloat(selectedCateringItem.halfTray.replace('$', ''));
      itemName = `${selectedCateringItem.name} (Half Tray)`;
    } else if (selectedCateringOption === 'full' && selectedCateringItem.fullTray) {
      price = parseFloat(selectedCateringItem.fullTray.replace('$', ''));
      itemName = `${selectedCateringItem.name} (Full Tray)`;
    } else if (selectedCateringOption === 'piece' && selectedCateringItem.perPiece) {
      price = parseFloat(selectedCateringItem.perPiece.replace(/[^0-9.]/g, ''));
    }

    addItem({
      menuItemId: `catering-${selectedCateringItem.name}-${selectedCateringOption}-${Date.now()}`,
      name: itemName,
      price: price,
      quantity,
      note: note || '',
      isCatering: true
    });

    setSelectedCateringItem(null);
    setSelectedCateringOption(null);
    setQuantity(1);
    setNote("");
    router.push("/order?menu=catering");
  };

  // Reset image error when item changes
  useEffect(() => {
    if (selectedItem) {
      setImageError(false);
    }
  }, [selectedItem]);

  // Close modal on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedItem(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="space-y-6">
      {/* Menu Type Buttons */}
      <div className="flex justify-center gap-2 flex-wrap">
        <button
          onClick={() => setMenuType("takeout")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer ${
            menuType === "takeout"
              ? "bg-[#C41E3A] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Dine In / Take Out
        </button>
        <button
          onClick={() => setMenuType("catering")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer ${
            menuType === "catering"
              ? "bg-[#C41E3A] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Catering
        </button>
      </div>

      {/* Mobile Category Dropdown - moved here after menu type buttons */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileCategoryOpen(!mobileCategoryOpen)}
          className="w-full flex justify-between items-center bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-700 font-medium"
        >
          <span>Jump to Section</span>
          <svg className={`w-5 h-5 transition-transform ${mobileCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {mobileCategoryOpen && (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {getCurrentCategories().map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveSection(cat.id);
                  setMobileCategoryOpen(false);
                  document.getElementById(`section-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Sidebar + Content Layout */}
      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-56 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-[#1A1A1A] px-4 py-3">
              <h3 className="text-white font-semibold">Categories</h3>
            </div>
            <div className="p-2">
            {getCurrentCategories().map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveSection(cat.id);
                  document.getElementById(`section-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeSection === cat.id
                    ? 'bg-[#C41E3A] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
            </div>
          </div>
        </div>

        {/* Menu Content */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Take Out Menu */}
          {menuType === "takeout" && (
            <>
              {/* Lunch Special - Display Only */}
              <div id="section-lunch-special" className="scroll-mt-28">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
                  <div className="text-center mb-4">
                    <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                      🍽️ Dine-In Only
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900">LUNCH SPECIAL</h2>
                    <p className="text-gray-600 mt-1">{lunchMenu.hours}</p>
                    <div className="flex justify-center gap-4 mt-2">
                      <span className="text-lg font-semibold text-[#C41E3A]">Veg/Chicken: {lunchMenu.pricing.veg}</span>
                      <span className="text-lg font-semibold text-[#C41E3A]">Lamb/Seafood: {lunchMenu.pricing.lamb}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{lunchMenu.includes}</p>
                    <p className="text-sm text-[#C41E3A] mt-2 font-medium">
                      Add $1 for Garlic Naan, Onion Naan, or Plain Paratha
                    </p>
                  </div>
                  
                  <div className="bg-amber-100/50 rounded-xl p-4 mb-4">
                    <p className="text-center text-amber-800 text-sm">
                      <strong>Note:</strong> Lunch Special is available for dine-in customers only. 
                      Please visit us during lunch hours to enjoy this special!
                    </p>
                  </div>

                  {/* Lunch Special Items - Display Only */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {lunchMenu.sections.map((section, idx) => (
                      <div key={idx} className="bg-white/80 rounded-xl p-4">
                        <h3 className="font-bold text-gray-900 mb-3 text-center border-b pb-2">{section.name}</h3>
                        <ul className="space-y-2">
                          {section.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="text-sm">
                              <span className="font-medium text-gray-800">{item.name}</span>
                              {item.description && (
                                <p className="text-gray-500 text-xs">{item.description}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-center">
                    <a 
                      href="https://www.opentable.com/booking/restref/availability?rid=63796&lang=en-US&restRef=63796&partySize=2&otSource=Restaurant%20website"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#C41E3A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#a01830] transition-colors"
                    >
                      Make a Reservation
                    </a>
                  </div>
                </div>
              </div>

              {/* OM Special - Orderable */}
              {omSpecialMenu && (
                <div className="bg-[#C41E3A] text-white p-6 rounded-2xl">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold">OM SPECIAL</h2>
                    <p className="text-white/90 text-xl font-semibold">$18.95</p>
                    <p className="text-white/80 text-sm mt-1">
                      One Appetizer + One Entrée • Includes basmati rice, naan bread, raita & mango chutney
                    </p>
                    <p className="text-white/70 text-xs mt-1">
                      Add $1 for Garlic Naan, Onion Naan, or Plain Paratha
                    </p>
                  </div>
                  <div className="text-center">
                    <a 
                      href="/order"
                      className="inline-block bg-white text-[#C41E3A] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                    >
                      Build Your OM Special →
                    </a>
                  </div>
                </div>
              )}

              {/* Take Out Menu Categories */}
              {dinnerCategories.map(category => (
                <div key={category.id} id={`section-${category.id}`} className="scroll-mt-28">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-[#1A1A1A] px-6 py-4">
                      <h2 className="text-xl font-bold text-white">{category.name}</h2>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {category.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className="text-left p-4 rounded-xl border border-gray-200 hover:border-[#C41E3A] hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              {item.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                              )}
                            </div>
                            <span className="text-[#C41E3A] font-bold whitespace-nowrap">${item.price.toFixed(2)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Catering Menu */}
          {menuType === "catering" && (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-amber-800">
                  <strong>Note:</strong> Catering orders require 24 hours advance notice. 
                  Minimum order of $75 for delivery.
                </p>
              </div>

              {cateringMenu.map((category, catIdx) => (
                <div key={catIdx} id={`section-catering-${catIdx}`} className="scroll-mt-28">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-[#1A1A1A] px-6 py-4">
                      <h2 className="text-xl font-bold text-white">{category.name}</h2>
                    </div>
                    <div className="p-4 space-y-4">
                      {category.items.map((item, itemIdx) => (
                        <button
                          key={itemIdx}
                          onClick={() => {
                            setSelectedCateringItem(item);
                            setSelectedCateringOption(null);
                            setQuantity(1);
                            setNote("");
                          }}
                          className="w-full text-left bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.halfTray && (
                              <span className="bg-white border-2 border-[#C41E3A] text-[#C41E3A] px-4 py-2 rounded-lg font-medium text-sm">
                                Half Tray • {item.halfTray}
                              </span>
                            )}
                            {item.fullTray && (
                              <span className="bg-[#C41E3A] text-white px-4 py-2 rounded-lg font-medium text-sm">
                                Full Tray • {item.fullTray}
                              </span>
                            )}
                            {item.perPiece && (
                              <span className="bg-[#C41E3A] text-white px-4 py-2 rounded-lg font-medium text-sm">
                                {item.perPiece}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-center">
                <a 
                  href="/order"
                  className="inline-block bg-[#C41E3A] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#a01830] transition-colors"
                >
                  Order Catering →
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Item Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Header */}
            {selectedItem.image && !imageError ? (
              <div className="relative h-48">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <button 
                  onClick={() => setSelectedItem(null)} 
                  className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <h3 className="text-xl font-bold">{selectedItem.name}</h3>
                  <p className="text-[#C41E3A] font-bold text-lg mt-1">${selectedItem.price.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-6 text-white">
                <button 
                  onClick={() => setSelectedItem(null)} 
                  className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h3 className="text-xl font-bold pr-8">{selectedItem.name}</h3>
                <p className="text-[#C41E3A] font-bold text-lg mt-1">${selectedItem.price.toFixed(2)}</p>
              </div>
            )}
            
            <div className="p-6">
              {selectedItem.description && (
                <p className="text-gray-600 text-sm mb-6">{selectedItem.description}</p>
              )}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setQuantity(Math.max(0, quantity - 1))}
                      className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                    >−</button>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={quantity === 0 ? '' : quantity.toString()}
                      onFocus={(e) => {
                        if (quantity === 0) e.target.value = '';
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '' || parseInt(e.target.value, 10) === 0) {
                          setQuantity(0);
                        }
                      }}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        if (rawValue === '') {
                          setQuantity(0);
                        } else {
                          setQuantity(parseInt(rawValue, 10));
                        }
                      }}
                      placeholder="0"
                      className="w-20 h-12 text-2xl font-bold text-center bg-white border-2 border-gray-200 rounded-xl focus:border-[#C41E3A] focus:ring-0 outline-none"
                    />
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                    >+</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions</label>
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent text-sm resize-none"
                    rows={3}
                    placeholder="e.g. Extra spicy, no onions, allergies..."
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 pt-0">
              <button 
                onClick={handleAddToCart}
                disabled={quantity === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors shadow-lg ${
                  quantity === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#C41E3A] text-white hover:bg-[#a01830] cursor-pointer'
                }`}
              >
                Add to Order • ${(selectedItem.price * quantity).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catering Item Modal */}
      {selectedCateringItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedCateringItem(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-6 text-white">
              <button 
                onClick={() => setSelectedCateringItem(null)} 
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-xl font-bold pr-8">{selectedCateringItem.name}</h3>
              <p className="text-white/70 text-sm mt-1">Catering Item</p>
            </div>
            
            <div className="p-6">
              {selectedCateringItem.description && (
                <p className="text-gray-600 text-sm mb-6">{selectedCateringItem.description}</p>
              )}
              
              <div className="space-y-5">
                {/* Size Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Select Size</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCateringItem.halfTray && (
                      <button
                        onClick={() => setSelectedCateringOption('half')}
                        className={`px-4 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                          selectedCateringOption === 'half'
                            ? 'bg-[#C41E3A] text-white'
                            : 'bg-white border-2 border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white'
                        }`}
                      >
                        Half Tray • {selectedCateringItem.halfTray}
                      </button>
                    )}
                    {selectedCateringItem.fullTray && (
                      <button
                        onClick={() => setSelectedCateringOption('full')}
                        className={`px-4 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                          selectedCateringOption === 'full'
                            ? 'bg-[#C41E3A] text-white'
                            : 'bg-white border-2 border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white'
                        }`}
                      >
                        Full Tray • {selectedCateringItem.fullTray}
                      </button>
                    )}
                    {selectedCateringItem.perPiece && (
                      <button
                        onClick={() => setSelectedCateringOption('piece')}
                        className={`px-4 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                          selectedCateringOption === 'piece'
                            ? 'bg-[#C41E3A] text-white'
                            : 'bg-white border-2 border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white'
                        }`}
                      >
                        {selectedCateringItem.perPiece}
                      </button>
                    )}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setQuantity(Math.max(0, quantity - 1))}
                      className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                    >−</button>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={quantity === 0 ? '' : quantity.toString()}
                      onFocus={(e) => {
                        if (quantity === 0) e.target.value = '';
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '' || parseInt(e.target.value, 10) === 0) {
                          setQuantity(0);
                        }
                      }}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        if (rawValue === '') {
                          setQuantity(0);
                        } else {
                          setQuantity(parseInt(rawValue, 10));
                        }
                      }}
                      placeholder="0"
                      className="w-20 h-12 text-2xl font-bold text-center bg-white border-2 border-gray-200 rounded-xl focus:border-[#C41E3A] focus:ring-0 outline-none"
                    />
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                    >+</button>
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions</label>
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent text-sm resize-none"
                    rows={3}
                    placeholder="e.g. Extra spicy, no onions, allergies..."
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 pt-0">
              <button 
                onClick={handleAddCateringToCart}
                disabled={quantity === 0 || !selectedCateringOption}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors shadow-lg ${
                  quantity === 0 || !selectedCateringOption
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#C41E3A] text-white hover:bg-[#a01830] cursor-pointer'
                }`}
              >
                {!selectedCateringOption 
                  ? 'Select a size' 
                  : `Add to Order • $${(
                      (selectedCateringOption === 'half' && selectedCateringItem.halfTray 
                        ? parseFloat(selectedCateringItem.halfTray.replace('$', '')) 
                        : selectedCateringOption === 'full' && selectedCateringItem.fullTray 
                          ? parseFloat(selectedCateringItem.fullTray.replace('$', '')) 
                          : selectedCateringOption === 'piece' && selectedCateringItem.perPiece 
                            ? parseFloat(selectedCateringItem.perPiece.replace(/[^0-9.]/g, '')) 
                            : 0
                      ) * quantity
                    ).toFixed(2)}`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
