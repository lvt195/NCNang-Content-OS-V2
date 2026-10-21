export type ProductType = 'single' | 'combo';

export type ProductCategory = 'ga-giuong' | 'vo-goi' | 'chan-he' | 'bo-chan-ga' | 'combo' | string;

export type ProductColor =
  | 'trang'
  | 'be'
  | 'nau'
  | 'xam'
  | 'xanh-reu'
  | 'hong-dat'
  | 'caro'
  | 'vang-nhat'
  | string;

export interface ComboItem {
  name: string;
  quantity: number;
  note?: string;
}

export interface ProductVariant {
  label: string;
  image: string;
  colorId?: string;
}

export interface Product {
  id: string; // Product code, e.g. "BCG001"
  slug: string; // URL slug, e.g. "set-bo-chan-ga-dui-mau-be-cat"
  name: string;
  category: ProductCategory;
  categories?: string[];
  categoryIds?: string[];
  price: number;
  currency: string;
  colors: ProductColor[];
  type: ProductType;
  images: string[];
  coverImage?: string;
  sizes: string[];
  description: string;
  comboItems?: ComboItem[];
  variants?: ProductVariant[];
  featured?: boolean;
  published?: boolean;
  available?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder?: number;
  count?: number;
}

export interface ColorOption {
  id: ProductColor;
  label: string;
  hex: string;
  borderHex?: string;
}

export interface PriceRange {
  id: string;
  label: string;
  min?: number;
  max?: number;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export interface FilterState {
  category: string;
  priceRangeId: string;
  color: string;
  type: string;
  searchQuery: string;
  sortBy: SortOption;
}
