import { colors } from '../constants/colors';

/**
 * Returns the color associated with a payment/bill status
 * @param status - The status string (paid, pending, partial, overdue, waived)
 * @returns The hex color code for the status
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    paid: colors.status.paid,
    partial: colors.status.pending,
    overdue: colors.status.overdue,
    pending: colors.status.pending,
    waived: colors.gray[400],
  };
  return statusColors[status] ?? colors.gray[400];
};
