import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ShoppingBag,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  X,
  AlertCircle,
  Copy,
  Phone,
  MapPin,
  Maximize2,
  Layers,
  Edit2,
  Trash2,
  RotateCcw,
  CreditCard,
  Send,
} from 'lucide-react';
import { Order, OrderStatus, OrderSummary, ORDER_STATUS_CONFIG } from '../types/order';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { Product } from '../types/product';
import { formatVND } from '../utils/formatCurrency';
import { getColorOption } from '../data/colors';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [workshopPaidFilter, setWorkshopPaidFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string; color?: string } | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Form State for Create/Edit Modal
  const [formData, setFormData] = useState({
    id: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    trackingCode: '',
    productName: '',
    productId: '',
    imageUrl: '',
    color: '',
    size: '',
    quantity: 1,
    unitPrice: 240000,
    workshopCost: 150000,
    shippingFee: 30000,
    customerPaid: false,
    workshopPaid: false,
    workshopPaidDate: '',
    status: 'new' as OrderStatus,
    notes: '',
    orderDate: new Date().toISOString().split('T')[0],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [orderList, prodList] = await Promise.all([
        orderService.getOrders(),
        productService.getAllProductsAdmin().catch(() => []),
      ]);
      setOrders(orderList);
      setProducts(prodList);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary: OrderSummary = useMemo(() => {
    return orderService.getSummary(orders);
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Workshop paid filter
      if (workshopPaidFilter === 'paid') {
        if (!order.workshopPaid && order.status !== 'workshop_paid') return false;
      } else if (workshopPaidFilter === 'unpaid') {
        if (order.workshopPaid || order.status === 'workshop_paid') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = order.id.toLowerCase().includes(q);
        const matchCustomer = order.customerName.toLowerCase().includes(q);
        const matchPhone = order.customerPhone.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''));
        const matchTracking = (order.trackingCode || '').toLowerCase().includes(q);
        const matchProduct = order.items.some((i) => i.productName.toLowerCase().includes(q) || (i.color || '').toLowerCase().includes(q));
        if (!matchId && !matchCustomer && !matchPhone && !matchTracking && !matchProduct) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, workshopPaidFilter, searchQuery]);

  // Handlers for quick status changes
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await orderService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setSuccessMsg(`Đã cập nhật trạng thái đơn ${orderId} sang "${ORDER_STATUS_CONFIG[newStatus].label}"`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi cập nhật');
    }
  };

  const handleToggleWorkshopPaid = async (orderId: string, currentPaid: boolean) => {
    const nextState = !currentPaid;
    try {
      const updated = await orderService.toggleWorkshopPaid(orderId, nextState);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setSuccessMsg(nextState ? `Đã xác nhận thanh toán tiền xưởng cho đơn ${orderId}` : `Đã chuyển đơn ${orderId} về chưa thanh toán xưởng`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi cập nhật tiền xưởng');
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const nextId = orderService.generateNextOrderId();
    const defaultProduct = products[0];
    setEditingOrder(null);
    setFormData({
      id: nextId,
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      trackingCode: '',
      productName: defaultProduct?.name || 'Combo 4 món đũi tre cotton',
      productId: defaultProduct?.id || '',
      imageUrl: defaultProduct?.coverImage || defaultProduct?.images?.[0] || 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/SP785/1792147545122_6.jpg',
      color: defaultProduct?.colors?.[0] || 'Xanh Cốm',
      size: defaultProduct?.sizes?.[0] || '1m8 x 2m x 20cm',
      quantity: 1,
      unitPrice: defaultProduct?.price || 240000,
      workshopCost: 155000,
      shippingFee: 30000,
      customerPaid: false,
      workshopPaid: false,
      workshopPaidDate: '',
      status: 'new',
      notes: '',
      orderDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (order: Order) => {
    setEditingOrder(order);
    const item = order.items[0] || {
      productName: '',
      quantity: 1,
      unitPrice: order.totalAmount,
    };
    setFormData({
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress || '',
      trackingCode: order.trackingCode || '',
      productName: item.productName || '',
      productId: item.productId || '',
      imageUrl: item.imageUrl || '',
      color: item.color || '',
      size: item.size || '',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      workshopCost: item.workshopCost || order.workshopTotalCost || 0,
      shippingFee: order.shippingFee || 0,
      customerPaid: order.customerPaid || false,
      workshopPaid: order.workshopPaid || false,
      workshopPaidDate: order.workshopPaidDate || '',
      status: order.status,
      notes: order.notes || '',
      orderDate: order.orderDate || order.createdAt.split('T')[0],
    });
    setIsModalOpen(true);
  };

  // Select a product from catalog in the modal
  const handleSelectCatalogProduct = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    setFormData((prev) => ({
      ...prev,
      productId: prod.id,
      productName: prod.name,
      imageUrl: prod.coverImage || prod.images?.[0] || prev.imageUrl,
      unitPrice: prod.price,
      color: prod.colors?.[0] || prev.color,
      size: prod.sizes?.[0] || prev.size,
    }));
  };

  // Save Order
  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      setErrorMsg('Vui lòng điền tên khách hàng và số điện thoại.');
      return;
    }

    const calculatedTotal = formData.unitPrice * formData.quantity + formData.shippingFee;
    const calculatedWorkshopTotal = formData.workshopCost * formData.quantity;

    const orderPayload: Omit<Order, 'createdAt' | 'updatedAt'> = {
      id: formData.id.trim() || orderService.generateNextOrderId(),
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim(),
      customerAddress: formData.customerAddress.trim(),
      trackingCode: formData.trackingCode.trim(),
      items: [
        {
          productId: formData.productId,
          productName: formData.productName.trim() || 'Sản phẩm chăn ga',
          imageUrl: formData.imageUrl.trim() || '/images/placeholder.webp',
          color: formData.color.trim(),
          size: formData.size.trim(),
          quantity: Number(formData.quantity) || 1,
          unitPrice: Number(formData.unitPrice) || 0,
          workshopCost: Number(formData.workshopCost) || 0,
        },
      ],
      totalAmount: calculatedTotal,
      workshopTotalCost: calculatedWorkshopTotal,
      shippingFee: Number(formData.shippingFee) || 0,
      customerPaid: formData.customerPaid,
      workshopPaid: formData.workshopPaid,
      workshopPaidDate: formData.workshopPaid ? (formData.workshopPaidDate || new Date().toISOString().split('T')[0]) : undefined,
      status: formData.status,
      notes: formData.notes.trim(),
      orderDate: formData.orderDate || new Date().toISOString().split('T')[0],
    };

    try {
      if (editingOrder) {
        const updated = await orderService.updateOrder(editingOrder.id, orderPayload);
        setOrders((prev) => prev.map((o) => (o.id === editingOrder.id ? updated : o)));
        setSuccessMsg(`Đã cập nhật đơn hàng ${updated.id} thành công!`);
      } else {
        const created = await orderService.createOrder(orderPayload);
        setOrders((prev) => [created, ...prev]);
        setSuccessMsg(`Đã tạo đơn hàng mới ${created.id} thành công!`);
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi lưu đơn hàng');
    }
  };

  // Delete Order
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await orderService.deleteOrder(orderToDelete.id);
      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
      setSuccessMsg(`Đã xóa đơn hàng ${orderToDelete.id}`);
      setOrderToDelete(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi xóa đơn hàng');
    }
  };

  // Copy order message for Workshop
  const handleCopyWorkshopMessage = (order: Order) => {
    const item = order.items[0];
    const text = `📋 ĐƠN MAY XƯỞNG (${order.id})\n` +
      `- Mẫu: ${item?.productName || 'Chăn ga'}\n` +
      `- Màu sắc: ${item?.color || 'Theo mẫu'}\n` +
      `- Kích thước: ${item?.size || 'Tiêu chuẩn'}\n` +
      `- Số lượng: ${item?.quantity || 1} bộ\n` +
      `- Tiền xưởng: ${formatVND(order.workshopTotalCost)}\n` +
      `- Dặn dò: ${order.notes || item?.note || 'May kỹ giùm em'}`;
    navigator.clipboard.writeText(text);
    setSuccessMsg(`Đã sao chép tin nhắn gửi xưởng cho đơn ${order.id}!`);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  // Copy order message for Customer/Shipper
  const handleCopyCustomerMessage = (order: Order) => {
    const item = order.items[0];
    const text = `📦 ĐƠN HÀNG NHÀ CÓ MÙI NẮNG (${order.id})\n` +
      `- Khách: ${order.customerName} - ${order.customerPhone}\n` +
      `- Địa chỉ: ${order.customerAddress || 'Nhận tại tiệm'}\n` +
      `- Mẫu: ${item?.productName} (${item?.color} - ${item?.size}) x${item?.quantity}\n` +
      `- Thu hộ COD: ${order.customerPaid ? '0đ (Đã thanh toán trước)' : formatVND(order.totalAmount)}\n` +
      (order.trackingCode ? `- Mã vận đơn: ${order.trackingCode}\n` : '') +
      `- Ghi chú: ${order.notes || 'Hàng vải đũi tự nhiên'}`;
    navigator.clipboard.writeText(text);
    setSuccessMsg(`Đã sao chép thông tin gửi khách/shipper đơn ${order.id}!`);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#2c2825', margin: 0 }}>
              Quản lý & Check đơn hàng
            </h1>
            <span
              style={{
                backgroundColor: 'var(--accent-warm-tint, #f5efe6)',
                color: 'var(--accent-brown, #7c6a59)',
                padding: '0.2rem 0.65rem',
                borderRadius: '16px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid #e5d8cb',
              }}
            >
              {orders.length} đơn
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#685e54', marginTop: '0.25rem', margin: 0 }}>
            Kiểm tra tiến độ đơn mới, xưởng may, tiền xưởng và tình trạng ship hàng
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={loadData}
            title="Làm mới danh sách"
          >
            <RotateCcw size={15} />
            <span>Làm mới</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreateModal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <PlusCircle size={17} />
            <span>Thêm đơn hàng</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ backgroundColor: '#edf7ed', border: '1px solid #c8e6c9', color: '#1b5e20', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div style={{ backgroundColor: '#fdeeed', border: '1px solid #f9c7c4', color: '#b71c1c', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Top Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Metric 1: Đơn mới */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'new' ? 'all' : 'new')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '1.15rem',
            border: statusFilter === 'new' ? '2px solid #2563eb' : '1px solid var(--border-subtle, #e8e1d5)',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase' }}>Đơn mới</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1f2937' }}>
            {summary.newOrders}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Chờ xác nhận & gửi xưởng</span>
        </div>

        {/* Metric 2: Xưởng đang may */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'workshop_processing' ? 'all' : 'workshop_processing')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '1.15rem',
            border: statusFilter === 'workshop_processing' ? '2px solid #d97706' : '1px solid var(--border-subtle, #e8e1d5)',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase' }}>Xưởng đang may</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1f2937' }}>
            {summary.workshopProcessingOrders}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Đang may theo kích thước</span>
        </div>

        {/* Metric 3: Đã trả tiền xưởng (User emphasis!) */}
        <div
          onClick={() => setWorkshopPaidFilter(workshopPaidFilter === 'paid' ? 'all' : 'paid')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '1.15rem',
            border: workshopPaidFilter === 'paid' ? '2px solid #7c3aed' : '1px solid var(--border-subtle, #e8e1d5)',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase' }}>Đã trả xưởng</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#7c3aed' }}>
            {formatVND(summary.paidWorkshopAmount)}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {orders.filter((o) => o.workshopPaid).length} đơn đã thanh toán
          </span>
        </div>

        {/* Metric 4: Đang ship */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'shipping' ? 'all' : 'shipping')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '1.15rem',
            border: statusFilter === 'shipping' ? '2px solid #0284c7' : '1px solid var(--border-subtle, #e8e1d5)',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase' }}>Đang ship</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1f2937' }}>
            {summary.shippingOrders}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Shipper đang giao khách</span>
        </div>

        {/* Metric 5: Tiền xưởng còn nợ */}
        <div
          onClick={() => setWorkshopPaidFilter(workshopPaidFilter === 'unpaid' ? 'all' : 'unpaid')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '1.15rem',
            border: workshopPaidFilter === 'unpaid' ? '2px solid #ea580c' : '1px solid var(--border-subtle, #e8e1d5)',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#b45309', textTransform: 'uppercase' }}>Xưởng cần trả</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ea580c' }}>
            {formatVND(summary.unpaidWorkshopAmount)}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {orders.filter((o) => !o.workshopPaid && o.status !== 'cancelled').length} đơn chưa trả xưởng
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          border: '1px solid var(--border-subtle, #e8e1d5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        {/* Search input + workshop paid filter pills */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Tìm theo tên khách, SĐT, mã đơn, mẫu vải..."
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '100%' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Quick filter by workshop paid status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Tiền xưởng:</span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'unpaid', label: '⚠️ Chưa trả xưởng' },
              { id: 'paid', label: '✓ Đã trả xưởng' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`filter-chip ${workshopPaidFilter === f.id ? 'active' : ''}`}
                onClick={() => setWorkshopPaidFilter(f.id as any)}
                style={{ padding: '0.28rem 0.65rem', fontSize: '0.785rem' }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.25rem', borderTop: '1px solid #f3ede2', paddingTop: '0.75rem', scrollbarWidth: 'none' }}>
          <button
            type="button"
            className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
            style={{ flexShrink: 0 }}
          >
            Tất cả ({orders.length})
          </button>
          {(['new', 'workshop_processing', 'workshop_paid', 'shipping', 'completed', 'cancelled'] as OrderStatus[]).map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            const config = ORDER_STATUS_CONFIG[st];
            return (
              <button
                key={st}
                type="button"
                className={`filter-chip ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
                style={{ flexShrink: 0 }}
              >
                <span>{config.label}</span>
                <span style={{ opacity: 0.75 }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table & Cards */}
      <div className="admin-table-card" style={{ backgroundColor: '#ffffff', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-subtle, #e8e1d5)' }}>
        {loading ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#766352' }}>
            <RotateCcw size={24} className="spin" />
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Đang tải danh sách đơn hàng...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#6b7280' }}>
            <ShoppingBag size={40} style={{ color: '#d1c7bc', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151', margin: 0 }}>
              Không tìm thấy đơn hàng nào
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.35rem' }}>
              {searchQuery || statusFilter !== 'all' || workshopPaidFilter !== 'all'
                ? 'Không khớp với bộ lọc hiện tại. Thử chọn lại trạng thái hoặc bấm "Xóa lọc".'
                : 'Hiện tại chưa có đơn hàng nào được ghi nhận.'}
            </p>
            {(searchQuery || statusFilter !== 'all' || workshopPaidFilter !== 'all') && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setStatusFilter('all');
                  setWorkshopPaidFilter('all');
                  setSearchQuery('');
                }}
                style={{ marginTop: '0.75rem' }}
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#faf8f5', borderBottom: '1px solid var(--border-subtle, #e8e1d5)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: '#685e54', width: '100px' }}>
                    Mẫu ảnh
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: '#685e54' }}>
                    Mã & Khách hàng
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: '#685e54' }}>
                    Quy cách & Mẫu đặt
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: '#685e54' }}>
                    Tiền đơn / Tiền xưởng
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: '#685e54', minWidth: '160px' }}>
                    Trạng thái đơn
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: '#685e54', textAlign: 'right' }}>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const item = order.items[0] || {
                    productName: 'Chăn ga',
                    quantity: 1,
                    unitPrice: order.totalAmount,
                  };
                  const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.new;
                  const itemImg = item.imageUrl || '/images/placeholder.webp';

                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: '1px solid #f3ede2',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* 1. ẢNH ĐỂ BIẾT MẪU NÀO (Featured requirement) */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                        <div
                          style={{
                            position: 'relative',
                            width: '76px',
                            height: '76px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#faf8f5',
                            border: '1.5px solid var(--border-subtle, #e8e1d5)',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                          }}
                          onClick={() => setZoomedImage({ url: itemImg, title: item.productName, color: item.color })}
                          title="Bấm để phóng to xem mẫu vải chi tiết"
                        >
                          <img
                            src={itemImg}
                            alt={item.productName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/placeholder.webp';
                            }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '3px',
                              right: '3px',
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              color: '#ffffff',
                              borderRadius: '4px',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Maximize2 size={11} />
                          </div>
                        </div>
                      </td>

                      {/* 2. Mã đơn & Thông tin khách hàng */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--accent-brown, #7c6a59)', fontSize: '0.9rem' }}>
                            {order.id}
                          </span>
                          <span style={{ fontSize: '0.725rem', color: '#9ca3af' }}>
                            ({order.orderDate || order.createdAt.split('T')[0]})
                          </span>
                        </div>
                        <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.875rem' }}>
                          {order.customerName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                          <a
                            href={`tel:${order.customerPhone}`}
                            style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            title="Gọi điện cho khách"
                          >
                            <Phone size={12} />
                            <span>{order.customerPhone}</span>
                          </a>
                        </div>
                        {order.customerAddress && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '3px', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.3rem', maxWidth: '240px', lineHeight: 1.3 }}>
                            <MapPin size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{order.customerAddress}</span>
                          </div>
                        )}
                        {order.trackingCode && (
                          <div style={{ marginTop: '0.35rem', display: 'inline-flex', alignItems: 'center', gap: '3px', backgroundColor: '#f0fdf4', color: '#166534', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                            <Truck size={11} />
                            <span>Vận đơn: {order.trackingCode}</span>
                          </div>
                        )}
                      </td>

                      {/* 3. Quy cách mẫu đặt */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 600, color: '#2c2825', fontSize: '0.875rem', lineHeight: 1.35 }}>
                          {item.productName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                          {item.color && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: '#faf8f5',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                color: '#4b5563',
                                border: '1px solid #ebd9c2',
                              }}
                            >
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: getColorOption(item.color).hex,
                                  display: 'inline-block',
                                }}
                              />
                              <span>Màu: {getColorOption(item.color).label}</span>
                            </span>
                          )}
                          {item.size && (
                            <span
                              style={{
                                backgroundColor: '#f3f4f6',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                color: '#4b5563',
                              }}
                            >
                              Size: {item.size}
                            </span>
                          )}
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>
                            SL: {item.quantity}
                          </span>
                        </div>
                        {order.notes && (
                          <div style={{ fontSize: '0.75rem', color: '#b45309', backgroundColor: '#fef3c7', padding: '0.25rem 0.5rem', borderRadius: '4px', marginTop: '0.4rem', lineHeight: 1.3 }}>
                            💬 {order.notes}
                          </div>
                        )}
                      </td>

                      {/* 4. Tiền bán / Tiền xưởng */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#1f2937' }}>
                          {formatVND(order.totalAmount)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: order.customerPaid ? '#15803d' : '#ea580c', fontWeight: 500, marginTop: '2px' }}>
                          {order.customerPaid ? '✓ Khách đã thanh toán' : '⏳ Thu hộ COD'}
                        </div>

                        {/* Tiền xưởng (User emphasis: đã trả tiền xưởng) */}
                        <div style={{ marginTop: '0.5rem', borderTop: '1px dashed #e5e7eb', paddingTop: '0.4rem' }}>
                          <div style={{ fontSize: '0.785rem', color: '#4b5563' }}>
                            Tiền xưởng: <strong>{formatVND(order.workshopTotalCost)}</strong>
                          </div>
                          <div style={{ marginTop: '0.25rem' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleWorkshopPaid(order.id, order.workshopPaid)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                border: order.workshopPaid ? '1px solid #c4b5fd' : '1px solid #fed7aa',
                                backgroundColor: order.workshopPaid ? '#ede9fe' : '#fff7ed',
                                color: order.workshopPaid ? '#6d28d9' : '#c2410c',
                              }}
                              title="Bấm để chuyển đổi trạng thái đã trả / chưa trả tiền xưởng"
                            >
                              {order.workshopPaid ? <Check size={11} strokeWidth={3} /> : <Clock size={11} />}
                              <span>{order.workshopPaid ? 'ĐÃ TRẢ TIỀN XƯỞNG' : 'CHƯA TRẢ XƯỞNG'}</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* 5. Trạng thái đơn (Quick dropdown selector) */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                        <div style={{ position: 'relative' }}>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: `1.5px solid ${statusConfig.border}`,
                              backgroundColor: statusConfig.bg,
                              color: statusConfig.color,
                              width: '100%',
                              outline: 'none',
                            }}
                          >
                            <option value="new">Đơn mới</option>
                            <option value="workshop_processing">Xưởng đang may</option>
                            <option value="workshop_paid">Đã trả tiền xưởng</option>
                            <option value="shipping">Đang ship</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </div>

                        {/* Quick action: Copy message to Workshop or Shipper */}
                        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleCopyWorkshopMessage(order)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#faf8f5',
                              border: '1px solid #d5cbbf',
                              borderRadius: '4px',
                              padding: '0.2rem 0.45rem',
                              fontSize: '0.7rem',
                              color: '#685e54',
                              cursor: 'pointer',
                            }}
                            title="Sao chép tin nhắn thông số gửi xưởng may"
                          >
                            <Send size={10} />
                            <span>Gửi xưởng</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyCustomerMessage(order)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#faf8f5',
                              border: '1px solid #d5cbbf',
                              borderRadius: '4px',
                              padding: '0.2rem 0.45rem',
                              fontSize: '0.7rem',
                              color: '#685e54',
                              cursor: 'pointer',
                            }}
                            title="Sao chép thông tin gửi khách / shipper"
                          >
                            <Copy size={10} />
                            <span>Gửi ship</span>
                          </button>
                        </div>
                      </td>

                      {/* 6. Thao tác */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(order)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.3rem 0.5rem', borderRadius: '6px' }}
                            title="Chỉnh sửa đơn hàng"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderToDelete(order)}
                            style={{
                              padding: '0.3rem 0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #fecaca',
                              backgroundColor: '#fef2f2',
                              color: '#dc2626',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                            title="Xóa đơn hàng"
                          >
                            <Trash2 size={13} />
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

      {/* CREATE / EDIT ORDER MODAL */}
      {isModalOpen &&
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
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(3px)',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '680px',
                maxHeight: '92vh',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
                padding: '1.75rem',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #f2ede4', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShoppingBag size={20} color="var(--accent-brown, #7c6a59)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
                    {editingOrder ? `Chỉnh sửa đơn hàng: ${formData.id}` : 'Thêm đơn hàng mới'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveOrder}>
                {/* Section 1: Chọn mẫu từ kho sản phẩm (Auto-fill image + info) */}
                <div style={{ backgroundColor: '#faf8f5', border: '1px solid #ebd9c2', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#685e54', margin: 0 }}>
                      Chọn mẫu từ kho sản phẩm (Tự lấy ảnh & thông số):
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#8c8073' }}>
                      {products.length} sản phẩm khả dụng
                    </span>
                  </div>

                  <select
                    className="form-select"
                    value={formData.productId}
                    onChange={(e) => handleSelectCatalogProduct(e.target.value)}
                    style={{ width: '100%', marginBottom: '0.75rem' }}
                  >
                    <option value="">-- Chọn sản phẩm có sẵn trong kho --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.id}] {p.name} - {formatVND(p.price)}
                      </option>
                    ))}
                  </select>

                  {/* 1 ẢNH ĐỂ BIẾT MẪU NÀO (Preview & input) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1.5px solid #d5cbbf',
                        backgroundColor: '#ffffff',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={formData.imageUrl || '/images/placeholder.webp'}
                        alt="Mẫu đặt"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.webp';
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '0.785rem', marginBottom: '0.2rem' }}>
                        Link ảnh mẫu (đại diện cho mẫu chăn ga):
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="https://... hoặc /images/..."
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                      />
                      <span style={{ fontSize: '0.7rem', color: '#8c8073' }}>
                        Ảnh này giúp nhận diện mẫu vải ngay trên danh sách đơn.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Thông tin mẫu đặt & Số lượng */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Tên mẫu / Sản phẩm *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      placeholder="VD: Combo 4 món đũi tre cotton thoáng mát"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Màu sắc</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="VD: Xanh Cốm, Be Cát..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kích thước</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="VD: 1m8 x 2m x 20cm"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số lượng</label>
                    <input
                      type="number"
                      min={1}
                      className="form-input"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
                    />
                  </div>
                </div>

                {/* Section 3: Thông tin khách hàng */}
                <div style={{ borderTop: '1px solid #f2ede4', paddingTop: '1rem', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
                    Thông tin khách nhận hàng
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div className="form-group">
                      <label className="form-label">Tên khách hàng *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="VD: Chị Mai Lan"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số điện thoại *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        placeholder="VD: 0983 124 556"
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Địa chỉ nhận hàng</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.customerAddress}
                        onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Tiền nong & Trả tiền xưởng */}
                <div style={{ borderTop: '1px solid #f2ede4', paddingTop: '1rem', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
                    Giá bán, Tiền xưởng & Vận chuyển
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                    <div className="form-group">
                      <label className="form-label">Giá bán khách (VND)</label>
                      <input
                        type="number"
                        step={1000}
                        className="form-input"
                        value={formData.unitPrice}
                        onChange={(e) => setFormData({ ...formData, unitPrice: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ color: '#b45309' }}>Tiền trả xưởng (VND) *</label>
                      <input
                        type="number"
                        step={1000}
                        className="form-input"
                        value={formData.workshopCost}
                        onChange={(e) => setFormData({ ...formData, workshopCost: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phí ship (VND)</label>
                      <input
                        type="number"
                        step={1000}
                        className="form-input"
                        value={formData.shippingFee}
                        onChange={(e) => setFormData({ ...formData, shippingFee: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>
                  </div>

                  {/* Workshop Paid Checkbox & Customer Paid Checkbox */}
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#faf8f5', borderRadius: '6px', border: '1px solid #ebd9c2', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#6d28d9' }}>
                      <input
                        type="checkbox"
                        checked={formData.workshopPaid}
                        onChange={(e) => setFormData({ ...formData, workshopPaid: e.target.checked })}
                      />
                      <span>✓ Đã thanh toán tiền xưởng</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#166534' }}>
                      <input
                        type="checkbox"
                        checked={formData.customerPaid}
                        onChange={(e) => setFormData({ ...formData, customerPaid: e.target.checked })}
                      />
                      <span>✓ Khách đã thanh toán (không thu COD)</span>
                    </label>
                  </div>
                </div>

                {/* Section 5: Trạng thái & Vận đơn */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Trạng thái đơn hàng</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as OrderStatus })}
                    >
                      <option value="new">Đơn mới</option>
                      <option value="workshop_processing">Xưởng đang may</option>
                      <option value="workshop_paid">Đã trả tiền xưởng</option>
                      <option value="shipping">Đang ship</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mã vận đơn (Shipper)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.trackingCode}
                      onChange={(e) => setFormData({ ...formData, trackingCode: e.target.value })}
                      placeholder="VD: GHTK882910, VTP..."
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Ghi chú dặn dò (Khách / Xưởng)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="VD: Khách dặn may đệm cao 25cm, giao chiều sau 18h..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #f2ede4', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingOrder ? 'Lưu thay đổi' : 'Tạo đơn hàng'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ZOOM IMAGE LIGHTBOX */}
      {zoomedImage &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10001,
              backgroundColor: 'rgba(0,0,0,0.92)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
            onClick={() => setZoomedImage(null)}
          >
            <div
              style={{
                position: 'absolute',
                top: '1.25rem',
                left: '1.5rem',
                right: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#ffffff',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <strong style={{ fontSize: '1.05rem' }}>{zoomedImage.title}</strong>
                {zoomedImage.color && (
                  <span style={{ marginLeft: '0.65rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                    Màu: {zoomedImage.color}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '6px' }}
              >
                <X size={26} />
              </button>
            </div>

            <div style={{ maxWidth: '90vw', maxHeight: '82vh' }} onClick={(e) => e.stopPropagation()}>
              <img
                src={zoomedImage.url}
                alt={zoomedImage.title}
                style={{ maxWidth: '100%', maxHeight: '82vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
              />
            </div>
          </div>,
          document.body
        )}

      {/* DELETE CONFIRM MODAL */}
      {orderToDelete &&
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
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                padding: '1.5rem',
                maxWidth: '420px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              }}
            >
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#dc2626', margin: '0 0 0.5rem 0' }}>
                Xác nhận xóa đơn hàng?
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: '0 0 1.25rem 0' }}>
                Bạn có chắc chắn muốn xóa đơn <strong>{orderToDelete.id}</strong> của khách{' '}
                <strong>{orderToDelete.customerName}</strong> không? Hành động này không thể hoàn tác.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setOrderToDelete(null)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none' }}
                  onClick={handleDeleteOrder}
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
