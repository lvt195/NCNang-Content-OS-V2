import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Maximize2, X, Sparkles, Check } from 'lucide-react';
import { getColorOption, slugifyColor } from '../data/colors';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  selectedColor?: string;
  onColorChange?: (color: string) => void;
  colors?: string[];
  selectedVariantImage?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  selectedColor,
  onColorChange,
  colors = [],
  selectedVariantImage,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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

  // Sync selectedVariantImage from parent component
  useEffect(() => {
    if (!selectedVariantImage || parsedImages.length === 0) return;
    const targetIdx = parsedImages.findIndex(
      (img) => img.clean === selectedVariantImage || img.raw === selectedVariantImage
    );
    if (targetIdx !== -1) {
      setSelectedIndex(targetIdx);
    }
  }, [selectedVariantImage, parsedImages]);

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
      {/* Main Hero Image Container */}
      <div
        className="product-hero-box"
        onClick={() => setIsLightboxOpen(true)}
        title="Bấm để phóng to xem chi tiết ảnh"
      >
        {failedImages[selectedIndex] ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              backgroundColor: 'var(--bg-muted)',
            }}
          >
            <span>Hình ảnh đang được cập nhật</span>
          </div>
        ) : (
          <img
            src={activeImage}
            alt={`${productName} - Ảnh ${selectedIndex + 1}`}
            className="product-hero-img"
            onError={() => handleImageError(selectedIndex)}
          />
        )}

        {/* Assigned Color Badge on Hero Image */}
        {currentImgObj.colorId && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: 'rgba(44, 40, 37, 0.85)',
              backdropFilter: 'blur(6px)',
              color: '#ffffff',
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
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
                border: '1px solid rgba(255,255,255,0.6)',
                display: 'inline-block',
              }}
            />
            <span>Màu: {getColorOption(currentImgObj.colorId).label}</span>
          </div>
        )}

        {/* Counter Badge */}
        {parsedImages.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              color: '#ffffff',
              padding: '0.2rem 0.65rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 500,
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          >
            {selectedIndex + 1} / {parsedImages.length}
          </div>
        )}

        {/* Zoom Hint Icon */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            color: 'var(--text-primary)',
            padding: '0.4rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 3,
          }}
          title="Phóng to ảnh"
        >
          <Maximize2 size={16} />
        </div>

        {/* Arrow Left */}
        {parsedImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              style={{
                position: 'absolute',
                top: '50%',
                left: '10px',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                color: 'var(--text-primary)',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(0,0,0,0.18)',
                zIndex: 3,
              }}
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Arrow Right */}
            <button
              type="button"
              onClick={handleNext}
              style={{
                position: 'absolute',
                top: '50%',
                right: '10px',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                color: 'var(--text-primary)',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(0,0,0,0.18)',
                zIndex: 3,
              }}
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Interactive Color Switcher Directly In Gallery */}
      {effectiveColors.length > 0 && (
        <div className="product-gallery-color-bar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={13} color="var(--accent-brown)" /> Chọn màu để xem ảnh mẫu:
            </span>
            {selectedColor && (
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-brown)' }}>
                {getColorOption(selectedColor).label}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {effectiveColors.map((colorId) => {
              const col = getColorOption(colorId);
              const isSelected =
                selectedColor &&
                (slugifyColor(selectedColor).toLowerCase() === slugifyColor(colorId).toLowerCase() ||
                  selectedColor.toLowerCase() === colorId.toLowerCase());
              return (
                <button
                  key={colorId}
                  type="button"
                  onClick={() => handleUserSelectColor(colorId)}
                  className={`gallery-color-pill ${isSelected ? 'active' : ''}`}
                >
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: col.hex,
                      border: col.borderHex ? `1px solid ${col.borderHex}` : '1px solid rgba(0,0,0,0.15)',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span>{col.label}</span>
                  {isSelected && <Check size={13} style={{ strokeWidth: 2.5 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Thumbnails Row */}
      {parsedImages.length > 1 && (
        <div className="product-gallery-thumbnails">
          {parsedImages.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectThumbnail(idx)}
                className={`product-thumb-btn ${isSelected ? 'selected' : ''}`}
                aria-label={`Xem ảnh ${idx + 1}`}
              >
                {failedImages[idx] ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>Lỗi</span>
                  </div>
                ) : (
                  <img
                    src={item.clean}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                )}

                {/* Color Dot on Thumbnail if tagged */}
                {item.colorId && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '3px',
                      right: '3px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: getColorOption(item.colorId).hex,
                      border: '1.5px solid #ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }}
                    title={`Màu: ${getColorOption(item.colorId).label}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              backgroundColor: 'rgba(0, 0, 0, 0.94)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Header / Close Bar */}
            <div
              style={{
                position: 'absolute',
                top: '1.25rem',
                left: '1.5rem',
                right: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#ffffff',
                zIndex: 10002,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#e2d9cf' }}>
                <strong style={{ color: '#ffffff' }}>{productName}</strong>
                <span>•</span>
                <span>Ảnh {selectedIndex + 1} / {parsedImages.length}</span>
                {currentImgObj.colorId && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      fontSize: '0.8rem',
                      color: '#ffffff',
                    }}
                  >
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
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Đóng phóng to"
              >
                <X size={24} />
              </button>
            </div>

            {/* Lightbox Image Container */}
            <div
              style={{
                position: 'relative',
                maxWidth: '96vw',
                maxHeight: '88vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeImage}
                alt={`${productName} phóng to`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '86vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                }}
              />

              {/* Prev / Next Arrows in Lightbox */}
              {parsedImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    style={{
                      position: 'absolute',
                      left: '-50px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '44px',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)',
                    }}
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft size={28} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      position: 'absolute',
                      right: '-50px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '44px',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)',
                    }}
                    aria-label="Ảnh sau"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Thumbnails Strip */}
            {parsedImages.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '1.25rem',
                  display: 'flex',
                  gap: '0.5rem',
                  overflowX: 'auto',
                  maxWidth: '90vw',
                  padding: '0.5rem',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {parsedImages.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectThumbnail(idx)}
                    style={{
                      width: '64px',
                      height: '64px',
                      flexShrink: 0,
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: idx === selectedIndex ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.3)',
                      padding: 0,
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                      opacity: idx === selectedIndex ? 1 : 0.5,
                      position: 'relative',
                    }}
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
          gap: 0.85rem;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        @media (min-width: 860px) {
          .product-gallery-root {
            position: sticky;
            top: 1.25rem;
          }
        }
        .product-hero-box {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          aspect-ratio: 1 / 1;
          max-height: 560px;
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
        }
        .product-hero-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.25s ease, opacity 0.2s ease;
        }
        .product-gallery-color-bar {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.75rem 0.9rem;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .gallery-color-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.8rem;
          border-radius: var(--radius-full);
          font-size: 0.825rem;
          font-weight: 500;
          background-color: #ffffff;
          color: var(--text-primary);
          border: 1px solid var(--border-subtle);
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .gallery-color-pill:hover {
          border-color: var(--accent-brown);
        }
        .gallery-color-pill.active {
          background-color: var(--accent-warm-tint);
          color: var(--accent-brown);
          border: 2px solid var(--accent-brown);
          font-weight: 600;
          box-shadow: 0 2px 6px rgba(118,99,82,0.18);
        }
        .product-gallery-thumbnails {
          display: flex;
          gap: 0.65rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 0.35rem;
          scrollbar-width: thin;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .product-thumb-btn {
          position: relative;
          width: 78px;
          height: 78px;
          flex-shrink: 0;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          padding: 0;
          cursor: pointer;
          background-color: #faf8f5;
          opacity: 0.68;
          transition: all 0.15s ease;
        }
        .product-thumb-btn:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }
        .product-thumb-btn.selected {
          border: 2.5px solid var(--accent-brown);
          opacity: 1;
          transform: scale(1.02);
          box-shadow: 0 2px 8px rgba(118,99,82,0.22);
        }

        /* Mobile Portrait Specifics */
        @media (max-width: 640px) {
          .product-hero-box {
            max-height: min(48vh, 380px);
            border-radius: var(--radius-md);
          }
          .product-thumb-btn {
            width: 62px;
            height: 62px;
          }
        }

        /* Mobile Landscape Specifics: keep hero compact and fit viewport */
        @media (orientation: landscape) and (max-height: 550px) {
          .product-gallery-root {
            position: static;
            gap: 0.5rem;
          }
          .product-hero-box {
            max-height: calc(100vh - 120px) !important;
            aspect-ratio: 1.1 / 1;
          }
          .product-gallery-color-bar {
            padding: 0.5rem 0.75rem;
          }
          .product-thumb-btn {
            width: 54px;
            height: 54px;
          }
        }
      `}</style>
    </div>
  );
};
