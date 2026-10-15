import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const validImages = images && images.length > 0 ? images : ['/images/placeholder.webp'];
  const activeImage = validImages[selectedIndex] || validImages[0];

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') setSelectedIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
      if (e.key === 'ArrowRight') setSelectedIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, validImages.length]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1.5rem' }}>
      {/* Main Hero Image */}
      <div
        onClick={() => setIsLightboxOpen(true)}
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          minHeight: '480px',
          maxHeight: '680px',
          backgroundColor: '#faf8f5',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          position: 'relative',
          cursor: 'zoom-in',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}
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
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease, opacity 0.2s ease',
            }}
            onError={() => handleImageError(selectedIndex)}
          />
        )}

        {/* Counter Badge */}
        {validImages.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              color: '#ffffff',
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 500,
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none',
            }}
          >
            {selectedIndex + 1} / {validImages.length}
          </div>
        )}

        {/* Zoom Hint Icon */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            color: 'var(--text-primary)',
            padding: '0.35rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease',
          }}
          title="Phóng to ảnh"
        >
          <Maximize2 size={16} />
        </div>

        {/* Arrow Left */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              style={{
                position: 'absolute',
                top: '50%',
                left: '10px',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                color: 'var(--text-primary)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'background-color 0.15s ease',
              }}
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={20} />
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
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                color: 'var(--text-primary)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'background-color 0.15s ease',
              }}
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {validImages.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '0.65rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            scrollbarWidth: 'thin',
          }}
        >
          {validImages.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                style={{
                  width: '82px',
                  height: '82px',
                  flexShrink: 0,
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: isSelected
                    ? '2.5px solid var(--accent-brown)'
                    : '1px solid var(--border-subtle)',
                  padding: 0,
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-muted)',
                  opacity: isSelected ? 1 : 0.65,
                  transition: 'all 0.15s ease',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
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
                    #{idx + 1}
                  </div>
                ) : (
                  <img
                    src={img}
                    alt={`${productName} thu nhỏ ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    loading="lazy"
                    onError={() => handleImageError(idx)}
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
              backgroundColor: 'rgba(0, 0, 0, 0.92)',
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
              <div style={{ fontSize: '0.9rem', color: '#e2d9cf' }}>
                <strong>{productName}</strong> • Ảnh {selectedIndex + 1} / {validImages.length}
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
              {validImages.length > 1 && (
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
            {validImages.length > 1 && (
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
                {validImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
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
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};
