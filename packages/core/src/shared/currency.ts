/**
 * Utility functions for standardizing global box office currencies.
 */

/**
 * Basic formatter converting raw numbers to standard USD formatted string.
 * This ensures consistency when displaying budget and revenue in the Dashboard (Phase 4).
 * @param amount Raw financial number in cents or dollars
 */
export function formatToUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}
