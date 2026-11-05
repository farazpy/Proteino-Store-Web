import {
  StoreSettings,
  ComparisonRow,
  FaqItem,
  CouponItem,
  FlashSaleItem,
  CmsPageItem,
  OrderRecord,
  OrderReturnRecord,
  SupportTicketRecord,
  AbandonedCartRecord,
  NewsletterSubscriber,
  InventoryLogRecord,
  AuditLogRecord,
  Product,
  UserProfile,
} from '../types/store';
import { PRODUCTS } from './products';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  adminPin: '9890',
  topBar: {
    enabled: true,
    prefixBadge: 'FESTIVE DROP:',
    text: 'Get Flat 15% OFF with code',
    couponCode: 'PROTEIN15',
    secondaryText: 'FREE Shaker (₹499) on orders ₹1,499+',
    shippingText: '🚚 Free Shipping over ₹499',
    bgColor: '#004d23',
  },
  hero: {
    kicker1: 'Roasted In Small Batches',
    kicker2: '100% Clean Label',
    kicker3: 'Zero Palm Oil',
    headlinePrefix: 'FUEL YOUR DAY WITH',
    headlineHighlight: '100% ROASTED PEANUT',
    headlineSuffix: 'POWER',
    subheadline:
      'Indulge in slow-milled peanut butter, 26g cold brew protein powders, and 2-minute savory masala oats. Crafted with AAA bold-grade peanuts and pure whey isolate. Absolutely no refined sugars or trans fats.',
    primaryCtaText: 'Shop Best Sellers',
    secondaryCtaText: 'Theproteino vs. The Rest',
    highlightImage:
      'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=900&q=80',
    highlightBadge: '24% OFF + FREE SHAKER',
    highlightCategory: 'Top Rated Blend',
    highlightRating: '★ 4.9 (342 reviews)',
    highlightTitle: 'Supernatural Cold Coffee Protein',
    highlightSubtitle: '26g Protein · Real Arabica Beans · 0g Added Sugar',
    highlightPrice: 2199,
    highlightOriginalPrice: 2899,
    floatingQuote: '"Tastes like a cafe frappe!"',
    floatingAuthor: '— Rohit S., Certified Trainer',
    stat1Title: 'Up to 30g',
    stat1Sub: 'High Protein',
    stat2Title: '0% Palm Oil',
    stat2Sub: 'Zero Trans Fats',
    stat3Title: 'Labdoor Tested',
    stat3Sub: '100% Verified',
    stat4Title: '10M+ Happy',
    stat4Sub: 'Fitness Lovers',
  },
  liveCounter: {
    headlineLine1: 'P.S WHILE YOU WERE READING THIS',
    headlineLine2: 'WE SOLD ABOUT 200 PB JARS',
    baseSoldCount: 345653,
    stat1Label: 'Products sold',
    stat2Value: '34M+',
    stat2Label: 'Happy tastebuds',
    stat3Value: '21*',
    stat3Label: 'Countries sold',
    badges: [
      '💙 NO CHOLESTEROL',
      '🔥 NO TRANS FAT',
      '🥜 HEALTHY FATS',
      '🌾 GLUTEN FREE',
      '🌱 NON GMO',
    ],
  },
  brandStory: {
    headline: "INTRODUCING WORLD'S ONLY PEANUT PRODUCT COMPANY",
    descriptionBefore: 'Fast forward ten years, 70+ products, and a community of over 10 million',
    highlightTag: 'Peanut Lovers',
    descriptionAfter: 'later... here we are! But guess what? This is just the beginning.',
    buttonText: 'KNOW MORE',
    modalKicker: 'Our Gujarat Roastery Roots',
    modalTitle: 'Born from a Passion for Unadulterated Peanut Nutrition',
    modalIntro:
      'In 2016, our founders noticed that virtually every jar of peanut butter in Indian stores was stuffed with cheap hydrogenated vegetable oils, excess refined sugar, and synthetic emulsifiers. We set out to change the game.',
    modalBody:
      'Today, Theproteino has expanded to over 70 high-protein SKUs including ready-to-eat savory masala oats, cold brew protein powders with imported Arabica, crunchy muesli, and on-the-go snack bars. We test every single batch with NABL & Labdoor accredited third-party laboratories.',
    pillar1Title: 'Zero Palm Oil',
    pillar1Desc: '100% pure roasted peanuts and healthy oleic fats',
    pillar2Title: 'AAA Bold Peanuts',
    pillar2Desc: 'Sourced straight from Saurashtra farmer collectives',
    pillar3Title: '10M+ Community',
    pillar3Desc: 'Empowering fitness lovers across 21 countries',
  },
  shippingAndTax: {
    freeShippingThreshold: 499,
    standardShippingFee: 70,
    expressShippingFee: 120,
    gstPercent: 12,
    gstIn: '24AABCT1892F1Z5',
    fssaiLicense: '10020021005821',
    companyName: 'Theproteino India Pvt. Ltd.',
    roasteryAddress:
      'Plot 42, GIDC Industrial Estate, Rajkot-Ahmedabad Highway, Saurashtra, Gujarat - 360003, India.',
    supportEmail: 'support@theproteino.com',
    supportPhone: '+91 98765 43210',
    supportHours: 'Monday – Saturday: 9:00 AM – 6:00 PM IST',
  },
  paymentConfig: {
    enableUPI: true,
    enableCard: true,
    enableNetBanking: true,
    enableCOD: true,
    codFee: 0,
    maxCodOrderAmount: 10000,
    upiMerchantId: 'theproteino@icici',
  },
  seoConfig: {
    siteTitle: 'Theproteino | 100% Peanut Power, High Protein Oats & Superfoods',
    metaDescription:
      'Shop high-protein peanut butter, protein oats, masala oats, super bars, and cold brew protein powders from Theproteino. 100% natural, zero palm oil.',
    keywords: 'peanut butter, protein oats, masala oats, cold coffee protein, zero palm oil, theproteino',
    ogImage: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=1200&q=80',
    googleAnalyticsId: 'G-PROTEINO2026',
    facebookPixelId: 'FB-98902100',
  },
  megaMenuPromo: {
    badge: 'Special Offer',
    title: 'Get Flat 15% OFF + FREE Shaker',
    subtitle: 'Apply code PROTEIN15 at checkout.',
    couponCode: 'PROTEIN15',
    ctaText: 'Shop Bundles →',
  },
  footerConfig: {
    brandBio:
      "India's cleanest peanut nutrition brand. Slow-roasted in small batches in Saurashtra, Gujarat. Zero palm oil, zero synthetic emulsifiers, and zero refined sugar.",
    newsletterHeading: 'Get 15% Off First Order',
    newsletterSubtext:
      'Join 100,000+ fitness lovers for weekly recipe drops and secret discounts.',
    copyrightText: 'Theproteino India Pvt. Ltd. All rights reserved.',
    cert1: '✓ FSSAI Lic. 10020021005821',
    cert2: '✓ Labdoor Tested',
    cert3: '✓ ISO 22000 Certified',
  },
};

