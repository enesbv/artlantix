import { Order, OrderStatus, OrderStatusEvent } from './types';

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  'quote_requested',
  'in_review',
  'in_progress',
  'preview_ready',
  'approved',
  'revision_requested',
  'completed',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  quote_requested: 'Quote requested',
  in_review: 'Artwork under review',
  in_progress: 'Artist is redrawing your artwork',
  preview_ready: 'Your preview is ready for review',
  approved: 'Artwork approved; master files are being packaged',
  revision_requested: 'Requested changes are being applied',
  completed: 'Master files are ready',
  cancelled: 'Order cancelled',
};

export function calculateExpectedDelivery(createdAt: string, turnaround: Order['turnaround']): string {
  const created = new Date(createdAt);
  const hours = turnaround === 'express' ? 16 : 48;
  return new Date(created.getTime() + hours * 60 * 60 * 1000).toISOString();
}

export function getExpectedDelivery(order: Order): string {
  return order.expected_delivery_at || calculateExpectedDelivery(order.created_at, order.turnaround);
}

export function getNextOrderAction(order: Order): { title: string; detail: string; action?: 'review' | 'message' | 'download' } {
  switch (order.status) {
    case 'quote_requested':
      return { title: 'The studio is checking your quote', detail: 'No action is required. We will confirm the complexity and final price.', action: 'message' };
    case 'in_review':
      return { title: 'Your artwork is being assessed', detail: 'We are checking geometry, lettering and production tolerances.', action: 'message' };
    case 'in_progress':
      return { title: 'Your artist is rebuilding the artwork', detail: 'We will notify you in the portal when a watermarked preview is ready.', action: 'message' };
    case 'preview_ready':
      return { title: 'Your approval is needed', detail: 'Review the preview, approve it or mark the areas that need changes.', action: 'review' };
    case 'revision_requested':
      return { title: 'Your revision request was received', detail: 'The artist is applying your notes. No action is needed right now.', action: 'message' };
    case 'approved':
      return { title: 'Approval received', detail: 'The studio is preparing and checking your production master files.', action: 'message' };
    case 'completed':
      return { title: 'Your production files are ready', detail: 'Download individual formats or the complete master bundle.', action: 'download' };
    default:
      return { title: 'This order is closed', detail: 'Contact the studio if you need help with this project.', action: 'message' };
  }
}

export function getStatusHistory(order: Order): OrderStatusEvent[] {
  if (order.status_history?.length) {
    const history = [...order.status_history];
    if (!history.some((event) => event.status === order.status)) {
      history.push({ id: `${order.id}-${order.status}`, status: order.status, created_at: order.updated_at });
    }
    return history.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(order.status);
  if (currentIndex < 0) return [{ id: `${order.id}-${order.status}`, status: order.status, created_at: order.updated_at }];
  const path = order.status === 'revision_requested'
    ? ['quote_requested', 'in_review', 'in_progress', 'preview_ready', 'revision_requested'] as OrderStatus[]
    : ORDER_STATUS_SEQUENCE.slice(0, currentIndex + 1).filter((status) => status !== 'revision_requested');
  return path
    .map((status, index) => ({
      id: `${order.id}-${status}`,
      status,
      created_at: index === 0 ? order.created_at : index === path.length - 1 ? order.updated_at : order.created_at,
    }));
}
