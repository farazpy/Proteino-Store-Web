import React from 'react';
import { ArrowRight, ShieldCheck, Zap, HeartHandshake, Award } from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';

interface HeroBannerProps {
  onShopNow: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopNow }) => {
  const { settings } = useStoreData();
  const hero = settings.hero;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f7efdf] via-[#faefe1] to-[#fbf7f0] pt-10 pb-16 md:pt-14 md:pb-20 border-b border-[#ebdcc7]">
      {/* Subtle organic background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8ee000]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#ffc400]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Bold Headline & Value Proposition */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            {/* Top kicker */}
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#00632d] mb-3 flex-wrap">
              <span>{hero.kicker1}</span>
              <span aria-hidden="true">·</span>
              <span>{hero.kicker2}</span>
              <span aria-hidden="true">·</span>
              <span>{hero.kicker3}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#14361e] leading-[1.08] tracking-tight mb-5 text-balance">
              {hero.headlinePrefix}{' '}
              <span className="text-[#00632d] underline decoration-[#8ee000] decoration-wavy decoration-2">
                {hero.headlineHighlight}
              </span>{' '}
              {hero.headlineSuffix}
            </h1>

            <p className="text-base sm:text-lg text-[#524636] leading-relaxed mb-8 max-w-2xl font-normal">
              {hero.subheadline}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                onClick={onShopNow}
                className="bg-[#00632d] hover:bg-[#004d23] text-white font-bold px-7 py-3.5 rounded-xl text-base shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 group cursor-pointer"
              >
                <span>{hero.primaryCtaText}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#comparison-matrix"
                className="bg-white/80 hover:bg-white text-[#00632d] font-bold px-6 py-3.5 rounded-xl text-base border border-[#d2c5b0] hover:border-[#00632d] transition-all shadow-sm"
              >
                {hero.secondaryCtaText}
              </a>
            </div>

            {/* Trust Badges Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#e2d5c0]/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#00632d]/10 text-[#00632d]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1a221b]">{hero.stat1Title}</div>
                  <div className="text-[11px] text-[#6b5f4d]">{hero.stat1Sub}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#00632d]/10 text-[#00632d]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1a221b]">{hero.stat2Title}</div>
                  <div className="text-[11px] text-[#6b5f4d]">{hero.stat2Sub}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#00632d]/10 text-[#00632d]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1a221b]">{hero.stat3Title}</div>
                  <div className="text-[11px] text-[#6b5f4d]">{hero.stat3Sub}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#00632d]/10 text-[#00632d]">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1a221b]">{hero.stat4Title}</div>
                  <div className="text-[11px] text-[#6b5f4d]">{hero.stat4Sub}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Highlight Card */}
              <div className="relative rounded-3xl bg-white p-4 shadow-xl border border-[#e8ddcb] overflow-hidden">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#faf3e8]">
                  <img
                    src={hero.highlightImage}
                    alt={hero.highlightTitle}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#e63946] text-white text-[11px] font-extrabold px-3 py-1 rounded-md shadow-sm">
                    {hero.highlightBadge}
                  </div>
                </div>

                <div className="pt-4 px-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#00632d]">
                      {hero.highlightCategory}
                    </span>
                    <span className="text-xs font-semibold text-[#8a7a63]">
                      {hero.highlightRating}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#1a221b] mb-1">
                    {hero.highlightTitle}
                  </h3>
                  <p className="text-xs text-[#6e614e] mb-3">
                    {hero.highlightSubtitle}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#f0e7d8]">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-[#00632d] font-mono tabular-nums">
                        ₹{hero.highlightPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-[#9d8d77] line-through font-mono tabular-nums">
                        ₹{hero.highlightOriginalPrice.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={onShopNow}
                      className="px-4 py-2 bg-[#00632d] text-white text-xs font-bold rounded-lg hover:bg-[#004d23] transition-colors cursor-pointer"
                    >
                      Quick Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating review callout */}
              <div className="hidden sm:flex absolute -bottom-5 -left-6 bg-white/95 backdrop-blur-md border border-[#e0d3bf] p-3.5 rounded-2xl shadow-lg items-center gap-3 max-w-xs animate-in fade-in">
                <div className="w-10 h-10 rounded-full bg-[#8ee000]/20 flex items-center justify-center text-xl shrink-0">
                  ⚡️
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#1a221b]">
                    {hero.floatingQuote}
                  </div>
                  <div className="text-[11px] text-[#7d6f5c]">
                    {hero.floatingAuthor}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