export const DEFAULT_COMPARISON_ROWS: ComparisonRow[] = [
  {
    id: 'comp-1',
    metric: 'Cost',
    gharKaKhaana: "Mom's Sanity",
    theproteino: 'Moderate & Pocket Friendly',
    junkFood: 'Too High A Price',
    sortOrder: 1,
  },
  {
    id: 'comp-2',
    metric: 'Time',
    gharKaKhaana: '20 Mins Prep',
    theproteino: '2 Minutes Instant',
    junkFood: 'Instant (Just Like The Regret)',
    sortOrder: 2,
  },
  {
    id: 'comp-3',
    metric: 'Taste',
    gharKaKhaana: 'Homestyle Delicious',
    theproteino: 'Chocolatey & Roasted Crunch',
    junkFood: 'Honestly Good, But Ask Yourself Roz Khaoge?',
    sortOrder: 3,
  },
  {
    id: 'comp-4',
    metric: 'Nutrition Value',
    gharKaKhaana: 'High Whole Food',
    theproteino: 'Very High (Calibrated Macros)',
    junkFood: 'Very Low Empty Calories',
    sortOrder: 4,
  },
  {
    id: 'comp-5',
    metric: 'Ingredients',
    gharKaKhaana: '100% Natural',
    theproteino: '100% Natural (Zero Palm Oil)',
    junkFood: 'Not At All Safe (Preservatives)',
    sortOrder: 5,
  },
  {
    id: 'comp-6',
    metric: 'Protein Intake',
    gharKaKhaana: 'Hard To Track But Moderate',
    theproteino: '26g - 30g Certified Protein',
    junkFood: 'Zero Protein (Pure Sugar/Fat)',
    theproteinoHighlight: true,
    sortOrder: 6,
  },
];

