import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, ShieldCheck, Check, Sparkles, Star, Gift, Truck } from 'lucide-react';
import { Product } from '../types/store';

interface StoreEssentialsPageProps {
  onAddToCart: (product: Product, selectedSize: string) => void;
  onGoHome: () => void;
  onNavigateToProduct: (slug: string) => void;
}

export const ESSENTIALS_PRODUCTS: Product[] = [
  {
    id: 'ess-shaker',
    name: 'Theproteino Stainless Steel Gym Shaker (700ml)',
    tagline: '100% Leak-Proof · Double-Wall Insulated · Whiskey Ball Mixer',
    category: 'Super Bar',
    price: 499,
    originalPrice: 799,
    discountPercent: 37,
    rating: 4.9,
    reviewCount: 520,
    image: 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?auto=format&fit=crop&w=800&q=80',
    badge: 'MUST HAVE',
    isBestseller: true,
    variants: [{ size: '700ml Black Gold', price: 499, originalPrice: 799 }],
    nutrition: {
      protein: 'N/A',
      calories: 'N/A',
      carbs: 'N/A',
      fat: 'N/A',
      sugar: 'N/A',
      servingSize: '1 Shaker',
    },
    features: [
      'Food-grade 304 Stainless Steel construction',
      'Keeps cold coffee chilled for up to 12 hours',
      'Silent spring whisk ball for clump-free protein shakes',
      'Sweat-proof matte grip coating',
    ],
    ingredients: 'BPA-Free Tritan Cap, 304 Surgical Grade Stainless Steel Body.',
    description: 'Ditch plastic shakers. Our surgical-grade stainless steel shaker keeps your cold coffee protein iced and lump-free.',
    inStock: true,
  },
  {
    id: 'ess-spreader-knife',
    name: 'Artisanal Neem Wood Peanut Butter Spreader & Scoop',
    tagline: 'Natural Anti-Bacterial Neem Wood · Non-Scratch · Ergonomic Curve',
    category: 'Peanut Butter',
    price: 199,
    originalPrice: 299,
    discountPercent: 33,
    rating: 4.8,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1588791174744-7e9bf4378277?auto=format&fit=crop&w=800&q=80',
    badge: 'ECO ESSENTIAL',
    isBestseller: false,
    variants: [{ size: 'Set of 2 Spatulas', price: 199, originalPrice: 299 }],
    nutrition: {
      protein: 'N/A',
      calories: 'N/A',
      carbs: 'N/A',
      fat: 'N/A',
      sugar: 'N/A',
      servingSize: '1 Spatula Set',
    },
    features: [
      'Handcrafted from 100% organic Indian Neem wood',
      'Naturally antibacterial and chemical-free polish',
      'Reaches bottom corners of 1kg jars effortlessly',
      'Zero scratch safety for glass jars',
    ],
    ingredients: '100% Certified Indian Neem Wood.',
    description: 'Designed specifically for natural peanut butter. Spreads smoothly over warm sourdough or roti without tearing bread.',
    inStock: true,
  },
  {
    id: 'ess-bundle-starter',
    name: 'Theproteino Ultimate Fitness Starter Kit',
    tagline: '1kg Crunchy PB + 1kg Cold Coffee Protein + FREE Stainless Shaker',
    category: 'Protein Powder',
    price: 2499,
    originalPrice: 3448,
    discountPercent: 27,
    rating: 5.0,
    reviewCount: 840,
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80',
    badge: 'SUPER SAVER BUNDLE',
    isBestseller: true,
    hasFreeGift: 'Free Shaker (₹499 value)',
    variants: [{ size: 'Complete 3-Piece Kit', price: 2499, originalPrice: 3448 }],
    nutrition: {
      protein: '26g-30g',
      calories: '158 kcal',
      carbs: '6g',
      fat: '3.1g',
      sugar: '0g Added',
      servingSize: 'Daily Staples',
    },
    features: [
      'Includes 1kg All Natural Crunchy Peanut Butter',
      'Includes 1kg Supernatural Peanut Protein Cold Coffee',
      'Includes 1 FREE 700ml Stainless Steel Gym Shaker',
      'Saves ₹949 compared to buying items individually',
    ],
    ingredients: 'Roasted Peanuts, Whey Isolate, Arabica Coffee, Stevia.',
    description: 'The ultimate bundle for fitness enthusiasts. Includes your daily dose of 30g protein peanut butter, 26g cold brew protein powder, and our leak-proof shaker.',
    inStock: true,
  },
  {
    id: 'ess-bowl-set',
    name: 'Coconut Shell Handcrafted Oats & Smoothie Bowl Set',
    tagline: '100% Reclaimed Coconut Shells · Organic Wooden Spoon · Eco-Friendly',
    category: 'Protein Oats',
    price: 349,
    originalPrice: 499,
    discountPercent: 30,
    rating: 4.9,
    reviewCount: 215,
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=800&q=80',
    badge: 'ZERO WASTE',
    variants: [{ size: 'Bowl + Ebony Spoon Set', price: 349, originalPrice: 499 }],
    nutrition: {
      protein: 'N/A',
      calories: 'N/A',
      carbs: 'N/A',
      fat: 'N/A',
      sugar: 'N/A',
      servingSize: '1 Bowl Set',
    },
    features: [
      'Polished with organic virgin coconut oil',
      'Ideal for dark chocolate protein oats and super muesli',
      'Washable, reusable & 100% biodegradable',
    ],
    ingredients: 'Natural Coconut Shells & Palm Wood Spoon.',
    description: 'Elevate your morning breakfast ritual. Made from reclaimed coconut shells, perfect for instagrammable protein oats bowls.',
    inStock: true,
  },
];

