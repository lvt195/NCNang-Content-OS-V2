import { Product } from '../types/product';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

export interface ProductViewStats {
  id: string;
  name: string;
  category: string;
  type: 'single' | 'combo';
  price: number;
  coverImage: string;
  views: number;
  lastViewedAt: number;
}

export interface AnalyticsData {
  totalVisits: number;
  todayVisits: number;
  lastVisitDate: string; // YYYY-MM-DD
  dailyVisits: Record<string, number>; // date -> count
  productViews: Record<string, ProductViewStats>;
  typeViews: {
    single: number;
    combo: number;
  };
  categoryViews: Record<string, number>;
}

const STORAGE_KEY = 'ncnang_analytics_v1';

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function createDefaultSeed(): AnalyticsData {
  const today = getTodayString();

  // Create natural starting views for initial products
  const productViews: Record<string, ProductViewStats> = {};
  let totalCombo = 0;
  let totalSingle = 0;
  const categoryViews: Record<string, number> = {};

  // Natural seed view counts for top items
  const seedCounts: Record<string, number> = {
    'SET-LN01': 98,
    'GA-DUI01': 76,
    'CHAN-DUI01': 64,
    'SET-LN02': 59,
    'GOI-DUI01': 48,
    'CHAN-LN01': 42,
    'GA-LN01': 38,
    'SET-DUI01': 35,
    'GOI-LN01': 27,
    'KHAN-LN01': 22,
    'GA-DUI02': 19,
    'CHAN-DUI02': 15,
  };

  INITIAL_PRODUCTS.forEach((p) => {
    const views = seedCounts[p.id] || Math.floor(Math.random() * 20) + 10;
    productViews[p.id] = {
      id: p.id,
      name: p.name,
      category: p.category,
      type: p.type,
      price: p.price,
      coverImage: p.coverImage || p.images[0] || '/images/placeholder.webp',
      views,
      lastViewedAt: Date.now() - Math.floor(Math.random() * 86400000),
    };

    if (p.type === 'combo') {
      totalCombo += views;
    } else {
      totalSingle += views;
    }

    categoryViews[p.category] = (categoryViews[p.category] || 0) + views;
  });

  return {
    totalVisits: 386,
    todayVisits: 34,
    lastVisitDate: today,
    dailyVisits: {
      [today]: 34,
    },
    productViews,
    typeViews: {
      single: totalSingle,
      combo: totalCombo,
    },
    categoryViews,
  };
}

class AnalyticsService {
  private data: AnalyticsData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): AnalyticsData {
    if (typeof window === 'undefined') {
      return createDefaultSeed();
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AnalyticsData;
        const today = getTodayString();
        // Reset todayVisits if day changed
        if (parsed.lastVisitDate !== today) {
          parsed.todayVisits = 0;
          parsed.lastVisitDate = today;
        }
        return parsed;
      }
    } catch (err) {
      console.warn('Failed to parse analytics from localStorage:', err);
    }

    const initial = createDefaultSeed();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: AnalyticsData): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Failed to save analytics to localStorage:', err);
    }
  }

  public trackSiteVisit(): void {
    const today = getTodayString();
    if (this.data.lastVisitDate !== today) {
      this.data.todayVisits = 0;
      this.data.lastVisitDate = today;
    }

    this.data.totalVisits += 1;
    this.data.todayVisits += 1;
    this.data.dailyVisits[today] = (this.data.dailyVisits[today] || 0) + 1;
    this.saveData(this.data);
  }

  public trackProductView(product: Product): void {
    const today = getTodayString();
    if (this.data.lastVisitDate !== today) {
      this.data.todayVisits = 0;
      this.data.lastVisitDate = today;
    }

    const current = this.data.productViews[product.id] || {
      id: product.id,
      name: product.name,
      category: product.category,
      type: product.type,
      price: product.price,
      coverImage: product.coverImage || product.images[0] || '/images/placeholder.webp',
      views: 0,
      lastViewedAt: Date.now(),
    };

    current.views += 1;
    current.lastViewedAt = Date.now();
    current.name = product.name; // Keep name in sync
    current.price = product.price;
    current.type = product.type;
    current.category = product.category;
    if (product.coverImage || product.images[0]) {
      current.coverImage = product.coverImage || product.images[0];
    }

    this.data.productViews[product.id] = current;

    // Track type
    if (product.type === 'combo') {
      this.data.typeViews.combo = (this.data.typeViews.combo || 0) + 1;
    } else {
      this.data.typeViews.single = (this.data.typeViews.single || 0) + 1;
    }

    // Track category
    this.data.categoryViews[product.category] =
      (this.data.categoryViews[product.category] || 0) + 1;

    this.saveData(this.data);
  }

  public getSummary() {
    const totalTypeViews =
      (this.data.typeViews.combo || 0) + (this.data.typeViews.single || 0);

    const comboPct =
      totalTypeViews > 0
        ? Math.round((this.data.typeViews.combo / totalTypeViews) * 100)
        : 50;
    const singlePct =
      totalTypeViews > 0
        ? 100 - comboPct
        : 50;

    const topProducts = Object.values(this.data.productViews)
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    const totalProductViews = Object.values(this.data.productViews).reduce(
      (sum, p) => sum + p.views,
      0
    );

    const categoryBreakdown = Object.entries(this.data.categoryViews)
      .map(([catId, views]) => ({
        id: catId,
        views,
        percentage:
          totalProductViews > 0 ? Math.round((views / totalProductViews) * 100) : 0,
      }))
      .sort((a, b) => b.views - a.views);

    return {
      totalVisits: this.data.totalVisits,
      todayVisits: this.data.todayVisits,
      totalProductViews,
      typeStats: {
        combo: {
          views: this.data.typeViews.combo,
          percentage: comboPct,
        },
        single: {
          views: this.data.typeViews.single,
          percentage: singlePct,
        },
        preferredType:
          this.data.typeViews.combo >= this.data.typeViews.single
            ? ('combo' as const)
            : ('single' as const),
      },
      topProducts,
      categoryBreakdown,
    };
  }

  public resetStats(): void {
    const initial = createDefaultSeed();
    this.data = initial;
    this.saveData(initial);
  }
}

export const analyticsService = new AnalyticsService();
