export interface UtilityType {
  id: number;
  name: string;
  unit: string | null;
  description: string | null;
  is_metered: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TenancyUtility {
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
  utility_type: UtilityType;
  created_at?: string;
  updated_at?: string;
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
  tenancy_utility: TenancyUtility;
  payments: Payment[];
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id: number;
  tenant_id: number;
  tenancy_id: number;
  utility_bill_id?: number;
  amount: number;
  payment_type: 'rent' | 'utility' | 'deposit' | 'penalty' | 'other';
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paid_at: string | null;
  receipt_path?: string | null;
  reference_number?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UtilitySummary {
  monthly_total: number;
  active_count: number;
  utilities_count: number;
}

export interface UtilityBillSummary {
  total_due: number;
  total_paid: number;
  total_outstanding: number;
  bill_count: number;
}

export interface TenancyWithUtilities {
  id: number;
  status: string;
  monthly_rent: number | null;
  unit: {
    id: number;
    unit_name: string;
    unit_code: string;
    property: {
      id: number;
      name: string;
      address: string;
    };
  };
  tenant: {
    id: number;
    full_name: string;
    phone: string;
    email: string | null;
  };
  tenancyUtilities: TenancyUtility[];
}
