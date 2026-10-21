import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  X,
  Star,
  Eye,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  FolderPlus,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { Product, Category, ProductColor, ComboItem, ProductVariant } from '../types/product';
import { productService } from '../services/productService';
import { DEFAULT_COLORS, getColorOption, getAllColors, saveCustomColor, deleteCustomColor } from '../data/colors';
import { normalizeVietnamese, cleanProductDescription } from '../utils/filterProducts';
import { ProductCard } from '../components/ProductCard';
import { MediaPickerModal } from '../components/MediaPickerModal';
import { formatVND } from '../utils/formatCurrency';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [existingVariants, setExistingVariants] = useState<ProductVariant[]>([]);
  const [price, setPrice] = useState<number | ''>(350000);
  const [type, setType] = useState<'single' | 'combo'>('single');
  const [selectedColors, setSelectedColors] = useState<ProductColor[]>(['be']);
  const [customColorInput, setCustomColorInput] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#7e8f7f');
  const [availableColors, setAvailableColors] = useState(() => getAllColors());

  useEffect(() => {
    const handler = () => {
      setAvailableColors(getAllColors());
    };
    window.addEventListener('ncnang_colors_updated', handler);
    return () => window.removeEventListener('ncnang_colors_updated', handler);
  }, []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['1m6 x 2m', '1m8 x 2m']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [draggedImgIdx, setDraggedImgIdx] = useState<number | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Combo items
  const [comboItems, setComboItems] = useState<ComboItem[]>([]);

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Auto-generate slug when name changes (if creating new)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditMode) {
      const generated = normalizeVietnamese(val)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Load initial data
  useEffect(() => {
    async function init() {
      try {
        const cats = await productService.getCategories();
        setCategories(cats);

        if (isEditMode && id) {
          const existing = await productService.getProductByIdAdmin(id);
          if (existing) {
            setCode(existing.id);
            setName(existing.name);
            setSlug(existing.slug);
            const rawCats = (Array.isArray(existing.categories) && existing.categories.length > 0)
              ? existing.categories
              : (Array.isArray(existing.categoryIds) && existing.categoryIds.length > 0)
              ? existing.categoryIds
              : (existing.category ? [existing.category] : []);
            setSelectedCategories(rawCats);
            setCategoryId(existing.category || rawCats[0] || '');
            if (existing.variants && existing.variants.length > 0) {
              setExistingVariants(existing.variants);
            }
            setPrice(existing.price);
            setType(existing.type);
            setSelectedColors(existing.colors || []);
            setSelectedSizes(existing.sizes || []);
            setDescription(cleanProductDescription(existing.description || ''));
            setFeatured(Boolean(existing.featured));
            setPublished(existing.published !== false);
            setImages(existing.images || []);
            setCoverImage(existing.coverImage || existing.images?.[0] || '');
            setComboItems(existing.comboItems || []);
          } else {
            setErrorMsg(`Không tìm thấy sản phẩm với mã: ${id}`);
          }
        } else {
          // Creating a new product: default category to first available category in database
          if (cats.length > 0) {
            setCategoryId((prev) => (prev && cats.some((c) => c.id === prev) ? prev : cats[0].id));
            setSelectedCategories((prev) => (prev.length > 0 ? prev : [cats[0].id]));
          }
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, isEditMode]);

  // Category Multi-Select Toggle
  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => {
      const exists = prev.includes(catId);
      const updated = exists ? prev.filter((c) => c !== catId) : [...prev, catId];
      if (updated.length > 0) {
        setCategoryId(updated[0]);
      }
      return updated;
    });
  };

  // Color Toggle
  const toggleColor = (colorId: ProductColor) => {
    setSelectedColors((prev) =>
      prev.includes(colorId) ? prev.filter((c) => c !== colorId) : [...prev, colorId]
    );
  };

  const handleAddCustomColor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = customColorInput.trim();
    if (!val) {
      alert('Vui lòng nhập tên cho màu mới (Ví dụ: Xanh Cốm, Cam Cháy, Hồng Phấn, Đỏ Đô...).');
      return;
    }
    const cleanHex = customColorHex.trim().startsWith('#')
      ? customColorHex.trim()
      : `#${customColorHex.trim()}`;

    const saved = saveCustomColor({
      label: val,
      hex: cleanHex,
    });

    // Synchronously update available colors so the UI renders the new color immediately
    const all = getAllColors();
    setAvailableColors(all);

    // Select the new color for this product
    setSelectedColors((prev) => (prev.includes(saved.id) ? prev : [...prev, saved.id]));

    // Clear input
    setCustomColorInput('');
  };

  const handleDeleteCustomColorFromStore = (colorId: string, label: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa màu "${label}" khỏi danh sách màu của tiệm?`)) {
      deleteCustomColor(colorId);
      setSelectedColors((prev) => prev.filter((c) => c !== colorId));
    }
  };

  // Size Toggle
  const toggleSize = (sizeVal: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeVal) ? prev.filter((s) => s !== sizeVal) : [...prev, sizeVal]
    );
  };

  const handleAddCustomSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = customSizeInput.trim();
    if (!val) return;
    if (!selectedSizes.includes(val)) {
      setSelectedSizes((prev) => [...prev, val]);
    }
    setCustomSizeInput('');
  };

  // Combo items management
  const handleAddComboItem = () => {
    setComboItems([...comboItems, { name: '', quantity: 1, note: '' }]);
  };

  const handleUpdateComboItem = (index: number, updates: Partial<ComboItem>) => {
    setComboItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveComboItem = (index: number) => {
    setComboItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Read file as Base64 Data URL (fallback if Storage upload fails)
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`Không thể đọc file ${file.name}`));
      reader.readAsDataURL(file);
    });
  };

  // Compress image to ensure it stays well under limits and uploads smoothly
  const compressImage = (
    file: File,
    maxDimension = 1600,
    quality = 0.82
  ): Promise<{ file: File; dataUrl: string }> => {
    if (!file.type.startsWith('image/')) {
      return readFileAsDataUrl(file).then((dataUrl) => ({ file, dataUrl }));
    }

    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          readFileAsDataUrl(file).then((dataUrl) => resolve({ file, dataUrl }));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ file, dataUrl });
              return;
            }
            const cleanBase = file.name
              .replace(/\.[^/.]+$/, '')
              .replace(/[^a-zA-Z0-9_-]/g, '_');
            const ext = mimeType === 'image/png' ? '.png' : '.jpg';
            const compressedFile = new File([blob], `${cleanBase}${ext}`, {
              type: mimeType,
              lastModified: Date.now(),
            });
            resolve({ file: compressedFile, dataUrl });
          },
          mimeType,
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        readFileAsDataUrl(file).then((dataUrl) => resolve({ file, dataUrl }));
      };
      img.src = objectUrl;
    });
  };

  // Core upload file logic
  const uploadFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter(
      (f) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|gif|heic)$/i.test(f.name)
    );
    if (files.length === 0) return;

    // Auto-generate provisional code if empty so upload is not blocked
    let targetCode = code.trim();
    if (!targetCode) {
      if (name.trim()) {
        const cleanName = normalizeVietnamese(name)
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 4)
          .toUpperCase();
        targetCode = cleanName + Math.floor(100 + Math.random() * 900);
      } else {
        targetCode = 'SP' + Math.floor(100 + Math.random() * 900);
      }
      setCode(targetCode);
    }

    setUploadingImage(true);
    setErrorMsg('');

    try {
      const newUrls: string[] = [];
      let usedFallbackCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const { file: fileToUpload, dataUrl } = await compressImage(file);
          try {
            const url = await productService.uploadProductImage(fileToUpload, targetCode);
            newUrls.push(url);
          } catch (uploadErr) {
            console.warn(`Lỗi khi tải ảnh ${file.name} lên Supabase Storage:`, uploadErr);
            newUrls.push(dataUrl);
            usedFallbackCount++;
          }
        } catch (readErr) {
          console.error(`Không thể xử lý ảnh ${file.name}:`, readErr);
        }
      }

      setImages((prev) => {
        const existingSet = new Set(prev);
        const uniqueUrls = newUrls.filter((u) => !existingSet.has(u));

        if (uniqueUrls.length === 0) {
          setErrorMsg('Tất cả các ảnh vừa chọn đều đã có trong danh sách (trùng lặp).');
          return prev;
        }

        const updated = [...prev, ...uniqueUrls];
        if (!coverImage && updated.length > 0) {
          setCoverImage(updated[0]);
        }

        const dupCount = newUrls.length - uniqueUrls.length;
        if (dupCount > 0) {
          setSuccessMsg(`Đã thêm ${uniqueUrls.length} ảnh (đã bỏ qua ${dupCount} ảnh trùng lặp).`);
        } else if (usedFallbackCount > 0) {
          setSuccessMsg(`Đã tải ${uniqueUrls.length} ảnh vào sản phẩm.`);
        } else {
          setSuccessMsg(`Đã tải lên ${uniqueUrls.length} ảnh thành công.`);
        }
        setTimeout(() => setSuccessMsg(''), 3500);

        return updated;
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi tải ảnh');
    } finally {
      setUploadingImage(false);
    }
  };

  // Image upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Image actions
  const handleRemoveImage = (index: number) => {
    const target = images[index];
    const remaining = images.filter((_, idx) => idx !== index);
    setImages(remaining);
    if (coverImage === target) {
      setCoverImage(remaining[0] || '');
    }
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const list = [...images];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setImages(list);
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!code.trim()) {
      setErrorMsg('Mã sản phẩm không được để trống (ví dụ: GA001, BCG001).');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Tên sản phẩm không được để trống.');
      return;
    }
    if (price === '' || isNaN(Number(price)) || Number(price) < 0) {
      setErrorMsg('Giá sản phẩm phải là một số hợp lệ lớn hơn hoặc bằng 0.');
      return;
    }

    const effectiveCategory = selectedCategories[0] || categoryId || (categories.length > 0 ? categories[0].id : '');
    if (!effectiveCategory) {
      setErrorMsg('Vui lòng chọn ít nhất một danh mục cho sản phẩm.');
      return;
    }

    const effectiveCategories = selectedCategories.length > 0 ? selectedCategories : [effectiveCategory];

    const finalSlug =
      slug.trim() ||
      normalizeVietnamese(name)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const finalCover = coverImage || images[0] || '';

    const productPayload: Partial<Product> = {
      id: code.trim().toUpperCase(),
      name: name.trim(),
      slug: finalSlug,
      category: effectiveCategory,
      categories: effectiveCategories,
      categoryIds: effectiveCategories,
      variants: existingVariants,
      price: Number(price),
      currency: 'VND',
      type,
      colors: selectedColors,
      sizes: selectedSizes,
      description: description.trim(),
      comboItems:
        type === 'combo'
          ? comboItems.map((item) => ({
              ...item,
              quantity: Math.max(1, Number(item.quantity) || 1),
            }))
          : [],
      images,
      coverImage: finalCover,
      featured,
      published,
    };

    setSaving(true);
    try {
      if (isEditMode && id) {
        await productService.updateProduct(id, productPayload);
        setSuccessMsg(`Đã cập nhật sản phẩm "${name}" thành công!`);
      } else {
        await productService.createProduct(productPayload);
        setSuccessMsg(`Đã thêm mới sản phẩm "${name}" thành công!`);
      }
      setTimeout(() => navigate('/admin/products'), 1200);
    } catch (err: unknown) {
      console.error('❌ Lỗi khi lưu sản phẩm:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#766352' }}>
        <RefreshCw size={26} className="spin" />
        <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  const currentPreviewProduct: Product = {
    id: code || 'MA-SP',
    name: name || 'Tên sản phẩm mẫu',
    slug: slug || 'san-pham-mau',
    category: selectedCategories[0] || categoryId,
    categories: selectedCategories,
    categoryIds: selectedCategories,
    variants: existingVariants,
    price: Number(price) || 0,
    currency: 'VND',
    type,
    colors: selectedColors,
    sizes: selectedSizes,
    description: description || 'Mô tả tóm tắt chất liệu đũi/linen...',
    images: images.length > 0 ? images : ['/images/placeholder.webp'],
    coverImage: coverImage || images[0] || '/images/placeholder.webp',
    featured,
    published,
    comboItems,
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin/products" className="btn btn-outline btn-sm">
            <ArrowLeft size={16} />
            <span>Danh sách</span>
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2c2825' }}>
            {isEditMode ? `Chỉnh sửa sản phẩm: ${code}` : 'Thêm sản phẩm mới'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {!isEditMode && (
            <Link
              to="/admin/products/bulk"
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#766352' }}
              title="Thêm hàng loạt sản phẩm bằng cách kéo thả folder"
            >
              <FolderPlus size={16} />
              <span>Nhập từ Folder (nhiều SP)</span>
            </Link>
          )}

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setShowPreviewModal(true)}
          >
            <Eye size={16} />
            <span>Xem trước</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div
          style={{
            backgroundColor: '#edf7ed',
            border: '1px solid #c8e6c9',
            color: '#1b5e20',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            backgroundColor: '#fdeeed',
            border: '1px solid #f9c7c4',
            color: '#b71c1c',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="admin-form-grid">
          {/* Main Info Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Visual Images Card - Prioritized at top */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ImageIcon size={18} color="#766352" />
                    <span>Bộ sưu tập hình ảnh ({images.length} ảnh)</span>
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#8c8277', margin: '3px 0 0' }}>
                    Ảnh đầu tiên hoặc có gắn ★ sẽ làm ảnh bìa chính trên trang chủ & catalog.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                  title="Chọn ảnh đã tải lên Supabase Storage"
                >
                  <ImageIcon size={15} />
                  <span>Chọn từ Kho ảnh Online</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                style={{
                  border: isDraggingFiles ? '2px dashed #766352' : '2px dashed #dcd3c5',
                  backgroundColor: isDraggingFiles ? '#f3eee6' : '#faf8f5',
                  borderRadius: '8px',
                  padding: '1.25rem 1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginBottom: '1.25rem',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => document.getElementById('image-upload-input')?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingFiles(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingFiles(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingFiles(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    uploadFiles(e.dataTransfer.files);
                  }
                }}
              >
                <Upload size={22} color="#766352" style={{ margin: '0 auto 0.4rem' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2c2825', display: 'block' }}>
                  {uploadingImage
                    ? 'Đang tải ảnh lên Storage...'
                    : isDraggingFiles
                    ? 'Thả ảnh vào đây để tải lên'
                    : 'Kéo thả ảnh vào đây hoặc bấm để chọn'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#8c8277' }}>
                  Hỗ trợ kéo thả nhiều ảnh JPG, PNG, WebP, AVIF, HEIC (Tối đa 5MB/ảnh)
                </span>
                <input
                  id="image-upload-input"
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                />
              </div>

              {/* Image List */}
              {images.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#faf8f5', borderRadius: '6px', border: '1px dashed #e8e1d5' }}>
                  <ImageIcon size={32} color="#bfa382" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ fontSize: '0.85rem', color: '#8c8277', margin: 0 }}>
                    Chưa có ảnh nào. Sản phẩm sẽ dùng ảnh mặc định nếu để trống.
                  </p>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                      gap: '0.75rem',
                    }}
                  >
                    {images.map((imgUrl, idx) => {
                      const [cleanUrl, colorTag] = imgUrl.split('#color=');
                      const currentAssignedColor = colorTag ? decodeURIComponent(colorTag) : '';
                      const isCover = (coverImage || images[0]) === imgUrl || (coverImage && coverImage.split('#color=')[0] === cleanUrl && idx === 0);
                      const isDraggingThis = draggedImgIdx === idx;
                      return (
                        <div
                          key={idx}
                          draggable
                          onDragStart={(e) => {
                            setDraggedImgIdx(idx);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedImgIdx === null || draggedImgIdx === idx) return;
                            const list = [...images];
                            const [item] = list.splice(draggedImgIdx, 1);
                            list.splice(idx, 0, item);
                            setImages(list);
                            setDraggedImgIdx(null);
                          }}
                          onDragEnd={() => setDraggedImgIdx(null)}
                          style={{
                            position: 'relative',
                            backgroundColor: isCover ? '#f8f4ed' : '#ffffff',
                            border: isDraggingThis
                              ? '2px dashed #766352'
                              : isCover
                              ? '2px solid #766352'
                              : '1px solid #e8e1d5',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: isCover ? '0 2px 8px rgba(118, 99, 82, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                            opacity: isDraggingThis ? 0.5 : 1,
                            cursor: 'grab',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          {/* Image preview */}
                          <div style={{ width: '100%', paddingTop: '85%', position: 'relative', backgroundColor: '#f3eee6' }}>
                            <img
                              src={cleanUrl}
                              alt={`Ảnh ${idx + 1}`}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />

                            {/* Badge Cover */}
                            {isCover && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  left: '4px',
                                  backgroundColor: '#766352',
                                  color: '#ffffff',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                  zIndex: 2,
                                }}
                              >
                                ★ Bìa
                              </span>
                            )}

                            {/* Assigned Color Badge */}
                            {currentAssignedColor && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  backgroundColor: 'rgba(44,40,37,0.85)',
                                  color: '#ffffff',
                                  fontSize: '0.65rem',
                                  fontWeight: 600,
                                  padding: '2px 6px',
                                  borderRadius: '10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                                  zIndex: 2,
                                }}
                              >
                                <span
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: getColorOption(currentAssignedColor).hex,
                                  }}
                                />
                                {getColorOption(currentAssignedColor).label}
                              </span>
                            )}

                            {/* Position indicator */}
                            <span
                              style={{
                                position: 'absolute',
                                bottom: '4px',
                                left: '4px',
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                color: '#ffffff',
                                fontSize: '0.65rem',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                zIndex: 2,
                              }}
                            >
                              #{idx + 1}
                            </span>
                          </div>

                          {/* Color Assignment Selector */}
                          <div style={{ padding: '4px 6px', backgroundColor: '#faf8f5', borderTop: '1px solid #f0eae1' }}>
                            <select
                              value={currentAssignedColor}
                              onChange={(e) => {
                                const newColor = e.target.value;
                                const updatedUrl = newColor ? `${cleanUrl}#color=${encodeURIComponent(newColor)}` : cleanUrl;
                                const list = [...images];
                                list[idx] = updatedUrl;
                                setImages(list);
                                if (coverImage === imgUrl) {
                                  setCoverImage(updatedUrl);
                                }
                              }}
                              style={{
                                width: '100%',
                                fontSize: '0.72rem',
                                padding: '2px 4px',
                                borderRadius: '4px',
                                border: currentAssignedColor ? '1.5px solid #766352' : '1px solid #d5cbbf',
                                backgroundColor: currentAssignedColor ? '#f8f4ed' : '#ffffff',
                                color: currentAssignedColor ? '#766352' : '#555',
                                fontWeight: currentAssignedColor ? 600 : 400,
                                cursor: 'pointer',
                              }}
                              title="Gán ảnh cho màu sắc (khách bấm màu sẽ đổi sang ảnh này)"
                            >
                              <option value="">Ảnh chung / Tất cả màu</option>
                              {selectedColors.map((colorId) => {
                                const opt = getColorOption(colorId);
                                return (
                                  <option key={colorId} value={colorId}>
                                    Màu: {opt.label}
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {/* Quick Actions Footer */}
                          <div
                            style={{
                              padding: '0.35rem 0.4rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              backgroundColor: '#faf8f5',
                              borderTop: '1px solid #f0eae1',
                            }}
                          >
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {!isCover && (
                                <button
                                  type="button"
                                  onClick={() => setCoverImage(imgUrl)}
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: '#766352',
                                    padding: '2px',
                                  }}
                                  title="Đặt làm ảnh bìa"
                                >
                                  <Star size={13} />
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveImage(idx, 'up')}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  color: '#685e54',
                                  padding: '2px',
                                  opacity: idx === 0 ? 0.3 : 1,
                                }}
                                title="Đẩy sang trái"
                              >
                                <ArrowUp size={13} style={{ transform: 'rotate(-90deg)' }} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === images.length - 1}
                                onClick={() => handleMoveImage(idx, 'down')}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  color: '#685e54',
                                  padding: '2px',
                                  opacity: idx === images.length - 1 ? 0.3 : 1,
                                }}
                                title="Đẩy sang phải"
                              >
                                <ArrowDown size={13} style={{ transform: 'rotate(-90deg)' }} />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                color: '#c62828',
                                padding: '2px',
                              }}
                              title="Xóa ảnh"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* General Card */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid #f2ede4', paddingBottom: '0.5rem' }}>
                Thông tin cơ bản
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="p-code">
                    Mã sản phẩm * (Unique)
                  </label>
                  <input
                    id="p-code"
                    type="text"
                    required
                    disabled={isEditMode}
                    placeholder="VD: GA001, BCG002"
                    className="form-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                  />
                  <span className="form-help">Mã định danh sản phẩm dùng để khách gửi tin nhắn Zalo/Messenger.</span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="p-type">
                    Loại sản phẩm
                  </label>
                  <select
                    id="p-type"
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value as 'single' | 'combo')}
                  >
                    <option value="single">Món lẻ / Set đơn</option>
                    <option value="combo">Bộ Combo nhiều món</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="p-name">
                  Tên sản phẩm *
                </label>
                <input
                  id="p-name"
                  type="text"
                  required
                  placeholder="VD: Bộ chăn ga đũi tự nhiên màu Be Cát"
                  className="form-input"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="p-slug">
                    Đường dẫn URL (Slug)
                  </label>
                  <input
                    id="p-slug"
                    type="text"
                    required
                    placeholder="set-bo-chan-ga-dui-mau-be"
                    className="form-input"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="p-price">
                    Giá niêm yết (VND) *
                  </label>
                  <input
                    id="p-price"
                    type="number"
                    min="0"
                    step="1000"
                    required
                    placeholder="380000"
                    className="form-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <span className="form-help">Lưu dạng số nguyên (VND), không nhập dấu chấm phẩy.</span>
                </div>
              </div>

              {/* Multi-Category Selection */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    Danh mục sản phẩm *{' '}
                    <span style={{ fontWeight: 400, color: '#766352', fontSize: '0.8rem' }}>
                      (Bấm để chọn nhiều danh mục phù hợp)
                    </span>
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#766352', fontWeight: 600 }}>
                    Đã chọn: {selectedCategories.length} danh mục
                  </span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.4rem' }}>
                  {categories.map((c) => {
                    const isSelected = selectedCategories.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCategory(c.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '20px',
                          fontSize: '0.825rem',
                          fontWeight: isSelected ? 600 : 500,
                          border: isSelected ? '1.5px solid #766352' : '1px solid #dcd3c5',
                          backgroundColor: isSelected ? '#f5eee6' : '#ffffff',
                          color: isSelected ? '#4a3b32' : '#555555',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 1px 3px rgba(118,99,82,0.15)' : 'none',
                        }}
                      >
                        {isSelected && <Check size={14} style={{ strokeWidth: 2.5, color: '#766352' }} />}
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedCategories.length === 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#c62828', marginTop: '0.4rem', display: 'block' }}>
                    ⚠️ Vui lòng chọn ít nhất 1 danh mục cho sản phẩm
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="p-desc">
                  Mô tả sản phẩm & thông tin chất liệu
                </label>
                <textarea
                  id="p-desc"
                  rows={4}
                  className="form-textarea"
                  placeholder="Mô tả bề mặt vải, xử lý wash, độ thoáng mát, cách bảo quản..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Colors and Sizes Card */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid #f2ede4', paddingBottom: '0.5rem' }}>
                Màu sắc & Kích thước
              </h2>

              {/* Colors */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Màu sắc áp dụng cho sản phẩm ({selectedColors.length} màu đã chọn)
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#8c8073' }}>Bấm vào để chọn hoặc bỏ chọn màu</span>
                </div>

                {/* Available colors list */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {availableColors.map((col) => {
                    const isSelected = selectedColors.includes(col.id);
                    const isDefault = DEFAULT_COLORS.some((c) => c.id === col.id);
                    return (
                      <div
                        key={col.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          borderRadius: '20px',
                          border: isSelected ? '1.5px solid #766352' : '1px solid #dcd3c5',
                          backgroundColor: isSelected ? '#f8f4ed' : '#ffffff',
                          padding: '0.25rem 0.65rem 0.25rem 0.45rem',
                          gap: '0.45rem',
                          boxShadow: isSelected ? '0 1px 4px rgba(118,99,82,0.18)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleColor(col.id)}
                          style={{
                            border: 'none',
                            background: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            cursor: 'pointer',
                            padding: 0,
                            color: isSelected ? '#766352' : '#2c2825',
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: '0.825rem',
                          }}
                        >
                          <span
                            style={{
                              width: '15px',
                              height: '15px',
                              borderRadius: '50%',
                              background: col.hex,
                              border: col.borderHex ? `1px solid ${col.borderHex}` : '1px solid rgba(0,0,0,0.15)',
                              display: 'inline-block',
                              flexShrink: 0,
                            }}
                          />
                          <span>{col.label}</span>
                          {isSelected && <Check size={13} style={{ strokeWidth: 2.5 }} />}
                        </button>

                        {/* If custom color added by admin, allow deleting from store */}
                        {!isDefault && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomColorFromStore(col.id, col.label);
                            }}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: '#a89d91',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              borderRadius: '50%',
                              marginLeft: '2px',
                            }}
                            title={`Xóa vĩnh viễn màu "${col.label}" khỏi hệ thống`}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Any custom color on this product not in availableColors */}
                  {selectedColors
                    .filter((colId) => !availableColors.some((c) => c.id.toLowerCase() === colId.toLowerCase()))
                    .map((unknownCol) => {
                      const opt = getColorOption(unknownCol);
                      return (
                        <div
                          key={unknownCol}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '20px',
                            border: '1.5px solid #766352',
                            backgroundColor: '#f8f4ed',
                            padding: '0.25rem 0.65rem 0.25rem 0.45rem',
                            gap: '0.45rem',
                            boxShadow: '0 1px 4px rgba(118,99,82,0.18)',
                          }}
                        >
                          <span
                            style={{
                              width: '15px',
                              height: '15px',
                              borderRadius: '50%',
                              background: opt.hex,
                              border: opt.borderHex ? `1px solid ${opt.borderHex}` : '1px solid rgba(0,0,0,0.15)',
                              display: 'inline-block',
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#766352' }}>
                            {opt.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleColor(unknownCol)}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: '#a89d91',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'inline-flex',
                              alignItems: 'center',
                              marginLeft: '2px',
                            }}
                            title={`Bỏ chọn màu ${opt.label}`}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      );
                    })}
                </div>

                {/* Add new custom color box */}
                <div
                  style={{
                    backgroundColor: '#faf8f5',
                    border: '1px dashed #d8cebe',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6a5e52', display: 'block', marginBottom: '0.5rem' }}>
                    + Thêm màu mới vào bảng màu của tiệm:
                  </span>

                  {/* Quick color preset suggestions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.725rem', color: '#8c8073', marginRight: '2px' }}>Gợi ý nhanh:</span>
                    {[
                      { label: 'Xanh Rêu', hex: '#5b7058' },
                      { label: 'Xanh Bơ', hex: '#8da87b' },
                      { label: 'Xanh Navy', hex: '#23384c' },
                      { label: 'Hồng Đất', hex: '#c4978c' },
                      { label: 'Hồng Phấn', hex: '#e8b4b8' },
                      { label: 'Cam Cháy', hex: '#bd5e3b' },
                      { label: 'Nâu Tây', hex: '#7c533e' },
                      { label: 'Vàng Bơ', hex: '#ead9a8' },
                      { label: 'Đỏ Đô', hex: '#872626' },
                      { label: 'Tím Khói', hex: '#9e8f9e' },
                      { label: 'Xám Ghi', hex: '#8e9194' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setCustomColorHex(preset.hex);
                          if (!customColorInput.trim()) {
                            setCustomColorInput(preset.label);
                          }
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 7px',
                          borderRadius: '12px',
                          border: customColorHex === preset.hex ? '1.5px solid #766352' : '1px solid #d5cbbf',
                          backgroundColor: customColorHex === preset.hex ? '#f8f4ed' : '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                          color: '#444',
                        }}
                        title={`Chọn nhanh màu ${preset.label} (${preset.hex})`}
                      >
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: preset.hex,
                            display: 'inline-block',
                          }}
                        />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Color picker & Hex input */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid #d5cbbf',
                        borderRadius: '6px',
                        padding: '0.2rem 0.5rem',
                      }}
                      title="Bấm ô màu để mở bảng chọn trực quan, hoặc nhập mã Hex vào ô bên cạnh"
                    >
                      <input
                        type="color"
                        value={customColorHex.startsWith('#') && customColorHex.length === 7 ? customColorHex : '#7e8f7f'}
                        onChange={(e) => setCustomColorHex(e.target.value)}
                        style={{
                          width: '26px',
                          height: '26px',
                          border: 'none',
                          borderRadius: '4px',
                          padding: 0,
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                        }}
                        title="Bấm để chọn màu"
                      />
                      <input
                        type="text"
                        value={customColorHex}
                        onChange={(e) => setCustomColorHex(e.target.value)}
                        placeholder="#7e8f7f"
                        maxLength={7}
                        style={{
                          width: '74px',
                          border: 'none',
                          outline: 'none',
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                          color: '#2c2825',
                          fontWeight: 600,
                          background: 'transparent',
                          padding: '2px',
                        }}
                        title="Nhập mã màu Hex trực tiếp"
                      />
                    </div>

                    {/* Name input */}
                    <input
                      type="text"
                      placeholder="Tên màu (VD: Xanh Cốm, Cam Cháy, Tím Than)..."
                      value={customColorInput}
                      onChange={(e) => setCustomColorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomColor();
                        }
                      }}
                      className="form-input"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem', flex: '1 1 200px', maxWidth: '320px' }}
                    />

                    {/* Submit button */}
                    <button
                      type="button"
                      onClick={() => handleAddCustomColor()}
                      className="btn btn-primary btn-sm"
                      style={{ whiteSpace: 'nowrap', padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
                    >
                      <span>Lưu & Chọn màu</span>
                    </button>
                  </div>
                  <span style={{ fontSize: '0.725rem', color: '#8c8073', marginTop: '0.35rem', display: 'block' }}>
                    * Màu mới sẽ hiển thị đúng mã màu bạn chọn trên website, trong danh mục gán ảnh và bộ lọc của khách.
                  </span>
                </div>
              </div>

              {/* Sizes */}
              <div className="form-group" style={{ marginTop: '1.5rem', borderTop: '1px solid #f2ede4', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Kích thước áp dụng cho sản phẩm ({selectedSizes.length} kích thước)
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#8c8073' }}>
                    Chọn các cỡ khả dụng hoặc tùy chọn may theo yêu cầu
                  </span>
                </div>

                {/* Selected Sizes Chips */}
                <div style={{ marginBottom: '1rem' }}>
                  {selectedSizes.length === 0 ? (
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        backgroundColor: '#faf8f5',
                        borderRadius: '6px',
                        border: '1px dashed #e8e1d5',
                        fontSize: '0.825rem',
                        color: '#8c8277',
                      }}
                    >
                      Chưa chọn kích thước nào. Bạn có thể chọn nhanh các cỡ phổ biến bên dưới hoặc nhập kích thước riêng.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedSizes.map((sz) => (
                        <span key={sz} className="selected-tag-chip">
                          <Check size={13} color="#2e7d32" />
                          <span>{sz}</span>
                          <button
                            type="button"
                            onClick={() => toggleSize(sz)}
                            title={`Xóa kích thước ${sz}`}
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Common / Special Presets */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.785rem', fontWeight: 600, color: '#685e54', display: 'block', marginBottom: '0.35rem' }}>
                    Tùy chọn may & kích thước đặc thù:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.75rem' }}>
                    {['May theo kích thước yêu cầu', 'Kích thước cố định (Fix size)', 'Freesize'].map((opt) => {
                      const isSelected = selectedSizes.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleSize(opt)}
                          className={`filter-chip ${isSelected ? 'active' : ''}`}
                        >
                          <span>{opt}</span>
                          {isSelected && <Check size={13} />}
                        </button>
                      );
                    })}
                  </div>

                  <span style={{ fontSize: '0.785rem', fontWeight: 600, color: '#685e54', display: 'block', marginBottom: '0.35rem' }}>
                    Kích thước giường / ga phổ biến:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.75rem' }}>
                    {['1m2 x 2m', '1m4 x 2m', '1m6 x 2m', '1m8 x 2m', '2m x 2m2'].map((sz) => {
                      const isSelected = selectedSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => toggleSize(sz)}
                          className={`filter-chip ${isSelected ? 'active' : ''}`}
                        >
                          <span>{sz}</span>
                          {isSelected && <Check size={13} />}
                        </button>
                      );
                    })}
                  </div>

                  <span style={{ fontSize: '0.785rem', fontWeight: 600, color: '#685e54', display: 'block', marginBottom: '0.35rem' }}>
                    Kích thước gối phổ biến:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.75rem' }}>
                    {['45x65cm', '50x70cm'].map((sz) => {
                      const isSelected = selectedSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => toggleSize(sz)}
                          className={`filter-chip ${isSelected ? 'active' : ''}`}
                        >
                          <span>{sz}</span>
                          {isSelected && <Check size={13} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add custom size input */}
                <div>
                  <span style={{ fontSize: '0.785rem', fontWeight: 600, color: '#685e54', display: 'block', marginBottom: '0.35rem' }}>
                    Thêm kích thước riêng / thông số may:
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '380px' }}>
                    <input
                      type="text"
                      placeholder="VD: 2m2 x 2m4, nệm cao 25cm, đệm tròn..."
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSize();
                        }
                      }}
                      className="form-input"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomSize()}
                      className="btn btn-outline btn-sm"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Thêm kích thước
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Combo Items breakdown if Combo */}
            {type === 'combo' && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Chi tiết món trong Combo</h2>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleAddComboItem}
                  >
                    <Plus size={14} />
                    <span>Thêm món</span>
                  </button>
                </div>

                {comboItems.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#8c8277' }}>
                    Chưa có món thành phần. Bấm "Thêm món" để liệt kê các món bao gồm trong combo.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {comboItems.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 2fr auto',
                          gap: '0.5rem',
                          alignItems: 'center',
                          backgroundColor: '#fbfaf8',
                          padding: '0.65rem',
                          borderRadius: '6px',
                          border: '1px solid #ede7dc',
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Tên món (VD: Ga chun đũi)"
                          value={item.name}
                          onChange={(e) => handleUpdateComboItem(idx, { name: e.target.value })}
                          className="form-input"
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                        />
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            border: '1px solid #d5cbbf',
                            borderRadius: '6px',
                            backgroundColor: '#ffffff',
                            overflow: 'hidden',
                            height: '34px',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateComboItem(idx, {
                                quantity: Math.max(1, (Number(item.quantity) || 1) - 1),
                              })
                            }
                            style={{
                              border: 'none',
                              background: '#f5f0e8',
                              width: '26px',
                              height: '100%',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              fontWeight: 600,
                              color: '#6a5e52',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              userSelect: 'none',
                            }}
                            title="Giảm 1"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={item.quantity === ('' as any) ? '' : (item.quantity ?? 1)}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                handleUpdateComboItem(idx, { quantity: '' as any });
                              } else {
                                const clean = val.replace(/[^0-9]/g, '');
                                handleUpdateComboItem(idx, {
                                  quantity: clean === '' ? ('' as any) : Math.max(1, parseInt(clean, 10)),
                                });
                              }
                            }}
                            onBlur={() => {
                              if (!item.quantity || Number(item.quantity) < 1) {
                                handleUpdateComboItem(idx, { quantity: 1 });
                              }
                            }}
                            style={{
                              width: '38px',
                              textAlign: 'center',
                              border: 'none',
                              outline: 'none',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              padding: 0,
                              background: 'transparent',
                            }}
                            title="Nhập số lượng"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateComboItem(idx, {
                                quantity: (Number(item.quantity) || 1) + 1,
                              })
                            }
                            style={{
                              border: 'none',
                              background: '#f5f0e8',
                              width: '26px',
                              height: '100%',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              fontWeight: 600,
                              color: '#6a5e52',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              userSelect: 'none',
                            }}
                            title="Tăng 1"
                          >
                            +
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Ghi chú (VD: 1m8 x 2m)"
                          value={item.note || ''}
                          onChange={(e) => handleUpdateComboItem(idx, { note: e.target.value })}
                          className="form-input"
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveComboItem(idx)}
                          style={{ color: '#c62828', padding: '0.35rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Images & Publishing Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Status & Visibility Card */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid #f2ede4', paddingBottom: '0.5rem' }}>
                Trạng thái hiển thị
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#766352' }}
                  />
                  <span>
                    <strong>Công khai sản phẩm</strong> (Khách hàng có thể thấy trên catalog)
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#766352' }}
                  />
                  <span>
                    <strong>Sản phẩm nổi bật</strong> (Ghim lên đầu trang chủ)
                  </span>
                </label>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f2ede4' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={saving || uploadingImage}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      <span>Đang lưu sản phẩm...</span>
                    </>
                  ) : (
                    <span>{isEditMode ? 'Lưu thay đổi' : 'Tạo sản phẩm mới'}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Live Product Card Preview in Right Column */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2c2825', margin: 0 }}>
                  Xem trước hiển thị (Card)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  <Eye size={12} />
                  <span>Full Preview</span>
                </button>
              </div>

              <div style={{ border: '1px solid #e8e1d5', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#faf8f5' }}>
                <div style={{ width: '100%', paddingTop: '80%', position: 'relative', backgroundColor: '#f3eee6' }}>
                  <img
                    src={coverImage || images[0] || '/images/placeholder.webp'}
                    alt="Preview"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {featured && (
                    <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#766352', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      Nổi bật
                    </span>
                  )}
                </div>
                <div style={{ padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9e9387', fontWeight: 600 }}>{code || 'MÃ SP'}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2c2825', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name || 'Tên sản phẩm'}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#766352', marginTop: '4px' }}>
                    {formatVND(price || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Live Preview Modal */}
      {showPreviewModal &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            {/* Backdrop */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
              }}
              onClick={() => setShowPreviewModal(false)}
            />

            {/* Modal Dialog Content (Crisp, foreground) */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '840px',
                maxHeight: '90vh',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                zIndex: 10001,
                padding: '1.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                  borderBottom: '1px solid #e8e1d5',
                  paddingBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye size={20} color="#766352" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2c2825' }}>
                    Xem trước hiển thị sản phẩm
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#8c8277',
                    padding: '4px',
                    borderRadius: '4px',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '2rem',
                  alignItems: 'flex-start',
                }}
              >
                {/* Product Card preview */}
                <div>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#685e54',
                      display: 'block',
                      marginBottom: '0.6rem',
                    }}
                  >
                    1. Hiển thị dạng Thẻ (Trang chủ / Danh mục):
                  </span>
                  <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                    <ProductCard product={currentPreviewProduct} />
                  </div>
                </div>

                {/* Quick details breakdown */}
                <div
                  style={{
                    backgroundColor: '#faf8f5',
                    padding: '1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #e8e1d5',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#685e54',
                      display: 'block',
                      marginBottom: '0.6rem',
                    }}
                  >
                    2. Thông số sản phẩm đang soạn:
                  </span>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <strong>Mã sản phẩm:</strong> <code>{currentPreviewProduct.id}</code>
                    </div>
                    <div>
                      <strong>Tên:</strong> {currentPreviewProduct.name}
                    </div>
                    <div>
                      <strong>Đường dẫn (slug):</strong> /products/{currentPreviewProduct.slug}
                    </div>
                    <div>
                      <strong>Giá:</strong> {Number(price).toLocaleString('vi-VN')} đ
                    </div>
                    <div>
                      <strong>Trạng thái:</strong>{' '}
                      {published ? (
                        <span style={{ color: '#1b5e20', fontWeight: 600 }}>🟢 Công khai</span>
                      ) : (
                        <span style={{ color: '#b71c1c', fontWeight: 600 }}>🔴 Đang ẩn</span>
                      )}
                    </div>
                    <div>
                      <strong>Ảnh đại diện:</strong> {currentPreviewProduct.coverImage}
                    </div>
                    <div>
                      <strong>Số lượng ảnh:</strong> {images.length} ảnh
                    </div>
                    <div>
                      <strong>Màu sắc:</strong> {selectedColors.join(', ') || 'Chưa chọn'}
                    </div>
                    <div>
                      <strong>Kích thước:</strong> {selectedSizes.join(', ') || 'Chưa chọn'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowPreviewModal(false)}
                >
                  Đóng xem trước
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        alreadySelectedUrls={images}
        onSelectImages={(newUrls) => {
          setImages((prev) => {
            const existingSet = new Set(prev);
            const uniqueUrls = newUrls.filter((u) => !existingSet.has(u));

            if (uniqueUrls.length === 0) {
              setErrorMsg('Tất cả các ảnh vừa chọn đều đã có trong danh sách (trùng lặp).');
              return prev;
            }

            const updated = [...prev, ...uniqueUrls];
            if (!coverImage && updated.length > 0) {
              setCoverImage(updated[0]);
            }

            const dupCount = newUrls.length - uniqueUrls.length;
            if (dupCount > 0) {
              setSuccessMsg(`Đã thêm ${uniqueUrls.length} ảnh (đã bỏ qua ${dupCount} ảnh trùng lặp).`);
            } else {
              setSuccessMsg(`Đã thêm ${uniqueUrls.length} ảnh từ Kho online vào sản phẩm!`);
            }
            setTimeout(() => setSuccessMsg(''), 3500);

            return updated;
          });
        }}
        initialFolder={code || ''}
      />

      <style>{`
        @media (min-width: 960px) {
          .admin-form-grid {
            grid-template-columns: 2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
