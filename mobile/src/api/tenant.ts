import api from './client';
import type {
  Tenant,
  Unit,
  Tenancy,
  Payment,
  Utility,
  UtilityBill,
  UtilityBillSummary,
  Notification,
  TenantDashboard,
} from '../types';

export interface PaymentFormData {
  amount: number;
  payment_type: 'rent' | 'utility';
  payment_method: 'mobile_money' | 'bank_transfer';
  reference_number?: string;
  notes?: string;
}

export interface PaymentsResponse {
  payments: Payment[];
  tenant: Tenant;
  tenancy: {
    id: number;
    monthly_rent: number;
  } | null;
  pendingAmount: number;
}

export interface CreatePaymentResponse {
  success: boolean;
  message: string;
  payment: Payment;
}

export const tenantApi = {
  getDashboard: (): Promise<TenantDashboard> =>
    api.get<TenantDashboard>('/tenant/dashboard'),

  getPayments: (): Promise<PaymentsResponse> =>
    api.get<PaymentsResponse>('/tenant/payments'),

  createPayment: (data: PaymentFormData): Promise<CreatePaymentResponse> =>
    api.post<CreatePaymentResponse>('/tenant/payments', data),

  /**
   * Fetches utilities for the authenticated tenant.
   * @returns Promise resolving to utilities array and tenancy info including monthly rent
   */
  getUtilities: (): Promise<{ data: Utility[]; tenancy: { id: number; monthly_rent: number } }> =>
    api.get<{ data: Utility[]; tenancy: { id: number; monthly_rent: number } }>('/tenant/utilities'),

  getUtilityBills: (status?: string): Promise<{ data: UtilityBill[]; summary: UtilityBillSummary }> =>
    api.get<{ data: UtilityBill[]; summary: UtilityBillSummary }>('/tenant/utility-bills', {
      ...(status && { status }),
    }),

  getProfile: (): Promise<{ tenant: Tenant }> =>
    api.get<{ tenant: Tenant }>('/tenant/profile'),

  updateProfile: (data: Partial<Tenant>): Promise<{ tenant: Tenant }> =>
    api.put<{ tenant: Tenant }>('/tenant/profile', data),

  getNotifications: (): Promise<{ notifications: Notification[] }> =>
    api.get<{ notifications: Notification[] }>('/tenant/notifications'),

  markNotificationRead: (notificationId: number): Promise<void> =>
    api.put(`/tenant/notifications/${notificationId}/read`),
};

export default tenantApi;
