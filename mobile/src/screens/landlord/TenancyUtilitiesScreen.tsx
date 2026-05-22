import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Portal, Modal, TextInput, SegmentedButtons } from 'react-native-paper';

import { landlordApi } from '../../api/landlord';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ErrorState } from '../../components/common/ScreenContainer/../ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import type { LandlordTenantsStackParamList } from '../../navigation/AppNavigator';
import type { Utility, UtilityType } from '../../types';
import { formatCurrency, capitalize } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<LandlordTenantsStackParamList>;
type RouteProps = RouteProp<LandlordTenantsStackParamList, 'TenancyUtilities'>;

const getStatusType = (status: string): 'active' | 'pending' | 'default' => {
  if (status === 'active') return 'active';
  if (status === 'suspended') return 'pending';
  return 'default';
};

const billingCycleLabels: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
};

export function TenancyUtilitiesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { tenancyId, tenantName } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [utilityTypes, setUtilityTypes] = useState<UtilityType[]>([]);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUtility, setEditingUtility] = useState<Utility | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [provider, setProvider] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended' | 'disconnected'>('active');
  const [notes, setNotes] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Manage Utilities',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
      headerRight: () => (!loading && (
         <TouchableOpacity style={{ padding: 8 }} onPress={openAddModal}>
            <Ionicons name="add" size={24} color={colors.primary} />
         </TouchableOpacity>
      ))
    });
  }, [navigation, loading]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // 200ms delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));
      // Fetch utility readings
      const [utilitiesRes, typesRes] = await Promise.all([
        landlordApi.getTenancyUtilities(tenancyId),
        landlordApi.getUtilityTypes(),
      ]);
      setUtilities(utilitiesRes.data);
      setUtilityTypes(typesRes.data);
    } catch (err: any) {
      console.error('Failed to fetch utilities:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tenancyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const resetForm = () => {
    setSelectedTypeId(null);
    setAmount('');
    setBillingCycle('monthly');
    setProvider('');
    setAccountNumber('');
    setMeterNumber('');
    setStatus('active');
    setNotes('');
    setEditingUtility(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (utility: Utility) => {
    setEditingUtility(utility);
    setSelectedTypeId(utility.utility_type_id);
    setAmount(utility.amount.toString());
    setBillingCycle(utility.billing_cycle);
    setProvider(utility.provider || '');
    setAccountNumber(utility.account_number || '');
    setMeterNumber(utility.meter_number || '');
    setStatus(utility.status);
    setNotes(utility.notes || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedTypeId || !amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        utility_type_id: selectedTypeId,
        amount: parseFloat(amount),
        billing_cycle: billingCycle,
        provider: provider || undefined,
        account_number: accountNumber || undefined,
        meter_number: meterNumber || undefined,
        status,
        notes: notes || undefined,
      };

      if (editingUtility) {
        await landlordApi.updateTenancyUtility(editingUtility.id, data);
      } else {
        await landlordApi.createTenancyUtility(tenancyId, data);
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error('Failed to cancel request', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load data. Please try again.');
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save utility.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (utility: Utility) => {
    Alert.alert(
      'Delete Utility',
      `Are you sure you want to delete ${utility.utility_type?.name || 'this utility'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await landlordApi.deleteTenancyUtility(utility.id);
              fetchData();
            } catch (error: any) {
              Alert.alert('Error', error?.response?.data?.message || 'Failed to delete utility.');
            }
          },
        },
      ]
    );
  };

  const assignedTypeIds = utilities.map(u => u.utility_type_id);
  const availableTypes = utilityTypes.filter(t => !assignedTypeIds.includes(t.id) && t.is_active);

  return (
    <>
      <ScreenContainer
        scrollable
        refreshing={refreshing}
        onRefresh={onRefresh}
        edges={['bottom', 'left', 'right']}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
          <Text style={{ fontSize: 13, color: colors.text.secondary }}>Tenant</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary }}>{tenantName}</Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {loading ? (
             Array(2).fill(0).map((_, i) => (
                <Card key={`utility-skeleton-${i}`} style={{ marginBottom: 16 }}>
                   <View style={styles.utilityHeader}>
                      <View>
                         <Skeleton width={120} height={16} style={{ marginBottom: 4 }} />
                         <Skeleton width={80} height={12} />
                      </View>
                      <Skeleton width={80} height={20} borderRadius={10} />
                   </View>
                   <View style={[styles.utilityDetails, { marginTop: 8 }]}>
                      <Skeleton width={100} height={24} style={{ marginBottom: 8 }} />
                      <Skeleton width="60%" height={12} style={{ marginBottom: 4 }} />
                      <Skeleton width="40%" height={12} />
                   </View>
                   <View style={[styles.utilityActions, { borderTopWidth: 0 }]}>
                      <Skeleton width="45%" height={40} borderRadius={8} style={{ marginRight: 8 }} />
                      <Skeleton width="45%" height={40} borderRadius={8} />
                   </View>
                </Card>
             ))
          ) : utilities.length > 0 ? (
            utilities.map((utility) => (
              <Card key={utility.id} style={{ marginBottom: 16 }}>
                <View style={styles.utilityHeader}>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary }}>
                      {capitalize(utility.utility_type?.name || 'Unknown')}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary }}>
                      {billingCycleLabels[utility.billing_cycle]}
                    </Text>
                  </View>
                  <Badge 
                     label={utility.status.toUpperCase()} 
                     status={getStatusType(utility.status)} 
                  />
                </View>
                
                <View style={styles.utilityDetails}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: colors.primary }}>
                    {formatCurrency(utility.amount)}
                  </Text>
                  {utility.provider && (
                    <Text style={{ fontSize: 13, color: colors.text.secondary, marginTop: 4 }}>
                      Provider: {utility.provider}
                    </Text>
                  )}
                  {utility.meter_number && (
                    <Text style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2 }}>
                      Meter: {utility.meter_number}
                    </Text>
                  )}
                </View>
                
                <View style={styles.utilityActions}>
                  <Button 
                     variant="outline" 
                     label="Edit" 
                     onPress={() => openEditModal(utility)} 
                     style={{ flex: 1, marginRight: 8 }} 
                  />
                  <Button 
                     variant="ghost" 
                     label="Delete" 
                     icon="trash-outline"
                     onPress={() => handleDelete(utility)}
                  />
                </View>
              </Card>
            ))
          ) : (
            <Card>
              <Text style={screenStyles.empty}>No utilities assigned to this tenancy yet.</Text>
            </Card>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScreenContainer>

      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => setShowModal(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 16 }}>
              {editingUtility ? 'Edit Utility' : 'Add Utility'}
            </Text>

            {!editingUtility && availableTypes.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, color: colors.text.secondary, marginBottom: 8 }}>
                  Utility Type *
                </Text>
                <View style={styles.typeGrid}>
                  {availableTypes.map((type) => {
                     const isSelected = selectedTypeId === type.id;
                     return (
                       <TouchableOpacity
                         key={type.id}
                         onPress={() => setSelectedTypeId(type.id)}
                         style={[styles.typeChip, { backgroundColor: isSelected ? colors.primary : colors.gray[100] }]}
                       >
                         <Text style={{ color: isSelected ? colors.white : colors.text.primary, fontWeight: '500' }}>
                           {type.name}
                         </Text>
                       </TouchableOpacity>
                     )
                  })}
                </View>
              </View>
            )}

            <TextInput
              label="Amount *"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              activeOutlineColor={colors.primary}
            />

            <View style={{ marginVertical: 16 }}>
               <Text style={{ fontSize: 13, color: colors.text.secondary, marginBottom: 8 }}>Billing Cycle *</Text>
               <SegmentedButtons
                 value={billingCycle}
                 onValueChange={(value) => setBillingCycle(value as 'monthly' | 'quarterly' | 'annual')}
                 buttons={[
                   { value: 'monthly', label: 'Monthly' },
                   { value: 'quarterly', label: 'Quarterly' },
                   { value: 'annual', label: 'Annual' },
                 ]}
                 theme={{ colors: { secondaryContainer: colors.primaryLight } }}
               />
            </View>

            <TextInput
              label="Provider (Optional)"
              value={provider}
              onChangeText={setProvider}
              mode="outlined"
              style={styles.input}
              activeOutlineColor={colors.primary}
            />

            <TextInput
              label="Account Number (Optional)"
              value={accountNumber}
              onChangeText={setAccountNumber}
              mode="outlined"
              style={styles.input}
              activeOutlineColor={colors.primary}
            />

            <TextInput
              label="Meter Number (Optional)"
              value={meterNumber}
              onChangeText={setMeterNumber}
              mode="outlined"
              style={styles.input}
              activeOutlineColor={colors.primary}
            />

            <View style={{ marginVertical: 16 }}>
               <Text style={{ fontSize: 13, color: colors.text.secondary, marginBottom: 8 }}>Status *</Text>
               <SegmentedButtons
                 value={status}
                 onValueChange={(value) => setStatus(value as 'active' | 'suspended' | 'disconnected')}
                 buttons={[
                   { value: 'active', label: 'Active' },
                   { value: 'suspended', label: 'Suspended' },
                   { value: 'disconnected', label: 'Off' },
                 ]}
               />
            </View>

            <TextInput
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              activeOutlineColor={colors.primary}
            />

            <View style={styles.modalActions}>
              <Button variant="outline" label="Cancel" onPress={() => setShowModal(false)} />
              <View style={{ width: 12 }} />
              <Button variant="primary" label={editingUtility ? 'Update' : 'Add'} onPress={handleSave} loading={submitting} />
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  utilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  utilityDetails: {
    marginBottom: 16,
  },
  utilityActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 16,
  },
  modal: {
    backgroundColor: colors.white,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    borderRadius: 12,
  },
  input: {
    backgroundColor: colors.surface,
    marginTop: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
});
