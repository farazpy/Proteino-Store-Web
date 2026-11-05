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
import { QuickViewModal } from './components/QuickViewModal';
import { SearchModal } from './components/SearchModal';
import { ProductDetailPage } from './components/ProductDetailPage';
import { StoreEssentialsPage } from './components/StoreEssentialsPage';
import { PolicyPages, PolicySlug } from './components/PolicyPages';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { CartPage } from './components/CartPage';
import { WishlistPage } from './components/WishlistPage';
import { CheckoutPage } from './components/CheckoutPage';
import { AdminPage } from './components/AdminPage';
import { AuthModal } from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';
import { StoreDataProvider, useStoreData } from './context/StoreDataContext';
import { Footer } from './components/Footer';
import { createProductSlug } from './data/products';
import { Product, CartItem, OrderDetails } from './types/store';

// Instruction 1: Increment frontend version number in header after every change/update
const FRONTEND_VERSION = 'v1.6.3';

function StorefrontApp() {
  const { products, categories, reels, coupons, settings } = useStoreData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // View Routing State: now includes /admin along with cart, wishlist, checkout
  const [currentView, setCurrentView] = useState<
    'home' | 'product' | 'essentials' | 'policy' | 'about' | 'contact' | 'cart' | 'wishlist' | 'checkout' | 'admin'
  >(() => {
    const path = window.location.pathname;
    if (path === '/admin' || path.startsWith('/admin/')) return 'admin';
    if (path.startsWith('/product/')) return 'product';
    if (path === '/cart') return 'cart';
    if (path === '/wishlist') return 'wishlist';
    if (path === '/checkout') return 'checkout';
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

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('theproteino_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('theproteino_wishlist');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [, setLastOrder] = useState<OrderDetails | null>(null);

  // Sync cart and wishlist with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('theproteino_cart', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('theproteino_wishlist', JSON.stringify(Array.from(wishlistIds)));
    } catch {}
  }, [wishlistIds]);

  // Browser History Navigation Sync
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin' || path.startsWith('/admin/')) {
        setCurrentView('admin');
      } else if (path.startsWith('/product/')) {
        setCurrentView('product');
        setActiveProductSlug(path.replace('/product/', '').replace(/\/$/, ''));
      } else if (path === '/cart') {
        setCurrentView('cart');
      } else if (path === '/wishlist') {
        setCurrentView('wishlist');
      } else if (path === '/checkout') {
        setCurrentView('checkout');
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
  const handleNavigateToAdmin = () => {
    setCurrentView('admin');
    window.history.pushState({}, '', '/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToProduct = (product: Product | string) => {
    const slug = typeof product === 'string' ? product : createProductSlug(product.name);
    setActiveProductSlug(slug);
    setCurrentView('product');
    window.history.pushState({}, '', `/product/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToCart = () => {
    setCurrentView('cart');
    setIsCartDrawerOpen(false);
    window.history.pushState({}, '', '/cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToWishlist = () => {
    setCurrentView('wishlist');
    window.history.pushState({}, '', '/wishlist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToCheckout = () => {
    setCurrentView('checkout');
    setIsCartDrawerOpen(false);
    window.history.pushState({}, '', '/checkout');
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

    setIsCartDrawerOpen(true);
  };

  const handleBuyNow = (product: Product, size: string, flavor?: string) => {
    handleAddToCart(product, size, flavor);
    setIsCartDrawerOpen(false);
    handleNavigateToCheckout();
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

  // Dynamic Coupon handling connected to MySQL coupons
  const handleApplyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    const matched = coupons.find((c) => c.code.toUpperCase() === clean && c.isActive);
    if (matched || clean === 'PROTEIN15' || clean === 'FREESHAKER') {
      setAppliedCoupon(clean);
      return true;
    }
    return false;
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  // Calculations using dynamic coupons and shipping rules
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  const matchedCouponObj = appliedCoupon
    ? coupons.find((c) => c.code.toUpperCase() === appliedCoupon.toUpperCase())
    : undefined;

  const discountAmount = matchedCouponObj
    ? matchedCouponObj.discountType === 'PERCENT'
      ? Math.round(subtotal * (matchedCouponObj.discountValue / 100))
      : matchedCouponObj.discountValue
    : appliedCoupon === 'PROTEIN15'
    ? Math.round(subtotal * 0.15)
    : appliedCoupon === 'FREESHAKER'
    ? 499
    : 0;

  const freeShippingThreshold = settings.shippingAndTax?.freeShippingThreshold ?? 499;
  const standardShippingFee = settings.shippingAndTax?.standardShippingFee ?? 70;
  const shipping =
    subtotal >= freeShippingThreshold || cartItems.length === 0 ? 0 : standardShippingFee;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleOrderComplete = (order: OrderDetails) => {
    setLastOrder(order);
    setCartItems([]);
  };

  // Selected single product page match from live products
  const activeProduct = activeProductSlug
    ? products.find((p) => createProductSlug(p.name) === activeProductSlug || p.id === activeProductSlug) || null
    : null;
  const wishlistProducts = products.filter((p) => wishlistIds.has(p.id));

  // Render full-screen Admin Console when on /admin
  if (currentView === 'admin') {
    return (
      <AdminPage
        onGoToStorefront={handleNavigateToHome}
        version={FRONTEND_VERSION}
        onViewProduct={handleNavigateToProduct}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf7f0] text-[#1a221b] selection:bg-[#8ee000] selection:text-[#004d23]">
      {/* 1. Slim Promotional Top Banner */}
      <TopAnnouncement onApplyCoupon={handleApplyCoupon} />

      {/* 2. Primary Header with Top Bar Contract and Version Indicator */}
      <Header
        version={FRONTEND_VERSION}
        cartCount={totalCartCount}
        cartTotal={grandTotal}
        onOpenCart={handleNavigateToCart}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (currentView !== 'home') handleNavigateToHome();
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        wishlistCount={wishlistIds.size}
        onOpenWishlist={handleNavigateToWishlist}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onNavigateToEssentials={handleNavigateToEssentials}
        onNavigateToAbout={handleNavigateToAbout}
        onNavigateToContact={handleNavigateToContact}
        onNavigateToHome={handleNavigateToHome}
        onNavigateToProduct={handleNavigateToProduct}
      />

      {/* Main Content Viewport */}
      <main className="flex-1">
        {currentView === 'cart' ? (
          <CartPage
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onProceedToCheckout={handleNavigateToCheckout}
            onGoHome={handleNavigateToHome}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            discountAmount={discountAmount}
          />
        ) : currentView === 'wishlist' ? (
          <WishlistPage
            wishlistProducts={wishlistProducts}
            onRemoveFromWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onOpenProductPage={handleNavigateToProduct}
            onGoHome={handleNavigateToHome}
          />
        ) : currentView === 'checkout' ? (
          <CheckoutPage
            items={cartItems}
            subtotal={subtotal}
            discount={discountAmount}
            couponCode={appliedCoupon || undefined}
            shipping={shipping}
            total={grandTotal}
            onOrderComplete={handleOrderComplete}
            onGoToCart={handleNavigateToCart}
            onGoHome={handleNavigateToHome}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        ) : currentView === 'product' && activeProduct ? (
          <ProductDetailPage
            product={activeProduct}
            allProducts={products}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isWishlisted={wishlistIds.has(activeProduct.id)}
            onToggleWishlist={handleToggleWishlist}
            onNavigateToProduct={(slug) => handleNavigateToProduct(slug)}
            onGoHome={handleNavigateToHome}
          />
        ) : currentView === 'essentials' ? (
          <StoreEssentialsPage
            onAddToCart={handleAddToCart}
            onGoHome={handleNavigateToHome}
            onNavigateToProduct={(slug) => handleNavigateToProduct(slug)}
          />
        ) : currentView === 'about' ? (
          <AboutPage
            onGoHome={handleNavigateToHome}
            onNavigateToEssentials={handleNavigateToEssentials}
          />
        ) : currentView === 'contact' ? (
          <ContactPage onGoHome={handleNavigateToHome} />
        ) : currentView === 'policy' ? (
          <PolicyPages
            currentPolicySlug={currentPolicySlug}
            onSelectPolicy={handleNavigateToPolicy}
            onGoHome={handleNavigateToHome}
          />
        ) : (
          <>
            {/* 3. Hero Campaign Banner */}
            <HeroBanner
              onShopNow={() => {
                const el = document.getElementById('products-gallery');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 4. Shop By Category */}
            <CategoryShowcase
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />

            {/* 5. Customer's Favourite Product Gallery */}
            <ProductGallery
              products={products}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onAddToCart={handleAddToCart}
              onQuickView={(prod) => setQuickViewProduct(prod)}
              onOpenProductPage={(prod) => handleNavigateToProduct(prod)}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
            />

            {/* 6. "Theproteino vs The Rest" Matrix */}
            <ComparisonMatrix />

            {/* 7. Live Milestones & Nutrition Badges */}
            <LiveCounterBanner />

            {/* 8. Community Reels / Watch & Shop */}
            <ReelsShowcase
              reels={reels}
              products={products}
              onAddToCart={(prod, size) => handleAddToCart(prod, size)}
              onQuickView={(prod) => setQuickViewProduct(prod)}
            />

            {/* 9. Brand Story Wave Banner */}
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
        onNavigateToAdmin={handleNavigateToAdmin}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (currentView !== 'home') handleNavigateToHome();
          const el = document.getElementById('products-gallery');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 11. Slide-Over Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleNavigateToCheckout}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        discountAmount={discountAmount}
      />

      {/* 12. Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onOpenProductPage={(slug) => handleNavigateToProduct(slug)}
        isWishlisted={quickViewProduct ? wishlistIds.has(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* 13. Real-time Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(prod) => {
          handleNavigateToProduct(prod);
        }}
      />

      {/* 14. Firebase & MySQL User Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreDataProvider>
        <StorefrontApp />
      </StoreDataProvider>
    </AuthProvider>
  );
}

