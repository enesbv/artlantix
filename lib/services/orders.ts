import { Order, OrderStatus, OrderMessage, OrderFile, FileFormat, RevisionAnnotation } from '../types';
import { INITIAL_ORDERS } from '../mock-data';
import { isSupabaseConfigured, createClient } from '../supabase/client';
import { getCurrentUser } from './auth';
import { calculateExpectedDelivery } from '../order-status';
import { STORAGE_BUCKETS, uploadToStorageBucket, validateStorageUpload } from './storage';
import { INPUT_LIMITS, normalizeFilename, normalizeOptionalText, normalizeRequiredText } from '../security';

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
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch {
    throw new Error('Browser storage is full or unavailable. Your changes were not saved. Try a smaller file.');
  }
}

export async function getOrders(userId?: string, isAdmin: boolean = false, includeDetails: boolean = false): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const columns = includeDetails ? '*, files:order_files(*), messages:order_messages(*)' : '*';
        let query = supabase.from('orders').select(columns).order('created_at', { ascending: false });
        if (!isAdmin && userId) {
          query = query.eq('user_id', userId);
        }
        const { data, error } = await query;
        if (!error && data) return data as unknown as Order[];
      }
    } catch {
      // Fallback
    }
    return [];
  }

  const all = getStoredOrders();
  if (isAdmin) {
    return all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  if (!userId) return [];
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
    return null;
  }

  const all = getStoredOrders();
  const found = all.find((o) => o.id === orderId || o.order_number === orderId);
  const user = await getCurrentUser();
  return found && user && (user.is_admin || found.user_id === user.id) ? found : null;
}

