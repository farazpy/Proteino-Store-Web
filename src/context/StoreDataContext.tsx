import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  CategoryItem,
  ReelItem,
  ProductReview,
  StoreSettings,
  ComparisonRow,
  CouponItem,
  FlashSaleItem,
  FaqItem,
  CmsPageItem,
} from '../types/store';
import { PRODUCTS, CATEGORIES, REELS_DATA, REVIEWS_DATA } from '../data/products';
import {
  DEFAULT_STORE_SETTINGS,
  DEFAULT_COMPARISON_ROWS,
  DEFAULT_COUPONS,
  DEFAULT_FLASH_SALES,
  DEFAULT_FAQS,
  DEFAULT_ESSENTIALS_BUNDLES,
  DEFAULT_CMS_PAGES,
} from '../data/defaultStoreData';

interface StorefrontState {
  settings: StoreSettings;
  categories: CategoryItem[];
  products: Product[];
  bundles: Product[];
  reels: ReelItem[];
  reviews: ProductReview[];
  comparisonRows: ComparisonRow[];
  coupons: CouponItem[];
  flashSales: FlashSaleItem[];
  faqs: FaqItem[];
  cmsPages: CmsPageItem[];
  mysqlConnected: boolean;
  loading: boolean;
  refreshStorefront: () => Promise<void>;
  applyBootstrapPayload: (data: Partial<StorefrontState>) => void;
}

const INITIAL_NORMALIZED_REVIEWS: ProductReview[] = REVIEWS_DATA.map((r, idx) => ({
  id: idx + 1,
  productId: r.productId,
  userName: r.userName,
  rating: r.rating,
  comment: r.comment,
  date: r.date,
  status: 'approved',
  isPinned: idx === 0,
  adminReply: '',
}));

const StoreDataContext = createContext<StorefrontState>({
  settings: DEFAULT_STORE_SETTINGS,
  categories: CATEGORIES,
  products: PRODUCTS,
  bundles: DEFAULT_ESSENTIALS_BUNDLES,
  reels: REELS_DATA,
  reviews: INITIAL_NORMALIZED_REVIEWS,
  comparisonRows: DEFAULT_COMPARISON_ROWS,
  coupons: DEFAULT_COUPONS,
  flashSales: DEFAULT_FLASH_SALES,
  faqs: DEFAULT_FAQS,
  cmsPages: DEFAULT_CMS_PAGES,
  mysqlConnected: false,
  loading: false,
  refreshStorefront: async () => {},
  applyBootstrapPayload: () => {},
});

export const StoreDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [categories, setCategories] = useState<CategoryItem[]>(CATEGORIES);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [bundles, setBundles] = useState<Product[]>(DEFAULT_ESSENTIALS_BUNDLES);
  const [reels, setReels] = useState<ReelItem[]>(REELS_DATA);
  const [reviews, setReviews] = useState<ProductReview[]>(INITIAL_NORMALIZED_REVIEWS);
  const [comparisonRows, setComparisonRows] = useState<ComparisonRow[]>(DEFAULT_COMPARISON_ROWS);
  const [coupons, setCoupons] = useState<CouponItem[]>(DEFAULT_COUPONS);
  const [flashSales, setFlashSales] = useState<FlashSaleItem[]>(DEFAULT_FLASH_SALES);
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [cmsPages, setCmsPages] = useState<CmsPageItem[]>(DEFAULT_CMS_PAGES);
  const [mysqlConnected, setMysqlConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const applyBootstrapPayload = useCallback((data: any) => {
    if (!data) return;
    const source = data.state || data;
    if (source.settings) setSettings(source.settings);
    if (Array.isArray(source.categories) && source.categories.length > 0) setCategories(source.categories);
    if (Array.isArray(source.products) && source.products.length > 0) setProducts(source.products);
    if (Array.isArray(source.bundles)) setBundles(source.bundles);
    if (Array.isArray(source.reels)) setReels(source.reels);
    if (Array.isArray(source.reviews)) setReviews(source.reviews);
    if (Array.isArray(source.comparisonRows)) setComparisonRows(source.comparisonRows);
    if (Array.isArray(source.coupons)) setCoupons(source.coupons);
    if (Array.isArray(source.flashSales)) setFlashSales(source.flashSales);
    if (Array.isArray(source.faqs)) setFaqs(source.faqs);
    if (Array.isArray(source.cmsPages)) setCmsPages(source.cmsPages);
    if (typeof data.mysqlConnected === 'boolean') setMysqlConnected(data.mysqlConnected);
  }, []);

  const refreshStorefront = useCallback(async () => {
    try {
      const res = await fetch('/api/storefront/bootstrap');
      if (res.ok) {
        const data = await res.json();
        applyBootstrapPayload(data);
      }
    } catch (err) {
      console.error('Failed to fetch storefront bootstrap:', err);
    } finally {
      setLoading(false);
    }
  }, [applyBootstrapPayload]);

  useEffect(() => {
    refreshStorefront();
  }, [refreshStorefront]);

  // Dynamically sync SEO document title & meta description whenever settings change
  useEffect(() => {
    if (settings?.seoConfig?.siteTitle) {
      document.title = settings.seoConfig.siteTitle;
    }
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta && settings?.seoConfig?.metaDescription) {
      descMeta.setAttribute('content', settings.seoConfig.metaDescription);
    }
  }, [settings?.seoConfig?.siteTitle, settings?.seoConfig?.metaDescription]);

  return (
    <StoreDataContext.Provider
      value={{
        settings,
        categories,
        products,
        bundles,
        reels,
        reviews,
        comparisonRows,
        coupons,
        flashSales,
        faqs,
        cmsPages,
        mysqlConnected,
        loading,
        refreshStorefront,
        applyBootstrapPayload,
      }}
    >
      {children}
    </StoreDataContext.Provider>
  );
};

export const useStoreData = () => useContext(StoreDataContext);
