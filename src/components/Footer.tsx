import React, { useState } from 'react';
import { PolicySlug } from './PolicyPages';

interface FooterProps {
  onNavigateToPolicy?: (slug: PolicySlug) => void;
  onNavigateToEssentials?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onSelectCategory?: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateToPolicy,
  onNavigateToEssentials,
  onNavigateToAbout,
  onNavigateToContact,
  onSelectCategory,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="bg-[#1b261e] text-[#e0e9e2] border-t border-[#293b2e] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2d4233]">
          {/* Brand info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#8ee000] text-[#004d23] flex items-center justify-center font-display text-xl font-bold">
                🥜
              </div>
              <span className="font-display text-2xl font-bold text-white tracking-tight">
                Theproteino
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#a3b8aa] leading-relaxed max-w-sm mb-6">
              India's cleanest peanut nutrition brand. Slow-roasted in small batches in Saurashtra, Gujarat. Zero palm oil, zero synthetic emulsifiers, and zero refined sugar.
            </p>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8ea896]">
              <button
                onClick={() => onNavigateToPolicy && onNavigateToPolicy('quality-certifications')}
                className="px-2.5 py-1 rounded bg-[#243528] hover:bg-[#324a38] border border-[#344b3a] transition-colors cursor-pointer"
              >
                ✓ FSSAI Lic. 10020021005821
              </button>
              <button
                onClick={() => onNavigateToPolicy && onNavigateToPolicy('quality-certifications')}
                className="px-2.5 py-1 rounded bg-[#243528] hover:bg-[#324a38] border border-[#344b3a] transition-colors cursor-pointer"
              >
                ✓ Labdoor Tested
              </button>
              <button
                onClick={() => onNavigateToPolicy && onNavigateToPolicy('quality-certifications')}
                className="px-2.5 py-1 rounded bg-[#243528] hover:bg-[#324a38] border border-[#344b3a] transition-colors cursor-pointer"
              >
                ✓ ISO 22000 Certified
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#8ee000] mb-4">
              Explore & Shop
            </h4>
            <ul className="space-y-2.5 text-xs text-[#a3b8aa]">
              {onNavigateToEssentials && (
                <li>
                  <button
                    onClick={onNavigateToEssentials}
                    className="hover:text-[#8ee000] transition-colors font-bold text-white cursor-pointer"
                  >
                    ★ Store Essentials & Bundles
                  </button>
                </li>
              )}
              {onNavigateToAbout && (
                <li>
                  <button
                    onClick={onNavigateToAbout}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    About Our Gujarat Roastery
                  </button>
                </li>
              )}
              {onNavigateToContact && (
                <li>
                  <button
                    onClick={onNavigateToContact}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Contact Support & Enquiries
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => onSelectCategory && onSelectCategory('Peanut Butter')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Peanut Butter Jars
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory && onSelectCategory('Protein Powder')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cold Coffee Protein
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#8ee000] mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs text-[#a3b8aa]">
              <li>
                <button
                  onClick={() => onNavigateToPolicy && onNavigateToPolicy('shipping-policy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Shipping & Express Delivery
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToPolicy && onNavigateToPolicy('refund-policy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Refund & Return Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToPolicy && onNavigateToPolicy('quality-certifications')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Labdoor Test Certificates
                </button>
              </li>
              <li>
                <span className="text-[#a3b8aa]">Contact: support@theproteino.com</span>
              </li>
              <li>
                <span className="text-[#a3b8aa]">WhatsApp: +91 98765 43210</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#8ee000] mb-4">
              Get 15% Off First Order
            </h4>
            <p className="text-xs text-[#a3b8aa] mb-3">
              Join 100,000+ fitness lovers for weekly recipe drops and secret discounts.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#243528] border border-[#374e3d] rounded-xl text-white placeholder-[#748a7b] focus:outline-none focus:border-[#8ee000]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#8ee000] hover:bg-[#a1fa05] text-[#004d23] font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {subscribed ? 'Subscribed! Check your inbox ✓' : 'Subscribe & Save'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7d9484] gap-4">
          <div>
            © {new Date().getFullYear()} Theproteino India Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <button
              onClick={() => onNavigateToPolicy && onNavigateToPolicy('privacy-policy')}
              className="hover:underline hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigateToPolicy && onNavigateToPolicy('terms-of-service')}
              className="hover:underline hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigateToPolicy && onNavigateToPolicy('refund-policy')}
              className="hover:underline hover:text-white transition-colors cursor-pointer"
            >
              Refund Policy
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigateToPolicy && onNavigateToPolicy('shipping-policy')}
              className="hover:underline hover:text-white transition-colors cursor-pointer"
            >
              Shipping Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