export async function createOrder(
  orderInput: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'files' | 'messages'>,
  uploadedFile?: { name: string; size: number; format: string; url?: string; rawFile?: File }
): Promise<Order> {
  const projectName = normalizeRequiredText(orderInput.project_name, 'Project name', INPUT_LIMITS.project);
  const notes = normalizeOptionalText(orderInput.notes, 'Notes', INPUT_LIMITS.notes);
  const uploadFilename = uploadedFile ? normalizeFilename(uploadedFile.name) : undefined;
  const randomSuffix = crypto.randomUUID();
  const orderNumber = `ATX-${randomSuffix}`;
  const now = new Date().toISOString();
  const orderId = randomSuffix;

  let uploadStoragePath = uploadedFile?.url || (uploadFilename ? `/mock-assets/${uploadFilename}` : '');
  let uploadPublicUrl = uploadedFile?.url;

  if (uploadedFile && isSupabaseConfigured()) {
    let uploadBody: File | Blob | undefined = uploadedFile.rawFile instanceof Blob ? uploadedFile.rawFile : undefined;
    if (!uploadBody && uploadedFile.url?.startsWith('data:')) {
      const restoredBlob = await fetch(uploadedFile.url).then((response) => response.blob());
      uploadBody = new File([restoredBlob], uploadFilename!, { type: restoredBlob.type });
    }
    if (!uploadBody) throw new Error('Please select the artwork file again before submitting.');
    const extension = uploadFilename?.split('.').pop()?.toLowerCase() || uploadedFile.format;
    const destinationPath = `${orderInput.user_id}/${orderId}/${crypto.randomUUID()}.${extension}`;
    const stored = await uploadToStorageBucket(uploadBody as File, STORAGE_BUCKETS.CUSTOMER_ASSETS, destinationPath);
    if (stored.error) throw new Error(`Artwork upload failed: ${stored.error}`);
    uploadStoragePath = stored.path;
    uploadPublicUrl = undefined;
  }

  const initialFiles: OrderFile[] = uploadedFile
    ? [
        {
          id: `fil_${Date.now()}`,
          order_id: orderId,
          user_id: orderInput.user_id,
          file_category: 'customer_upload',
          format: (uploadedFile.format || 'png') as FileFormat,
          storage_path: uploadStoragePath,
          filename: uploadFilename!,
          size_bytes: uploadedFile.size,
          created_at: now,
          url: uploadPublicUrl,
        },
      ]
    : [];

  const newOrder: Order = {
    ...orderInput,
    project_name: projectName,
    notes,
    id: orderId,
    order_number: orderNumber,
    created_at: now,
    updated_at: now,
    expected_delivery_at: calculateExpectedDelivery(now, orderInput.turnaround),
    status_history: [{
      id: `status_${Date.now()}`,
      status: orderInput.status,
      created_at: now,
      actor: 'customer',
    }],
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
        const { data: savedOrder, error } = await supabase.from('orders').insert([{
          id: newOrder.id,
          order_number: newOrder.order_number,
          user_id: newOrder.user_id,
          project_name: newOrder.project_name,
          artwork_type: newOrder.artwork_type,
          complexity: newOrder.complexity,
          colors: newOrder.colors,
          has_text: newOrder.has_text,
          reconstruction_needed: newOrder.reconstruction_needed,
          reconstruction_level: newOrder.reconstruction_level,
          turnaround: newOrder.turnaround,
          estimated_price: newOrder.estimated_price,
          final_price: newOrder.final_price,
          status: newOrder.status,
          notes: newOrder.notes,
          needs_manual_review: newOrder.needs_manual_review,
          payment_method: newOrder.payment_method,
          expected_delivery_at: newOrder.expected_delivery_at,
          assigned_artist: newOrder.assigned_artist,
          source_order_id: newOrder.source_order_id,
          status_history: newOrder.status_history,
          revision_annotations: newOrder.revision_annotations,
        }]).select('*').single();

        if (error) throw new Error('The order could not be saved securely. Please try again.');
        if (!error) {
          if (uploadedFile) {
            const { error: fileError } = await supabase.from('order_files').insert([{
              order_id: newOrder.id,
              user_id: newOrder.user_id,
              file_category: 'customer_upload',
              format: uploadedFile.format,
              storage_path: uploadStoragePath,
              filename: uploadFilename!,
              size_bytes: uploadedFile.size,
            }]);
            if (fileError) throw new Error('The uploaded file could not be attached to the order. Please contact support.');
          }
          return { ...newOrder, ...(savedOrder as Order), files: initialFiles, messages: [] };
        }
      }
    } catch (error) {
      throw error;
    }
    throw new Error('Unable to save the order. Please try again.');
  }

  const all = getStoredOrders();
  all.unshift(newOrder);
  saveOrders(all);
  return newOrder;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  finalPrice?: number,
  revisionAnnotations?: RevisionAnnotation[],
  assignedArtist?: string
): Promise<Order | null> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (!supabase) throw new Error('Database unavailable.');
    const now = new Date().toISOString();
    const { error } = await supabase.from('orders').update({
      status,
      ...(finalPrice !== undefined ? { final_price: finalPrice } : {}),
      updated_at: now,
      ...(revisionAnnotations ? { revision_annotations: revisionAnnotations } : {}),
      ...(assignedArtist ? { assigned_artist: assignedArtist } : {}),
    }).eq('id', orderId);
    if (error) throw new Error('The order update could not be saved. Please try again.');
    return getOrderById(orderId);
  }
  const all = getStoredOrders();
  const index = all.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const current = all[index];
  const now = new Date().toISOString();

  current.status = status;
  current.updated_at = now;
  current.status_history = [
    ...(current.status_history || []),
    { id: `status_${Date.now()}`, status, created_at: now, actor: 'studio' },
  ];
  if (revisionAnnotations) current.revision_annotations = revisionAnnotations;
  if (assignedArtist) current.assigned_artist = assignedArtist;
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

export async function requestRevision(orderId: string, feedback: string, senderName: string = 'Alex Morgan', annotations: RevisionAnnotation[] = []): Promise<Order | null> {
  const order = await getOrderById(orderId);
  if (!order) return null;

  if (annotations.length > INPUT_LIMITS.revisionMarkers) throw new Error('Too many revision markers were added.');
  const cleanFeedback = normalizeOptionalText(feedback, 'Revision feedback', INPUT_LIMITS.message) || '';
  const cleanAnnotations = annotations.filter((annotation) => annotation.message.trim()).map((annotation) => ({
    ...annotation,
    x: Number(annotation.x),
    y: Number(annotation.y),
    message: normalizeRequiredText(annotation.message, 'Revision marker', INPUT_LIMITS.revisionMessage),
  }));
  if (cleanAnnotations.some((annotation) =>
    !Number.isFinite(annotation.x) || !Number.isFinite(annotation.y) ||
    annotation.x < 0 || annotation.x > 100 || annotation.y < 0 || annotation.y > 100
  )) throw new Error('Revision marker coordinates are invalid.');
  const markerSummary = cleanAnnotations.map((annotation, index) =>
    `Marker ${index + 1} (${annotation.x.toFixed(1)}%, ${annotation.y.toFixed(1)}%): ${annotation.message.trim()}`
  ).join('\n');
  const combinedMessage = `[Revision Requested]\n${cleanFeedback}${markerSummary ? `\n\nArtwork markers:\n${markerSummary}` : ''}`;
  if (combinedMessage.length > INPUT_LIMITS.message) throw new Error('The revision request is too long.');
  await addOrderMessage(orderId, order.user_id, senderName, 'customer', combinedMessage);
  const updated = await updateOrderStatus(orderId, 'revision_requested', undefined, cleanAnnotations);
  if (!updated || isSupabaseConfigured()) return updated;
  const all = getStoredOrders();
  const index = all.findIndex((item) => item.id === orderId);
  if (index !== -1) {
    all[index].revision_annotations = cleanAnnotations;
    saveOrders(all);
    return all[index];
  }
  return updated;
}

