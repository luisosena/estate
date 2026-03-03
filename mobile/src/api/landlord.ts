import api from './client';

// Types matching Laravel models
export interface Property {
  id: number;
  name: string;
  address: string;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  created_at: string;
}

export interface Unit {
  id: number;
  unit_number: string;
  property_id: number;
  property_name: string;
  bedrooms: number;
  bathrooms: number;
  rent_amount: number;
  status: 'occupied' | 'vacant' | 'maintenance';
}

export interface Tenant {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  identification_type?: string;
  identification_number?: string;
}

export interface Tenancy {
  id: number;
  tenant: Tenant;
  unit: Unit;
  move_in_date: string;
  move_out_date: string | null;
  status: 'active' | 'expired' | 'terminated';
  rent_amount: number;
  rent_due_day: number;
  deposit_amount: number;
}

export interface Payment {
  id: number;
  tenant_name: string;
  unit_number: string;
  property_name: string;
  amount: number;
  paid_at: string | null;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  payment_method: string | null;
  reference_number: string | null;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'payment' | 'lease' | 'tenant' | 'system';
  read_at: string | null;
  created_at: string;
}

export interface LandlordDashboard {
  total_properties: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  total_tenants: number;
  pending_payments: number;
  recent_payments: Payment[];
  expiring_leases: Tenancy[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Landlord Dashboard API
export const landlordApi = {
  getDashboard: async (): Promise<LandlordDashboard> => {
    const response = await api.get<LandlordDashboard>('/landlord/dashboard');
    return response;
  },

  // Properties
  getProperties: async (page = 1): Promise<PaginatedResponse<Property>> => {
    const response = await api.get<PaginatedResponse<Property>>('/landlord/properties', { page });
    return response;
  },

  getProperty: async (propertyId: number): Promise<Property> => {
    const response = await api.get<Property>(`/landlord/properties/${propertyId}`);
    return response;
  },

  createProperty: async (data: Partial<Property>): Promise<Property> => {
    const response = await api.post<Property>('/landlord/properties', data);
    return response;
  },

  updateProperty: async (propertyId: number, data: Partial<Property>): Promise<Property> => {
    const response = await api.put<Property>(`/landlord/properties/${propertyId}`, data);
    return response;
  },

  deleteProperty: async (propertyId: number): Promise<void> => {
    await api.delete(`/landlord/properties/${propertyId}`);
  },

  // Units
  getUnits: async (propertyId?: number, page = 1): Promise<PaginatedResponse<Unit>> => {
    const response = await api.get<PaginatedResponse<Unit>>('/landlord/units', { 
      ...(propertyId && { property_id: propertyId }), 
      page 
    });
    return response;
  },

  getUnit: async (unitId: number): Promise<Unit> => {
    const response = await api.get<Unit>(`/landlord/units/${unitId}`);
    return response;
  },

  createUnit: async (data: Partial<Unit>): Promise<Unit> => {
    const response = await api.post<Unit>('/landlord/units', data);
    return response;
  },

  updateUnit: async (unitId: number, data: Partial<Unit>): Promise<Unit> => {
    const response = await api.put<Unit>(`/landlord/units/${unitId}`, data);
    return response;
  },

  deleteUnit: async (unitId: number): Promise<void> => {
    await api.delete(`/landlord/units/${unitId}`);
  },

  // Tenants
  getTenants: async (page = 1): Promise<PaginatedResponse<Tenant>> => {
    const response = await api.get<PaginatedResponse<Tenant>>('/landlord/tenants', { page });
    return response;
  },

  getTenant: async (tenantId: string): Promise<Tenant> => {
    const response = await api.get<Tenant>(`/landlord/tenants/${tenantId}`);
    return response;
  },

  createTenant: async (data: Partial<Tenant>): Promise<Tenant> => {
    const response = await api.post<Tenant>('/landlord/tenants', data);
    return response;
  },

  updateTenant: async (tenantId: string, data: Partial<Tenant>): Promise<Tenant> => {
    const response = await api.put<Tenant>(`/landlord/tenants/${tenantId}`, data);
    return response;
  },

  deleteTenant: async (tenancyId: number): Promise<void> => {
    await api.delete(`/landlord/tenants/${tenancyId}/remove`);
  },

  // Tenancies
  getTenancies: async (page = 1): Promise<PaginatedResponse<Tenancy>> => {
    const response = await api.get<PaginatedResponse<Tenancy>>('/landlord/tenancies', { page });
    return response;
  },

  getTenancy: async (tenancyId: number): Promise<Tenancy> => {
    const response = await api.get<Tenancy>(`/landlord/tenancies/${tenancyId}`);
    return response;
  },

  createTenancy: async (data: {
    tenant_id: number;
    unit_id: number;
    move_in_date: string;
    rent_amount: number;
    rent_due_day: number;
    deposit_amount: number;
  }): Promise<Tenancy> => {
    const response = await api.post<Tenancy>('/landlord/tenancies', data);
    return response;
  },

  // Payments
  getPayments: async (page = 1): Promise<PaginatedResponse<Payment>> => {
    const response = await api.get<PaginatedResponse<Payment>>('/landlord/payments', { page });
    return response;
  },

  // Notifications
  getNotifications: async (): Promise<{ notifications: Notification[] }> => {
    const response = await api.get<{ notifications: Notification[] }>('/landlord/notifications');
    return response;
  },

  markNotificationRead: async (notificationId: number): Promise<void> => {
    await api.put(`/landlord/notifications/${notificationId}/read`);
  },
};

export default landlordApi;
