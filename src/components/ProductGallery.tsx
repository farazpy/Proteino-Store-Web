import React, { useState, useMemo } from 'react';
import { Product } from '../types/store';
import { ProductCard } from './ProductCard';
import { Search, ArrowUpDown } from 'lucide-react';

interface ProductGalleryProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onAddToCart: (product: Product, size: string, flavor?: string) => void;
  onQuickView: (product: Product) => void;
  onOpenProductPage?: (product: Product) => void;
  wishlistIds: Set<string>;
  onToggleWishlist: (product: Product) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  onAddToCart,
  onQuickView,
  onOpenProductPage,
  wishlistIds,
  onToggleWishlist,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  const categories = [
    'all',
    'Peanut Butter',
    'Protein Powder',
    'Protein Oats',
    'Masala Oats',
    'Super Bar',
    'Super Muesli',
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.ingredients.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // featured / bestseller first
      result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="products-gallery" className="py-14 sm:py-20 bg-[#fbf7f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-[#e6dbc8]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#00632d] uppercase tracking-widest mb-2">
              <span>Direct From Gujarat Roastery</span>
              <span aria-hidden="true">·</span>
              <span>Clean Nutrition</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#14361e]">
              CUSTOMER'S FAVOURITE
            </h2>
            <p className="text-sm text-[#6f6250] mt-1">
              Top-selling high-protein breakfast bowls, peanut spreads & on-the-go fuel
            </p>
          </div>

          {/* Search bar inside gallery for fast lookup */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search oats, peanut butter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-[#d8ccb8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00632d] text-[#1a221b] placeholder-[#998b77]"
              />
              <Search className="w-4 h-4 text-[#8a7b69] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8a7b69] hover:text-[#1a221b]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border border-[#d8ccb8] rounded-xl text-xs font-semibold px-3 py-2.5 pr-8 text-[#2c2317] focus:outline-none focus:ring-2 focus:ring-[#00632d] cursor-pointer"
              >
                <option value="featured">Featured / Bestsellers</option>
                <option value="rating">Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#7c6f5d] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const displayName = cat === 'all' ? 'All Products' : cat;
            const count =
              cat === 'all'
                ? products.length
                : products.filter((p) => p.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#00632d] text-white shadow-sm'
                    : 'bg-white hover:bg-[#f1e8d8] text-[#4d4030] border border-[#d9ccb9]'
                }`}
              >
                <span>{displayName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#eadecd] text-[#615240]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-7">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
                onOpenProductPage={onOpenProductPage}
                isWishlisted={wishlistIds.has(product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#e6dbc8] p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#f3ecdd] flex items-center justify-center text-2xl mx-auto mb-4">
              🥜
            </div>
            <h3 className="font-display text-xl font-bold text-[#1a221b] mb-2">
              No matching products found
            </h3>
            <p className="text-xs text-[#716452] mb-6">
              We couldn't find any products matching your search "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                onSelectCategory('all');
              }}
              className="px-5 py-2.5 bg-[#00632d] text-white text-xs font-bold rounded-xl hover:bg-[#004d23] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