export async function approveOrder(orderId: string, senderName: string = 'Alex Morgan'): Promise<Order | null> {
  const order = await getOrderById(orderId);
  if (!order) return null;

  await addOrderMessage(
    orderId,
    order.user_id,
    senderName,
    'customer',
    'Artwork approved. The studio can now prepare and quality-check the production master files.'
  );
  return updateOrderStatus(orderId, 'approved');
}

export async function addOrderMessage(
  orderId: string,
  senderId: string,
  senderName: string,
  senderType: 'customer' | 'operator',
  messageText: string
): Promise<OrderMessage> {
  const message = normalizeRequiredText(messageText, 'Message', INPUT_LIMITS.message);
  const now = new Date().toISOString();
  const newMessage: OrderMessage = {
    id: `msg_${Date.now()}`,
    order_id: orderId,
    sender_id: senderId,
    sender_name: senderName,
    sender_type: senderType,
    message,
    created_at: now,
  };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (!supabase) throw new Error('Message service is unavailable.');
    const { data, error } = await supabase.from('order_messages').insert([{
      order_id: orderId,
      sender_id: senderId,
      sender_type: senderType,
      message,
    }]).select('*').single();
    if (error) throw new Error('The message could not be sent. Please try again.');
    return { ...newMessage, ...(data as OrderMessage), sender_name: senderName };
  }

  const all = getStoredOrders();
  const index = all.findIndex((o) => o.id === orderId);
  if (index !== -1) {
    all[index].messages = [...(all[index].messages || []), newMessage];
    all[index].updated_at = now;
    saveOrders(all);
  }

  return newMessage;
}

export async function addOperatorDeliverable(
  orderId: string,
  category: 'preview_watermarked' | 'final_master',
  format: 'ai' | 'eps' | 'svg' | 'pdf' | 'png',
  filename: string,
  file?: File
): Promise<OrderFile> {
  const now = new Date().toISOString();
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found.');
  const cleanFilename = normalizeFilename(filename);
  let storagePath = `/mock-assets/${cleanFilename}`;

  if (isSupabaseConfigured()) {
    if (!file) throw new Error('Choose a real deliverable file before changing the delivery status.');
    const bucket = category === 'final_master' ? STORAGE_BUCKETS.MASTER_DELIVERIES : STORAGE_BUCKETS.PREVIEWS;
    await validateStorageUpload(file, bucket, format);
    const stored = await uploadToStorageBucket(file, bucket, `${order.user_id}/${orderId}/${crypto.randomUUID()}.${format}`);
    if (stored.error) throw new Error(`Deliverable upload failed: ${stored.error}`);
    storagePath = stored.path;
  }

  const newFile: OrderFile = {
    id: `fil_${Date.now()}_${format}`,
    order_id: orderId,
    user_id: order.user_id,
    file_category: category,
    format,
    storage_path: storagePath,
    filename: cleanFilename,
    size_bytes: file?.size || 1850000,
    created_at: now,
  };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (!supabase) throw new Error('Deliverable service is unavailable.');
    const { data, error } = await supabase.from('order_files').insert([{
      order_id: orderId,
      user_id: order.user_id,
      file_category: category,
      format,
      storage_path: storagePath,
      filename: cleanFilename,
      size_bytes: file?.size,
    }]).select('*').single();
    if (error) throw new Error('The deliverable record could not be saved. Please try again.');
    return data as OrderFile;
  }

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
