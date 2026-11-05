import React, { useState } from 'react';
import { X, Star, ShoppingBag, ShieldCheck, Check, Heart, ExternalLink } from 'lucide-react';
import { Product } from '../types/store';
import { createProductSlug } from '../data/products';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, flavor?: string) => void;
  onOpenProductPage?: (slug: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onOpenProductPage,
  isWishlisted,
  onToggleWishlist,
}) => {
  if (!product) return null;

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedFlavor, setSelectedFlavor] = useState(
    product.flavors ? product.flavors[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'nutrition' | 'reviews'>('details');
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  React.useEffect(() => {
    let isMounted = true;
    if (activeTab === 'reviews' && product) {
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
          console.warn('Reviews fetch notice in QuickViewModal:', err);
        } finally {
          if (isMounted) setReviewsLoading(false);
        }
      };
      fetchReviews();
    }
    return () => {
      isMounted = false;
    };
  }, [activeTab, product?.id]);

  const slug = createProductSlug(product.name);

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product, selectedVariant.size, selectedFlavor);
    }
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-[#fbf7f0] rounded-3xl shadow-2xl border border-[#e4d6c0] overflow-hidden my-8 cursor-default"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-[#574938] hover:text-[#1a221b] transition-colors shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Media column */}
          <div className="p-6 bg-[#f7efe1] flex flex-col items-center justify-center relative">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-md border border-[#e8ddcb]">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {product.discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-[#d90429] text-white text-xs font-black px-2.5 py-1 rounded-md shadow uppercase">
                  {product.discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Badges & Full Page Link */}
            <div className="w-full flex flex-col gap-2 mt-4">
              <div className="flex items-center justify-center gap-2 text-[11px] text-[#554737] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#00632d]" />
                <span>Labdoor Certified · 0% Palm Oil</span>
              </div>

              {onOpenProductPage && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenProductPage(slug);
                  }}
                  className="w-full py-2 bg-white hover:bg-[#00632d] hover:text-white border border-[#d6c7b0] text-[#00632d] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Full Product Page (/product/{slug})</span>
                </button>
              )}
            </div>
          </div>

          {/* Details column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-[#00632d] uppercase tracking-wider bg-[#eaf4ec] px-2.5 py-0.5 rounded-full">
                  {product.category}
                </span>

                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`p-1.5 rounded-full text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                    isWishlisted ? 'text-red-600 font-bold' : 'text-[#756754]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  <span className="text-[11px]">{isWishlisted ? 'Wishlisted' : 'Save'}</span>
                </button>
              </div>

              <h2
                onClick={() => {
                  if (onOpenProductPage) {
                    onClose();
                    onOpenProductPage(slug);
                  }
                }}
                className="font-display text-xl sm:text-2xl font-bold text-[#1a221b] mb-1 hover:text-[#00632d] transition-colors cursor-pointer"
              >
                {product.name}
              </h2>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-[#ffc400]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-[#ffc400]'
                          : 'text-[#dfd2be]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#453828]">
                  {product.rating} ({product.reviewCount} customer reviews)
                </span>
              </div>

              {/* Price row */}
              <div className="flex items-baseline gap-2.5 mb-4 pb-4 border-b border-[#e9dcce]">
                <span className="text-2xl font-black text-[#00632d] font-mono tabular-nums">
                  ₹{selectedVariant.price.toLocaleString()}
                </span>
                {selectedVariant.originalPrice > selectedVariant.price && (
                  <span className="text-sm text-[#9b8b76] line-through font-mono tabular-nums">
                    ₹{selectedVariant.originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-[11px] text-[#6b5d4b] font-medium ml-1">
                  (Inclusive of all taxes)
                </span>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-[#e5d8c3] mb-4 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'details'
                      ? 'border-[#00632d] text-[#00632d]'
                      : 'border-transparent text-[#716350] hover:text-[#1a221b]'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('nutrition')}
                  className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'nutrition'
                      ? 'border-[#00632d] text-[#00632d]'
                      : 'border-transparent text-[#716350] hover:text-[#1a221b]'
                  }`}
                >
                  Nutrition Facts
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'border-[#00632d] text-[#00632d]'
                      : 'border-transparent text-[#716350] hover:text-[#1a221b]'
                  }`}
                >
                  Reviews ({product.reviewCount})
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'details' && (
                <div className="space-y-3 text-xs text-[#524433] max-h-40 overflow-y-auto pr-1">
                  <p className="leading-relaxed">{product.description}</p>
                  <div>
                    <span className="font-bold text-[#1a221b]">Key Highlights:</span>
                    <ul className="list-disc pl-4 space-y-1 mt-1 text-[11px]">
                      {product.features.map((feat, i) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-[#1a221b]">Ingredients:</span>
                    <p className="text-[11px] mt-0.5 text-[#6b5c49]">{product.ingredients}</p>
                  </div>
                </div>
              )}

              {activeTab === 'nutrition' && (
                <div className="text-xs max-h-40 overflow-y-auto pr-1">
                  <div className="text-[11px] text-[#786956] mb-2 font-medium">
                    Serving Size: <span className="font-bold text-[#1a221b]">{product.nutrition.servingSize}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-[#e4d6c0]">
                      <div className="text-[10px] text-[#716351]">Protein</div>
                      <div className="text-sm font-bold text-[#00632d] font-mono tabular-nums">{product.nutrition.protein}</div>
                    </div>
                    {product.nutrition.bcaa && (
                      <div className="bg-white p-2.5 rounded-xl border border-[#e4d6c0]">
                        <div className="text-[10px] text-[#716351]">Natural BCAAs</div>
                        <div className="text-sm font-bold text-[#00632d] font-mono tabular-nums">{product.nutrition.bcaa}</div>
                      </div>
                    )}
                    <div className="bg-white p-2.5 rounded-xl border border-[#e4d6c0]">
                      <div className="text-[10px] text-[#716351]">Calories</div>
                      <div className="text-sm font-bold text-[#1a221b] font-mono tabular-nums">{product.nutrition.calories}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-[#e4d6c0]">
                      <div className="text-[10px] text-[#716351]">Carbohydrates</div>
                      <div className="text-sm font-bold text-[#1a221b] font-mono tabular-nums">{product.nutrition.carbs}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-[#e4d6c0]">
                      <div className="text-[10px] text-[#716351]">Fats</div>
                      <div className="text-sm font-bold text-[#1a221b] font-mono tabular-nums">{product.nutrition.fat}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-[#e4d6c0]">
                      <div className="text-[10px] text-[#716351]">Sugar</div>
                      <div className="text-sm font-bold text-[#1a221b] font-mono tabular-nums">{product.nutrition.sugar}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="text-xs space-y-3 max-h-40 overflow-y-auto pr-1">
                  {reviewsLoading ? (
                    <div className="py-4 text-center text-[10px] text-[#8a7a66]">Loading reviews...</div>
                  ) : reviews.length === 0 ? (
                    <div className="py-4 text-center text-[10px] text-[#8a7a66]">No reviews yet.</div>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="bg-white p-3 rounded-xl border border-[#e6dbc8]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#1a221b]">{rev.userName}</span>
                          <span className="text-[10px] text-[#857663]">{rev.date}</span>
                        </div>
                        <div className="flex text-[#ffc400] mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-2.5 h-2.5 ${i < rev.rating ? 'fill-[#ffc400]' : 'text-[#dfd2be]'}`} />
                          ))}
                        </div>
                        <p className="text-[10px] text-[#554635] leading-relaxed">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}


              {/* Variant Picker */}
              <div className="mt-4 pt-3 border-t border-[#e9dcce]">
                <div className="text-xs font-bold text-[#3d3121] mb-2">
                  Select Pack Size:
                </div>
                <div className="flex gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.size}
                      onClick={() => setSelectedVariant(v)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                        selectedVariant.size === v.size
                          ? 'bg-[#00632d] text-white border-[#00632d]'
                          : 'bg-white text-[#4a3d2c] border-[#d8cab7] hover:border-[#00632d]'
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flavor Picker if applicable */}
              {product.flavors && product.flavors.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-bold text-[#3d3121] mb-1.5">
                    Select Flavor:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.flavors.map((fl) => (
                      <button
                        key={fl}
                        onClick={() => setSelectedFlavor(fl)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          selectedFlavor === fl
                            ? 'bg-[#00632d] text-white border-[#00632d]'
                            : 'bg-white text-[#4a3d2c] border-[#d8cab7] hover:border-[#00632d]'
                        }`}
                      >
                        {fl}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Add to Bag Action */}
            <div className="mt-6 pt-3 border-t border-[#e9dcce] flex items-center gap-3">
              <div className="flex items-center border border-[#d6c7b0] rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-xs font-bold text-[#554736] hover:bg-[#f1e8d8] cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold font-mono text-[#1a221b]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-xs font-bold text-[#554736] hover:bg-[#f1e8d8] cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                  added ? 'bg-[#8ee000] text-[#004d23]' : 'bg-[#00632d] hover:bg-[#004d23] text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag · ₹{(selectedVariant.price * quantity).toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
