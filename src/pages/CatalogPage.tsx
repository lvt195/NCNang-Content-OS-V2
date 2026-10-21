import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowUpDown,
  RefreshCw,
  X,
  SlidersHorizontal,
  ArrowRight,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { Product, Category, FilterState, SortOption } from '../types/product';
import { productService } from '../services/productService';
import { filterProducts } from '../utils/filterProducts';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { ProductFilters } from '../components/ProductFilters';
import { getColorOption } from '../data/colors';
import { SITE_CONFIG } from '../config/site';
import { analyticsService } from '../services/analyticsService';
import { formatVND } from '../utils/formatCurrency';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeQuickViewImg, setActiveQuickViewImg] = useState<string>('');

  // User Draggable Column Slider (1 to 5 columns on desktop, 1 to 3 on mobile/tablet)
  const [catalogCols, setCatalogCols] = useState<number>(() => {
    const saved = localStorage.getItem('catalog_column_count');
    return saved ? Math.max(1, Math.min(5, parseInt(saved, 10))) : 4;
  });

  const handleCatalogColsChange = (cols: number) => {
    const clamped = Math.max(1, Math.min(5, cols));
    setCatalogCols(clamped);
    localStorage.setItem('catalog_column_count', clamped.toString());
  };

  // Read initial query params from URL if present
  const initialSearch = searchParams.get('q') || '';
  const initialCategory = searchParams.get('cat') || 'all';

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    priceRangeId: 'all',
    color: 'all',
    type: 'all',
    searchQuery: initialSearch,
    sortBy: 'featured',
  });

  // Sync searchQuery with URL query parameter
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== filters.searchQuery) {
      setFilters((prev) => ({ ...prev, searchQuery: q }));
    }
  }, [searchParams]);

  // Track site visit on mount
  useEffect(() => {
    analyticsService.trackSiteVisit();
  }, []);

  // Fetch published products and categories on mount
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          productService.getPublishedProducts(),
          productService.getCategories(),
        ]);
        if (mounted) {
          setProducts(prods);
          setCategories(cats);
        }
      } catch (err) {
        console.error('Failed to load catalog data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updates };
      if (updates.searchQuery !== undefined) {
        if (updates.searchQuery) {
          setSearchParams({ q: updates.searchQuery }, { replace: true });
        } else {
          searchParams.delete('q');
          setSearchParams(searchParams, { replace: true });
        }
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      priceRangeId: 'all',
      color: 'all',
      type: 'all',
      searchQuery: '',
      sortBy: 'featured',
    });
    setSearchParams({}, { replace: true });
  };

  // Compute filtered & sorted products with AND logic
  const filteredProducts = useMemo(() => {
    return filterProducts(products, filters);
  }, [products, filters]);

  // Compute active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.priceRangeId && filters.priceRangeId !== 'all') count++;
    if (filters.color && filters.color !== 'all') count++;
    if (filters.type && filters.type !== 'all') count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
      <Header
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => handleFilterChange({ searchQuery: q })}
      />

      <main style={{ flex: 1, paddingBottom: '3.5rem', width: '100%', overflowX: 'hidden' }}>
        {/* Compact Hero Section */}
        <section
          style={{
            backgroundColor: 'var(--bg-muted)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1.25rem 0 1rem',
            width: '100%',
          }}
        >
          <div className="container" style={{ textAlign: 'center' }}>
            <h1
              className="font-serif"
              style={{
                fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.25,
                marginBottom: '0.35rem',
              }}
            >
              Không Gian Nhỏ, Giấc Ngủ Bình Yên
            </h1>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                maxWidth: '560px',
                margin: '0 auto',
              }}
            >
              Chăn ga, gối đũi wash mềm và linen tự nhiên thoáng khí cho phòng ngủ mộc mạc.
            </p>

          </div>
        </section>

        {/* Catalog Main Content */}
        <div className="container" style={{ paddingTop: '1.25rem', width: '100%' }}>
          {/* Toolbar: Filter Button + Sorting placed TOGETHER */}
          {/* Responsive Toolbar: Filter, Sort & Draggable Zoom Slider */}
          <div className="catalog-toolbar-wrap">
            {/* Top row: Product Count + Filter + Sort */}
            <div className="catalog-toolbar-top">
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{filteredProducts.length}</strong> sản phẩm
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                {/* Universal Filter button for desktop & mobile */}
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="btn btn-outline btn-sm filter-toggle-btn"
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.8rem',
                    gap: '0.35rem',
                    backgroundColor: (activeFilterCount > 0 || isFilterOpen) ? 'var(--accent-warm-tint)' : 'transparent',
                    borderColor: (activeFilterCount > 0 || isFilterOpen) ? 'var(--accent-brown)' : 'var(--border-subtle)',
                    color: (activeFilterCount > 0 || isFilterOpen) ? 'var(--accent-brown)' : 'var(--text-primary)',
                    fontWeight: (activeFilterCount > 0 || isFilterOpen) ? 600 : 500,
                  }}
                  title={isFilterOpen ? 'Thu lại bộ lọc' : 'Bung ra bộ lọc chi tiết'}
                >
                  <SlidersHorizontal size={13} />
                  <span>Bộ lọc</span>
                  {isFilterOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {activeFilterCount > 0 && (
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-brown)',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ArrowUpDown size={13} style={{ color: 'var(--text-muted)' }} />
                  <select
                    id="sort-select"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value as SortOption })}
                    className="form-select"
                    style={{
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.8rem',
                      width: 'auto',
                      backgroundColor: 'var(--bg-surface)',
                      cursor: 'pointer',
                    }}
                    aria-label="Sắp xếp sản phẩm"
                  >
                    <option value="featured">Nổi bật</option>
                    <option value="price-asc">Giá: Thấp - Cao</option>
                    <option value="price-desc">Giá: Cao - Thấp</option>
                    <option value="name-asc">Tên: A – Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Draggable Column Slider Bar */}
            <div className="catalog-zoom-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                <Maximize2 size={13} style={{ color: 'var(--accent-brown)' }} />
                <span className="hidden-mobile">Cột hiển thị:</span>
              </div>

              <button
                type="button"
                onClick={() => handleCatalogColsChange(catalogCols - 1)}
                disabled={catalogCols <= 1}
                className="zoom-btn"
                title="Giảm số cột (Ảnh to hơn)"
                aria-label="Giảm số cột"
              >
                <ZoomOut size={13} />
              </button>

              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={catalogCols}
                onChange={(e) => handleCatalogColsChange(Number(e.target.value))}
                className="zoom-slider"
                style={{
                  flex: 1,
                  minWidth: '60px',
                  maxWidth: '120px',
                  verticalAlign: 'middle',
                }}
                title={`Số cột: ${catalogCols}`}
                aria-label="Thanh kéo số cột hiển thị"
              />

              <button
                type="button"
                onClick={() => handleCatalogColsChange(catalogCols + 1)}
                disabled={catalogCols >= 5}
                className="zoom-btn"
                title="Tăng số cột (Nhiều ảnh hơn)"
                aria-label="Tăng số cột"
              >
                <ZoomIn size={13} />
              </button>

              <span className="zoom-mode-badge">
                <span className="mobile-only">
                  {catalogCols === 1
                    ? '1 cột (Lướt xem)'
                    : catalogCols >= 3
                    ? '3 cột (Nhỏ)'
                    : '2 cột'}
                </span>
                <span className="desktop-only">
                  {catalogCols === 1
                    ? '1 cột (Lớn)'
                    : catalogCols === 5
                    ? '5 cột (Nhỏ)'
                    : `${catalogCols} cột`}
                </span>
              </span>
            </div>
          </div>

              {/* Active Filter Tags */}
              {activeFilterCount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '1rem',
                  }}
                >
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Lọc:</span>

                  {filters.category !== 'all' && (
                    <span className="badge badge-draft" style={{ gap: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                      {categories.find((c) => c.id === filters.category)?.name}
                      <button type="button" onClick={() => handleFilterChange({ category: 'all' })}>
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {filters.type !== 'all' && (
                    <span className="badge badge-draft" style={{ gap: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                      {filters.type === 'combo' ? 'Combo' : 'Món lẻ'}
                      <button type="button" onClick={() => handleFilterChange({ type: 'all' })}>
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {filters.priceRangeId !== 'all' && (
                    <span className="badge badge-draft" style={{ gap: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                      {SITE_CONFIG.priceRanges.find((r) => r.id === filters.priceRangeId)?.label}
                      <button type="button" onClick={() => handleFilterChange({ priceRangeId: 'all' })}>
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {filters.color !== 'all' && (
                    <span className="badge badge-draft" style={{ gap: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                      Màu {getColorOption(filters.color).label.split(' / ')[0]}
                      <button type="button" onClick={() => handleFilterChange({ color: 'all' })}>
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {filters.searchQuery && (
                    <span className="badge badge-draft" style={{ gap: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                      "{filters.searchQuery}"
                      <button type="button" onClick={() => handleFilterChange({ searchQuery: '' })}>
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    style={{ fontSize: '0.775rem', color: 'var(--accent-brown)', textDecoration: 'underline', marginLeft: '0.25rem' }}
                  >
                    Xóa lọc
                  </button>
                </div>
              )}

              {/* Collapsible Filter Panel (Bung ra / Thu lại) */}
              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                categories={categories}
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                totalFilteredCount={filteredProducts.length}
                products={products}
              />

              {/* Product Grid / Loading / Empty States */}
              {loading ? (
                <div
                  style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <RefreshCw size={24} className="spin" style={{ color: 'var(--accent-brown)' }} />
                  <p style={{ fontSize: '0.9rem' }}>Đang tải danh mục sản phẩm...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div
                  className="catalog-products-grid"
                  style={{
                    ['--desktop-cols' as string]: Math.min(5, Math.max(1, catalogCols)),
                    ['--tablet-cols' as string]: Math.min(3, Math.max(1, catalogCols)),
                    ['--mobile-cols' as string]: Math.min(3, Math.max(1, catalogCols)),
                  }}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(p) => {
                        setQuickViewProduct(p);
                        setActiveQuickViewImg(p.coverImage || p.images?.[0] || '');
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '3rem 1.25rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                    Không tìm thấy sản phẩm phù hợp
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '380px' }}>
                    Không có sản phẩm nào khớp với bộ lọc hiện tại. Bạn vui lòng thử chọn danh mục khác hoặc xóa bộ lọc.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleResetFilters}
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}
        </div>
      </main>

      {/* Quick View Modal for Customer Storefront */}
      {quickViewProduct &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            {/* Backdrop */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
              }}
              onClick={() => setQuickViewProduct(null)}
            />

            {/* Modal Dialog Content - Expansive 1280px View */}
            {(() => {
              const rawImages = quickViewProduct.images && quickViewProduct.images.length > 0
                ? quickViewProduct.images
                : (quickViewProduct.coverImage ? [quickViewProduct.coverImage] : ['/images/placeholder.webp']);

              const parsedQuickViewImages = rawImages.map((raw, idx) => {
                const [clean, colorTag] = raw.split('#color=');
                return {
                  raw,
                  clean,
                  colorId: colorTag ? decodeURIComponent(colorTag) : '',
                  originalIndex: idx,
                };
              });

              const currentImgObj = parsedQuickViewImages.find((p) => p.raw === activeQuickViewImg) || parsedQuickViewImages[0];
              const currentIdx = currentImgObj.originalIndex;

              const handlePrev = (e: React.MouseEvent) => {
                e.stopPropagation();
                const nextIdx = currentIdx === 0 ? parsedQuickViewImages.length - 1 : currentIdx - 1;
                setActiveQuickViewImg(parsedQuickViewImages[nextIdx].raw);
              };
              const handleNext = (e: React.MouseEvent) => {
                e.stopPropagation();
                const nextIdx = currentIdx === parsedQuickViewImages.length - 1 ? 0 : currentIdx + 1;
                setActiveQuickViewImg(parsedQuickViewImages[nextIdx].raw);
              };

              return (
                <div
                  style={{
                    position: 'relative',
                    width: '95vw',
                    maxWidth: '1280px',
                    maxHeight: '94vh',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
                    zIndex: 10001,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div
                    style={{
                      padding: '1rem 1.75rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--bg-muted)',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          backgroundColor: 'var(--accent-brown)',
                          color: '#ffffff',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                        }}
                      >
                        {quickViewProduct.id}
                      </span>
                      <h3
                        className="font-serif"
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          margin: 0,
                        }}
                      >
                        {quickViewProduct.name}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        ({parsedQuickViewImages.length} ảnh)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(null)}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: '6px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      aria-label="Đóng xem nhanh"
                    >
                      <X size={22} />
                    </button>
                  </div>

                  {/* Body: Two Columns (Images 62%, Details 38%) */}
                  <div
                    className="catalog-quick-view-grid"
                    style={{
                      padding: '1.75rem',
                      overflowY: 'auto',
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: '2rem',
                      alignItems: 'start',
                    }}
                  >
                    {/* Left: Photos Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* Big Active Image */}
                      <div
                        className="catalog-quick-view-hero-box"
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          maxHeight: '520px',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          backgroundColor: '#faf8f5',
                          border: '1px solid var(--border-subtle)',
                          position: 'relative',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={currentImgObj.clean}
                          alt={`${quickViewProduct.name} - Ảnh ${currentIdx + 1}`}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            transition: 'opacity 0.2s ease',
                          }}
                        />

                        {/* Assigned Color Badge */}
                        {currentImgObj.colorId && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              backgroundColor: 'rgba(44, 40, 37, 0.82)',
                              backdropFilter: 'blur(6px)',
                              color: '#ffffff',
                              padding: '0.3rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              zIndex: 3,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            }}
                          >
                            <span
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: getColorOption(currentImgObj.colorId).hex,
                                border: '1px solid rgba(255,255,255,0.4)',
                              }}
                            />
                            <span>Màu: {getColorOption(currentImgObj.colorId).label}</span>
                          </div>
                        )}

                        {/* Counter Badge */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '12px',
                            backgroundColor: 'rgba(44, 40, 37, 0.75)',
                            backdropFilter: 'blur(6px)',
                            color: '#ffffff',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            pointerEvents: 'none',
                          }}
                        >
                          Ảnh {currentIdx + 1} / {parsedQuickViewImages.length}
                        </div>

                        {/* Prev Arrow */}
                        {parsedQuickViewImages.length > 1 && (
                          <button
                            type="button"
                            onClick={handlePrev}
                            style={{
                              position: 'absolute',
                              left: '14px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              backgroundColor: 'rgba(255, 255, 255, 0.92)',
                              color: 'var(--text-primary)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '42px',
                              height: '42px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 3px 10px rgba(0,0,0,0.18)',
                              transition: 'all 0.15s ease',
                            }}
                            title="Ảnh trước"
                          >
                            <ChevronLeft size={22} />
                          </button>
                        )}

                        {/* Next Arrow */}
                        {parsedQuickViewImages.length > 1 && (
                          <button
                            type="button"
                            onClick={handleNext}
                            style={{
                              position: 'absolute',
                              right: '14px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              backgroundColor: 'rgba(255, 255, 255, 0.92)',
                              color: 'var(--text-primary)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '42px',
                              height: '42px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 3px 10px rgba(0,0,0,0.18)',
                              transition: 'all 0.15s ease',
                            }}
                            title="Ảnh tiếp theo"
                          >
                            <ChevronRight size={22} />
                          </button>
                        )}
                      </div>

                      {/* Large Thumbnails */}
                      {parsedQuickViewImages.length > 1 && (
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.65rem',
                            overflowX: 'auto',
                            paddingBottom: '0.4rem',
                            scrollbarWidth: 'thin',
                          }}
                        >
                          {parsedQuickViewImages.map((item, idx) => {
                            const isSelected = currentImgObj.raw === item.raw;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveQuickViewImg(item.raw)}
                                style={{
                                  width: '78px',
                                  height: '78px',
                                  flexShrink: 0,
                                  borderRadius: 'var(--radius-sm)',
                                  overflow: 'hidden',
                                  border: isSelected
                                    ? '2.5px solid var(--accent-brown)'
                                    : '1px solid var(--border-subtle)',
                                  padding: 0,
                                  cursor: 'pointer',
                                  backgroundColor: '#faf8f5',
                                  opacity: isSelected ? 1 : 0.65,
                                  transition: 'all 0.15s ease',
                                  transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                                  boxShadow: isSelected ? '0 2px 8px rgba(118,99,82,0.3)' : 'none',
                                  position: 'relative',
                                }}
                                title={`Xem ảnh ${idx + 1}`}
                              >
                                <img
                                  src={item.clean}
                                  alt=""
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  loading="lazy"
                                />
                                {item.colorId && (
                                  <span
                                    style={{
                                      position: 'absolute',
                                      top: '3px',
                                      right: '3px',
                                      width: '8px',
                                      height: '8px',
                                      borderRadius: '50%',
                                      backgroundColor: getColorOption(item.colorId).hex,
                                      border: '1px solid #ffffff',
                                    }}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                {/* Right: Info & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span className="badge badge-draft">
                        {categories.find((c) => c.id === quickViewProduct.category)?.name || quickViewProduct.category}
                      </span>
                      {quickViewProduct.type === 'combo' && (
                        <span className="badge badge-combo">Bộ Combo</span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        color: 'var(--accent-brown)',
                        fontFamily: 'serif',
                      }}
                    >
                      {formatVND(quickViewProduct.price)}
                    </div>
                  </div>

                  {/* Variants - Shopee style */}
                  {quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                        Phân loại mẫu ({quickViewProduct.variants.length} mẫu):
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxHeight: '180px', overflowY: 'auto', padding: '2px' }}>
                        {quickViewProduct.variants.map((v, vIdx) => {
                          const isVarActive = currentImgObj.clean === v.image || currentImgObj.raw.startsWith(v.image);
                          return (
                            <button
                              key={vIdx}
                              type="button"
                              onClick={() => {
                                const matched = parsedQuickViewImages.find(
                                  (p) => p.clean === v.image || p.raw.startsWith(v.image)
                                );
                                if (matched) {
                                  setActiveQuickViewImg(matched.raw);
                                }
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '0.25rem 0.55rem',
                                borderRadius: 'var(--radius-sm)',
                                border: isVarActive ? '1.5px solid var(--accent-brown)' : '1px solid var(--border-subtle)',
                                fontSize: '0.72rem',
                                backgroundColor: isVarActive ? 'var(--accent-warm-tint)' : 'var(--bg-muted)',
                                color: isVarActive ? 'var(--accent-brown)' : 'var(--text-primary)',
                                fontWeight: isVarActive ? 600 : 400,
                                cursor: 'pointer',
                              }}
                            >
                              <img src={v.image} alt="" style={{ width: '20px', height: '20px', objectFit: 'cover', borderRadius: '2px' }} />
                              <span>{v.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Colors - Clickable to switch photos */}
                  {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                        Màu sắc (bấm để xem ảnh):
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {quickViewProduct.colors.map((cId) => {
                          const c = getColorOption(cId);
                          const isColorActive = currentImgObj.colorId && currentImgObj.colorId.toLowerCase() === cId.toLowerCase();
                          return (
                            <button
                              key={cId}
                              type="button"
                              onClick={() => {
                                const matched = parsedQuickViewImages.find(
                                  (p) => p.colorId && p.colorId.toLowerCase() === cId.toLowerCase()
                                );
                                if (matched) {
                                  setActiveQuickViewImg(matched.raw);
                                }
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '14px',
                                border: isColorActive ? '1.5px solid var(--accent-brown)' : '1px solid var(--border-subtle)',
                                fontSize: '0.75rem',
                                backgroundColor: isColorActive ? 'var(--accent-warm-tint)' : 'var(--bg-muted)',
                                color: isColorActive ? 'var(--accent-brown)' : 'var(--text-primary)',
                                fontWeight: isColorActive ? 600 : 400,
                                cursor: 'pointer',
                              }}
                            >
                              <span
                                style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  backgroundColor: c.hex,
                                  border: `1px solid ${c.borderHex || 'rgba(0,0,0,0.1)'}`,
                                }}
                              />
                              <span>{c.label.split(' / ')[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                        Kích thước:
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {quickViewProduct.sizes.map((sz) => (
                          <span
                            key={sz}
                            style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '4px',
                              backgroundColor: 'var(--bg-muted)',
                              border: '1px solid var(--border-subtle)',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          >
                            {sz}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description Preview */}
                  {quickViewProduct.description && (
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {quickViewProduct.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
                    <Link
                      to={`/products/${quickViewProduct.slug || quickViewProduct.id}`}
                      className="btn btn-primary"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        textDecoration: 'none',
                        padding: '0.65rem 1rem',
                        fontWeight: 600,
                      }}
                    >
                      <span>Xem chi tiết đầy đủ</span>
                      <ArrowRight size={16} />
                    </Link>

                    <a
                      href={SITE_CONFIG.contact.messenger.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        textDecoration: 'none',
                        padding: '0.55rem 1rem',
                        fontSize: '0.85rem',
                      }}
                    >
                      <MessageCircle size={16} />
                      <span>Nhắn tin tư vấn Messenger</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            );
          })()}
          </div>,
          document.body
        )}

      <Footer />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }

        .category-scroll-row {
          justify-content: flex-start;
        }

        @media (min-width: 768px) {
          .category-scroll-row {
            justify-content: center;
          }
        }

        @media (max-width: 640px) {
          .catalog-quick-view-grid {
            padding: 1rem !important;
            gap: 1.25rem !important;
          }
          .catalog-quick-view-hero-box {
            max-height: 48vh !important;
          }
        }

        @media (min-width: 900px) {
          .catalog-quick-view-grid {
            grid-template-columns: minmax(520px, 1.6fr) minmax(340px, 1fr) !important;
            gap: 2.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};
