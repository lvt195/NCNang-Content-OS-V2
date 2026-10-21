import { Product, FilterState } from '../types/product';
import { SITE_CONFIG } from '../config/site';
import { doesProductMatchColor } from '../data/colors';

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
 * Clean embedded metadata tags (such as <!--cats:...--> and <!--vars:...-->)
 * from the description string for human-readable display.
 */
export function cleanProductDescription(desc: string | undefined | null): string {
  if (!desc) return '';
  return desc.replace(/<!--.*?-->/gs, '').trim();
}

/**
 * Filter and sort products according to FilterState
 */
export function filterProducts(products: Product[], filters: FilterState): Product[] {
  const normalizedQuery = normalizeVietnamese(filters.searchQuery);

  const filtered = products.filter((p) => {
    // 1. Category Filter (multi-category support with multi-selection)
    const activeCategories = filters.categories && filters.categories.length > 0
      ? filters.categories
      : (filters.category && filters.category !== 'all' ? [filters.category] : []);

    if (activeCategories.length > 0) {
      const pCats = [
        p.category,
        ...(Array.isArray(p.categories) ? p.categories : []),
        ...(Array.isArray(p.categoryIds) ? p.categoryIds : []),
      ];
      const hasMatchingCat = activeCategories.some((catId) => pCats.includes(catId));
      if (!hasMatchingCat) return false;
    }

    // 2. Product Type Filter (single / combo with multi-selection)
    const activeTypes = filters.types && filters.types.length > 0
      ? filters.types
      : (filters.type && filters.type !== 'all' ? [filters.type] : []);

    if (activeTypes.length > 0) {
      if (!activeTypes.includes(p.type)) return false;
    }

    // 3. Color & Pattern Filter (supports multi-selecting colors)
    const activeColors = filters.colors && filters.colors.length > 0
      ? filters.colors
      : (filters.color && filters.color !== 'all' ? [filters.color] : []);

    if (activeColors.length > 0) {
      const matchesAnyColor = activeColors.some((c) => doesProductMatchColor(p, c));
      if (!matchesAnyColor) return false;
    }

    // 4. Price Range Filter (supports multi-selecting price ranges)
    const activePriceRanges = filters.priceRanges && filters.priceRanges.length > 0
      ? filters.priceRanges
      : (filters.priceRangeId && filters.priceRangeId !== 'all' ? [filters.priceRangeId] : []);

    if (activePriceRanges.length > 0) {
      const matchesAnyRange = activePriceRanges.some((rangeId) => {
        const range = SITE_CONFIG.priceRanges.find((r) => r.id === rangeId);
        if (!range) return false;
        if (range.min !== undefined && p.price < range.min) return false;
        if (range.max !== undefined && p.price > range.max) return false;
        return true;
      });
      if (!matchesAnyRange) return false;
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
