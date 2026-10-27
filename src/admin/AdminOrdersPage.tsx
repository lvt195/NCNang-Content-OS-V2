import React, { useEffect, useState, useMemo, useRef } from 'react';
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
} from 'lucide-react';
import { Order, OrderStatus, ORDER_STATUS_CONFIG } from '../types/order';
import { orderService } from '../services/orderService';
import { formatVND } from '../utils/formatCurrency';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'new' | 'workshop_processing' | 'shipping' | 'completed' | 'unpaid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Thêm / Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Form State cực kỳ đơn giản
  const [formImage, setFormImage] = useState<string>('');
  const [formText, setFormText] = useState<string>('');
  const [formSalePrice, setFormSalePrice] = useState<number | ''>(250000);
  const [formWorkshopCost, setFormWorkshopCost] = useState<number | ''>(150000);
  const [formWorkshopPaid, setFormWorkshopPaid] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<OrderStatus>('new');

  // Modal Xóa
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Phóng to ảnh (Lightbox)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Ref cho input chọn file ảnh từ máy
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const list = await orderService.getOrders();
      setOrders(list);
    } catch (err) {
      console.error('Lỗi tải danh sách đơn:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

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

  // Lọc danh sách theo tab & từ khóa
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Lọc tab
      if (filterTab === 'new' && order.status !== 'new') return false;
      if (filterTab === 'workshop_processing' && order.status !== 'workshop_processing') return false;
      if (filterTab === 'shipping' && order.status !== 'shipping') return false;
      if (filterTab === 'completed' && order.status !== 'completed') return false;
      if (filterTab === 'unpaid' && (order.workshopPaid || order.status === 'cancelled')) return false;

      // Tìm kiếm text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = order.id.toLowerCase().includes(q);
        const matchText = (order.orderText || '').toLowerCase().includes(q);
        if (!matchId && !matchText) return false;
      }
      return true;
    });
  }, [orders, filterTab, searchQuery]);

  // Đổi nhanh trạng thái Tiền xưởng (1 chạm)
  const handleToggleWorkshopPaid = async (order: Order) => {
    const nextPaid = !order.workshopPaid;
    // Cập nhật giao diện tức thì
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, workshopPaid: nextPaid } : o))
    );
    try {
      await orderService.toggleWorkshopPaid(order.id, nextPaid);
    } catch {
      // rollback nếu lỗi
      loadOrders();
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
      loadOrders();
    }
  };

  // Mở modal thêm mới
  const handleOpenCreateModal = () => {
    setEditingOrder(null);
    setFormImage('');
    setFormText('');
    setFormSalePrice(250000);
    setFormWorkshopCost(150000);
    setFormWorkshopPaid(false);
    setFormStatus('new');
    setIsModalOpen(true);
  };

  // Mở modal sửa
  const handleOpenEditModal = (order: Order) => {
    setEditingOrder(order);
    setFormImage(order.imageUrl || '');
    setFormText(order.orderText || '');
    setFormSalePrice(order.salePrice || 0);
    setFormWorkshopCost(order.workshopCost || 0);
    setFormWorkshopPaid(Boolean(order.workshopPaid));
    setFormStatus(order.status);
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
      // Cập nhật
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
      // Tạo mới
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

  // Xóa đơn
  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    const id = orderToDelete.id;
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setOrderToDelete(null);
    await orderService.deleteOrder(id);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* HEADER: Tiêu đề + Tìm kiếm + Nút Thêm mới */}
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
              {searchQuery ? 'Thử tìm với từ khóa khác' : 'Bấm "+ Thêm đơn mới" để tạo đơn đầu tiên'}
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
                            onClick={() => setOrderToDelete(order)}
                            style={{
                              padding: '0.4rem',
                              border: '1px solid #fecaca',
                              backgroundColor: '#ffffff',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#dc2626',
                            }}
                            title="Xóa đơn"
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

      {/* MODAL THÊM / SỬA ĐƠN HÀNG SIÊU ĐƠN GIẢN */}
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
                maxWidth: '520px',
                maxHeight: '90vh',
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
                {/* 1. Chọn Ảnh Mẫu */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#2c2825', marginBottom: '0.4rem' }}>
                    1. Ảnh mẫu vải:
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />

                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                    {formImage ? (
                      <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dcd3c5' }}>
                        <img src={formImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setFormImage('')}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(0,0,0,0.6)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          width: '90px',
                          height: '90px',
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
                        }}
                      >
                        <Upload size={20} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Tải ảnh lên</span>
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', gap: '0.35rem' }}
                      >
                        <Upload size={14} />
                        <span>{formImage ? 'Đổi ảnh khác' : 'Chọn ảnh từ máy / điện thoại'}</span>
                      </button>
                      <p style={{ fontSize: '0.725rem', color: '#8c8073', margin: '0.35rem 0 0 0' }}>
                        Chụp ảnh Zalo hoặc ảnh mẫu vải để nhìn vào là biết ngay.
                      </p>
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

      {/* MODAL XÁC NHẬN XÓA */}
      {orderToDelete &&
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
            onClick={() => setOrderToDelete(null)}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                width: '100%',
                maxWidth: '380px',
                padding: '1.25rem',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#dc2626', margin: '0 0 0.5rem 0' }}>
                Xác nhận xóa đơn hàng?
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#685e54', margin: '0 0 1rem 0' }}>
                Bạn có chắc chắn muốn xóa đơn #{orderToDelete.id} này không? Thao tác không thể khôi phục.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  className="btn btn-outline btn-sm"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.45rem 1rem',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Xóa đơn
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
