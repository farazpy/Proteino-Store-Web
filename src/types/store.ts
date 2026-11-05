export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: 'Peanut Butter' | 'Protein Powder' | 'Protein Oats' | 'Masala Oats' | 'Super Bar' | 'Super Muesli';
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
  variants: {
    size: string;
    price: number;
    originalPrice: number;
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
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
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
}

export interface UserProfile {
  id?: number | string;
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  phone?: string;
  provider: 'password' | 'google';
  addresses?: ShippingAddress[];
}

