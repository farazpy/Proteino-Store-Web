import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Gift, Check, Star } from 'lucide-react';
import { Product } from '../types/store';
import { createProductSlug } from '../data/products';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedSize: string, selectedFlavor?: string) => void;
  onQuickView: (product: Product) => void;
  onOpenProductPage?: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
  onOpenProductPage,
  isWishlisted,
  onToggleWishlist,
}) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedFlavor, setSelectedFlavor] = useState(
    product.flavors ? product.flavors[0] : undefined
  );
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    onAddToCart(product, selectedVariant.size, selectedFlavor);
    setTimeout(() => {
      setIsAdding(false);
    }, 1200);
  };

  const handleCardClick = () => {
    if (onOpenProductPage) {
      onOpenProductPage(product);
    } else {
      onQuickView(product);
    }
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl border border-[#e6dbc8] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Top Media Container */}
      <div
        onClick={handleCardClick}
        className="relative aspect-square w-full overflow-hidden bg-[#faf4ea] cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/super-bar-card.png';
          }}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount Badge matching reference screenshot: red rounded badge */}
        {product.discountPercent > 0 && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#d90429] text-white text-[9px] sm:text-[11px] font-black px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md shadow-sm uppercase tracking-tight flex flex-col items-center leading-none">
            <span>{product.discountPercent}%</span>
            <span className="text-[7px] sm:text-[9px] mt-0.5">OFF</span>
          </div>
        )}

        {/* Free Shaker / Special Gift Tag matching reference image_51e6712d.png */}
        {product.hasFreeGift && (
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-[#8ee000] text-[#004d23] text-[8px] sm:text-[10px] font-extrabold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow flex items-center gap-0.5 sm:gap-1 border border-[#6ea804]">
            <Gift className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden xs:inline">FREE SHAKER</span>
            <span className="xs:hidden">FREE GIFT</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all ${
            isWishlisted
              ? 'bg-[#e63946] text-white shadow-md'
              : 'bg-white/80 text-[#544636] hover:bg-white hover:text-[#e63946]'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Floating Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute inset-x-3 bottom-3 hidden lg:group-hover:flex items-center justify-center gap-1.5 py-2 bg-black/75 hover:bg-black text-white text-xs font-bold rounded-xl backdrop-blur-sm transition-all shadow"
        >
          <Eye className="w-4 h-4" />
          <span>Quick View</span>
        </button>
      </div>

      {/* Card Content Container */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Star Rating row matching Alpino reference */}
          <div className="flex items-center justify-between mb-1.5 sm:mb-2 text-[10px] sm:text-xs">
            {product.reviewCount > 0 ? (
              <div className="flex items-center gap-0.5 sm:gap-1 text-[#e67e22]">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-[#ffc400] text-[#ffc400]'
                          : 'text-[#e0d3c0]'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-[#4a3e2e] ml-0.5 sm:ml-1 text-[9px] sm:text-xs">
                  ({product.reviewCount})
                </span>
              </div>
            ) : (
              <span className="text-[#8c7e6c] text-[9px] sm:text-xs">No reviews</span>
            )}

            <span className="text-[8px] sm:text-[10px] font-bold text-[#00632d] uppercase tracking-wider bg-[#eef7f0] px-1 sm:px-2 py-0.5 rounded truncate max-w-[70px] sm:max-w-none">
              {product.category}
            </span>
          </div>

          {/* Product Title */}
          <h3
            onClick={handleCardClick}
            className="font-display text-xs sm:text-base font-bold text-[#1a221b] hover:text-[#00632d] transition-colors line-clamp-2 cursor-pointer leading-snug mb-1"
          >
            {product.name}
          </h3>

          <p className="text-[10px] sm:text-[11px] text-[#786b59] line-clamp-1 mb-2 sm:mb-3">
            {product.tagline}
          </p>

          {/* Size / Variant Selector Tabs */}
          {product.variants.length > 1 && (
            <div className="flex items-center gap-1 mb-2 sm:mb-3 overflow-x-auto pb-1 scrollbar-none">
              {product.variants.map((v) => (
                <button
                  key={v.size}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVariant(v);
                  }}
                  className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border transition-colors whitespace-nowrap shrink-0 ${
                    selectedVariant.size === v.size
                      ? 'bg-[#00632d] text-white border-[#00632d]'
                      : 'bg-[#faf5ec] text-[#554737] border-[#e2d4c0] hover:border-[#00632d]'
                  }`}
                >
                  {v.size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing and Add to Bag */}
        <div className="pt-2 sm:pt-3 border-t border-[#f0e7d8] mt-1 sm:mt-2">
          <div className="flex items-baseline justify-between mb-2 sm:mb-3 flex-wrap gap-1">
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-sm sm:text-lg font-extrabold text-[#00632d] font-mono tabular-nums">
                ₹{selectedVariant.price.toLocaleString()}
              </span>
              {selectedVariant.originalPrice > selectedVariant.price && (
                <span className="text-[10px] sm:text-xs text-[#9d8d77] line-through font-mono tabular-nums">
                  ₹{selectedVariant.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <span className="text-[8px] sm:text-[10px] text-[#716553] font-semibold">
              Tax Incl.
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`w-full py-2 px-2 sm:py-2.5 sm:px-3 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-2 transition-all active:scale-95 shadow-sm ${
              isAdding
                ? 'bg-[#8ee000] text-[#004d23]'
                : 'bg-[#00632d] hover:bg-[#004d23] text-white hover:shadow'
            }`}
          >
            {isAdding ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
