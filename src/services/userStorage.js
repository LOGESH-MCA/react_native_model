import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import seedData from '../data/users.json';

/**
 * User Storage (JSON file based login verification)
 *
 * Explanation for Viva:
 * - `src/data/users.json` is bundled inside the app and holds the fixed accounts
 *   (the hard-coded Admin and the sample customer Logesh). Bundled files are READ-ONLY.
 * - When a new customer signs up, we cannot edit the bundled file, so we save the
 *   customer into a real `users.json` file inside the phone's private document folder
 *   (expo-file-system). This file survives app restarts.
 * - On web there is no file system, so the same JSON text is kept in localStorage.
 * - Login = read both lists, find the user whose email + password match; that
 *   account's role (only one hard-coded Admin) decides which screens open.
 */

const FILE_URI = (FileSystem.documentDirectory || '') + 'users.json';
const WEB_KEY = 'grocery_users_json';

// Read the list of customers that signed up on this device
async function readSavedUsers() {
  try {
    if (Platform.OS === 'web') {
      const text = window.localStorage.getItem(WEB_KEY);
      return text ? JSON.parse(text).users : [];
    }
    const info = await FileSystem.getInfoAsync(FILE_URI);
    if (!info.exists) return [];
    const text = await FileSystem.readAsStringAsync(FILE_URI);
    return JSON.parse(text).users || [];
  } catch (e) {
    return [];
  }
}

// Write the list of signed-up customers back to users.json
async function writeSavedUsers(users) {
  const text = JSON.stringify({ users }, null, 2);
  if (Platform.OS === 'web') {
    window.localStorage.setItem(WEB_KEY, text);
    return;
  }
  await FileSystem.writeAsStringAsync(FILE_URI, text);
}

// Remove the password before handing the user object to the UI
const withoutPassword = ({ password, ...rest }) => rest;

const sameEmail = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

// Sign In: check email + password against seed file and saved file.
// The account's own role decides whether the Admin or Customer screens open.
export async function authenticate(email, password) {
  const saved = await readSavedUsers();
  // Saved entries come first so an edited profile overrides the bundled copy
  const allUsers = [...saved, ...seedData.users];
  const found = allUsers.find((u) => sameEmail(u.email, email));

  if (!found) {
    return { success: false, message: 'No account found with this email.' };
  }
  if (found.password !== password) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }
  return { success: true, user: withoutPassword(found) };
}

// Sign Up: only Customers can register (Admin is fixed in users.json)
export async function registerCustomer({ name, email, phone, password }) {
  const saved = await readSavedUsers();
  const exists = [...seedData.users, ...saved].some((u) => sameEmail(u.email, email));
  if (exists) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  const newUser = {
    id: 'cust-' + Date.now(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    phone,
    address: 'Select delivery address',
    role: 'Customer',
  };
  await writeSavedUsers([...saved, newUser]);
  return { success: true, user: withoutPassword(newUser) };
}

// Save edited profile details of a signed-up customer
export async function saveProfile(userId, updatedData) {
  const saved = await readSavedUsers();
  const index = saved.findIndex((u) => u.id === userId);
  if (index === -1) {
    // Seed account (read-only bundled file): store an edited copy in the device file
    const seedUser = seedData.users.find((u) => u.id === userId);
    if (!seedUser) return;
    saved.push({ ...seedUser, ...updatedData });
  } else {
    saved[index] = { ...saved[index], ...updatedData };
  }
  await writeSavedUsers(saved);
}
