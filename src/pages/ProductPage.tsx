import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  MessageCircle,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { Product } from '../types/product';
import { productService } from '../services/productService';
import { formatVND } from '../utils/formatCurrency';
import { getColorOption, slugifyColor } from '../data/colors';
import { SITE_CONFIG } from '../config/site';
import { analyticsService } from '../services/analyticsService';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductGallery } from '../components/ProductGallery';
import { ProductCard } from '../components/ProductCard';

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedOrderInfo, setCopiedOrderInfo] = useState(false);

  // User-selected options
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    async function loadProductData() {
      if (!slug) return;
      setLoading(true);
      try {
        const prod = await productService.getProductBySlug(slug);
        if (mounted) {
          setProduct(prod);

          if (prod) {
            // Track view analytics
            analyticsService.trackProductView(prod);

            // Update document title and Open Graph tags dynamically
            document.title = `${prod.name} | Tiệm Chăn Ga Nhà Có Mùi Nắng`;
            const cleanCover = (prod.coverImage || prod.images?.[0] || '').split('#color=')[0];
            const setMeta = (prop: string, content: string) => {
              if (!content) return;
              let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement;
              if (!el) {
                el = document.createElement('meta');
                el.setAttribute('property', prop);
                document.head.appendChild(el);
              }
              el.setAttribute('content', content);
            };
            setMeta('og:title', `${prod.name} - Nhà Có Mùi Nắng`);
            setMeta('og:description', prod.description ? prod.description.slice(0, 160) : 'Chăn ga gối tự nhiên Nhà Có Mùi Nắng');
            setMeta('og:image', cleanCover);
            setMeta('twitter:image', cleanCover);

            // Initialize selected color from URL query or first available color
            const queryColor = searchParams.get('color');
            if (queryColor && prod.colors?.includes(queryColor)) {
              setSelectedColor(queryColor);
            } else if (prod.colors && prod.colors.length > 0) {
              setSelectedColor(prod.colors[0]);
            }

            // Initialize selected size
            if (prod.sizes && prod.sizes.length > 0) {
              setSelectedSize(prod.sizes[0]);
            }

            // Load related products from same category
            const allPublished = await productService.getPublishedProducts();
            const related = allPublished
              .filter((p) => p.category === prod.category && p.id !== prod.id)
              .slice(0, 4);
            if (mounted) {
              setRelatedProducts(related);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      mounted = false;
    };
  }, [slug]);

  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('color', colorId);
      return next;
    }, { replace: true });
  };

  const getColorThumbnail = (colorId: string): string | null => {
    if (!product || !product.images || product.images.length === 0) return null;
    const targetSlug = slugifyColor(colorId).toLowerCase();

    // 1. Tag match
    const tagMatch = product.images.find((img) => {
      const [_, tag] = img.split('#color=');
      if (!tag) return false;
      return (
        slugifyColor(decodeURIComponent(tag)).toLowerCase() === targetSlug ||
        decodeURIComponent(tag).toLowerCase() === colorId.toLowerCase()
      );
    });
    if (tagMatch) return tagMatch.split('#color=')[0];

    // 2. URL match
    const urlMatch = product.images.find((img) => img.toLowerCase().includes(targetSlug));
    if (urlMatch) return urlMatch.split('#color=')[0];

    // 3. Distribution match
    if (product.colors && product.colors.length > 1) {
      const cIdx = product.colors.indexOf(colorId);
      if (cIdx !== -1) {
        const idx = Math.min(
          Math.floor((cIdx * product.images.length) / product.colors.length),
          product.images.length - 1
        );
        return product.images[idx].split('#color=')[0];
      }
    }

    return product.images[0].split('#color=')[0];
  };

  const handleCopyCode = () => {
    if (!product) return;
    navigator.clipboard.writeText(product.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyOrderInfo = () => {
    if (!product) return;
    const colorLabel = selectedColor ? getColorOption(selectedColor).label : 'Mặc định';
    const sizeLabel = selectedSize || 'Theo yêu cầu';
    const text = `Tôi muốn đặt mua: ${product.name} (Mã: ${product.id})\n- Màu sắc: ${colorLabel}\n- Kích thước: ${sizeLabel}\n- Giá tham khảo: ${formatVND(product.price)}`;
    navigator.clipboard.writeText(text);
    setCopiedOrderInfo(true);
    setTimeout(() => setCopiedOrderInfo(false), 2500);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main className="container" style={{ flex: 1, padding: '4rem 1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Đang tải thông tin sản phẩm...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main className="container" style={{ flex: 1, padding: '4rem 1rem', textAlign: 'center' }}>
          <div
            style={{
              maxWidth: '480px',
              margin: '0 auto',
              backgroundColor: 'var(--bg-surface)',
              padding: '3rem 2rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h2 className="font-serif" style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
              Không tìm thấy sản phẩm
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Mã sản phẩm hoặc liên kết "{slug}" không tồn tại hoặc đã ngừng cung cấp.
            </p>
            <Link to="/" className="btn btn-primary">
              <ArrowLeft size={16} />
              <span>Quay về danh mục sản phẩm</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main className="product-page-main" style={{ flex: 1, paddingBottom: '4rem' }}>
        <div className="container" style={{ paddingTop: '1.5rem', maxWidth: '1440px' }}>
          {/* Breadcrumbs Navigation */}
          <nav
            className="product-breadcrumbs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: '1.5rem',
            }}
          >
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
              <ArrowLeft size={14} />
              <span>Danh mục</span>
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.name}</span>
          </nav>

          {/* Product Detail Two Columns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '2.5rem',
            }}
            className="product-detail-grid"
          >
            {/* Left: Gallery */}
            <div>
              <ProductGallery
                images={product.images}
                productName={product.name}
                selectedColor={selectedColor}
                onColorChange={handleColorSelect}
                colors={product.colors}
              />
            </div>

            {/* Right: Info & Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Product Code & Badges */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Mã sản phẩm:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '0.2rem 0.5rem',
                      backgroundColor: 'var(--bg-muted)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                    title="Bấm để sao chép mã sản phẩm"
                  >
                    <span>{product.id}</span>
                    {copiedCode ? <Check size={12} color="#2e7d32" /> : <Copy size={12} />}
                  </button>
                  {copiedCode && (
                    <span style={{ fontSize: '0.75rem', color: '#2e7d32' }}>Đã chép mã!</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {product.type === 'combo' && <span className="badge badge-combo">Combo</span>}
                  {product.featured && <span className="badge badge-featured">Nổi bật</span>}
                </div>
              </div>

              {/* Title */}
              <h1
                className="font-serif"
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.3,
                }}
              >
                {product.name}
              </h1>

              {/* Price in VND */}
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: 'var(--accent-brown)',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.5rem',
                }}
              >
                <span>{formatVND(product.price)}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                  (Giá tham khảo, liên hệ để tư vấn theo kích thước)
                </span>
              </div>

              {/* Colors Swatches & Interactive Selection - Shopee Style */}
              {product.colors && product.colors.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      Màu sắc ({product.colors.length} màu):{' '}
                      <span style={{ color: 'var(--accent-brown)', fontWeight: 700 }}>
                        {selectedColor ? getColorOption(selectedColor).label : 'Chưa chọn'}
                      </span>
                    </span>
                    <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      (Bấm màu để chuyển xem ảnh)
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                    {product.colors.map((colorId) => {
                      const color = getColorOption(colorId);
                      const isSelected = selectedColor.toLowerCase() === colorId.toLowerCase();
                      const thumbUrl = getColorThumbnail(colorId);
                      return (
                        <button
                          key={colorId}
                          type="button"
                          onClick={() => handleColorSelect(colorId)}
                          className={`shopee-var-btn ${isSelected ? 'active' : ''}`}
                          title={`Xem mẫu màu ${color.label}`}
                        >
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt={color.label}
                              className="var-thumb-img"
                            />
                          ) : (
                            <span
                              className="var-color-circle"
                              style={{ backgroundColor: color.hex }}
                            />
                          )}
                          <span className="var-label">{color.label}</span>
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

              {/* Sizes Available & Interactive Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      Kích thước:{' '}
                      <span style={{ color: 'var(--accent-brown)', fontWeight: 700 }}>
                        {selectedSize || 'Tiêu chuẩn'}
                      </span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                    {product.sizes.map((s) => {
                      const isSelected = selectedSize === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          style={{
                            padding: '0.45rem 0.95rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: isSelected ? 'var(--accent-brown)' : 'var(--bg-surface)',
                            color: isSelected ? '#ffffff' : 'var(--text-primary)',
                            border: isSelected
                              ? '1.5px solid var(--accent-brown)'
                              : '1px solid var(--border-subtle)',
                            fontSize: '0.85rem',
                            fontWeight: isSelected ? 600 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 2px 6px rgba(118,99,82,0.25)' : 'none',
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-muted)',
                        border: '1px dashed var(--border-subtle)',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      ✂️ Nhận may đo theo yêu cầu
                    </div>
                  </div>
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'block' }}>
                    * Tiệm có nhận may theo độ dày đệm riêng (đệm cao 20-30cm hoặc nệm topper/nệm Nhật).
                  </span>
                </div>
              )}

              {/* Combo Contents Breakdown if Combo */}
              {product.type === 'combo' && product.comboItems && product.comboItems.length > 0 && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <Layers size={16} color="var(--accent-brown)" />
                    <span>Bộ combo bao gồm:</span>
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {product.comboItems.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>
                        <strong>{item.quantity}x</strong> {item.name} {item.note && `(${item.note})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  Thông tin chất liệu & chi tiết:
                </span>
                <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {product.description}
                </p>
              </div>

              {/* Purchase Inquiry Action Section */}
              <div
                style={{
                  backgroundColor: 'var(--accent-warm-tint)',
                  border: '1px solid #ebd9c2',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginTop: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} color="var(--accent-brown)" />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Liên hệ đặt may & Mua hàng
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Website hiển thị danh mục và giá tham khảo. Quý khách có thể sao chép thông tin sản phẩm đã chọn và gửi qua Zalo / Messenger để tiệm kiểm tra vải và giữ hàng nhanh nhất:
                </p>

                {/* 1-Click Copy Order Details */}
                <button
                  type="button"
                  onClick={handleCopyOrderInfo}
                  className="btn btn-outline"
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    borderStyle: 'dashed',
                    color: 'var(--accent-brown)',
                    borderColor: 'var(--accent-brown)',
                    fontSize: '0.85rem',
                    padding: '0.65rem 1rem',
                    justifyContent: 'center',
                  }}
                >
                  {copiedOrderInfo ? <Check size={16} color="#2e7d32" /> : <Copy size={16} />}
                  <span>
                    {copiedOrderInfo
                      ? '✓ Đã sao chép cấu hình đặt hàng!'
                      : `Sao chép thông tin đặt (${selectedColor ? getColorOption(selectedColor).label : 'Màu'} • ${selectedSize || 'Size'})`}
                  </span>
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <a
                    href={SITE_CONFIG.contact.zalo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    <MessageCircle size={18} />
                    <span>{SITE_CONFIG.contact.zalo.actionText}</span>
                  </a>

                  <a
                    href={SITE_CONFIG.contact.messenger.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ width: '100%', backgroundColor: '#ffffff' }}
                  >
                    <MessageCircle size={18} />
                    <span>{SITE_CONFIG.contact.messenger.actionText}</span>
                  </a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  <Info size={14} />
                  <span>Hỗ trợ gửi thêm video/ảnh thực tế ánh sáng tự nhiên khi nhắn tin.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shopee-style Lookbook / Detailed Full-Resolution Photos */}
          {product.images && product.images.length > 0 && (
            <section className="product-visual-lookbook">
              <div className="lookbook-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Sparkles size={20} color="var(--accent-brown)" />
                  <h2 className="font-serif" style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>
                    Hình ảnh chi tiết & Chất vải thực tế ({product.images.length} ảnh)
                  </h2>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0' }}>
                  Tất cả hình ảnh được tiệm chụp từ sản phẩm thật dưới ánh sáng tự nhiên.
                </p>
              </div>

              <div className="lookbook-grid">
                {product.images.map((rawImg, idx) => {
                  const [cleanUrl, colorTag] = rawImg.split('#color=');
                  const colorOption = colorTag ? getColorOption(decodeURIComponent(colorTag)) : null;
                  return (
                    <div key={idx} className="lookbook-card">
                      <div className="lookbook-img-box">
                        <img
                          src={cleanUrl}
                          alt={`${product.name} - Chi tiết ${idx + 1}`}
                          className="lookbook-img"
                          loading="lazy"
                        />
                        {colorOption && (
                          <div className="lookbook-color-badge">
                            <span
                              style={{
                                width: '9px',
                                height: '9px',
                                borderRadius: '50%',
                                backgroundColor: colorOption.hex,
                                border: '1px solid #ffffff',
                              }}
                            />
                            <span>Màu: {colorOption.label}</span>
                          </div>
                        )}
                        <span className="lookbook-counter">#{idx + 1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section style={{ marginTop: '4.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '2.5rem' }}>
              <h2
                className="font-serif"
                style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}
              >
                Sản phẩm cùng danh mục
              </h2>
              <div className="product-grid">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />

      <style>{`
        /* Desktop & Large Tablet: 2 columns */
        @media (min-width: 860px) {
          .product-detail-grid {
            grid-template-columns: minmax(0, 1.25fr) minmax(360px, 1fr) !important;
            gap: 3rem !important;
            align-items: start !important;
          }
        }

        /* Mobile Landscape Orientation (Rotating phone horizontally) */
        @media (orientation: landscape) and (max-height: 550px) {
          .product-detail-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 1.5rem !important;
            align-items: start !important;
          }
          .product-page-main {
            padding-bottom: 2rem !important;
          }
          .product-breadcrumbs {
            margin-bottom: 0.6rem !important;
          }
        }

        /* Shopee-style Variations Button in PDP */
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

        /* Lookbook / Detailed Full-Resolution Photos Section */
        .product-visual-lookbook {
          margin-top: 3.5rem;
          border-top: 1px solid var(--border-subtle);
          padding-top: 2.25rem;
        }
        .lookbook-header {
          margin-bottom: 1.5rem;
        }
        .lookbook-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 640px) {
          .lookbook-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
        .lookbook-card {
          border-radius: var(--radius-md);
          overflow: hidden;
          background-color: #faf8f5;
          border: 1px solid var(--border-subtle);
          box-shadow: 0 4px 15px rgba(0,0,0,0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .lookbook-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .lookbook-img-box {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background-color: #faf8f5;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .lookbook-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .lookbook-card:hover .lookbook-img {
          transform: scale(1.03);
        }
        .lookbook-color-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background-color: rgba(38, 34, 30, 0.85);
          backdrop-filter: blur(6px);
          color: #ffffff;
          padding: 0.28rem 0.7rem;
          border-radius: 16px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .lookbook-counter {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background-color: rgba(0,0,0,0.6);
          color: #ffffff;
          padding: 0.2rem 0.55rem;
          border-radius: 12px;
          font-size: 0.72rem;
          font-weight: 500;
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
};
