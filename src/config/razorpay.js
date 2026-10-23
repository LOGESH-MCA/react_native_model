/**
 * Razorpay TEST keys (hard-coded on purpose for this college project)
 *
 * Explanation for Viva:
 * - The Key ID is public and is used by the Razorpay Checkout popup.
 * - The Key Secret is normally kept ONLY on a backend server. Because this project has
 *   no backend, the app itself uses it to create the order and to confirm the payment.
 * - Never ship a LIVE secret inside a mobile app: anyone can extract it from the APK.
 */

export const RAZORPAY_KEY_ID = 'rzp_test_TG5Y7eBXLqMmYz';
export const RAZORPAY_KEY_SECRET = 'H1GwDN0k92EVjTlUriHY0c2P';

export const RAZORPAY_API = 'https://api.razorpay.com/v1';
export const STORE_NAME = 'Daily Grocery Shop';
