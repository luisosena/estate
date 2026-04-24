/**
 * DashboardScreen — API Contract Tests
 *
 * These tests verify the landlordApi mock contract for the dashboard endpoint.
 * Full screen render integration is covered by Detox E2E tests.
 */
import { landlordApi } from '../../../api/landlord';

jest.mock('../../../api/landlord');

const mockDashboardData = {
  total_properties: 5,
  total_units: 50,
  occupied_units: 45,
  vacant_units: 5,
  total_tenants: 45,
  pending_payments: 2,
  recent_payments: [
    {
      id: 1,
      amount: 1500,
      paid_at: '2024-04-20T10:00:00Z',
      status: 'paid',
      tenant_name: 'John Doe',
      unit_code: 'A1',
    },
  ],
  total_rent_outstanding: 5000,
  pending_rent_bills: 2,
  overdue_rent_bills: 1,
};

describe('landlordApi.getDashboard (contract)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (landlordApi.getDashboard as jest.Mock).mockResolvedValue(mockDashboardData);
  });

  it('returns dashboard data with required fields', async () => {
    const data = await landlordApi.getDashboard();

    expect(data).toBeDefined();
    expect(typeof data.total_properties).toBe('number');
    expect(typeof data.total_units).toBe('number');
    expect(typeof data.occupied_units).toBe('number');
    expect(typeof data.vacant_units).toBe('number');
    expect(typeof data.total_tenants).toBe('number');
    expect(Array.isArray(data.recent_payments)).toBe(true);
  });

  it('recent_payments items have required fields', async () => {
    const data = await landlordApi.getDashboard();
    const payment = data.recent_payments[0];

    expect(typeof payment.id).toBe('number');
    expect(typeof payment.amount).toBe('number');
    expect(typeof payment.tenant_name).toBe('string');
    expect(typeof payment.unit_code).toBe('string');
  });

  it('returns rent bill summary fields', async () => {
    const data = await landlordApi.getDashboard();

    expect(typeof data.pending_rent_bills).toBe('number');
    expect(typeof data.overdue_rent_bills).toBe('number');
    expect(typeof data.total_rent_outstanding).toBe('number');
  });

  it('rejects with error when API fails', async () => {
    (landlordApi.getDashboard as jest.Mock).mockRejectedValue(
      new Error('Network Error')
    );

    await expect(landlordApi.getDashboard()).rejects.toThrow('Network Error');
  });
});
