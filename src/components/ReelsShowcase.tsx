import React, { useState } from 'react';
import { Play, Volume2, VolumeX, Heart, ShoppingBag, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { ReelItem, Product } from '../types/store';

interface ReelsShowcaseProps {
  reels: ReelItem[];
  products: Product[];
  onAddToCart: (product: Product, size: string) => void;
  onQuickView: (product: Product) => void;
}

export const ReelsShowcase: React.FC<ReelsShowcaseProps> = ({
  reels,
  products,
  onAddToCart,
  onQuickView,
}) => {
  const [activeReel, setActiveReel] = useState<ReelItem | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());

  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedReels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeProduct = activeReel
    ? products.find((p) => p.id === activeReel.linkedProductId)
    : null;

  return (
    <section className="py-16 md:py-20 bg-[#fcefe1] border-b border-[#e5d4bf] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#00632d] mb-1">
              Community & Fitness Creators
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#14361e] uppercase">
              WATCH, CRUNCH & SHOP
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#73634f] max-w-md">
            Click any video to watch real recipes, taste tests, and post-workout fuel rituals
          </p>
        </div>

        {/* Reels Horizontal Scroll Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {reels.map((reel) => {
            const isLiked = likedReels.has(reel.id);
            return (
              <div
                key={reel.id}
                onClick={() => setActiveReel(reel)}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-[#1a221b]"
              >
                {/* Background image */}
                <img
                  src={reel.image}
                  alt={reel.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20" />

                {/* Play button indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/50 shadow-lg">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Top Bar inside reel: creator tag & like */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between text-white text-xs z-10">
                  <span className="font-bold text-[11px] bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    {reel.handle}
                  </span>
                  <button
                    onClick={(e) => handleToggleLike(reel.id, e)}
                    className="p-1.5 rounded-full bg-black/40 backdrop-blur-sm hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isLiked ? 'fill-red-500 text-red-500' : 'text-white'
                      }`}
                    />
                  </button>
                </div>

                {/* Bottom Card Tag matching screenshot image_c7a48147.png */}
                <div className="absolute inset-x-2.5 bottom-3 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-[#e6d8c3] z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#faf2e4] overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs">
                      🥣
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-[#1a221b] truncate">
                        {reel.productName}
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-black text-[#00632d] font-mono tabular-nums">
                          ₹{reel.productPrice}
                        </span>
                        <span className="text-[10px] text-[#93836d] line-through font-mono tabular-nums">
                          ₹{reel.originalPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Video Reel Interactive Modal */}
        {activeReel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-black aspect-[9/16] shadow-2xl border border-white/10 flex flex-col justify-between">
              {/* Top Controls */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between text-white z-20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#00632d] flex items-center justify-center font-bold text-xs">
                    🥜
                  </div>
                  <div>
                    <div className="text-xs font-bold">{activeReel.creatorName}</div>
                    <div className="text-[10px] text-white/70">{activeReel.handle}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setActiveReel(null)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Video Simulated Backdrop */}
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={activeReel.image}
                  alt={activeReel.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover animate-pulse duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

                {/* Reel Caption */}
                <div className="absolute bottom-24 inset-x-4 text-white z-10 text-left">
                  <p className="text-xs text-white/90 leading-relaxed font-medium mb-2">
                    {activeReel.caption}
                  </p>
                  <span className="text-[10px] uppercase font-bold text-[#8ee000] tracking-wider">
                    #Theproteino #FuelYourEveryday #HighProtein
                  </span>
                </div>
              </div>

              {/* Bottom Sticky Shop Card */}
              {activeProduct && (
                <div className="absolute bottom-4 inset-x-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 z-20 flex items-center justify-between gap-3 shadow-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={activeProduct.image}
                      alt={activeProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1a221b] truncate">
                        {activeProduct.name}
                      </div>
                      <div className="text-xs font-black text-[#00632d] font-mono tabular-nums">
                        ₹{activeProduct.price}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onAddToCart(activeProduct, activeProduct.variants[0].size);
                      setActiveReel(null);
                    }}
                    className="px-4 py-2 bg-[#00632d] hover:bg-[#004d23] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Buy Now</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
