import React, { useState } from 'react';
import { ChevronRight, X, ShieldCheck, Heart, Award, Sparkles } from 'lucide-react';

export const BrandStoryBanner: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="relative bg-[#9ce5a7] py-20 px-4 overflow-hidden border-b border-[#80d18d]">
        {/* Soft decorative wave elements */}
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-[#00632d] uppercase tracking-tight leading-[1.1] mb-6">
            INTRODUCING WORLD'S ONLY PEANUT PRODUCT COMPANY
          </h2>

          <p className="text-sm sm:text-base text-[#144723] font-medium max-w-2xl mx-auto leading-relaxed mb-8">
            Fast forward ten years, 70+ products, and a community of over 10 million{' '}
            <span className="bg-[#00632d] text-[#8ee000] px-2 py-0.5 rounded font-bold">
              Peanut Lovers
            </span>{' '}
            later... here we are! But guess what? This is just the beginning.
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-[#8ee000] hover:bg-[#a0f507] text-[#004d23] font-display font-black text-sm sm:text-base px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 uppercase tracking-wide cursor-pointer"
          >
            <span>KNOW MORE</span>
            <ChevronRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </section>

      {/* Brand Story Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#fbf7f0] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#dfd0bd] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#eee3d1] hover:bg-[#00632d] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#00632d] mb-2">
              <Sparkles className="w-4 h-4 text-[#00632d]" />
              <span>Our Gujarat Roastery Roots</span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#1a221b] mb-4">
              Born from a Passion for Unadulterated Peanut Nutrition
            </h3>

            <p className="text-sm text-[#5d5140] leading-relaxed mb-4">
              In 2016, our founders noticed that virtually every jar of peanut butter in Indian stores was stuffed with cheap hydrogenated vegetable oils, excess refined sugar, and synthetic emulsifiers. We set out to change the game.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="bg-white p-4 rounded-2xl border border-[#e6dbc8] text-center">
                <div className="w-10 h-10 rounded-xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#1a221b]">Zero Palm Oil</div>
                <div className="text-[11px] text-[#7d705c] mt-0.5">
                  100% pure roasted peanuts and healthy oleic fats
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e6dbc8] text-center">
                <div className="w-10 h-10 rounded-xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center mx-auto mb-2">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#1a221b]">AAA Bold Peanuts</div>
                <div className="text-[11px] text-[#7d705c] mt-0.5">
                  Sourced straight from Saurashtra farmer collectives
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e6dbc8] text-center">
                <div className="w-10 h-10 rounded-xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#1a221b]">10M+ Community</div>
                <div className="text-[11px] text-[#7d705c] mt-0.5">
                  Empowering fitness lovers across 21 countries
                </div>
              </div>
            </div>

            <p className="text-xs text-[#716452] leading-relaxed mb-6">
              Today, Theproteino has expanded to over 70 high-protein SKUs including ready-to-eat savory masala oats, cold brew protein powders with imported Arabica, crunchy muesli, and on-the-go snack bars. We test every single batch with NABL & Labdoor accredited third-party laboratories.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-[#00632d] hover:bg-[#004d23] text-white font-bold text-sm rounded-xl transition-colors"
            >
              Explore Our Clean Staples
            </button>
          </div>
        </div>
      )}
    </>
  );
};
