export interface CheckoutSessionInput {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerEmail: string;
  projectName: string;
  paymentMethod: 'card_simulated' | 'invoice_b2b' | 'pay_after_quote_review';
}

export interface CheckoutResult {
  success: boolean;
  transactionId: string;
  status: 'paid' | 'pending_manual_quote' | 'invoice_issued';
  message: string;
  receiptUrl?: string;
}

export async function processCheckout(input: CheckoutSessionInput): Promise<CheckoutResult> {
  // Simulate network latency for payment gateway
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (input.paymentMethod === 'pay_after_quote_review') {
    return {
      success: true,
      transactionId: `QUOTE-HOLD-${Date.now()}`,
      status: 'pending_manual_quote',
      message: 'Quote logged without upfront charge. A senior artist will review the complexity and confirm the final estimate before any invoice is issued.',
    };
  }

  if (input.paymentMethod === 'invoice_b2b') {
    return {
      success: true,
      transactionId: `INV-B2B-${Date.now()}`,
      status: 'invoice_issued',
      message: 'Order added to your corporate monthly invoice account (Net-30 terms). Production starts immediately.',
    };
  }

  // Simulated instant card payment
  return {
    success: true,
    transactionId: `tx_mock_${Date.now()}`,
    status: 'paid',
    message: `Payment of $${input.amount} processed successfully. Your order is queued for production.`,
    receiptUrl: `https://artlantix.com/receipts/${input.orderNumber}`,
  };
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('placeholder')
  );
}
