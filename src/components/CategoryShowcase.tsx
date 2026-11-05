import React from 'react';

interface CategoryShowcaseProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: any[];
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  selectedCategory,
  onSelectCategory,
  categories: dynamicCategories,
}) => {
  const categories = dynamicCategories.filter(c => c.id !== 'all');

  return (
    <section className="py-12 md:py-16 bg-[#fcf5eb] border-b border-[#e9dcce]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading matching reference image: green Fredoka all-caps */}
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#00632d] uppercase">
            SHOP BY CATEGORY
          </h2>
          <p className="text-sm sm:text-base text-[#6d604d] mt-2 max-w-xl mx-auto">
            Choose from our clean, slow-roasted, preservative-free high-protein staples
          </p>
        </div>

        {/* Circular Categories Grid matching visual design in attachment */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-6 md:gap-8 justify-items-center">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  const el = document.getElementById('products-gallery');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group flex flex-col items-center text-center cursor-pointer transition-all duration-300 w-full max-w-[170px] ${
                  isSelected ? 'scale-105' : 'hover:-translate-y-1'
                }`}
              >
                {/* Circular dish wrapper */}
                <div
                  className={`relative w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full p-1.5 sm:p-2.5 transition-all shadow-md group-hover:shadow-xl ${
                    cat.bgTone
                  } ${
                    isSelected
                      ? 'ring-2 sm:ring-4 ring-[#00632d] ring-offset-1 sm:ring-offset-2 shadow-lg'
                      : 'border border-[#e3d5c2] sm:border-2 group-hover:border-[#00632d]'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-white shadow-inner">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Subtle Badge */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#00632d] text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full whitespace-nowrap shadow-sm max-w-[90%] truncate">
                    {cat.badge}
                  </div>
                </div>

                {/* Category Label */}
                <span
                  className={`mt-2 sm:mt-4 font-display text-xs sm:text-lg font-bold tracking-tight transition-colors line-clamp-1 ${
                    isSelected ? 'text-[#00632d]' : 'text-[#2b2417] group-hover:text-[#00632d]'
                  }`}
                >
                  {cat.name}
                </span>

                <span className="text-[11px] text-[#7d705c] mt-0.5">
                  Explore items →
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter reset helper if filtered */}
        {selectedCategory !== 'all' && (
          <div className="text-center mt-8">
            <button
              onClick={() => onSelectCategory('all')}
              className="text-xs font-bold text-[#00632d] underline hover:text-[#004d23] transition-colors"
            >
              Showing category: "{selectedCategory}" · Click to show all products
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