export const DEFAULT_COUPONS: CouponItem[] = [
  {
    code: 'PROTEIN15',
    discountType: 'PERCENT',
    discountValue: 15,
    minOrderAmount: 299,
    maxDiscount: 1000,
    usageLimit: 5000,
    usedCount: 384,
    freeGiftName: 'Free Gym Shaker on ₹1,499+',
    description: 'Flat 15% OFF storewide on all high-protein staples',
    isActive: true,
    expiresAt: '2027-12-31',
  },
  {
    code: 'FREESHAKER',
    discountType: 'FLAT',
    discountValue: 499,
    minOrderAmount: 1499,
    usageLimit: 2000,
    usedCount: 192,
    freeGiftName: '700ml Stainless Steel Shaker',
    description: 'Flat ₹499 OFF (Free Shaker value) on orders above ₹1,499',
    isActive: true,
    expiresAt: '2027-12-31',
  },
  {
    code: 'PEANUT100',
    discountType: 'FLAT',
    discountValue: 100,
    minOrderAmount: 599,
    usageLimit: 1000,
    usedCount: 74,
    description: 'Instant ₹100 OFF on Peanut Butter & Masala Oats combos',
    isActive: true,
    expiresAt: '2027-06-30',
  },
  {
    code: 'BULK25',
    discountType: 'PERCENT',
    discountValue: 25,
    minOrderAmount: 3500,
    maxDiscount: 1500,
    usageLimit: 500,
    usedCount: 41,
    description: '25% OFF Gym Transformation Bulk Orders above ₹3,500',
    isActive: true,
    expiresAt: '2027-12-31',
  },
];

export const DEFAULT_FLASH_SALES: FlashSaleItem[] = [
  {
    id: 'flash-1',
    title: 'Festive Peanut Power Drop',
    discountPercent: 24,
    categoryFilter: 'Protein Powder',
    startsAt: '2026-11-01',
    endsAt: '2026-12-31',
    bannerText: 'Up to 24% OFF Cold Brew Protein + Free Stainless Shaker',
    isActive: true,
  },
  {
    id: 'flash-2',
    title: 'Buy 2 Get 1 Free Desi Masala Oats',
    discountPercent: 33,
    categoryFilter: 'Masala Oats',
    startsAt: '2026-11-01',
    endsAt: '2026-12-31',
    bannerText: 'B2G1 Free on all 400g High Protein Masala Oats Packs',
    isActive: true,
  },
];

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Why is there natural oil on top of my Unsweetened Peanut Butter jar?',
    answer:
      'Because we use 100% pure slow-roasted peanuts and 0% hydrogenated palm oil or synthetic stabilizers! Natural peanut oil rises to the top at room temperature. Simply stir well from bottom to top before use and store in a cool cupboard or refrigerator.',
    category: 'Product Quality',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'faq-2',
    question: 'Are Theproteino products lab-tested for protein accuracy and heavy metals?',
    answer:
      'Yes! Every single production batch is tested at NABL-accredited laboratories and verified against Labdoor standards for guaranteed protein label accuracy, zero aflatoxins, and zero heavy metal contamination.',
    category: 'Certifications',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'faq-3',
    question: 'How fast do you dispatch and deliver orders across India?',
    answer:
      'Orders placed before 2:00 PM IST are dispatched the same business day directly from our Saurashtra, Gujarat roastery. Metro cities receive deliveries in 2–3 days, and rest of India in 3–5 business days.',
    category: 'Shipping & Delivery',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'faq-4',
    question: 'Is Cash on Delivery (COD) available?',
    answer:
      'Yes, Cash on Delivery, Instant UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, and NetBanking are all supported at checkout with free shipping on orders ₹499 and above.',
    category: 'Payments',
    sortOrder: 4,
    isActive: true,
  },
];

