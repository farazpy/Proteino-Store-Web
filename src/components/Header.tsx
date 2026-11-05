import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Search, Heart, Menu, X, ChevronDown, Sparkles, ArrowRight, Gift, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Product } from '../types/store';
import { PRODUCTS, createProductSlug } from '../data/products';

interface HeaderProps {
  version: string;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onSelectCategory: (cat: string) => void;
  onOpenSearch: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  categories: any[];
  megaMenuProducts: Product[];
  onOpenAuth?: () => void;
  onNavigateToEssentials?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToProduct?: (slug: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  version,
  cartCount,
  cartTotal,
  onOpenCart,
  onSelectCategory,
  onOpenSearch,
  wishlistCount,
  onOpenWishlist,
  categories,
  megaMenuProducts,
  onOpenAuth,
  onNavigateToEssentials,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToHome,
  onNavigateToProduct,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const megaMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#fbf7f0]/80 backdrop-blur-xl border-b border-white/30 transition-all saturate-150 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          {/* Zone 1: Brand Wordmark + Version Pill */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <button
              onClick={() => {
                if (onNavigateToHome) onNavigateToHome();
                else onSelectCategory('all');
              }}
              className="group flex items-center gap-2 text-left focus:outline-none min-w-0 cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#00632d] flex items-center justify-center text-white font-display text-xl sm:text-2xl shadow-sm group-hover:scale-105 transition-transform shrink-0">
                🥜
              </div>
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#00632d] leading-none truncate">
                  Theproteino
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#796e5c] truncate">
                  100% Peanut Power
                </span>
              </div>
            </button>

            {/* Version indicator as requested in user instructions */}
            <span
              title="Frontend Build Version"
              className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f5e9]/80 text-[#00632d] border border-[#c8e6c9]/50 tracking-tight ml-1 whitespace-nowrap"
            >
              {version}
            </span>
          </div>

          {/* Zone 2: Perfectly Structured Nav Menu */}
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-semibold text-[#3b3427] relative">
            {/* 1. Home */}
            <button
              onClick={() => {
                if (onNavigateToHome) onNavigateToHome();
                else {
                  onSelectCategory('all');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="hover:text-[#00632d] transition-colors py-2 whitespace-nowrap shrink-0 cursor-pointer relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00632d] transition-all duration-200 group-hover:w-full" />
            </button>

            {/* 2. Shop with Mega Menu Dropdown Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setMegaMenuOpen(true)}
            >
              <button
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className={`flex items-center gap-1 hover:text-[#00632d] transition-colors py-2 whitespace-nowrap shrink-0 cursor-pointer relative group ${
                  megaMenuOpen ? 'text-[#00632d]' : ''
                }`}
              >
                <span>Shop</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180 text-[#00632d]' : ''}`} />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00632d] transition-all duration-200 group-hover:w-full" />
              </button>
            </div>

            {/* 3. Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCategoryDropdownOpen(true)}
            >
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className={`flex items-center gap-1 hover:text-[#00632d] transition-colors py-2 whitespace-nowrap shrink-0 cursor-pointer relative group ${
                  categoryDropdownOpen ? 'text-[#00632d]' : ''
                }`}
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180 text-[#00632d]' : ''}`} />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00632d] transition-all duration-200 group-hover:w-full" />
              </button>

              {categoryDropdownOpen && (
                <div
                  onMouseLeave={() => setCategoryDropdownOpen(false)}
                  className="absolute top-full left-0 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#e4d6c0] p-2 mt-1 animate-in fade-in slide-in-from-top-2 z-50"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#7d705c] px-3 py-1.5 border-b border-[#f0e7d8] mb-1">
                    Select Category
                  </div>
                  <button
                    onClick={() => {
                      onSelectCategory('all');
                      setCategoryDropdownOpen(false);
                      if (onNavigateToHome) onNavigateToHome();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#1a221b] hover:bg-[#eaf4ec] hover:text-[#00632d] transition-colors flex items-center justify-between"
                  >
                    <span>✨ All Products</span>
                    <span className="text-[10px] text-[#8a7a66]">9 SKUs</span>
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectCategory(c.id);
                        setCategoryDropdownOpen(false);
                        if (onNavigateToHome) onNavigateToHome();
                        const el = document.getElementById('products-gallery');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#1a221b] hover:bg-[#eaf4ec] hover:text-[#00632d] transition-colors flex items-center justify-between"
                    >
                      <span>{c.icon} {c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Essentials */}
            {onNavigateToEssentials && (
              <button
                onClick={onNavigateToEssentials}
                className="text-[#00632d] bg-[#eaf4ec] hover:bg-[#d8eedd] px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Essentials</span>
              </button>
            )}

            {/* 5. About */}
            {onNavigateToAbout && (
              <button
                onClick={onNavigateToAbout}
                className="hover:text-[#00632d] transition-colors py-2 whitespace-nowrap shrink-0 cursor-pointer relative group"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00632d] transition-all duration-200 group-hover:w-full" />
              </button>
            )}

            {/* 6. Contact */}
            {onNavigateToContact && (
              <button
                onClick={onNavigateToContact}
                className="hover:text-[#00632d] transition-colors py-2 whitespace-nowrap shrink-0 cursor-pointer relative group"
              >
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00632d] transition-all duration-200 group-hover:w-full" />
              </button>
            )}
          </nav>

          {/* Zone 3: 1 Primary Action Cluster (Search, Wishlist, Bag CTA) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 sm:p-2.5 rounded-full text-[#4a4031] hover:text-[#00632d] hover:bg-white/50 transition-colors cursor-pointer"
              title="Search products"
              aria-label="Search products"
            >
              <Search className="w-4 h-4 sm:w-5 h-5" />
            </button>

            {/* User Profile / Auth Trigger */}
            <button
              onClick={onOpenAuth}
              className="p-2 sm:p-2.5 rounded-full text-[#4a4031] hover:text-[#00632d] hover:bg-white/50 transition-colors cursor-pointer"
              title="My Account"
              aria-label="My Account"
            >
              <UserIcon className="w-4 h-4 sm:w-5 h-5" />
            </button>

            {/* Wishlist Trigger */}
            <button
              onClick={onOpenWishlist}
              className="hidden sm:flex relative p-2 sm:p-2.5 rounded-full text-[#4a4031] hover:text-[#00632d] hover:bg-white/50 transition-colors cursor-pointer"
              title="View Wishlist"
              aria-label="View Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#e63946] text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Primary Action: Shopping Cart Bag CTA */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 sm:gap-2.5 bg-[#00632d] hover:bg-[#004d23] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all whitespace-nowrap shrink-0 group active:scale-95 cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 h-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#ffc400] text-[#004d23] text-[9px] sm:text-[10px] font-black w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden xs:inline">Bag</span>
              {cartTotal > 0 && (
                <span className="hidden sm:inline text-emerald-200 font-mono text-[11px] sm:text-xs tabular-nums border-l border-emerald-600/50 pl-2">
                  ₹{cartTotal.toLocaleString()}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-[#3b3427] hover:bg-white/50 transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 h-6" /> : <Menu className="w-5 h-5 sm:w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mega Menu Overlay (Full width desktop dropdown) */}
        {megaMenuOpen && (
          <div
            ref={megaMenuRef}
            onMouseLeave={() => setMegaMenuOpen(false)}
            className="hidden lg:block absolute top-full inset-x-4 max-w-7xl mx-auto bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#e4d6c0] p-6 sm:p-8 animate-in fade-in slide-in-from-top-3 z-50 my-2"
          >
            <div className="grid grid-cols-12 gap-8">
              {/* Column 1: Categories */}
              <div className="col-span-4 border-r border-[#f0e7d8] pr-6">
                <div className="text-xs font-bold uppercase tracking-wider text-[#00632d] mb-4 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#8ee000]" />
                  <span>Browse Collections</span>
                </div>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.id);
                        setMegaMenuOpen(false);
                        if (onNavigateToHome) onNavigateToHome();
                        const el = document.getElementById('products-gallery');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-[#eaf4ec] transition-colors group flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{cat.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-[#1a221b] group-hover:text-[#00632d]">
                            {cat.name}
                          </div>
                          <div className="text-[10px] text-[#786b59]">{cat.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Column 2: Best Sellers Mini Cards */}
              <div className="col-span-5 border-r border-[#f0e7d8] pr-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00632d]">
                    Customer Favourites
                  </span>
                  <button
                    onClick={() => {
                      onSelectCategory('all');
                      setMegaMenuOpen(false);
                      if (onNavigateToHome) onNavigateToHome();
                    }}
                    className="text-[11px] font-bold text-[#00632d] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All (9)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {megaMenuProducts.map((prod) => {
                    const slug = createProductSlug(prod.name);
                    return (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setMegaMenuOpen(false);
                          if (onNavigateToProduct) onNavigateToProduct(slug);
                        }}
                        className="p-2.5 rounded-2xl hover:bg-[#faf5ec] border border-transparent hover:border-[#e4d6c0] transition-all flex items-center gap-3 cursor-pointer group"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border border-[#e6dbc8] bg-white shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#1a221b] group-hover:text-[#00632d] truncate">
                            {prod.name}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#786b59]">
                            <span>★ {prod.rating}</span>
                            <span>·</span>
                            <span className="text-[#00632d] font-bold">{prod.category}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-[#00632d] font-mono tabular-nums">
                            ₹{prod.price}
                          </div>
                          <div className="text-[9px] text-[#8a7b68] line-through font-mono tabular-nums">
                            ₹{prod.originalPrice}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Column 3: Promo & Gift Card */}
              <div className="col-span-3 flex flex-col justify-between">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#00632d] to-[#004d23] text-white space-y-3">
                  <div className="inline-flex items-center gap-1 bg-[#8ee000] text-[#004d23] text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
                    <Gift className="w-3 h-3" />
                    <span>Special Offer</span>
                  </div>
                  <h4 className="font-display text-base font-bold leading-tight">
                    Get Flat 15% OFF + FREE Shaker
                  </h4>
                  <p className="text-[11px] text-emerald-100">
                    Apply code <code className="bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold text-white">PROTEIN15</code> at checkout.
                  </p>
                  {onNavigateToEssentials && (
                    <button
                      onClick={() => {
                        setMegaMenuOpen(false);
                        onNavigateToEssentials();
                      }}
                      className="w-full py-2 bg-[#8ee000] text-[#004d23] font-bold text-xs rounded-xl hover:bg-white transition-colors cursor-pointer"
                    >
                      Shop Bundles →
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-[#786b59] flex items-center justify-center gap-1.5 pt-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00632d]" />
                  <span>Labdoor Certified · 0% Palm Oil</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#e7decb] bg-[#fbf7f0] animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col gap-2">
              <div className="px-3 py-1 flex items-center justify-between text-xs text-[#796e5c]">
                <span>App Version</span>
                <span className="font-bold text-[#00632d] bg-[#e8f5e9] px-2 py-0.5 rounded">
                  {version}
                </span>
              </div>

              {/* Mobile Home */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onNavigateToHome) onNavigateToHome();
                }}
                className="px-4 py-2 text-left font-bold text-sm text-[#1a221b] hover:bg-[#efe7d5] rounded-lg transition-colors"
              >
                🏠 Home
              </button>

              {/* Mobile Cart */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCart();
                }}
                className="px-4 py-2 text-left font-semibold text-sm text-[#2c2417] hover:bg-[#efe7d5] rounded-lg transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#00632d]" />
                  <span>Shopping Cart</span>
                </div>
                {cartCount > 0 && (
                  <span className="bg-[#00632d] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {cartCount} items
                  </span>
                )}
              </button>

              {/* Mobile Wishlist */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenWishlist();
                }}
                className="px-4 py-2 text-left font-semibold text-sm text-[#2c2417] hover:bg-[#efe7d5] rounded-lg transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#e63946]" />
                  <span>My Wishlist</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="bg-[#e63946] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Mobile Account */}
              {onOpenAuth && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="px-4 py-2 text-left font-semibold text-sm text-[#2c2417] hover:bg-[#efe7d5] rounded-lg transition-colors flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-[#00632d]" />
                  <span>My Account / Sign In</span>
                </button>
              )}

              {/* Mobile Categories */}
              <div className="px-4 py-1 text-xs font-bold uppercase text-[#7d705c] mt-1">
                Categories
              </div>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setMobileMenuOpen(false);
                    if (onNavigateToHome) onNavigateToHome();
                    const el = document.getElementById('products-gallery');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-2 text-left font-semibold text-xs text-[#2c2417] hover:bg-[#efe7d5] rounded-lg transition-colors flex items-center justify-between"
                >
                  <span>{cat.icon} {cat.name}</span>
                </button>
              ))}

              {/* Mobile Essentials */}
              {onNavigateToEssentials && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToEssentials();
                  }}
                  className="px-4 py-2.5 text-left font-bold text-sm text-[#00632d] bg-[#eaf4ec] rounded-lg transition-colors flex items-center gap-1.5 mt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Store Essentials & Bundles</span>
                </button>
              )}

              {/* Mobile About */}
              {onNavigateToAbout && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToAbout();
                  }}
                  className="px-4 py-2 text-left font-semibold text-sm text-[#2c2417] hover:bg-[#efe7d5] rounded-lg transition-colors"
                >
                  ℹ️ About Us
                </button>
              )}

              {/* Mobile Contact */}
              {onNavigateToContact && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToContact();
                  }}
                  className="px-4 py-2 text-left font-semibold text-sm text-[#2c2417] hover:bg-[#efe7d5] rounded-lg transition-colors"
                >
                  📞 Contact Support
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
