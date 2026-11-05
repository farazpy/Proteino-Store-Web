import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';

export const ComparisonMatrix: React.FC = () => {
  const comparisonRows = [
    {
      metric: 'Cost',
      gharKaKhaana: "Mom's Sanity",
      theproteino: 'Moderate & Pocket Friendly',
      junkFood: 'Too High A Price',
    },
    {
      metric: 'Time',
      gharKaKhaana: '20 Mins Prep',
      theproteino: '2 Minutes Instant',
      junkFood: 'Instant (Just Like The Regret)',
    },
    {
      metric: 'Taste',
      gharKaKhaana: 'Homestyle Delicious',
      theproteino: 'Chocolatey & Roasted Crunch',
      junkFood: 'Honestly Good, But Ask Yourself Roz Khaoge?',
    },
    {
      metric: 'Nutrition Value',
      gharKaKhaana: 'High Whole Food',
      theproteino: 'Very High (Calibrated Macros)',
      junkFood: 'Very Low Empty Calories',
    },
    {
      metric: 'Ingredients',
      gharKaKhaana: '100% Natural',
      theproteino: '100% Natural (Zero Palm Oil)',
      junkFood: 'Not At All Safe (Preservatives)',
    },
    {
      metric: 'Protein Intake',
      gharKaKhaana: 'Hard To Track But Moderate',
      theproteino: '26g - 30g Certified Protein',
      junkFood: 'Zero Protein (Pure Sugar/Fat)',
      theproteinoHighlight: true,
    },
  ];

  return (
    <section id="comparison-matrix" className="py-16 md:py-24 bg-gradient-to-b from-[#e3f0e8] via-[#d6ebd9] to-[#dff0e4] border-b border-[#c8dfce] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Card Container styled directly like the user reference */}
        <div className="relative rounded-[2.5rem] border-2 border-[#15803d]/30 bg-[#c6e6d4]/40 backdrop-blur-md p-6 sm:p-10 lg:p-12 shadow-xl">
          {/* Header Tag styled like the angled badge in image_361b34c1.png */}
          <div className="inline-block mb-8 sm:mb-12">
            <div className="bg-[#8ee000] text-[#004d23] font-display text-lg sm:text-2xl font-black px-6 py-2 rounded-2xl shadow-sm border border-[#72b800] -rotate-1 uppercase tracking-tight">
              THEPROTEINO VS. THE REST
            </div>
          </div>

          {/* Desktop Matrix Grid */}
          <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center">
            {/* Headers Row */}
            <div className="col-span-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1e5230] pl-2">
              Metric
            </div>

            <div className="col-span-3 text-center font-display text-base sm:text-2xl font-extrabold text-[#004d23] uppercase">
              GHAR KA KHAANA
            </div>

            {/* Theproteino Highlight Column Header */}
            <div className="col-span-3 text-center">
              <div className="bg-[#00632d] text-white py-3 px-2 sm:px-4 rounded-t-2xl shadow-md border-t-2 border-x-2 border-[#8ee000]/60">
                <div className="flex items-center justify-center gap-1.5 font-display text-lg sm:text-2xl font-black tracking-tight text-[#8ee000]">
                  <span>🥜</span>
                  <span>THEPROTEINO</span>
                </div>
              </div>
            </div>

            <div className="col-span-3 text-center font-display text-base sm:text-2xl font-extrabold text-[#294233] uppercase">
              JUNK FOOD
            </div>

            {/* Rows */}
            {comparisonRows.map((row, idx) => (
              <React.Fragment key={row.metric}>
                {/* Metric Label */}
                <div className="col-span-3 py-4 sm:py-5 font-bold text-xs sm:text-base text-[#123920] border-t border-[#a6d1ba] pl-2">
                  {row.metric}
                </div>

                {/* Ghar Ka Khaana */}
                <div className="col-span-3 py-4 sm:py-5 text-center text-xs sm:text-sm font-semibold text-[#1f4a2d] border-t border-[#a6d1ba] px-2">
                  {row.gharKaKhaana}
                </div>

                {/* Theproteino Center Highlight Card Column */}
                <div className="col-span-3 text-center">
                  <div
                    className={`bg-[#00632d] text-white py-4 sm:py-5 px-3 border-x-2 border-[#8ee000]/60 transition-transform ${
                      idx === comparisonRows.length - 1
                        ? 'rounded-b-2xl border-b-2 pb-6 shadow-xl'
                        : 'border-b border-[#057a38]'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-base text-[#f0fff4] flex items-center justify-center gap-1.5">
                      {row.theproteinoHighlight && (
                        <Sparkles className="w-4 h-4 text-[#8ee000] shrink-0" />
                      )}
                      <span>{row.theproteino}</span>
                    </div>
                  </div>
                </div>

                {/* Junk Food */}
                <div className="col-span-3 py-4 sm:py-5 text-center text-xs sm:text-sm font-medium text-[#4b6154] border-t border-[#a6d1ba] px-2">
                  {row.junkFood.includes('Zero') ? (
                    <span className="font-bold text-red-600 inline-flex items-center gap-1">
                      <X className="w-4 h-4" /> {row.junkFood}
                    </span>
                  ) : (
                    row.junkFood
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Bottom Footnote */}
          <div className="mt-8 pt-4 border-t border-[#a6d1ba] flex flex-col sm:flex-row items-center justify-between text-xs text-[#205232] gap-2">
            <span>✨ Crafted with 100% natural Gujarat peanuts & zero synthetic adulterants</span>
            <span className="font-bold underline cursor-pointer">
              View Certified Labdoor Test Results →
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
