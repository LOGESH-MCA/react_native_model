import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../theme/colors';
import { useGrocery } from '../context/GroceryContext';
import { ScreenBackground, ScreenHeader, IconButton } from '../components/UI';
import { RAZORPAY_KEY_ID, STORE_NAME } from '../config/razorpay';
import { createRazorpayOrder, verifyOrderPayment } from '../services/razorpay';
import { saveOrder, formatAddress } from '../services/orderStorage';

/**
 * Checkout Step 2: Razorpay Payment (Hosted Checkout)
 *
 * Explanation for Viva:
 * 1. We create a Razorpay ORDER for the cart total (Razorpay Orders API).
 * 2. A WebView opens Razorpay's own hosted payment page
 *    (https://api.razorpay.com/v1/checkout/embedded) - this is Razorpay's
 *    recommended way for apps/WebViews, and works inside Expo Go.
 * 3. After paying, Razorpay redirects to our CALLBACK_URL; pressing back on the
 *    Razorpay page redirects to our CANCEL_URL. The WebView watches for these URLs.
 * 4. We confirm the payment with the Razorpay API (never trust the page alone),
 *    save the order in orders.json, empty the cart and open "Order Placed".
 *
 * WEB: browsers block calls to Razorpay's secret API (CORS - "Failed to fetch"),
 * so on web we use Razorpay's normal website checkout (checkout.js popup) without
 * creating an order first. Phones (Expo Go) use the order + hosted checkout flow.
 *
 * Test mode: card 4111 1111 1111 1111, any future expiry, any CVV (OTP page: Success).
 */

const CALLBACK_URL = 'https://dailygrocery.app/payment/success';
const CANCEL_URL = 'https://dailygrocery.app/payment/cancel';

// Escape values placed inside the HTML form
const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');

// Auto-submitting form that opens Razorpay Hosted Checkout
const buildHostedCheckoutHtml = (fields) => `<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="font-family:sans-serif;color:#52514F;text-align:center;padding-top:40vh">
  <p>Opening secure Razorpay checkout…</p>
  <form id="rzp" method="POST" action="https://api.razorpay.com/v1/checkout/embedded">
    ${Object.entries(fields)
      .map(([name, value]) => `<input type="hidden" name="${esc(name)}" value="${esc(value)}" />`)
      .join('\n    ')}
  </form>
  <script>document.getElementById('rzp').submit();</script>
</body>
</html>`;

