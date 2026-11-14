export type ProductCategory = 'Lighting' | 'Audio' | 'Objects';

export interface ProductVariant {
  id: string;
  label: string;
  swatchHex: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  originalPrice: number;
  salePrice: number;
  offerNote: string;
  availability: string;
  image: string;
  description: string;
  materialSpec: string;
  dimensions: string;
  variants: ProductVariant[];
  featuredCampaigns: string[];
}

export interface HeroBannerProps {
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  secondaryCtaLabel: string;
  promoCode: string;
  offerSummary: string;
  image: string;
  imageAlt: string;
  layout: 'split-left' | 'split-right';
}

export interface OfferTierItem {
  id: string;
  title: string;
  offerValue: string;
  condition: string;
  code: string;
  targetCategory: ProductCategory | 'All';
}

export interface OfferStripProps {
  sectionTitle: string;
  validThrough: string;
  offers: OfferTierItem[];
}

export interface ProductGridProps {
  sectionTitle: string;
  sectionSubtitle: string;
  columns: 2 | 3;
  defaultCategory: ProductCategory | 'All';
  showFilterBar: boolean;
}

export interface EditorialBundleProps {
  eyebrow: string;
  headline: string;
  body: string;
  bundleSku: string;
  bundleTitle: string;
  bundlePrice: number;
  bundleComparePrice: number;
  ctaLabel: string;
  highlights: string[];
  bundleProductIds: string[];
  image: string;
  imageAlt: string;
}

export type AemComponentNode =
  | {
      id: string;
      type: 'hero-banner';
      resourceType: 'krona/components/promo/hero-banner';
      label: string;
      visible: boolean;
      props: HeroBannerProps;
    }
  | {
      id: string;
      type: 'offer-strip';
      resourceType: 'krona/components/promo/offer-strip';
      label: string;
      visible: boolean;
      props: OfferStripProps;
    }
  | {
      id: string;
      type: 'product-grid';
      resourceType: 'krona/components/commerce/product-grid';
      label: string;
      visible: boolean;
      props: ProductGridProps;
    }
  | {
      id: string;
      type: 'editorial-bundle';
      resourceType: 'krona/components/promo/editorial-bundle';
      label: string;
      visible: boolean;
      props: EditorialBundleProps;
    };

export interface CampaignPage {
  id: string;
  slug: string;
  name: string;
  seasonLabel: string;
  announcementText: string;
  promoCode: string;
  discountPercent: number;
  validRange: string;
  components: AemComponentNode[];
}

export interface CartItem {
  productId: string;
  variantId: string;
  variantLabel: string;
  quantity: number;
}

export interface PromoCodeRule {
  code: string;
  discountPercent: number;
  minSubtotal: number;
  description: string;
}

export interface LayoutAuditCheck {
  id: string;
  name: string;
  category: 'HTML5' | 'CSS3' | 'Responsive' | 'Accessibility';
  status: 'pass' | 'warn';
  detail: string;
  metric: string;
}
