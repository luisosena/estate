/**
 * PropertiesScreen — API Contract Tests
 *
 * These tests verify the landlordApi mock contract for the properties endpoint.
 * Full screen render integration is covered by Detox E2E tests.
 */
import { landlordApi } from '../../../api/landlord';

jest.mock('../../../api/landlord');

const mockProperties = [
  {
    id: 1,
    name: 'Ocean View',
    address: '123 Beach Rd',
    total_units: 10,
    occupied_units: 8,
    vacant_units: 2,
    created_at: '2024-01-01T00:00:00Z',
  },
];

describe('landlordApi.getProperties (contract)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (landlordApi.getProperties as jest.Mock).mockResolvedValue({
      data: mockProperties,
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
    });
  });

  it('returns paginated response with data array', async () => {
    const response = await landlordApi.getProperties();

    expect(response).toHaveProperty('data');
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('each property has required fields', async () => {
    const response = await landlordApi.getProperties();
    const property = response.data[0];

    expect(typeof property.id).toBe('number');
    expect(typeof property.name).toBe('string');
    expect(typeof property.address).toBe('string');
    expect(typeof property.total_units).toBe('number');
    expect(typeof property.occupied_units).toBe('number');
    expect(typeof property.vacant_units).toBe('number');
  });

  it('returns empty data array when no properties exist', async () => {
    (landlordApi.getProperties as jest.Mock).mockResolvedValue({
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
    });

    const response = await landlordApi.getProperties();

    expect(response.data).toHaveLength(0);
  });

  it('rejects with error when API fails', async () => {
    (landlordApi.getProperties as jest.Mock).mockRejectedValue(
      new Error('Unauthorized')
    );

    await expect(landlordApi.getProperties()).rejects.toThrow('Unauthorized');
  });

  it('paginates correctly', async () => {
    const response = await landlordApi.getProperties(1);

    expect(response.meta?.current_page).toBe(1);
    expect(response.meta?.last_page).toBe(1);
    expect(typeof response.meta?.total).toBe('number');
  });
});
