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
  tenant_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  tenancies?: Tenancy[];
}

export interface Unit {
  id: number;
  unit_number: string;
  unit_name?: string;
  unit_code?: string;
  property_id: number;
  property_name?: string;
  bedrooms?: number;
  bathrooms?: number;
  rent_amount?: number;
  status?: 'occupied' | 'vacant' | 'maintenance' | 'available';
  tenancies?: UnitTenancy[];
}

export interface UnitTenancy {
  id: number;
  status: string;
  start_date?: string;
  end_date?: string | null;
  tenant?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface Tenancy {
  id: number;
  tenant?: Tenant;
  unit?: Unit;
  move_in_date: string;
  move_out_date?: string | null;
  status: 'active' | 'expired' | 'terminated' | 'ended';
  rent_amount: number;
  rent_due_day: number;
  deposit_amount?: number;
  monthly_rent?: number;
  security_deposit?: number;
}

export interface Payment {
  id: number;
  tenant_name?: string;
  unit_number?: string;
  property_name?: string;
  amount: number;
  paid_at: string | null;
  due_date: string | null;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  payment_type: 'rent' | 'utility';
  payment_method: 'mobile_money' | 'bank_transfer' | null;
  reference_number: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

// Pending amount - calculated from monthly rent minus payments made
export interface PendingAmount {
  pendingAmount: number;
  monthlyRent: number;
  totalPaid: number;
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
