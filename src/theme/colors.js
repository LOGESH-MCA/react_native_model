// Theme colors matching the Figma Grocery App design (iPhone 14 Pro design mockups)
// Beginner-friendly: We store all color codes in one place so we can reuse them easily.

export const COLORS = {
  // Main brand colors from Figma
  primary: '#F8E21C',       // Bright yellow (active category pill, stepper buttons)
  primaryDark: '#C9B827',   // Olive-yellow (Get Started / Book Now buttons)
  secondary: '#579E22',     // Organic green for fresh tags and checkout
  secondaryLight: '#E3FBC0', // Light pastel green for discount badges and tags

  // Background colors
  gradientTop: '#DDFBC0',   // Light green at the top of every screen
  gradientBottom: '#FDEEDC',// Warm peach-cream at the bottom
  background: '#FCF3E3',    // Flat fallback background
  cardBackground: '#FCF8EC',// Cream product card
  white: '#FFFFFF',
  tabBar: '#FFEB85',        // Soft yellow bottom bar
  pillInactive: '#A9A898',  // Grey category pill
  darkBackground: '#121111',

  // Text colors
  textDark: '#1E1E1E',      // Primary dark heading text
  textMedium: '#52514F',    // Secondary description text
  textLight: '#8C8A84',     // Placeholder and hint text
  textWhite: '#FFFFFF',     // Text on dark backgrounds

  // Accent & functional colors
  accentRed: '#FF6262',     // Red for favorite hearts & active tab indicator
  accentOrange: '#FF9F1C',  // Orange for ratings and warning badges
  star: '#F5C518',
  border: '#EEEBDD',        // Subtle card border
  borderDark: '#D5D1BE',    // Stepper border
  iconButtonBorder: '#CDEFB0', // Light green outline of the round header buttons
  error: '#E63946',         // Form validation error text
  success: '#2A9D8F',       // Success message color

  // Shadows
  shadow: '#000000',
};

// Reusable soft shadow used by cards and buttons
export const SHADOW = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
};
