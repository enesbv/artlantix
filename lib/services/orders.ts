import { Order, OrderStatus, OrderMessage, OrderFile, FileFormat } from '../types';
import { INITIAL_ORDERS } from '../mock-data';
import { isSupabaseConfigured, createClient } from '../supabase/client';

const STORAGE_KEY_ORDERS = 'artlantix_orders_data';

function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
}

function saveOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
}

export async function getOrders(userId?: string, isAdmin: boolean = false): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        let query = supabase.from('orders').select('*, files:order_files(*), messages:order_messages(*)').order('created_at', { ascending: false });
        if (!isAdmin && userId) {
          query = query.eq('user_id', userId);
        }
        const { data, error } = await query;
        if (!error && data) return data as Order[];
      }
    } catch {
      // Fallback
    }
  }

  const all = getStoredOrders();
  if (isAdmin) {
    return all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  if (!userId) return all;
  return all
    .filter((o) => o.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('orders')
          .select('*, files:order_files(*), messages:order_messages(*)')
          .eq('id', orderId)
          .single();
        if (!error && data) return data as Order;
      }
    } catch {
      // Fallback
    }
  }

  const all = getStoredOrders();
  const found = all.find((o) => o.id === orderId || o.order_number === orderId);
  return found || null;
}

export async function createOrder(
  orderInput: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'files' | 'messages'>,
  uploadedFile?: { name: string; size: number; format: string; url?: string }
): Promise<Order> {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `ATX-${randomSuffix}`;
  const now = new Date().toISOString();
  const orderId = `ord_atx_${randomSuffix}`;

  const initialFiles: OrderFile[] = uploadedFile
    ? [
        {
          id: `fil_${Date.now()}`,
          order_id: orderId,
          user_id: orderInput.user_id,
          file_category: 'customer_upload',
          format: (uploadedFile.format || 'png') as FileFormat,
          storage_path: uploadedFile.url || `/mock-assets/${uploadedFile.name}`,
          filename: uploadedFile.name,
          size_bytes: uploadedFile.size,
          created_at: now,
          url: uploadedFile.url,
        },
      ]
    : [];

  const newOrder: Order = {
    ...orderInput,
    id: orderId,
    order_number: orderNumber,
    created_at: now,
    updated_at: now,
    files: initialFiles,
    messages: [
      {
        id: `msg_${Date.now()}`,
        order_id: orderId,
        sender_id: 'system',
        sender_name: 'Artlantix System',
        sender_type: 'operator',
        message: orderInput.needs_manual_review
          ? 'Quote requested with Senior Artist review required. We are analyzing the geometry and will notify you with the final confirmed price.'
          : 'Order received and logged into the Artlantix production queue. An artist will begin manual path reconstruction shortly.',
        created_at: now,
      },
    ],
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.from('orders').insert([{
          id: newOrder.id,
          order_number: newOrder.order_number,
          user_id: newOrder.user_id,
          project_name: newOrder.project_name,
          artwork_type: newOrder.artwork_type,
          complexity: newOrder.complexity,
          colors: newOrder.colors,
          has_text: newOrder.has_text,
          reconstruction_needed: newOrder.reconstruction_needed,
          turnaround: newOrder.turnaround,
          estimated_price: newOrder.estimated_price,
          final_price: newOrder.final_price,
          status: newOrder.status,
          notes: newOrder.notes,
        }]);

        if (!error) {
          if (uploadedFile) {
            await supabase.from('order_files').insert([{
              order_id: newOrder.id,
              user_id: newOrder.user_id,
              file_category: 'customer_upload',
              format: uploadedFile.format,
              storage_path: uploadedFile.url || `/mock-assets/${uploadedFile.name}`,
              filename: uploadedFile.name,
              size_bytes: uploadedFile.size,
            }]);
          }
          return newOrder;
        }
      }
    } catch {
      // Fallback
    }
  }

  const all = getStoredOrders();
  all.unshift(newOrder);
  saveOrders(all);
  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, finalPrice?: number): Promise<Order | null> {
  const all = getStoredOrders();
  const index = all.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const current = all[index];
  const now = new Date().toISOString();

  current.status = status;
  current.updated_at = now;
  if (finalPrice !== undefined) {
    current.final_price = finalPrice;
  }

  // If approved and completed, unlock full suite of master vector deliverables if not already present
  if (status === 'completed') {
    const hasMaster = current.files?.some((f) => f.file_category === 'final_master');
    if (!hasMaster) {
      const masterFormats = ['ai', 'eps', 'svg', 'pdf', 'png'] as const;
      const deliverables: OrderFile[] = masterFormats.map((fmt) => ({
        id: `fil_${orderId}_${fmt}`,
        order_id: orderId,
        user_id: 'usr_admin_001',
        file_category: 'final_master',
        format: fmt,
        storage_path: `/mock-assets/${current.order_number}-Master.${fmt}`,
        filename: `${current.project_name.replace(/\s+/g, '-')}-Production-Ready.${fmt}`,
        size_bytes: fmt === 'ai' ? 4200000 : fmt === 'eps' ? 2600000 : fmt === 'svg' ? 145000 : fmt === 'pdf' ? 1800000 : 850000,
        created_at: now,
      }));
      current.files = [...(current.files || []), ...deliverables];
    }
  }

  all[index] = current;
  saveOrders(all);

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase
          .from('orders')
          .update({ status, final_price: current.final_price, updated_at: now })
          .eq('id', orderId);
      }
    } catch {
      // Ignore
    }
  }

  return current;
}

