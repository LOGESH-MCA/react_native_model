import { RAZORPAY_API, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '../config/razorpay';

/**
 * Razorpay REST calls (what a backend would normally do)
 *
 * 1. createRazorpayOrder: POST /v1/orders  -> returns order_id used by Checkout
 * 2. verifyPayment:       GET  /v1/payments/{id} -> confirms the payment really
 *    belongs to our order and is authorized/captured (instead of trusting the popup)
 */

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Small base64 encoder for the Basic auth header (works even where btoa is missing)
function toBase64(text) {
  if (typeof btoa === 'function') return btoa(text);
  let out = '';
  for (let i = 0; i < text.length; i += 3) {
    const [a, b, c] = [text.charCodeAt(i), text.charCodeAt(i + 1), text.charCodeAt(i + 2)];
    const n = (a << 16) | ((b || 0) << 8) | (c || 0);
    out += BASE64[(n >> 18) & 63] + BASE64[(n >> 12) & 63];
    out += i + 1 < text.length ? BASE64[(n >> 6) & 63] : '=';
    out += i + 2 < text.length ? BASE64[n & 63] : '=';
  }
  return out;
}

const AUTH_HEADER = 'Basic ' + toBase64(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

async function razorpayRequest(path, options = {}) {
  const response = await fetch(RAZORPAY_API + path, {
    ...options,
    headers: {
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.description || 'Razorpay request failed');
  }
  return data;
}

// amountInRupees -> Razorpay works in paise (1 rupee = 100 paise)
export function createRazorpayOrder(amountInRupees, receipt, notes = {}) {
  return razorpayRequest('/orders', {
    method: 'POST',
    body: JSON.stringify({
      amount: Math.round(amountInRupees * 100),
      currency: 'INR',
      receipt,
      notes,
    }),
  });
}

export async function verifyPayment(paymentId, orderId) {
  let payment = await razorpayRequest(`/payments/${paymentId}`);
  if (payment.order_id !== orderId) {
    throw new Error('Payment does not match this order.');
  }
  // If the account does not auto-capture, capture the authorized payment now
  if (payment.status === 'authorized') {
    try {
      payment = await razorpayRequest(`/payments/${paymentId}/capture`, {
        method: 'POST',
        body: JSON.stringify({ amount: payment.amount, currency: payment.currency }),
      });
    } catch (e) {
      // Already captured or auto-capture in progress: authorized is still a valid payment
    }
  }
  if (!['authorized', 'captured'].includes(payment.status)) {
    throw new Error(`Payment status is "${payment.status}".`);
  }
  return payment;
}

// Hosted checkout returns to our callback URL without the payment id in the URL,
// so we ask Razorpay for the payments made on this order (retrying briefly).
export async function verifyOrderPayment(orderId, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    const result = await razorpayRequest(`/orders/${orderId}/payments`);
    const paid = (result.items || []).find((p) => ['captured', 'authorized'].includes(p.status));
    if (paid) return verifyPayment(paid.id, orderId);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error('No successful payment found for this order.');
}
