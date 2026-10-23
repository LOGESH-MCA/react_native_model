import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Tiny JSON file store (no backend)
 *
 * Explanation for Viva:
 * - Each "table" is one JSON file in the phone's private document folder,
 *   e.g. addresses.json and orders.json. The data survives app restarts.
 * - On web there is no file system, so the same JSON text goes into localStorage.
 */

const fileUri = (name) => (FileSystem.documentDirectory || '') + name;

export async function readJson(name, fallback) {
  try {
    if (Platform.OS === 'web') {
      const text = window.localStorage.getItem(name);
      return text ? JSON.parse(text) : fallback;
    }
    const info = await FileSystem.getInfoAsync(fileUri(name));
    if (!info.exists) return fallback;
    return JSON.parse(await FileSystem.readAsStringAsync(fileUri(name)));
  } catch (e) {
    return fallback;
  }
}

export async function writeJson(name, data) {
  const text = JSON.stringify(data, null, 2);
  if (Platform.OS === 'web') {
    window.localStorage.setItem(name, text);
    return;
  }
  await FileSystem.writeAsStringAsync(fileUri(name), text);
}
