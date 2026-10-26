import { Order, OrderStatus, OrderSummary } from '../types/order';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'ncnang_admin_orders_v1';

// Seed sample orders to help the user test and visualize immediately
const SAMPLE_ORDERS: Order[] = [
  {
    id: 'DH-1005',
    customerName: 'Chị Mai Lan',
    customerPhone: '0983 124 556',
    customerAddress: 'Số 45 Ngõ 12 Đặng Thai Mai, Tây Hồ, Hà Nội',
    trackingCode: 'GHTK882910321',
    items: [
      {
        productId: 'SP785',
        productName: 'Combo 4 món đũi tre cotton thoáng mát',
        imageUrl: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/SP785/1792147545122_6.jpg',
        color: 'Xanh Cốm',
        size: '1m8 x 2m x 20cm',
        quantity: 1,
        unitPrice: 240000,
        workshopCost: 155000,
        note: 'May chun bọc đệm 20cm, chừa viền gối 3cm',
      },
    ],
    totalAmount: 270000,
    workshopTotalCost: 155000,
    shippingFee: 30000,
    customerPaid: false,
    workshopPaid: false,
    status: 'new',
    notes: 'Khách dặn gọi trước khi giao, giao sau 18h',
    orderDate: '2026-10-26',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'DH-1004',
    customerName: 'Anh Quốc Huy',
    customerPhone: '0912 889 001',
    customerAddress: 'Chung cư Safira Khang Điền, Quận 9, TP. Thủ Đức',
    trackingCode: 'VTP20991421',
    items: [
      {
        productId: 'SP785',
        productName: 'Combo 4 món đũi tre cotton thoáng mát',
        imageUrl: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/SP785/1792147546980_3.jpg',
        color: 'Xanh Ocean',
        size: '2m x 2m2',
        quantity: 1,
        unitPrice: 280000,
        workshopCost: 175000,
        note: 'Đệm dày 25cm may chun ôm khít',
      },
    ],
    totalAmount: 310000,
    workshopTotalCost: 175000,
    shippingFee: 30000,
    customerPaid: true,
    workshopPaid: false,
    status: 'workshop_processing',
    notes: 'Xưởng hẹn xong chiều ngày 27/10',
    orderDate: '2026-10-25',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
  },
  {
    id: 'DH-1003',
    customerName: 'Chị Thu Trang',
    customerPhone: '0978 445 221',
    customerAddress: '188 Nguyễn Thị Minh Khai, P.6, Quận 3, TP.HCM',
    trackingCode: 'GHTK7712903',
    items: [
      {
        productId: 'BCG001',
        productName: 'Bộ chăn ga đũi tự nhiên màu Be Cát',
        imageUrl: '/images/BCG001/be_cat_01.webp',
        color: 'Be Cát',
        size: '1m6 x 2m',
        quantity: 1,
        unitPrice: 320000,
        workshopCost: 190000,
        note: 'Gồm 1 ga + 2 vỏ gối 50x70cm',
      },
    ],
    totalAmount: 350000,
    workshopTotalCost: 190000,
    shippingFee: 30000,
    customerPaid: true,
    workshopPaid: true,
    workshopPaidDate: '2026-10-24',
    status: 'workshop_paid',
    notes: 'Đã ck trả tiền xưởng 190k qua Vietcombank',
    orderDate: '2026-10-23',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'DH-1002',
    customerName: 'Anh Minh Tuấn',
    customerPhone: '0903 671 289',
    customerAddress: 'Tòa nhà Landmark 81, Vinhomes Central Park, Bình Thạnh',
    trackingCode: 'VTP99812450',
    items: [
      {
        productId: 'GA001',
        productName: 'Ga bọc đũi tự nhiên màu Mộc Trắng',
        imageUrl: '/images/GA001/moc_01.webp',
        color: 'Trắng Mộc',
        size: '1m8 x 2m',
        quantity: 2,
        unitPrice: 180000,
        workshopCost: 105000,
        note: 'May chun toàn phần 4 góc',
      },
    ],
    totalAmount: 390000,
    workshopTotalCost: 210000,
    shippingFee: 30000,
    customerPaid: false,
    workshopPaid: true,
    workshopPaidDate: '2026-10-23',
    status: 'shipping',
    notes: 'Shipper đang giao, COD thu 390k',
    orderDate: '2026-10-22',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: 'DH-1001',
    customerName: 'Chị Kim Ngân',
    customerPhone: '0945 332 119',
    customerAddress: 'Khu biệt thự Nam Long, Quận 7, TP.HCM',
    trackingCode: 'GHTK1102931',
    items: [
      {
        productId: 'SP785',
        productName: 'Combo 4 món đũi tre cotton thoáng mát',
        imageUrl: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/SP785/1792147545122_6.jpg',
        color: 'Xanh Cốm',
        size: '1m6 x 2m',
        quantity: 1,
        unitPrice: 240000,
        workshopCost: 155000,
        note: 'May tiêu chuẩn',
      },
    ],
    totalAmount: 240000,
    workshopTotalCost: 155000,
    shippingFee: 0,
    customerPaid: true,
    workshopPaid: true,
    workshopPaidDate: '2026-10-20',
    status: 'completed',
    deliveredDate: '2026-10-22',
    notes: 'Khách khen vải mát, dặn khi có màu mới thì báo',
    orderDate: '2026-10-19',
    createdAt: new Date(Date.now() - 140 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 3600 * 1000).toISOString(),
  },
];

