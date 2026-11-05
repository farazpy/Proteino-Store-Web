import React, { useState } from 'react';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Gift,
  Check,
  ChevronRight,
  ArrowLeft,
  Share2,
  ThumbsUp,
  Award,
  Sparkles,
  Info,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { Product } from '../types/store';
import { createProductSlug } from '../data/products';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onAddToCart: (product: Product, selectedSize: string, selectedFlavor?: string) => void;
  onBuyNow: (product: Product, selectedSize: string, selectedFlavor?: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onNavigateToProduct: (slug: string) => void;
  onGoHome: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
  onNavigateToProduct,
  onGoHome,
}) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedFlavor, setSelectedFlavor] = useState(
    product.flavors ? product.flavors[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.image);
  const [isAdding, setIsAdding] = useState(false);
  const [pincode, setPincode] = useState('400001');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(
    'Delivering to 400001 · Express Delivery in 2-3 Business Days'
  );

  // Tab control for details section
  const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'ingredients' | 'recipes'>(
    'overview'
  );

  React.useEffect(() => {
    setSelectedVariant(product.variants[0]);
    setSelectedFlavor(product.flavors ? product.flavors[0] : undefined);
    setActiveImage(product.image);
    setQuantity(1);
  }, [product.id, product.image]);

  // Customer Reviews state (fetched from MySQL)
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await fetch(`/api/products/${product.id}/reviews`);
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            if (isMounted) setReviews(Array.isArray(data) ? data : []);
          }
        }
      } catch (err) {
        console.warn('Reviews fetch fallback to default reviews:', err);
      } finally {
        if (isMounted) setReviewsLoading(false);
      }
    };
    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [product.id]);


  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Image Gallery Thumbnails list
  const galleryImages = [
    product.image,
    product.secondaryImage || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80',
  ];

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeStatus(`Delivering to ${pincode} · Free Express Delivery in 2-3 Days ✓`);
    } else {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN Code.');
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product, selectedVariant.size, selectedFlavor);
    }
    setTimeout(() => setIsAdding(false), 1200);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;

    const createdReview = {
      id: `rev-${Date.now()}`,
      name: newName,
      userName: newName,
      rating: newRating,
      date: 'Today',
      verified: true,
      title: newTitle || 'Great Product!',
      comment: newComment,
      helpfulCount: 0,
    };

    setReviews([createdReview, ...reviews]);
    setReviewSubmitted(true);

    try {
      await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userName: newName,
          rating: newRating,
          comment: newComment,
        }),
      });
    } catch {}

    setTimeout(() => {
      setShowReviewForm(false);
      setReviewSubmitted(false);
      setNewName('');
      setNewTitle('');
      setNewComment('');
    }, 1500);
  };

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="bg-[#fbf7f0] min-h-screen pb-24">
      {/* 1. Breadcrumb Trail Navigation */}
      <div className="bg-[#f2e9db] border-b border-[#e5d8c3] py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[#6e604d]">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={onGoHome}
              className="hover:text-[#00632d] transition-colors font-medium flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3 h-3 text-[#b5a794] shrink-0" />
            <button
              onClick={onGoHome}
              className="hover:text-[#00632d] transition-colors font-medium"
            >
              {product.category}
            </button>
            <ChevronRight className="w-3 h-3 text-[#b5a794] shrink-0" />
            <span className="font-bold text-[#1a221b] truncate max-w-xs sm:max-w-md">
              {product.name}
            </span>
          </div>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: product.name, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Product link copied to clipboard!');
              }
            }}
            className="hidden sm:inline-flex items-center gap-1.5 hover:text-[#00632d] transition-colors font-semibold"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Product Showcase Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery Viewport */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-[#e4d6c0] shadow-md group">
              <img
                src={activeImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badge && (
                  <span className="bg-[#00632d] text-white text-xs font-black px-3 py-1 rounded-lg shadow uppercase tracking-wider">
                    {product.badge}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="bg-[#d90429] text-white text-xs font-black px-3 py-1 rounded-lg shadow uppercase tracking-wider">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Free Gift Tag */}
              {product.hasFreeGift && (
                <div className="absolute bottom-4 left-4 bg-[#8ee000] text-[#004d23] text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 border border-[#6ea804]">
                  <Gift className="w-4 h-4" />
                  <span>{product.hasFreeGift}</span>
                </div>
              )}

              {/* Wishlist Button */}
              <button
                onClick={() => onToggleWishlist(product)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all ${
                  isWishlisted
                    ? 'bg-[#e63946] text-white shadow-lg'
                    : 'bg-white/80 text-[#544636] hover:bg-white hover:text-[#e63946]'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Gallery Thumbnail Row */}
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-white p-1 cursor-pointer ${
                    activeImage === imgUrl
                      ? 'border-[#00632d] ring-2 ring-[#00632d]/20 shadow-sm'
                      : 'border-[#e4d6c0] hover:border-[#00632d]'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${index + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </button>
              ))}
            </div>

            {/* Quality & Trust Certificates Banner */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-[#e4d6c0] text-center text-xs">
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-5 h-5 text-[#00632d] mb-1" />
                <span className="font-bold text-[#1a221b]">Labdoor Tested</span>
                <span className="text-[10px] text-[#786b59]">100% Purity Verified</span>
              </div>
              <div className="flex flex-col items-center border-x border-[#f0e7d8]">
                <Award className="w-5 h-5 text-[#00632d] mb-1" />
                <span className="font-bold text-[#1a221b]">0% Palm Oil</span>
                <span className="text-[10px] text-[#786b59]">Zero Trans Fats</span>
              </div>
              <div className="flex flex-col items-center">
                <Sparkles className="w-5 h-5 text-[#00632d] mb-1" />
                <span className="font-bold text-[#1a221b]">AAA Bold Peanuts</span>
                <span className="text-[10px] text-[#786b59]">Gujarat Roastery</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Purchasing & Specs */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Category tag */}
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#00632d] bg-[#eaf4ec] px-3 py-1 rounded-md mb-2">
                {product.category}
              </span>

              {/* Title */}
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#14361e] leading-snug mb-2">
                {product.name}
              </h1>

              {/* Tagline */}
              <p className="text-sm sm:text-base text-[#615341] font-normal leading-relaxed mb-4">
                {product.tagline}
              </p>

              {/* Ratings and Review Count */}
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <a
                  href="#reviews-section"
                  className="flex items-center gap-1 text-[#ffc400] font-bold hover:underline"
                >
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-[#ffc400]'
                            : 'text-[#e0d2bf]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[#1a221b] ml-1 font-bold">{product.rating}</span>
                </a>
                <span className="text-[#b5a794]">·</span>
                <a
                  href="#reviews-section"
                  className="text-[#00632d] font-bold hover:underline"
                >
                  {product.reviewCount} Verified Reviews
                </a>
                <span className="text-[#b5a794]">·</span>
                <span className="text-emerald-700 font-semibold text-xs bg-[#e8f5e9] px-2 py-0.5 rounded">
                  In Stock & Ready to Ship
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-5 bg-white rounded-2xl border border-[#e4d6c0] shadow-sm">
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-[#00632d] font-mono tabular-nums">
                    ₹{selectedVariant.price.toLocaleString()}
                  </span>
                  {selectedVariant.originalPrice > selectedVariant.price && (
                    <span className="text-base text-[#9c8c78] line-through font-mono tabular-nums">
                      ₹{selectedVariant.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {product.discountPercent > 0 && (
                    <span className="text-xs font-bold bg-[#e63946] text-white px-2.5 py-0.5 rounded-md">
                      Save ₹{(selectedVariant.originalPrice - selectedVariant.price).toLocaleString()} ({product.discountPercent}% OFF)
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-[#756754]">
                Price inclusive of all taxes. Free express shipping on orders over ₹499.
              </p>
            </div>

            {/* Size Variant Selector */}
            {product.variants.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3d3121]">
                    Select Pack Size:
                  </span>
                  <span className="text-xs text-[#00632d] font-bold">
                    {selectedVariant.size}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant.size === v.size;
                    return (
                      <button
                        key={v.size}
                        onClick={() => setSelectedVariant(v)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#00632d] text-white border-[#00632d] shadow-sm'
                            : 'bg-white text-[#3d3121] border-[#dfd2be] hover:border-[#00632d]'
                        }`}
                      >
                        <div className="text-xs font-bold">{v.size}</div>
                        <div className={`text-xs font-mono tabular-nums mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-[#00632d]'}`}>
                          ₹{v.price.toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Flavor Selector if applicable */}
            {product.flavors && product.flavors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3d3121]">
                    Select Flavor:
                  </span>
                  <span className="text-xs text-[#00632d] font-bold">
                    {selectedFlavor}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.flavors.map((fl) => {
                    const isSelected = selectedFlavor === fl;
                    return (
                      <button
                        key={fl}
                        onClick={() => setSelectedFlavor(fl)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#00632d] text-white border-[#00632d]'
                            : 'bg-white text-[#3d3121] border-[#dfd2be] hover:border-[#00632d]'
                        }`}
                      >
                        {fl}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity and Primary Action CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border-2 border-[#d6c7b0] rounded-xl bg-white overflow-hidden h-12">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 text-sm font-bold text-[#4d4030] hover:bg-[#f1e8d8] h-full transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-bold font-mono text-[#1a221b]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 text-sm font-bold text-[#4d4030] hover:bg-[#f1e8d8] h-full transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  onClick={handleAdd}
                  className={`flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                    isAdding
                      ? 'bg-[#8ee000] text-[#004d23]'
                      : 'bg-[#00632d] hover:bg-[#004d23] text-white'
                  }`}
                >
                  {isAdding ? (
                    <>
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>
                        Add to Bag · ₹{(selectedVariant.price * quantity).toLocaleString()}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Buy Now Direct Checkout Button */}
              <button
                onClick={() => onBuyNow(product, selectedVariant.size, selectedFlavor)}
                className="w-full h-12 bg-[#ffc400] hover:bg-[#f0b800] text-[#004d23] font-display font-black text-sm uppercase tracking-wide rounded-xl shadow transition-all cursor-pointer"
              >
                Instant Buy Now
              </button>
            </div>

            {/* PIN Code Delivery Estimator */}
            <div className="p-4 bg-white rounded-2xl border border-[#e4d6c0]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#3d3121] mb-2">
                <Truck className="w-4 h-4 text-[#00632d]" />
                <span>Check Delivery & Express Shipping</span>
              </div>

              <form onSubmit={handlePincodeCheck} className="flex gap-2 mb-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 6-digit PIN code"
                  className="flex-1 px-3 py-2 text-xs bg-[#fbf7f0] border border-[#d6c7b0] rounded-xl font-mono text-[#1a221b] focus:ring-2 focus:ring-[#00632d] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2c2417] hover:bg-[#00632d] text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
                >
                  Check
                </button>
              </form>

              {pincodeStatus && (
                <div className="text-[11px] text-[#00632d] font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#00632d]" />
                  <span>{pincodeStatus}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Specifications & Nutritional Info Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl border border-[#e4d6c0] overflow-hidden shadow-sm">
          {/* Tab Headers */}
          <div className="flex border-b border-[#e5d8c3] overflow-x-auto scrollbar-none bg-[#faf4ea]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                activeTab === 'overview'
                  ? 'border-[#00632d] text-[#00632d] bg-white'
                  : 'border-transparent text-[#6e604d] hover:text-[#1a221b]'
              }`}
            >
              Overview & Features
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`px-6 py-4 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                activeTab === 'nutrition'
                  ? 'border-[#00632d] text-[#00632d] bg-white'
                  : 'border-transparent text-[#6e604d] hover:text-[#1a221b]'
              }`}
            >
              Nutritional Facts
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`px-6 py-4 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                activeTab === 'ingredients'
                  ? 'border-[#00632d] text-[#00632d] bg-white'
                  : 'border-transparent text-[#6e604d] hover:text-[#1a221b]'
              }`}
            >
              Ingredients & Allergens
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`px-6 py-4 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                activeTab === 'recipes'
                  ? 'border-[#00632d] text-[#00632d] bg-white'
                  : 'border-transparent text-[#6e604d] hover:text-[#1a221b]'
              }`}
            >
              How to Enjoy
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-6 sm:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#1a221b] mb-2">
                    Product Description
                  </h3>
                  <p className="text-sm text-[#524433] leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-display text-lg font-bold text-[#1a221b] mb-3">
                    Why You'll Love It
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-[#faf5ec] border border-[#e8dccb]"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#00632d] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ✓
                        </div>
                        <span className="text-xs text-[#3d3121] font-semibold">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#e5d8c3]">
                  <h3 className="font-display text-lg font-bold text-[#1a221b]">
                    Nutrition Facts per Serving
                  </h3>
                  <span className="text-xs font-bold text-[#00632d] bg-[#eaf4ec] px-3 py-1 rounded-full">
                    Serving Size: {product.nutrition.servingSize}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#f7efe1] border border-[#e2d5c0] text-center">
                    <div className="text-xs text-[#736451] mb-1">Protein</div>
                    <div className="font-display text-2xl font-black text-[#00632d] font-mono tabular-nums">
                      {product.nutrition.protein}
                    </div>
                  </div>

                  {product.nutrition.bcaa && (
                    <div className="p-4 rounded-2xl bg-[#f7efe1] border border-[#e2d5c0] text-center">
                      <div className="text-xs text-[#736451] mb-1">Natural BCAAs</div>
                      <div className="font-display text-2xl font-black text-[#00632d] font-mono tabular-nums">
                        {product.nutrition.bcaa}
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-[#f7efe1] border border-[#e2d5c0] text-center">
                    <div className="text-xs text-[#736451] mb-1">Calories</div>
                    <div className="font-display text-2xl font-black text-[#1a221b] font-mono tabular-nums">
                      {product.nutrition.calories}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f7efe1] border border-[#e2d5c0] text-center">
                    <div className="text-xs text-[#736451] mb-1">Carbohydrates</div>
                    <div className="font-display text-2xl font-black text-[#1a221b] font-mono tabular-nums">
                      {product.nutrition.carbs}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f7efe1] border border-[#e2d5c0] text-center">
                    <div className="text-xs text-[#736451] mb-1">Healthy Fats</div>
                    <div className="font-display text-2xl font-black text-[#1a221b] font-mono tabular-nums">
                      {product.nutrition.fat}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f7efe1] border border-[#e2d5c0] text-center">
                    <div className="text-xs text-[#736451] mb-1">Added Sugar</div>
                    <div className="font-display text-2xl font-black text-[#1a221b] font-mono tabular-nums">
                      {product.nutrition.sugar}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-bold text-[#1a221b]">
                  100% Clean Ingredients
                </h3>
                <p className="text-sm text-[#3d3121] leading-relaxed bg-[#fbf7f0] p-4 rounded-2xl border border-[#e4d6c0]">
                  {product.ingredients}
                </p>
                <div className="p-4 bg-[#fff3cd] border border-[#ffeeba] rounded-2xl text-xs text-[#856404] flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Allergen Information:</span> Contains Peanuts and Milk derivatives. Produced in a facility that handles tree nuts, seeds, and soy.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'recipes' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#faf5ec] rounded-2xl border border-[#e4d6c0]">
                  <div className="text-2xl mb-2">🥤</div>
                  <h4 className="font-bold text-sm text-[#1a221b] mb-1">Morning Power Shake</h4>
                  <p className="text-xs text-[#6e604d]">
                    Blend 1 scoop with 250ml chilled almond milk, half a banana, and ice cubes for 30 seconds.
                  </p>
                </div>
                <div className="p-4 bg-[#faf5ec] rounded-2xl border border-[#e4d6c0]">
                  <div className="text-2xl mb-2">🥣</div>
                  <h4 className="font-bold text-sm text-[#1a221b] mb-1">Overnight Oats Bowl</h4>
                  <p className="text-xs text-[#6e604d]">
                    Mix with 50g oats, Greek yogurt, and chia seeds. Refrigerate overnight and top with fresh berries.
                  </p>
                </div>
                <div className="p-4 bg-[#faf5ec] rounded-2xl border border-[#e4d6c0]">
                  <div className="text-2xl mb-2">🥞</div>
                  <h4 className="font-bold text-sm text-[#1a221b] mb-1">Protein Pancakes</h4>
                  <p className="text-xs text-[#6e604d]">
                    Whisk 1 scoop with oat flour, 1 egg, and a dash of cinnamon. Cook on a skillet until golden brown.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Customer Reviews & Ratings Section */}
      <div id="reviews-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl border border-[#e4d6c0] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#e5d8c3]">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#1a221b] mb-1">
                Customer Reviews ({reviews.length})
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex text-[#ffc400]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#ffc400]" />
                  ))}
                </div>
                <span className="text-sm font-bold text-[#1a221b]">
                  {product.rating} out of 5
                </span>
                <span className="text-xs text-[#786b59]">
                  (Based on {product.reviewCount} total purchases)
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-5 py-2.5 bg-[#00632d] hover:bg-[#004d23] text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </button>
          </div>

          {/* Interactive Review Form */}
          {showReviewForm && (
            <form
              onSubmit={handleReviewSubmit}
              className="mt-6 p-5 bg-[#faf5ec] rounded-2xl border border-[#e4d6c0] space-y-4 animate-in fade-in"
            >
              <h3 className="font-display text-base font-bold text-[#1a221b]">
                Share Your Experience with {product.name}
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#3d3121]">Your Rating:</span>
                <div className="flex text-[#ffc400]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newRating ? 'fill-[#ffc400]' : 'text-[#dfd2be]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3d3121] mb-1">
                    Your Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3d3121] mb-1">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Best tasting protein!"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3d3121] mb-1">
                  Your Review *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="How was the flavor, mixability, and performance?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                />
              </div>

              {reviewSubmitted ? (
                <div className="p-3 bg-[#e8f5e9] text-[#00632d] text-xs font-bold rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Thank you! Your verified review has been published.</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#00632d] hover:bg-[#004d23] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Submit Review
                </button>
              )}
            </form>
          )}

          {/* Review List */}
          <div className="divide-y divide-[#ece2cf] mt-6">
            {reviewsLoading ? (
              <div className="py-10 text-center text-xs text-[#8a7a66]">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#8a7a66]">No reviews yet. Be the first to review!</div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="py-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#1a221b]">{rev.userName}</span>
                      <span className="text-[10px] font-bold bg-[#e8f5e9] text-[#00632d] px-2 py-0.5 rounded-full">
                        Verified Buyer ✓
                      </span>
                    </div>
                    <span className="text-xs text-[#8a7c68]">{rev.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex text-[#ffc400]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-[#ffc400]' : 'text-[#dfd2be]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-[#5a5043] leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* 5. Frequently Bought Together / Related Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-display text-2xl font-bold text-[#14361e] mb-6">
          Frequently Bought Together
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {relatedProducts.map((rel) => {
            const slug = createProductSlug(rel.name);
            return (
              <div
                key={rel.id}
                onClick={() => onNavigateToProduct(slug)}
                className="bg-white rounded-2xl border border-[#e4d6c0] overflow-hidden p-4 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#faf4ea] mb-3">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="text-[10px] font-bold text-[#00632d] uppercase">
                    {rel.category}
                  </div>
                  <h3 className="font-display text-sm font-bold text-[#1a221b] line-clamp-2 mt-0.5 group-hover:text-[#00632d] transition-colors">
                    {rel.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f0e7d8] flex items-center justify-between">
                  <div className="text-sm font-bold text-[#00632d] font-mono tabular-nums">
                    ₹{rel.price.toLocaleString()}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(rel, rel.variants[0].size);
                    }}
                    className="p-2 bg-[#00632d] text-white rounded-lg hover:bg-[#004d23] transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Sticky Mobile Purchase Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#e4d6c0] p-3 z-40 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-[#1a221b] truncate max-w-[160px]">
            {product.name}
          </div>
          <div className="text-sm font-black text-[#00632d] font-mono tabular-nums">
            ₹{(selectedVariant.price * quantity).toLocaleString()}
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="px-5 py-2.5 bg-[#00632d] hover:bg-[#004d23] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow active:scale-95 transition-transform"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Bag</span>
        </button>
      </div>
    </div>
  );
};
