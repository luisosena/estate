// ──────────────────────────────────────────
// Auth Types
// ──────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'tenant' | 'landlord' | 'admin';
  tenant?: TenantProfile;
  landlord?: LandlordProfile;
}

export interface TenantProfile {
  id: number;
  full_name: string;
  phone: string;
  email: string;
}

export interface LandlordProfile {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  refresh_token?: string;
  user: AuthUser;
}

// ──────────────────────────────────────────
// Shared Domain Types
// ──────────────────────────────────────────

export interface Tenant {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  identification_type?: string;
  identification_number?: string;
}

export interface Unit {
  id: number;
  unit_number: string;
  property_id: number;
  property_name: string;
  bedrooms?: number;
  bathrooms?: number;
  rent_amount?: number;
  status?: 'occupied' | 'vacant' | 'maintenance';
}

export interface Tenancy {
  id: number;
  tenant?: Tenant;
  unit?: Unit;
  move_in_date: string;
  move_out_date?: string | null;
  status: 'active' | 'expired' | 'terminated';
  rent_amount: number;
  rent_due_day: number;
  deposit_amount?: number;
}

export interface Payment {
  id: number;
  tenant_name?: string;
  unit_number?: string;
  property_name?: string;
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
  type: 'payment' | 'lease' | 'tenant' | 'utility' | 'system';
  read_at: string | null;
  created_at: string;
}

// ──────────────────────────────────────────
// Landlord-Specific Types
// ──────────────────────────────────────────

export interface Property {
  id: number;
  name: string;
  address: string;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
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

// ──────────────────────────────────────────
// Tenant-Specific Types
// ──────────────────────────────────────────

export interface Utility {
  id: number;
  type: 'water' | 'electricity' | 'gas' | 'internet' | 'other';
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  reading: number | null;
  period: string | null;
}

export interface TenantDashboard {
  tenant: Tenant;
  unit: Unit | null;
  tenancy: Tenancy | null;
  payments: Payment[];
  utilities: Utility[];
  notifications: Notification[];
}

// ──────────────────────────────────────────
// Generic Types
// ──────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
