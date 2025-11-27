"use client";
import { useState, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

interface OrderInterfaceProps {
  dinnerCategories: Category[];
  lunchMenu: LunchMenu;
  barMenu: BarMenuItem[];
  cateringMenu: CateringCategory[];
}

export default function OrderInterface({ dinnerCategories, lunchMenu, barMenu, cateringMenu }: OrderInterfaceProps) {
  const { items, addItem, removeItem, updateItem, total, clearCart } = useCart();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isCheckout, setIsCheckout] = useState(false);
  const [menuType, setMenuType] = useState<MenuType>('dinner');
  const [activeCategory, setActiveCategory] = useState(dinnerCategories[0]?.id || '');
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  
  // Lunch Special Builder State
  const [lunchSpecialAppetizer, setLunchSpecialAppetizer] = useState<string | null>(null);
  const [lunchSpecialMain, setLunchSpecialMain] = useState<string | null>(null);
  const [lunchSpecialMainType, setLunchSpecialMainType] = useState<'veg' | 'lamb'>('veg'); // veg/chicken = $17.95, lamb/seafood = $18.95
  const [lunchBreadUpgrade, setLunchBreadUpgrade] = useState<string | null>(null); // null = regular naan, or 'garlic' | 'onion' | 'paratha' for +$1
  
  // Touch/swipe state for mobile cart drawer
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  
  const handleDrawerTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchEndY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isSwiping.current = false;
  };
  
  const handleDrawerTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;
    const swipeDistance = Math.abs(touchStartY.current - touchEndY.current);
    
    // If we've moved more than 10px vertically, consider it a swipe and prevent scroll
    if (swipeDistance > 10) {
      isSwiping.current = true;
      e.preventDefault();
    }
  };
  
  const handleDrawerTouchEnd = () => {
    const swipeDistance = touchStartY.current - touchEndY.current;
    const swipeThreshold = 50;
    const swipeTime = Date.now() - touchStartTime.current;
    
    // Only trigger swipe if it was a quick gesture (under 300ms) and moved enough distance
    if (swipeTime < 400 && Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        setMobileCartOpen(true);
      } else {
        setMobileCartOpen(false);
      }
    }
    isSwiping.current = false;
  };
  
  // Check if lunch special is currently available (12:00 PM - 2:45 PM US Eastern Time)
  const isLunchTime = () => {
    // Get current time in US Eastern timezone
    const now = new Date();
    const easternTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const hours = easternTime.getHours();
    const minutes = easternTime.getMinutes();
    const currentTime = hours * 60 + minutes; // Convert to minutes since midnight
    const lunchStart = 12 * 60; // 12:00 PM = 720 minutes
    const lunchEnd = 14 * 60 + 45; // 2:45 PM = 885 minutes
    return currentTime >= lunchStart && currentTime <= lunchEnd;
  };
  
  const lunchAvailable = isLunchTime();
  
  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryApt, setDeliveryApt] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryZip, setDeliveryZip] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Payment State
  const [tipPercent, setTipPercent] = useState<number | 'custom'>(0);
  const [customTip, setCustomTip] = useState('');
  const [customTipType, setCustomTipType] = useState<'$' | '%'>('$'); // $ or %
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardZip, setCardZip] = useState('');
  const [paymentError, setPaymentError] = useState('');
  
  // NY Sales Tax Rate (8.875%)
  const TAX_RATE = 0.08875;
  const subtotal = total;
  const taxAmount = subtotal * TAX_RATE;
  const tipAmount = tipPercent === 'custom' 
    ? (customTipType === '$' 
        ? parseFloat(customTip) || 0 
        : subtotal * ((parseFloat(customTip) || 0) / 100))
    : subtotal * (tipPercent / 100);
  const grandTotal = subtotal + taxAmount + tipAmount;
  
  const router = useRouter();

  const menuTypes: { id: MenuType; label: string }[] = [
    { id: "lunch", label: "Lunch" },
    { id: "dinner", label: "Dinner" },
    { id: "bar", label: "Bar" },
    { id: "catering", label: "Catering" },
  ];

  // Get categories based on menu type
  const getCurrentCategories = () => {
    switch (menuType) {
      case 'dinner':
        return dinnerCategories.map(c => ({ id: c.id, name: c.name }));
      case 'lunch':
        return [
          { id: 'lunch-appetizers', name: 'Appetizers' },
          { id: 'lunch-veg-chicken', name: 'Veg & Chicken' },
          { id: 'lunch-lamb-seafood', name: 'Lamb & Seafood' },
        ];
      case 'bar':
        return barMenu.map((s, i) => ({ id: `bar-${i}`, name: s.category }));
      case 'catering':
        return cateringMenu.map((s, i) => ({ id: `catering-${i}`, name: s.name }));
      default:
        return [];
    }
  };

  const handleAddToOrderClick = (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setNote('');
  };

  const confirmAddItem = () => {
    if (!selectedItem) return;
    addItem({
      menuItemId: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity,
      note
    });
    setSelectedItem(null);
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  // Format expiry as MM/YY
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    // Validate card details
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length < 15) {
      setPaymentError('Please enter a valid card number');
      return;
    }
    
    const [expMonth, expYear] = cardExpiry.split('/');
    if (!expMonth || !expYear || expMonth.length !== 2 || expYear.length !== 2) {
      setPaymentError('Please enter a valid expiry date (MM/YY)');
      return;
    }
    
    if (cardCvv.length < 3) {
      setPaymentError('Please enter a valid CVV');
      return;
    }
    
    if (cardZip.length < 5) {
      setPaymentError('Please enter a valid ZIP code');
      return;
    }

    setIsSubmitting(true);
    setPaymentError('');
    
    try {
      // Create a simple token (in production, Toast's JS SDK would handle this securely)
      const cardToken = btoa(JSON.stringify({
        number: cleanCardNumber,
        expMonth,
        expYear: '20' + expYear,
        cvv: cardCvv,
        zip: cardZip
      }));

      const orderData = {
        customerName,
        customerPhone,
        type: orderType,
        notes: orderNote,
        items: items.map(i => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          note: i.note
        })),
        subtotal,
        tax: taxAmount,
        tip: tipAmount,
        total: grandTotal,
        cardToken,
        deliveryAddress: orderType === 'DELIVERY' ? {
          street: deliveryAddress,
          apt: deliveryApt,
          city: deliveryCity,
          zip: deliveryZip
        } : undefined
      };

      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }
      
      clearCart();
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setCardZip('');
      setTipPercent(0);
      setCustomTip('');
      
      alert(`Order placed successfully! Your order #${data.orderId.slice(0,8).toUpperCase()} is being prepared.\n\n${orderType === 'PICKUP' ? 'We\'ll have it ready for pickup shortly!' : 'It will be delivered to your address soon!'}`);
      router.push('/');
    } catch (err) {
      console.error(err);
      setPaymentError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Checkout View
  if (isCheckout) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button 
          onClick={() => setIsCheckout(false)} 
          className="mb-6 text-[#C41E3A] font-medium hover:underline flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Menu
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-[#1A1A1A] text-white p-6">
            <h1 className="text-2xl font-bold">Complete Your Order</h1>
            <p className="text-gray-400 mt-1">Secure online payment</p>
          </div>

          <div className="p-6">
            {/* Order Type Toggle */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Order Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('PICKUP')}
                  className={`py-4 px-4 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-3 cursor-pointer ${
                    orderType === 'PICKUP' 
                      ? 'border-[#C41E3A] bg-red-50 text-[#C41E3A]' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('DELIVERY')}
                  className={`py-4 px-4 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-3 cursor-pointer ${
                    orderType === 'DELIVERY' 
                      ? 'border-[#C41E3A] bg-red-50 text-[#C41E3A]' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  Delivery
                </button>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-5">
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input 
                    required 
                    type="text" 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input 
                    required 
                    type="tel" 
                    value={customerPhone} 
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent transition-all"
                    placeholder="(212) 555-1234"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              {orderType === 'DELIVERY' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-800">Delivery Address</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                    <input 
                      required 
                      type="text" 
                      value={deliveryAddress} 
                      onChange={e => setDeliveryAddress(e.target.value)}
                      className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apt/Suite/Floor</label>
                      <input 
                        type="text" 
                        value={deliveryApt} 
                        onChange={e => setDeliveryApt(e.target.value)}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
                        placeholder="Apt 4B, Floor 2, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City/Neighborhood *</label>
                      <input 
                        required 
                        type="text" 
                        value={deliveryCity} 
                        onChange={e => setDeliveryCity(e.target.value)}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
                        placeholder="Upper East Side"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <div className="w-full bg-gray-100 text-gray-700 border border-gray-300 rounded-lg px-4 py-3 cursor-not-allowed">
                        New York
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                      <input 
                        required 
                        type="text" 
                        inputMode="numeric"
                        value={deliveryZip} 
                        onChange={e => setDeliveryZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        maxLength={5}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
                        placeholder="10028"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    We deliver to Manhattan&apos;s Upper East Side and surrounding areas. Call us at (212) 628-4500 to confirm delivery availability.
                  </p>
                </div>
              )}

              {/* Order Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
                <textarea 
                  value={orderNote} 
                  onChange={e => setOrderNote(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
                  placeholder="Any special instructions for your order..."
                  rows={2}
                />
              </div>

              {/* Order Summary */}
              <div className="border-t pt-5 mt-6">
                <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-100">
                      <div>
                        <span className="font-medium">{item.quantity}x {item.name}</span>
                        {item.note && <p className="text-gray-500 text-xs mt-0.5">"{item.note}"</p>}
                      </div>
                      <span className="text-gray-700">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                {/* Subtotal, Tax, Tip */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (8.875%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tip</span>
                    <span>${tipAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between font-bold text-lg pt-4 mt-2 border-t">
                  <span>Total</span>
                  <span className="text-[#C41E3A]">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Tip Selection */}
              <div className="border-t pt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Add a Tip</label>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 10, 15, 20].map(percent => (
                    <button
                      key={percent}
                      type="button"
                      onClick={() => { setTipPercent(percent); setCustomTip(''); }}
                      className={`py-3 px-2 rounded-lg border-2 font-medium text-sm transition-all cursor-pointer ${
                        tipPercent === percent
                          ? 'border-[#C41E3A] bg-red-50 text-[#C41E3A]' 
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {percent === 0 ? 'No Tip' : `${percent}%`}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTipPercent('custom')}
                    className={`py-3 px-2 rounded-lg border-2 font-medium text-sm transition-all cursor-pointer ${
                      tipPercent === 'custom'
                        ? 'border-[#C41E3A] bg-red-50 text-[#C41E3A]' 
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    Custom
                  </button>
                </div>
                {tipPercent === 'custom' && (
                  <div className="mt-3">
                    <div className="flex gap-2">
                      {/* $ or % toggle */}
                      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setCustomTipType('$')}
                          className={`px-4 py-3 font-medium transition-colors ${
                            customTipType === '$'
                              ? 'bg-[#C41E3A] text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          $
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomTipType('%')}
                          className={`px-4 py-3 font-medium transition-colors ${
                            customTipType === '%'
                              ? 'bg-[#C41E3A] text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          %
                        </button>
                      </div>
                      {/* Input field */}
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="0"
                          step={customTipType === '$' ? '0.01' : '1'}
                          value={customTip}
                          onChange={e => setCustomTip(e.target.value)}
                          className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
                          placeholder={customTipType === '$' ? '0.00' : '0'}
                        />
                        {customTip && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                            {customTipType === '%' ? `= $${(subtotal * (parseFloat(customTip) / 100)).toFixed(2)}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Payment Information */}
              <div className="border-t pt-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Payment Details
                </h3>
                
                {paymentError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {paymentError}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                    <input 
                      required 
                      type="text" 
                      inputMode="numeric"
                      value={cardNumber} 
                      onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent transition-all"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry *</label>
                      <input 
                        required 
                        type="text" 
                        inputMode="numeric"
                        value={cardExpiry} 
                        onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                      <input 
                        required 
                        type="text" 
                        inputMode="numeric"
                        value={cardCvv} 
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
                        placeholder="123"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP *</label>
                      <input 
                        required 
                        type="text" 
                        inputMode="numeric"
                        value={cardZip} 
                        onChange={e => setCardZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        maxLength={5}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
                        placeholder="10028"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Your payment information is secure and encrypted
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#C41E3A] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#a01830] transition-colors disabled:opacity-50 shadow-lg cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing Payment...
                  </span>
                ) : (
                  `Pay $${grandTotal.toFixed(2)}`
                )}
              </button>
              
              <div className="flex items-center justify-center gap-4 pt-2">
                <img src="https://cdn.jsdelivr.net/gh/atomi):labs/cryptocurrency-icons@master/svg/color/visa.svg" alt="Visa" className="h-6 opacity-60" onError={(e) => e.currentTarget.style.display = 'none'} />
                <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/svg/color/mastercard.svg" alt="Mastercard" className="h-6 opacity-60" onError={(e) => e.currentTarget.style.display = 'none'} />
                <span className="text-xs text-gray-400">Visa • Mastercard • Amex • Discover</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main Order View
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      {/* Menu Type Buttons - Centered, compact on mobile */}
      <div className="flex justify-center gap-1.5 sm:gap-4 mb-8">
        {menuTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              setMenuType(type.id);
              setActiveCategory('');
            }}
            className={`px-3 sm:px-8 py-2.5 sm:py-3 rounded font-semibold text-xs sm:text-base transition-all cursor-pointer ${
              menuType === type.id
                ? "bg-[#C41E3A] text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 shadow border border-gray-200"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Category Sidebar - Desktop Only */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-[#1A1A1A] px-4 py-3">
              <h3 className="text-white font-semibold">Categories</h3>
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {getCurrentCategories().map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeCategory === cat.id
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

        {/* Menu Items Section */}
        <div className="flex-1 min-w-0">
          {/* Dinner Menu */}
          {menuType === 'dinner' && (
            <div className="space-y-8">
              {dinnerCategories.map(category => (
                <div key={category.id} id={`cat-${category.id}`} className="scroll-mt-24">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-[#1A1A1A] px-6 py-4">
                      <h2 className="text-xl font-bold text-white">{category.name}</h2>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.items.map(item => (
                          <div 
                            key={item.id} 
                            className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all cursor-pointer group"
                            onClick={() => handleAddToOrderClick(item)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-grow pr-4">
                                <h3 className="font-semibold text-gray-900 group-hover:text-[#C41E3A] transition-colors">
                                  {item.name}
                                </h3>
                                {item.description && (
                                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                                )}
                                <p className="text-[#C41E3A] font-bold mt-2">${item.price.toFixed(2)}</p>
                              </div>
                              <button 
                                className="flex-shrink-0 w-10 h-10 bg-[#C41E3A] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#a01830] transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToOrderClick(item);
                                }}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lunch Menu */}
          {menuType === 'lunch' && (
            <div className="space-y-6">
              {/* Lunch Special Header */}
              <div className={`${lunchAvailable ? 'bg-[#C41E3A]' : 'bg-gray-500'} text-white p-6 rounded-2xl`}>
                <h2 className="text-2xl font-bold mb-2 text-center">
                  {lunchAvailable ? 'BUILD YOUR LUNCH SPECIAL' : 'LUNCH SPECIAL'}
                </h2>
                <p className="text-white/90 mb-4 text-center">{lunchMenu.hours}</p>
                
                {!lunchAvailable && (
                  <div className="bg-white/20 rounded-lg p-4 mb-4 text-center">
                    <p className="font-semibold text-lg">⏰ Currently Unavailable</p>
                    <p className="text-sm text-white/80 mt-1">
                      Lunch special can only be ordered between 12:00 PM - 2:45 PM
                    </p>
                  </div>
                )}
                
                <div className="flex justify-center gap-6 flex-wrap mb-4">
                  <div className={`px-6 py-3 rounded-lg text-center transition-all ${lunchSpecialMainType === 'veg' ? 'bg-white text-[#C41E3A]' : 'bg-white/20'}`}>
                    <span className="font-bold text-xl">{lunchMenu.pricing.veg}</span>
                    <p className="text-sm mt-1">Veg or Chicken</p>
                  </div>
                  <div className={`px-6 py-3 rounded-lg text-center transition-all ${lunchSpecialMainType === 'lamb' ? 'bg-white text-[#C41E3A]' : 'bg-white/20'}`}>
                    <span className="font-bold text-xl">{lunchMenu.pricing.lamb}</span>
                    <p className="text-sm mt-1">Lamb or Seafood</p>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-4 mt-4">
                  <p className="text-sm text-center text-white/90">
                    Pick <span className="font-bold">1 Appetizer</span> + <span className="font-bold">1 Main Course</span>
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
                        onClick={() => {
                          if (lunchAvailable && lunchSpecialAppetizer && lunchSpecialMain) {
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
                            setLunchSpecialAppetizer(null);
                            setLunchSpecialMain(null);
                            setLunchSpecialMainType('veg');
                            setLunchBreadUpgrade(null);
                          }
                        }}
                        disabled={!lunchAvailable || !lunchSpecialAppetizer || !lunchSpecialMain}
                        className={`px-6 py-3 rounded-xl font-bold transition-all cursor-pointer ${
                          lunchAvailable && lunchSpecialAppetizer && lunchSpecialMain
                            ? 'bg-[#C41E3A] text-white hover:bg-[#a01830] shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {lunchAvailable 
                          ? `Add to Cart • $${((lunchSpecialMainType === 'lamb' ? 18.95 : 17.95) + (lunchBreadUpgrade ? 1 : 0)).toFixed(2)}`
                          : 'Not Available Now'
                        }
                      </button>
                    </div>
                  </div>
                  
                  {/* Bread Upgrade Option */}
                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-600 mb-2">Bread option (included: regular naan)</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setLunchBreadUpgrade(null)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer select-none active:scale-[0.98] ${
                          !lunchBreadUpgrade 
                            ? 'bg-[#C41E3A] text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                        }`}
                      >
                        Regular Naan
                      </button>
                      <button
                        type="button"
                        onClick={() => setLunchBreadUpgrade('garlic')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer select-none active:scale-[0.98] ${
                          lunchBreadUpgrade === 'garlic' 
                            ? 'bg-[#C41E3A] text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                        }`}
                      >
                        Garlic Naan +$1
                      </button>
                      <button
                        type="button"
                        onClick={() => setLunchBreadUpgrade('onion')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer select-none active:scale-[0.98] ${
                          lunchBreadUpgrade === 'onion' 
                            ? 'bg-[#C41E3A] text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                        }`}
                      >
                        Onion Naan +$1
                      </button>
                      <button
                        type="button"
                        onClick={() => setLunchBreadUpgrade('paratha')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer select-none active:scale-[0.98] ${
                          lunchBreadUpgrade === 'paratha' 
                            ? 'bg-[#C41E3A] text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                        }`}
                      >
                        Plain Paratha +$1
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appetizers Section */}
              <div id="cat-lunch-appetizers" className="bg-white rounded-2xl shadow-lg overflow-hidden scroll-mt-48">
                <div className="bg-[#1A1A1A] px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Step 1: Choose Your Appetizer</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lunchMenu.sections[0]?.items.map((item, itemIdx) => (
                      <button
                        key={itemIdx}
                        type="button"
                        onClick={() => setLunchSpecialAppetizer(item.name)}
                        className={`text-left p-4 rounded-xl transition-all cursor-pointer active:scale-[0.98] select-none ${
                          lunchSpecialAppetizer === item.name
                            ? 'bg-[#C41E3A] text-white shadow-lg'
                            : 'bg-gray-50 hover:bg-gray-100 active:bg-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 pointer-events-none">
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
                          <p className={`text-sm mt-1 pointer-events-none ${lunchSpecialAppetizer === item.name ? 'text-white/80' : 'text-gray-500'}`}>
                            {item.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Courses - Veg & Chicken */}
              <div id="cat-lunch-veg-chicken" className="bg-white rounded-2xl shadow-lg overflow-hidden scroll-mt-48">
                <div className="bg-[#1A1A1A] px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Step 2: Choose Your Main Course</h2>
                  <p className="text-white/70 text-sm">Veg & Chicken options • {lunchMenu.pricing.veg}</p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lunchMenu.sections[1]?.items.map((item, itemIdx) => (
                      <button
                        key={`veg-${itemIdx}`}
                        type="button"
                        onClick={() => {
                          setLunchSpecialMain(item.name);
                          setLunchSpecialMainType('veg');
                        }}
                        className={`text-left p-4 rounded-xl transition-all cursor-pointer active:scale-[0.98] select-none ${
                          lunchSpecialMain === item.name && lunchSpecialMainType === 'veg'
                            ? 'bg-[#C41E3A] text-white shadow-lg'
                            : 'bg-gray-50 hover:bg-gray-100 active:bg-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 pointer-events-none">
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
                          <p className={`text-sm mt-1 pointer-events-none ${lunchSpecialMain === item.name && lunchSpecialMainType === 'veg' ? 'text-white/80' : 'text-gray-500'}`}>
                            {item.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Courses - Lamb & Seafood */}
              <div id="cat-lunch-lamb-seafood" className="bg-white rounded-2xl shadow-lg overflow-hidden scroll-mt-48">
                <div className="bg-[#1A1A1A] px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Or Choose Lamb & Seafood</h2>
                  <p className="text-white/70 text-sm">Premium options • {lunchMenu.pricing.lamb}</p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lunchMenu.sections[2]?.items.map((item, itemIdx) => (
                      <button
                        key={`lamb-${itemIdx}`}
                        type="button"
                        onClick={() => {
                          setLunchSpecialMain(item.name);
                          setLunchSpecialMainType('lamb');
                        }}
                        className={`text-left p-4 rounded-xl transition-all cursor-pointer active:scale-[0.98] select-none ${
                          lunchSpecialMain === item.name && lunchSpecialMainType === 'lamb'
                            ? 'bg-[#C41E3A] text-white shadow-lg'
                            : 'bg-gray-50 hover:bg-gray-100 active:bg-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 pointer-events-none">
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
                          <p className={`text-sm mt-1 pointer-events-none ${lunchSpecialMain === item.name && lunchSpecialMainType === 'lamb' ? 'text-white/80' : 'text-gray-500'}`}>
                            {item.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-center text-gray-500 text-sm italic mb-8">
                Lunch special includes basmati rice, naan bread, and lentil of the day
              </p>

              {/* Happy Hour Section */}
              <div className="bg-[#1A1A1A] text-white p-6 rounded-2xl text-center mb-6">
                <h2 className="text-2xl font-bold">LUNCHTIME HAPPY HOUR</h2>
                <p className="text-white/70 mt-2">Click any item to add to your order</p>
              </div>

              {/* Wines */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div className="bg-[#1A1A1A] px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Wines</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lunchMenu.happyHour.wines.map((wine, idx) => {
                      const priceNum = parseFloat(wine.price.replace('$', ''));
                      return (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all cursor-pointer group"
                          onClick={() => handleAddToOrderClick({
                            id: `lunch-wine-${idx}`,
                            name: wine.name,
                            description: wine.description || null,
                            price: priceNum,
                            image: null
                          })}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-grow pr-4">
                              <h3 className="font-semibold text-gray-900 group-hover:text-[#C41E3A] transition-colors">
                                {wine.name}
                              </h3>
                              {wine.description && (
                                <p className="text-gray-500 text-sm mt-1">{wine.description}</p>
                              )}
                              <p className="text-[#C41E3A] font-bold mt-2">{wine.price}</p>
                            </div>
                            <button 
                              className="flex-shrink-0 w-10 h-10 bg-[#C41E3A] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#a01830] transition-colors cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToOrderClick({
                                  id: `lunch-wine-${idx}`,
                                  name: wine.name,
                                  description: wine.description || null,
                                  price: priceNum,
                                  image: null
                                });
                              }}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Beverages */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div className="bg-[#1A1A1A] px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Non-Alcoholic Beverages</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {lunchMenu.happyHour.beverages.map((bev, idx) => {
                      const priceNum = parseFloat(bev.price.replace('$', ''));
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddToOrderClick({
                            id: `lunch-bev-${idx}`,
                            name: bev.name,
                            description: null,
                            price: priceNum,
                            image: null
                          })}
                          className="flex justify-between items-center py-3 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors active:scale-[0.98]"
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
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div className="bg-[#1A1A1A] px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Beers</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {lunchMenu.happyHour.beers.map((beer, idx) => {
                      const priceNum = parseFloat(beer.price.replace('$', ''));
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddToOrderClick({
                            id: `lunch-beer-${idx}`,
                            name: beer.name,
                            description: null,
                            price: priceNum,
                            image: null
                          })}
                          className="flex justify-between items-center py-3 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors active:scale-[0.98]"
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
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div className="bg-[#1A1A1A] px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Desserts</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lunchMenu.happyHour.desserts.map((dessert, idx) => {
                      const priceNum = parseFloat(dessert.price.replace('$', ''));
                      return (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all cursor-pointer group"
                          onClick={() => handleAddToOrderClick({
                            id: `lunch-dessert-${idx}`,
                            name: dessert.name,
                            description: dessert.description || null,
                            price: priceNum,
                            image: null
                          })}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-grow pr-4">
                              <h3 className="font-semibold text-gray-900 group-hover:text-[#C41E3A] transition-colors">
                                {dessert.name}
                              </h3>
                              {dessert.description && (
                                <p className="text-gray-500 text-sm mt-1">{dessert.description}</p>
                              )}
                              <p className="text-[#C41E3A] font-bold mt-2">{dessert.price}</p>
                            </div>
                            <button 
                              className="flex-shrink-0 w-10 h-10 bg-[#C41E3A] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#a01830] transition-colors cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToOrderClick({
                                  id: `lunch-dessert-${idx}`,
                                  name: dessert.name,
                                  description: dessert.description || null,
                                  price: priceNum,
                                  image: null
                                });
                              }}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <p className="text-center text-gray-500 text-sm italic">
                Please speak to our staff regarding food allergies/intolerances before ordering
              </p>
            </div>
          )}

          {/* Bar Menu */}
          {menuType === 'bar' && (
            <div className="space-y-8">
              <div className="bg-[#1A1A1A] text-white p-4 rounded-xl text-center">
                <p className="text-sm">Must be 21+ to consume alcohol. Valid ID required.</p>
              </div>
              
              {barMenu.map((section, idx) => (
                <div key={idx} id={`cat-bar-${idx}`} className="scroll-mt-24 bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-[#1A1A1A] px-6 py-4">
                    <h2 className="text-xl font-bold text-white">{section.category}</h2>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {section.items.map((item, itemIdx) => {
                        const priceNum = parseFloat(item.price.replace('$', ''));
                        return (
                          <div
                            key={itemIdx}
                            className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all cursor-pointer group"
                            onClick={() => handleAddToOrderClick({
                              id: `bar-${idx}-${itemIdx}`,
                              name: item.name,
                              description: item.description || null,
                              price: priceNum,
                              image: null
                            })}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-grow pr-4">
                                <h3 className="font-semibold text-gray-900 group-hover:text-[#C41E3A] transition-colors">
                                  {item.name}
                                </h3>
                                {item.description && (
                                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                                )}
                                <p className="text-[#C41E3A] font-bold mt-2">{item.price}</p>
                              </div>
                              <button 
                                className="flex-shrink-0 w-10 h-10 bg-[#C41E3A] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#a01830] transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToOrderClick({
                                    id: `bar-${idx}-${itemIdx}`,
                                    name: item.name,
                                    description: item.description || null,
                                    price: priceNum,
                                    image: null
                                  });
                                }}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              <p className="text-center text-gray-500 text-sm italic">
                Drinks will be added to your order
              </p>
            </div>
          )}

          {/* Catering Menu */}
          {menuType === 'catering' && (
            <div className="space-y-8">
              <div className="bg-[#C41E3A] text-white p-6 rounded-2xl text-center">
                <h2 className="text-xl font-bold mb-2">Catering Services</h2>
                <p className="text-lg font-semibold">$75 Delivery Minimum • Serves 15-35 guests</p>
                <p className="mt-2 text-white/90">Add items to your cart or call (212) 628-4500</p>
              </div>
              
              {cateringMenu.map((section, idx) => (
                <div key={idx} id={`cat-catering-${idx}`} className="scroll-mt-24 bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-[#1A1A1A] px-6 py-4">
                    <h2 className="text-xl font-bold text-white">{section.name}</h2>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {section.items.map((item, itemIdx) => {
                        const halfTrayPrice = item.halfTray ? parseFloat(item.halfTray.replace('$', '')) : null;
                        const fullTrayPrice = item.fullTray ? parseFloat(item.fullTray.replace('$', '')) : null;
                        const perPiecePrice = item.perPiece ? parseFloat(item.perPiece.replace(/[^0-9.]/g, '')) : null;
                        
                        return (
                          <div key={itemIdx} className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            {item.description && (
                              <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {halfTrayPrice && (
                                <button
                                  onClick={() => handleAddToOrderClick({
                                    id: `catering-${idx}-${itemIdx}-half`,
                                    name: `${item.name} (Half Tray)`,
                                    description: item.description || null,
                                    price: halfTrayPrice,
                                    image: null
                                  })}
                                  className="bg-white border-2 border-[#C41E3A] text-[#C41E3A] px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#C41E3A] hover:text-white transition-colors cursor-pointer"
                                >
                                  Half Tray • {item.halfTray}
                                </button>
                              )}
                              {fullTrayPrice && (
                                <button
                                  onClick={() => handleAddToOrderClick({
                                    id: `catering-${idx}-${itemIdx}-full`,
                                    name: `${item.name} (Full Tray)`,
                                    description: item.description || null,
                                    price: fullTrayPrice,
                                    image: null
                                  })}
                                  className="bg-[#C41E3A] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#a01830] transition-colors cursor-pointer"
                                >
                                  Full Tray • {item.fullTray}
                                </button>
                              )}
                              {perPiecePrice && (
                                <button
                                  onClick={() => handleAddToOrderClick({
                                    id: `catering-${idx}-${itemIdx}-piece`,
                                    name: item.name,
                                    description: item.description || null,
                                    price: perPiecePrice,
                                    image: null
                                  })}
                                  className="bg-[#C41E3A] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#a01830] transition-colors cursor-pointer"
                                >
                                  {item.perPiece}
                                </button>
                              )}
                            </div>
                          </div>
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
        </div>

        {/* Cart Sidebar - Desktop */}
        <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-[#1A1A1A] text-white p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C41E3A] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-lg">Your Order</h2>
                  <p className="text-gray-400 text-sm">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
            
            <div className="p-5">
              {items.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-1">Add items from the menu</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                    {items.map(cartItem => (
                      <div key={cartItem.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-800 text-sm flex-grow pr-2">{cartItem.name}</h4>
                          <span className="text-gray-700 font-semibold text-sm">${(cartItem.price * cartItem.quantity).toFixed(2)}</span>
                        </div>
                        {cartItem.note && (
                          <p className="text-xs text-gray-500 italic mb-2 bg-white px-2 py-1 rounded">"{cartItem.note}"</p>
                        )}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200">
                            <button 
                              onClick={() => {
                                if (cartItem.quantity === 1) {
                                  removeItem(cartItem.id);
                                } else {
                                  updateItem(cartItem.id, { quantity: cartItem.quantity - 1 });
                                }
                              }}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#C41E3A] transition-colors cursor-pointer"
                            >
                              {cartItem.quantity === 1 ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              ) : (
                                <span className="text-lg font-medium">−</span>
                              )}
                            </button>
                            <span className="font-semibold text-sm w-6 text-center">{cartItem.quantity}</span>
                            <button 
                              onClick={() => updateItem(cartItem.id, { quantity: cartItem.quantity + 1 })}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#C41E3A] transition-colors cursor-pointer"
                            >
                              <span className="text-lg font-medium">+</span>
                            </button>
                          </div>
                          <button 
                            onClick={() => removeItem(cartItem.id)}
                            className="text-gray-400 hover:text-red-500 text-xs transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between font-bold text-lg mb-4">
                      <span>Subtotal</span>
                      <span className="text-[#C41E3A]">${total.toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={() => setIsCheckout(true)}
                      className="w-full bg-[#C41E3A] text-white py-4 rounded-xl font-bold hover:bg-[#a01830] transition-colors shadow-lg cursor-pointer"
                    >
                      Continue to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Drawer */}
      {/* Backdrop when drawer is open */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black/50 transition-opacity duration-200 z-40 ${
          mobileCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileCartOpen(false)}
      />
      
      {/* Drawer Container - fixed height, positioned at bottom */}
      <div 
        ref={drawerRef}
        className={`lg:hidden fixed left-0 right-0 z-50 bg-[#1A1A1A] rounded-t-2xl shadow-2xl transition-transform duration-200 ease-out`}
        style={{ 
          bottom: 0,
          transform: mobileCartOpen ? 'translateY(0)' : 'translateY(calc(100% - 76px))',
        }}
        onTouchStart={handleDrawerTouchStart}
        onTouchMove={handleDrawerTouchMove}
        onTouchEnd={handleDrawerTouchEnd}
      >
        {/* Drawer Handle - swipe indicator */}
        <button 
          type="button"
          onClick={() => setMobileCartOpen(!mobileCartOpen)}
          className="w-full pt-3 pb-2 flex justify-center cursor-pointer"
        >
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </button>

          {/* Cart Header - Always Visible */}
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setMobileCartOpen(!mobileCartOpen)}
                className="flex items-center gap-3 cursor-pointer text-white"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-[#C41E3A] rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-[#C41E3A] text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Your Order</p>
                  <p className="text-gray-400 text-xs">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${mobileCartOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              
              {items.length > 0 && (
                <button 
                  onClick={() => setIsCheckout(true)}
                  className="bg-[#C41E3A] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#a01830] transition-colors cursor-pointer"
                >
                  Checkout • ${total.toFixed(2)}
                </button>
              )}
            </div>
          </div>

          {/* Cart Content */}
          <div className="bg-white border-t-4 border-[#C41E3A]">
            <div className="p-4 max-h-[50vh] overflow-y-auto">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-1">Add items from the menu above</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {items.map(cartItem => (
                      <div key={cartItem.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-800 flex-grow pr-2">{cartItem.name}</h4>
                          <span className="text-[#C41E3A] font-bold">${(cartItem.price * cartItem.quantity).toFixed(2)}</span>
                        </div>
                        {cartItem.note && (
                          <p className="text-xs text-gray-500 italic mb-3 bg-white px-3 py-2 rounded-lg border border-gray-100">"{cartItem.note}"</p>
                        )}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200">
                            <button 
                              onClick={() => {
                                if (cartItem.quantity === 1) {
                                  removeItem(cartItem.id);
                                } else {
                                  updateItem(cartItem.id, { quantity: cartItem.quantity - 1 });
                                }
                              }}
                              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#C41E3A] transition-colors cursor-pointer"
                            >
                              {cartItem.quantity === 1 ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              ) : (
                                <span className="text-lg font-medium">−</span>
                              )}
                            </button>
                            <span className="font-bold text-sm w-8 text-center">{cartItem.quantity}</span>
                            <button 
                              onClick={() => updateItem(cartItem.id, { quantity: cartItem.quantity + 1 })}
                              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#C41E3A] transition-colors cursor-pointer"
                            >
                              <span className="text-lg font-medium">+</span>
                            </button>
                          </div>
                          <button 
                            onClick={() => removeItem(cartItem.id)}
                            className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Subtotal in drawer */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Subtotal</span>
                      <span className="text-xl font-bold text-[#C41E3A]">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      {/* Add Item Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Image Header */}
            {selectedItem.image ? (
              <div className="relative h-48">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  fill
                  className="object-cover"
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
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                    >−</button>
                    <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
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
                    onChange={e => setNote(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent text-sm resize-none"
                    rows={3}
                    placeholder="e.g. Extra spicy, no onions, allergies..."
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 pt-0">
              <button 
                onClick={confirmAddItem}
                className="w-full bg-[#C41E3A] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#a01830] transition-colors shadow-lg cursor-pointer"
              >
                Add to Order • ${(selectedItem.price * quantity).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
