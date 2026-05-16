// ──────────────────────────────────────────
// Auth Types
// ──────────────────────────────────────────

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: 'tenant' | 'landlord' | 'admin';
  tenant?: Tenant;
  // Landlord profile is flat on the user for now
}

export interface AuthResponse {
  token: string;
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
  // Flattened properties from tenants list API
  unit_name?: string;
  unit_code?: string;
  property_name?: string;
  tenancy_status?: string;
}

export interface Unit {
  id: number;
  unit_code: string;
  unit_name: string;
  property_id?: number;
  property_name?: string;
  property_address?: string;
  status?: 'occupied' | 'vacant' | 'maintenance' | 'available';
  property?: {
    id: number;
    name: string;
    address?: string;
  };
  tenancies?: UnitTenancy[];
  created_at?: string;
  updated_at?: string;
}

export interface UnitTenancy {
  id: number;
  status: string;
  start_date?: string;
  end_date?: string | null;
  monthly_rent?: number;
  security_deposit?: number;
  tenant_id?: number;
  tenant_name?: string;
  tenant_email?: string;
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
  unit_code?: string;
  property_name?: string;
  amount: number;
  paid_at: string | null;
  due_date: string | null;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  payment_type: 'rent' | 'utility';
  payment_method: 'mobile_money' | 'bank_transfer' | null;
  reference_number: string | null;
  notes: string | null;
  utility_bill?: UtilityBill | null;
  created_at?: string;
  updated_at?: string;
  // Gateway fields (populated when payment goes through M-Pesa or other gateway)
  gateway?: string | null;
  gateway_status?: string | null;
  gateway_reference?: string | null;
  receipt_path?: string | null;
  gateway_confirmed_at?: string | null;
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
  property_type?: string;
  description?: string;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  created_at: string;
}

// ──────────────────────────────────────────
// Tenant-Specific Types
// ──────────────────────────────────────────

export interface UtilityType {
  id: number;
  name: string;
  unit: string;
  description: string | null;
  is_metered: boolean;
  is_active: boolean;
}

export interface Utility {
  id: number;
  tenancy_id: number;
  utility_type_id: number;
  amount: number;
  billing_cycle: 'monthly' | 'quarterly' | 'annual';
  provider: string | null;
  account_number: string | null;
  meter_number: string | null;
  status: 'active' | 'suspended' | 'disconnected';
  notes: string | null;
  utility_type?: UtilityType | null;
  tenancy?: {
    id: number;
    unit?: {
      id: number;
      unit_code: string;
      property?: {
        id: number;
        name: string;
      };
    };
  };
}

export interface UtilityBill {
  id: number;
  tenancy_utility_id: number;
  billing_month: string;
  units_consumed: number | null;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'waived';
  notes: string | null;
  provider?: string;
  account_number?: string;
  meter_number?: string;
  created_at?: string;
  updated_at?: string;
  tenancy_utility?: {
    id: number;
    tenancy_id: number;
    utility_type_id: number;
    amount: number;
    billing_cycle: 'monthly' | 'quarterly' | 'annual';
    provider: string | null;
    account_number: string | null;
    meter_number: string | null;
    status: 'active' | 'suspended' | 'disconnected';
    notes: string | null;
    utility_type: UtilityType | null;
    tenancy?: {
      id: number;
      unit?: {
        id: number;
        unit_code: string;
        property?: {
          id: number;
          name: string;
        };
      };
      tenant?: {
        id: number;
        full_name: string;
      };
    };
  };
  // Only populated for landlord endpoints
  payments?: Payment[];
}

export interface UtilityBillSummary {
  total_due: number;
  total_paid: number;
  total_outstanding: number;
  bill_count: number;
  pending_count?: number;
  overdue_count?: number;
  paid_count?: number;
}

// ──────────────────────────────────────────
// Rent Bill Types
// ──────────────────────────────────────────

export type RentBillStatus = 'pending' | 'paid' | 'partial' | 'overdue' | 'waived';

export interface RentBill {
  id: number;
  tenancy_id: number;
  billing_month: string; // YYYY-MM-01
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: RentBillStatus;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  // Relationships (populated from API)
  tenant?: {
    id: number;
    full_name: string;
    email: string;
  };
  unit?: {
    id: number;
    unit_code: string;
  };
  property?: {
    id: number;
    name: string;
  };
  payments?: Payment[];
}

export interface RentBillSummary {
  total_outstanding: number;
  pending_count: number;
  overdue_count: number;
  paid_count: number;
}

// ──────────────────────────────────────────
// Dashboard Enhancements
// ──────────────────────────────────────────

export interface LandlordDashboard {
  total_properties: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  total_tenants: number;
  pending_payments: number;
  recent_payments: Payment[];
  expiring_leases: Tenancy[];
  // Rent Bill fields
  pending_rent_bills: number;
  overdue_rent_bills: number;
  total_rent_outstanding: number;
}

export interface TenantDashboard {
  tenant: Tenant;
  unit: Unit | null;
  tenancy: Tenancy | null;
  payments: Payment[];
  utilities: Utility[];
  notifications: Notification[];
  // Rent Bill fields
  rent_bills?: RentBill[];
  current_month_bill?: RentBill | null;
}

// ──────────────────────────────────────────
// User Management Types
// ──────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  username?: string;
  email: string;
  role: 'tenant' | 'landlord' | 'admin';
  phone?: string;
  tenant_id?: number;
  landlord_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: 'tenant' | 'landlord' | 'admin';
  // Tenant-specific
  tenant?: Tenant | null;
  // Landlord-specific (no separate model, uses user fields)
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'tenant' | 'landlord' | 'admin';
  phone?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'tenant' | 'landlord' | 'admin';
}

export interface TenantProfileUpdateData extends Omit<UpdateUserData, 'role'> {
  full_name?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
}

export interface LandlordProfileUpdateData extends Omit<UpdateUserData, 'role'> {}

export interface PasswordUpdateData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

// ──────────────────────────────────────────
// Generic Types
// ──────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  // Legacy support - ensure compatibility with older screens if needed
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

// ──────────────────────────────────────────
// Document Types
// ──────────────────────────────────────────

export type DocumentCategory = 'tenancy_agreement' | 'inspection_photo' | 'other';

export interface Document {
  id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  category: DocumentCategory;
  uploaded_at: string;
  documentable_type?: string;
  documentable_id?: number;
}
