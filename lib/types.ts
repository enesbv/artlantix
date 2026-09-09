export type AccountType = 'individual' | 'business';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  account_type: AccountType;
  company_name?: string;
  business_type?: string;
  vat_tax_id?: string;
  phone?: string;
  is_admin: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export type OrderStatus =
  | 'quote_requested'
  | 'in_review'
  | 'in_progress'
  | 'preview_ready'
  | 'approved'
  | 'revision_requested'
  | 'completed'
  | 'cancelled';

export type ArtworkType =
  | 'ai_logo'
  | 'lowres_logo'
  | 'sketch_scan'
  | 'lettering_typography'
  | 'mascot_badge'
  | 'apparel_signage';

export type ComplexityTier = 'simple' | 'standard' | 'complex';

export type ReconstructionNeed = 'none' | 'text_rebuild' | 'missing_parts' | 'heavy_reconstruction';

export type ColorCount = '1-2' | '3-5' | '6+' | 'gradient';

export type TurnaroundSpeed = 'standard' | 'express';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name?: string;
  customer_email?: string;
  project_name: string;
  artwork_type: ArtworkType;
  complexity: ComplexityTier;
  colors: string;
  has_text: boolean;
  reconstruction_needed: boolean;
  reconstruction_level?: 'clean' | 'moderate' | 'heavy';
  turnaround: TurnaroundSpeed;
  estimated_price: number;
  final_price: number;
  status: OrderStatus;
  notes?: string;
  needs_manual_review?: boolean;
  payment_method?: 'card_simulated' | 'invoice_b2b' | 'pay_after_quote_review';
  expected_delivery_at?: string;
  assigned_artist?: string;
  source_order_id?: string;
  status_history?: OrderStatusEvent[];
  revision_annotations?: RevisionAnnotation[];
  created_at: string;
  updated_at: string;
  files?: OrderFile[];
  messages?: OrderMessage[];
}

export interface OrderStatusEvent {
  id: string;
  status: OrderStatus;
  created_at: string;
  actor?: string;
}

export interface RevisionAnnotation {
  id: string;
  x: number;
  y: number;
  message: string;
  created_at: string;
}

export type FileCategory =
  | 'customer_upload'
  | 'preview_watermarked'
  | 'final_master'
  | 'revision_ref';

export type FileFormat = 'jpg' | 'png' | 'ai' | 'eps' | 'svg' | 'pdf' | 'webp';

export interface OrderFile {
  id: string;
  order_id: string;
  user_id: string;
  file_category: FileCategory;
  format: FileFormat;
  storage_path: string;
  filename: string;
  size_bytes?: number;
  created_at: string;
  url?: string;
}

export interface OrderMessage {
  id: string;
  order_id: string;
  sender_id: string;
  sender_name?: string;
  sender_type: 'customer' | 'operator';
  message: string;
  created_at: string;
}

export interface PricingCalculation {
  basePrice: number;
  textReconstruction: number;
  geometryReconstruction: number;
  colorAddon: number;
  speedMultiplier: number;
  subtotal: number;
  total: number;
  needsManualReview: boolean;
  manualReviewReason?: string;
  breakdown: { label: string; amount: number }[];
}

export interface BeforeAfterShowcase {
  id: string;
  title: string;
  category: string;
  clientType?: string;
  badge?: string;
  rasterUrl: string;
  vectorUrl?: string;
  vectorSvgContent?: string;
  description: string;
  active?: boolean;
  created_at?: string;
  stats?: {
    pointsReduced: string;
    formatDelivered: string;
    turnaround: string;
    tolerance: string;
  };
}
