/**
 * Format a number as Tanzanian Shillings (TZS).
 */
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
  }).format(amount);

/**
 * Format an ISO date string into a short, human-readable date.
 * Example: "Mar 6, 2026"
 */
export const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('en-TZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

/**
 * Capitalize the first letter of a string.
 */
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);
