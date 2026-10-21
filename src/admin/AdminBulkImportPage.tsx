import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FolderPlus,
  Upload,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { productService } from '../services/productService';
import { Category, ProductCategory } from '../types/product';
import { normalizeVietnamese } from '../utils/filterProducts';

interface ParsedBulkItem {
  id: string; // Product Code
  name: string;
  category: ProductCategory;
  categories?: string[];
  price: number;
  type: 'single' | 'combo';
  published: boolean;
  files: File[];
  previewUrl: string;
  status?: 'pending' | 'uploading' | 'success' | 'error';
  errorMsg?: string;
}

export const AdminBulkImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ParsedBulkItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [globalError, setGlobalError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');

  // Batch tools
  const [batchPrice, setBatchPrice] = useState('');
  const [batchCategory, setBatchCategory] = useState<ProductCategory>('');
  const [batchType, setBatchType] = useState<'single' | 'combo'>('single');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadCats() {
      try {
        const cats = await productService.getCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setBatchCategory(cats[0].id as ProductCategory);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    }
    loadCats();
  }, []);

  // Helper to parse folder name into Code, Name, and Categories
  const parseFolderMeta = (folderName: string): { id: string; name: string; category: ProductCategory; categories: string[]; type: 'single' | 'combo' } => {
    const clean = folderName.trim();
    let id = '';
    let name = clean;

    // Check if folder contains separator e.g. "GA001 - Ga Chun Đũi" or "GA001_Ga_Chun"
    if (clean.includes(' - ')) {
      const parts = clean.split(' - ');
      id = parts[0].trim().toUpperCase();
      name = parts.slice(1).join(' - ').trim();
    } else if (clean.includes('_')) {
      const parts = clean.split('_');
      id = parts[0].trim().toUpperCase();
      name = parts.slice(1).join(' ').trim();
    } else {
      // Just one word / code
      id = clean.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
      name = clean;
    }

    if (!id) {
      id = 'SP' + Math.floor(100 + Math.random() * 900);
    }

    const norm = normalizeVietnamese(name.toLowerCase() + ' ' + id.toLowerCase());

    // Auto-detect matching categories from actual database categories
    const matchedCats: string[] = [];
    for (const c of categories) {
      const cNorm = normalizeVietnamese(c.name.toLowerCase());
      if (norm.includes(cNorm) || norm.includes(c.id.toLowerCase())) {
        matchedCats.push(c.id);
      }
    }

    let category: ProductCategory = matchedCats[0] || categories[0]?.id || '';
    if (!category && categories.length > 0) {
      category = categories[0].id;
    }

    const itemCats = matchedCats.length > 0 ? matchedCats : (category ? [category] : []);

    // Auto-detect type
    const type: 'single' | 'combo' =
      category.includes('combo') || category.includes('set') || norm.includes('combo') || norm.includes('set')
        ? 'combo'
        : 'single';

    return { id, name, category, categories: itemCats, type };
  };

  // Process a list of File objects grouped by folder
  const processFilesList = (fileList: FileList | File[]) => {
    const folderGroups: Record<string, File[]> = {};

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      // Check if image
      if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
        continue;
      }

      // Check relative path (webkitRelativePath)
      const relPath = file.webkitRelativePath || '';
      let folderName = 'Sản phẩm mới';

      if (relPath && relPath.includes('/')) {
        const parts = relPath.split('/');
        folderName = parts[0]; // Top folder name
      } else {
        // Fallback: group by file prefix or single folder
        folderName = file.name.replace(/\.[^/.]+$/, '').split(/[-_]/)[0] || 'Sản phẩm mới';
      }

      if (!folderGroups[folderName]) {
        folderGroups[folderName] = [];
      }
      folderGroups[folderName].push(file);
    }

    const parsed: ParsedBulkItem[] = [];

    Object.entries(folderGroups).forEach(([folderName, files]) => {
      if (files.length === 0) return;

      // Sort files naturally (1.jpg, 2.jpg...)
      files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

      const meta = parseFolderMeta(folderName);
      const previewUrl = URL.createObjectURL(files[0]);

      parsed.push({
        id: meta.id,
        name: meta.name,
        category: meta.category,
        categories: meta.categories,
        price: meta.type === 'combo' ? 850000 : 380000, // natural defaults
        type: meta.type,
        published: true,
        files,
        previewUrl,
        status: 'pending',
      });
    });

    if (parsed.length === 0) {
      setGlobalError('Không tìm thấy file ảnh hợp lệ trong các thư mục bạn chọn.');
      return;
    }

    setItems((prev) => [...prev, ...parsed]);
    setGlobalSuccess(`Đã quét được ${parsed.length} sản phẩm từ các thư mục!`);
    setTimeout(() => setGlobalSuccess(''), 4000);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const itemsList = e.dataTransfer.items;
    if (itemsList && itemsList.length > 0) {
      const files: File[] = [];

      // Check if webkitGetAsEntry is available
      const traverseEntry = async (entry: any, path = ''): Promise<void> => {
        if (entry.isFile) {
          const file = await new Promise<File>((resolve, reject) => entry.file(resolve, reject));
          // Attach relative path for folder grouping
          Object.defineProperty(file, 'webkitRelativePath', {
            value: path + file.name,
            writable: false,
          });
          files.push(file);
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader();
          const entries = await new Promise<any[]>((resolve, reject) => dirReader.readEntries(resolve, reject));
          for (const child of entries) {
            await traverseEntry(child, `${path}${entry.name}/`);
          }
        }
      };

      const promises: Promise<void>[] = [];
      for (let i = 0; i < itemsList.length; i++) {
        const entry = itemsList[i].webkitGetAsEntry();
        if (entry) {
          promises.push(traverseEntry(entry));
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        if (files.length > 0) {
          processFilesList(files);
          return;
        }
      }
    }

    // Fallback to files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFilesList(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFilesList(e.target.files);
      e.target.value = '';
    }
  };

  // Batch updates
  const handleApplyBatchPrice = () => {
    const num = Number(batchPrice);
    if (isNaN(num) || num < 0) return;
    setItems((prev) => prev.map((item) => ({ ...item, price: num })));
  };

  const handleApplyBatchCategory = () => {
    setItems((prev) => prev.map((item) => ({ ...item, category: batchCategory })));
  };

  const handleApplyBatchType = () => {
    setItems((prev) => prev.map((item) => ({ ...item, type: batchType })));
  };

  // Update individual item
  const updateItem = (index: number, updates: Partial<ParsedBulkItem>) => {
    setItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...updates } : item)));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Upload & Create All
  const handleStartImport = async () => {
    if (items.length === 0) return;

    // Validate
    for (const item of items) {
      if (!item.id.trim() || !item.name.trim()) {
        setGlobalError('Vui lòng điền đầy đủ Mã SP và Tên SP cho tất cả các dòng.');
        return;
      }
    }

    setIsProcessing(true);
    setGlobalError('');
    setProgress({ current: 0, total: items.length });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setProgress({ current: i + 1, total: items.length });
      updateItem(i, { status: 'uploading' });

      try {
        // Upload images
        const uploadedUrls: string[] = [];
        for (const file of item.files) {
          try {
            const url = await productService.uploadProductImage(file, item.id);
            uploadedUrls.push(url);
          } catch (uploadErr) {
            console.warn(`Lỗi upload ảnh file ${file.name}:`, uploadErr);
            // Fallback placeholder if storage not configured
            uploadedUrls.push(item.previewUrl);
          }
        }

        const finalSlug =
          normalizeVietnamese(item.name)
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') +
          '-' +
          item.id.toLowerCase();

        await productService.createProduct({
          id: item.id.trim().toUpperCase(),
          name: item.name.trim(),
          slug: finalSlug,
          category: item.category,
          categories: item.categories || [item.category],
          categoryIds: item.categories || [item.category],
          price: item.price,
          currency: 'VND',
          type: item.type,
          colors: ['be', 'moc'],
          sizes: ['1m6 x 2m', '1m8 x 2m'],
          description: `Sản phẩm chất liệu tự nhiên thoáng khí, dệt từ sợi linen và đũi wash mềm.`,
          comboItems:
            item.type === 'combo'
              ? [
                  { name: 'Ga chun bọc đệm', quantity: 1, note: 'Độ cao đệm đến 20cm' },
                  { name: 'Vỏ gối nằm tự nhiên', quantity: 2, note: '50 x 70 cm' },
                  { name: 'Vỏ chăn hè đũi mộc', quantity: 1, note: '2m x 2m2' },
                ]
              : [],
          images: uploadedUrls,
          coverImage: uploadedUrls[0] || item.previewUrl,
          featured: false,
          published: item.published,
          available: true,
        });

        updateItem(i, { status: 'success' });
        successCount++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi tạo sản phẩm';
        updateItem(i, { status: 'error', errorMsg: msg });
        errorCount++;
      }
    }

    setIsProcessing(false);

    if (errorCount === 0) {
      setGlobalSuccess(`🎉 Tuyệt vời! Đã nhập thành công toàn bộ ${successCount} sản phẩm vào cửa hàng!`);
      setTimeout(() => {
        navigate('/admin/products');
      }, 2500);
    } else {
      setGlobalError(`Đã tạo được ${successCount} sản phẩm, có ${errorCount} sản phẩm gặp lỗi. Vui lòng kiểm tra lại.`);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e8e1d5', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin/products" className="btn btn-outline btn-sm">
            <ArrowLeft size={16} />
            <span>Quay lại Sản phẩm</span>
          </Link>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2c2825', margin: 0 }}>
              Thêm Hàng Loạt Từ Thư Mục (Folder Bulk Import)
            </h1>
            <p style={{ fontSize: '0.825rem', color: '#685e54', margin: '2px 0 0' }}>
              Mỗi thư mục ảnh là 1 sản phẩm. Hệ thống tự động nhận diện tên, gom ảnh và tạo hàng loạt.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/admin/products/new" className="btn btn-outline btn-sm">
            <span>+ Thêm lẻ 1 sản phẩm</span>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {globalSuccess && (
        <div style={{ backgroundColor: '#edf7ed', border: '1px solid #c8e6c9', color: '#1b5e20', padding: '0.85rem 1.25rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem' }}>
          <CheckCircle size={20} />
          <span>{globalSuccess}</span>
        </div>
      )}

      {globalError && (
        <div style={{ backgroundColor: '#fdeeed', border: '1px solid #f9c7c4', color: '#b71c1c', padding: '0.85rem 1.25rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem' }}>
          <AlertCircle size={20} />
          <span>{globalError}</span>
        </div>
      )}

      {/* Drag & Drop Folders Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging ? '2.5px dashed #7c6a59' : '2px dashed #dcd3c5',
          backgroundColor: isDragging ? '#f5eee6' : '#ffffff',
          borderRadius: '12px',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isDragging ? '0 8px 24px rgba(124, 106, 89, 0.15)' : 'none',
        }}
      >
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f5eee6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#7c6a59' }}>
          <FolderPlus size={28} />
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2c2825', marginBottom: '0.35rem' }}>
          Kéo thả các Thư mục Sản phẩm vào đây
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#685e54', maxWidth: '580px', margin: '0 auto 1rem', lineHeight: 1.5 }}>
          Bạn có thể chọn cùng lúc 5, 10 hoặc 20 folder ảnh từ máy tính. Tên folder nên đặt dạng: <br />
          <code style={{ backgroundColor: '#f3eee6', padding: '2px 6px', borderRadius: '4px', color: '#7c6a59' }}>
            GA001 - Ga Chun Đũi Trơn Be
          </code>
        </p>

        <button type="button" className="btn btn-primary btn-sm" style={{ pointerEvents: 'none' }}>
          <Upload size={15} />
          <span>Hoặc bấm để Chọn Thư Mục</span>
        </button>

        {/* Hidden Directory File Input */}
        <input
          ref={fileInputRef}
          type="file"
          // @ts-expect-error webkitdirectory is standard in WebKit/Blink
          webkitdirectory=""
          directory=""
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* Parsed Items Section */}
      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Batch Quick Controls Toolbar */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2c2825' }}>
                Đã quét {items.length} sản phẩm
              </span>
            </div>

            {/* Quick bulk settings */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.775rem', color: '#685e54' }}>Giá chung:</span>
                <input
                  type="number"
                  placeholder="380000"
                  value={batchPrice}
                  onChange={(e) => setBatchPrice(e.target.value)}
                  style={{ width: '110px', padding: '0.3rem 0.5rem', fontSize: '0.8rem', border: '1px solid #dcd3c5', borderRadius: '4px' }}
                />
                <button type="button" onClick={handleApplyBatchPrice} className="btn btn-outline btn-sm" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}>
                  Áp dụng
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.775rem', color: '#685e54' }}>Danh mục:</span>
                <select
                  value={batchCategory}
                  onChange={(e) => setBatchCategory(e.target.value as ProductCategory)}
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', border: '1px solid #dcd3c5', borderRadius: '4px', backgroundColor: '#ffffff' }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button type="button" onClick={handleApplyBatchCategory} className="btn btn-outline btn-sm" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}>
                  Áp dụng
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.775rem', color: '#685e54' }}>Loại:</span>
                <select
                  value={batchType}
                  onChange={(e) => setBatchType(e.target.value as 'single' | 'combo')}
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', border: '1px solid #dcd3c5', borderRadius: '4px', backgroundColor: '#ffffff' }}
                >
                  <option value="single">Đơn lẻ</option>
                  <option value="combo">Combo</option>
                </select>
                <button type="button" onClick={handleApplyBatchType} className="btn btn-outline btn-sm" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}>
                  Áp dụng
                </button>
              </div>

              <button
                type="button"
                onClick={() => setItems([])}
                className="btn btn-outline btn-sm"
                style={{ color: '#c62828', borderColor: '#f9c7c4', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
              >
                Xóa danh sách
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="admin-table-card">
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>STT</th>
                    <th style={{ width: '70px' }}>Ảnh</th>
                    <th style={{ minWidth: '110px' }}>Mã SP</th>
                    <th style={{ minWidth: '220px' }}>Tên sản phẩm</th>
                    <th style={{ minWidth: '130px' }}>Loại</th>
                    <th style={{ minWidth: '160px' }}>Danh mục</th>
                    <th style={{ minWidth: '130px' }}>Giá niêm yết</th>
                    <th style={{ minWidth: '100px' }}>Trạng thái</th>
                    <th style={{ width: '50px', textAlign: 'right' }}>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} style={{ backgroundColor: item.status === 'success' ? '#f1f8e9' : item.status === 'error' ? '#ffebee' : undefined }}>
                      <td style={{ color: '#8c8073', fontWeight: 600 }}>{idx + 1}</td>
                      <td>
                        <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f3eee6', border: '1px solid #e8e1d5' }}>
                          <img src={item.previewUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <span style={{ position: 'absolute', bottom: '2px', right: '2px', backgroundColor: 'rgba(0,0,0,0.65)', color: '#ffffff', fontSize: '0.65rem', padding: '1px 3px', borderRadius: '3px' }}>
                            {item.files.length}
                          </span>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.id}
                          onChange={(e) => updateItem(idx, { id: e.target.value.toUpperCase() })}
                          disabled={isProcessing}
                          style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.825rem', fontWeight: 600, border: '1px solid #dcd3c5', borderRadius: '4px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(idx, { name: e.target.value })}
                          disabled={isProcessing}
                          style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.825rem', border: '1px solid #dcd3c5', borderRadius: '4px' }}
                        />
                      </td>
                      <td>
                        <select
                          value={item.type}
                          onChange={(e) => updateItem(idx, { type: e.target.value as 'single' | 'combo' })}
                          disabled={isProcessing}
                          style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.825rem', border: '1px solid #dcd3c5', borderRadius: '4px', backgroundColor: '#ffffff' }}
                        >
                          <option value="single">Món lẻ</option>
                          <option value="combo">Bộ Combo</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(idx, { category: e.target.value as ProductCategory })}
                          disabled={isProcessing}
                          style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.825rem', border: '1px solid #dcd3c5', borderRadius: '4px', backgroundColor: '#ffffff' }}
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(idx, { price: Number(e.target.value) || 0 })}
                          disabled={isProcessing}
                          style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.825rem', fontWeight: 600, border: '1px solid #dcd3c5', borderRadius: '4px' }}
                        />
                      </td>
                      <td>
                        {item.status === 'uploading' && (
                          <span style={{ fontSize: '0.75rem', color: '#e65100', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <RefreshCw size={12} className="spin" /> Đang tải...
                          </span>
                        )}
                        {item.status === 'success' && (
                          <span style={{ fontSize: '0.75rem', color: '#2e7d32', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle size={13} /> Đã xong
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span style={{ fontSize: '0.75rem', color: '#c62828', fontWeight: 600 }} title={item.errorMsg}>
                            Lỗi
                          </span>
                        )}
                        {item.status === 'pending' && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.775rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={item.published}
                              onChange={(e) => updateItem(idx, { published: e.target.checked })}
                            />
                            <span>Hiển thị</span>
                          </label>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          disabled={isProcessing}
                          style={{ color: '#c62828', padding: '0.25rem', cursor: 'pointer' }}
                          title="Xóa dòng này"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Final CTA */}
            <div style={{ padding: '1.25rem', borderTop: '1px solid #e8e1d5', backgroundColor: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2c2825' }}>
                  Tổng cộng: {items.length} sản phẩm sẵn sàng đăng
                </span>
                {isProcessing && (
                  <p style={{ fontSize: '0.8rem', color: '#7c6a59', margin: '4px 0 0' }}>
                    Đang xử lý {progress.current} / {progress.total}... Vui lòng không đóng trang.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleStartImport}
                disabled={isProcessing || items.length === 0}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.75rem', fontSize: '0.95rem', gap: '0.5rem', backgroundColor: '#7c6a59' }}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={17} className="spin" />
                    <span>Đang tải lên ({progress.current}/{progress.total})...</span>
                  </>
                ) : (
                  <>
                    <Upload size={17} />
                    <span>🚀 Tải lên & Tạo tất cả ({items.length} SP)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
