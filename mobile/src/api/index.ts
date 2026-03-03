export { api, default } from './client';

// Auth exports
export * from './auth';

// Tenant exports (use namespace to avoid conflicts)
export { tenantApi } from './tenant';
export type {
  Tenant,
  Unit,
  Tenancy,
  Payment,
  Utility,
  Notification as TenantNotification,
  TenantDashboard,
} from './tenant';

// Landlord exports
export { landlordApi } from './landlord';
export type {
  Property,
  Unit as LandlordUnit,
  Tenant as LandlordTenant,
  Tenancy as LandlordTenancy,
  Payment as LandlordPayment,
  Notification as LandlordNotification,
  LandlordDashboard,
  PaginatedResponse,
} from './landlord';
