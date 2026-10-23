/**
 * Simple Form Validation Helpers
 * Explanation for Viva:
 * Validation ensures that data entered by the user meets requirements
 * before we proceed (e.g., email has '@' symbol, password is at least 6 characters).
 */

// 1. Check if email has valid format
export const isValidEmail = (email) => {
  if (!email || email.trim() === '') return false;
  // Standard regex to check email pattern: something@domain.com
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// 2. Check if password meets minimum length (e.g. 6 chars)
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// 3. Check if text is non-empty
export const isNonEmpty = (text) => {
  return text !== null && text !== undefined && text.trim().length > 0;
};

// 4. Check if phone number has 10 digits
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  return digitsOnly.length >= 10;
};
