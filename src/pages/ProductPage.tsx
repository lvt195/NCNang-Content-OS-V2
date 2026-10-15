import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { getColorOption } from '../data/colors';
import { SITE_CONFIG } from '../config/site';
import { analyticsService } from '../services/analyticsService';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductGallery } from '../components/ProductGallery';
import { ProductCard } from '../components/ProductCard';

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

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

  const handleCopyCode = () => {
    if (!product) return;
    navigator.clipboard.writeText(product.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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

      <main style={{ flex: 1, paddingBottom: '4rem' }}>
        <div className="container" style={{ paddingTop: '1.5rem', maxWidth: '1440px' }}>
          {/* Breadcrumbs Navigation */}
          <nav
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
              <ProductGallery images={product.images} productName={product.name} />
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

              {/* Colors Swatches & Vietnamese Labels */}
              {product.colors && product.colors.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                    Màu sắc có sẵn:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {product.colors.map((colorId) => {
                      const color = getColorOption(colorId);
                      return (
                        <div
                          key={colorId}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.35rem 0.65rem',
                            backgroundColor: 'var(--bg-muted)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.85rem',
                          }}
                        >
                          <span
                            className="color-dot"
                            style={{
                              background: color.hex,
                              borderColor: color.borderHex || 'rgba(0,0,0,0.1)',
                            }}
                          />
                          <span>{color.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes Available */}
              {product.sizes && product.sizes.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                    Kích thước tiêu chuẩn:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {product.sizes.map((s) => (
                      <span
                        key={s}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                    * Tiệm có nhận may theo kích thước đệm riêng (đệm cao 20-30cm hoặc nệm Nhật).
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
                  Website hiển thị danh mục và giá tham khảo. Quý khách vui lòng gửi mã{' '}
                  <strong style={{ color: 'var(--accent-brown)' }}>[{product.id}]</strong> qua Zalo hoặc
                  Facebook Messenger để kiểm tra tình trạng vải và chốt đơn:
                </p>

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
        @media (min-width: 960px) {
          .product-detail-grid {
            grid-template-columns: 1.45fr 1fr !important;
            gap: 3.5rem !important;
            align-items: start !important;
          }
        }
      `}</style>
    </div>
  );
};
