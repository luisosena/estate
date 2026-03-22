import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Alert } from 'react-native';
import { Text, Card, Chip, Button, SegmentedButtons, TextInput, Portal, Modal } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { landlordApi } from '../../api/landlord';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import { formatCurrency, formatDate, capitalize } from '../../utils/formatters';
import type { UtilityBill } from '../../types';
import type { LandlordPaymentsStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<LandlordPaymentsStackParamList>;
type RouteProps = RouteProp<LandlordPaymentsStackParamList, 'UtilityBills'>;

const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    paid: colors.status.paid,
    partial: colors.status.pending,
    overdue: colors.status.overdue,
    pending: colors.status.pending,
    waived: colors.gray[400],
  };
  return statusColors[status] ?? colors.gray[400];
};

export function LandlordUtilityBillsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<UtilityBill | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [amountDue, setAmountDue] = useState('');
  const [unitsConsumed, setUnitsConsumed] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [billStatus, setBillStatus] = useState<string>('pending');
  const [notes, setNotes] = useState('');

  const fetchBills = useCallback(async (pageNum: number = 1) => {
    try {
      const params: any = { page: pageNum };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response = await landlordApi.getUtilityBills(params);
      setBills(response.data);
      setTotalPages(response.meta.total_pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch utility bills:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // Refresh bills when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchBills();
    }, [fetchBills])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBills();
  };

  const resetForm = () => {
    setSelectedBill(null);
    setAmountDue('');
    setUnitsConsumed('');
    setDueDate('');
    setBillStatus('pending');
    setNotes('');
  };

  const openEditModal = (bill: UtilityBill) => {
    setSelectedBill(bill);
    setAmountDue(bill.amount_due.toString());
    setUnitsConsumed(bill.units_consumed?.toString() || '');
    setDueDate(bill.due_date);
    setBillStatus(bill.status);
    setNotes(bill.notes || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedBill || !amountDue || !dueDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      Alert.alert('Error', 'Due date must be in YYYY-MM-DD format');
      return;
    }

    setSubmitting(true);
    try {
      await landlordApi.updateUtilityBill(selectedBill.id, {
        amount_due: parseFloat(amountDue),
        units_consumed: unitsConsumed ? parseFloat(unitsConsumed) : undefined,
        due_date: dueDate,
        status: billStatus as 'pending' | 'paid' | 'partial' | 'overdue' | 'waived',
        notes: notes || undefined,
      });

      setShowModal(false);
      resetForm();
      fetchBills(page);
    } catch (error: any) {
      console.error('Failed to update bill:', error);
      const message = error?.response?.data?.message || error?.response?.data?.error || 'Failed to update bill. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWaive = (bill: UtilityBill) => {
    Alert.alert(
      'Waive Bill',
      `Are you sure you want to waive ${formatCurrency(bill.amount_due)} for this bill?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Waive',
          style: 'destructive',
          onPress: async () => {
            try {
              await landlordApi.waiveUtilityBill(bill.id);
              fetchBills(page);
            } catch (error: any) {
              console.error('Failed to waive bill:', error);
              const message = error?.response?.data?.message || error?.response?.data?.error || 'Failed to waive bill.';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={screenStyles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={screenStyles.header}>
          <Text variant="headlineSmall" style={screenStyles.title}>Utility Bills</Text>
          <Text variant="bodyMedium" style={screenStyles.subtitle}>
            Manage tenant utility bills
          </Text>
        </View>

        {/* Filter */}
        <View style={styles.filterContainer}>
          <SegmentedButtons
            value={statusFilter || ''}
            onValueChange={(value) => {
              setStatusFilter(value || null);
              setPage(1);
            }}
            buttons={[
              { value: '', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'paid', label: 'Paid' },
            ]}
          />
        </View>

        {/* Bills List */}
        <Card mode="contained" style={screenStyles.card}>
          <Card.Content>
            {bills.length > 0 ? (
              bills.map((bill) => {
                const utilityName = bill.tenancy_utility?.utility_type?.name || 'Unknown';
                const outstanding = bill.amount_due - bill.amount_paid;
                
                return (
                  <View key={bill.id} style={styles.billItem}>
                    <View style={styles.billHeader}>
                      <View>
                        <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                          {capitalize(utilityName)}
                        </Text>
                        <Text variant="bodySmall" style={screenStyles.date}>
                          Bill for {formatDate(bill.billing_month)}
                        </Text>
                      </View>
                      <Chip
                        mode="flat"
                        compact
                        style={[styles.chip, { backgroundColor: getStatusColor(bill.status) + '20' }]}
                        textStyle={{ color: getStatusColor(bill.status) }}
                      >
                        {bill.status}
                      </Chip>
                    </View>
                    
                    <View style={styles.billDetails}>
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={screenStyles.date}>Amount Due:</Text>
                        <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                          {formatCurrency(bill.amount_due)}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={screenStyles.date}>Amount Paid:</Text>
                        <Text variant="bodyMedium" style={{ color: colors.status.paid }}>
                          {formatCurrency(bill.amount_paid)}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={screenStyles.date}>Outstanding:</Text>
                        <Text variant="bodyMedium" style={{ 
                          fontWeight: 'bold',
                          color: outstanding > 0 ? colors.status.overdue : colors.status.paid 
                        }}>
                          {formatCurrency(outstanding)}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={screenStyles.date}>Due Date:</Text>
                        <Text variant="bodyMedium" style={{ 
                          color: bill.status === 'overdue' ? colors.status.overdue : colors.text.secondary 
                        }}>
                          {formatDate(bill.due_date)}
                        </Text>
                      </View>
                      {bill.units_consumed !== null && (
                        <View style={styles.detailRow}>
                          <Text variant="bodySmall" style={screenStyles.date}>Units:</Text>
                          <Text variant="bodyMedium">
                            {bill.units_consumed} {bill.tenancy_utility?.utility_type?.unit}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.billActions}>
                      <Button mode="outlined" onPress={() => openEditModal(bill)} compact>
                        Edit
                      </Button>
                      {bill.status !== 'waived' && bill.status !== 'paid' && (
                        <Button 
                          mode="outlined" 
                          onPress={() => handleWaive(bill)} 
                          compact 
                          textColor={colors.error}
                        >
                          Waive
                        </Button>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <Text variant="bodyMedium" style={screenStyles.empty}>
                No utility bills found
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <Button 
              mode="outlined" 
              onPress={() => fetchBills(page - 1)} 
              disabled={page === 1}
            >
              Previous
            </Button>
            <Text variant="bodyMedium" style={styles.pageInfo}>
              Page {page} of {totalPages}
            </Text>
            <Button 
              mode="outlined" 
              onPress={() => fetchBills(page + 1)} 
              disabled={page === totalPages}
            >
              Next
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => setShowModal(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Text variant="titleLarge" style={screenStyles.title}>
              Edit Utility Bill
            </Text>

            <TextInput
              label="Amount Due *"
              value={amountDue}
              onChangeText={setAmountDue}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Units Consumed (Optional)"
              value={unitsConsumed}
              onChangeText={setUnitsConsumed}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Due Date * (YYYY-MM-DD)"
              value={dueDate}
              onChangeText={setDueDate}
              mode="outlined"
              style={styles.input}
            />

            <Text variant="bodyMedium" style={{ marginTop: 16, marginBottom: 8 }}>
              Status *
            </Text>
            <SegmentedButtons
              value={billStatus}
              onValueChange={(value) => setBillStatus(value)}
              buttons={[
                { value: 'pending', label: 'Pending' },
                { value: 'paid', label: 'Paid' },
                { value: 'overdue', label: 'Overdue' },
                { value: 'waived', label: 'Waived' },
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
                Update
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  billItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chip: {
    height: 28,
  },
  billDetails: {
    marginTop: 8,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  pageInfo: {
    textAlign: 'center',
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