export async function requestRevision(orderId: string, feedback: string, senderName: string = 'Alex Morgan'): Promise<Order | null> {
  const order = await getOrderById(orderId);
  if (!order) return null;

  await addOrderMessage(orderId, order.user_id, senderName, 'customer', `[Revision Requested]: ${feedback}`);
  return updateOrderStatus(orderId, 'revision_requested');
}

export async function approveOrder(orderId: string, senderName: string = 'Alex Morgan'): Promise<Order | null> {
  const order = await getOrderById(orderId);
  if (!order) return null;

  await addOrderMessage(
    orderId,
    order.user_id,
    senderName,
    'customer',
    'Artwork approved! Master vector files unlocked for production.'
  );
  return updateOrderStatus(orderId, 'completed');
}

export async function addOrderMessage(
  orderId: string,
  senderId: string,
  senderName: string,
  senderType: 'customer' | 'operator',
  messageText: string
): Promise<OrderMessage> {
  const now = new Date().toISOString();
  const newMessage: OrderMessage = {
    id: `msg_${Date.now()}`,
    order_id: orderId,
    sender_id: senderId,
    sender_name: senderName,
    sender_type: senderType,
    message: messageText,
    created_at: now,
  };

  const all = getStoredOrders();
  const index = all.findIndex((o) => o.id === orderId);
  if (index !== -1) {
    all[index].messages = [...(all[index].messages || []), newMessage];
    all[index].updated_at = now;
    saveOrders(all);
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.from('order_messages').insert([{
          order_id: orderId,
          sender_id: senderId,
          sender_type: senderType,
          message: messageText,
        }]);
      }
    } catch {
      // Ignore
    }
  }

  return newMessage;
}

export async function addOperatorDeliverable(
  orderId: string,
  category: 'preview_watermarked' | 'final_master',
  format: 'ai' | 'eps' | 'svg' | 'pdf' | 'png',
  filename: string
): Promise<OrderFile> {
  const now = new Date().toISOString();
  const newFile: OrderFile = {
    id: `fil_${Date.now()}_${format}`,
    order_id: orderId,
    user_id: 'usr_admin_001',
    file_category: category,
    format,
    storage_path: `/mock-assets/${filename}`,
    filename,
    size_bytes: 1850000,
    created_at: now,
  };

  const all = getStoredOrders();
  const index = all.findIndex((o) => o.id === orderId);
  if (index !== -1) {
    all[index].files = [...(all[index].files || []), newFile];
    if (category === 'preview_watermarked') {
      all[index].status = 'preview_ready';
    }
    all[index].updated_at = now;
    saveOrders(all);
  }

  return newFile;
}