class OrderService {
  private getLocalOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_ORDERS));
        return SAMPLE_ORDERS;
      }
      return JSON.parse(data) as Order[];
    } catch {
      return SAMPLE_ORDERS;
    }
  }

  private saveLocalOrders(orders: Order[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (err) {
      console.warn('Lỗi lưu orders vào localStorage:', err);
    }
  }

  public async getOrders(): Promise<Order[]> {
    try {
      // Attempt to read from Supabase if table exists
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(this.mapFromDb);
        }
      }
    } catch {
      // Fallback to local
    }
    return this.getLocalOrders();
  }

  public async getOrderById(id: string): Promise<Order | null> {
    const list = await this.getOrders();
    return list.find((o) => o.id === id) || null;
  }

  public async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Order> {
    const now = new Date().toISOString();
    const id = orderData.id?.trim() || this.generateNextOrderId();

    const newOrder: Order = {
      ...orderData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    // Try Supabase insert
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('orders').insert([this.mapToDb(newOrder)]);
        if (error) console.warn('Supabase orders insert notice:', error.message);
      }
    } catch {
      // Ignore
    }

    // Always update local storage
    const current = this.getLocalOrders();
    const updated = [newOrder, ...current.filter((o) => o.id !== id)];
    this.saveLocalOrders(updated);

    return newOrder;
  }

  public async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const current = this.getLocalOrders();
    const index = current.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error(`Không tìm thấy đơn hàng với mã: ${id}`);
    }

    const updatedOrder: Order = {
      ...current[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Try Supabase update
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('orders').update(this.mapToDb(updatedOrder)).eq('id', id);
      }
    } catch {
      // Ignore
    }

    current[index] = updatedOrder;
    this.saveLocalOrders(current);

    return updatedOrder;
  }

  public async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const updates: Partial<Order> = { status };
    if (status === 'completed' && !updates.deliveredDate) {
      updates.deliveredDate = new Date().toISOString().split('T')[0];
    }
    if (status === 'workshop_paid') {
      updates.workshopPaid = true;
      if (!updates.workshopPaidDate) {
        updates.workshopPaidDate = new Date().toISOString().split('T')[0];
      }
    }
    return this.updateOrder(id, updates);
  }

  public async toggleWorkshopPaid(id: string, isPaid: boolean): Promise<Order> {
    const updates: Partial<Order> = {
      workshopPaid: isPaid,
      workshopPaidDate: isPaid ? new Date().toISOString().split('T')[0] : undefined,
    };
    if (isPaid) {
      const order = await this.getOrderById(id);
      if (order && order.status === 'workshop_processing') {
        updates.status = 'workshop_paid';
      }
    }
    return this.updateOrder(id, updates);
  }

  public async deleteOrder(id: string): Promise<boolean> {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('orders').delete().eq('id', id);
      }
    } catch {
      // Ignore
    }

    const current = this.getLocalOrders();
    const filtered = current.filter((o) => o.id !== id);
    this.saveLocalOrders(filtered);
    return true;
  }

  public generateNextOrderId(): string {
    const current = this.getLocalOrders();
    const todayStr = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // e.g. "261026"
    const prefix = `DH-${todayStr}`;
    const todayOrders = current.filter((o) => o.id.startsWith(prefix));
    const nextSeq = String(todayOrders.length + 1).padStart(2, '0');
    return `${prefix}-${nextSeq}`;
  }

  public getOrderSummary(): OrderSummary {
    return this.getSummary(this.getLocalOrders());
  }

  public getSummary(orders: Order[]): OrderSummary {
    let newOrders = 0;
    let workshopProcessingOrders = 0;
    let workshopPaidOrders = 0;
    let shippingOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let totalRevenue = 0;
    let totalWorkshopCost = 0;
    let unpaidWorkshopAmount = 0;
    let paidWorkshopAmount = 0;

    for (const o of orders) {
      if (o.status === 'new') newOrders++;
      else if (o.status === 'workshop_processing') workshopProcessingOrders++;
      else if (o.status === 'workshop_paid') workshopPaidOrders++;
      else if (o.status === 'shipping') shippingOrders++;
      else if (o.status === 'completed') completedOrders++;
      else if (o.status === 'cancelled') cancelledOrders++;

      if (o.status !== 'cancelled') {
        totalRevenue += o.totalAmount || 0;
        totalWorkshopCost += o.workshopTotalCost || 0;

        if (o.workshopPaid || o.status === 'workshop_paid') {
          paidWorkshopAmount += o.workshopTotalCost || 0;
        } else {
          unpaidWorkshopAmount += o.workshopTotalCost || 0;
        }
      }
    }

    return {
      totalOrders: orders.length,
      newOrders,
      workshopProcessingOrders,
      workshopPaidOrders,
      shippingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      totalWorkshopCost,
      unpaidWorkshopAmount,
      paidWorkshopAmount,
    };
  }

  // Mapper helpers for Supabase snake_case <-> camelCase
  private mapFromDb(row: any): Order {
    return {
      id: row.id,
      customerName: row.customer_name || '',
      customerPhone: row.customer_phone || '',
      customerAddress: row.customer_address || '',
      trackingCode: row.tracking_code || '',
      items: row.items || [],
      totalAmount: Number(row.total_amount || 0),
      workshopTotalCost: Number(row.workshop_total_cost || 0),
      shippingFee: Number(row.shipping_fee || 0),
      customerPaid: Boolean(row.customer_paid),
      workshopPaid: Boolean(row.workshop_paid),
      workshopPaidDate: row.workshop_paid_date,
      status: (row.status as OrderStatus) || 'new',
      notes: row.notes || '',
      orderDate: row.order_date || row.created_at?.split('T')[0] || '',
      deliveredDate: row.delivered_date,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  }

  private mapToDb(o: Order): any {
    return {
      id: o.id,
      customer_name: o.customerName,
      customer_phone: o.customerPhone,
      customer_address: o.customerAddress,
      tracking_code: o.trackingCode,
      items: o.items,
      total_amount: o.totalAmount,
      workshop_total_cost: o.workshopTotalCost,
      shipping_fee: o.shippingFee,
      customer_paid: o.customerPaid,
      workshop_paid: o.workshopPaid,
      workshop_paid_date: o.workshopPaidDate,
      status: o.status,
      notes: o.notes,
      order_date: o.orderDate,
      delivered_date: o.deliveredDate,
      updated_at: o.updatedAt,
    };
  }
}

export const orderService = new OrderService();
