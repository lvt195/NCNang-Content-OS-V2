export type OrderStatus =
  | 'new'                 // Đơn mới (mới tạo, chờ xác nhận / gửi xưởng)
  | 'workshop_processing'  // Xưởng đang may
  | 'workshop_paid'       // Đã trả tiền xưởng
  | 'shipping'            // Đang ship
  | 'completed'           // Hoàn thành
  | 'cancelled';          // Đã hủy

export interface OrderItem {
  productId?: string;
  productName: string;
  imageUrl?: string;      // 1 ảnh để nhận diện mẫu vải/họa tiết
  color?: string;         // Màu sắc (vd: "Xanh Cốm", "Be Cát")
  size?: string;          // Kích thước (vd: "1m8 x 2m x 20cm")
  quantity: number;
  unitPrice: number;      // Giá bán cho khách (VND)
  workshopCost?: number;  // Giá vốn / tiền công xưởng (VND)
  note?: string;          // Ghi chú chi tiết cho món (vd: may chun bọc, chần bông...)
}

export interface Order {
  id: string;               // Mã đơn hàng (vd: "DH-1001", "DH-2610-01")
  customerName: string;     // Tên người đặt (vd: Chị Mai Lan, Anh Quốc Huy...)
  imageUrl: string;         // 1 ảnh đại diện để biết mẫu nào (upload từ máy, link hoặc web)
  orderText: string;        // Text thông tin đơn: SĐT, mẫu vải, kích thước đệm, địa chỉ, dặn dò
  salePrice: number;        // Giá bán cho khách (VND)
  workshopCost: number;     // Giá vốn / tiền xưởng may (VND)
  hasShippingFee: boolean;  // Checkbox: Có thu tiền ship của khách hay không
  shippingFee: number;      // Tiền ship (VND, vd: 30000)
  trackingCode?: string;    // Mã vận đơn (GHTK, Viettel Post...)
  workshopPaid: boolean;    // Đã trả tiền xưởng chưa (true/false)
  status: OrderStatus;      // Trạng thái đơn
  notes?: string;           // Ghi chú thêm (nếu có)
  createdAt: string;
  updatedAt?: string;

  // Trường hỗ trợ tương thích ngược với dữ liệu cũ
  customerPhone?: string;
  customerAddress?: string;
  items?: OrderItem[];
  totalAmount?: number;
  workshopTotalCost?: number;
  customerPaid?: boolean;
  workshopPaidDate?: string;
  orderDate?: string;
  deliveredDate?: string;
}

export interface OrderSummary {
  totalOrders: number;
  newOrders: number;
  workshopProcessingOrders: number;
  workshopPaidOrders: number;
  shippingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;         // Tổng doanh thu (các đơn trừ đơn hủy)
  totalWorkshopCost: number;    // Tổng tiền xưởng
  unpaidWorkshopAmount: number; // Tiền xưởng còn nợ (chưa thanh toán cho xưởng)
  paidWorkshopAmount: number;   // Tiền xưởng đã thanh toán
}

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badgeClass: string; bg: string; color: string; border: string; description: string }
> = {
  new: {
    label: 'Đơn mới',
    badgeClass: 'badge-new',
    bg: '#eff6ff',
    color: '#1d4ed8',
    border: '#bfdbfe',
    description: 'Đơn mới tạo, chờ xác nhận hoặc gửi xưởng',
  },
  workshop_processing: {
    label: 'Xưởng đang may',
    badgeClass: 'badge-workshop',
    bg: '#fef3c7',
    color: '#b45309',
    border: '#fde68a',
    description: 'Xưởng đang cắt may theo yêu cầu',
  },
  workshop_paid: {
    label: 'Đã trả tiền xưởng',
    badgeClass: 'badge-paid',
    bg: '#ede9fe',
    color: '#6d28d9',
    border: '#ddd6fe',
    description: 'Đã thanh toán đủ tiền may cho xưởng',
  },
  shipping: {
    label: 'Đang ship',
    badgeClass: 'badge-shipping',
    bg: '#e0f2fe',
    color: '#0369a1',
    border: '#bae6fd',
    description: 'Đã giao cho đơn vị vận chuyển / đang giao khách',
  },
  completed: {
    label: 'Hoàn thành',
    badgeClass: 'badge-completed',
    bg: '#dcfce7',
    color: '#15803d',
    border: '#bbf7d0',
    description: 'Khách đã nhận hàng và hoàn tất thanh toán',
  },
  cancelled: {
    label: 'Đã hủy',
    badgeClass: 'badge-cancelled',
    bg: '#f3f4f6',
    color: '#6b7280',
    border: '#e5e7eb',
    description: 'Đơn đã hủy hoặc hoàn trả',
  },
};