export const StoreEssentialsPage: React.FC<StoreEssentialsPageProps> = ({
  onAddToCart,
  onGoHome,
  onNavigateToProduct,
}) => {
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleAdd = (product: Product) => {
    onAddToCart(product, product.variants[0].size);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <div className="bg-[#fbf7f0] min-h-screen pb-20">
      {/* Top Banner Header */}
      <div className="bg-[#004d23] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8ee000] hover:underline mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store Front</span>
          </button>

          <div className="inline-flex items-center gap-2 bg-[#8ee000] text-[#004d23] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Theproteino Pantry & Gear</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 text-balance">
            STORE ESSENTIALS & BUNDLES
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl font-normal leading-relaxed">
            Curated fitness gear, leak-proof stainless steel shakers, artisanal neem spatulas, and discounted starter bundles to supercharge your high-protein lifestyle.
          </p>
        </div>
      </div>

      {/* Essentials Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          {ESSENTIALS_PRODUCTS.map((prod) => {
            const isAdded = addedId === prod.id;
            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-[#e4d6c0] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-2.5 sm:p-5"
              >
                <div>
                  <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-[#faf4ea] mb-3 sm:mb-4 border border-[#eee4d5]">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                    {prod.badge && (
                      <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#00632d] text-white text-[8px] sm:text-[10px] font-extrabold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md shadow uppercase">
                        {prod.badge}
                      </span>
                    )}
                    {prod.discountPercent > 0 && (
                      <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#d90429] text-white text-[8px] sm:text-[10px] font-extrabold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow uppercase">
                        {prod.discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[#ffc400] text-[10px] sm:text-xs font-bold mb-1">
                    <span>★ {prod.rating}</span>
                    <span className="text-[#8c7e6c]">({prod.reviewCount})</span>
                  </div>

                  <h3 className="font-display text-xs sm:text-base font-bold text-[#1a221b] mb-1 line-clamp-2 leading-snug">
                    {prod.name}
                  </h3>

                  <p className="text-[10px] sm:text-xs text-[#786b59] line-clamp-1 mb-2 sm:mb-3">
                    {prod.tagline}
                  </p>

                  <ul className="text-[10px] sm:text-[11px] text-[#554737] space-y-1 mb-3 sm:mb-4 bg-[#faf5ec] p-2 sm:p-3 rounded-xl border border-[#eae0ce]">
                    {prod.features.slice(0, 2).map((feat, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00632d] shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-[#f0e7d8]">
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-[#00632d] font-mono tabular-nums">
                        ₹{prod.price.toLocaleString()}
                      </span>
                      {prod.originalPrice > prod.price && (
                        <span className="text-xs text-[#9d8d77] line-through font-mono tabular-nums">
                          ₹{prod.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-[#00632d] bg-[#eaf4ec] px-2 py-0.5 rounded">
                      In Stock
                    </span>
                  </div>

                  <button
                    onClick={() => handleAdd(prod)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-[#8ee000] text-[#004d23]'
                        : 'bg-[#00632d] hover:bg-[#004d23] text-white shadow-sm'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Added to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add Essential to Bag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Value Callout Banner */}
        <div className="mt-16 bg-white p-8 rounded-3xl border border-[#e4d6c0] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center text-xl mb-3">
              🚚
            </div>
            <h4 className="font-display font-bold text-base text-[#1a221b] mb-1">
              Free Express Delivery
            </h4>
            <p className="text-xs text-[#716452]">
              On all orders above ₹499. Dispatched within 24 hours from Gujarat.
            </p>
          </div>

          <div className="flex flex-col items-center border-y md:border-y-0 md:border-x border-[#f0e7d8] py-4 md:py-0">
            <div className="w-12 h-12 rounded-2xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center text-xl mb-3">
              🛡️
            </div>
            <h4 className="font-display font-bold text-base text-[#1a221b] mb-1">
              100% Quality Guaranteed
            </h4>
            <p className="text-xs text-[#716452]">
              Labdoor certified purity & 7-day hassle-free damaged item replacement.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center text-xl mb-3">
              🎁
            </div>
            <h4 className="font-display font-bold text-base text-[#1a221b] mb-1">
              Free Shaker Gifts
            </h4>
            <p className="text-xs text-[#716452]">
              Get a complimentary stainless steel shaker on all cart values over ₹1,499.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
