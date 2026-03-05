import api from './client';
import type {
  Tenant,
  Unit,
  Tenancy,
  Payment,
  Utility,
  Notification,
  TenantDashboard,
} from '../types';

export const tenantApi = {
  getDashboard: (): Promise<TenantDashboard> =>
    api.get<TenantDashboard>('/tenant/dashboard'),

  getPayments: (): Promise<{ payments: Payment[]; tenant: Tenant }> =>
    api.get<{ payments: Payment[]; tenant: Tenant }>('/tenant/payments'),

  getUtilities: (): Promise<{ utilities: Utility[]; tenant: Tenant }> =>
    api.get<{ utilities: Utility[]; tenant: Tenant }>('/tenant/utilities'),

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
