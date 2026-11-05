import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TopAnnouncement } from './components/TopAnnouncement';
import { HeroBanner } from './components/HeroBanner';
import { CategoryShowcase } from './components/CategoryShowcase';
import { ProductGallery } from './components/ProductGallery';
import { ComparisonMatrix } from './components/ComparisonMatrix';
import { LiveCounterBanner } from './components/LiveCounterBanner';
import { ReelsShowcase } from './components/ReelsShowcase';
import { BrandStoryBanner } from './components/BrandStoryBanner';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { QuickViewModal } from './components/QuickViewModal';
import { SearchModal } from './components/SearchModal';
import { ProductDetailPage } from './components/ProductDetailPage';
import { StoreEssentialsPage } from './components/StoreEssentialsPage';
import { PolicyPages, PolicySlug } from './components/PolicyPages';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { Footer } from './components/Footer';
import { PRODUCTS, REELS_DATA, createProductSlug, getProductBySlug } from './data/products';
import { Product, CartItem, OrderDetails } from './types/store';

// Instruction 1: Increment frontend version number in header after every change/update
const FRONTEND_VERSION = 'v1.3.7';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // View Routing State
  const [currentView, setCurrentView] = useState<'home' | 'product' | 'essentials' | 'policy' | 'about' | 'contact'>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/product/')) return 'product';
    if (path === '/essentials') return 'essentials';
    if (path === '/about') return 'about';
    if (path === '/contact') return 'contact';
    if (path.startsWith('/pages/')) return 'policy';
    return 'home';
  });

  const [activeProductSlug, setActiveProductSlug] = useState<string | null>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/product/')) {
      return path.replace('/product/', '').replace(/\/$/, '');
    }
    return null;
  });

  const [currentPolicySlug, setCurrentPolicySlug] = useState<PolicySlug>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/pages/')) {
      const slug = path.replace('/pages/', '').replace(/\/$/, '') as PolicySlug;
      return slug || 'privacy-policy';
    }
    return 'privacy-policy';
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: PRODUCTS[0],
      selectedSize: '1 kg',
      selectedFlavor: 'Cold Coffee',
      quantity: 1,
      unitPrice: 2199,
    },
  ]);

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set(['prod-pb-crunchy']));
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('PROTEIN15');
  const [lastOrder, setLastOrder] = useState<OrderDetails | null>(null);

  // Browser History Navigation Sync
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/product/')) {
        setCurrentView('product');
        setActiveProductSlug(path.replace('/product/', '').replace(/\/$/, ''));
      } else if (path === '/essentials') {
        setCurrentView('essentials');
      } else if (path === '/about') {
        setCurrentView('about');
      } else if (path === '/contact') {
        setCurrentView('contact');
      } else if (path.startsWith('/pages/')) {
        setCurrentView('policy');
        const slug = path.replace('/pages/', '').replace(/\/$/, '') as PolicySlug;
        setCurrentPolicySlug(slug || 'privacy-policy');
      } else {
        setCurrentView('home');
        setActiveProductSlug(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation Trigger Handlers
  const handleNavigateToProduct = (product: Product | string) => {
    const slug = typeof product === 'string' ? product : createProductSlug(product.name);
    setActiveProductSlug(slug);
    setCurrentView('product');
    window.history.pushState({}, '', `/product/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToEssentials = () => {
    setCurrentView('essentials');
    window.history.pushState({}, '', '/essentials');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToAbout = () => {
    setCurrentView('about');
    window.history.pushState({}, '', '/about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToContact = () => {
    setCurrentView('contact');
    window.history.pushState({}, '', '/contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToPolicy = (slug: PolicySlug) => {
    setCurrentPolicySlug(slug);
    setCurrentView('policy');
    window.history.pushState({}, '', `/pages/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToHome = () => {
    setCurrentView('home');
    setActiveProductSlug(null);
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Operations
  const handleAddToCart = (product: Product, size: string, flavor?: string) => {
    const variant = product.variants.find((v) => v.size === size) || product.variants[0];
    const unitPrice = variant.price;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (it) =>
          it.product.id === product.id &&
          it.selectedSize === size &&
          it.selectedFlavor === flavor
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1,
        };
        return next;
      } else {
        return [
          ...prev,
          {
            product,
            selectedSize: size,
            selectedFlavor: flavor,
            quantity: 1,
            unitPrice,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product, size: string, flavor?: string) => {
    handleAddToCart(product, size, flavor);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId, size);
      return;
    }
    setCartItems((prev) =>
      prev.map((it) =>
        it.product.id === productId && it.selectedSize === size
          ? { ...it, quantity }
          : it
      )
    );
  };

  const handleRemoveItem = (productId: string, size: string) => {
    setCartItems((prev) =>
      prev.filter(
        (it) => !(it.product.id === productId && it.selectedSize === size)
      )
    );
  };

  // Wishlist toggle
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) next.delete(product.id);
      else next.add(product.id);
      return next;
    });
  };

  // Coupon handling
  const handleApplyCoupon = (code: string): boolean => {
    if (code === 'PROTEIN15' || code === 'FREESHAKER') {
      setAppliedCoupon(code);
      return true;
    }
    return false;
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  // Calculations
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );
  const discountAmount =
    appliedCoupon === 'PROTEIN15'
      ? Math.round(subtotal * 0.15)
      : appliedCoupon === 'FREESHAKER'
      ? 499
      : 0;

  const FREE_SHIPPING_THRESHOLD = 499;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || cartItems.length === 0 ? 0 : 70;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = (order: OrderDetails) => {
    setLastOrder(order);
    setCartItems([]);
  };

  // Selected single product page match
  const activeProduct = activeProductSlug ? getProductBySlug(activeProductSlug) : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf7f0] text-[#1a221b] selection:bg-[#8ee000] selection:text-[#004d23]">
      {/* 1. Slim Promotional Top Banner */}
      <TopAnnouncement onApplyCoupon={handleApplyCoupon} />

      {/* 2. Primary Header with Top Bar Contract and Version Indicator */}
      <Header
        version={FRONTEND_VERSION}
        cartCount={totalCartCount}
        cartTotal={grandTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (currentView !== 'home') handleNavigateToHome();
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        wishlistCount={wishlistIds.size}
        onOpenWishlist={() => {
          setSelectedCategory('all');
          if (currentView !== 'home') handleNavigateToHome();
          const el = document.getElementById('products-gallery');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onNavigateToEssentials={handleNavigateToEssentials}
        onNavigateToAbout={handleNavigateToAbout}
        onNavigateToContact={handleNavigateToContact}
        onNavigateToHome={handleNavigateToHome}
        onNavigateToProduct={handleNavigateToProduct}
      />

      {/* Main Content Viewport */}
      <main className="flex-1">
        {currentView === 'product' && activeProduct ? (
          /* Single Product Detail Page view for /product/{product-title} */
          <ProductDetailPage
            product={activeProduct}
            allProducts={PRODUCTS}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isWishlisted={wishlistIds.has(activeProduct.id)}
            onToggleWishlist={handleToggleWishlist}
            onNavigateToProduct={(slug) => handleNavigateToProduct(slug)}
            onGoHome={handleNavigateToHome}
          />
        ) : currentView === 'essentials' ? (
          /* Store Essentials Page view for /essentials */
          <StoreEssentialsPage
            onAddToCart={handleAddToCart}
            onGoHome={handleNavigateToHome}
            onNavigateToProduct={(slug) => handleNavigateToProduct(slug)}
          />
        ) : currentView === 'about' ? (
          /* About Us Page view for /about */
          <AboutPage
            onGoHome={handleNavigateToHome}
            onNavigateToEssentials={handleNavigateToEssentials}
          />
        ) : currentView === 'contact' ? (
          /* Contact Us Page view for /contact */
          <ContactPage
            onGoHome={handleNavigateToHome}
          />
        ) : currentView === 'policy' ? (
          /* Store Policy Pages view for /pages/{policy-slug} */
          <PolicyPages
            currentPolicySlug={currentPolicySlug}
            onSelectPolicy={handleNavigateToPolicy}
            onGoHome={handleNavigateToHome}
          />
        ) : (
          /* Storefront Homepage View */
          <>
            {/* 3. Hero Campaign Banner */}
            <HeroBanner
              onShopNow={() => {
                const el = document.getElementById('products-gallery');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 4. Shop By Category (Referencing image_3a54c866.png) */}
            <CategoryShowcase
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />

            {/* 5. Customer's Favourite Product Gallery */}
            <ProductGallery
              products={PRODUCTS}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onAddToCart={handleAddToCart}
              onQuickView={(prod) => setQuickViewProduct(prod)}
              onOpenProductPage={(prod) => handleNavigateToProduct(prod)}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
            />

            {/* 6. "Theproteino vs The Rest" Matrix (Referencing image_361b34c1.png) */}
            <ComparisonMatrix />

            {/* 7. Live Milestones & Nutrition Badges (Referencing image_9d57883d.png) */}
            <LiveCounterBanner />

            {/* 8. Community Reels / Watch & Shop (Referencing image_c7a48147.png) */}
            <ReelsShowcase
              reels={REELS_DATA}
              products={PRODUCTS}
              onAddToCart={(prod, size) => handleAddToCart(prod, size)}
              onQuickView={(prod) => setQuickViewProduct(prod)}
            />

            {/* 9. Brand Story Wave Banner (Referencing image_f7e5a366.png) */}
            <BrandStoryBanner />
          </>
        )}
      </main>

      {/* 10. Comprehensive Footer */}
      <Footer
        onNavigateToPolicy={handleNavigateToPolicy}
        onNavigateToEssentials={handleNavigateToEssentials}
        onNavigateToAbout={handleNavigateToAbout}
        onNavigateToContact={handleNavigateToContact}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (currentView !== 'home') handleNavigateToHome();
          const el = document.getElementById('products-gallery');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 11. Slide-Over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        discountAmount={discountAmount}
      />

      {/* 12. Intuitive Multi-Step Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        subtotal={subtotal}
        discount={discountAmount}
        couponCode={appliedCoupon || undefined}
        shipping={shipping}
        total={grandTotal}
        onOrderComplete={handleOrderComplete}
      />

      {/* 13. Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onOpenProductPage={(slug) => handleNavigateToProduct(slug)}
        isWishlisted={quickViewProduct ? wishlistIds.has(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* 14. Real-time Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={PRODUCTS}
        onSelectProduct={(prod) => {
          handleNavigateToProduct(prod);
        }}
      />
    </div>
  );
}
