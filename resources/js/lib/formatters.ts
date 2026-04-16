import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Standard currency formatter for the East African Shilling (TZS).
 */
export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount);

/**
 * Standard date formatter for high-density UI.
 * Output: Oct 16, 2026
 */
export const formatDate = (dateString?: string | null) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Full date formatter for headers and timestamps.
 * Output: Fri, Oct 16, 2026
 */
export const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

/**
 * Status variants for Badge components.
 */
export const getStatusVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'active':
    case 'completed':
    case 'enabled':
      return 'default';
    case 'pending':
    case 'partial':
    case 'processing':
    case 'suspended':
      return 'secondary';
    case 'overdue':
    case 'failed':
    case 'cancelled':
    case 'disconnected':
    case 'inactive':
      return 'destructive';
    default:
      return 'outline';
  }
};
