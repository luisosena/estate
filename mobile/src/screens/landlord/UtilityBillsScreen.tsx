import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Portal, Modal, TextInput, SegmentedButtons } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ErrorState } from '../../components/common/ScreenContainer/../ErrorState';

import { landlordApi } from '../../api/landlord';
import { Skeleton } from '../../components/common/Skeleton';
import { BillRowSkeleton } from '../../components/common/SkeletonVariants';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import type { LandlordPaymentsStackParamList } from '../../navigation/AppNavigator';
import type { UtilityBill } from '../../types';
import { formatCurrency, formatDate, capitalize } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<LandlordPaymentsStackParamList>;
type RouteProps = RouteProp<LandlordPaymentsStackParamList, 'UtilityBills'>;

const getBadgeStatus = (status: string): 'active' | 'pending' | 'cancelled' | 'default' => {
  if (status === 'paid' || status === 'waived') return 'active';
  if (status === 'pending' || status === 'partial') return 'pending';
  if (status === 'overdue') return 'cancelled';
  return 'default';
};

const FILTERS = ['All', 'Pending', 'Overdue', 'Paid'] as const;

export function LandlordUtilityBillsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>('All');

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Utility Bills',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
    });
  }, [navigation]);

  const fetchBills = useCallback(async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      // 200ms delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));
      // Fetch utility bills
      
      const params: any = { page: pageNum };
      if (activeFilter !== 'All') {
        params.status = activeFilter.toLowerCase();
      }
      const response = await landlordApi.getUtilityBills(params);
      setBills(response.data);
      setTotalPages(response.meta.total_pages);
      setPage(pageNum);
      setHasLoaded(true);
    } catch (err: any) {
      console.error('Failed to fetch utility bills:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  useFocusEffect(
    useCallback(() => {
      fetchBills();
    }, [fetchBills])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBills();
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
      fetchBills(page);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update bill.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWaive = (bill: UtilityBill) => {
    Alert.alert(
      'Waive Bill',
      `Are you sure you want to waive ${formatCurrency(bill.amount_due)}?`,
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
              Alert.alert('Error', error?.response?.data?.message || 'Failed to waive bill.');
            }
          },
        },
      ]
    );
  };

  const totalOutstanding = bills.reduce((sum, b) => sum + (b.amount_due - b.amount_paid), 0);

  return (
    <>
      <ScreenContainer
        scrollable
        refreshing={refreshing}
        onRefresh={onRefresh}
        edges={['bottom', 'left', 'right']}
      >

        {/* Summary Header */}
        <View style={styles.summarySection}>
          {loading && !hasLoaded ? (
            <>
              <Skeleton width={120} height={14} style={{ marginBottom: 8 }} />
              <Skeleton width={180} height={32} />
            </>
          ) : (
            <>
              <Text style={styles.summaryLabel}>Total Outstanding</Text>
              {loading ? (
                <Skeleton width={180} height={32} style={{ marginVertical: 4 }} />
              ) : (
                <Text style={styles.summaryAmount}>{formatCurrency(totalOutstanding)}</Text>
              )}
            </>
          )}
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}
        >
          {loading && !hasLoaded ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={`f-skel-${i}`} width={80} height={36} borderRadius={20} style={{ marginRight: 8 }} />
            ))
          ) : FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => {
                 setActiveFilter(f);
                 setPage(1);
              }}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bills List */}
        <View style={styles.listSection}>
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <BillRowSkeleton key={`skeleton-${i}`} />
            ))
          ) : bills.length > 0 ? (
            bills.map((bill, index) => {
              const utilityName = bill.tenancy_utility?.utility_type?.name || 'Unknown';
              const outstanding = bill.amount_due - bill.amount_paid;
              const isLast = index === bills.length - 1;

              return (
                <View key={bill.id} style={[styles.billRow, isLast && { borderBottomWidth: 0 }]}>
                  <View style={[
                    styles.billIcon,
                    { backgroundColor: bill.status === 'overdue' ? '#FEF2F2' : bill.status === 'paid' ? '#ECFDF5' : '#FFF7ED' }
                  ]}>
                    <Ionicons
                      name="flash"
                      size={18}
                      color={bill.status === 'paid' ? colors.status.paid : bill.status === 'overdue' ? colors.status.overdue : colors.status.pending}
                    />
                  </View>

                  <View style={styles.billInfo}>
                    <Text style={styles.billTitle}>{capitalize(utilityName)}</Text>
                    <Text style={styles.billMeta}>Bill for {formatDate(bill.billing_month)}</Text>
                    <Text style={styles.billDue}>Due: {formatDate(bill.due_date)}</Text>
                    {bill.units_consumed !== null && (
                      <Text style={styles.billUnits}>
                        {bill.units_consumed} {bill.tenancy_utility?.utility_type?.unit}
                      </Text>
                    )}
                  </View>

                  <View style={styles.billRight}>
                    <Badge
                      label={bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      status={getBadgeStatus(bill.status)}
                    />
                    <Text style={[styles.billAmount, { color: outstanding > 0 ? colors.status.overdue : colors.status.paid }]}>
                      {formatCurrency(outstanding)}
                    </Text>
                    <View style={styles.billActions}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => openEditModal(bill)}
                      >
                        <Text style={styles.actionBtnText}>Edit</Text>
                      </TouchableOpacity>
                      {bill.status !== 'waived' && bill.status !== 'paid' && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { borderColor: colors.error }]}
                          onPress={() => handleWaive(bill)}
                        >
                          <Text style={[styles.actionBtnText, { color: colors.error }]}>Waive</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="flash-outline" size={40} color={colors.gray[300]} />
              <Text style={[screenStyles.empty, { marginTop: 12 }]}>No utility bills found</Text>
            </View>
          )}
        </View>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <View style={styles.pagination}>
            <Button variant="outline" label="Previous" size="sm" onPress={() => fetchBills(page - 1)} disabled={page === 1} />
            <Text style={{ color: colors.text.secondary, fontWeight: '500' }}>{page} / {totalPages}</Text>
            <Button variant="outline" label="Next" size="sm" onPress={() => fetchBills(page + 1)} disabled={page === totalPages} />
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScreenContainer>

      {/* Edit Modal */}
      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => setShowModal(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 20 }}>
              Edit Utility Bill
            </Text>
            <TextInput
              label="Amount Due *"
              value={amountDue}
              onChangeText={setAmountDue}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              activeOutlineColor={colors.primary}
            />
            <TextInput
              label="Units Consumed (Optional)"
              value={unitsConsumed}
              onChangeText={setUnitsConsumed}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              activeOutlineColor={colors.primary}
            />
            <TextInput
              label="Due Date * (YYYY-MM-DD)"
              value={dueDate}
              onChangeText={setDueDate}
              mode="outlined"
              style={styles.input}
              activeOutlineColor={colors.primary}
            />
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 13, color: colors.text.secondary, marginBottom: 8 }}>Status *</Text>
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
              <Button variant="primary" label="Update" onPress={handleSave} loading={submitting} />
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  summarySection: {
    backgroundColor: colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  filterChipActive: {
    backgroundColor: colors.text.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  listSection: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: 16,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  billIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  billInfo: {
    flex: 1,
    paddingRight: 8,
  },
  billTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  billMeta: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  billDue: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  billUnits: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  billRight: {
    alignItems: 'flex-end',
    minWidth: 90,
  },
  billAmount: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 8,
  },
  billActions: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.primary,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
});
