import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Alert } from 'react-native';
import { Text, Card, Chip, Button, FAB, Portal, Modal, TextInput, SegmentedButtons } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { landlordApi } from '../../api/landlord';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import { formatCurrency, capitalize } from '../../utils/formatters';
import type { Utility, UtilityType } from '../../types';
import type { LandlordTenantsStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<LandlordTenantsStackParamList>;
type RouteProps = RouteProp<LandlordTenantsStackParamList, 'TenancyUtilities'>;

const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    active: colors.status.active,
    suspended: colors.status.pending,
    disconnected: colors.status.overdue,
  };
  return statusColors[status] ?? colors.gray[400];
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

  const fetchData = useCallback(async () => {
    try {
      const [utilitiesRes, typesRes] = await Promise.all([
        landlordApi.getTenancyUtilities(tenancyId),
        landlordApi.getUtilityTypes(),
      ]);
      setUtilities(utilitiesRes.data);
      setUtilityTypes(typesRes.data);
    } catch (error) {
      console.error('Failed to fetch utilities:', error);
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
    } catch (error: any) {
      console.error('Failed to save utility:', error);
      const message = error?.response?.data?.message || error?.response?.data?.error || 'Failed to save utility. Please try again.';
      Alert.alert('Error', message);
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
              console.error('Failed to delete utility:', error);
              const message = error?.response?.data?.message || error?.response?.data?.error || 'Failed to delete utility.';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingScreen />;

  // Filter out already assigned utility types
  const assignedTypeIds = utilities.map(u => u.utility_type_id);
  const availableTypes = utilityTypes.filter(t => !assignedTypeIds.includes(t.id) && t.is_active);

  return (
    <View style={screenStyles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={screenStyles.header}>
          <Text variant="headlineSmall" style={screenStyles.title}>
            Utilities for {tenantName}
          </Text>
          <Text variant="bodyMedium" style={screenStyles.subtitle}>
            Manage utility connections for this tenancy
          </Text>
        </View>

        <Card style={screenStyles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={screenStyles.title}>
              Assigned Utilities
            </Text>
            {utilities.length > 0 ? (
              utilities.map((utility) => (
                <View key={utility.id} style={styles.utilityItem}>
                  <View style={styles.utilityHeader}>
                    <View>
                      <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                        {capitalize(utility.utility_type?.name || 'Unknown')}
                      </Text>
                      <Text variant="bodySmall" style={screenStyles.date}>
                        {billingCycleLabels[utility.billing_cycle]}
                      </Text>
                    </View>
                    <Chip
                      mode="flat"
                      compact
                      style={[styles.chip, { backgroundColor: getStatusColor(utility.status) + '20' }]}
                      textStyle={{ color: getStatusColor(utility.status) }}
                    >
                      {utility.status}
                    </Chip>
                  </View>
                  <View style={styles.utilityDetails}>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: colors.primary }}>
                      {formatCurrency(utility.amount)}
                    </Text>
                    {utility.provider && (
                      <Text variant="bodySmall" style={screenStyles.date}>
                        Provider: {utility.provider}
                      </Text>
                    )}
                    {utility.meter_number && (
                      <Text variant="bodySmall" style={screenStyles.date}>
                        Meter: {utility.meter_number}
                      </Text>
                    )}
                  </View>
                  <View style={styles.utilityActions}>
                    <Button mode="outlined" onPress={() => openEditModal(utility)} compact>
                      Edit
                    </Button>
                    <Button 
                      mode="outlined" 
                      onPress={() => handleDelete(utility)} 
                      compact 
                      textColor={colors.error}
                    >
                      Delete
                    </Button>
                  </View>
                </View>
              ))
            ) : (
              <>
                <Text variant="bodyMedium" style={screenStyles.empty}>
                  No utilities assigned to this tenancy yet
                </Text>
                <Text variant="bodySmall" style={[screenStyles.date, { marginTop: 8 }]}>
                  Tap the + button to add utilities like water, electricity, or security
                </Text>
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openAddModal}
      />

      {/* Add/Edit Modal */}
      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => setShowModal(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Text variant="titleLarge" style={screenStyles.title}>
              {editingUtility ? 'Edit Utility' : 'Add Utility'}
            </Text>

            {!editingUtility && availableTypes.length > 0 && (
              <>
                <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
                  Select Utility Type *
                </Text>
                <View style={styles.typeGrid}>
                  {availableTypes.map((type) => (
                    <Chip
                      key={type.id}
                      selected={selectedTypeId === type.id}
                      onPress={() => setSelectedTypeId(type.id)}
                      style={styles.typeChip}
                    >
                      {type.name}
                    </Chip>
                  ))}
                </View>
              </>
            )}

            <TextInput
              label="Amount *"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            <Text variant="bodyMedium" style={{ marginTop: 16, marginBottom: 8 }}>
              Billing Cycle *
            </Text>
            <SegmentedButtons
              value={billingCycle}
              onValueChange={(value) => setBillingCycle(value as 'monthly' | 'quarterly' | 'annual')}
              buttons={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'annual', label: 'Annual' },
              ]}
            />

            <TextInput
              label="Provider (Optional)"
              value={provider}
              onChangeText={setProvider}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Account Number (Optional)"
              value={accountNumber}
              onChangeText={setAccountNumber}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Meter Number (Optional)"
              value={meterNumber}
              onChangeText={setMeterNumber}
              mode="outlined"
              style={styles.input}
            />

            <Text variant="bodyMedium" style={{ marginTop: 16, marginBottom: 8 }}>
              Status *
            </Text>
            <SegmentedButtons
              value={status}
              onValueChange={(value) => setStatus(value as 'active' | 'suspended' | 'disconnected')}
              buttons={[
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'disconnected', label: 'Off' },
              ]}
            />

            <TextInput
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
            />

            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={() => setShowModal(false)} style={styles.modalButton}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleSave} loading={submitting} style={styles.modalButton}>
                {editingUtility ? 'Update' : 'Add'}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  utilityItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  utilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chip: {
    height: 28,
  },
  utilityDetails: {
    marginTop: 8,
  },
  utilityActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  modal: {
    backgroundColor: colors.white,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    borderRadius: 8,
  },
  input: {
    marginTop: 12,
    backgroundColor: colors.white,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    minWidth: 100,
  },
});
