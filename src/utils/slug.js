/**
 * Converts any product name or title into a clean, URL-safe slug:
 * - Lowercase
 * - Removes accents/diacritics
 * - Removes quotes and punctuation
 * - Handles decimals (e.g., 1.8" -> 18)
 * - Replaces spaces and non-alphanumeric chars with -
 * - Removes leading/trailing dashes and collapses multiple dashes
 *
 * Example:
 * "WATCH NOVA 2 - Smartwatch Inteligente Oraimo" -> "watch-nova-2-smartwatch-inteligente-oraimo"
 * "X-Watch Prisma 1.8\" Smartwatch" -> "x-watch-prisma-18-smartwatch"
 */
export function createSlug(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['"]/g, '')
    .replace(/(\d)\.(\d)/g, '$1$2')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}