import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Folder,
  FolderPlus,
  Upload,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Search,
  ArrowLeft,
  ChevronRight,
  Eye,
  X,
  FileImage,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Filter,
  Sparkles,
  MoveRight,
  CheckSquare,
  Package,
} from 'lucide-react';
import { mediaService, StorageItem, DuplicateGroup } from '../services/mediaService';
import { productService } from '../services/productService';
import { Category, Product } from '../types/product';

export const AdminMediaLibraryPage: React.FC = () => {
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [items, setItems] = useState<StorageItem[]>([]);
  const [allFiles, setAllFiles] = useState<StorageItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<string>('');

  // Category Filter: 'all' | 'uncategorized' | categoryId
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [viewScope, setViewScope] = useState<'current_folder' | 'all_photos'>('current_folder');
  const [products, setProducts] = useState<Product[]>([]);

  // Upload category selection (Optional: uncategorized or assign to a category)
  const [uploadCategory, setUploadCategory] = useState<string>('');

  // Upload state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Duplicate Check Modal on Upload
  const [pendingUploadFiles, setPendingUploadFiles] = useState<File[]>([]);
  const [detectedDuplicates, setDetectedDuplicates] = useState<
    { newFile: File; existingItem: StorageItem; reason: string }[]
  >([]);
  const [showDuplicateUploadModal, setShowDuplicateUploadModal] = useState<boolean>(false);
  const [isCheckingUploadDuplicates, setIsCheckingUploadDuplicates] = useState<boolean>(false);

  // Duplicate Scanner Tool Modal
  const [showDuplicateScannerModal, setShowDuplicateScannerModal] = useState<boolean>(false);
  const [isScanningDuplicates, setIsScanningDuplicates] = useState<boolean>(false);
  const [scanProgressText, setScanProgressText] = useState<string>('');
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);

  // Move category modal
  const [itemToMove, setItemToMove] = useState<StorageItem | null>(null);
  const [targetCategory, setTargetCategory] = useState<string>('');
  const [isMoving, setIsMoving] = useState<boolean>(false);

  // New folder modal
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);

  // Preview modal
  const [previewItem, setPreviewItem] = useState<StorageItem | null>(null);

  // Delete confirm modal
  const [itemToDelete, setItemToDelete] = useState<StorageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Load categories, products and data
  useEffect(() => {
    async function init() {
      try {
        const [cats, prods] = await Promise.all([
          productService.getCategories(),
          productService.getAllProductsAdmin(),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.warn('Could not load categories or products:', err);
      }
    }
    init();
  }, []);

  const loadMedia = async (folder: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [res, recursive] = await Promise.all([
        mediaService.listItems(folder),
        mediaService.listAllFilesRecursive(),
      ]);
      const visibleItems = res.items.filter((i) => !i.name.startsWith('.'));
      setItems(visibleItems);
      setAllFiles(recursive);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi tải kho ảnh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia(currentFolder);
  }, [currentFolder]);

  // Navigate folder
  const handleOpenFolder = (folderName: string) => {
    const nextPath = currentFolder ? `${currentFolder}/${folderName}` : folderName;
    setCurrentFolder(nextPath);
    setViewScope('current_folder');
  };

  const handleNavigateBreadcrumb = (index: number, segments: string[]) => {
    if (index === -1) {
      setCurrentFolder('');
    } else {
      const targetPath = segments.slice(0, index + 1).join('/');
      setCurrentFolder(targetPath);
    }
    setViewScope('current_folder');
  };

  const handleBackOneLevel = () => {
    if (!currentFolder) return;
    const parts = currentFolder.split('/');
    parts.pop();
    setCurrentFolder(parts.join('/'));
    setViewScope('current_folder');
  };

  // Upload files check for duplicates by actual image data & content
  const handlePreUploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      setErrorMsg('Vui lòng chọn file hình ảnh (JPG, PNG, WebP, AVIF).');
      return;
    }

    setIsCheckingUploadDuplicates(true);
    setErrorMsg('');

    try {
      // 1. Compute binary hash & perceptual hash for incoming files
      const incomingHashed = await Promise.all(
        fileArray.map(async (file) => {
          const sha256 = await mediaService.computeBinaryHash(file);
          const pHash = await mediaService.computePerceptualHash(file);
          return { file, sha256, pHash };
        })
      );

      // 2. Fetch or load fingerprints for existing library files
      const duplicates: { newFile: File; existingItem: StorageItem; reason: string }[] = [];

      for (const incoming of incomingHashed) {
        let matchFound: { item: StorageItem; reason: string } | null = null;

        // Compare against existing library items
        for (const existing of allFiles) {
          if (existing.isFolder) continue;

          // Quick size filter check optimization: if sizes match exactly
          if (existing.size && existing.size === incoming.file.size) {
            matchFound = {
              item: existing,
              reason: 'Trùng khớp 100% dung lượng byte dữ liệu',
            };
            break;
          }

          // If library item has publicUrl, check its data fingerprint
          if (existing.publicUrl) {
            const existingFp = await mediaService.getImageFingerprint(existing);
            
            // Check SHA-256 exact binary content match
            if (existingFp.sha256 && existingFp.sha256 === incoming.sha256) {
              matchFound = {
                item: existing,
                reason: 'Trùng 100% mã nhị phân ảnh (SHA-256)',
              };
              break;
            }

            // Check Perceptual Hash (Visual content match)
            if (existingFp.pHash && incoming.pHash) {
              const dist = mediaService.hammingDistance(existingFp.pHash, incoming.pHash);
              if (dist <= 3) {
                matchFound = {
                  item: existing,
                  reason: `Trùng khớp thị giác ~${Math.round(((64 - dist) / 64) * 100)}% nội dung ảnh`,
                };
                break;
              }
            }
          }

          // Fallback: name match
          if (existing.name.endsWith(incoming.file.name)) {
            matchFound = {
              item: existing,
              reason: 'Trùng tên file ảnh',
            };
            break;
          }
        }

        if (matchFound) {
          duplicates.push({
            newFile: incoming.file,
            existingItem: matchFound.item,
            reason: matchFound.reason,
          });
        }
      }

      if (duplicates.length > 0) {
        setPendingUploadFiles(fileArray);
        setDetectedDuplicates(duplicates);
        setShowDuplicateUploadModal(true);
      } else {
        await executeUpload(fileArray);
      }
    } catch (err: unknown) {
      console.warn('Lỗi kiểm tra ảnh trùng:', err);
      // Fallback: continue upload if checking fails
      await executeUpload(fileArray);
    } finally {
      setIsCheckingUploadDuplicates(false);
    }
  };

  // Actually upload to Supabase Storage
  const executeUpload = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return;

    setIsUploading(true);
    setErrorMsg('');
    setUploadProgress(`Đang tải 0/${filesToUpload.length} ảnh...`);

    // Target folder: If uploadCategory is chosen, use it. Otherwise use currentFolder.
    const targetPath = uploadCategory ? uploadCategory : currentFolder;

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        setUploadProgress(`Đang tải ${i + 1}/${filesToUpload.length} ảnh...`);
        await mediaService.uploadFile(filesToUpload[i], targetPath);
      }
      setSuccessMsg(`Đã tải lên ${filesToUpload.length} ảnh thành công!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadMedia(currentFolder);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi tải ảnh');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Skip duplicates and only upload clean ones
  const handleUploadOnlyCleanFiles = async () => {
    setShowDuplicateUploadModal(false);
    const duplicateNames = new Set(detectedDuplicates.map((d) => d.newFile.name));
    const cleanFiles = pendingUploadFiles.filter((f) => !duplicateNames.has(f.name));
    if (cleanFiles.length === 0) {
      setSuccessMsg('Đã bỏ qua toàn bộ ảnh trùng lặp theo yêu cầu của bạn.');
      setTimeout(() => setSuccessMsg(''), 3000);
      return;
    }
    await executeUpload(cleanFiles);
  };

  // Force upload all
  const handleUploadAllAnyway = async () => {
    setShowDuplicateUploadModal(false);
    await executeUpload(pendingUploadFiles);
  };

  // Scan duplicates across entire library by actual data
  const handleRunDuplicateScanner = async () => {
    setIsScanningDuplicates(true);
    setShowDuplicateScannerModal(true);
    setScanProgressText('Đang lấy danh sách tất cả ảnh trong kho...');
    try {
      const recursive = await mediaService.listAllFilesRecursive();
      setAllFiles(recursive);
      const groups = await mediaService.findDuplicatesByData(recursive, (msg) => {
        setScanProgressText(msg);
      });
      setDuplicateGroups(groups);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi quét ảnh trùng');
    } finally {
      setIsScanningDuplicates(false);
      setScanProgressText('');
    }
  };

  // Delete redundant duplicates in a group (keep only 1st item)
  const handleDeleteRedundantDuplicates = async (group: DuplicateGroup) => {
    const toDelete = group.items.slice(1);
    try {
      for (const item of toDelete) {
        await mediaService.deleteFile(item.fullPath);
      }
      setSuccessMsg(`Đã xóa ${toDelete.length} bản sao trùng lặp.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      // Update local state
      setDuplicateGroups((prev) => prev.filter((g) => g.size !== group.size));
      await loadMedia(currentFolder);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi xóa bản sao');
    }
  };

  // Create folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsCreatingFolder(true);
    setErrorMsg('');
    try {
      await mediaService.createFolder(newFolderName.trim(), currentFolder);
      setSuccessMsg(`Đã tạo thư mục "${newFolderName.trim().toUpperCase()}"!`);
      setShowNewFolderModal(false);
      setNewFolderName('');
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadMedia(currentFolder);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi tạo thư mục');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Move item to category
  const handleMoveItemToCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToMove) return;

    setIsMoving(true);
    setErrorMsg('');
    try {
      const cleanFileName = itemToMove.name;
      const destinationPath = targetCategory ? `${targetCategory}/${cleanFileName}` : cleanFileName;

      await mediaService.moveFile(itemToMove.fullPath, destinationPath);
      setSuccessMsg(`Đã chuyển ảnh sang ${targetCategory ? `danh mục "${targetCategory}"` : 'Thư mục gốc'}!`);
      setItemToMove(null);
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadMedia(currentFolder);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi chuyển ảnh');
    } finally {
      setIsMoving(false);
    }
  };

  // Delete file or folder
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (itemToDelete.isFolder) {
        await mediaService.deleteFolder(itemToDelete.fullPath);
      } else {
        await mediaService.deleteFile(itemToDelete.fullPath);
      }
      setSuccessMsg(`Đã xóa "${itemToDelete.name}" thành công.`);
      setItemToDelete(null);
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadMedia(currentFolder);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi xóa');
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy URL
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  const breadcrumbs = currentFolder ? currentFolder.split('/') : [];

  // Filter items based on Category, Product, View Scope, and Search
  const displayedItems = useMemo(() => {
    let list: StorageItem[] = [];

    if (categoryFilter !== 'all' || productFilter !== 'all' || viewScope === 'all_photos') {
      // In all photos, category, or product view, display flat list of all recursive files
      list = allFiles;

      if (categoryFilter === 'uncategorized') {
        // Files not in any category folder
        list = list.filter((item) => !item.fullPath.includes('/'));
      } else if (categoryFilter !== 'all') {
        // Files whose path starts with categoryFilter
        list = list.filter((item) => item.fullPath.startsWith(`${categoryFilter}/`));
      }

      // Filter by selected product ID
      if (productFilter !== 'all') {
        const prod = products.find((p) => p.id === productFilter);
        const prodImages = new Set(prod?.images || []);
        if (prod?.coverImage) prodImages.add(prod.coverImage);

        list = list.filter((item) => {
          // Check if item fullPath contains product id, or publicUrl is in product images
          const matchId = item.fullPath.toUpperCase().includes(productFilter.toUpperCase());
          const matchUrl = item.publicUrl && prodImages.has(item.publicUrl);
          const matchFileName = item.name.toUpperCase().includes(productFilter.toUpperCase());
          return matchId || matchUrl || matchFileName;
        });
      }
    } else {
      // Normal folder tree view
      list = items;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((item) => item.name.toLowerCase().includes(query));
    }

    return list;
  }, [categoryFilter, productFilter, viewScope, allFiles, items, searchQuery, products]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2c2825', margin: 0 }}>
            Kho Ảnh Online (Media Library)
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#685e54', margin: '3px 0 0' }}>
            Tổng cộng: {allFiles.length} ảnh trên Supabase Cloud • Hỗ trợ lọc danh mục & Quét trùng lặp
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Duplicate Scanner Button */}
          <button
            type="button"
            onClick={handleRunDuplicateScanner}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b78103', borderColor: '#ffe082', backgroundColor: '#fffdf6' }}
            title="Quét và phát hiện các ảnh bị trùng lặp dung lượng/nội dung"
          >
            <Sparkles size={16} color="#d97706" />
            <span>Quét ảnh trùng</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewFolderModal(true)}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FolderPlus size={16} />
            <span>Tạo thư mục</span>
          </button>

          {/* Upload with optional category */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', height: '33px', backgroundColor: '#ffffff' }}
              title="Chọn danh mục khi tải ảnh (Để trống = Chưa phân loại / Hiện ở Tất cả)"
            >
              <option value="">+ Gán Danh mục: (Tự do/Tất cả)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary btn-sm"
              disabled={isUploading || isCheckingUploadDuplicates}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {isCheckingUploadDuplicates ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  <span>Đang phân tích dữ liệu ảnh...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>{isUploading ? uploadProgress : 'Tải ảnh lên'}</span>
                </>
              )}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && handlePreUploadFiles(e.target.files)}
          />
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div
          style={{
            backgroundColor: '#edf7ed',
            border: '1px solid #c8e6c9',
            color: '#1b5e20',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
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
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Category Filter Pills & Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e8e1d5',
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {/* Row 1: Categories filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#685e54', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Filter size={14} /> Danh mục:
          </span>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('all');
              setViewScope('all_photos');
            }}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '20px',
              border: categoryFilter === 'all' && viewScope === 'all_photos' ? '1px solid #766352' : '1px solid #e8e1d5',
              backgroundColor: categoryFilter === 'all' && viewScope === 'all_photos' ? '#766352' : '#faf8f5',
              color: categoryFilter === 'all' && viewScope === 'all_photos' ? '#ffffff' : '#2c2825',
              fontSize: '0.775rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Tất cả ảnh ({allFiles.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('all');
              setViewScope('current_folder');
            }}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '20px',
              border: categoryFilter === 'all' && viewScope === 'current_folder' ? '1px solid #766352' : '1px solid #e8e1d5',
              backgroundColor: categoryFilter === 'all' && viewScope === 'current_folder' ? '#766352' : '#faf8f5',
              color: categoryFilter === 'all' && viewScope === 'current_folder' ? '#ffffff' : '#2c2825',
              fontSize: '0.775rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            📁 Xem theo Thư mục
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('uncategorized');
              setViewScope('all_photos');
            }}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '20px',
              border: categoryFilter === 'uncategorized' ? '1px solid #766352' : '1px solid #e8e1d5',
              backgroundColor: categoryFilter === 'uncategorized' ? '#766352' : '#faf8f5',
              color: categoryFilter === 'uncategorized' ? '#ffffff' : '#2c2825',
              fontSize: '0.775rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Chưa phân loại
          </button>

          {categories.map((c) => {
            const isSelected = categoryFilter === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategoryFilter(c.id);
                  setViewScope('all_photos');
                }}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: '20px',
                  border: isSelected ? '1px solid #766352' : '1px solid #e8e1d5',
                  backgroundColor: isSelected ? '#766352' : '#faf8f5',
                  color: isSelected ? '#ffffff' : '#2c2825',
                  fontSize: '0.775rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Row 2: Filter by Product */}
        {products.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid #f4efe8', paddingTop: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#685e54', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Package size={14} /> Sản phẩm:
            </span>

            <select
              value={productFilter}
              onChange={(e) => {
                setProductFilter(e.target.value);
                setViewScope('all_photos');
              }}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: productFilter !== 'all' ? '1px solid #766352' : '1px solid #dcd3c5',
                backgroundColor: productFilter !== 'all' ? '#fdfbf7' : '#ffffff',
                color: '#2c2825',
                fontSize: '0.8rem',
                fontWeight: 500,
                outline: 'none',
                maxWidth: '280px',
              }}
            >
              <option value="all">Tất cả sản phẩm ({products.length})</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.id}] {p.name}
                </option>
              ))}
            </select>

            {productFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setProductFilter('all')}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#c62828',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '2px 6px',
                }}
              >
                <X size={13} />
                <span>Bỏ lọc SP</span>
              </button>
            )}
          </div>
        )}

        {/* Row 2: Breadcrumbs & Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #f0eae1', paddingTop: '0.65rem' }}>
          {viewScope === 'current_folder' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
              {currentFolder && (
                <button
                  type="button"
                  onClick={handleBackOneLevel}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.2rem 0.45rem', marginRight: '0.25rem' }}
                  title="Quay lại thư mục trước"
                >
                  <ArrowLeft size={14} />
                </button>
              )}

              <button
                type="button"
                onClick={() => handleNavigateBreadcrumb(-1, [])}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: currentFolder ? '#766352' : '#2c2825',
                  fontWeight: currentFolder ? 500 : 700,
                  padding: '2px 4px',
                }}
              >
                🏠 Thư mục Gốc
              </button>

              {breadcrumbs.map((seg, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={idx}>
                    <ChevronRight size={14} color="#9e9387" />
                    <button
                      type="button"
                      onClick={() => handleNavigateBreadcrumb(idx, breadcrumbs)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: isLast ? 'default' : 'pointer',
                        color: isLast ? '#2c2825' : '#766352',
                        fontWeight: isLast ? 700 : 500,
                        padding: '2px 4px',
                      }}
                    >
                      {seg}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '0.825rem', color: '#685e54', fontWeight: 500 }}>
              Đang xem danh mục:{' '}
              <strong>
                {categoryFilter === 'all'
                  ? 'Tất cả ảnh'
                  : categoryFilter === 'uncategorized'
                  ? 'Chưa phân loại'
                  : categories.find((c) => c.id === categoryFilter)?.name || categoryFilter}
              </strong>{' '}
              ({displayedItems.length} ảnh)
            </div>
          )}

          {/* Search & Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9e9387',
                }}
              />
              <input
                type="text"
                placeholder="Tìm file theo tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2rem', paddingRight: '0.5rem', fontSize: '0.8rem', height: '32px' }}
              />
            </div>

            <button
              type="button"
              onClick={() => loadMedia(currentFolder)}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.35rem 0.6rem' }}
              title="Làm mới danh sách"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Drag & Drop Overlay Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handlePreUploadFiles(e.dataTransfer.files);
          }
        }}
        style={{
          border: isDraggingOver ? '2px dashed #766352' : '2px dashed transparent',
          backgroundColor: isDraggingOver ? '#f7f4ee' : 'transparent',
          borderRadius: '10px',
          transition: 'all 0.2s ease',
          minHeight: '300px',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#766352' }}>
            <RefreshCw size={26} className="spin" />
            <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Đang tải ảnh từ Supabase Cloud...</p>
          </div>
        ) : displayedItems.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e8e1d5',
            }}
          >
            <FileImage size={40} color="#b4a99a" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#2c2825' }}>
              {searchQuery ? 'Không tìm thấy file phù hợp' : 'Chưa có ảnh nào trong mục này'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#8c8277', marginTop: '0.25rem' }}>
              Kéo thả file ảnh vào đây hoặc bấm nút "Tải ảnh lên" phía trên để lưu ảnh lên Supabase.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            {displayedItems.map((item) => {
              if (item.isFolder) {
                return (
                  <div
                    key={item.name}
                    onClick={() => handleOpenFolder(item.name)}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e8e1d5',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#766352';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e8e1d5';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Folder size={48} color="#bfa382" style={{ marginBottom: '0.5rem' }} />
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#2c2825',
                        textAlign: 'center',
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.name}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#9e9387', marginTop: '2px' }}>
                      Thư mục
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete(item);
                      }}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: '#c62828',
                        padding: '4px',
                        opacity: 0.6,
                      }}
                      title="Xóa thư mục"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              }

              // Category name badge if item has folder prefix
              const folderPrefix = item.fullPath.includes('/') ? item.fullPath.split('/')[0] : '';
              const catObj = categories.find((c) => c.id === folderPrefix);

              // Image item card
              return (
                <div
                  key={item.fullPath}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8e1d5',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    position: 'relative',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '85%',
                      backgroundColor: '#f3eee6',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => setPreviewItem(item)}
                  >
                    <img
                      src={item.publicUrl}
                      alt={item.name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      loading="lazy"
                    />

                    {/* Category pill on image */}
                    {catObj && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          backgroundColor: 'rgba(255,255,255,0.92)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '12px',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          color: '#685e54',
                        }}
                      >
                        {catObj.name}
                      </span>
                    )}

                    {/* Preview overlay icon */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.25)',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    >
                      <Eye size={22} />
                    </div>
                  </div>

                  {/* Body details */}
                  <div style={{ padding: '0.6rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontSize: '0.775rem',
                        fontWeight: 500,
                        color: '#2c2825',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.name}
                    >
                      {item.name}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#9e9387' }}>
                        {formatFileSize(item.size)}
                      </span>
                      {folderPrefix && (
                        <span style={{ fontSize: '0.675rem', color: '#766352', fontFamily: 'monospace' }}>
                          /{folderPrefix}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div
                    style={{
                      borderTop: '1px solid #f0eae1',
                      padding: '0.4rem 0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#faf8f5',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.publicUrl || '')}
                      className="btn btn-outline btn-sm"
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.7rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                      title="Sao chép link ảnh"
                    >
                      {copiedUrl === item.publicUrl ? <Check size={12} color="#1b5e20" /> : <Copy size={12} />}
                      <span>{copiedUrl === item.publicUrl ? 'Đã chép' : 'Copy'}</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setItemToMove(item);
                          setTargetCategory(folderPrefix || '');
                        }}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          color: '#766352',
                          padding: '3px',
                        }}
                        title="Đổi danh mục / Di chuyển ảnh"
                      >
                        <MoveRight size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          color: '#c62828',
                          padding: '3px',
                        }}
                        title="Xóa ảnh khỏi kho"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Duplicate Upload Warning */}
      {showDuplicateUploadModal &&
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
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(3px)',
              }}
              onClick={() => setShowDuplicateUploadModal(false)}
            />
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '560px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
                zIndex: 10001,
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#b78103' }}>
                <AlertCircle size={26} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2c2825' }}>
                    Phát hiện ảnh trùng dữ liệu!
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#685e54', marginTop: '0.35rem', lineHeight: 1.5 }}>
                    Hệ thống nhận thấy có <strong>{detectedDuplicates.length}</strong> ảnh bạn vừa chọn đã tồn tại trên kho dựa trên phân tích dữ liệu ảnh (mã SHA-256 / độ tương đồng thị giác):
                  </p>
                </div>
              </div>

              <div
                style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  margin: '1rem 0',
                  border: '1px solid #e8e1d5',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  backgroundColor: '#faf8f5',
                }}
              >
                {detectedDuplicates.map((dup, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      fontSize: '0.8rem',
                      borderBottom: idx < detectedDuplicates.length - 1 ? '1px solid #f0eae1' : 'none',
                    }}
                  >
                    <div>
                      <strong>{dup.newFile.name}</strong> ({formatFileSize(dup.newFile.size)})
                      <div style={{ fontSize: '0.725rem', color: '#8c8277', marginTop: '2px' }}>
                        Trùng với: <code>{dup.existingItem.fullPath}</code>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#b78103', fontWeight: 500, marginTop: '2px' }}>
                        ⚡ {dup.reason}
                      </div>
                    </div>
                    <span style={{ color: '#c62828', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0, marginLeft: '0.5rem' }}>
                      Đã tồn tại
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowDuplicateUploadModal(false)}
                >
                  Hủy tải lên
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#2e7d32' }}
                  onClick={handleUploadOnlyCleanFiles}
                >
                  <CheckSquare size={14} />
                  <span>Bỏ qua ảnh trùng (Khuyên dùng)</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ color: '#b78103' }}
                  onClick={handleUploadAllAnyway}
                >
                  Vẫn tải tất cả
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Duplicate Scanner Tool */}
      {showDuplicateScannerModal &&
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
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(3px)',
              }}
              onClick={() => setShowDuplicateScannerModal(false)}
            />
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '720px',
                maxHeight: '85vh',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
                zIndex: 10001,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid #e8e1d5',
                  backgroundColor: '#faf8f5',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2c2825', margin: 0 }}>
                    ⚡ Quét & Dọn Dẹp Ảnh Trùng Lặp Theo Dữ Liệu
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#685e54' }}>
                    So sánh phân tích nhị phân (SHA-256) và thị giác ảnh (Perceptual Hash) trong toàn bộ kho
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDuplicateScannerModal(false)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8c8277' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
                {isScanningDuplicates ? (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#766352' }}>
                    <RefreshCw size={26} className="spin" />
                    <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', fontWeight: 500 }}>
                      {scanProgressText || `Đang quét dữ liệu toàn bộ ${allFiles.length} ảnh trong kho...`}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#9e9387' }}>
                      Quá trình so sánh trực tiếp dữ liệu pixel và mã hash nhị phân của từng ảnh
                    </span>
                  </div>
                ) : duplicateGroups.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <CheckCircle size={44} color="#2e7d32" style={{ margin: '0 auto 0.75rem' }} />
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2c2825' }}>
                      Tuyệt vời! Không phát hiện ảnh trùng lặp dữ liệu nào
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#685e54', marginTop: '0.25rem' }}>
                      Tất cả ảnh trong kho đều có nội dung hình ảnh riêng biệt, không có bản sao thừa.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#685e54', margin: 0 }}>
                      Tìm thấy <strong>{duplicateGroups.length} nhóm ảnh</strong> trùng lặp nội dung ({duplicateGroups.reduce((acc, g) => acc + g.items.length - 1, 0)} ảnh thừa):
                    </p>

                    {duplicateGroups.map((group, gIdx) => (
                      <div
                        key={gIdx}
                        style={{
                          border: '1px solid #e8e1d5',
                          borderRadius: '8px',
                          padding: '1rem',
                          backgroundColor: '#faf8f5',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#766352' }}>
                            Nhóm {gIdx + 1} ({group.items.length} bản sao • {formatFileSize(group.size)})
                          </span>

                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: '#c62828', borderColor: '#f9c7c4', fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                            onClick={() => handleDeleteRedundantDuplicates(group)}
                            title="Xóa các bản sao, giữ lại 1 ảnh đầu tiên"
                          >
                            <Trash2 size={13} />
                            <span>Giữ 1 bản, xóa bản sao thừa</span>
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                          {group.items.map((item, idx) => (
                            <div
                              key={item.fullPath}
                              style={{
                                backgroundColor: '#ffffff',
                                border: idx === 0 ? '2px solid #2e7d32' : '1px solid #dcd3c5',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                position: 'relative',
                              }}
                            >
                              <div style={{ width: '100%', paddingTop: '100%', position: 'relative' }}>
                                <img
                                  src={item.publicUrl}
                                  alt={item.name}
                                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {idx === 0 && (
                                  <span
                                    style={{
                                      position: 'absolute',
                                      bottom: '4px',
                                      left: '4px',
                                      backgroundColor: '#2e7d32',
                                      color: '#ffffff',
                                      fontSize: '0.65rem',
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Bản chính
                                  </span>
                                )}
                              </div>
                              <div style={{ padding: '0.35rem', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.fullPath}>
                                {item.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #e8e1d5', textAlign: 'right', backgroundColor: '#faf8f5' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowDuplicateScannerModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Move Image to Category */}
      {itemToMove &&
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
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(3px)',
              }}
              onClick={() => !isMoving && setItemToMove(null)}
            />
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '440px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
                zIndex: 10001,
                padding: '1.5rem',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Chuyển Danh Mục Cho Ảnh
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#685e54', marginBottom: '1.25rem' }}>
                Ảnh: <strong>{itemToMove.name}</strong>
              </p>

              <form onSubmit={handleMoveItemToCategory}>
                <div className="form-group">
                  <label className="form-label">Chọn danh mục đích</label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Thư mục gốc (Chưa phân loại / Tất cả)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setItemToMove(null)}
                    disabled={isMoving}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isMoving}>
                    {isMoving ? 'Đang chuyển...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: New Folder */}
      {showNewFolderModal &&
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
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(3px)',
              }}
              onClick={() => !isCreatingFolder && setShowNewFolderModal(false)}
            />
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '420px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
                zIndex: 10001,
                padding: '1.5rem',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>
                Tạo Thư Mục Mới
              </h3>
              <form onSubmit={handleCreateFolder}>
                <div className="form-group">
                  <label className="form-label">Tên thư mục (Mã SP hoặc Danh mục)</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: GA001, CHAN_HE, TOPPER..."
                    className="form-input"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    autoFocus
                  />
                  <span className="form-help">
                    Thư mục sẽ được tạo trong: <strong>{currentFolder || 'Thư mục gốc'}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowNewFolderModal(false)}
                    disabled={isCreatingFolder}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isCreatingFolder}>
                    {isCreatingFolder ? 'Đang tạo...' : 'Tạo thư mục'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Full Preview */}
      {previewItem &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
          >
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(4px)',
              }}
              onClick={() => setPreviewItem(null)}
            />
            <div
              style={{
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '90vh',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden',
                zIndex: 10001,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #e8e1d5',
                }}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2c2825' }}>
                  {previewItem.name} ({formatFileSize(previewItem.size)})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(previewItem.publicUrl || '')}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    <Copy size={13} />
                    <span>Copy link</span>
                  </button>
                  <a
                    href={previewItem.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    <ExternalLink size={13} />
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewItem(null)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div style={{ padding: '1rem', textAlign: 'center', overflow: 'auto', maxHeight: '78vh' }}>
                <img
                  src={previewItem.publicUrl}
                  alt={previewItem.name}
                  style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: '6px' }}
                />
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Delete Confirmation */}
      {itemToDelete &&
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
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(3px)',
              }}
              onClick={() => !isDeleting && setItemToDelete(null)}
            />
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '440px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
                zIndex: 10001,
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#c62828' }}>
                <AlertCircle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2c2825' }}>
                    Xác nhận xóa {itemToDelete.isFolder ? 'thư mục' : 'ảnh'}?
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#685e54', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    Bạn có chắc muốn xóa{' '}
                    <strong>{itemToDelete.name}</strong>?{' '}
                    {itemToDelete.isFolder && 'Toàn bộ ảnh bên trong thư mục này cũng sẽ bị xóa vĩnh viễn.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeleting}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#c62828' }}
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Đang xóa...' : 'Đồng ý xóa'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
