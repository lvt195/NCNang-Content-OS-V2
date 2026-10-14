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
  ChevronLeft,
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
  Layers,
} from 'lucide-react';
import { mediaService, StorageItem, DuplicateGroup } from '../services/mediaService';
import { productService } from '../services/productService';
import { Category, Product } from '../types/product';

/**
 * Helper to generate a compact drag ghost whose height precisely matches category items (~34-36px).
 * Prevents covering up the category list and allows clear visibility when dragging.
 */
const createDragGhost = (thumbnailUrl?: string, count: number = 1, label?: string) => {
  const ghost = document.createElement('div');
  ghost.style.position = 'fixed';
  ghost.style.top = '-9999px';
  ghost.style.left = '-9999px';
  ghost.style.zIndex = '999999';
  ghost.style.display = 'flex';
  ghost.style.alignItems = 'center';
  ghost.style.gap = '6px';
  ghost.style.height = '34px'; // Exactly category item height
  ghost.style.padding = '3px 10px 3px 4px';
  ghost.style.backgroundColor = '#221e1a';
  ghost.style.color = '#ffffff';
  ghost.style.borderRadius = '6px';
  ghost.style.border = '1.5px solid #b78103';
  ghost.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
  ghost.style.pointerEvents = 'none';
  ghost.style.fontSize = '11px';
  ghost.style.fontWeight = '700';
  ghost.style.whiteSpace = 'nowrap';

  if (thumbnailUrl) {
    const img = document.createElement('img');
    img.src = thumbnailUrl;
    img.style.width = '26px';
    img.style.height = '26px';
    img.style.borderRadius = '4px';
    img.style.objectFit = 'cover';
    ghost.appendChild(img);
  } else {
    const icon = document.createElement('span');
    icon.innerHTML = '📁';
    icon.style.fontSize = '16px';
    icon.style.marginLeft = '3px';
    ghost.appendChild(icon);
  }

  const text = document.createElement('span');
  text.innerText = count > 1 ? `${count} ảnh đang kéo` : (label || '1 ảnh');
  ghost.appendChild(text);

  document.body.appendChild(ghost);
  return ghost;
};

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
  const [viewScope, setViewScope] = useState<'current_folder' | 'all_photos'>('all_photos');
  const [products, setProducts] = useState<Product[]>([]);

  // Collapsible sidebar state on desktop (persisted in localStorage)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('admin_media_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('admin_media_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

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

  // Multi-Select & Shift-Select State
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [lastSelectedIdx, setLastSelectedIdx] = useState<number | null>(null);
  const [draggedPaths, setDraggedPaths] = useState<string[]>([]);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [isBatchMoving, setIsBatchMoving] = useState<boolean>(false);
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);

  // Drag Action Mode: 'move' (Chuyển hẳn) | 'copy' (Thêm/Sao chép vào danh mục)
  const [dragActionMode, setDragActionMode] = useState<'move' | 'copy'>('move');

  // Multi-Category Assignment Modal State
  const [isMultiCategoryModalOpen, setIsMultiCategoryModalOpen] = useState<boolean>(false);
  const [multiCategoryTargetPaths, setMultiCategoryTargetPaths] = useState<string[]>([]);
  const [selectedTargetCategoryIds, setSelectedTargetCategoryIds] = useState<Set<string>>(new Set());
  const [assignMode, setAssignMode] = useState<'copy' | 'move'>('copy');
  const [isAssigningCategories, setIsAssigningCategories] = useState<boolean>(false);

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

  const loadMedia = async (folder: string, forceRefresh = false) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [res, recursive] = await Promise.all([
        mediaService.listItems(folder, forceRefresh),
        mediaService.listAllFilesRecursive('', 4, forceRefresh),
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

  // Toggle select item with click & Shift-Click
  const handleItemSelect = (item: StorageItem, index: number, e?: React.MouseEvent) => {
    if (item.isFolder) return;

    if (e && e.shiftKey && lastSelectedIdx !== null) {
      // Range selection
      const start = Math.min(lastSelectedIdx, index);
      const end = Math.max(lastSelectedIdx, index);
      const nextSet = new Set(selectedPaths);
      for (let i = start; i <= end; i++) {
        const it = displayedItems[i];
        if (it && !it.isFolder) {
          nextSet.add(it.fullPath);
        }
      }
      setSelectedPaths(nextSet);
    } else {
      // Direct click or mouse selection toggle
      const nextSet = new Set(selectedPaths);
      if (nextSet.has(item.fullPath)) {
        nextSet.delete(item.fullPath);
      } else {
        nextSet.add(item.fullPath);
      }
      setSelectedPaths(nextSet);
      setLastSelectedIdx(index);
    }
  };

  const handleSelectAll = () => {
    const filePaths = displayedItems.filter((i) => !i.isFolder).map((i) => i.fullPath);
    if (selectedPaths.size === filePaths.length && filePaths.length > 0) {
      setSelectedPaths(new Set());
    } else {
      setSelectedPaths(new Set(filePaths));
    }
  };

  const handleClearSelection = () => {
    setSelectedPaths(new Set());
    setLastSelectedIdx(null);
  };

  const handleInvertSelection = () => {
    const filePaths = displayedItems.filter((i) => !i.isFolder).map((i) => i.fullPath);
    const nextSet = new Set<string>();
    for (const p of filePaths) {
      if (!selectedPaths.has(p)) {
        nextSet.add(p);
      }
    }
    setSelectedPaths(nextSet);
  };

  // Batch move or copy selected items into target category
  const handleBatchMoveToCategory = async (targetCat: string, specificPaths?: string[], isCopy?: boolean) => {
    const paths = specificPaths && specificPaths.length > 0
      ? specificPaths
      : Array.from(selectedPaths);
    if (paths.length === 0) return;

    setIsBatchMoving(true);
    setErrorMsg('');
    const shouldCopy = isCopy !== undefined ? isCopy : dragActionMode === 'copy';
    try {
      let count = 0;
      for (const fromPath of paths) {
        const fileName = fromPath.split('/').pop() || '';
        const destination = targetCat ? `${targetCat}/${fileName}` : fileName;
        if (fromPath !== destination) {
          if (shouldCopy) {
            await mediaService.copyFile(fromPath, destination);
          } else {
            await mediaService.moveFile(fromPath, destination);
          }
          count++;
        }
      }
      const catName = categories.find((c) => c.id === targetCat)?.name || (targetCat ? targetCat : 'Thư mục gốc');
      setSuccessMsg(`Đã ${shouldCopy ? 'thêm (sao chép)' : 'chuyển'} ${count} ảnh vào danh mục "${catName}" thành công!`);
      setSelectedPaths(new Set());
      setDraggedPaths([]);
      setLastSelectedIdx(null);
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadMedia(currentFolder, true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi xử lý nhiều ảnh');
    } finally {
      setIsBatchMoving(false);
      setDragOverCategory(null);
    }
  };

  // Add or move items to multiple categories simultaneously
  const handleAssignToMultipleCategories = async () => {
    const paths = multiCategoryTargetPaths.length > 0 ? multiCategoryTargetPaths : Array.from(selectedPaths);
    if (paths.length === 0 || selectedTargetCategoryIds.size === 0) return;

    setIsAssigningCategories(true);
    setErrorMsg('');
    try {
      const targetCats = Array.from(selectedTargetCategoryIds);
      let count = 0;
      for (const targetCat of targetCats) {
        for (const fromPath of paths) {
          const fileName = fromPath.split('/').pop() || '';
          const destination = targetCat === 'uncategorized' ? fileName : `${targetCat}/${fileName}`;
          if (fromPath !== destination) {
            if (assignMode === 'copy') {
              await mediaService.copyFile(fromPath, destination);
            } else {
              await mediaService.moveFile(fromPath, destination);
            }
            count++;
          }
        }
      }
      setSuccessMsg(`Đã ${assignMode === 'copy' ? 'thêm' : 'chuyển'} ${paths.length} ảnh vào ${targetCats.length} danh mục thành công!`);
      setIsMultiCategoryModalOpen(false);
      setSelectedPaths(new Set());
      setMultiCategoryTargetPaths([]);
      setSelectedTargetCategoryIds(new Set());
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadMedia(currentFolder, true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi gán vào nhiều danh mục');
    } finally {
      setIsAssigningCategories(false);
    }
  };

  // Batch delete selected files
  const handleBatchDeleteSelected = async () => {
    const paths = Array.from(selectedPaths);
    if (paths.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${paths.length} ảnh đã chọn khỏi kho ảnh?`)) {
      return;
    }

    setIsBatchMoving(true);
    setErrorMsg('');
    try {
      for (const p of paths) {
        await mediaService.deleteFile(p);
      }
      setSuccessMsg(`Đã xóa ${paths.length} ảnh thành công!`);
      setSelectedPaths(new Set());
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadMedia(currentFolder, true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi xóa ảnh');
    } finally {
      setIsBatchMoving(false);
    }
  };

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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of allFiles) {
      if (f.isFolder) continue;
      const prefix = f.fullPath.includes('/') ? f.fullPath.split('/')[0] : '';
      if (!prefix) {
        counts['uncategorized'] = (counts['uncategorized'] || 0) + 1;
      } else {
        counts[prefix] = (counts[prefix] || 0) + 1;
      }
    }
    return counts;
  }, [allFiles]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const breadcrumbs = currentFolder ? currentFolder.split('/') : [];

  const handleCopyUrl = async (url: string) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 2000);
    } catch (err) {
      console.warn('Could not copy url:', err);
    }
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
          {/* Mouse Select Mode Toggle Button */}
          <button
            type="button"
            onClick={() => {
              const next = !isSelectMode;
              setIsSelectMode(next);
              if (!next) setSelectedPaths(new Set());
            }}
            className="btn btn-outline btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: isSelectMode ? '#766352' : '#ffffff',
              color: isSelectMode ? '#ffffff' : '#2c2825',
              borderColor: isSelectMode ? '#766352' : '#dcd3c5',
              fontWeight: 600,
            }}
            title="Bật/Tắt chế độ chọn ảnh nhanh chỉ bằng click chuột"
          >
            <CheckSquare size={16} />
            <span>{isSelectMode ? 'Đang chọn chuột' : 'Chế độ chọn'}</span>
            {selectedPaths.size > 0 && (
              <span
                style={{
                  backgroundColor: isSelectMode ? '#ffffff' : '#766352',
                  color: isSelectMode ? '#766352' : '#ffffff',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                {selectedPaths.size}
              </span>
            )}
          </button>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', maxWidth: '100%' }}>
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

      {/* Mobile-Only Horizontal Category Filter Pills */}
      <div className="media-mobile-category-bar">
        <button
          type="button"
          onClick={() => {
            setCategoryFilter('all');
            setViewScope('all_photos');
          }}
          className={`media-mobile-cat-pill ${categoryFilter === 'all' && viewScope === 'all_photos' ? 'active' : ''}`}
        >
          <span>Tất cả ({allFiles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCategoryFilter('uncategorized');
            setViewScope('all_photos');
          }}
          className={`media-mobile-cat-pill ${categoryFilter === 'uncategorized' ? 'active' : ''}`}
        >
          <span>Gốc ({categoryCounts['uncategorized'] || 0})</span>
        </button>

        {categories.map((c) => {
          const count = categoryCounts[c.id] || 0;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCategoryFilter(c.id);
                setViewScope('all_photos');
              }}
              className={`media-mobile-cat-pill ${categoryFilter === c.id ? 'active' : ''}`}
            >
              <span>{c.name} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* 2-Column Workspace: Left Sidebar (Categories & Drop Targets) + Right Content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isSidebarCollapsed ? '68px minmax(0, 1fr)' : '270px minmax(0, 1fr)',
          gap: isSidebarCollapsed ? '0.85rem' : '1.25rem',
          alignItems: 'start',
          transition: 'grid-template-columns 0.2s ease',
        }}
        className="media-library-layout"
      >
        {/* Left Sidebar: Categories & Drop Targets (Pinned Sticky) */}
        <aside
          style={{
            position: 'sticky',
            top: '72px',
            maxHeight: 'calc(100vh - 88px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            scrollbarWidth: 'thin',
            zIndex: 20,
          }}
        >
          {/* Categories Drop Target Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e8e1d5',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            {isSidebarCollapsed ? (
              /* ================= Collapsed Mini Mode ================= */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Expand Toggle Button */}
                <button
                  type="button"
                  onClick={toggleSidebarCollapsed}
                  title="Mở rộng menu danh mục"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.2rem',
                    backgroundColor: '#faf8f5',
                    border: 'none',
                    borderBottom: '1px solid #f0eae1',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    color: '#766352',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f2eee6')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#faf8f5')}
                >
                  <ChevronRight size={18} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Mở rộng</span>
                </button>

                {/* Collapsed Target List */}
                <div style={{ padding: '0.4rem 0.2rem', display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
                  {/* All Photos */}
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter('all');
                      setViewScope('all_photos');
                    }}
                    title={`Tất cả ảnh (${allFiles.length})`}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.15rem',
                      borderRadius: '6px',
                      border: categoryFilter === 'all' && viewScope === 'all_photos' ? '1px solid #766352' : '1px solid transparent',
                      backgroundColor: categoryFilter === 'all' && viewScope === 'all_photos' ? '#766352' : 'transparent',
                      color: categoryFilter === 'all' && viewScope === 'all_photos' ? '#ffffff' : '#2c2825',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      position: 'relative',
                    }}
                  >
                    <FileImage size={17} color={categoryFilter === 'all' && viewScope === 'all_photos' ? '#ffffff' : '#766352'} />
                    <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>Tất cả</span>
                    <span
                      style={{
                        position: 'absolute',
                        top: '1px',
                        right: '2px',
                        fontSize: '0.55rem',
                        padding: '0 3px',
                        borderRadius: '6px',
                        backgroundColor: categoryFilter === 'all' && viewScope === 'all_photos' ? 'rgba(255,255,255,0.3)' : '#f0eae1',
                        color: categoryFilter === 'all' && viewScope === 'all_photos' ? '#ffffff' : '#685e54',
                        fontWeight: 700,
                      }}
                    >
                      {allFiles.length}
                    </span>
                  </button>

                  {/* Folder Tree View */}
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter('all');
                      setViewScope('current_folder');
                    }}
                    title="Xem theo Thư mục"
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.15rem',
                      borderRadius: '6px',
                      border: categoryFilter === 'all' && viewScope === 'current_folder' ? '1px solid #766352' : '1px solid transparent',
                      backgroundColor: categoryFilter === 'all' && viewScope === 'current_folder' ? '#766352' : 'transparent',
                      color: categoryFilter === 'all' && viewScope === 'current_folder' ? '#ffffff' : '#2c2825',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <Folder size={17} color={categoryFilter === 'all' && viewScope === 'current_folder' ? '#ffffff' : '#766352'} />
                    <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>Thư mục</span>
                  </button>

                  {/* Uncategorized Drop Target */}
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter('uncategorized');
                      setViewScope('all_photos');
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverCategory('uncategorized');
                    }}
                    onDragLeave={() => setDragOverCategory(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      let pathsToMove = draggedPaths;
                      try {
                        const raw = e.dataTransfer.getData('text/plain');
                        if (raw) {
                          const parsed = JSON.parse(raw);
                          if (Array.isArray(parsed) && parsed.length > 0) {
                            pathsToMove = parsed;
                          } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.paths)) {
                            pathsToMove = parsed.paths;
                          }
                        }
                      } catch (err) {
                        console.warn(err);
                      }
                      const isCopy = e.altKey || dragActionMode === 'copy';
                      handleBatchMoveToCategory('', pathsToMove, isCopy);
                    }}
                    title={`Chưa phân loại (${categoryCounts['uncategorized'] || 0} ảnh) - Kéo thả ảnh/folder vào đây`}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.15rem',
                      borderRadius: '6px',
                      border: dragOverCategory === 'uncategorized'
                        ? '2px solid #b78103'
                        : categoryFilter === 'uncategorized'
                        ? '1px solid #766352'
                        : '1px solid transparent',
                      backgroundColor: dragOverCategory === 'uncategorized'
                        ? '#fff9db'
                        : categoryFilter === 'uncategorized'
                        ? '#766352'
                        : 'transparent',
                      color: dragOverCategory === 'uncategorized'
                        ? '#7a4b00'
                        : categoryFilter === 'uncategorized'
                        ? '#ffffff'
                        : '#2c2825',
                      boxShadow: dragOverCategory === 'uncategorized'
                        ? '0 0 0 3px rgba(183, 129, 3, 0.35), 0 4px 12px rgba(183, 129, 3, 0.25)'
                        : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      position: 'relative',
                      transform: dragOverCategory === 'uncategorized' ? 'scale(1.12)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', lineHeight: 1 }}>⚪</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>Gốc</span>
                    <span
                      style={{
                        position: 'absolute',
                        top: '1px',
                        right: '2px',
                        fontSize: '0.55rem',
                        padding: '0 3px',
                        borderRadius: '6px',
                        backgroundColor: categoryFilter === 'uncategorized' && dragOverCategory !== 'uncategorized' ? 'rgba(255,255,255,0.3)' : '#f0eae1',
                        color: categoryFilter === 'uncategorized' && dragOverCategory !== 'uncategorized' ? '#ffffff' : '#685e54',
                        fontWeight: 700,
                      }}
                    >
                      {categoryCounts['uncategorized'] || 0}
                    </span>
                  </button>

                  <div style={{ height: '1px', backgroundColor: '#f0eae1', margin: '2px 0' }} />

                  {/* Categories Drop Targets */}
                  {categories.map((c) => {
                    const isSelected = categoryFilter === c.id;
                    const isDragTarget = dragOverCategory === c.id;
                    const count = categoryCounts[c.id] || 0;
                    const shortName = c.name.length > 5 ? c.name.slice(0, 4) + '..' : c.name;

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCategoryFilter(c.id);
                          setViewScope('all_photos');
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverCategory(c.id);
                        }}
                        onDragLeave={() => setDragOverCategory(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          let pathsToMove = draggedPaths;
                          try {
                            const raw = e.dataTransfer.getData('text/plain');
                            if (raw) {
                              const parsed = JSON.parse(raw);
                              if (Array.isArray(parsed) && parsed.length > 0) {
                                pathsToMove = parsed;
                              } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.paths)) {
                                pathsToMove = parsed.paths;
                              }
                            }
                          } catch (err) {
                            console.warn(err);
                          }
                          const isCopy = e.altKey || dragActionMode === 'copy';
                          handleBatchMoveToCategory(c.id, pathsToMove, isCopy);
                        }}
                        title={`Danh mục: ${c.name} (${count} ảnh) - Kéo thả ảnh/folder vào đây để ${dragActionMode === 'copy' ? 'thêm' : 'chuyển'}`}
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.15rem',
                          borderRadius: '6px',
                          border: isDragTarget
                            ? '2px solid #b78103'
                            : isSelected
                            ? '1px solid #766352'
                            : '1px solid transparent',
                          backgroundColor: isDragTarget
                            ? '#fff9db'
                            : isSelected
                            ? '#766352'
                            : 'transparent',
                          color: isDragTarget
                            ? '#7a4b00'
                            : isSelected
                            ? '#ffffff'
                            : '#2c2825',
                          boxShadow: isDragTarget
                            ? '0 0 0 3px rgba(183, 129, 3, 0.35), 0 4px 12px rgba(183, 129, 3, 0.25)'
                            : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          position: 'relative',
                          transform: isDragTarget ? 'scale(1.12)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Folder size={16} color={isDragTarget ? '#b78103' : isSelected ? '#ffffff' : '#766352'} />
                        <span
                          style={{
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '56px',
                          }}
                        >
                          {shortName}
                        </span>
                        <span
                          style={{
                            position: 'absolute',
                            top: '1px',
                            right: '2px',
                            fontSize: '0.55rem',
                            padding: '0 3px',
                            borderRadius: '6px',
                            backgroundColor: isSelected && !isDragTarget ? 'rgba(255,255,255,0.3)' : '#f0eae1',
                            color: isSelected && !isDragTarget ? '#ffffff' : '#685e54',
                            fontWeight: 700,
                          }}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ================= Expanded Mode ================= */
              <div>
                {/* Header with Title & Collapse Button */}
                <div
                  style={{
                    padding: '0.75rem 0.85rem',
                    backgroundColor: '#faf8f5',
                    borderBottom: '1px solid #f0eae1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#2c2825',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Filter size={14} color="#766352" />
                    <span>Danh mục</span>
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.725rem', color: '#9e9387', fontWeight: 600 }}>
                      {allFiles.length} ảnh
                    </span>
                    <button
                      type="button"
                      onClick={toggleSidebarCollapsed}
                      title="Thu nhỏ thanh danh mục (Ghim & tiết kiệm diện tích)"
                      style={{
                        border: '1px solid #e0d7c9',
                        background: '#ffffff',
                        borderRadius: '5px',
                        padding: '2px 6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        color: '#685e54',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f4ee')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    >
                      <ChevronLeft size={13} />
                      <span>Thu gọn</span>
                    </button>
                  </div>
                </div>

                {/* Drag Drop Hint & Move / Copy Mode Switcher */}
                <div style={{ padding: '0.55rem 0.85rem', backgroundColor: '#fffdf6', borderBottom: '1px solid #f9edd7', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.725rem', color: '#8c6820', fontWeight: 700 }}>Thao tác kéo thả:</span>
                    <div style={{ display: 'flex', backgroundColor: '#eee7db', borderRadius: '14px', padding: '1px' }}>
                      <button
                        type="button"
                        onClick={() => setDragActionMode('move')}
                        style={{
                          border: 'none',
                          borderRadius: '12px',
                          padding: '2px 8px',
                          fontSize: '0.675rem',
                          fontWeight: dragActionMode === 'move' ? 700 : 500,
                          backgroundColor: dragActionMode === 'move' ? '#766352' : 'transparent',
                          color: dragActionMode === 'move' ? '#ffffff' : '#685e54',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        title="Di chuyển ảnh hoặc folder sang danh mục mới (xóa ở vị trí cũ)"
                      >
                        Chuyển
                      </button>
                      <button
                        type="button"
                        onClick={() => setDragActionMode('copy')}
                        style={{
                          border: 'none',
                          borderRadius: '12px',
                          padding: '2px 8px',
                          fontSize: '0.675rem',
                          fontWeight: dragActionMode === 'copy' ? 700 : 500,
                          backgroundColor: dragActionMode === 'copy' ? '#b78103' : 'transparent',
                          color: dragActionMode === 'copy' ? '#ffffff' : '#685e54',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        title="Thêm ảnh/folder vào danh mục mới mà không xóa ở vị trí cũ"
                      >
                        Thêm (Copy)
                      </button>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#8c6820', lineHeight: 1.35 }}>
                    {dragActionMode === 'copy' ? '✨ Chế độ THÊM: Kéo ảnh hoặc folder để nhân bản vào danh mục' : '💡 Chế độ CHUYỂN: Kéo ảnh hoặc cả folder để di chuyển sang danh mục'}
                  </span>
                </div>

                {/* Target List */}
                <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {/* All Photos */}
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter('all');
                      setViewScope('all_photos');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: categoryFilter === 'all' && viewScope === 'all_photos' ? '1px solid #766352' : '1px solid transparent',
                      backgroundColor: categoryFilter === 'all' && viewScope === 'all_photos' ? '#766352' : 'transparent',
                      color: categoryFilter === 'all' && viewScope === 'all_photos' ? '#ffffff' : '#2c2825',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileImage size={16} color={categoryFilter === 'all' && viewScope === 'all_photos' ? '#ffffff' : '#766352'} />
                      <span>Tất cả ảnh</span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.725rem',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        backgroundColor: categoryFilter === 'all' && viewScope === 'all_photos' ? 'rgba(255,255,255,0.25)' : '#f0eae1',
                        color: categoryFilter === 'all' && viewScope === 'all_photos' ? '#ffffff' : '#685e54',
                      }}
                    >
                      {allFiles.length}
                    </span>
                  </button>

                  {/* Folder Tree View */}
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter('all');
                      setViewScope('current_folder');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: categoryFilter === 'all' && viewScope === 'current_folder' ? '1px solid #766352' : '1px solid transparent',
                      backgroundColor: categoryFilter === 'all' && viewScope === 'current_folder' ? '#766352' : 'transparent',
                      color: categoryFilter === 'all' && viewScope === 'current_folder' ? '#ffffff' : '#2c2825',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Folder size={16} color={categoryFilter === 'all' && viewScope === 'current_folder' ? '#ffffff' : '#766352'} />
                      <span>Xem theo Thư mục</span>
                    </div>
                  </button>

                  {/* Uncategorized Drop Target */}
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter('uncategorized');
                      setViewScope('all_photos');
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverCategory('uncategorized');
                    }}
                    onDragLeave={() => setDragOverCategory(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      let pathsToMove = draggedPaths;
                      try {
                        const raw = e.dataTransfer.getData('text/plain');
                        if (raw) {
                          const parsed = JSON.parse(raw);
                          if (Array.isArray(parsed) && parsed.length > 0) {
                            pathsToMove = parsed;
                          } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.paths)) {
                            pathsToMove = parsed.paths;
                          }
                        }
                      } catch (err) {
                        console.warn(err);
                      }
                      const isCopy = e.altKey || dragActionMode === 'copy';
                      handleBatchMoveToCategory('', pathsToMove, isCopy);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: dragOverCategory === 'uncategorized'
                        ? '2px solid #b78103'
                        : categoryFilter === 'uncategorized'
                        ? '1px solid #766352'
                        : '1px solid transparent',
                      backgroundColor: dragOverCategory === 'uncategorized'
                        ? '#fff9db'
                        : categoryFilter === 'uncategorized'
                        ? '#766352'
                        : 'transparent',
                      color: dragOverCategory === 'uncategorized'
                        ? '#7a4b00'
                        : categoryFilter === 'uncategorized'
                        ? '#ffffff'
                        : '#2c2825',
                      boxShadow: dragOverCategory === 'uncategorized'
                        ? '0 0 0 3px rgba(183, 129, 3, 0.35), 0 4px 14px rgba(183, 129, 3, 0.25)'
                        : 'none',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transform: dragOverCategory === 'uncategorized' ? 'scale(1.02)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                    title="Thả ảnh hoặc folder vào đây để về Thư mục gốc (Chưa phân loại)"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>⚪</span>
                      <span>
                        {dragOverCategory === 'uncategorized'
                          ? (dragActionMode === 'copy' ? '➕ Thêm về Thư mục gốc' : '👉 Chuyển về Thư mục gốc')
                          : 'Chưa phân loại'}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.725rem',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        backgroundColor: categoryFilter === 'uncategorized' && dragOverCategory !== 'uncategorized' ? 'rgba(255,255,255,0.25)' : '#f0eae1',
                        color: categoryFilter === 'uncategorized' && dragOverCategory !== 'uncategorized' ? '#ffffff' : '#685e54',
                      }}
                    >
                      {categoryCounts['uncategorized'] || 0}
                    </span>
                  </button>

                  <div style={{ height: '1px', backgroundColor: '#f0eae1', margin: '4px 0' }} />

                  {/* Category Drop Targets */}
                  {categories.map((c) => {
                    const isSelected = categoryFilter === c.id;
                    const isDragTarget = dragOverCategory === c.id;
                    const count = categoryCounts[c.id] || 0;

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCategoryFilter(c.id);
                          setViewScope('all_photos');
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverCategory(c.id);
                        }}
                        onDragLeave={() => setDragOverCategory(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          let pathsToMove = draggedPaths;
                          try {
                            const raw = e.dataTransfer.getData('text/plain');
                            if (raw) {
                              const parsed = JSON.parse(raw);
                              if (Array.isArray(parsed) && parsed.length > 0) {
                                pathsToMove = parsed;
                              } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.paths)) {
                                pathsToMove = parsed.paths;
                              }
                            }
                          } catch (err) {
                            console.warn(err);
                          }
                          const isCopy = e.altKey || dragActionMode === 'copy';
                          handleBatchMoveToCategory(c.id, pathsToMove, isCopy);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.55rem 0.75rem',
                          borderRadius: '6px',
                          border: isDragTarget
                            ? '2px solid #b78103'
                            : isSelected
                            ? '1px solid #766352'
                            : '1px solid transparent',
                          backgroundColor: isDragTarget
                            ? '#fff9db'
                            : isSelected
                            ? '#766352'
                            : 'transparent',
                          color: isDragTarget
                            ? '#7a4b00'
                            : isSelected
                            ? '#ffffff'
                            : '#2c2825',
                          boxShadow: isDragTarget
                            ? '0 0 0 3px rgba(183, 129, 3, 0.35), 0 4px 14px rgba(183, 129, 3, 0.25)'
                            : 'none',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transform: isDragTarget ? 'scale(1.02)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                        title={`Thả ảnh hoặc folder vào đây để ${dragActionMode === 'copy' ? 'thêm vào' : 'chuyển sang'} danh mục "${c.name}"`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                          <Folder size={15} color={isDragTarget ? '#b78103' : isSelected ? '#ffffff' : '#766352'} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {isDragTarget
                              ? (dragActionMode === 'copy' ? `➕ Thêm vào ${c.name}` : `👉 Chuyển vào ${c.name}`)
                              : c.name}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.725rem',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            backgroundColor: isSelected && !isDragTarget ? 'rgba(255,255,255,0.25)' : '#f0eae1',
                            color: isSelected && !isDragTarget ? '#ffffff' : '#685e54',
                          }}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Product Filter Card (Collapsed) */}
          {products.length > 0 && isSidebarCollapsed && (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e8e1d5',
                borderRadius: '10px',
                padding: '0.45rem 0.2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                title={
                  productFilter !== 'all'
                    ? `Đang lọc: ${products.find((p) => p.id === productFilter)?.name || productFilter}. Bấm để xem/đổi`
                    : 'Lọc theo Sản phẩm (Bấm để mở)'
                }
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  color: productFilter !== 'all' ? '#b78103' : '#766352',
                  padding: '4px 2px',
                  width: '100%',
                }}
              >
                <Package size={17} />
                <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>Sản phẩm</span>
                {productFilter !== 'all' && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#b78103',
                    }}
                  />
                )}
              </button>
            </div>
          )}

          {/* Product Filter Card (Expanded) */}
          {products.length > 0 && !isSidebarCollapsed && (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e8e1d5',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2c2825', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Package size={14} color="#766352" />
                  <span>Lọc theo Sản phẩm</span>
                </span>
                {productFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setProductFilter('all')}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#c62828',
                      fontSize: '0.725rem',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Xóa lọc
                  </button>
                )}
              </div>

              <select
                value={productFilter}
                onChange={(e) => {
                  setProductFilter(e.target.value);
                  setViewScope('all_photos');
                }}
                className="form-select"
                style={{
                  width: '100%',
                  fontSize: '0.775rem',
                  padding: '0.4rem 0.5rem',
                  backgroundColor: productFilter !== 'all' ? '#fdfbf7' : '#ffffff',
                  borderColor: productFilter !== 'all' ? '#766352' : '#dcd3c5',
                }}
              >
                <option value="all">Tất cả sản phẩm ({products.length})</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.id}] {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </aside>

        {/* Right Main Content */}
        <main style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Navigation Bar & Search */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e8e1d5',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            {/* Breadcrumbs or Category Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              {isSidebarCollapsed && (
                <button
                  type="button"
                  onClick={toggleSidebarCollapsed}
                  className="btn btn-outline btn-sm"
                  style={{
                    padding: '0.2rem 0.55rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    borderColor: '#dcd3c5',
                    backgroundColor: '#faf8f5',
                    color: '#766352',
                    fontWeight: 600,
                  }}
                  title="Mở rộng menu danh mục bên trái"
                >
                  <ChevronRight size={14} />
                  <span>Mở danh mục</span>
                </button>
              )}

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
                <div style={{ fontSize: '0.85rem', color: '#685e54', fontWeight: 500 }}>
                  Đang xem:{' '}
                  <strong style={{ color: '#2c2825' }}>
                    {categoryFilter === 'all'
                      ? 'Tất cả ảnh'
                      : categoryFilter === 'uncategorized'
                      ? 'Chưa phân loại'
                      : categories.find((c) => c.id === categoryFilter)?.name || categoryFilter}
                  </strong>{' '}
                  <span style={{ color: '#9e9387' }}>({displayedItems.length} ảnh)</span>
                </div>
              )}
            </div>

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

          {/* Mouse Select Mode Toolbar (Visible when isSelectMode is active) */}
          {isSelectMode && (
            <div
              style={{
                backgroundColor: '#f8f4ec',
                border: '1.5px solid #d4a373',
                borderRadius: '8px',
                padding: '0.65rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span
                  style={{
                    backgroundColor: '#766352',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                  }}
                >
                  CHẾ ĐỘ CHỌN CHUỘT
                </span>
                <span style={{ fontSize: '0.8rem', color: '#4a3f35', fontWeight: 500 }}>
                  Click chuột trực tiếp vào ảnh bất kỳ để chọn • Đã chọn: <strong>{selectedPaths.size}</strong> ảnh
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', backgroundColor: '#ffffff' }}
                >
                  {selectedPaths.size === displayedItems.filter((i) => !i.isFolder).length
                    ? 'Bỏ chọn hết'
                    : `Chọn tất cả (${displayedItems.filter((i) => !i.isFolder).length})`}
                </button>

                <button
                  type="button"
                  onClick={handleInvertSelection}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', backgroundColor: '#ffffff' }}
                  title="Đảo ngược các ảnh được chọn và chưa chọn"
                >
                  Đảo ngược
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSelectMode(false);
                    setSelectedPaths(new Set());
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', color: '#c62828', borderColor: '#f8d7da', backgroundColor: '#ffffff' }}
                >
                  <X size={13} style={{ marginRight: '2px' }} />
                  Tắt chế độ chọn
                </button>
              </div>
            </div>
          )}

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
                className="media-photo-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                {displayedItems.map((item, idx) => {
                  if (item.isFolder) {
                    return (
                      <div
                        key={item.name}
                        draggable
                        onDragStart={(e) => {
                          const folderPath = currentFolder ? `${currentFolder}/${item.name}` : item.name;
                          const folderFiles = allFiles.filter(
                            (f) => !f.isFolder && (f.fullPath === folderPath || f.fullPath.startsWith(`${folderPath}/`))
                          );
                          const paths = folderFiles.map((f) => f.fullPath);
                          setDraggedPaths(paths);
                          e.dataTransfer.setData(
                            'text/plain',
                            JSON.stringify({ type: 'folder', folderName: item.name, paths })
                          );

                          const ghost = createDragGhost(undefined, paths.length, `📁 ${item.name}`);
                          e.dataTransfer.setDragImage(ghost, 15, 17);
                          setTimeout(() => {
                            if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
                          }, 0);
                        }}
                        onDragEnd={() => {
                          setDraggedPaths([]);
                          setDragOverCategory(null);
                        }}
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
                        title={`Thư mục "${item.name}" - Bấm để mở, hoặc Kéo thả vào danh mục bên trái để chuyển toàn bộ ảnh`}
                      >
                        <Folder size={44} color="#bfa382" style={{ marginBottom: '0.5rem' }} />
                        <span
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#2c2825',
                            textAlign: 'center',
                            wordBreak: 'break-word',
                          }}
                        >
                          {item.name}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#9e9387', marginTop: '2px' }}>
                          Thư mục (Kéo thả được)
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
                  const isSelected = selectedPaths.has(item.fullPath);

                  // Image item card
                  return (
                    <div
                      key={item.fullPath}
                      draggable
                      onDragStart={(e) => {
                        const toDrag = selectedPaths.has(item.fullPath) && selectedPaths.size > 0
                          ? Array.from(selectedPaths)
                          : [item.fullPath];
                        setDraggedPaths(toDrag);
                        e.dataTransfer.setData('text/plain', JSON.stringify(toDrag));

                        const ghost = createDragGhost(item.publicUrl, toDrag.length, item.name);
                        e.dataTransfer.setDragImage(ghost, 15, 17);
                        setTimeout(() => {
                          if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
                        }, 0);
                      }}
                      onDragEnd={() => {
                        setDraggedPaths([]);
                        setDragOverCategory(null);
                      }}
                      onClick={(e) => {
                        if (isSelectMode) {
                          handleItemSelect(item, idx, e);
                        }
                      }}
                      style={{
                        backgroundColor: '#ffffff',
                        border: isSelected
                          ? '2.5px solid #766352'
                          : isSelectMode
                          ? '1.5px dashed #c4b5a2'
                          : '1px solid #e8e1d5',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: isSelected
                          ? '0 0 0 3px rgba(118, 99, 82, 0.25)'
                          : '0 1px 3px rgba(0,0,0,0.04)',
                        position: 'relative',
                        cursor: isSelectMode ? 'pointer' : 'grab',
                        transition: 'all 0.15s ease',
                        transform: isSelected ? 'scale(0.98)' : 'scale(1)',
                      }}
                    >
                      {/* Selection Checkbox */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemSelect(item, idx, e);
                        }}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          zIndex: 3,
                          backgroundColor: isSelected
                            ? '#766352'
                            : isSelectMode
                            ? 'rgba(255,255,255,0.95)'
                            : 'rgba(255,255,255,0.85)',
                          color: isSelected ? '#ffffff' : '#685e54',
                          borderRadius: '5px',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          border: isSelected ? '1px solid #766352' : '1px solid #bdafa0',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                          transition: 'all 0.15s ease',
                        }}
                        title={isSelectMode ? 'Click để chọn/bỏ chọn' : 'Chọn ảnh (Giữ Shift để chọn khoảng, hoặc kéo vào danh mục bên trái)'}
                      >
                        {isSelected ? <Check size={16} strokeWidth={3} /> : isSelectMode ? <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dcd3c5' }} /> : null}
                      </div>

                      {/* Thumbnail */}
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          paddingTop: '85%',
                          backgroundColor: '#f3eee6',
                          overflow: 'hidden',
                          cursor: isSelectMode ? 'pointer' : 'pointer',
                        }}
                        onClick={(e) => {
                          if (isSelectMode) {
                            e.stopPropagation();
                            handleItemSelect(item, idx, e);
                          } else if (e.shiftKey) {
                            handleItemSelect(item, idx, e);
                          } else {
                            setPreviewItem(item);
                          }
                        }}
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
                              right: '6px',
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
                      <div style={{ padding: '0.55rem 0.7rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                          padding: '0.35rem 0.55rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: '#faf8f5',
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(item.publicUrl || '');
                          }}
                          className="btn btn-outline btn-sm"
                          style={{
                            padding: '0.2rem 0.45rem',
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setMultiCategoryTargetPaths([item.fullPath]);
                              setSelectedTargetCategoryIds(new Set());
                              setAssignMode('copy');
                              setIsMultiCategoryModalOpen(true);
                            }}
                            style={{
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              color: '#b78103',
                              padding: '3px',
                            }}
                            title="Thêm ảnh này vào nhiều danh mục..."
                          >
                            <FolderPlus size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToDelete(item);
                            }}
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
        </main>
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

      {/* Floating Batch Actions Bar */}
      {selectedPaths.size > 0 && (
        <div className="media-batch-bar">
          <div className="media-batch-bar-header">
            <span className="media-batch-count">
              <CheckSquare size={16} color="#d4a373" />
              <span>Đã chọn <strong>{selectedPaths.size}</strong> ảnh</span>
            </span>

            <div className="media-batch-top-actions">
              <button
                type="button"
                onClick={handleSelectAll}
                className="media-batch-btn media-batch-btn-subtle"
              >
                {selectedPaths.size === displayedItems.filter((i) => !i.isFolder).length
                  ? 'Bỏ chọn'
                  : 'Chọn tất cả'}
              </button>

              <button
                type="button"
                onClick={handleBatchDeleteSelected}
                disabled={isBatchMoving}
                className="media-batch-btn media-batch-btn-danger"
                title="Xóa các ảnh đã chọn"
              >
                <Trash2 size={13} />
                <span>Xóa</span>
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                className="media-batch-close-btn"
                title="Đóng / Bỏ chọn"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="media-batch-bar-actions">
            {/* Multi-Category Assign Button */}
            <button
              type="button"
              onClick={() => {
                setMultiCategoryTargetPaths(Array.from(selectedPaths));
                setSelectedTargetCategoryIds(new Set());
                setAssignMode('copy');
                setIsMultiCategoryModalOpen(true);
              }}
              disabled={isBatchMoving}
              className="media-batch-btn media-batch-btn-gold"
              title="Thêm các ảnh đã chọn vào một hoặc nhiều danh mục"
            >
              <FolderPlus size={14} />
              <span>Gán danh mục...</span>
            </button>

            {/* Batch move dropdown */}
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value !== '') {
                  handleBatchMoveToCategory(e.target.value === '__ROOT__' ? '' : e.target.value);
                  e.target.value = '';
                }
              }}
              disabled={isBatchMoving}
              className="media-batch-select"
            >
              <option value="" disabled>
                {isBatchMoving ? 'Đang chuyển...' : 'Chuyển danh mục ▾'}
              </option>
              <option value="__ROOT__">Gốc (Chưa phân loại)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Multi-Category Assignment Modal */}
      {isMultiCategoryModalOpen &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '1rem',
            }}
            onClick={() => {
              if (!isAssigningCategories) setIsMultiCategoryModalOpen(false);
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '520px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid #e8e1d5',
                  backgroundColor: '#faf8f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={20} color="#b78103" />
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#2c2825' }}>
                      Thêm vào nhiều danh mục
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#685e54', margin: '2px 0 0' }}>
                      Đang chọn{' '}
                      <strong>
                        {multiCategoryTargetPaths.length > 0
                          ? multiCategoryTargetPaths.length
                          : selectedPaths.size}
                      </strong>{' '}
                      ảnh để gán danh mục
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMultiCategoryModalOpen(false)}
                  disabled={isAssigningCategories}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#8c8277',
                    padding: '4px',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Mode Selector: Copy vs Move */}
                <div style={{ backgroundColor: '#fdfbf7', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '0.75rem' }}>
                  <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#2c2825', display: 'block', marginBottom: '0.4rem' }}>
                    Hình thức gán danh mục:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                      <input
                        type="radio"
                        name="assignMode"
                        checked={assignMode === 'copy'}
                        onChange={() => setAssignMode('copy')}
                        style={{ marginTop: '3px' }}
                      />
                      <div>
                        <strong style={{ color: '#2c2825' }}>Thêm vào danh mục (Sao chép bản gốc)</strong>
                        <div style={{ fontSize: '0.725rem', color: '#685e54' }}>
                          Ảnh sẽ được nhân bản thêm vào các danh mục đã chọn và vẫn được giữ nguyên ở vị trí cũ.
                        </div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                      <input
                        type="radio"
                        name="assignMode"
                        checked={assignMode === 'move'}
                        onChange={() => setAssignMode('move')}
                        style={{ marginTop: '3px' }}
                      />
                      <div>
                        <strong style={{ color: '#2c2825' }}>Di chuyển hẳn (Chuyển thư mục)</strong>
                        <div style={{ fontSize: '0.725rem', color: '#685e54' }}>
                          Ảnh sẽ được chuyển sang các danh mục mới và xóa khỏi vị trí cũ.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Categories Checklist */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2c2825' }}>
                      Chọn các danh mục muốn thêm ảnh vào ({selectedTargetCategoryIds.size}/{categories.length}):
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedTargetCategoryIds(new Set(categories.map((c) => c.id)))}
                        style={{ background: 'none', border: 'none', color: '#766352', fontSize: '0.725rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Chọn hết
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTargetCategoryIds(new Set())}
                        style={{ background: 'none', border: 'none', color: '#c62828', fontSize: '0.725rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>

                  {categories.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#faf8f5', borderRadius: '8px', border: '1px dashed #dcd3c5' }}>
                      <p style={{ margin: 0, fontSize: '0.825rem', color: '#685e54' }}>
                        Hiện chưa có danh mục nào trong hệ thống.
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#9e9387' }}>
                        Vui lòng vào mục "Quản lý danh mục" để tạo danh mục mới trước.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                      {categories.map((c) => {
                        const isChecked = selectedTargetCategoryIds.has(c.id);
                        const count = categoryCounts[c.id] || 0;
                        return (
                          <label
                            key={c.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '6px',
                              border: isChecked ? '1px solid #766352' : '1px solid #e8e1d5',
                              backgroundColor: isChecked ? '#f7f4ee' : '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const next = new Set(selectedTargetCategoryIds);
                                  if (e.target.checked) {
                                    next.add(c.id);
                                  } else {
                                    next.delete(c.id);
                                  }
                                  setSelectedTargetCategoryIds(next);
                                }}
                              />
                              <Folder size={15} color="#766352" />
                              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#2c2825' }}>
                                {c.name}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.725rem', color: '#9e9387' }}>
                              {count} ảnh hiện có
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: '0.75rem 1.25rem',
                  borderTop: '1px solid #e8e1d5',
                  backgroundColor: '#faf8f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsMultiCategoryModalOpen(false)}
                  disabled={isAssigningCategories}
                  className="btn btn-outline btn-sm"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleAssignToMultipleCategories}
                  disabled={isAssigningCategories || selectedTargetCategoryIds.size === 0}
                  className="btn btn-primary btn-sm"
                  style={{
                    backgroundColor: '#b78103',
                    borderColor: '#b78103',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  {isAssigningCategories ? <RefreshCw size={14} className="spin" /> : <Check size={14} />}
                  <span>
                    {isAssigningCategories
                      ? 'Đang xử lý...'
                      : `Thực hiện (${assignMode === 'copy' ? 'Thêm vào' : 'Chuyển vào'} ${selectedTargetCategoryIds.size} danh mục)`}
                  </span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      <style>{`
        .media-photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 0.85rem;
        }

        .media-mobile-category-bar {
          display: none;
        }

        /* Floating Batch Bar Desktop Styles */
        .media-batch-bar {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          background-color: #221e1a;
          color: #ffffff;
          border-radius: 50px;
          padding: 0.55rem 1.15rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
          z-index: 9999;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-sizing: border-box;
          max-width: 92vw;
        }

        .media-batch-bar-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .media-batch-count {
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          white-space: nowrap;
        }

        .media-batch-top-actions {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .media-batch-bar-actions {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-shrink: 0;
        }

        .media-batch-btn {
          border: none;
          border-radius: 20px;
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .media-batch-btn-subtle {
          background-color: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }

        .media-batch-btn-subtle:hover {
          background-color: rgba(255, 255, 255, 0.25);
        }

        .media-batch-btn-gold {
          background-color: #b78103;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(183, 129, 3, 0.35);
        }

        .media-batch-btn-gold:hover {
          background-color: #966902;
        }

        .media-batch-btn-danger {
          background-color: #dc2626;
          color: #ffffff;
        }

        .media-batch-btn-danger:hover {
          background-color: #b91c1c;
        }

        .media-batch-close-btn {
          background: transparent;
          border: none;
          color: #cbd5e1;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.15s ease;
        }

        .media-batch-close-btn:hover {
          color: #ffffff;
          background-color: rgba(255, 255, 255, 0.15);
        }

        .media-batch-select {
          background-color: #ffffff;
          color: #2c2825;
          border-radius: 20px;
          border: none;
          padding: 0.35rem 0.65rem;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          outline: none;
          height: 29px;
          white-space: nowrap;
        }

        @media (max-width: 900px) {
          .media-mobile-category-bar {
            display: flex;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            gap: 0.5rem;
            padding: 0.25rem 0.2rem 0.6rem;
            margin-bottom: 0.5rem;
            scrollbar-width: none;
            width: 100%;
            box-sizing: border-box;
          }
          .media-mobile-category-bar::-webkit-scrollbar {
            display: none;
          }
          .media-mobile-cat-pill {
            flex-shrink: 0;
            padding: 0.4rem 0.85rem;
            border-radius: 20px;
            border: 1px solid #dcd3c5;
            background-color: #ffffff;
            color: #4a3f35;
            font-size: 0.775rem;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.15s ease;
          }
          .media-mobile-cat-pill.active {
            background-color: #766352;
            color: #ffffff;
            border-color: #766352;
            box-shadow: 0 2px 6px rgba(118, 99, 82, 0.25);
          }

          .media-library-layout {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            min-width: 0 !important;
            gap: 0.85rem !important;
          }
          .media-library-layout aside {
            display: none !important;
          }
          .media-library-layout main {
            width: 100% !important;
            min-width: 0 !important;
          }

          /* Floating Batch Bar Mobile Layout */
          .media-batch-bar {
            bottom: calc(58px + env(safe-area-inset-bottom, 0px) + 8px) !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: calc(100% - 1rem) !important;
            max-width: 440px !important;
            border-radius: 14px !important;
            padding: 0.65rem 0.75rem !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.5rem !important;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
            overflow: hidden !important;
          }

          .media-batch-bar-header {
            width: 100% !important;
            justify-content: space-between !important;
          }

          .media-batch-count {
            font-size: 0.8rem !important;
          }

          .media-batch-bar-actions {
            width: 100% !important;
            display: flex !important;
            gap: 0.4rem !important;
          }

          .media-batch-bar-actions .media-batch-btn-gold,
          .media-batch-bar-actions .media-batch-select {
            flex: 1 1 50% !important;
            min-width: 0 !important;
            max-width: 50% !important;
            justify-content: center !important;
            text-align: center !important;
            padding: 0.45rem 0.35rem !important;
            font-size: 0.75rem !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            box-sizing: border-box !important;
          }
        }

        @media (max-width: 600px) {
          .media-photo-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};
