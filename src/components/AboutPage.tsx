import React from 'react';
import { ArrowLeft, ShieldCheck, Award, Heart, Sparkles, CheckCircle2, Users, MapPin } from 'lucide-react';

interface AboutPageProps {
  onGoHome: () => void;
  onNavigateToEssentials: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onGoHome, onNavigateToEssentials }) => {
  return (
    <div className="bg-[#fbf7f0] min-h-screen pb-20">
      {/* Top Hero Banner */}
      <div className="bg-[#004d23] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8ee000] hover:underline mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store Front</span>
          </button>

          <div className="inline-flex items-center gap-2 bg-[#8ee000] text-[#004d23] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Saurashtra Roastery Roots</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-balance">
            REDEFINING INDIAN PEANUT NUTRITION
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto font-normal leading-relaxed">
            We started Theproteino with a simple mission: craft 100% clean, slow-roasted, unadulterated peanut power without cheap palm oil, hidden trans-fats, or excess refined sugar.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Story Blocks */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#e4d6c0] shadow-sm space-y-6">
          <h2 className="font-display text-2xl font-bold text-[#1a221b]">
            Our Story & Gujarat Roastery Legacy
          </h2>

          <p className="text-sm text-[#524433] leading-relaxed">
            In 2016, our founders visited local markets across Gujarat and realized that almost every commercial peanut butter jar contained over 15% hydrogenated palm oil and high-fructose corn syrup. We set out to change that by partnering directly with AAA-grade peanut farming collectives in Saurashtra, Gujarat.
          </p>

          <p className="text-sm text-[#524433] leading-relaxed">
            Today, Theproteino processes over 200 tonnes of slow-roasted peanuts every month using traditional slow-milling techniques. We’ve expanded from classic crunchy peanut butter to ready-to-cook savory masala oats, cold brew protein powders with authentic Arabica coffee, and high-protein muesli.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#f0e7d8]">
            <div className="p-4 rounded-2xl bg-[#faf5ec] border border-[#e4d6c0] text-center">
              <div className="font-display text-3xl font-black text-[#00632d] mb-1">100%</div>
              <div className="text-xs font-bold text-[#1a221b]">AAA Bold Peanuts</div>
              <div className="text-[11px] text-[#786b59]">Sourced from Gujarat</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf5ec] border border-[#e4d6c0] text-center">
              <div className="font-display text-3xl font-black text-[#00632d] mb-1">0%</div>
              <div className="text-xs font-bold text-[#1a221b]">Zero Palm Oil</div>
              <div className="text-[11px] text-[#786b59]">No trans fats or fillers</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf5ec] border border-[#e4d6c0] text-center">
              <div className="font-display text-3xl font-black text-[#00632d] mb-1">10M+</div>
              <div className="text-xs font-bold text-[#1a221b]">Happy Fitness Lovers</div>
              <div className="text-[11px] text-[#786b59]">Across 21 countries</div>
            </div>
          </div>
        </div>

        {/* Quality Pillars */}
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1a221b] mb-6 text-center">
            Our 4 Core Promises
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#e4d6c0] shadow-sm flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center text-xl shrink-0">
                🛡️
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1a221b] mb-1">Labdoor Certified Purity</h3>
                <p className="text-xs text-[#6e604d] leading-relaxed">
                  Every batch undergoes third-party testing for protein accuracy, heavy metals, and zero chemical adulteration.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e4d6c0] shadow-sm flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center text-xl shrink-0">
                🌾
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1a221b] mb-1">100% Australian Rolled Oats</h3>
                <p className="text-xs text-[#6e604d] leading-relaxed">
                  High in beta-glucan soluble fiber for heart health, combined with real dehydrated vegetables and Indian spices.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e4d6c0] shadow-sm flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center text-xl shrink-0">
                ☕️
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1a221b] mb-1">Real Arabica Coffee Infusion</h3>
                <p className="text-xs text-[#6e604d] leading-relaxed">
                  Infused with real micro-milled Arabica beans for an authentic cafe frappe taste in our Supernatural protein powders.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e4d6c0] shadow-sm flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center text-xl shrink-0">
                🌱
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1a221b] mb-1">Zero Refined White Sugar</h3>
                <p className="text-xs text-[#6e604d] leading-relaxed">
                  Sweetened solely with organic desi jaggery or natural Stevia leaf extracts for guilt-free everyday nutrition.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-[#00632d] text-white p-8 rounded-3xl text-center space-y-4 shadow-lg">
          <h3 className="font-display text-2xl font-bold">Ready to Experience Clean Peanut Power?</h3>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto">
            Explore our best-selling peanut spreads, cold brew protein powders, and starter gear.
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateToEssentials}
              className="px-6 py-3 bg-[#8ee000] hover:bg-[#a0f507] text-[#004d23] font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              Explore Store Essentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
