import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { FilterState, Category } from '../types/product';
import { SITE_CONFIG } from '../config/site';
import { DEFAULT_COLORS } from '../data/colors';

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  categories: Category[];
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
  totalFilteredCount: number;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  categories,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer,
  totalFilteredCount,
}) => {
  const isAnyFilterActive =
    (filters.category && filters.category !== 'all') ||
    (filters.priceRangeId && filters.priceRangeId !== 'all') ||
    (filters.color && filters.color !== 'all') ||
    (filters.type && filters.type !== 'all') ||
    Boolean(filters.searchQuery);

  const filterContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Category Filter */}
      <div>
        <h4
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
          }}
        >
          Danh mục sản phẩm
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <button
            type="button"
            className={`filter-item-btn ${filters.category === 'all' || !filters.category ? 'active' : ''}`}
            onClick={() => onFilterChange({ category: 'all' })}
          >
            <span>Tất cả danh mục</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-item-btn ${filters.category === cat.id ? 'active' : ''}`}
              onClick={() => onFilterChange({ category: cat.id })}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Product Type Filter */}
      <div>
        <h4
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
          }}
        >
          Loại sản phẩm
        </h4>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'single', label: 'Món lẻ' },
            { id: 'combo', label: 'Bộ Combo' },
          ].map((typeItem) => (
            <button
              key={typeItem.id}
              type="button"
              className={`filter-chip ${filters.type === typeItem.id ? 'active' : ''}`}
              onClick={() => onFilterChange({ type: typeItem.id })}
            >
              {typeItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Price Range Filter */}
      <div>
        <h4
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
          }}
        >
          Mức giá
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {SITE_CONFIG.priceRanges.map((range) => (
            <button
              key={range.id}
              type="button"
              className={`filter-item-btn ${filters.priceRangeId === range.id ? 'active' : ''}`}
              onClick={() => onFilterChange({ priceRangeId: range.id })}
            >
              <span>{range.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Color Swatches Filter */}
      <div>
        <h4
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
          }}
        >
          Tone màu tự nhiên
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            type="button"
            className={`color-filter-pill ${filters.color === 'all' || !filters.color ? 'active' : ''}`}
            onClick={() => onFilterChange({ color: 'all' })}
          >
            Tất cả
          </button>
          {DEFAULT_COLORS.map((col) => {
            const isSelected = filters.color === col.id;
            return (
              <button
                key={col.id}
                type="button"
                className={`color-filter-pill ${isSelected ? 'active' : ''}`}
                onClick={() => onFilterChange({ color: isSelected ? 'all' : col.id })}
                title={col.label}
              >
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: col.hex,
                    border: '1px solid rgba(0,0,0,0.15)',
                    display: 'inline-block',
                  }}
                />
                <span>{col.label.split(' / ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Action */}
      {isAnyFilterActive && (
        <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ width: '100%', gap: '0.5rem' }}
            onClick={onResetFilters}
          >
            <RotateCcw size={14} />
            <span>Xóa tất cả bộ lọc</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Filter */}
      <aside className="desktop-filters-sidebar">
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Bộ lọc tìm kiếm</span>
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={onResetFilters}
                style={{ fontSize: '0.8rem', color: 'var(--accent-brown)', textDecoration: 'underline' }}
              >
                Đặt lại
              </button>
            )}
          </div>
          {filterContent}
        </div>
      </aside>

      {/* Mobile Bottom Sheet Drawer */}
      {isMobileDrawerOpen && (
        <>
          <div className="drawer-backdrop" onClick={onCloseMobileDrawer} />
          <div
            className="drawer-content"
            style={{
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: '85vh',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                Bộ lọc ({totalFilteredCount} sản phẩm)
              </h3>
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                style={{ padding: '0.25rem', color: 'var(--text-muted)' }}
                aria-label="Đóng bộ lọc"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              {filterContent}
            </div>

            {/* Drawer Footer CTA */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                display: 'flex',
                gap: '0.75rem',
              }}
            >
              {isAnyFilterActive && (
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={onResetFilters}
                >
                  Xóa lọc
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={onCloseMobileDrawer}
              >
                Xem {totalFilteredCount} sản phẩm
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        .desktop-filters-sidebar {
          display: none;
          width: 260px;
          flex-shrink: 0;
        }

        @media (min-width: 960px) {
          .desktop-filters-sidebar {
            display: block;
          }
        }

        .filter-item-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.45rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-align: left;
          width: 100%;
          transition: background-color 0.15s ease;
        }

        .filter-item-btn:hover {
          background-color: var(--bg-muted);
          color: var(--text-primary);
        }

        .filter-item-btn.active {
          background-color: var(--accent-warm-tint);
          color: var(--accent-brown);
          font-weight: 600;
        }

        .filter-chip {
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          background-color: transparent;
          font-size: 0.825rem;
          color: var(--text-secondary);
          transition: all 0.15s ease;
        }

        .filter-chip.active {
          background-color: var(--accent-brown);
          border-color: var(--accent-brown);
          color: #ffffff;
          font-weight: 500;
        }

        .color-filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          font-size: 0.8rem;
          color: var(--text-secondary);
          background-color: transparent;
          transition: all 0.15s ease;
        }

        .color-filter-pill.active {
          border-color: var(--accent-brown);
          background-color: var(--accent-warm-tint);
          color: var(--accent-brown);
          font-weight: 500;
        }
      `}</style>
    </>
  );
};
