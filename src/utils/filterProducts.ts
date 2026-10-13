import { Product, FilterState } from '../types/product';
import { SITE_CONFIG } from '../config/site';

/**
 * Remove Vietnamese accents for diacritic-insensitive search
 */
export function normalizeVietnamese(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Filter and sort products according to FilterState
 */
export function filterProducts(products: Product[], filters: FilterState): Product[] {
  const normalizedQuery = normalizeVietnamese(filters.searchQuery);

  const filtered = products.filter((p) => {
    // 1. Category Filter
    if (filters.category && filters.category !== 'all') {
      if (p.category !== filters.category) return false;
    }

    // 2. Product Type Filter (single / combo)
    if (filters.type && filters.type !== 'all') {
      if (p.type !== filters.type) return false;
    }

    // 3. Color Filter
    if (filters.color && filters.color !== 'all') {
      const hasColor = p.colors?.some((c) => c.toLowerCase() === filters.color.toLowerCase());
      if (!hasColor) return false;
    }

    // 4. Price Range Filter
    if (filters.priceRangeId && filters.priceRangeId !== 'all') {
      const range = SITE_CONFIG.priceRanges.find((r) => r.id === filters.priceRangeId);
      if (range) {
        if (range.min !== undefined && p.price < range.min) return false;
        if (range.max !== undefined && p.price > range.max) return false;
      }
    }

    // 5. Search Query Filter (Name or Product Code ID)
    if (normalizedQuery) {
      const normName = normalizeVietnamese(p.name);
      const normId = normalizeVietnamese(p.id);
      const normDesc = normalizeVietnamese(p.description || '');

      const matches =
        normName.includes(normalizedQuery) ||
        normId.includes(normalizedQuery) ||
        normDesc.includes(normalizedQuery);

      if (!matches) return false;
    }

    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name, 'vi');
      case 'featured':
      default:
        // Featured products first, then newest
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.id || '').localeCompare(a.id || '');
    }
  });

  return sorted;
}
