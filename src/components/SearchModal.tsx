import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, ArrowRight, Star } from 'lucide-react';
import { Product } from '../types/store';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.ingredients.toLowerCase().includes(q)
    );
  }, [query, products]);

  if (!isOpen) return null;

  const popularSearches = ['Cold Coffee', 'Masala Oats', 'Peanut Butter', 'Super Bar', 'Thandai'];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm p-4 sm:p-6 flex items-start justify-center pt-20 animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#fbf7f0] rounded-3xl shadow-2xl border border-[#e4d6c0] overflow-hidden cursor-default"
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#e5d8c3] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#00632d] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search protein powder, masala oats, peanut butter..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base font-semibold text-[#1a221b] placeholder-[#8a7c6a] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#8a7c6a] hover:text-[#1a221b] px-2 py-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#f1e8d8] text-[#554737]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Popular searches suggestions */}
        {!query && (
          <div className="p-6">
            <div className="text-xs font-bold uppercase tracking-wider text-[#7d705d] mb-3">
              Popular Searches
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3.5 py-1.5 bg-white border border-[#ded1be] hover:border-[#00632d] hover:text-[#00632d] text-xs font-semibold text-[#483a2a] rounded-xl transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        {query && (
          <div className="max-h-96 overflow-y-auto p-4 divide-y divide-[#ece2cf]">
            {searchResults.length > 0 ? (
              searchResults.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    onSelectProduct(prod);
                    onClose();
                  }}
                  className="py-3 px-3 rounded-2xl hover:bg-white flex items-center justify-between gap-4 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover bg-white border border-[#e6dbc8] shrink-0"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#1a221b] group-hover:text-[#00632d] transition-colors">
                        {prod.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-[#716351]">
                        <span>{prod.category}</span>
                        <span>·</span>
                        <span className="font-bold text-[#ffc400] flex items-center">
                          ★ {prod.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#00632d] font-mono tabular-nums">
                      ₹{prod.price.toLocaleString()}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#8a7a66] group-hover:translate-x-1 group-hover:text-[#00632d] transition-all" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-xs text-[#786b59]">
                No matching peanut power products found for "{query}".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
