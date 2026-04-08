import type {
  Property,
  Unit,
  Tenant,
  Tenancy,
  Payment,
  Notification,
  LandlordDashboard,
  PaginatedResponse,
  UtilityType,
  Utility,
  UtilityBill,
  RentBill,
  UserProfile,
  LandlordProfileUpdateData,
  PasswordUpdateData,
} from '../types';

import api from './client';

/**
 * Validates if a string is a valid tenant code format.
 * Tenant codes follow the pattern: TEN-XXXXXX (TEN- + 6 alphanumeric characters)
 * Also accepts legacy format: TEN-XXXXX (TEN- + 5 alphanumeric characters)
 * Matches backend pattern: TEN-[A-Z0-9]{5,6}
 */
export function isValidTenantCode(code: string): boolean {
  // Accepts: TEN-XXXXXX (6 alphanumeric) or TEN-XXXXX (5 alphanumeric)
  // Pattern: TEN-[A-Z0-9]{5,6} to match backend
  return /^TEN-[A-Z0-9]{5,6}$/i.test(code);
}

/**
 * Validates tenant identifier - accepts either valid tenant code or numeric ID.
 * Returns the validated string or throws an error for invalid formats.
 */
export function validateTenantIdentifier(identifier: string): string {
  if (isValidTenantCode(identifier)) {
    return identifier.toUpperCase();
  }
  if (/^\d+$/.test(identifier)) {
    // Numeric ID - log a warning for security awareness
    console.warn(
      `Security: Using numeric ID '${identifier}' for tenant lookup. ` +
      `Consider using tenant_code for better security.`
    );
    return identifier;
  }
  throw new Error(
    `Invalid tenant identifier '${identifier}'. Expected either a valid tenant ID (numeric) or tenant code (format: TEN-XXXXXX).`
  );
}

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
  getUnits: (propertyId?: number, page = 1, status?: string): Promise<PaginatedResponse<Unit>> =>
    api.get<PaginatedResponse<Unit>>('/landlord/units', {
      ...(propertyId && { property_id: propertyId }),
      ...(status && { status }),
      page,
    }),

  // Get vacant units (for adding tenants)
  getVacantUnits: (propertyId?: number): Promise<PaginatedResponse<Unit>> =>
    api.get<PaginatedResponse<Unit>>('/landlord/units', {
      ...(propertyId && { property_id: propertyId }),
      status: 'vacant',
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

  /**
   * Fetches a tenant by their unique tenant code.
   * Security: Uses tenant_code instead of tenant ID to prevent enumeration attacks.
   * @param tenantIdentifier - The tenant code (e.g., 'TEN-ABC123') or numeric ID
   */
  getTenant: (tenantIdentifier: string): Promise<Tenant> => {
    const validated = validateTenantIdentifier(tenantIdentifier);
    return api.get<Tenant>(`/landlord/tenants/${validated}`);
  },

  createTenant: (data: Partial<Tenant>): Promise<Tenant> =>
    api.post<Tenant>('/landlord/tenants', data),

  /**
   * Updates a tenant by their unique tenant code.
   * Security: Uses tenant_code instead of tenant ID to prevent enumeration attacks.
   * @param tenantCode - The unique tenant code (e.g., 'TEN-ABC123')
   */
  updateTenant: (tenantCode: string, data: Partial<Tenant>): Promise<Tenant> =>
    api.put<Tenant>(`/landlord/tenants/${tenantCode}`, data),

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

  // Utility Types
  getUtilityTypes: (): Promise<{ data: UtilityType[] }> =>
    api.get<{ data: UtilityType[] }>('/landlord/utility-types'),

  getUtilityType: (utilityTypeId: number): Promise<{ data: UtilityType }> =>
    api.get<{ data: UtilityType }>(`/landlord/utility-types/${utilityTypeId}`),

  // Tenancy Utilities
  getTenancyUtilities: (tenancyId: number): Promise<{ data: Utility[] }> =>
    api.get<{ data: Utility[] }>(`/landlord/tenancies/${tenancyId}/utilities`),

  createTenancyUtility: (
    tenancyId: number,
    data: {
      utility_type_id: number;
      amount: number;
      billing_cycle: 'monthly' | 'quarterly' | 'annual';
      provider?: string;
      account_number?: string;
      meter_number?: string;
      notes?: string;
    }
  ): Promise<{ data: Utility }> =>
    api.post<{ data: Utility }>(`/landlord/tenancies/${tenancyId}/utilities`, data),

  getTenancyUtility: (tenancyUtilityId: number): Promise<{ data: Utility }> =>
    api.get<{ data: Utility }>(`/landlord/tenancy-utilities/${tenancyUtilityId}`),

  updateTenancyUtility: (
    tenancyUtilityId: number,
    data: Partial<{
      utility_type_id: number;
      amount: number;
      billing_cycle: 'monthly' | 'quarterly' | 'annual';
      provider: string;
      account_number: string;
      meter_number: string;
      status: 'active' | 'suspended' | 'disconnected';
      notes: string;
    }>
  ): Promise<{ data: Utility }> =>
    api.put<{ data: Utility }>(`/landlord/tenancy-utilities/${tenancyUtilityId}`, data),

  deleteTenancyUtility: (tenancyUtilityId: number): Promise<void> =>
    api.delete(`/landlord/tenancy-utilities/${tenancyUtilityId}`),

  // Utility Bills
  getUtilityBills: (params?: {
    page?: number;
    status?: string;
    property_id?: number;
    billing_month?: string;
    from_month?: string;
    to_month?: string;
  }): Promise<{ data: UtilityBill[]; meta: { current_page: number; per_page: number; total: number; total_pages: number } }> =>
    api.get<{ data: UtilityBill[]; meta: { current_page: number; per_page: number; total: number; total_pages: number } }>('/landlord/utility-bills', params),

  getUtilityBill: (utilityBillId: number): Promise<{ data: UtilityBill }> =>
    api.get<{ data: UtilityBill }>(`/landlord/utility-bills/${utilityBillId}`),

  updateUtilityBill: (
    utilityBillId: number,
    data: Partial<{
      amount_due: number;
      units_consumed: number;
      due_date: string;
      status: 'pending' | 'paid' | 'partial' | 'overdue' | 'waived';
      notes: string;
    }>
  ): Promise<{ message: string; data: UtilityBill }> =>
    api.put<{ message: string; data: UtilityBill }>(`/landlord/utility-bills/${utilityBillId}`, data),

  waiveUtilityBill: (utilityBillId: number): Promise<{ message: string; data: UtilityBill }> =>
    api.post<{ message: string; data: UtilityBill }>(`/landlord/utility-bills/${utilityBillId}/waive`, {}),

  // Rent Bills
  getRentBills: (params?: {
    page?: number;
    status?: string;
    property_id?: number;
    tenant_id?: number;
  }): Promise<{
    data: RentBill[];
    meta: { current_page: number; per_page: number; total: number; total_pages: number };
  }> =>
    api.get<{
      data: RentBill[];
      meta: { current_page: number; per_page: number; total: number; total_pages: number };
    }>('/landlord/rent-bills', params),

  getRentBill: (rentBillId: number): Promise<{ data: RentBill }> =>
    api.get<{ data: RentBill }>(`/landlord/rent-bills/${rentBillId}`),

  waiveRentBill: (rentBillId: number): Promise<{ message: string; data: RentBill }> =>
    api.post<{ message: string; data: RentBill }>(`/landlord/rent-bills/${rentBillId}/waive`, {}),

  getOverdueRentBills: (): Promise<{ data: RentBill[] }> =>
    api.get<{ data: RentBill[] }>('/landlord/rent-bills/overdue'),

  getPendingRentBills: (): Promise<{ data: RentBill[] }> =>
    api.get<{ data: RentBill[] }>('/landlord/rent-bills/pending'),

  // Profile Management
  getProfile: (): Promise<{ user: UserProfile }> =>
    api.get<{ user: UserProfile }>('/landlord/profile'),

  updateProfile: (data: LandlordProfileUpdateData): Promise<{ message: string; user: UserProfile }> =>
    api.put<{ message: string; user: UserProfile }>('/landlord/profile', data),

  // Password Update
  updatePassword: (data: PasswordUpdateData): Promise<{ message: string }> =>
    api.put<{ message: string }>('/landlord/password', data),
};

export default landlordApi;
