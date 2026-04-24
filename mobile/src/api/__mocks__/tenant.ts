import { 
  TenantDashboard, 
  UserProfile,
  RentBill,
  UtilityBill
} from '../../types';

export const mockTenantDashboard: TenantDashboard = {
  stats: {
    pending_rent: 1500,
    pending_utilities: 50,
    next_due_date: '2024-05-01',
    last_payment_amount: 1550,
    last_payment_date: '2024-04-01',
  },
  recent_payments: [],
  upcoming_bills: [],
};

export const tenantApi = {
  getDashboard: jest.fn().mockResolvedValue(mockTenantDashboard),
  
  getPayments: jest.fn().mockResolvedValue({
    data: {
      payments: [],
      tenant: {} as any,
      pending_amount: 0,
    },
    meta: {
      tenancy: null,
    },
  }),

  createPayment: jest.fn().mockResolvedValue({
    success: true,
    message: 'Payment created',
    data: {
      payment: {} as any,
      excess_amount: 0,
    },
  }),

  getUtilities: jest.fn().mockResolvedValue({
    data: [],
    tenancy: { id: 1, monthly_rent: 1500 },
  }),

  getUtilityBills: jest.fn().mockResolvedValue({
    data: [],
    summary: {
      total_pending: 0,
      total_paid: 0,
      total_overdue: 0,
    },
  }),

  getProfile: jest.fn().mockResolvedValue({ user: {} as UserProfile }),
  
  updateProfile: jest.fn().mockResolvedValue({ message: 'Profile updated', user: {} as UserProfile }),
  
  updatePassword: jest.fn().mockResolvedValue({ message: 'Password updated' }),
  
  getNotifications: jest.fn().mockResolvedValue({ notifications: [] }),
  
  markNotificationRead: jest.fn().mockResolvedValue(undefined),

  getRentBills: jest.fn().mockResolvedValue({
    data: [],
    summary: {
      total_pending: 0,
      total_paid: 0,
      total_overdue: 0,
    },
  }),

  getCurrentMonthRentBill: jest.fn().mockResolvedValue({ data: null }),
  
  getRentBill: jest.fn().mockResolvedValue({ data: {} as RentBill }),
};

export default tenantApi;
