import type {
  Tenant,
  Payment,
  Utility,
  UtilityBill,
  UtilityBillSummary,
  Notification,
  TenantDashboard,
  RentBill,
  RentBillSummary,
  UserProfile,
  TenantProfileUpdateData,
  PasswordUpdateData,
  Document,
} from '../types';

import api from './client';

export interface PaymentFormData {
  amount: number;
  payment_type: 'rent' | 'utility';
  payment_method: 'mobile_money' | 'bank_transfer';
  utility_bill_id?: number;
  rent_bill_id?: number; // Link payment to specific rent bill
  reference_number?: string;
  notes?: string;
}

export interface PaymentsResponse {
  data: {
    payments: Payment[];
    tenant: Tenant;
    pending_amount: number;
  };
  meta: {
    tenancy: {
      id: number;
      monthly_rent: number;
      status: string;
    } | null;
  };
}

export interface CreatePaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment: Payment;
    excess_amount: number;
    warning?: string | null;
    rent_bill_warning?: string | null;
  };
}

export const tenantApi = {
  getDashboard: async (): Promise<TenantDashboard> => {
    const response = await api.get<{ data: TenantDashboard }>('/tenant/dashboard');
    return response.data;
  },

  getPayments: (): Promise<PaymentsResponse> =>
    api.get<PaymentsResponse>('/tenant/payments'),

  createPayment: (data: PaymentFormData): Promise<CreatePaymentResponse> =>
    api.post<CreatePaymentResponse>('/tenant/payments', data),

  getPaymentReceipt: (paymentId: number): Promise<Blob> =>
    api.get<Blob>(`/tenant/payments/${paymentId}/receipt`, { responseType: 'blob' }),

  /**
   * Fetches utilities for the authenticated tenant.
   * @returns Promise resolving to utilities array and tenancy info including monthly rent
   */
  getUtilities: async (): Promise<{ data: Utility[]; tenancy: { id: number; monthly_rent: number } }> => {
    const response = await api.get<{ data: Utility[]; meta: { tenancy_id: number; monthly_rent: number } }>('/tenant/utilities');
    return { 
      data: response.data, 
      tenancy: { 
        id: response.meta.tenancy_id, 
        monthly_rent: response.meta.monthly_rent 
      } 
    };
  },

  getUtilityBills: async (status?: string): Promise<{ data: UtilityBill[]; summary: UtilityBillSummary }> => {
    const response = await api.get<{ data: UtilityBill[]; meta: UtilityBillSummary }>('/tenant/utility-bills', {
      ...(status && { status }),
    });
    return { data: response.data, summary: response.meta };
  },

  // Profile Management
  getProfile: async (): Promise<{ user: UserProfile }> => {
    const response = await api.get<{ data: UserProfile }>('/tenant/profile');
    return { user: response.data };
  },

  updateProfile: async (data: TenantProfileUpdateData): Promise<{ message: string; user: UserProfile }> => {
    const response = await api.put<{ message: string; data: UserProfile }>('/tenant/profile', data);
    return { message: response.message, user: response.data };
  },

  // Password Update
  updatePassword: (data: PasswordUpdateData): Promise<{ message: string }> =>
    api.put<{ message: string }>('/tenant/password', data),

  getNotifications: (): Promise<{ notifications: Notification[] }> =>
    api.get<{ notifications: Notification[] }>('/tenant/notifications'),

  markNotificationRead: (notificationId: number): Promise<void> =>
    api.put(`/tenant/notifications/${notificationId}/read`),

  // Rent Bills
  getRentBills: (): Promise<{
    data: RentBill[];
    summary: RentBillSummary;
  }> =>
    api.get<{
      data: RentBill[];
      summary: RentBillSummary;
    }>('/tenant/rent-bills'),

  getCurrentMonthRentBill: (): Promise<{ data: RentBill | null }> =>
    api.get<{ data: RentBill | null }>('/tenant/rent-bills/current'),

  getRentBill: (rentBillId: number): Promise<{ data: RentBill }> =>
    api.get<{ data: RentBill }>(`/tenant/rent-bills/${rentBillId}`),

  // Documents
  getDocuments: (): Promise<{ data: Document[] }> =>
    api.get<{ data: Document[] }>('/tenant/documents'),

  downloadDocument: (documentId: number): Promise<Blob> =>
    api.get<Blob>(`/tenant/documents/${documentId}/download`, { responseType: 'blob' }),
};

export default tenantApi;
