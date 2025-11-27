// Toast Payment Integration
// Handles card tokenization and payment processing via Toast API

interface PaymentRequest {
  amount: number; // Total amount in cents
  tip: number; // Tip amount in cents
  cardToken: string; // Tokenized card from client-side
  orderId: string;
  customerEmail?: string;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// NY Sales Tax Rate (8.875% for NYC)
export const NY_TAX_RATE = 0.08875;

export async function processToastPayment(request: PaymentRequest): Promise<PaymentResult> {
  const TOAST_API_URL = process.env.TOAST_API_URL;
  const TOAST_RESTAURANT_GUID = process.env.TOAST_RESTAURANT_GUID;
  const TOAST_CLIENT_ID = process.env.TOAST_CLIENT_ID;
  const TOAST_CLIENT_SECRET = process.env.TOAST_CLIENT_SECRET;

  // Check if Toast is configured
  if (!TOAST_API_URL || !TOAST_RESTAURANT_GUID || !TOAST_CLIENT_ID || !TOAST_CLIENT_SECRET) {
    console.warn("Toast payment configuration missing. Payment will be simulated.");
    
    // In development/testing, simulate successful payment
    if (process.env.NODE_ENV === 'development') {
      console.log("DEV MODE: Simulating successful payment for order", request.orderId);
      return {
        success: true,
        transactionId: `DEV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
    }
    
    return {
      success: false,
      error: "Payment system not configured. Please contact the restaurant."
    };
  }

  try {
    // Step 1: Get OAuth token
    const authResponse = await fetch(`${TOAST_API_URL}/authentication/v1/authentication/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: TOAST_CLIENT_ID,
        clientSecret: TOAST_CLIENT_SECRET,
        userAccessType: 'TOAST_MACHINE_CLIENT'
      })
    });

    if (!authResponse.ok) {
      throw new Error(`Toast auth failed: ${authResponse.statusText}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.token?.accessToken;

    if (!accessToken) {
      throw new Error('Failed to obtain Toast access token');
    }

    // Step 2: Process payment
    const paymentResponse = await fetch(`${TOAST_API_URL}/orders/v2/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Toast-Restaurant-External-ID': TOAST_RESTAURANT_GUID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: request.amount / 100, // Convert cents to dollars
        tipAmount: request.tip / 100,
        paymentType: 'CREDIT',
        cardToken: request.cardToken,
        externalReferenceId: request.orderId,
      })
    });

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.json().catch(() => ({}));
      throw new Error(errorData.message || `Payment failed: ${paymentResponse.statusText}`);
    }

    const paymentData = await paymentResponse.json();

    return {
      success: true,
      transactionId: paymentData.guid || paymentData.transactionId
    };

  } catch (error) {
    console.error('Toast payment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed'
    };
  }
}

// Tokenize card on client side (this would typically be done via Toast's JS SDK)
// For now, we'll create a simple tokenization endpoint
export interface CardDetails {
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  zip: string;
}

export async function tokenizeCard(card: CardDetails): Promise<{ token: string } | { error: string }> {
  const TOAST_API_URL = process.env.TOAST_API_URL;
  const TOAST_RESTAURANT_GUID = process.env.TOAST_RESTAURANT_GUID;

  if (!TOAST_API_URL || !TOAST_RESTAURANT_GUID) {
    // Dev mode - create a fake token
    if (process.env.NODE_ENV === 'development') {
      return { token: `DEV-TOKEN-${Date.now()}` };
    }
    return { error: 'Payment system not configured' };
  }

  try {
    // Toast uses their own tokenization endpoint
    // This would typically be called from the client-side using Toast's JS SDK
    const response = await fetch(`${TOAST_API_URL}/creditcards/v1/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': TOAST_RESTAURANT_GUID,
      },
      body: JSON.stringify({
        cardNumber: card.number.replace(/\s/g, ''),
        expirationMonth: card.expMonth,
        expirationYear: card.expYear,
        cvv: card.cvv,
        zipCode: card.zip
      })
    });

    if (!response.ok) {
      throw new Error('Card tokenization failed');
    }

    const data = await response.json();
    return { token: data.token };

  } catch (error) {
    console.error('Card tokenization error:', error);
    return { error: 'Failed to process card details' };
  }
}

