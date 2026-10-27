import { Order, OrderStatus, OrderSummary } from '../types/order';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'ncnang_admin_orders_v2';

// Clear legacy sample storage key if present
try {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ncnang_admin_orders_v1');
  }
} catch {
  // ignore
}

class OrderService {
  private normalizeOrder(o: any): Order {
    const imageUrl = o.imageUrl || o.items?.[0]?.imageUrl || '';
    const orderText = o.orderText || [
      o.customerName,
      o.items?.[0]?.productName,
      o.items?.[0]?.color,
      o.items?.[0]?.size,
      o.customerPhone,
      o.customerAddress
    ].filter(Boolean).join(' • ') || 'Đơn hàng mới';
    const salePrice = Number(o.salePrice ?? o.totalAmount ?? 0);
    const workshopCost = Number(o.workshopCost ?? o.workshopTotalCost ?? 0);
    const workshopPaid = Boolean(o.workshopPaid || o.status === 'workshop_paid');
    const status: OrderStatus = o.status === 'workshop_paid' ? 'workshop_processing' : (o.status || 'new');

    return {
      id: o.id || this.generateNextOrderId(),
      imageUrl,
      orderText,
      salePrice,
      workshopCost,
      workshopPaid,
      status,
      notes: o.notes || '',
      createdAt: o.createdAt || new Date().toISOString(),
      updatedAt: o.updatedAt || new Date().toISOString(),
      totalAmount: salePrice,
      workshopTotalCost: workshopCost,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      items: o.items,
    };
  }

  private getLocalOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }
      const raw = JSON.parse(data) as any[];
      return Array.isArray(raw) ? raw.map((o) => this.normalizeOrder(o)) : [];
    } catch {
      return [];
    }
  }

  private saveLocalOrders(orders: Order[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (err) {
      console.warn('Lỗi lưu orders vào localStorage:', err);
    }
  }

  public async clearAllOrders(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch (err) {
      console.warn('Lỗi clear orders:', err);
    }
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('orders').delete().neq('id', '');
      }
    } catch {
      // Ignore
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

      const price = Number(o.salePrice ?? o.totalAmount ?? 0);
      const cost = Number(o.workshopCost ?? o.workshopTotalCost ?? 0);

      if (o.status !== 'cancelled') {
        totalRevenue += price;
        totalWorkshopCost += cost;

        if (o.workshopPaid || o.status === 'workshop_paid') {
          paidWorkshopAmount += cost;
        } else {
          unpaidWorkshopAmount += cost;
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
  private mapFromDb = (row: any): Order => {
    return this.normalizeOrder({
      id: row.id,
      imageUrl: row.image_url || row.items?.[0]?.imageUrl || '',
      orderText: row.order_text || row.customer_name || '',
      salePrice: Number(row.sale_price ?? row.total_amount ?? 0),
      workshopCost: Number(row.workshop_cost ?? row.workshop_total_cost ?? 0),
      workshopPaid: Boolean(row.workshop_paid),
      status: row.status as OrderStatus,
      notes: row.notes || '',
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      items: row.items,
    });
  };

  private mapToDb = (o: Order): any => {
    return {
      id: o.id,
      image_url: o.imageUrl,
      order_text: o.orderText,
      sale_price: o.salePrice,
      workshop_cost: o.workshopCost,
      workshop_paid: o.workshopPaid,
      status: o.status,
      notes: o.notes,
      total_amount: o.salePrice,
      workshop_total_cost: o.workshopCost,
      customer_name: o.customerName || o.orderText.slice(0, 50),
      customer_phone: o.customerPhone || '',
      updated_at: o.updatedAt,
    };
  };
}

export const orderService = new OrderService();
