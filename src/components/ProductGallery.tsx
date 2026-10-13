import React, { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const validImages = images && images.length > 0 ? images : ['/images/placeholder.webp'];
  const activeImage = validImages[selectedIndex] || validImages[0];

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Main Hero Image */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          backgroundColor: 'var(--bg-muted)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          position: 'relative',
        }}
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
              transition: 'opacity 0.2s ease',
            }}
            onError={() => handleImageError(selectedIndex)}
          />
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
                  width: '72px',
                  height: '72px',
                  flexShrink: 0,
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: isSelected
                    ? '2px solid var(--accent-brown)'
                    : '1px solid var(--border-subtle)',
                  padding: 0,
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-muted)',
                  opacity: isSelected ? 1 : 0.75,
                  transition: 'all 0.15s ease',
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
    </div>
  );
};