export default function PaymentScreen({ route, navigation }) {
  const { address } = route.params;
  const { user, cart, cartSubtotal, discountAmount, deliveryFee, grandTotal, clearCart } = useGrocery();

  // 'creating' -> 'checkout' -> 'verifying' | 'error'
  const [stage, setStage] = useState('creating');
  const [errorMessage, setErrorMessage] = useState('');
  const [rzpOrder, setRzpOrder] = useState(null);
  const handled = useRef(false);

  // Step 1: create the Razorpay order (phone) / open checkout.js popup (web)
  const createOrder = useCallback(async () => {
    setStage('creating');
    setErrorMessage('');
    handled.current = false;
    if (Platform.OS === 'web') {
      openWebCheckout();
      return;
    }
    try {
      const order = await createRazorpayOrder(grandTotal, 'rcpt_' + Date.now(), {
        customer: user.email,
      });
      setRzpOrder(order);
      setStage('checkout');
    } catch (e) {
      setErrorMessage(`Could not create the Razorpay order.\n${e.message}`);
      setStage('error');
    }
  }, [grandTotal, user.email]);

  useEffect(() => {
    createOrder();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save the order, empty the cart and open "Order Placed"
  const completeOrder = async (paymentInfo) => {
    const order = {
      id: 'ORD-' + Date.now().toString().slice(-8),
      createdAt: new Date().toISOString(),
      status: 'Placed',
      customer: { id: user.id, name: user.name, email: user.email },
      items: cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        unit: item.product.unit,
        quantity: item.quantity,
      })),
      subtotal: cartSubtotal,
      discount: discountAmount,
      deliveryFee,
      total: grandTotal,
      address,
      payment: { provider: 'Razorpay', ...paymentInfo },
    };
    await saveOrder(user.id, order);
    clearCart();
    navigation.replace('OrderSuccess', { order });
  };

  // WEB: load Razorpay checkout.js and open the payment popup
  const openWebCheckout = () => {
    const open = () => {
      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: Math.round(grandTotal * 100), // paise
        currency: 'INR',
        name: STORE_NAME,
        description: `${cart.length} grocery items`,
        prefill: { name: address.fullName, email: user.email, contact: address.phone },
        notes: { address: formatAddress(address) },
        theme: { color: COLORS.primaryDark },
        handler: (response) => {
          handled.current = true;
          setStage('verifying');
          completeOrder({
            paymentId: response.razorpay_payment_id,
            orderId: null,
            method: null,
            status: 'authorized',
          });
        },
        modal: {
          ondismiss: () => {
            if (handled.current) return;
            setErrorMessage(lastError || 'Payment window was closed. Your cart is still saved.');
            setStage('error');
          },
        },
      });
      let lastError = null;
      rzp.on('payment.failed', (r) => {
        lastError = r.error?.description || 'Payment failed. Please try again.';
      });
      setStage('webCheckout');
      rzp.open();
    };

    if (window.Razorpay) {
      open();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = open;
    script.onerror = () => {
      setErrorMessage('Could not load Razorpay. Check your internet connection.');
      setStage('error');
    };
    document.body.appendChild(script);
  };

  // Step 4 (phone): confirm the payment with Razorpay, then finish
  const finishPayment = async () => {
    setStage('verifying');
    try {
      const payment = await verifyOrderPayment(rzpOrder.id);
      await completeOrder({
        paymentId: payment.id,
        orderId: rzpOrder.id,
        method: payment.method,
        status: payment.status,
      });
    } catch (e) {
      setErrorMessage(`We could not confirm your payment.\n${e.message}`);
      setStage('error');
    }
  };

  // Step 3: watch the WebView for our callback / cancel URLs
  const handleUrl = (url) => {
    if (!url || handled.current) return false;
    if (url.startsWith(CALLBACK_URL)) {
      handled.current = true;
      finishPayment();
      return true;
    }
    if (url.startsWith(CANCEL_URL)) {
      handled.current = true;
      Alert.alert('Payment Cancelled', 'You left the payment page. Your cart is still saved.', [
        { text: 'Back to Address', style: 'cancel', onPress: () => navigation.goBack() },
        { text: 'Try Again', onPress: createOrder },
      ]);
      return true;
    }
    return false;
  };

  const onShouldStartLoad = (request) => {
    const { url } = request;
    if (handleUrl(url)) return false;
    if (url.startsWith('http') || url.startsWith('about:') || url.startsWith('data:')) return true;
    // UPI apps (upi://, intent://) open outside the WebView
    Linking.openURL(url).catch(() =>
      Alert.alert('App not found', 'Please choose another payment method.')
    );
    return false;
  };

  const checkoutFields = rzpOrder && {
    key_id: RAZORPAY_KEY_ID,
    order_id: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    name: STORE_NAME,
    description: `${cart.length} grocery items`,
    'prefill[name]': address.fullName,
    'prefill[email]': user.email,
    'prefill[contact]': address.phone,
    'notes[address]': formatAddress(address),
    callback_url: CALLBACK_URL,
    cancel_url: CANCEL_URL,
  };

  return (
    <ScreenBackground>
      <ScreenHeader
        title="Payment"
        left={
          stage !== 'verifying' ? (
            <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
          ) : null
        }
      />

      {stage === 'checkout' && checkoutFields ? (
        <View style={styles.webviewCard}>
          <WebView
            key={rzpOrder.id}
            originWhitelist={['*']}
            source={{ html: buildHostedCheckoutHtml(checkoutFields) }}
            onShouldStartLoadWithRequest={onShouldStartLoad}
            // Android does not report form POST redirects above, so also watch page loads
            onLoadStart={(e) => handleUrl(e.nativeEvent.url)}
            onNavigationStateChange={(nav) => handleUrl(nav.url)}
            onError={(e) => {
              // Our callback domain is not a real website, so it may "fail" to load
              if (handleUrl(e.nativeEvent.url) || handled.current) return;
              setErrorMessage(`Could not open Razorpay.\n${e.nativeEvent.description}`);
              setStage('error');
            }}
            javaScriptEnabled
            domStorageEnabled
            thirdPartyCookiesEnabled
            setSupportMultipleWindows={false}
            startInLoadingState
            renderLoading={() => <Loader text="Opening Razorpay…" />}
            style={styles.webview}
          />
        </View>
      ) : stage === 'webCheckout' ? (
        <Loader text="Complete the payment in the Razorpay window…" />
      ) : stage === 'error' ? (
        <View style={styles.center}>
          <View style={styles.errorCircle}>
            <Ionicons name="alert" size={40} color={COLORS.error} />
          </View>
          <Text style={styles.errorTitle}>Payment could not continue</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={createOrder}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Back to Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Loader text={stage === 'verifying' ? 'Confirming your payment…' : 'Preparing secure payment…'} />
      )}
    </ScreenBackground>
  );
}

function Loader({ text }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primaryDark} />
      <Text style={styles.loaderText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webviewCard: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    ...SHADOW,
  },
  webview: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  loaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  errorCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  retryBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  backLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMedium,
    marginTop: 4,
  },
});
