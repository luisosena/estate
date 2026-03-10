import api from './client';
import type {
  Property,
  Unit,
  Tenant,
  Tenancy,
  Payment,
  Notification,
  LandlordDashboard,
  PaginatedResponse,
} from '../types';

export const landlordApi = {
  // Dashboard
  getDashboard: (): Promise<LandlordDashboard> =>
    api.get<LandlordDashboard>('/landlord/dashboard'),

  // Properties
  getProperties: (page = 1): Promise<PaginatedResponse<Property>> =>
    api.get<PaginatedResponse<Property>>('/landlord/properties', { page }),

  getProperty: (propertyId: number): Promise<Property> =>
    api.get<Property>(`/landlord/properties/${propertyId}`),

  createProperty: (data: Partial<Property>): Promise<Property> =>
    api.post<Property>('/landlord/properties', data),

  updateProperty: (propertyId: number, data: Partial<Property>): Promise<Property> =>
    api.put<Property>(`/landlord/properties/${propertyId}`, data),

  deleteProperty: (propertyId: number): Promise<void> =>
    api.delete(`/landlord/properties/${propertyId}`),

  // Units
  getUnits: (propertyId?: number, page = 1): Promise<PaginatedResponse<Unit>> =>
    api.get<PaginatedResponse<Unit>>('/landlord/units', {
      ...(propertyId && { property_id: propertyId }),
      page,
    }),

  getUnit: (unitId: number): Promise<Unit> =>
    api.get<Unit>(`/landlord/units/${unitId}`),

  createUnit: (data: Partial<Unit>): Promise<Unit> =>
    api.post<Unit>('/landlord/units', data),

  updateUnit: (unitId: number, data: Partial<Unit>): Promise<Unit> =>
    api.put<Unit>(`/landlord/units/${unitId}`, data),

  deleteUnit: (unitId: number): Promise<void> =>
    api.delete(`/landlord/units/${unitId}`),

  // Tenants
  getTenants: (page = 1): Promise<PaginatedResponse<Tenant>> =>
    api.get<PaginatedResponse<Tenant>>('/landlord/tenants', { page }),

  getTenant: (tenantId: number | string): Promise<Tenant> =>
    api.get<Tenant>(`/landlord/tenants/${tenantId}`),

  createTenant: (data: Partial<Tenant>): Promise<Tenant> =>
    api.post<Tenant>('/landlord/tenants', data),

  updateTenant: (tenantId: string, data: Partial<Tenant>): Promise<Tenant> =>
    api.put<Tenant>(`/landlord/tenants/${tenantId}`, data),

  deleteTenant: (tenancyId: number): Promise<void> =>
    api.delete(`/landlord/tenants/${tenancyId}/remove`),

  // Tenancies
  getTenancies: (page = 1): Promise<PaginatedResponse<Tenancy>> =>
    api.get<PaginatedResponse<Tenancy>>('/landlord/tenancies', { page }),

  getTenancy: (tenancyId: number): Promise<Tenancy> =>
    api.get<Tenancy>(`/landlord/tenancies/${tenancyId}`),

  createTenancy: (data: {
    tenant_id: number;
    unit_id: number;
    move_in_date: string;
    rent_amount: number;
    rent_due_day: number;
    deposit_amount: number;
  }): Promise<Tenancy> =>
    api.post<Tenancy>('/landlord/tenancies', data),

  // Payments
  getPayments: (page = 1): Promise<PaginatedResponse<Payment>> =>
    api.get<PaginatedResponse<Payment>>('/landlord/payments', { page }),

  // Notifications
  getNotifications: (): Promise<{ notifications: Notification[] }> =>
    api.get<{ notifications: Notification[] }>('/landlord/notifications'),

  markNotificationRead: (notificationId: number): Promise<void> =>
    api.put(`/landlord/notifications/${notificationId}/read`),
};

export default landlordApi;
