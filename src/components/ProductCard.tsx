import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Product } from '../types/product';
import { formatVND } from '../utils/formatCurrency';
import { getColorOption } from '../data/colors';
import { analyticsService } from '../services/analyticsService';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const [imageError, setImageError] = useState(false);

  const displayImage = product.coverImage || product.images?.[0] || '/images/placeholder.webp';

  return (
    <article className="product-card">
      <Link
        to={`/products/${product.slug || product.id}`}
        onClick={() => analyticsService.trackProductView(product)}
        aria-label={`Xem chi tiết sản phẩm ${product.name}`}
        style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' }}
      >
        {/* Image Container with Badges */}
        <div className="product-card-image-wrap">
          {imageError ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                padding: '1rem',
                textAlign: 'center',
              }}
            >
              <span>{product.id}</span>
              <span style={{ fontSize: '0.7rem' }}>Ảnh đang cập nhật</span>
            </div>
          ) : (
            <img
              src={displayImage}
              alt={product.name}
              className="product-card-image"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}

          {/* Badges on image */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              zIndex: 2,
            }}
          >
            {product.type === 'combo' && (
              <span className="badge badge-combo">Combo</span>
            )}
            {product.featured && product.type !== 'combo' && (
              <span className="badge badge-featured">Nổi bật</span>
            )}
          </div>

          {/* Quick View Button */}
          {onQuickView && (
            <button
              type="button"
              className="quick-view-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                color: '#2c2825',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '20px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.14)',
                cursor: 'pointer',
                zIndex: 3,
                backdropFilter: 'blur(3px)',
                whiteSpace: 'nowrap',
              }}
              title="Xem nhanh ảnh & thông tin"
            >
              <Eye size={13} />
              <span>Xem nhanh</span>
            </button>
          )}
        </div>

        {/* Card Body */}
        <div className="product-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span className="product-card-code">{product.id}</span>

            {/* Colors Swatches Dots */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {product.colors.slice(0, 4).map((colorId) => {
                  const color = getColorOption(colorId);
                  return (
                    <span
                      key={colorId}
                      className="color-dot"
                      title={color.label}
                      style={{
                        background: color.hex,
                        borderColor: color.borderHex || 'rgba(0,0,0,0.1)',
                      }}
                    />
                  );
                })}
                {product.colors.length > 4 && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    +{product.colors.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          <h3 className="product-card-title" title={product.name}>
            {product.name}
          </h3>

          {/* Sizes preview if single */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <span>{product.sizes.slice(0, 2).join(' • ')}</span>
              {product.sizes.length > 2 && <span>+{product.sizes.length - 2} cỡ</span>}
            </div>
          )}

          <div className="product-card-price">
            {formatVND(product.price)}
          </div>
        </div>
      </Link>
    </article>
  );
};
