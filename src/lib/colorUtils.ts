/**
 * Utility functions for handling color contrast and accessibility
 */

/**
 * Determines if a color is dark based on its RGB values
 * @param r Red value (0-255)
 * @param g Green value (0-255)
 * @param b Blue value (0-255)
 * @returns boolean indicating if the color is dark
 */
export function isDarkColor(r: number, g: number, b: number): boolean {
  // Calculate relative luminance using the formula from WCAG 2.0
  // https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 128; // If luminance is less than 128, consider it dark
}

/**
 * Converts a hex color to RGB values
 * @param hex Hex color string (e.g., "#ffffff" or "#fff")
 * @returns Object with r, g, b values
 */
export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Parse hex values based on length
  let r, g, b;
  if (hex.length === 3) {
    // Short notation like #fff
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else if (hex.length === 6) {
    // Full notation like #ffffff
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return null; // Invalid hex
  }

  return { r, g, b };
}

/**
 * Gets the appropriate text color (black or white) for a given background color
 * @param backgroundColor Background color in hex format
 * @returns "#ffffff" for dark backgrounds, "#000000" for light backgrounds
 */
export function getContrastTextColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return "#000000"; // Default to black if invalid hex

  return isDarkColor(rgb.r, rgb.g, rgb.b) ? "#ffffff" : "#000000";
}

/**
 * Applies a CSS class based on background color to ensure text contrast
 * @param backgroundColor Background color in hex format
 * @returns CSS class name to apply for proper text contrast
 */
export function getContrastClass(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return "text-black";

  return isDarkColor(rgb.r, rgb.g, rgb.b) ? "text-white" : "text-black";
}
