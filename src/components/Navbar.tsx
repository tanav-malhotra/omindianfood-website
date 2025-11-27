"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-[#1A1A1A] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <div className="relative h-14 w-40">
                <Image 
                  src="/om-logo.png" 
                  alt="OM Indian Restaurant" 
                  fill 
                  sizes="160px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            <Link href="/menu" className="text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors">
              Menu
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors">
              Contact
            </Link>
            <Link 
              href="/order" 
              className="ml-4 bg-[#C41E3A] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#a01830] transition-colors shadow-md flex items-center gap-2 relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Order Online
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#C41E3A] text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <Link href="/order" className="relative mr-4 bg-[#C41E3A] text-white p-2 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#C41E3A] text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#2A2A2A] border-t border-gray-700">
          <div className="px-4 py-3 space-y-1">
            <Link href="/menu" className="block text-gray-300 hover:text-white py-2 text-base" onClick={() => setMobileMenuOpen(false)}>Menu</Link>
            <Link href="/about" className="block text-gray-300 hover:text-white py-2 text-base" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="/contact" className="block text-gray-300 hover:text-white py-2 text-base" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <Link href="/order" className="block text-gray-300 hover:text-white py-2 text-base" onClick={() => setMobileMenuOpen(false)}>Order Online</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
