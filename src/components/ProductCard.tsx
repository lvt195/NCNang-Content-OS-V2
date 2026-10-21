import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Product } from '../types/product';
import { formatVND } from '../utils/formatCurrency';
import { getColorOption, getParentColorGroup, isColorInParentGroup } from '../data/colors';
import { analyticsService } from '../services/analyticsService';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const [imageError, setImageError] = useState(false);
  const [activeColorId, setActiveColorId] = useState<string | null>(null);

  // Derive unique parent colors for this product from both product.colors and variants
  const cardColors = useMemo(() => {
    const parentSet = new Set<string>();
    if (Array.isArray(product.colors)) {
      for (const c of product.colors) {
        const parent = getParentColorGroup(c);
        if (parent) parentSet.add(parent.id);
      }
    }
    if (Array.isArray(product.variants)) {
      for (const v of product.variants) {
        if (v.color) {
          const parent = getParentColorGroup(v.color);
          if (parent) parentSet.add(parent.id);
        }
        if (v.label) {
          const parent = getParentColorGroup(v.label);
          if (parent) parentSet.add(parent.id);
        }
      }
    }
    return Array.from(parentSet);
  }, [product.colors, product.variants]);

  // Helper to find image matching a color
  const findImageForColor = (colorId: string): string | null => {
    // 1. Check in product.variants for image matching this color
    if (product.variants && product.variants.length > 0) {
      const foundVar = product.variants.find((v) => {
        if (v.color && isColorInParentGroup(v.color, colorId)) return true;
        if (v.label && isColorInParentGroup(v.label, colorId)) return true;
        return false;
      });
      if (foundVar?.image) return foundVar.image;
    }

    // 2. Check in product.images with #color= tag
    if (product.images && product.images.length > 0) {
      const found = product.images.find((img) => {
        if (img.includes('#color=')) {
          const assigned = decodeURIComponent(img.split('#color=')[1]);
          return assigned.toLowerCase() === colorId.toLowerCase() || isColorInParentGroup(assigned, colorId);
        }
        return false;
      });
      if (found) return found.split('#color=')[0];
    }

    return null;
  };

  const colorSwappedImage = activeColorId ? findImageForColor(activeColorId) : null;
  const rawImage = colorSwappedImage || product.coverImage || product.images?.[0] || '/images/placeholder.webp';
  const displayImage = rawImage.split('#color=')[0];

  return (
    <article className="product-card">
      <Link
        to={`/products/${product.slug || product.id}${activeColorId ? `?color=${activeColorId}` : ''}`}
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
              <span style={{ fontSize: '0.75rem' }}>Ảnh đang cập nhật</span>
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
          {/* Colors Swatches Dots */}
          {cardColors.length > 0 && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0.25rem', flexWrap: 'wrap' }}
              onClick={(e) => e.stopPropagation()}
            >
              {cardColors.slice(0, 6).map((colorId) => {
                const color = getColorOption(colorId);
                const isHovered = activeColorId === colorId;
                return (
                  <button
                    key={colorId}
                    type="button"
                    onMouseEnter={() => setActiveColorId(colorId)}
                    onMouseLeave={() => setActiveColorId(null)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveColorId(activeColorId === colorId ? null : colorId);
                    }}
                    className="color-dot"
                    title={`Xem mẫu màu: ${color.label}`}
                    style={{
                      background: color.hex,
                      borderColor: isHovered ? 'var(--text-primary)' : (color.borderHex || 'rgba(0,0,0,0.15)'),
                      transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                      boxShadow: isHovered ? '0 0 0 1.5px var(--accent-brown)' : 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.15s ease',
                      width: '12px',
                      height: '12px',
                    }}
                  />
                );
              })}
              {cardColors.length > 6 && (
                <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                  +{cardColors.length - 6}
                </span>
              )}
            </div>
          )}

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
