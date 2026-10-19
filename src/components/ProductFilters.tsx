import React from 'react';
import { RotateCcw, SlidersHorizontal, ChevronUp, Check } from 'lucide-react';
import { FilterState, Category, Product } from '../types/product';
import { SITE_CONFIG } from '../config/site';
import { getAllColors } from '../data/colors';

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  totalFilteredCount: number;
  products?: Product[];
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  categories,
  isOpen,
  onClose,
  totalFilteredCount,
  products = [],
}) => {
  const isAnyFilterActive =
    (filters.category && filters.category !== 'all') ||
    (filters.priceRangeId && filters.priceRangeId !== 'all') ||
    (filters.color && filters.color !== 'all') ||
    (filters.type && filters.type !== 'all') ||
    Boolean(filters.searchQuery);

  if (!isOpen) return null;

  return (
    <div className="collapsible-filters-card">
      {/* Header bar of filter panel */}
      <div className="filters-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SlidersHorizontal size={16} color="var(--accent-brown)" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            Bộ lọc tìm kiếm chi tiết
          </span>
          {isAnyFilterActive && (
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 600,
                color: 'var(--accent-brown)',
                backgroundColor: 'var(--accent-warm-tint)',
                padding: '0.15rem 0.5rem',
                borderRadius: '12px',
                border: '1px solid #ebd9c2',
              }}
            >
              Đang áp dụng
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAnyFilterActive && (
            <button
              type="button"
              onClick={onResetFilters}
              className="filters-reset-link"
              title="Đặt lại tất cả lựa chọn"
            >
              <RotateCcw size={13} />
              <span>Đặt lại</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="filters-collapse-btn"
            title="Thu lại bộ lọc"
          >
            <span>Thu lại</span>
            <ChevronUp size={16} />
          </button>
        </div>
      </div>

      {/* Grid of 3 filter groups */}
      <div className="filters-card-grid">
        {/* Column 1: Danh mục sản phẩm */}
        <div className="filter-group-col">
          <h4 className="filter-group-heading">Danh mục sản phẩm</h4>
          <div className="filter-options-list">
            <button
              type="button"
              className={`filter-item-btn ${filters.category === 'all' || !filters.category ? 'active' : ''}`}
              onClick={() => onFilterChange({ category: 'all' })}
            >
              <span>Tất cả danh mục</span>
              <span className="filter-count-badge">({products.length})</span>
            </button>

            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat.id).length;
              const isActive = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`filter-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onFilterChange({ category: cat.id })}
                >
                  <span>{cat.name}</span>
                  <span className="filter-count-badge">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Loại sản phẩm & Mức giá */}
        <div className="filter-group-col">
          <h4 className="filter-group-heading">Loại sản phẩm</h4>
          <div className="filter-chips-wrap">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'single', label: 'Món lẻ / Set đơn' },
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

          <h4 className="filter-group-heading" style={{ marginTop: '1.25rem' }}>
            Mức giá tham khảo
          </h4>
          <div className="filter-options-list">
            {SITE_CONFIG.priceRanges.map((range) => (
              <button
                key={range.id}
                type="button"
                className={`filter-item-btn ${filters.priceRangeId === range.id ? 'active' : ''}`}
                onClick={() => onFilterChange({ priceRangeId: range.id })}
              >
                <span>{range.label}</span>
                {filters.priceRangeId === range.id && <Check size={13} color="var(--accent-brown)" />}
              </button>
            ))}
          </div>
        </div>

        {/* Column 3: Tone màu tự nhiên */}
        <div className="filter-group-col filter-group-col-wide">
          <h4 className="filter-group-heading">Tone màu tự nhiên</h4>
          <div className="filter-colors-grid">
            <button
              type="button"
              className={`color-filter-pill ${filters.color === 'all' || !filters.color ? 'active' : ''}`}
              onClick={() => onFilterChange({ color: 'all' })}
            >
              Tất cả màu
            </button>
            {getAllColors().map((col) => {
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
                      width: '13px',
                      height: '13px',
                      borderRadius: '50%',
                      background: col.hex,
                      border: '1px solid rgba(0,0,0,0.15)',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span>{col.label.split(' / ')[0]}</span>
                  {isSelected && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer bar with summary count and quick close */}
      <div className="filters-card-footer">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Đang lọc thấy <strong style={{ color: 'var(--accent-brown)' }}>{totalFilteredCount}</strong> sản phẩm phù hợp
        </span>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onClose}
          style={{ gap: '0.35rem' }}
        >
          <span>Xem kết quả</span>
          <ChevronUp size={15} />
        </button>
      </div>

      <style>{`
        .collapsible-filters-card {
          background-color: #ffffff;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
          animation: slideDownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideDownFade {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .filters-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 1.25rem;
        }

        .filters-reset-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: none;
          border: none;
          color: var(--accent-brown);
          font-size: 0.825rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: underline;
        }
        .filters-reset-link:hover {
          color: var(--text-primary);
        }

        .filters-collapse-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background-color: var(--bg-muted);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.3rem 0.65rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .filters-collapse-btn:hover {
          background-color: #ffffff;
          color: var(--text-primary);
        }

        .filters-card-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.75rem;
        }

        @media (max-width: 860px) {
          .filters-card-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }

        .filter-group-col {
          display: flex;
          flex-direction: column;
        }

        .filter-group-heading {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.65rem;
        }

        .filter-options-list {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          max-height: 220px;
          overflow-y: auto;
          padding-right: 0.25rem;
          scrollbar-width: thin;
        }

        .filter-item-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.4rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-align: left;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease;
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
        .filter-count-badge {
          font-size: 0.775rem;
          color: var(--text-muted);
        }
        .filter-item-btn.active .filter-count-badge {
          color: var(--accent-brown);
        }

        .filter-chips-wrap {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .filter-colors-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          max-height: 220px;
          overflow-y: auto;
          scrollbar-width: thin;
        }

        .color-filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.32rem 0.65rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          font-size: 0.8rem;
          color: var(--text-secondary);
          background-color: transparent;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .color-filter-pill:hover {
          border-color: var(--accent-brown);
        }
        .color-filter-pill.active {
          border-color: var(--accent-brown);
          background-color: var(--accent-warm-tint);
          color: var(--accent-brown);
          font-weight: 600;
        }

        .filters-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
          margin-top: 1.25rem;
        }
      `}</style>
    </div>
  );
};