export const DEFAULT_ESSENTIALS_BUNDLES: Product[] = [
  {
    id: 'ess-shaker',
    name: 'Theproteino Stainless Steel Gym Shaker (700ml)',
    tagline: '100% Leak-Proof · Double-Wall Insulated · Whisk Ball Mixer',
    category: 'Super Bar',
    price: 499,
    originalPrice: 799,
    discountPercent: 37,
    rating: 4.9,
    reviewCount: 520,
    image: 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?auto=format&fit=crop&w=800&q=80',
    badge: 'MUST HAVE',
    isBestseller: true,
    skuCode: 'TP-ESS-SHAKER-700',
    stockQuantity: 185,
    lowStockThreshold: 20,
    variants: [{ size: '700ml Black Gold', price: 499, originalPrice: 799, stockQuantity: 185 }],
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
    description:
      'Ditch plastic shakers. Our surgical-grade stainless steel shaker keeps your cold coffee protein iced and lump-free.',
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
    skuCode: 'TP-ESS-NEEM-02',
    stockQuantity: 240,
    lowStockThreshold: 25,
    variants: [{ size: 'Set of 2 Spatulas', price: 199, originalPrice: 299, stockQuantity: 240 }],
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
    description:
      'Designed specifically for natural peanut butter. Spreads smoothly over warm sourdough or roti without tearing bread.',
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
    skuCode: 'TP-BUN-STARTER-01',
    stockQuantity: 92,
    lowStockThreshold: 15,
    variants: [{ size: 'Complete 3-Piece Kit', price: 2499, originalPrice: 3448, stockQuantity: 92 }],
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
    description:
      'The ultimate bundle for fitness enthusiasts. Includes your daily dose of 30g protein peanut butter, 26g cold brew protein powder, and our leak-proof shaker.',
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
    skuCode: 'TP-ESS-COCO-BOWL',
    stockQuantity: 110,
    lowStockThreshold: 15,
    variants: [{ size: 'Bowl + Ebony Spoon Set', price: 349, originalPrice: 499, stockQuantity: 110 }],
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
    description:
      'Elevate your morning breakfast ritual. Made from reclaimed coconut shells, perfect for high-protein oats bowls.',
    inStock: true,
  },
];

