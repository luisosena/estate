import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

import { landlordApi } from '../api/landlord';
import type { Unit } from '../types';

interface TenantForm {
  full_name: string;
  email: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
}

interface TenancyForm {
  unit_id: number;
  move_in_date: string;
  monthly_rent: number;
  rent_due_day: number;
  security_deposit: number;
}

export function useAddTenant(unitId?: number) {
  const navigation = useNavigation();

  // Loading States
  const [saving, setSaving] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  
  // Feature Toggles
  const [createTenancy, setCreateTenancy] = useState(!!unitId);

  // Data States
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [tenantForm, setTenantForm] = useState<TenantForm>({
    full_name: '',
    email: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
  });

  const [tenancyForm, setTenancyForm] = useState<TenancyForm>({
    unit_id: unitId || 0,
    move_in_date: new Date().toISOString().split('T')[0],
    monthly_rent: 0,
    rent_due_day: 5,
    security_deposit: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Memoized Unit Loading
  const loadAvailableUnits = useCallback(async () => {
    try {
      setLoadingUnits(true);
      const response = await landlordApi.getVacantUnits();
      setAvailableUnits(response.data);
    } catch (error) {
      console.error('[useAddTenant] Failed to load units:', error);
    } finally {
      setLoadingUnits(false);
    }
  }, []);

  useEffect(() => {
    if (createTenancy && !unitId) {
      loadAvailableUnits();
    }
  }, [createTenancy, unitId, loadAvailableUnits]);

  const updateTenantField = (field: keyof TenantForm, value: string) => {
    setTenantForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const updateTenancyField = (field: keyof TenancyForm, value: any) => {
    setTenancyForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!tenantForm.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!tenantForm.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!tenantForm.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(tenantForm.email)) newErrors.email = 'Invalid email format';

    if (createTenancy) {
      if (!tenancyForm.unit_id) newErrors.unit_id = 'Please select a unit';
      if (!tenancyForm.monthly_rent || tenancyForm.monthly_rent <= 0) newErrors.monthly_rent = 'Monthly rent is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      
      const payload: any = { 
        ...tenantForm,
        // Trim strings
        full_name: tenantForm.full_name.trim(),
        email: tenantForm.email.trim(),
        phone: tenantForm.phone.trim(),
      };

      if (createTenancy) {
        Object.assign(payload, tenancyForm);
      }

      await landlordApi.createTenant(payload);

      Alert.alert(
        'Success',
        `Tenant ${tenantForm.full_name} has been added successfully.`,
        [{ text: 'Great', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('[useAddTenant] Save Error:', error);
      
      // Map Backend validation errors
      if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
        Alert.alert('Validation Error', 'Please check the highlighted fields.');
      } else {
        const message = error?.response?.data?.message || 'Failed to save tenant. Please check your connection.';
        Alert.alert('Error', message);
      }
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
    tenantForm,
    tenancyForm,
    errors,
    updateTenantField,
    updateTenancyField,
    handleSave,
    loadAvailableUnits,
  };
}
