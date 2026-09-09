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
      message: 'Demo invoice recorded. No real invoice was issued; connect a billing provider before production use.',
    };
  }

  // Demo-only card result. No payment provider is called by this repository.
  return {
    success: true,
    transactionId: `tx_mock_${Date.now()}`,
    status: 'paid',
    message: `Demo checkout recorded for $${input.amount}. No card was charged.`,
  };
}
