import api from './client';

// Types
export interface Tenant {
  id: number;
  full_name: string;
  phone: string;
  email: string;
}

export interface Unit {
  id: number;
  unit_number: string;
  property_name: string;
  property_id: number;
}

export interface Tenancy {
  id: number;
  move_in_date: string;
  status: 'active' | 'expired' | 'terminated';
  rent_amount: number;
  rent_due_day: number;
}

export interface Payment {
  id: number;
  amount: number;
  paid_at: string | null;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  payment_method: string | null;
  reference_number: string | null;
}

export interface Utility {
  id: number;
  type: 'water' | 'electricity' | 'gas' | 'internet' | 'other';
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  reading: number | null;
  period: string | null;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'payment' | 'lease' | 'utility' | 'system';
  read_at: string | null;
  created_at: string;
}

export interface TenantDashboard {
  tenant: Tenant;
  unit: Unit | null;
  tenancy: Tenancy | null;
  payments: Payment[];
  utilities: Utility[];
  notifications: Notification[];
}

// Tenant Dashboard API
export const tenantApi = {
  getDashboard: async (): Promise<TenantDashboard> => {
    const response = await api.get<TenantDashboard>('/tenant/dashboard');
    return response;
  },

  getPayments: async (): Promise<{ payments: Payment[]; tenant: Tenant }> => {
    const response = await api.get<{ payments: Payment[]; tenant: Tenant }>('/tenant/payments');
    return response;
  },

  getUtilities: async (): Promise<{ utilities: Utility[]; tenant: Tenant }> => {
    const response = await api.get<{ utilities: Utility[]; tenant: Tenant }>('/tenant/utilities');
    return response;
  },

  getProfile: async (): Promise<{ tenant: Tenant }> => {
    const response = await api.get<{ tenant: Tenant }>('/tenant/profile');
    return response;
  },

  updateProfile: async (data: Partial<Tenant>): Promise<{ tenant: Tenant }> => {
    const response = await api.put<{ tenant: Tenant }>('/tenant/profile', data);
    return response;
  },

  getNotifications: async (): Promise<{ notifications: Notification[] }> => {
    const response = await api.get<{ notifications: Notification[] }>('/tenant/notifications');
    return response;
  },

  markNotificationRead: async (notificationId: number): Promise<void> => {
    await api.put(`/tenant/notifications/${notificationId}/read`);
  },
};

export default tenantApi;
