export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  image: string;
  secondaryImage?: string;
  badge?: string;
  isBestseller?: boolean;
  hasFreeGift?: string; // e.g. "Free Shaker"
  skuCode?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  variants: {
    size: string;
    price: number;
    originalPrice: number;
    stockQuantity?: number;
    skuCode?: string;
  }[];
  flavors?: string[];
  nutrition: {
    protein: string;
    bcaa?: string;
    calories: string;
    carbs: string;
    fat: string;
    sugar: string;
    servingSize: string;
  };
  features: string[];
  ingredients: string;
  description: string;
  inStock: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  description?: string;
  image?: string;
  badge?: string;
  bgTone?: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedFlavor?: string;
  quantity: number;
  unitPrice: number;
}

export interface ReelItem {
  id: string;
  creatorName: string;
  handle: string;
  caption: string;
  image: string;
  linkedProductId: string;
  productName: string;
  productPrice: number;
  originalPrice: number;
}

export interface ShippingAddress {
  id?: number | string;
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface OrderDetails {
  orderId: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  total: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'COD';
  shippingAddress: ShippingAddress;
  estimatedDelivery: string;
  orderStatus?: 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  courierName?: string;
}

export interface UserProfile {
  id?: number | string;
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  phone?: string;
  provider: 'password' | 'google';
  loyaltyPoints?: number;
  totalSpent?: number;
  status?: 'active' | 'vip' | 'blocked';
  createdAt?: string;
  addresses?: ShippingAddress[];
}

export interface ProductReview {
  id: number | string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  status?: 'approved' | 'pending' | 'hidden';
  isPinned?: boolean;
  adminReply?: string;
}

export interface CouponItem {
  code: string;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  freeGiftName?: string;
  description?: string;
  isActive: boolean;
  expiresAt?: string;
}

export interface FlashSaleItem {
  id: string;
  title: string;
  discountPercent: number;
  categoryFilter: string;
  startsAt: string;
  endsAt: string;
  bannerText: string;
  isActive: boolean;
}

export interface ComparisonRow {
  id: string;
  metric: string;
  gharKaKhaana: string;
  theproteino: string;
  junkFood: string;
  theproteinoHighlight?: boolean;
  sortOrder: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CmsPageItem {
  slug: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  contentHtml: string;
}

export interface OrderRecord {
  id?: number | string;
  orderId: string;
  firebaseUid?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotal?: number;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  couponCode?: string;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'COD';
  orderStatus: 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  notes?: string;
  createdAt: string;
}

export interface OrderReturnRecord {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  status: 'pending' | 'approved' | 'refunded' | 'rejected';
  refundAmount: number;
  resolutionNote?: string;
  createdAt: string;
}

export interface SupportTicketRecord {
  id: string;
  ticketCode: string;
  name: string;
  email: string;
  phone?: string;
  orderId?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  adminReply?: string;
  createdAt: string;
}

export interface AbandonedCartRecord {
  id: string;
  sessionId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  recoveryStatus: 'active' | 'notified' | 'recovered';
  updatedAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  phone?: string;
  source: string;
  createdAt: string;
}

export interface InventoryLogRecord {
  id: string;
  productId: string;
  productName: string;
  variantSize: string;
  changeAmount: number;
  newStock: number;
  reason: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  actionType: string;
  entityName: string;
  entityId: string;
  summary: string;
  actor: string;
  createdAt: string;
}

export interface StoreSettings {
  adminPin: string;
  topBar: {
    enabled: boolean;
    prefixBadge: string;
    text: string;
    couponCode: string;
    secondaryText: string;
    shippingText: string;
    bgColor: string;
  };
  hero: {
    kicker1: string;
    kicker2: string;
    kicker3: string;
    headlinePrefix: string;
    headlineHighlight: string;
    headlineSuffix: string;
    subheadline: string;
    primaryCtaText: string;
    secondaryCtaText: string;
    highlightImage: string;
    highlightBadge: string;
    highlightCategory: string;
    highlightRating: string;
    highlightTitle: string;
    highlightSubtitle: string;
    highlightPrice: number;
    highlightOriginalPrice: number;
    floatingQuote: string;
    floatingAuthor: string;
    stat1Title: string;
    stat1Sub: string;
    stat2Title: string;
    stat2Sub: string;
    stat3Title: string;
    stat3Sub: string;
    stat4Title: string;
    stat4Sub: string;
  };
  liveCounter: {
    headlineLine1: string;
    headlineLine2: string;
    baseSoldCount: number;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
    badges: string[];
  };
  brandStory: {
    headline: string;
    descriptionBefore: string;
    highlightTag: string;
    descriptionAfter: string;
    buttonText: string;
    modalKicker: string;
    modalTitle: string;
    modalIntro: string;
    modalBody: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
  };
  shippingAndTax: {
    freeShippingThreshold: number;
    standardShippingFee: number;
    expressShippingFee: number;
    gstPercent: number;
    gstIn: string;
    fssaiLicense: string;
    companyName: string;
    roasteryAddress: string;
    supportEmail: string;
    supportPhone: string;
    supportHours: string;
  };
  paymentConfig: {
    enableUPI: boolean;
    enableCard: boolean;
    enableNetBanking: boolean;
    enableCOD: boolean;
    codFee: number;
    maxCodOrderAmount: number;
    upiMerchantId: string;
  };
  seoConfig: {
    siteTitle: string;
    metaDescription: string;
    keywords: string;
    ogImage: string;
    googleAnalyticsId: string;
    facebookPixelId: string;
  };
  megaMenuPromo: {
    badge: string;
    title: string;
    subtitle: string;
    couponCode: string;
    ctaText: string;
  };
  footerConfig: {
    brandBio: string;
    newsletterHeading: string;
    newsletterSubtext: string;
    copyrightText: string;
    cert1: string;
    cert2: string;
    cert3: string;
  };
}
