import { readJson, writeJson } from './jsonStore';

/**
 * Delivery addresses & orders (stored per user in JSON files, no backend)
 *
 * addresses.json -> { "<userId>": [ { id, fullName, phone, line1, line2, city, pincode, label } ] }
 * orders.json    -> { "<userId>": [ { id, items, total, address, payment, createdAt } ] }
 */

const ADDRESSES_FILE = 'addresses.json';
const ORDERS_FILE = 'orders.json';

export async function getAddresses(userId) {
  const all = await readJson(ADDRESSES_FILE, {});
  return all[userId] || [];
}

export async function saveAddress(userId, address) {
  const all = await readJson(ADDRESSES_FILE, {});
  const list = all[userId] || [];
  const newAddress = { ...address, id: 'addr-' + Date.now() };
  all[userId] = [newAddress, ...list];
  await writeJson(ADDRESSES_FILE, all);
  return newAddress;
}

export async function deleteAddress(userId, addressId) {
  const all = await readJson(ADDRESSES_FILE, {});
  all[userId] = (all[userId] || []).filter((a) => a.id !== addressId);
  await writeJson(ADDRESSES_FILE, all);
  return all[userId];
}

export async function saveOrder(userId, order) {
  const all = await readJson(ORDERS_FILE, {});
  all[userId] = [order, ...(all[userId] || [])];
  await writeJson(ORDERS_FILE, all);
  return order;
}

export async function getOrders(userId) {
  const all = await readJson(ORDERS_FILE, {});
  return all[userId] || [];
}

// Admin: every order from every customer on this device, newest first
export async function getAllOrders() {
  const all = await readJson(ORDERS_FILE, {});
  return Object.entries(all)
    .flatMap(([userId, orders]) => orders.map((o) => ({ ...o, userId })))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Admin: move an order to the next delivery status
export async function updateOrderStatus(userId, orderId, status) {
  const all = await readJson(ORDERS_FILE, {});
  all[userId] = (all[userId] || []).map((o) => (o.id === orderId ? { ...o, status } : o));
  await writeJson(ORDERS_FILE, all);
}

export const ORDER_STATUSES = ['Placed', 'Packed', 'Out for Delivery', 'Delivered'];

// One-line address used on the payment and success screens
export const formatAddress = (a) =>
  [a.line1, a.line2, a.city, a.pincode].filter(Boolean).join(', ');
