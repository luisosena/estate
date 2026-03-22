import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { landlordApi } from '../api/landlord';
import type { Unit } from '../types';

export function useAddTenant(unitId?: number) {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createTenancy, setCreateTenancy] = useState(!!unitId);
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Tenant form data
  const [tenantData, setTenantData] = useState({
    full_name: '',
    email: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
  });

  // Tenancy form data
  const [tenancyData, setTenancyData] = useState({
    unit_id: unitId || 0,
    move_in_date: new Date().toISOString().split('T')[0],
    rent_amount: 0,
    rent_due_day: 1,
    deposit_amount: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (createTenancy && !unitId) {
      loadAvailableUnits();
    }
  }, [createTenancy, unitId]);

  const loadAvailableUnits = async () => {
    try {
      setLoadingUnits(true);
      const response = await landlordApi.getVacantUnits();
      setAvailableUnits(response.data);
    } catch (error) {
      console.error('Error loading units:', error);
    } finally {
      setLoadingUnits(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!tenantData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!tenantData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(tenantData.email)) newErrors.email = 'Invalid email format';
    if (!tenantData.phone.trim()) newErrors.phone = 'Phone number is required';

    if (createTenancy) {
      if (!tenancyData.unit_id) newErrors.unit_id = 'Please select a unit';
      if (!tenancyData.move_in_date) newErrors.move_in_date = 'Move-in date is required';
      if (!tenancyData.rent_amount || tenancyData.rent_amount <= 0) newErrors.rent_amount = 'Valid rent amount is required';
      if (!tenancyData.deposit_amount || tenancyData.deposit_amount < 0) newErrors.deposit_amount = 'Valid deposit amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const tenant = await landlordApi.createTenant({
        full_name: tenantData.full_name,
        email: tenantData.email,
        phone: tenantData.phone,
        emergency_contact_name: tenantData.emergency_contact_name || undefined,
        emergency_contact_phone: tenantData.emergency_contact_phone || undefined,
        emergency_contact_relation: tenantData.emergency_contact_relation || undefined,
      });

      if (createTenancy) {
        await landlordApi.createTenancy({
          tenant_id: tenant.id,
          unit_id: tenancyData.unit_id,
          move_in_date: tenancyData.move_in_date,
          rent_amount: tenancyData.rent_amount,
          rent_due_day: tenancyData.rent_due_day,
          deposit_amount: tenancyData.deposit_amount,
        });
      }

      Alert.alert(
        'Success',
        `Tenant ${tenant.full_name} has been ${createTenancy ? 'added and assigned to the unit' : 'created'}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Error creating tenant:', error);
      const message = error?.response?.data?.message || 'Failed to create tenant. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    createTenancy,
    setCreateTenancy,
    availableUnits,
    loadingUnits,
    tenantData,
    setTenantData,
    tenancyData,
    setTenancyData,
    errors,
    handleSave,
    loadAvailableUnits,
  };
}
