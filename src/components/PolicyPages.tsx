import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, FileText, RefreshCw, Truck, Award, Printer, CheckCircle2 } from 'lucide-react';

export type PolicySlug =
  | 'privacy-policy'
  | 'terms-of-service'
  | 'refund-policy'
  | 'shipping-policy'
  | 'quality-certifications';

interface PolicyPagesProps {
  currentPolicySlug: PolicySlug;
  onSelectPolicy: (slug: PolicySlug) => void;
  onGoHome: () => void;
}

export const PolicyPages: React.FC<PolicyPagesProps> = ({
  currentPolicySlug,
  onSelectPolicy,
  onGoHome,
}) => {
  const policiesList: { slug: PolicySlug; title: string; icon: any }[] = [
    { slug: 'privacy-policy', title: 'Privacy Policy', icon: ShieldCheck },
    { slug: 'terms-of-service', title: 'Terms of Service', icon: FileText },
    { slug: 'refund-policy', title: 'Refund & Return Policy', icon: RefreshCw },
    { slug: 'shipping-policy', title: 'Shipping & Delivery', icon: Truck },
    { slug: 'quality-certifications', title: 'Quality Certifications', icon: Award },
  ];

  return (
    <div className="bg-[#fbf7f0] min-h-screen pb-20">
      {/* Policy Page Header */}
      <div className="bg-[#1b261e] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#2d4233]">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8ee000] hover:underline mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store Front</span>
          </button>

          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Theproteino Legal & Store Policies
          </h1>
          <p className="text-xs sm:text-sm text-[#a3b8aa]">
            Transparent, customer-first terms for India’s cleanest peanut nutrition brand.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar Navigation */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#7d705d] mb-3 px-2">
              Policy Documents
            </div>
            {policiesList.map((item) => {
              const IconComp = item.icon;
              const isActive = currentPolicySlug === item.slug;
              return (
                <button
                  key={item.slug}
                  onClick={() => onSelectPolicy(item.slug)}
                  className={`w-full text-left p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#00632d] text-white shadow-md'
                      : 'bg-white hover:bg-[#f1e8d8] text-[#3d3121] border border-[#e4d6c0]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className="w-4 h-4" />
                    <span>{item.title}</span>
                  </div>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-[#8ee000]" />}
                </button>
              );
            })}

            <div className="p-4 bg-[#eaf4ec] rounded-2xl border border-[#c8e6c9] mt-6 text-xs text-[#00632d]">
              <div className="font-bold mb-1">Need direct assistance?</div>
              <div className="text-[11px] text-[#2e5c38]">
                Reach our customer care team at <span className="font-bold">support@theproteino.com</span> or WhatsApp at <span className="font-bold">+91 98765 43210</span>.
              </div>
            </div>
          </div>

          {/* Right Policy Document Viewport */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#e4d6c0] p-6 sm:p-10 shadow-sm text-left">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0e7d8]">
              <div className="text-xs font-bold text-[#8a7c68] uppercase tracking-wider">
                Last Updated: October 2026 · Official Document
              </div>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00632d] hover:underline cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>

            {/* Document Content Switcher */}
            {currentPolicySlug === 'privacy-policy' && (
              <div className="prose prose-sm max-w-none text-[#3d3121] space-y-4 text-xs sm:text-sm leading-relaxed">
                <h2 className="font-display text-2xl font-bold text-[#1a221b] mb-2">
                  Privacy Policy
                </h2>
                <p>
                  At <strong>Theproteino India Pvt. Ltd.</strong> ("Theproteino", "we", "us"), we are committed to protecting your personal information and respecting your privacy. This policy outlines how we handle data collected when you browse our website, purchase products, or interact with customer care.
                </p>

                <h3 className="font-bold text-base text-[#1a221b] pt-2">1. Information We Collect</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Personal Identifier Data:</strong> Full Name, Email Address, Delivery Address, PIN code, and Mobile Number collected during express checkout.</li>
                  <li><strong>Transaction Details:</strong> Payment method selected (UPI, Credit/Debit Card, Net Banking, or COD) and order history. Note: We never store your raw credit card CVV or net banking credentials.</li>
                  <li><strong>Automated Analytics:</strong> IP address, device type, and browser preferences used solely for website optimization.</li>
                </ul>

                <h3 className="font-bold text-base text-[#1a221b] pt-2">2. How We Use Your Data</h3>
                <p>
                  Your information is used strictly to process and dispatch orders, provide real-time WhatsApp delivery updates, answer support queries, and optionally send promotional discounts (if subscribed).
                </p>

                <h3 className="font-bold text-base text-[#1a221b] pt-2">3. Data Sharing & Third-Party Security</h3>
                <p>
                  We never sell, rent, or trade customer databases. Information is shared only with verified logistics partners (e.g. Bluedart, Delhivery) for doorstep order fulfilment.
                </p>
              </div>
            )}

            {currentPolicySlug === 'terms-of-service' && (
              <div className="prose prose-sm max-w-none text-[#3d3121] space-y-4 text-xs sm:text-sm leading-relaxed">
                <h2 className="font-display text-2xl font-bold text-[#1a221b] mb-2">
                  Terms of Service
                </h2>
                <p>
                  Welcome to <strong>Theproteino Store</strong>. By accessing our platform, placing orders, or utilizing our services, you agree to comply with and be bound by the following Terms & Conditions.
                </p>

                <h3 className="font-bold text-base text-[#1a221b] pt-2">1. Product Quality & Specifications</h3>
                <p>
                  All our peanut butter products, protein powders, and masala oats are manufactured in FSSAI-licensed facilities in Saurashtra, Gujarat. Natural oil separation in unadulterated peanut butter is completely normal—simply stir well before use.
                </p>

                <h3 className="font-bold text-base text-[#1a221b] pt-2">2. Pricing & Special Offers</h3>
                <p>
                  Prices listed are in Indian Rupees (INR) and are inclusive of GST. Coupons such as <code>PROTEIN15</code> or <code>FREESHAKER</code> are subject to cart minimum requirements.
                </p>

                <h3 className="font-bold text-base text-[#1a221b] pt-2">3. User Conduct</h3>
                <p>
                  Users agree not to submit fraudulent orders, post deceptive product reviews, or attempt unauthorized API access to our store infrastructure.
                </p>
              </div>
            )}

            {currentPolicySlug === 'refund-policy' && (
              <div className="prose prose-sm max-w-none text-[#3d3121] space-y-4 text-xs sm:text-sm leading-relaxed">
                <h2 className="font-display text-2xl font-bold text-[#1a221b] mb-2">
                  Refund & Return Policy
                </h2>
                <p>
                  At <strong>Theproteino</strong>, customer satisfaction is our highest priority. Because our products are edible nutrition staples, we adhere to strict food safety guidelines regarding returns and exchanges.
                </p>

                <h3 className="font-bold text-base text-[#1a221b] pt-2">1. 7-Day Damaged / Defective Replacement</h3>
                <p>
                  If your package arrives damaged, broken during transit, or missing items, contact us within 7 days of delivery with an unboxing photo/video at <strong>support@theproteino.com</strong> or WhatsApp <strong>+91 98765 43210</strong>. We will dispatch a free replacement within 24 hours.
                </p>

                <h3 className="font-bold text-base text-[#1a221b] pt-2">2. Refund Processing Timeline</h3>
                <p>
                  For approved refunds on prepaid orders, the credit will be refunded directly to your original payment source (UPI / Bank Account / Card) within 3 to 5 business days.
                </p>

                <h3 className="font-bold text-base text-[#1a221b] pt-2">3. Non-Returnable Items</h3>
                <p>
                  Opened food jars or seal-broken protein pouches cannot be returned for hygiene reasons unless a quality discrepancy is verified by our lab team.
                </p>
              </div>
            )}

            {currentPolicySlug === 'shipping-policy' && (
              <div className="prose prose-sm max-w-none text-[#3d3121] space-y-4 text-xs sm:text-sm leading-relaxed">
                <h2 className="font-display text-2xl font-bold text-[#1a221b] mb-2">
                  Shipping & Express Delivery Policy
                </h2>
                <p>
                  We deliver fresh batches of high-protein goods directly from our roastery to over 26,000 PIN codes across India.
                </p>

                <h3 className="font-bold text-base text-[#1a221b] pt-2">1. Dispatch Timelines</h3>
                <p>
                  Orders placed before 2:00 PM IST are dispatched on the same business day. Orders placed after 2:00 PM or on Sundays are dispatched on the next working day.
                </p>

                <h3 className="font-bold text-base text-[#1a221b] pt-2">2. Shipping Charges & Free Delivery</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Orders ₹499 and above:</strong> 100% FREE Express Delivery across India.</li>
                  <li><strong>Orders below ₹499:</strong> Flat nominal shipping fee of ₹70.</li>
                </ul>

                <h3 className="font-bold text-base text-[#1a221b] pt-2">3. Estimated Delivery Times</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Metro Cities (Mumbai, Delhi, Bengaluru, Hyderabad, Ahmedabad):</strong> 2–3 Business Days.</li>
                  <li><strong>Tier 2 & Tier 3 Cities:</strong> 3–5 Business Days.</li>
                </ul>
              </div>
            )}

            {currentPolicySlug === 'quality-certifications' && (
              <div className="prose prose-sm max-w-none text-[#3d3121] space-y-4 text-xs sm:text-sm leading-relaxed">
                <h2 className="font-display text-2xl font-bold text-[#1a221b] mb-2">
                  Quality & Labdoor Certifications
                </h2>
                <p>
                  We believe in 100% label accuracy. Every batch of Theproteino undergoes rigorous chemical, heavy metal, and microbiological analysis at NABL-accredited independent laboratories.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                  <div className="p-4 bg-[#faf5ec] rounded-2xl border border-[#e4d6c0]">
                    <div className="font-bold text-sm text-[#00632d] mb-1">✓ FSSAI Certified</div>
                    <div className="text-xs text-[#524433]">Licence No. 10020021005821. Adheres strictly to Indian food safety standards.</div>
                  </div>
                  <div className="p-4 bg-[#faf5ec] rounded-2xl border border-[#e4d6c0]">
                    <div className="font-bold text-sm text-[#00632d] mb-1">✓ Labdoor Purity Tested</div>
                    <div className="text-xs text-[#524433]">Third-party verified protein percentage and zero heavy metal contamination.</div>
                  </div>
                  <div className="p-4 bg-[#faf5ec] rounded-2xl border border-[#e4d6c0]">
                    <div className="font-bold text-sm text-[#00632d] mb-1">✓ ISO 22000 Facility</div>
                    <div className="text-xs text-[#524433]">HACCP & ISO food manufacturing protocols strictly enforced.</div>
                  </div>
                  <div className="p-4 bg-[#faf5ec] rounded-2xl border border-[#e4d6c0]">
                    <div className="font-bold text-sm text-[#00632d] mb-1">✓ Zero Palm Oil Certified</div>
                    <div className="text-xs text-[#524433]">100% free from hydrogenated oils, trans fats, or synthetic preservatives.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
