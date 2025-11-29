"use client";
import { useState, useRef, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number; // This is the take-out price
  image: string | null;
};

// Database stores take-out prices directly (the .95 prices)

type Category = {
  id: string;
  name: string;
  items: MenuItem[];
};

type MenuType = "takeout" | "catering";

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

interface OrderInterfaceProps {
  dinnerCategories: Category[];
  lunchMenu: LunchMenu;
  barMenu: BarMenuItem[];
  cateringMenu: CateringCategory[];
  omSpecialMenu?: OmSpecialMenu;
}

export default function OrderInterface({ dinnerCategories, lunchMenu, barMenu, cateringMenu, omSpecialMenu }: OrderInterfaceProps) {
  const { items, addItem, removeItem, updateItem, total, clearCart } = useCart();
  const searchParams = useSearchParams();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [imageError, setImageError] = useState(false);
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isCheckout, setIsCheckout] = useState(false);
  const [menuType, setMenuType] = useState<MenuType>('takeout');
  const [activeCategory, setActiveCategory] = useState(dinnerCategories[0]?.id || '');
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  
  // Check URL params for menu type (e.g., ?menu=catering)
  useEffect(() => {
    const menuParam = searchParams.get('menu');
    if (menuParam === 'catering') {
      setMenuType('catering');
    }
  }, [searchParams]);
  
  // Note: Lunch Special is dine-in only and not available for online ordering
  
  // OM Special Builder State (for Take Out menu)
  const [omSpecialAppetizer, setOmSpecialAppetizer] = useState<string | null>(null);
  const [omSpecialEntree, setOmSpecialEntree] = useState<string | null>(null);
  const [omSpecialBreadUpgrade, setOmSpecialBreadUpgrade] = useState<string | null>(null);
  const [showOmSpecialBuilder, setShowOmSpecialBuilder] = useState(false);
  
  // Bread upgrade options for OM Special ($1 extra)
  const breadUpgradeOptions = [
    { name: "Plain Naan (included)", price: 0 },
    { name: "Garlic Naan (+$1)", price: 1 },
    { name: "Onion Naan (+$1)", price: 1 },
    { name: "Plain Paratha (+$1)", price: 1 },
  ];
  
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
  
  // Note: Lunch special is dine-in only and not available for online ordering
  
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
  
  // Scheduling State (required for catering orders)
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  
  // Check if cart has catering items or take out items
  const hasCateringItems = items.some(item => item.menuItemId?.startsWith('catering-'));
  const hasTakeOutItems = items.some(item => !item.menuItemId?.startsWith('catering-'));
  
  // Get minimum scheduled date (24 hours from now)
  const getMinScheduledDate = () => {
    const now = new Date();
    now.setHours(now.getHours() + 24);
    return now.toISOString().split('T')[0];
  };
  
  // Catering delivery minimum (no delivery fee)
  const CATERING_DELIVERY_MINIMUM = 75;
  
  // Delivery zone: Upper East Side Manhattan
  // North: 100th Street, South: 63rd Street, West: 5th Avenue, East: East End Avenue
  const DELIVERY_ZONE_DESCRIPTION = "63rd St to 100th St, between 5th Ave and East End Ave";
  
  // NY Sales Tax Rate (8.875%)
  const TAX_RATE = 0.08875;
  const subtotal = total;
  
  // Check if catering delivery minimum is met
  const cateringDeliveryAllowed = !hasCateringItems || subtotal >= CATERING_DELIVERY_MINIMUM;
  
  // Auto-switch to pickup if catering delivery minimum is not met
  useEffect(() => {
    if (hasCateringItems && orderType === 'DELIVERY' && !cateringDeliveryAllowed) {
      setOrderType('PICKUP');
    }
  }, [hasCateringItems, cateringDeliveryAllowed, orderType]);
  
  const taxAmount = subtotal * TAX_RATE;
  const tipAmount = tipPercent === 'custom' 
    ? (customTipType === '$' 
        ? parseFloat(customTip) || 0 
        : subtotal * ((parseFloat(customTip) || 0) / 100))
    : subtotal * (tipPercent / 100);
  const grandTotal = subtotal + taxAmount + tipAmount;
  
  const router = useRouter();

  const menuTypes: { id: MenuType; label: string }[] = [
    { id: "takeout", label: "Take Out" },
    { id: "catering", label: "Catering" },
  ];

  // Get categories based on menu type
  const getCurrentCategories = () => {
    switch (menuType) {
      case 'takeout':
        return dinnerCategories.map(c => ({ id: c.id, name: c.name }));
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
    
    // Check if trying to mix catering with take out items
    const isCateringItem = selectedItem.id.startsWith('catering-');
    
    if (isCateringItem && hasTakeOutItems) {
      alert('Catering items cannot be mixed with take out items. Please place separate orders for catering and take out.');
      setSelectedItem(null);
      return;
    }
    
    if (!isCateringItem && hasCateringItems) {
      alert('Take out items cannot be mixed with catering items. Please place separate orders for catering and take out.');
      setSelectedItem(null);
      return;
    }
    
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
    
    // Validate scheduling for catering orders
    if (hasCateringItems) {
      if (!scheduledDate || !scheduledTime) {
        setPaymentError('Catering orders require a scheduled date and time (at least 24 hours in advance)');
        return;
      }
      
      // Verify the scheduled time is at least 24 hours from now
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const minDateTime = new Date();
      minDateTime.setHours(minDateTime.getHours() + 24);
      
      if (scheduledDateTime < minDateTime) {
        setPaymentError('Catering orders must be scheduled at least 24 hours in advance');
        return;
      }
    }
    
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
        } : undefined,
        scheduledDateTime: hasCateringItems && scheduledDate && scheduledTime 
          ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString() 
          : undefined
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
                  onClick={() => cateringDeliveryAllowed && setOrderType('DELIVERY')}
                  disabled={!cateringDeliveryAllowed}
                  className={`py-4 px-4 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-3 ${
                    !cateringDeliveryAllowed
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : orderType === 'DELIVERY' 
                        ? 'border-[#C41E3A] bg-red-50 text-[#C41E3A] cursor-pointer' 
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 cursor-pointer'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  Delivery
                </button>
              </div>
              {/* Catering delivery minimum message */}
              {hasCateringItems && !cateringDeliveryAllowed && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>
                      <strong>Minimum order of ${CATERING_DELIVERY_MINIMUM} required for catering delivery.</strong>
                      {' '}Add ${(CATERING_DELIVERY_MINIMUM - subtotal).toFixed(2)} more to enable delivery.
                    </span>
                  </p>
                </div>
              )}
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800 flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>
                        <strong>Delivery Area:</strong> {DELIVERY_ZONE_DESCRIPTION}
                        <br />
                        <span className="text-blue-600 text-xs">Questions? Call (212) 628-4500</span>
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Catering Scheduling (Required for catering orders) */}
              {hasCateringItems && (
                <div className="space-y-4 p-4 bg-amber-50 border-2 border-amber-400 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold">Schedule Your Catering Order</h3>
                  </div>
                  <p className="text-sm text-amber-700">
                    Catering orders must be scheduled at least 24 hours in advance.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                      <input 
                        required 
                        type="date" 
                        value={scheduledDate} 
                        onChange={e => setScheduledDate(e.target.value)}
                        min={getMinScheduledDate()}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                      <input 
                        required 
                        type="time" 
                        value={scheduledTime} 
                        onChange={e => setScheduledTime(e.target.value)}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-amber-600">
                    Please call (212) 628-4500 to confirm availability for your event date.
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
          {/* Take Out Menu */}
          {menuType === 'takeout' && (
            <div className="space-y-8">
              {/* OM Special Deal */}
              {omSpecialMenu && (
                <div className="bg-[#C41E3A] text-white p-6 rounded-2xl">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">OM SPECIAL</h2>
                      <p className="text-white/90 text-xl font-semibold">$18.95{omSpecialBreadUpgrade && breadUpgradeOptions.find(b => b.name === omSpecialBreadUpgrade)?.price ? ' + $1' : ''}</p>
                      <p className="text-white/80 text-sm mt-1">
                        One Appetizer + One Entrée • Includes basmati rice, naan bread, raita & mango chutney
                      </p>
                      <p className="text-white/70 text-xs mt-1">
                        Add $1 for Garlic Naan, Onion Naan, or Plain Paratha
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
                            {/* Chicken Appetizers */}
                            <p className="text-xs text-white/60 uppercase tracking-wide mt-2">Chicken</p>
                            {omSpecialMenu.appetizers.chicken.map((item, idx) => (
                              <button
                                key={`chicken-app-${idx}`}
                                onClick={() => setOmSpecialAppetizer(item.name)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                                  omSpecialAppetizer === item.name 
                                    ? 'bg-white text-[#C41E3A] font-semibold' 
                                    : 'bg-white/20 hover:bg-white/30'
                                }`}
                              >
                                {omSpecialAppetizer === item.name && <span className="mr-2">✓</span>}
                                {item.name}
                              </button>
                            ))}
                            {/* Lamb Appetizers */}
                            <p className="text-xs text-white/60 uppercase tracking-wide mt-2">Lamb</p>
                            {omSpecialMenu.appetizers.lamb.map((item, idx) => (
                              <button
                                key={`lamb-app-${idx}`}
                                onClick={() => setOmSpecialAppetizer(item.name)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                                  omSpecialAppetizer === item.name 
                                    ? 'bg-white text-[#C41E3A] font-semibold' 
                                    : 'bg-white/20 hover:bg-white/30'
                                }`}
                              >
                                {omSpecialAppetizer === item.name && <span className="mr-2">✓</span>}
                                {item.name}
                              </button>
                            ))}
                            {/* Vegetable Appetizers */}
                            <p className="text-xs text-white/60 uppercase tracking-wide mt-2">Vegetable</p>
                            {omSpecialMenu.appetizers.vegetable.map((item, idx) => (
                              <button
                                key={`veg-app-${idx}`}
                                onClick={() => setOmSpecialAppetizer(item.name)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                                  omSpecialAppetizer === item.name 
                                    ? 'bg-white text-[#C41E3A] font-semibold' 
                                    : 'bg-white/20 hover:bg-white/30'
                                }`}
                              >
                                {omSpecialAppetizer === item.name && <span className="mr-2">✓</span>}
                                {item.name}
                              </button>
                            ))}
                            {/* Soup */}
                            <p className="text-xs text-white/60 uppercase tracking-wide mt-2">Soup</p>
                            {omSpecialMenu.soups.map((item, idx) => (
                              <button
                                key={`soup-${idx}`}
                                onClick={() => setOmSpecialAppetizer(item.name)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                                  omSpecialAppetizer === item.name 
                                    ? 'bg-white text-[#C41E3A] font-semibold' 
                                    : 'bg-white/20 hover:bg-white/30'
                                }`}
                              >
                                {omSpecialAppetizer === item.name && <span className="mr-2">✓</span>}
                                {item.name}
                              </button>
                            ))}
                            {/* Salad */}
                            <p className="text-xs text-white/60 uppercase tracking-wide mt-2">Salad</p>
                            {omSpecialMenu.salad.map((item, idx) => (
                              <button
                                key={`salad-${idx}`}
                                onClick={() => setOmSpecialAppetizer(item.name)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                                  omSpecialAppetizer === item.name 
                                    ? 'bg-white text-[#C41E3A] font-semibold' 
                                    : 'bg-white/20 hover:bg-white/30'
                                }`}
                              >
                                {omSpecialAppetizer === item.name && <span className="mr-2">✓</span>}
                                {item.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Entrée Selection */}
                        <div>
                          <h3 className="font-semibold text-lg mb-3">2. Choose Entrée</h3>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {/* Chicken Entrees */}
                            <p className="text-xs text-white/60 uppercase tracking-wide mt-2">Chicken</p>
                            {omSpecialMenu.entrees.chicken.map((item, idx) => (
                              <button
                                key={`chicken-ent-${idx}`}
                                onClick={() => setOmSpecialEntree(item.name)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                                  omSpecialEntree === item.name 
                                    ? 'bg-white text-[#C41E3A] font-semibold' 
                                    : 'bg-white/20 hover:bg-white/30'
                                }`}
                              >
                                {omSpecialEntree === item.name && <span className="mr-2">✓</span>}
                                {item.name}
                              </button>
                            ))}
                            {/* Lamb Entrees */}
                            <p className="text-xs text-white/60 uppercase tracking-wide mt-2">Lamb</p>
                            {omSpecialMenu.entrees.lamb.map((item, idx) => (
                              <button
                                key={`lamb-ent-${idx}`}
                                onClick={() => setOmSpecialEntree(item.name)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                                  omSpecialEntree === item.name 
                                    ? 'bg-white text-[#C41E3A] font-semibold' 
                                    : 'bg-white/20 hover:bg-white/30'
                                }`}
                              >
                                {omSpecialEntree === item.name && <span className="mr-2">✓</span>}
                                {item.name}
                              </button>
                            ))}
                            {/* Vegetable Entrees */}
                            <p className="text-xs text-white/60 uppercase tracking-wide mt-2">Vegetable</p>
                            {omSpecialMenu.entrees.vegetable.map((item, idx) => (
                              <button
                                key={`veg-ent-${idx}`}
                                onClick={() => setOmSpecialEntree(item.name)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                                  omSpecialEntree === item.name 
                                    ? 'bg-white text-[#C41E3A] font-semibold' 
                                    : 'bg-white/20 hover:bg-white/30'
                                }`}
                              >
                                {omSpecialEntree === item.name && <span className="mr-2">✓</span>}
                                {item.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Bread Upgrade Option */}
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <h3 className="font-semibold text-lg mb-3">3. Choose Bread (Optional Upgrade)</h3>
                        <div className="flex flex-wrap gap-2">
                          {breadUpgradeOptions.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => setOmSpecialBreadUpgrade(option.name)}
                              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                                omSpecialBreadUpgrade === option.name 
                                  ? 'bg-white text-[#C41E3A] font-semibold' 
                                  : 'bg-white/20 hover:bg-white/30'
                              }`}
                            >
                              {omSpecialBreadUpgrade === option.name && <span className="mr-2">✓</span>}
                              {option.name}
                            </button>
                          ))}
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
                          {omSpecialBreadUpgrade && breadUpgradeOptions.find(b => b.name === omSpecialBreadUpgrade)?.price ? (
                            <span className="ml-2 text-green-300">+ {omSpecialBreadUpgrade.split(' ')[0]} {omSpecialBreadUpgrade.split(' ')[1]}</span>
                          ) : null}
                        </div>
                        <button
                          onClick={() => {
                            if (omSpecialAppetizer && omSpecialEntree) {
                              if (hasCateringItems) {
                                alert('Take out items cannot be mixed with catering items. Please place separate orders for catering and take out.');
                                return;
                              }
                              const breadUpgradePrice = breadUpgradeOptions.find(b => b.name === omSpecialBreadUpgrade)?.price || 0;
                              const breadNote = omSpecialBreadUpgrade && breadUpgradePrice > 0 
                                ? `, Bread: ${omSpecialBreadUpgrade.split(' (')[0]}` 
                                : '';
                              addItem({
                                menuItemId: `om-special-${Date.now()}`,
                                name: 'OM Special',
                                price: 18.95 + breadUpgradePrice,
                                quantity: 1,
                                note: `Appetizer: ${omSpecialAppetizer}, Entrée: ${omSpecialEntree}${breadNote}. Includes basmati rice, naan bread, raita & mango chutney.`
                              });
                              setOmSpecialAppetizer(null);
                              setOmSpecialEntree(null);
                              setOmSpecialBreadUpgrade(null);
                              setShowOmSpecialBuilder(false);
                            }
                          }}
                          disabled={!omSpecialAppetizer || !omSpecialEntree}
                          className={`px-6 py-3 rounded-lg font-bold transition-all cursor-pointer ${
                            omSpecialAppetizer && omSpecialEntree
                              ? 'bg-white text-[#C41E3A] hover:bg-gray-100'
                              : 'bg-white/30 text-white/60 cursor-not-allowed'
                          }`}
                        >
                          Add to Cart • ${(18.95 + (breadUpgradeOptions.find(b => b.name === omSpecialBreadUpgrade)?.price || 0)).toFixed(2)}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

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

          {/* Note: Lunch Special and Bar Menu are dine-in only and not available for online ordering */}

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
                        const rawValue = e.target.value.replace(/\D/g, ''); // Only digits
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
                    onChange={e => setNote(e.target.value)}
                    className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent text-sm resize-none"
                    rows={3}
                    placeholder="e.g. Extra spicy, no onions, allergies..."
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 pt-0">
              <button 
                onClick={confirmAddItem}
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
    </div>
  );
}