export const DEFAULT_CMS_PAGES: CmsPageItem[] = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    subtitle: 'How we protect customer data and payment security',
    lastUpdated: 'November 2026',
    contentHtml: `<p>At <strong>Theproteino India Pvt. Ltd.</strong> ("Theproteino", "we", "us"), we are committed to protecting your personal information and respecting your privacy. This policy outlines how we handle data collected when you browse our website, purchase products, or interact with customer care.</p>
<h3>1. Information We Collect</h3>
<ul>
  <li><strong>Personal Identifier Data:</strong> Full Name, Email Address, Delivery Address, PIN code, and Mobile Number collected during express checkout.</li>
  <li><strong>Transaction Details:</strong> Payment method selected (UPI, Credit/Debit Card, Net Banking, or COD) and order history. Note: We never store your raw credit card CVV or net banking credentials.</li>
  <li><strong>Automated Analytics:</strong> IP address, device type, and browser preferences used solely for website optimization.</li>
</ul>
<h3>2. How We Use Your Data</h3>
<p>Your information is used strictly to process and dispatch orders, provide real-time WhatsApp delivery updates, answer support queries, and optionally send promotional discounts (if subscribed).</p>
<h3>3. Data Sharing & Third-Party Security</h3>
<p>We never sell, rent, or trade customer databases. Information is shared only with verified logistics partners (e.g. Bluedart, Delhivery) for doorstep order fulfilment.</p>`,
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    subtitle: 'Store usage rules, pricing terms, and quality commitments',
    lastUpdated: 'November 2026',
    contentHtml: `<p>Welcome to <strong>Theproteino Store</strong>. By accessing our platform, placing orders, or utilizing our services, you agree to comply with and be bound by the following Terms & Conditions.</p>
<h3>1. Product Quality & Specifications</h3>
<p>All our peanut butter products, protein powders, and masala oats are manufactured in FSSAI-licensed facilities in Saurashtra, Gujarat. Natural oil separation in unadulterated peanut butter is completely normal—simply stir well before use.</p>
<h3>2. Pricing & Special Offers</h3>
<p>Prices listed are in Indian Rupees (INR) and are inclusive of GST. Coupons such as <code>PROTEIN15</code> or <code>FREESHAKER</code> are subject to cart minimum requirements.</p>
<h3>3. User Conduct</h3>
<p>Users agree not to submit fraudulent orders, post deceptive product reviews, or attempt unauthorized API access to our store infrastructure.</p>`,
  },
  {
    slug: 'refund-policy',
    title: 'Refund & Return Policy',
    subtitle: '7-day damaged item replacement and fast refund timelines',
    lastUpdated: 'November 2026',
    contentHtml: `<p>At <strong>Theproteino</strong>, customer satisfaction is our highest priority. Because our products are edible nutrition staples, we adhere to strict food safety guidelines regarding returns and exchanges.</p>
<h3>1. 7-Day Damaged / Defective Replacement</h3>
<p>If your package arrives damaged, broken during transit, or missing items, contact us within 7 days of delivery with an unboxing photo/video at <strong>support@theproteino.com</strong> or WhatsApp <strong>+91 98765 43210</strong>. We will dispatch a free replacement within 24 hours.</p>
<h3>2. Refund Processing Timeline</h3>
<p>For approved refunds on prepaid orders, the credit will be refunded directly to your original payment source (UPI / Bank Account / Card) within 3 to 5 business days.</p>
<h3>3. Non-Returnable Items</h3>
<p>Opened food jars or seal-broken protein pouches cannot be returned for hygiene reasons unless a quality discrepancy is verified by our lab team.</p>`,
  },
  {
    slug: 'shipping-policy',
    title: 'Shipping & Express Delivery Policy',
    subtitle: 'Same-day roastery dispatch across 26,000+ Indian PIN codes',
    lastUpdated: 'November 2026',
    contentHtml: `<p>We deliver fresh batches of high-protein goods directly from our roastery to over 26,000 PIN codes across India.</p>
<h3>1. Dispatch Timelines</h3>
<p>Orders placed before 2:00 PM IST are dispatched on the same business day. Orders placed after 2:00 PM or on Sundays are dispatched on the next working day.</p>
<h3>2. Shipping Charges & Free Delivery</h3>
<ul>
  <li><strong>Orders ₹499 and above:</strong> 100% FREE Express Delivery across India.</li>
  <li><strong>Orders below ₹499:</strong> Flat nominal shipping fee of ₹70.</li>
</ul>
<h3>3. Estimated Delivery Times</h3>
<ul>
  <li><strong>Metro Cities (Mumbai, Delhi, Bengaluru, Hyderabad, Ahmedabad):</strong> 2–3 Business Days.</li>
  <li><strong>Tier 2 & Tier 3 Cities:</strong> 3–5 Business Days.</li>
</ul>`,
  },
  {
    slug: 'quality-certifications',
    title: 'Quality & Labdoor Certifications',
    subtitle: 'FSSAI, ISO 22000, and NABL third-party batch testing',
    lastUpdated: 'November 2026',
    contentHtml: `<p>We believe in 100% label accuracy. Every batch of Theproteino undergoes rigorous chemical, heavy metal, and microbiological analysis at NABL-accredited independent laboratories.</p>
<ul>
  <li><strong>FSSAI Certified:</strong> Licence No. 10020021005821. Adheres strictly to Indian food safety standards.</li>
  <li><strong>Labdoor Purity Tested:</strong> Third-party verified protein percentage and zero heavy metal contamination.</li>
  <li><strong>ISO 22000 Facility:</strong> HACCP & ISO food manufacturing protocols strictly enforced.</li>
  <li><strong>Zero Palm Oil Certified:</strong> 100% free from hydrogenated oils, trans fats, or synthetic preservatives.</li>
</ul>`,
  },
];

export const DEFAULT_SAMPLE_ORDERS: OrderRecord[] = [];
export const DEFAULT_CUSTOMERS: UserProfile[] = [];
export const DEFAULT_RETURNS: OrderReturnRecord[] = [];
export const DEFAULT_SUPPORT_TICKETS: SupportTicketRecord[] = [];
export const DEFAULT_ABANDONED_CARTS: AbandonedCartRecord[] = [];
export const DEFAULT_SUBSCRIBERS: NewsletterSubscriber[] = [];
export const DEFAULT_INVENTORY_LOGS: InventoryLogRecord[] = [];
export const DEFAULT_AUDIT_LOGS: AuditLogRecord[] = [];

