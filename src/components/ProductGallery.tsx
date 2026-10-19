import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Sparkles,
  Check,
} from 'lucide-react';
import { getColorOption, slugifyColor } from '../data/colors';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  selectedColor?: string;
  onColorChange?: (color: string) => void;
  colors?: string[];
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  selectedColor,
  onColorChange,
  colors = [],
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Touch gesture refs for Shopee-style mobile swipe
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const thumbScrollRef = useRef<HTMLDivElement | null>(null);

  // Parse images into clean URLs and optional color tags
  const parsedImages = useMemo(() => {
    const rawList = images && images.length > 0 ? images : ['/images/placeholder.webp'];
    return rawList.map((raw, originalIndex) => {
      const [clean, colorTag] = raw.split('#color=');
      return {
        raw,
        clean,
        colorId: colorTag ? decodeURIComponent(colorTag) : '',
        originalIndex,
      };
    });
  }, [images]);

  // Combined unique colors from product definition and parsed tags
  const effectiveColors = useMemo(() => {
    const set = new Set<string>();
    (colors || []).forEach((c) => {
      if (c && c.trim()) set.add(c.trim());
    });
    parsedImages.forEach((img) => {
      if (img.colorId) set.add(img.colorId.trim());
    });
    return Array.from(set);
  }, [colors, parsedImages]);

  // Multi-tier matcher to find best photo index for a chosen color
  const findImageIndexForColor = (color: string): number => {
    if (!color || parsedImages.length === 0) return 0;
    const targetSlug = slugifyColor(color).toLowerCase();
    const targetLabel = getColorOption(color).label.toLowerCase();

    // 1. Explicit `#color=` tag match
    const exactTagIndex = parsedImages.findIndex((p) => {
      if (!p.colorId) return false;
      const tagSlug = slugifyColor(p.colorId).toLowerCase();
      const tagLabel = getColorOption(p.colorId).label.toLowerCase();
      return (
        tagSlug === targetSlug ||
        tagLabel === targetLabel ||
        p.colorId.toLowerCase() === color.toLowerCase()
      );
    });
    if (exactTagIndex !== -1) return exactTagIndex;

    // 2. URL / filename match
    const strippedSlug = targetSlug.replace(/-/g, '');
    const urlMatchIndex = parsedImages.findIndex((p) => {
      const u = p.clean.toLowerCase();
      return u.includes(targetSlug) || (strippedSlug.length > 2 && u.includes(strippedSlug));
    });
    if (urlMatchIndex !== -1) return urlMatchIndex;

    // 3. Fallback distribution across available product colors
    if (effectiveColors.length > 1 && parsedImages.length > 1) {
      const colorIndex = effectiveColors.findIndex(
        (c) =>
          slugifyColor(c).toLowerCase() === targetSlug ||
          c.toLowerCase() === color.toLowerCase()
      );
      if (colorIndex !== -1) {
        return Math.min(
          Math.floor((colorIndex * parsedImages.length) / effectiveColors.length),
          parsedImages.length - 1
        );
      }
    }

    return 0;
  };

  // Find thumbnail for color options (Shopee variation thumbnail preview)
  const getColorThumbnail = (colorId: string): string | null => {
    const idx = findImageIndexForColor(colorId);
    return parsedImages[idx]?.clean || null;
  };

  // Sync selectedColor from parent component
  useEffect(() => {
    if (selectedColor) {
      const matchIdx = findImageIndexForColor(selectedColor);
      setSelectedIndex(matchIdx);
    }
  }, [selectedColor, parsedImages, effectiveColors]);

  const handleUserSelectColor = (color: string) => {
    const matchIdx = findImageIndexForColor(color);
    setSelectedIndex(matchIdx);
    if (onColorChange) {
      onColorChange(color);
    }
  };

  const handleSelectThumbnail = (index: number) => {
    setSelectedIndex(index);
    const imgObj = parsedImages[index];
    if (imgObj?.colorId && onColorChange) {
      onColorChange(imgObj.colorId);
    }
  };

  const currentImgObj = parsedImages[selectedIndex] || parsedImages[0];
  const activeImage = currentImgObj.clean;

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextIdx = selectedIndex === 0 ? parsedImages.length - 1 : selectedIndex - 1;
    handleSelectThumbnail(nextIdx);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextIdx = selectedIndex === parsedImages.length - 1 ? 0 : selectedIndex + 1;
    handleSelectThumbnail(nextIdx);
  };

  // Shopee-style Touch Swipe Gestures for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;

    // Detect horizontal swipe if deltaX is dominant and exceeds 40px
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Scroll thumbnails left/right on desktop
  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbScrollRef.current) {
      const offset = direction === 'left' ? -200 : 200;
      thumbScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, selectedIndex, parsedImages.length]);

  return (
    <div className="product-gallery-root">
      {/* Main Hero Image Container - Shopee Style with Swipe & Badges */}
      <div
        className="product-hero-box"
        onClick={() => setIsLightboxOpen(true)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        title="Bấm để phóng to xem chi tiết ảnh chất lượng cao"
      >
        {failedImages[selectedIndex] ? (
          <div className="product-hero-placeholder">
            <span>Hình ảnh đang được cập nhật</span>
          </div>
        ) : (
          <img
            key={activeImage}
            src={activeImage}
            alt={`${productName} - Ảnh ${selectedIndex + 1}`}
            className="product-hero-img"
            onError={() => handleImageError(selectedIndex)}
          />
        )}

        {/* Assigned Color Badge on Hero Image */}
        {currentImgObj.colorId && (
          <div className="hero-color-tag">
            <span
              style={{
                width: '11px',
                height: '11px',
                borderRadius: '50%',
                backgroundColor: getColorOption(currentImgObj.colorId).hex,
                border: '1px solid rgba(255,255,255,0.8)',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span>Màu: {getColorOption(currentImgObj.colorId).label}</span>
          </div>
        )}

        {/* Shopee-style Floating Counter Pill (e.g. 1/6) */}
        {parsedImages.length > 1 && (
          <div className="shopee-counter-pill">
            <span>{selectedIndex + 1}</span>
            <span style={{ opacity: 0.6 }}>/</span>
            <span>{parsedImages.length}</span>
          </div>
        )}

        {/* Zoom Hint Icon */}
        <div className="shopee-zoom-pill" title="Phóng to ảnh">
          <Maximize2 size={16} />
        </div>

        {/* Left / Right Arrows on Hero */}
        {parsedImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="gallery-nav-arrow arrow-left"
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="gallery-nav-arrow arrow-right"
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Shopee-style Variations / Colors with Mini Image Thumbnails */}
      {effectiveColors.length > 0 && (
        <div className="shopee-variations-box">
          <div className="variations-header">
            <span className="variations-title">
              <Sparkles size={14} color="var(--accent-brown)" />
              <span>Phân loại màu sắc ({effectiveColors.length} màu):</span>
            </span>
            {selectedColor && (
              <span className="selected-color-name">
                {getColorOption(selectedColor).label}
              </span>
            )}
          </div>
          <div className="variations-grid">
            {effectiveColors.map((colorId) => {
              const col = getColorOption(colorId);
              const thumbUrl = getColorThumbnail(colorId);
              const isSelected =
                selectedColor &&
                (slugifyColor(selectedColor).toLowerCase() === slugifyColor(colorId).toLowerCase() ||
                  selectedColor.toLowerCase() === colorId.toLowerCase());

              return (
                <button
                  key={colorId}
                  type="button"
                  onClick={() => handleUserSelectColor(colorId)}
                  className={`shopee-var-btn ${isSelected ? 'active' : ''}`}
                  title={`Xem mẫu màu ${col.label}`}
                >
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={col.label}
                      className="var-thumb-img"
                    />
                  ) : (
                    <span
                      className="var-color-circle"
                      style={{ backgroundColor: col.hex }}
                    />
                  )}
                  <span className="var-label">{col.label}</span>
                  {isSelected && (
                    <div className="var-check-badge">
                      <Check size={11} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Thumbnails Strip with Desktop Scroll Arrows & Hover-to-preview */}
      {parsedImages.length > 1 && (
        <div className="thumbnails-wrapper">
          {parsedImages.length > 5 && (
            <button
              type="button"
              onClick={() => scrollThumbnails('left')}
              className="thumb-nav-btn thumb-nav-left"
              aria-label="Cuộn thumbnail sang trái"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div className="product-gallery-thumbnails" ref={thumbScrollRef}>
            {parsedImages.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectThumbnail(idx)}
                  onMouseEnter={() => handleSelectThumbnail(idx)}
                  className={`product-thumb-btn ${isSelected ? 'selected' : ''}`}
                  aria-label={`Xem ảnh ${idx + 1}`}
                >
                  {failedImages[idx] ? (
                    <div className="thumb-placeholder">Lỗi</div>
                  ) : (
                    <img
                      src={item.clean}
                      alt=""
                      className="thumb-img"
                      loading="lazy"
                    />
                  )}

                  {/* Color Dot on Thumbnail if tagged */}
                  {item.colorId && (
                    <span
                      className="thumb-color-dot"
                      style={{ backgroundColor: getColorOption(item.colorId).hex }}
                      title={`Màu: ${getColorOption(item.colorId).label}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {parsedImages.length > 5 && (
            <button
              type="button"
              onClick={() => scrollThumbnails('right')}
              className="thumb-nav-btn thumb-nav-right"
              aria-label="Cuộn thumbnail sang phải"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}

      {/* Shopee Lightbox Modal */}
      {isLightboxOpen &&
        createPortal(
          <div
            className="shopee-lightbox-backdrop"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Header / Close Bar */}
            <div className="lightbox-top-bar" onClick={(e) => e.stopPropagation()}>
              <div className="lightbox-title-area">
                <strong style={{ color: '#ffffff' }}>{productName}</strong>
                <span>•</span>
                <span>Ảnh {selectedIndex + 1} / {parsedImages.length}</span>
                {currentImgObj.colorId && (
                  <span className="lightbox-color-pill">
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getColorOption(currentImgObj.colorId).hex,
                      }}
                    />
                    {getColorOption(currentImgObj.colorId).label}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="lightbox-close-btn"
                aria-label="Đóng phóng to"
              >
                <X size={24} />
              </button>
            </div>

            {/* Lightbox Main Stage */}
            <div
              className="lightbox-stage"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={activeImage}
                alt={`${productName} phóng to`}
                className="lightbox-hero-img"
              />

              {/* Prev / Next Arrows */}
              {parsedImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="lightbox-arrow lightbox-arrow-left"
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft size={30} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="lightbox-arrow lightbox-arrow-right"
                    aria-label="Ảnh sau"
                  >
                    <ChevronRight size={30} />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Thumbnails Strip */}
            {parsedImages.length > 1 && (
              <div
                className="lightbox-thumb-strip"
                onClick={(e) => e.stopPropagation()}
              >
                {parsedImages.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectThumbnail(idx)}
                    className={`lightbox-thumb-item ${idx === selectedIndex ? 'active' : ''}`}
                  >
                    <img src={item.clean} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                ))}
              </div>
            )}
          </div>,
          document.body
        )}

      <style>{`
        .product-gallery-root {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          position: sticky;
          top: 1.25rem;
        }

        /* Shopee-style Main Hero Image Box */
        .product-hero-box {
          width: 100%;
          aspect-ratio: 1 / 1;
          max-height: 540px;
          background-color: #faf8f5;
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          position: relative;
          cursor: zoom-in;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          touch-action: pan-y;
        }
        .product-hero-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 0.9rem;
          background-color: var(--bg-muted);
        }
        .product-hero-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
        }
        .product-hero-box:hover .product-hero-img {
          transform: scale(1.02);
        }

        /* Hero Badges */
        .hero-color-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          background-color: rgba(38, 34, 30, 0.86);
          backdrop-filter: blur(8px);
          color: #ffffff;
          padding: 0.32rem 0.8rem;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          z-index: 3;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        .shopee-counter-pill {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background-color: rgba(28, 25, 23, 0.72);
          backdrop-filter: blur(6px);
          color: #ffffff;
          padding: 0.22rem 0.7rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          z-index: 3;
          pointer-events: none;
        }
        .shopee-zoom-pill {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background-color: rgba(255, 255, 255, 0.92);
          color: var(--text-primary);
          padding: 0.42rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          z-index: 3;
          transition: all 0.15s ease;
        }
        .product-hero-box:hover .shopee-zoom-pill {
          transform: scale(1.08);
          background-color: #ffffff;
        }

        /* Navigation Arrows */
        .gallery-nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(255, 255, 255, 0.92);
          color: var(--text-primary);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.18);
          z-index: 3;
          transition: all 0.15s ease;
        }
        .gallery-nav-arrow:hover {
          background-color: #ffffff;
          transform: translateY(-50%) scale(1.08);
        }
        .arrow-left { left: 10px; }
        .arrow-right { right: 10px; }

        /* Shopee Variations Box with Mini Photos */
        .shopee-variations-box {
          background-color: #ffffff;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }
        .variations-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.6rem;
        }
        .variations-title {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--text-secondary);
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .selected-color-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--accent-brown);
        }
        .variations-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
        }

        /* Shopee-style Variation Button with 36x36 photo */
        .shopee-var-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem 0.25rem 0.25rem;
          border-radius: var(--radius-sm);
          font-size: 0.84rem;
          font-weight: 500;
          background-color: #ffffff;
          color: var(--text-primary);
          border: 1.5px solid var(--border-subtle);
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }
        .shopee-var-btn:hover {
          border-color: var(--accent-brown);
          background-color: #faf8f5;
        }
        .shopee-var-btn.active {
          border-color: var(--accent-brown);
          background-color: var(--accent-warm-tint);
          color: var(--accent-brown);
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(118,99,82,0.18);
        }
        .var-thumb-img {
          width: 36px;
          height: 36px;
          border-radius: 4px;
          object-fit: cover;
          flex-shrink: 0;
          border: 1px solid rgba(0,0,0,0.08);
        }
        .var-color-circle {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          flex-shrink: 0;
          border: 1px solid rgba(0,0,0,0.12);
        }
        .var-label {
          line-height: 1.2;
        }
        .var-check-badge {
          position: absolute;
          bottom: -1px;
          right: -1px;
          background-color: var(--accent-brown);
          color: #ffffff;
          border-radius: 4px 0 3px 0;
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Thumbnails Wrapper with Left/Right Arrows */
        .thumbnails-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .thumb-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(255, 255, 255, 0.95);
          color: var(--text-primary);
          border: 1px solid var(--border-subtle);
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
        }
        .thumb-nav-left { left: -10px; }
        .thumb-nav-right { right: -10px; }

        .product-gallery-thumbnails {
          display: flex;
          gap: 0.65rem;
          overflow-x: auto;
          padding: 0.25rem 0.1rem;
          scrollbar-width: thin;
          scroll-behavior: smooth;
          width: 100%;
        }
        .product-thumb-btn {
          position: relative;
          width: 76px;
          height: 76px;
          flex-shrink: 0;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 2px solid transparent;
          padding: 0;
          cursor: pointer;
          background-color: #faf8f5;
          opacity: 0.68;
          transition: all 0.15s ease;
        }
        .product-thumb-btn:hover {
          opacity: 0.95;
          transform: translateY(-1px);
          border-color: rgba(118,99,82,0.4);
        }
        .product-thumb-btn.selected {
          border-color: var(--accent-brown);
          opacity: 1;
          transform: scale(1.02);
          box-shadow: 0 2px 8px rgba(118,99,82,0.25);
        }
        .thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .thumb-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .thumb-color-dot {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          border: 1.5px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.35);
        }

        /* Lightbox Overlay */
        .shopee-lightbox-backdrop {
          position: fixed;
          inset: 0;
          z-index: 10000;
          background-color: rgba(0, 0, 0, 0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .lightbox-top-bar {
          position: absolute;
          top: 1.25rem;
          left: 1.5rem;
          right: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #ffffff;
          z-index: 10002;
        }
        .lightbox-title-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: #e2d9cf;
        }
        .lightbox-color-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          background-color: rgba(255,255,255,0.15);
          font-size: 0.8rem;
          color: #ffffff;
        }
        .lightbox-close-btn {
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lightbox-stage {
          position: relative;
          max-width: 96vw;
          max-height: 86vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lightbox-hero-img {
          max-width: 100%;
          max-height: 84vh;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.6);
        }
        .lightbox-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(255,255,255,0.2);
          color: #ffffff;
          border: none;
          border-radius: 50%;
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(4px);
        }
        .lightbox-arrow-left { left: -54px; }
        .lightbox-arrow-right { right: -54px; }
        .lightbox-thumb-strip {
          position: absolute;
          bottom: 1.25rem;
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          max-width: 90vw;
          padding: 0.5rem;
        }
        .lightbox-thumb-item {
          width: 60px;
          height: 60px;
          flex-shrink: 0;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 0;
          cursor: pointer;
          background-color: transparent;
          opacity: 0.5;
          position: relative;
        }
        .lightbox-thumb-item.active {
          border: 2px solid #ffffff;
          opacity: 1;
        }

        /* Mobile Phone Layout (<= 640px) */
        @media (max-width: 640px) {
          .product-gallery-root {
            position: static;
            gap: 0.65rem;
          }
          .product-hero-box {
            /* Edge-to-edge feel on mobile */
            margin: -0.5rem -1rem 0 -1rem;
            width: calc(100% + 2rem);
            border-radius: 0;
            border-left: none;
            border-right: none;
            max-height: 88vw;
            box-shadow: none;
          }
          .gallery-nav-arrow {
            display: none; /* Mobile users swipe with fingers */
          }
          .product-thumb-btn {
            width: 64px;
            height: 64px;
          }
          .shopee-var-btn {
            padding: 0.2rem 0.65rem 0.2rem 0.2rem;
            font-size: 0.8rem;
          }
          .var-thumb-img {
            width: 32px;
            height: 32px;
          }
        }

        /* Landscape Mobile */
        @media (orientation: landscape) and (max-height: 550px) {
          .product-hero-box {
            margin: 0;
            width: 100%;
            border-radius: var(--radius-md);
            border: 1px solid var(--border-subtle);
            max-height: calc(100vh - 110px) !important;
            aspect-ratio: 1.05 / 1;
          }
          .gallery-nav-arrow {
            display: flex;
            width: 34px;
            height: 34px;
          }
          .shopee-variations-box {
            padding: 0.5rem 0.75rem;
          }
          .product-thumb-btn {
            width: 52px;
            height: 52px;
          }
        }
      `}</style>
    </div>
  );
};
