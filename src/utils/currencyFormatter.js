/**
 * Centralized Currency Formatter enforcing strictly Iraqi Dinar (IQD)
 * @param {number} amount - The numeric value to format
 * @param {string} lang - 'ar' or 'en' for symbol localization
 * @returns {string} - Formatted currency string
 */
export function formatIQD(amount, lang = 'ar') {
  // Always render as whole numbers for IQD (no decimals)
  const numberFormat = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(amount);

  return lang === 'en' ? `${numberFormat} IQD` : `${numberFormat} د.ع`;
}
