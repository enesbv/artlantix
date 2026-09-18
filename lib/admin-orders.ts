import { getExpectedDelivery } from './order-status';
import type { Order, OrderStatus } from './types';

export const ADMIN_STATUS_LABELS: Record<OrderStatus, string> = {
  quote_requested: 'Teklif talebi', in_review: 'İnceleniyor', in_progress: 'Üretimde',
  preview_ready: 'Müşteri onayı bekliyor', approved: 'Paketleme bekliyor',
  revision_requested: 'Revizyon istendi', completed: 'Teslim edildi', cancelled: 'İptal edildi',
};

export function getOperatorAlerts(orders: Order[], now: number) {
  return orders.flatMap((order) => {
    if (['completed', 'cancelled'].includes(order.status)) return [];
    const overdue = new Date(getExpectedDelivery(order)).getTime() < now;
    const reason = overdue ? 'Tahmini teslim tarihi geçti' :
      order.status === 'revision_requested' ? 'Müşteri revizyon istedi' :
      order.status === 'approved' ? 'Onaylandı, master teslimi bekliyor' :
      ['quote_requested', 'in_review'].includes(order.status) ? 'Dosya incelemesi ve teklif bekliyor' : null;
    return reason ? [{ order, reason, overdue }] : [];
  }).sort((a, b) => Number(b.overdue) - Number(a.overdue)
    || new Date(b.order.updated_at).getTime() - new Date(a.order.updated_at).getTime());
}
