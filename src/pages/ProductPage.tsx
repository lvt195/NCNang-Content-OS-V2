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
import { Product, ProductVariant, Category } from '../types/product';
import { productService } from '../services/productService';
import { formatVND } from '../utils/formatCurrency';
import { cleanProductDescription } from '../utils/filterProducts';
import { getColorOption } from '../data/colors';
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedOrderInfo, setCopiedOrderInfo] = useState(false);

  // User-selected options
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

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

            // Initialize selected color from URL query if present
            const queryColor = searchParams.get('color');
            if (queryColor && prod.colors?.includes(queryColor)) {
              setSelectedColor(queryColor);
            } else {
              setSelectedColor('');
            }

            // Initialize selected size
            if (prod.sizes && prod.sizes.length > 0) {
              setSelectedSize(prod.sizes[0]);
            }

            // Do not force select first variant on load so customer sees overview image first
            setSelectedVariant(null);

            // Load related products from same categories
            const [allPublished, allCats] = await Promise.all([
              productService.getPublishedProducts(),
              productService.getCategories(),
            ]);
            if (mounted) {
              setCategories(allCats);
            }
            const currentCats = prod.categories || (prod.category ? [prod.category] : []);
            const related = allPublished
              .filter((p) => {
                if (p.id === prod.id) return false;
                const pCats = p.categories || (p.category ? [p.category] : []);
                return pCats.some((c) => currentCats.includes(c)) || p.category === prod.category;
              })
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
    setSelectedVariant(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('color', colorId);
      return next;
    }, { replace: true });
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    if (variant.colorId) {
      setSelectedColor(variant.colorId);
    }
  };

  const handleCopyOrderInfo = () => {
    if (!product) return;
    const colorLabel = selectedColor ? getColorOption(selectedColor).label : 'Mặc định';
    const sizeLabel = selectedSize || 'Theo yêu cầu';
    const variantLabel = selectedVariant ? `\n- Phân loại / Mẫu: ${selectedVariant.label}` : '';
    const text = `Tôi muốn đặt mua: ${product.name} (Mã: ${product.id})${variantLabel}\n- Màu sắc: ${colorLabel}\n- Kích thước: ${sizeLabel}\n- Giá tham khảo: ${formatVND(product.price)}`;
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Header />

      <main className="product-page-main" style={{ flex: 1, paddingBottom: '4rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        <div className="container" style={{ paddingTop: '1.5rem', maxWidth: '1440px', width: '100%', boxSizing: 'border-box' }}>
          {/* Breadcrumbs Navigation */}
          <nav
            className="product-breadcrumbs"
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.45rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: '1.25rem',
              maxWidth: '100%',
              minWidth: 0,
            }}
          >
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', flexShrink: 0 }}>
              <ArrowLeft size={14} />
              <span>Danh mục</span>
            </Link>
            <span>/</span>
            <span
              style={{
                color: 'var(--text-primary)',
                fontWeight: 500,
                minWidth: 0,
                maxWidth: 'calc(100vw - 140px)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={product.name}
            >
              {product.name}
            </span>
          </nav>

          {/* Product Detail Two Columns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr)',
              gap: '2.5rem',
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
            }}
            className="product-detail-grid"
          >
            {/* Left: Gallery */}
            <div style={{ minWidth: 0, maxWidth: '100%', width: '100%' }}>
              <ProductGallery
                images={product.images}
                productName={product.name}
                selectedColor={selectedColor}
                onColorChange={handleColorSelect}
                colors={product.colors}
                selectedVariantImage={selectedVariant?.image}
                hasVariants={Boolean(product.variants && product.variants.length > 0)}
              />
            </div>

            {/* Right: Info & Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0, maxWidth: '100%', width: '100%' }}>
              {/* Product Badges (Combo / Featured) */}
              {(product.type === 'combo' || product.featured) && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {product.type === 'combo' && <span className="badge badge-combo">Combo</span>}
                  {product.featured && <span className="badge badge-featured">Nổi bật</span>}
                </div>
              )}

              {/* Title */}
              <h1
                className="font-serif"
                style={{
                  fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.3,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                }}
              >
                {product.name}
              </h1>

              {/* Categories badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem', marginBottom: '0.6rem' }}>
                {(product.categories || [product.category]).map((cId) => {
                  const cat = categories.find((c) => c.id === cId);
                  return (
                    <Link
                      key={cId}
                      to={`/catalog?cat=${cId}`}
                      className="badge badge-draft"
                      style={{ fontSize: '0.78rem', textDecoration: 'none', cursor: 'pointer' }}
                      title={`Xem tất cả sản phẩm thuộc danh mục ${cat?.name || cId}`}
                    >
                      {cat?.name || cId}
                    </Link>
                  );
                })}
              </div>

              {/* Price in VND */}
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: 'var(--accent-brown)',
                  display: 'flex',
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <span>{formatVND(product.price)}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                  (Giá tham khảo, liên hệ để tư vấn theo kích thước)
                </span>
              </div>

              {/* Shopee-style Variant Selector: Mẫu và Màu đi liền với nhau */}
              {product.variants && product.variants.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      Chọn mẫu / Màu sắc ({product.variants.length} mẫu):{' '}
                      <span style={{ color: 'var(--accent-brown)', fontWeight: 700 }}>
                        {selectedVariant?.label || 'Bấm chọn mẫu'}
                      </span>
                    </span>
                    <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      (Bấm mẫu để xem ảnh tương ứng)
                    </span>
                  </div>
                  <div
                    className="product-variants-grid"
                    style={{
                      display: 'grid',
                      gap: '0.5rem',
                      maxHeight: '260px',
                      overflowY: 'auto',
                      padding: '2px',
                      width: '100%',
                      minWidth: 0,
                    }}
                  >
                    {product.variants.map((variant, idx) => {
                      const isSelected = selectedVariant?.label === variant.label || selectedVariant?.image === variant.image;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleVariantSelect(variant)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.35rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: isSelected ? 'var(--accent-warm-tint)' : 'var(--bg-surface)',
                            border: isSelected
                              ? '2px solid var(--accent-brown)'
                              : '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                            width: '100%',
                            minWidth: 0,
                            boxSizing: 'border-box',
                          }}
                        >
                          <img
                            src={variant.image}
                            alt=""
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '4px',
                              objectFit: 'cover',
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: isSelected ? 600 : 400,
                              color: isSelected ? 'var(--accent-brown)' : 'var(--text-primary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1,
                              minWidth: 0,
                            }}
                            title={variant.label}
                          >
                            {variant.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Colors Swatches (Only displayed for products without distinct photo variants) */}
              {(!product.variants || product.variants.length === 0) && product.colors && product.colors.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      Màu sắc:{' '}
                      <span style={{ color: 'var(--accent-brown)', fontWeight: 700 }}>
                        {selectedColor ? getColorOption(selectedColor).label : 'Chưa chọn'}
                      </span>
                    </span>
                    <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      (Bấm màu để xem ảnh tương ứng)
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                    {product.colors.map((colorId) => {
                      const color = getColorOption(colorId);
                      const isSelected = selectedColor.toLowerCase() === colorId.toLowerCase();
                      return (
                        <button
                          key={colorId}
                          type="button"
                          onClick={() => handleColorSelect(colorId)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.45rem 0.85rem',
                            backgroundColor: isSelected ? 'var(--accent-warm-tint)' : 'var(--bg-surface)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.85rem',
                            fontWeight: isSelected ? 600 : 500,
                            color: isSelected ? 'var(--accent-brown)' : 'var(--text-primary)',
                            border: isSelected
                              ? '2px solid var(--accent-brown)'
                              : '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 2px 6px rgba(118,99,82,0.18)' : 'none',
                          }}
                        >
                          <span
                            className="color-dot"
                            style={{
                              background: color.hex,
                              borderColor: color.borderHex || 'rgba(0,0,0,0.1)',
                              transform: isSelected ? 'scale(1.15)' : 'none',
                            }}
                          />
                          <span>{color.label}</span>
                          {isSelected && <Check size={14} style={{ strokeWidth: 2.5 }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes Available & Interactive Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      Kích thước:{' '}
                      <span style={{ color: 'var(--accent-brown)', fontWeight: 700 }}>
                        {selectedSize || 'Tiêu chuẩn'}
                      </span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    {product.sizes.map((s) => {
                      const isSelected = selectedSize === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          style={{
                            padding: '0.45rem 0.85rem',
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
                            maxWidth: '100%',
                            wordBreak: 'break-word',
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                    {!product.sizes.some((s) => s.toLowerCase().includes('may theo yêu cầu') || s.toLowerCase().includes('may đo')) && (
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
                          maxWidth: '100%',
                        }}
                      >
                        ✂️ Nhận may đo theo yêu cầu
                      </div>
                    )}
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
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <Layers size={16} color="var(--accent-brown)" style={{ flexShrink: 0 }} />
                    <span>Bộ combo bao gồm:</span>
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {product.comboItems.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem', wordBreak: 'break-word' }}>
                        <strong>{item.quantity}x</strong> {item.name} {item.note && `(${item.note})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  Thông tin chất liệu & chi tiết:
                </span>
                <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line', wordBreak: 'break-word', overflowWrap: 'break-word', margin: 0 }}>
                  {cleanProductDescription(product.description)}
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
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
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
                    maxWidth: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    borderStyle: 'dashed',
                    color: 'var(--accent-brown)',
                    borderColor: 'var(--accent-brown)',
                    fontSize: '0.85rem',
                    padding: '0.65rem 0.75rem',
                    justifyContent: 'center',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <span style={{ flexShrink: 0, display: 'inline-flex' }}>
                    {copiedOrderInfo ? <Check size={16} color="#2e7d32" /> : <Copy size={16} />}
                  </span>
                  <span
                    style={{
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.35,
                      wordBreak: 'break-word',
                    }}
                  >
                    {copiedOrderInfo
                      ? '✓ Đã sao chép cấu hình đặt hàng!'
                      : `Sao chép thông tin đặt (${selectedVariant ? selectedVariant.label : (selectedColor ? getColorOption(selectedColor).label : 'Mẫu')} • ${selectedSize || 'Size'})`}
                  </span>
                </button>

                <div
                  className="product-contact-actions"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
                    gap: '0.75rem',
                    marginTop: '0.25rem',
                    width: '100%',
                    minWidth: 0,
                  }}
                >
                  <a
                    href={SITE_CONFIG.contact.zalo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ width: '100%', minWidth: 0, justifyContent: 'center' }}
                  >
                    <MessageCircle size={18} style={{ flexShrink: 0 }} />
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {SITE_CONFIG.contact.zalo.actionText}
                    </span>
                  </a>

                  <a
                    href={SITE_CONFIG.contact.messenger.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ width: '100%', minWidth: 0, backgroundColor: '#ffffff', justifyContent: 'center' }}
                  >
                    <MessageCircle size={18} style={{ flexShrink: 0 }} />
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {SITE_CONFIG.contact.messenger.actionText}
                    </span>
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
        /* Variant Selector Grid Responsiveness */
        .product-variants-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
        @media (min-width: 640px) {
          .product-variants-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
          }
        }

        /* Small mobile screens (< 360px) contact buttons stack */
        @media (max-width: 360px) {
          .product-contact-actions {
            grid-template-columns: 1fr !important;
          }
        }

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
      `}</style>
    </div>
  );
};
