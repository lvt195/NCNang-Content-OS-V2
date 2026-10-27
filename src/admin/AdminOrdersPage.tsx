import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Search,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Edit2,
  Trash2,
  AlertCircle,
  RotateCcw,
  Globe,
  ClipboardPaste,
  Folder,
  FolderOpen,
  ArrowLeft,
  Filter,
  Grid,
} from 'lucide-react';
import { Order, OrderStatus, ORDER_STATUS_CONFIG } from '../types/order';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { mediaService } from '../services/mediaService';
import { isSupabaseConfigured } from '../lib/supabase';
import { Category } from '../types/product';
import { formatVND } from '../utils/formatCurrency';

interface WebImageItem {
  url: string;
  label: string;
  folder: string;
  categoryId?: string;
  categoryName?: string;
  productId?: string;
}

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'new' | 'workshop_processing' | 'shipping' | 'completed' | 'unpaid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Danh sách ảnh & danh mục có sẵn trên web
  const [webImages, setWebImages] = useState<WebImageItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryViewMode, setGalleryViewMode] = useState<'folders' | 'all'>('folders');
  const [currentGalleryFolder, setCurrentGalleryFolder] = useState<string>('');
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('all');
  const [galleryFolderFilter, setGalleryFolderFilter] = useState<string>('all');

  // Modal Thêm / Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Form State
  const [formImage, setFormImage] = useState<string>('');
  const [pasteUrlInput, setPasteUrlInput] = useState<string>('');
  const [formText, setFormText] = useState<string>('');
  const [formSalePrice, setFormSalePrice] = useState<number | ''>(250000);
  const [formWorkshopCost, setFormWorkshopCost] = useState<number | ''>(150000);
  const [formWorkshopPaid, setFormWorkshopPaid] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<OrderStatus>('new');
  const [pasteNotification, setPasteNotification] = useState<string>('');

  // Phóng to ảnh (Lightbox)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Ref cho input chọn file ảnh từ máy
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orderList, prods, cats] = await Promise.all([
        orderService.getOrders(),
        productService.getAllProductsAdmin().catch(() => []),
        productService.getCategories().catch(() => []),
      ]);
      setOrders(orderList);
      setCategories(cats);

      const catMap = new Map<string, string>();
      cats.forEach((c) => catMap.set(c.id, c.name));

      const imgList: WebImageItem[] = [];
      const seen = new Set<string>();

      // 1. Gom ảnh từ sản phẩm
      prods.forEach((p) => {
        const folderName = p.id || 'Sản phẩm khác';
        const catId = p.category || (Array.isArray(p.categories) ? p.categories[0] : '');
        const catName = catMap.get(catId) || 'Chung';

        if (p.coverImage && !seen.has(p.coverImage)) {
          seen.add(p.coverImage);
          imgList.push({
            url: p.coverImage,
            label: `${p.name} (Ảnh bìa)`,
            folder: folderName,
            categoryId: catId,
            categoryName: catName,
            productId: p.id,
          });
        }
        if (Array.isArray(p.images)) {
          p.images.forEach((img, idx) => {
            const u = typeof img === 'string' ? img : (img as { url?: string })?.url;
            if (u && !seen.has(u)) {
              seen.add(u);
              imgList.push({
                url: u,
                label: `${p.name} (Ảnh ${idx + 1})`,
                folder: folderName,
                categoryId: catId,
                categoryName: catName,
                productId: p.id,
              });
            }
          });
        }
        if (Array.isArray(p.colors)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          p.colors.forEach((c: any) => {
            if (typeof c === 'object' && c && c.imageUrl && !seen.has(c.imageUrl)) {
              seen.add(c.imageUrl);
              imgList.push({
                url: c.imageUrl,
                label: `${p.name} - Màu ${c.name || ''}`,
                folder: folderName,
                categoryId: catId,
                categoryName: catName,
                productId: p.id,
              });
            }
          });
        }
      });

      // 2. Gom ảnh từ Storage nếu có cấu hình
      try {
        if (isSupabaseConfigured) {
          const storageFiles = await mediaService.listAllFilesRecursive('', 3).catch(() => []);
          storageFiles.forEach((file) => {
            if (file.publicUrl && !seen.has(file.publicUrl)) {
              seen.add(file.publicUrl);
              const parts = file.fullPath.split('/');
              const folderName = parts.length > 1 ? parts[0] : 'Kho gốc';
              imgList.push({
                url: file.publicUrl,
                label: file.name,
                folder: folderName,
                categoryName: 'Kho ảnh lưu trữ',
              });
            }
          });
        }
      } catch {
        // ignore
      }

      setWebImages(imgList);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Xử lý sự kiện Paste ảnh (Ctrl+V / Cmd+V)
  const handlePasteBlobOrUrl = useCallback((clipboardData: DataTransfer | null) => {
    if (!clipboardData) return;

    // Kiểm tra file ảnh nhị phân trong Clipboard (chụp màn hình / copy ảnh từ Zalo)
    const items = clipboardData.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result as string;
              if (result) {
                setFormImage(result);
                setPasteUrlInput('');
                setPasteNotification('✓ Đã dán ảnh từ clipboard thành công!');
                setTimeout(() => setPasteNotification(''), 3000);
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
      }
    }

    // Kiểm tra text URL nếu người dùng paste link ảnh
    const text = clipboardData.getData('text')?.trim();
    if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('/images/'))) {
      setFormImage(text);
      setPasteUrlInput(text);
      setPasteNotification('✓ Đã nhận diện link ảnh!');
      setTimeout(() => setPasteNotification(''), 3000);
      return true;
    }

    return false;
  }, []);

  // Bắt sự kiện paste toàn cục khi Modal đang mở
  useEffect(() => {
    if (!isModalOpen) return;

    const handleWindowPaste = (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      const isTypingTextarea = activeEl && activeEl.tagName === 'TEXTAREA';

      const items = e.clipboardData?.items;
      let hasImageFile = false;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            hasImageFile = true;
            break;
          }
        }
      }

      if (hasImageFile) {
        e.preventDefault();
        handlePasteBlobOrUrl(e.clipboardData);
      } else if (!isTypingTextarea) {
        const handled = handlePasteBlobOrUrl(e.clipboardData);
        if (handled) e.preventDefault();
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [isModalOpen, handlePasteBlobOrUrl]);

  // Bộ đếm số đơn
  const counts = useMemo(() => {
    return {
      all: orders.length,
      new: orders.filter((o) => o.status === 'new').length,
      processing: orders.filter((o) => o.status === 'workshop_processing').length,
      shipping: orders.filter((o) => o.status === 'shipping').length,
      completed: orders.filter((o) => o.status === 'completed').length,
      unpaid: orders.filter((o) => !o.workshopPaid && o.status !== 'cancelled').length,
    };
  }, [orders]);

  // Lọc danh sách đơn hàng
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filterTab === 'new' && order.status !== 'new') return false;
      if (filterTab === 'workshop_processing' && order.status !== 'workshop_processing') return false;
      if (filterTab === 'shipping' && order.status !== 'shipping') return false;
      if (filterTab === 'completed' && order.status !== 'completed') return false;
      if (filterTab === 'unpaid' && (order.workshopPaid || order.status === 'cancelled')) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = order.id.toLowerCase().includes(q);
        const matchText = (order.orderText || '').toLowerCase().includes(q);
        if (!matchId && !matchText) return false;
      }
      return true;
    });
  }, [orders, filterTab, searchQuery]);

  // Danh sách các Folder và số lượng ảnh trong từng folder
  const folderList = useMemo(() => {
    const map = new Map<string, number>();
    webImages.forEach((img) => {
      const f = img.folder || 'Chung';
      map.set(f, (map.get(f) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [webImages]);

  // Lọc ảnh trong Gallery theo Thư mục, Danh mục và Tìm kiếm
  const galleryDisplayData = useMemo(() => {
    const q = gallerySearch.toLowerCase().trim();

    // 1. Chế độ theo Thư Mục (Folders)
    if (galleryViewMode === 'folders') {
      if (!currentGalleryFolder) {
        // Đang ở gốc -> lọc danh sách các folder
        const filteredFolders = folderList.filter((f) => {
          if (!q) return true;
          return f.name.toLowerCase().includes(q);
        });
        return { isFolderView: true, folders: filteredFolders, images: [] };
      } else {
        // Đang ở trong 1 folder cụ thể -> lấy các ảnh thuộc folder đó
        const imagesInFolder = webImages.filter((img) => {
          if (img.folder !== currentGalleryFolder) return false;
          if (q && !img.label.toLowerCase().includes(q)) return false;
          return true;
        });
        return { isFolderView: false, folders: [], images: imagesInFolder };
      }
    }

    // 2. Chế độ Xem tất cả có Bộ lọc (All / Filter)
    const filtered = webImages.filter((img) => {
      // Lọc danh mục
      if (galleryCategoryFilter !== 'all' && img.categoryId !== galleryCategoryFilter) {
        return false;
      }
      // Lọc folder
      if (galleryFolderFilter !== 'all' && img.folder !== galleryFolderFilter) {
        return false;
      }
      // Tìm kiếm
      if (q) {
        const matchLabel = img.label.toLowerCase().includes(q);
        const matchFolder = img.folder.toLowerCase().includes(q);
        if (!matchLabel && !matchFolder) return false;
      }
      return true;
    });

    return { isFolderView: false, folders: [], images: filtered };
  }, [galleryViewMode, currentGalleryFolder, folderList, webImages, galleryCategoryFilter, galleryFolderFilter, gallerySearch]);

  // Đổi nhanh trạng thái Tiền xưởng (1 chạm)
  const handleToggleWorkshopPaid = async (order: Order) => {
    const nextPaid = !order.workshopPaid;
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, workshopPaid: nextPaid } : o))
    );
    try {
      await orderService.toggleWorkshopPaid(order.id, nextPaid);
    } catch {
      loadData();
    }
  };

  // Đổi trạng thái đơn nhanh
  const handleChangeStatus = async (order: Order, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o))
    );
    try {
      await orderService.updateOrderStatus(order.id, nextStatus);
    } catch {
      loadData();
    }
  };

  // Mở modal thêm mới
  const handleOpenCreateModal = () => {
    setEditingOrder(null);
    setFormImage('');
    setPasteUrlInput('');
    setFormText('');
    setFormSalePrice(250000);
    setFormWorkshopCost(150000);
    setFormWorkshopPaid(false);
    setFormStatus('new');
    setPasteNotification('');
    setIsModalOpen(true);
  };

  // Mở modal sửa
  const handleOpenEditModal = (order: Order) => {
    setEditingOrder(order);
    setFormImage(order.imageUrl || '');
    setPasteUrlInput(order.imageUrl?.startsWith('http') || order.imageUrl?.startsWith('/') ? order.imageUrl : '');
    setFormText(order.orderText || '');
    setFormSalePrice(order.salePrice || 0);
    setFormWorkshopCost(order.workshopCost || 0);
    setFormWorkshopPaid(Boolean(order.workshopPaid));
    setFormStatus(order.status);
    setPasteNotification('');
    setIsModalOpen(true);
  };

  // Xử lý chọn ảnh từ máy tính / điện thoại
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormImage(result);
        setPasteUrlInput('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Lưu đơn (Thêm mới hoặc Cập nhật)
  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formText.trim()) {
      alert('Vui lòng nhập thông tin đơn (tên khách / mẫu vải / kích thước...)');
      return;
    }

    const salePrice = typeof formSalePrice === 'number' ? formSalePrice : 0;
    const workshopCost = typeof formWorkshopCost === 'number' ? formWorkshopCost : 0;

    if (editingOrder) {
      const updated: Partial<Order> = {
        imageUrl: formImage,
        orderText: formText.trim(),
        salePrice,
        workshopCost,
        workshopPaid: formWorkshopPaid,
        status: formStatus,
      };
      setOrders((prev) =>
        prev.map((o) => (o.id === editingOrder.id ? { ...o, ...updated } : o))
      );
      setIsModalOpen(false);
      await orderService.updateOrder(editingOrder.id, updated);
    } else {
      const newOrder = await orderService.createOrder({
        imageUrl: formImage,
        orderText: formText.trim(),
        salePrice,
        workshopCost,
        workshopPaid: formWorkshopPaid,
        status: formStatus,
      });
      setOrders((prev) => [newOrder, ...prev]);
      setIsModalOpen(false);
    }
  };

  // Xóa đơn nhanh bằng confirm chuẩn
  const handleDeleteOrder = async (order: Order) => {
    if (window.confirm(`Bạn có chắc muốn xóa đơn #${order.id} không?`)) {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      await orderService.deleteOrder(order.id);
    }
  };

  // Xóa sạch tất cả dữ liệu đơn
  const handleClearAll = async () => {
    if (window.confirm('Bạn có chắc chắn muốn XÓA TẤT CẢ các đơn hàng hiện có để làm trống danh sách không?')) {
      setOrders([]);
      await orderService.clearAllOrders();
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* HEADER: Tiêu đề + Tìm kiếm + Nút Thêm mới + Xóa sạch */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#ffffff',
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          border: '1px solid #e8e1d5',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#2c2825', margin: 0 }}>
              Check Đơn Hàng
            </h1>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#7c6a59',
                backgroundColor: '#f5eee6',
                padding: '3px 10px',
                borderRadius: '16px',
              }}
            >
              Tổng {counts.all} đơn
            </span>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#685e54', margin: '0.25rem 0 0 0' }}>
            Theo dõi mẫu vải, giá bán, tiền xưởng và tiến độ giao hàng
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Ô tìm kiếm */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9c8f80' }} />
            <input
              type="text"
              placeholder="Tìm khách, mẫu vải..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.65rem 0.45rem 2rem',
                fontSize: '0.85rem',
                borderRadius: '8px',
                border: '1px solid #dcd3c5',
                backgroundColor: '#faf8f5',
                color: '#2c2825',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#9c8f80' }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Nút Thêm đơn mới */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="btn btn-primary"
            style={{
              gap: '0.45rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              padding: '0.55rem 1.15rem',
              boxShadow: '0 2px 6px rgba(124, 106, 89, 0.25)',
            }}
          >
            <Plus size={18} />
            <span>Thêm đơn mới</span>
          </button>

          {/* Nút Xóa sạch tất cả đơn */}
          {orders.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="btn btn-sm"
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#dc2626',
                fontWeight: 600,
                fontSize: '0.825rem',
                gap: '0.35rem',
                padding: '0.55rem 0.85rem',
              }}
              title="Xóa sạch toàn bộ đơn để làm trống danh sách"
            >
              <Trash2 size={15} />
              <span>Xóa sạch đơn</span>
            </button>
          )}
        </div>
      </div>

      {/* BỘ ĐẾM SỐ ĐƠN & TABS LỌC 1-CHẠM */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
          padding: '0.65rem',
          borderRadius: '10px',
          border: '1px solid #e8e1d5',
        }}
      >
        <button
          type="button"
          onClick={() => setFilterTab('all')}
          style={{
            padding: '0.45rem 0.9rem',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: filterTab === 'all' ? '#7c6a59' : '#f5eee6',
            color: filterTab === 'all' ? '#ffffff' : '#5c4e43',
            transition: 'all 0.15s ease',
          }}
        >
          Tất cả ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('new')}
          style={{
            padding: '0.45rem 0.9rem',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: filterTab === 'new' ? '#1d4ed8' : '#eff6ff',
            color: filterTab === 'new' ? '#ffffff' : '#1d4ed8',
            transition: 'all 0.15s ease',
          }}
        >
          Đơn mới ({counts.new})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('workshop_processing')}
          style={{
            padding: '0.45rem 0.9rem',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: filterTab === 'workshop_processing' ? '#b45309' : '#fef3c7',
            color: filterTab === 'workshop_processing' ? '#ffffff' : '#b45309',
            transition: 'all 0.15s ease',
          }}
        >
          Xưởng đang may ({counts.processing})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('shipping')}
          style={{
            padding: '0.45rem 0.9rem',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: filterTab === 'shipping' ? '#0369a1' : '#e0f2fe',
            color: filterTab === 'shipping' ? '#ffffff' : '#0369a1',
            transition: 'all 0.15s ease',
          }}
        >
          Đang ship ({counts.shipping})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('completed')}
          style={{
            padding: '0.45rem 0.9rem',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: filterTab === 'completed' ? '#15803d' : '#dcfce7',
            color: filterTab === 'completed' ? '#ffffff' : '#15803d',
            transition: 'all 0.15s ease',
          }}
        >
          Hoàn thành ({counts.completed})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('unpaid')}
          style={{
            marginLeft: 'auto',
            padding: '0.45rem 0.9rem',
            borderRadius: '6px',
            border: filterTab === 'unpaid' ? 'none' : '1px dashed #ef4444',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: filterTab === 'unpaid' ? '#dc2626' : '#fef2f2',
            color: filterTab === 'unpaid' ? '#ffffff' : '#dc2626',
            transition: 'all 0.15s ease',
          }}
          title="Lọc các đơn chưa thanh toán cho xưởng may"
        >
          ⚠️ Chưa trả tiền xưởng ({counts.unpaid})
        </button>
      </div>

      {/* DANH SÁCH ĐƠN HÀNG */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e8e1d5',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#766352' }}>
            <RotateCcw size={24} className="spin" style={{ color: '#7c6a59' }} />
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Đang tải danh sách đơn...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#8c8073' }}>
            <AlertCircle size={32} style={{ color: '#d5cbbe', marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#5c4e43', margin: 0 }}>
              Không có đơn hàng nào
            </p>
            <p style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
              {searchQuery ? 'Thử tìm với từ khóa khác' : 'Bấm "+ Thêm đơn mới" để bắt đầu nhập đơn'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#faf8f5', borderBottom: '1px solid #e8e1d5', color: '#685e54', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  <th style={{ padding: '0.75rem 1rem', width: '85px', textAlign: 'center' }}>Ảnh mẫu</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Thông tin đơn</th>
                  <th style={{ padding: '0.75rem 1rem', width: '140px' }}>Giá tiền</th>
                  <th style={{ padding: '0.75rem 1rem', width: '160px', textAlign: 'center' }}>Tiền xưởng</th>
                  <th style={{ padding: '0.75rem 1rem', width: '150px' }}>Trạng thái</th>
                  <th style={{ padding: '0.75rem 1rem', width: '90px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => {
                  const statusConf = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.new;
                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: idx === filteredOrders.length - 1 ? 'none' : '1px solid #f0ebe4',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fdfcfb',
                      }}
                    >
                      {/* Cột 1: 1 Ảnh mẫu to rõ */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                        {order.imageUrl ? (
                          <div
                            onClick={() => setZoomedImage(order.imageUrl)}
                            style={{
                              width: '72px',
                              height: '72px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '1px solid #dcd3c5',
                              cursor: 'pointer',
                              display: 'inline-block',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                              transition: 'transform 0.15s ease',
                              backgroundColor: '#f5eee6',
                            }}
                            title="Bấm để xem to ảnh mẫu"
                          >
                            <img
                              src={order.imageUrl}
                              alt="Mẫu vải"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: '72px',
                              height: '72px',
                              borderRadius: '8px',
                              border: '1px dashed #dcd3c5',
                              backgroundColor: '#f5eee6',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#9c8f80',
                            }}
                            title="Chưa có ảnh"
                          >
                            <ImageIcon size={22} />
                          </div>
                        )}
                      </td>

                      {/* Cột 2: Text thông tin đơn */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7c6a59' }}>
                            #{order.id}
                          </span>
                          <span style={{ fontSize: '0.725rem', color: '#9c8f80' }}>
                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.925rem',
                            fontWeight: 500,
                            color: '#2c2825',
                            lineHeight: 1.45,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {order.orderText || '(Chưa có thông tin)'}
                        </p>
                        {order.notes && (
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.785rem', color: '#b45309', fontStyle: 'italic' }}>
                            Ghi chú: {order.notes}
                          </p>
                        )}
                      </td>

                      {/* Cột 3: Giá bán & Giá xưởng */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: '#685e54', display: 'block' }}>Khách trả:</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#15803d' }}>
                              {formatVND(order.salePrice || 0)}
                            </span>
                          </div>
                          <div style={{ marginTop: '0.2rem' }}>
                            <span style={{ fontSize: '0.7rem', color: '#685e54', display: 'block' }}>Tiền xưởng:</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#7c6a59' }}>
                              {formatVND(order.workshopCost || 0)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cột 4: Nút Tiền Xưởng 1 Chạm */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleWorkshopPaid(order)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            border: order.workshopPaid ? '1px solid #86efac' : '1px solid #fca5a5',
                            backgroundColor: order.workshopPaid ? '#f0fdf4' : '#fef2f2',
                            color: order.workshopPaid ? '#15803d' : '#b91c1c',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                          }}
                          title="Bấm để đổi trạng thái thanh toán tiền xưởng"
                        >
                          {order.workshopPaid ? (
                            <>
                              <Check size={14} />
                              <span>Đã trả xưởng</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle size={14} />
                              <span>Chưa trả xưởng</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Cột 5: Dropdown Trạng Thái Đơn */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <select
                          value={order.status}
                          onChange={(e) => handleChangeStatus(order, e.target.value as OrderStatus)}
                          style={{
                            padding: '0.4rem 0.65rem',
                            borderRadius: '6px',
                            border: `1px solid ${statusConf.border}`,
                            backgroundColor: statusConf.bg,
                            color: statusConf.color,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            outline: 'none',
                            width: '100%',
                          }}
                        >
                          <option value="new">🆕 Đơn mới</option>
                          <option value="workshop_processing">✂️ Xưởng đang may</option>
                          <option value="shipping">🚚 Đang ship</option>
                          <option value="completed">✅ Hoàn thành</option>
                          <option value="cancelled">❌ Đã hủy</option>
                        </select>
                      </td>

                      {/* Cột 6: Thao tác (Sửa, Xóa) */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(order)}
                            style={{
                              padding: '0.4rem',
                              border: '1px solid #dcd3c5',
                              backgroundColor: '#ffffff',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#685e54',
                            }}
                            title="Sửa đơn"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order)}
                            style={{
                              padding: '0.4rem',
                              border: '1px solid #fecaca',
                              backgroundColor: '#ffffff',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#dc2626',
                            }}
                            title="Xóa đơn này"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL THÊM / SỬA ĐƠN HÀNG */}
      {isModalOpen &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '560px',
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
                padding: '1.5rem',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #f0ebe4', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2c2825', margin: 0 }}>
                  {editingOrder ? `Sửa Đơn #${editingOrder.id}` : 'Thêm Đơn Hàng Mới'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#8c8073' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {/* 1. KHU VỰC CHỌN ẢNH (3 CÁCH: MÁY / ẢNH WEB CÓ FOLDER & FILTER / PASTE) */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2c2825', margin: 0 }}>
                      1. Ảnh mẫu vải:
                    </label>
                    <span style={{ fontSize: '0.725rem', color: '#7c6a59', fontWeight: 500 }}>
                      📋 Có thể nhấn <strong>Ctrl + V</strong> để dán ảnh đã copy
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />

                  {/* Thông báo dán ảnh thành công */}
                  {pasteNotification && (
                    <div
                      style={{
                        padding: '0.35rem 0.65rem',
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        borderRadius: '6px',
                        fontSize: '0.785rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                      }}
                    >
                      {pasteNotification}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                    {/* Khung xem trước ảnh */}
                    {formImage ? (
                      <div style={{ position: 'relative', width: '96px', height: '96px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dcd3c5', flexShrink: 0 }}>
                        <img src={formImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => {
                            setFormImage('');
                            setPasteUrlInput('');
                          }}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(0,0,0,0.6)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '22px',
                            height: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          title="Gỡ ảnh"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          width: '96px',
                          height: '96px',
                          borderRadius: '8px',
                          border: '2px dashed #dcd3c5',
                          backgroundColor: '#faf8f5',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#7c6a59',
                          gap: '0.25rem',
                          flexShrink: 0,
                        }}
                        title="Bấm để chọn file ảnh hoặc dán ảnh vào đây"
                      >
                        <Upload size={20} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Tải ảnh lên</span>
                      </div>
                    )}

                    {/* Các nút lựa chọn ảnh */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                        {/* Nút 1: Chọn ảnh từ máy */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.65rem', gap: '0.35rem' }}
                        >
                          <Upload size={14} />
                          <span>Từ máy/điện thoại</span>
                        </button>

                        {/* Nút 2: Chọn từ ảnh trên Web có Folder & Filter */}
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentGalleryFolder('');
                            setGallerySearch('');
                            setIsGalleryOpen(true);
                          }}
                          className="btn btn-outline btn-sm"
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.4rem 0.65rem',
                            gap: '0.35rem',
                            borderColor: '#7c6a59',
                            color: '#7c6a59',
                            backgroundColor: '#f5eee6',
                            fontWeight: 600,
                          }}
                        >
                          <Globe size={14} />
                          <span>Chọn từ Web (Folder & Filter)</span>
                        </button>
                      </div>

                      {/* Ô nhập / dán link ảnh trực tiếp */}
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="Dán link ảnh (URL) hoặc nhấn Ctrl+V dán ảnh"
                          value={pasteUrlInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPasteUrlInput(val);
                            if (val.trim().startsWith('http') || val.trim().startsWith('/')) {
                              setFormImage(val.trim());
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '0.4rem 0.65rem 0.4rem 1.85rem',
                            fontSize: '0.785rem',
                            borderRadius: '6px',
                            border: '1px solid #dcd3c5',
                            backgroundColor: '#faf8f5',
                            boxSizing: 'border-box',
                            outline: 'none',
                          }}
                        />
                        <ClipboardPaste
                          size={13}
                          style={{
                            position: 'absolute',
                            left: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#9c8f80',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Text Thông Tin Đơn */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#2c2825', marginBottom: '0.4rem' }}>
                    2. Thông tin đơn hàng (Tên khách, SĐT, mẫu vải, kích thước đệm...): <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="VD: Chị Mai (0983 124 556) - Set đũi tre Xanh Cốm 1m8 x 2m x 20cm - Giao Đặng Thai Mai, Tây Hồ"
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      fontSize: '0.875rem',
                      borderRadius: '8px',
                      border: '1px solid #dcd3c5',
                      outline: 'none',
                      lineHeight: 1.45,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* 3. Giá bán & Giá xưởng */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#2c2825', marginBottom: '0.35rem' }}>
                      Giá bán (Khách trả):
                    </label>
                    <input
                      type="number"
                      step={5000}
                      value={formSalePrice}
                      onChange={(e) => setFormSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.65rem',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#15803d',
                        borderRadius: '6px',
                        border: '1px solid #dcd3c5',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#2c2825', marginBottom: '0.35rem' }}>
                      Giá xưởng (Vải + công):
                    </label>
                    <input
                      type="number"
                      step={5000}
                      value={formWorkshopCost}
                      onChange={(e) => setFormWorkshopCost(e.target.value === '' ? '' : Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.65rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#7c6a59',
                        borderRadius: '6px',
                        border: '1px solid #dcd3c5',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* 4. Trạng thái tiền xưởng & Trạng thái đơn */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', alignItems: 'center' }}>
                  {/* Bật tắt tiền xưởng */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#2c2825', marginBottom: '0.35rem' }}>
                      Tiền xưởng:
                    </label>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '6px',
                        border: formWorkshopPaid ? '1px solid #86efac' : '1px solid #fca5a5',
                        backgroundColor: formWorkshopPaid ? '#f0fdf4' : '#fef2f2',
                        cursor: 'pointer',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        color: formWorkshopPaid ? '#15803d' : '#b91c1c',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formWorkshopPaid}
                        onChange={(e) => setFormWorkshopPaid(e.target.checked)}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span>{formWorkshopPaid ? 'Đã trả xưởng' : 'Chưa trả xưởng'}</span>
                    </label>
                  </div>

                  {/* Trạng thái đơn */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#2c2825', marginBottom: '0.35rem' }}>
                      Trạng thái đơn:
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as OrderStatus)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.65rem',
                        fontSize: '0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #dcd3c5',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="new">🆕 Đơn mới</option>
                      <option value="workshop_processing">✂️ Xưởng đang may</option>
                      <option value="shipping">🚚 Đang ship</option>
                      <option value="completed">✅ Hoàn thành</option>
                      <option value="cancelled">❌ Đã hủy</option>
                    </select>
                  </div>
                </div>

                {/* Nút Submit */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f0ebe4' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-outline btn-sm"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    style={{ padding: '0.5rem 1.25rem', fontWeight: 700 }}
                  >
                    {editingOrder ? 'Lưu thay đổi' : 'Tạo đơn'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL CHỌN ẢNH TỪ KHO ẢNH WEB (CÓ BỘ LỌC FILTER VÀ DUYỆT THEO FOLDER) */}
      {isGalleryOpen &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.65)',
              zIndex: 10001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setIsGalleryOpen(false)}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                width: '100%',
                maxWidth: '780px',
                maxHeight: '88vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Gallery */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid #e8e1d5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#faf8f5',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FolderOpen size={20} color="#7c6a59" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2c2825', margin: 0 }}>
                      Kho Ảnh Website ({webImages.length} ảnh)
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.785rem', color: '#685e54', margin: '3px 0 0 0' }}>
                    Chọn theo thư mục folder hoặc dùng bộ lọc danh mục để tìm mẫu nhanh nhất
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(false)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#8c8073' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Toolbar: Chuyển Tab (Folders vs Tất Cả) & Thanh điều hướng */}
              <div
                style={{
                  padding: '0.65rem 1.25rem',
                  borderBottom: '1px solid #f0ebe4',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* 2 Chế độ xem: Theo Thư Mục / Tất Cả Ảnh */}
                <div style={{ display: 'inline-flex', backgroundColor: '#f5eee6', padding: '3px', borderRadius: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryViewMode('folders');
                      setCurrentGalleryFolder('');
                    }}
                    style={{
                      border: 'none',
                      backgroundColor: galleryViewMode === 'folders' ? '#ffffff' : 'transparent',
                      color: galleryViewMode === 'folders' ? '#7c6a59' : '#685e54',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: galleryViewMode === 'folders' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    <Folder size={14} />
                    <span>Duyệt theo Thư mục ({folderList.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGalleryViewMode('all')}
                    style={{
                      border: 'none',
                      backgroundColor: galleryViewMode === 'all' ? '#ffffff' : 'transparent',
                      color: galleryViewMode === 'all' ? '#7c6a59' : '#685e54',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: galleryViewMode === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    <Grid size={14} />
                    <span>Tất cả ảnh & Bộ lọc</span>
                  </button>
                </div>

                {/* Ô tìm kiếm */}
                <div style={{ position: 'relative', width: '240px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9c8f80' }} />
                  <input
                    type="text"
                    placeholder="Tìm tên mẫu, mã SP, màu vải..."
                    value={gallerySearch}
                    onChange={(e) => setGallerySearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.35rem 0.65rem 0.35rem 1.85rem',
                      fontSize: '0.8rem',
                      borderRadius: '6px',
                      border: '1px solid #dcd3c5',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#faf8f5',
                    }}
                  />
                  {gallerySearch && (
                    <button
                      type="button"
                      onClick={() => setGallerySearch('')}
                      style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#9c8f80' }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* BỘ LỌC CHI TIẾT (FILTER) HOẶC BREADCRUMB FOLDER */}
              <div
                style={{
                  padding: '0.5rem 1.25rem',
                  backgroundColor: '#faf8f5',
                  borderBottom: '1px solid #e8e1d5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.8rem',
                  flexWrap: 'wrap',
                }}
              >
                {galleryViewMode === 'folders' ? (
                  /* Breadcrumb navigation trong chế độ Folder */
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                    {currentGalleryFolder ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setCurrentGalleryFolder('')}
                          style={{
                            border: '1px solid #dcd3c5',
                            backgroundColor: '#ffffff',
                            color: '#7c6a59',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontWeight: 600,
                            fontSize: '0.785rem',
                          }}
                        >
                          <ArrowLeft size={13} />
                          <span>Tất cả thư mục</span>
                        </button>
                        <span style={{ color: '#9c8f80' }}>/</span>
                        <span style={{ fontWeight: 700, color: '#2c2825', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <FolderOpen size={15} color="#d97706" />
                          {currentGalleryFolder}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#8c8073' }}>
                          ({galleryDisplayData.images.length} ảnh)
                        </span>
                      </>
                    ) : (
                      <span style={{ color: '#685e54', fontWeight: 600 }}>
                        📁 Chọn một thư mục bên dưới để xem các mẫu ảnh vải:
                      </span>
                    )}
                  </div>
                ) : (
                  /* Bộ lọc Filter: Theo Danh mục & Folder */
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Filter size={14} color="#7c6a59" />
                      <span style={{ fontWeight: 600, color: '#685e54' }}>Lọc danh mục:</span>
                      <select
                        value={galleryCategoryFilter}
                        onChange={(e) => setGalleryCategoryFilter(e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #dcd3c5',
                          fontSize: '0.8rem',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                        }}
                      >
                        <option value="all">Tất cả danh mục ({categories.length})</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 600, color: '#685e54' }}>Thư mục:</span>
                      <select
                        value={galleryFolderFilter}
                        onChange={(e) => setGalleryFolderFilter(e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #dcd3c5',
                          fontSize: '0.8rem',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                        }}
                      >
                        <option value="all">Tất cả thư mục ({folderList.length})</option>
                        {folderList.map((f) => (
                          <option key={f.name} value={f.name}>
                            {f.name} ({f.count})
                          </option>
                        ))}
                      </select>
                    </div>

                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#7c6a59', fontWeight: 600 }}>
                      Hiển thị {galleryDisplayData.images.length} ảnh
                    </span>
                  </div>
                )}
              </div>

              {/* VÙNG NỘI DUNG CHÍNH (LƯỚI FOLDER HOẶC LƯỚI ẢNH) */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
                {/* 1. HIỂN THỊ CÁC THƯ MỤC FOLDERS */}
                {galleryDisplayData.isFolderView ? (
                  galleryDisplayData.folders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#8c8073' }}>
                      <p style={{ margin: 0 }}>Không tìm thấy thư mục phù hợp</p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '0.85rem',
                      }}
                    >
                      {galleryDisplayData.folders.map((f) => (
                        <div
                          key={f.name}
                          onClick={() => setCurrentGalleryFolder(f.name)}
                          style={{
                            padding: '1rem 0.75rem',
                            borderRadius: '10px',
                            border: '1px solid #e5ded5',
                            backgroundColor: '#faf8f5',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: '0.45rem',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f5eee6';
                            e.currentTarget.style.borderColor = '#7c6a59';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.06)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#faf8f5';
                            e.currentTarget.style.borderColor = '#e5ded5';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          title={`Mở thư mục ${f.name} (${f.count} ảnh)`}
                        >
                          <Folder size={38} color="#d97706" style={{ fill: '#fef3c7' }} />
                          <span
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: '#2c2825',
                              lineHeight: 1.25,
                              wordBreak: 'break-word',
                            }}
                          >
                            {f.name}
                          </span>
                          <span style={{ fontSize: '0.725rem', color: '#7c6a59', fontWeight: 600 }}>
                            {f.count} ảnh
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  /* 2. HIỂN THỊ LƯỚI ẢNH MẪU */
                  galleryDisplayData.images.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#8c8073' }}>
                      <AlertCircle size={28} style={{ color: '#d5cbbe', marginBottom: '0.4rem' }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>Không tìm thấy ảnh nào</p>
                      <p style={{ fontSize: '0.785rem', marginTop: '0.25rem' }}>
                        Thử đổi từ khóa hoặc chọn thư mục / danh mục khác
                      </p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                        gap: '0.85rem',
                      }}
                    >
                      {galleryDisplayData.images.map((img, i) => {
                        const isSelected = formImage === img.url;
                        return (
                          <div
                            key={`${img.url}-${i}`}
                            onClick={() => {
                              setFormImage(img.url);
                              setPasteUrlInput(img.url);
                              setIsGalleryOpen(false);
                            }}
                            style={{
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: isSelected ? '3px solid #7c6a59' : '1px solid #e5ded5',
                              backgroundColor: '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}
                            title={`Bấm để chọn: ${img.label}`}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.03)';
                              e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.12)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                            }}
                          >
                            <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#f5eee6', overflow: 'hidden' }}>
                              <img
                                src={img.url}
                                alt={img.label}
                                loading="lazy"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                            <div style={{ padding: '0.35rem 0.45rem', backgroundColor: '#faf8f5', borderTop: '1px solid #f0ebe4' }}>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  color: '#2c2825',
                                  fontWeight: 500,
                                  lineHeight: 1.25,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {img.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>

              {/* Footer Gallery */}
              <div
                style={{
                  padding: '0.75rem 1.25rem',
                  borderTop: '1px solid #e8e1d5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#faf8f5',
                }}
              >
                <span style={{ fontSize: '0.785rem', color: '#685e54' }}>
                  💡 Bấm vào ảnh bất kỳ để gán vào đơn ngay
                </span>
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(false)}
                  className="btn btn-outline btn-sm"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL PHÓNG TO ẢNH (LIGHTBOX) */}
      {zoomedImage &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
            onClick={() => setZoomedImage(null)}
          >
            <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
              <img
                src={zoomedImage}
                alt="Chi tiết mẫu vải"
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  borderRadius: '10px',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                  objectFit: 'contain',
                }}
              />
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '-12px',
                  backgroundColor: '#ffffff',
                  color: '#2c2825',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
