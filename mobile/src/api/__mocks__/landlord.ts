import { 
  Property, 
  Unit, 
  Tenant, 
  Payment, 
  LandlordDashboard, 
  PaginatedResponse,
  UtilityBill,
  RentBill,
  UserProfile
} from '../../types';

export const mockProperty: Property = {
  id: 1,
  name: 'Ocean View Apartments',
  address: '123 Beach Road',
  description: 'Luxury apartments with sea view',
  total_units: 10,
  occupied_units: 8,
  vacant_units: 2,
  created_at: '2023-01-01T00:00:00Z',
};

export const mockUnit: Unit = {
  id: 1,
  property_id: 1,
  unit_code: 'A1',
  unit_name: 'Unit A1',
  status: 'occupied',
  property_name: 'Ocean View Apartments', // Flattened
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

export const mockDashboard: LandlordDashboard = {
  total_properties: 5,
  total_units: 50,
  occupied_units: 45,
  vacant_units: 5,
  total_tenants: 45,
  pending_payments: 5000,
  recent_payments: [
    {
      id: 1,
      amount: 1500,
      paid_at: '2024-04-20T10:00:00Z',
      status: 'paid',
      tenant_name: 'John Doe',
      property_name: 'Ocean View Apartments',
      unit_code: 'A1',
    } as any,
  ],
  expiring_leases: [],
  pending_rent_bills: 2,
  overdue_rent_bills: 1,
  total_rent_outstanding: 5000,
};

export const landlordApi = {
  getDashboard: jest.fn().mockResolvedValue(mockDashboard),
  
  getProperties: jest.fn().mockResolvedValue({
    data: [mockProperty],
    meta: {
      current_page: 1,
      per_page: 15,
      total: 1,
      total_pages: 1,
    },
  }),

  getProperty: jest.fn().mockResolvedValue(mockProperty),
  
  createProperty: jest.fn().mockResolvedValue(mockProperty),
  
  updateProperty: jest.fn().mockResolvedValue(mockProperty),
  
  deleteProperty: jest.fn().mockResolvedValue(undefined),

  getUnits: jest.fn().mockResolvedValue({
    data: [mockUnit],
    meta: {
      current_page: 1,
      per_page: 15,
      total: 1,
      total_pages: 1,
    },
  }),

  getVacantUnits: jest.fn().mockResolvedValue({
    data: [{ ...mockUnit, status: 'available', tenant_name: undefined }],
    meta: {
      current_page: 1,
      per_page: 15,
      total: 1,
      total_pages: 1,
    },
  }),

  getUnit: jest.fn().mockResolvedValue(mockUnit),
  
  createUnit: jest.fn().mockResolvedValue(mockUnit),
  
  updateUnit: jest.fn().mockResolvedValue(mockUnit),
  
  deleteUnit: jest.fn().mockResolvedValue(undefined),

  getTenants: jest.fn().mockResolvedValue({
    data: [],
    meta: {
      current_page: 1,
      per_page: 15,
      total: 0,
      total_pages: 0,
    },
  }),

  getTenant: jest.fn().mockResolvedValue({} as any),
  
  createTenant: jest.fn().mockResolvedValue({} as any),
  
  updateTenant: jest.fn().mockResolvedValue({} as any),
  
  deleteTenant: jest.fn().mockResolvedValue(undefined),

  getPayments: jest.fn().mockResolvedValue({
    data: [],
    meta: {
      current_page: 1,
      per_page: 15,
      total: 0,
      total_pages: 0,
    },
  }),

  getNotifications: jest.fn().mockResolvedValue({ notifications: [] }),
  
  markNotificationRead: jest.fn().mockResolvedValue(undefined),

  getUtilityTypes: jest.fn().mockResolvedValue({ data: [] }),
  
  getUtilityType: jest.fn().mockResolvedValue({ data: {} }),

  getTenancyUtilities: jest.fn().mockResolvedValue({ data: [] }),
  
  createTenancyUtility: jest.fn().mockResolvedValue({ data: {} }),
  
  getTenancyUtility: jest.fn().mockResolvedValue({ data: {} }),
  
  updateTenancyUtility: jest.fn().mockResolvedValue({ data: {} }),
  
  deleteTenancyUtility: jest.fn().mockResolvedValue(undefined),

  getUtilityBills: jest.fn().mockResolvedValue({
    data: [],
    meta: {
      current_page: 1,
      per_page: 15,
      total: 0,
      total_pages: 0,
    },
  }),

  getUtilityBill: jest.fn().mockResolvedValue({ data: {} }),
  
  updateUtilityBill: jest.fn().mockResolvedValue({ message: 'Updated', data: {} }),
  
  waiveUtilityBill: jest.fn().mockResolvedValue({ message: 'Waived', data: {} }),

  getRentBills: jest.fn().mockResolvedValue({
    data: [],
    meta: {
      current_page: 1,
      per_page: 15,
      total: 0,
      total_pages: 0,
    },
  }),

  getRentBill: jest.fn().mockResolvedValue({ data: {} }),
  
  waiveRentBill: jest.fn().mockResolvedValue({ message: 'Waived', data: {} }),
  
  getOverdueRentBills: jest.fn().mockResolvedValue({ data: [] }),
  
  getPendingRentBills: jest.fn().mockResolvedValue({ data: [] }),

  getProfile: jest.fn().mockResolvedValue({ user: {} as UserProfile }),
  
  updateProfile: jest.fn().mockResolvedValue({ message: 'Profile updated', user: {} as UserProfile }),
  
  updatePassword: jest.fn().mockResolvedValue({ message: 'Password updated' }),
};

export default landlordApi;
