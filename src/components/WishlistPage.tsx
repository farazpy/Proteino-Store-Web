import React from 'react';
import { ArrowLeft, Heart, ShoppingBag, Trash2, Eye, Star } from 'lucide-react';
import { Product } from '../types/store';

interface WishlistPageProps {
  wishlistProducts: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
  onOpenProductPage: (product: Product) => void;
  onGoHome: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart,
  onOpenProductPage,
  onGoHome,
}) => {
  return (
    <div className="bg-[#fbf7f0] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb & Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#e6dbc8]">
          <div>
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00632d] hover:underline mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store Front</span>
            </button>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#14361e] flex items-center gap-3">
              <span>My Wishlist</span>
              <span className="text-base font-mono text-[#e63946] bg-[#fde8e8] px-3 py-1 rounded-full font-bold">
                {wishlistProducts.length} Saved
              </span>
            </h1>
          </div>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#e4d6c0] p-8 max-w-lg mx-auto shadow-sm">
            <div className="w-20 h-20 rounded-full bg-[#fde8e8] text-[#e63946] flex items-center justify-center text-3xl mx-auto mb-4">
              <Heart className="w-10 h-10 fill-current" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[#1a221b] mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-[#786b59] mb-8 leading-relaxed">
              Save your favourite peanut butter jars, protein oats, and gym bundles by tapping the heart icon on any product.
            </p>
            <button
              onClick={onGoHome}
              className="px-8 py-3.5 bg-[#00632d] hover:bg-[#004d23] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Explore Products →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 md:gap-7">
            {wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl border border-[#e6dbc8] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Media Container */}
                <div
                  onClick={() => onOpenProductPage(product)}
                  className="relative aspect-square w-full overflow-hidden bg-[#faf4ea] cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Remove from Wishlist icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromWishlist(product);
                    }}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white/90 text-[#e63946] hover:bg-[#e63946] hover:text-white transition-all shadow"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  {product.discountPercent > 0 && (
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#d90429] text-white text-[9px] sm:text-[11px] font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-sm uppercase">
                      {product.discountPercent}% OFF
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1 text-[10px] sm:text-xs">
                      <span className="text-[8px] sm:text-[10px] font-bold text-[#00632d] uppercase tracking-wider bg-[#eef7f0] px-1.5 py-0.5 rounded">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-1 text-[#e67e22]">
                        <Star className="w-3 h-3 fill-[#ffc400] text-[#ffc400]" />
                        <span className="font-bold text-[#4a3e2e] text-[9px] sm:text-xs">
                          {product.rating}
                        </span>
                      </div>
                    </div>

                    <h3
                      onClick={() => onOpenProductPage(product)}
                      className="font-display text-xs sm:text-base font-bold text-[#1a221b] hover:text-[#00632d] transition-colors line-clamp-2 cursor-pointer leading-snug mb-1"
                    >
                      {product.name}
                    </h3>

                    <p className="text-[10px] sm:text-[11px] text-[#786b59] line-clamp-1 mb-3">
                      {product.tagline}
                    </p>
                  </div>

                  <div className="pt-2 sm:pt-3 border-t border-[#f0e7d8]">
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="flex items-baseline gap-1 sm:gap-2">
                        <span className="text-sm sm:text-lg font-extrabold text-[#00632d] font-mono tabular-nums">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-[10px] sm:text-xs text-[#9d8d77] line-through font-mono tabular-nums">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onAddToCart(product, product.variants[0].size)}
                      className="w-full py-2 px-2 sm:py-2.5 sm:px-3 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs bg-[#00632d] hover:bg-[#004d23] text-white flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
