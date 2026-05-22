import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

import { tenantApi } from '../../api/tenant';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ErrorState } from '../../components/common/ScreenContainer/../ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import { SummaryHeaderSkeleton, BillRowSkeleton } from '../../components/common/SkeletonVariants';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import type { TenantPaymentsStackParamList } from '../../navigation/AppNavigator';
import type { RentBill, RentBillSummary } from '../../types';
import { formatCurrency, formatDate, capitalize } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<TenantPaymentsStackParamList>;

const FILTERS = ['All', 'Pending', 'Overdue', 'Paid'] as const;

export function TenantRentBillsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bills, setBills] = useState<RentBill[]>([]);
  const [summary, setSummary] = useState<RentBillSummary | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const statusFilterRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Rent Bills',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
    });
  }, [navigation]);

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // 200ms delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));
      const data = await tenantApi.getRentBills();
      let filteredBills = data.data;
      
      const currentFilter = statusFilterRef.current;
      if (currentFilter && currentFilter !== 'all') {
        filteredBills = filteredBills.filter(bill => bill.status === currentFilter);
      }
      
      setBills(filteredBills);
      setSummary(data.summary);
      setHasLoaded(true);
    } catch (err: any) {
      console.error('Failed to fetch rent bills:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills, activeFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchBills();
    }, [fetchBills])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBills();
  };

  const handlePayBill = (bill: RentBill) => {
    const outstanding = bill.amount_due - bill.amount_paid;
    navigation.navigate('MakePayment', {
      monthlyRent: bill.amount_due,
      pendingAmount: outstanding,
      rentBillId: bill.id,
    });
  };


  if (error) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <ErrorState message={error} onRetry={() => {}} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable
      refreshing={refreshing}
      onRefresh={onRefresh}
      edges={['bottom', 'left', 'right']}
    >
      {loading && !hasLoaded ? (
        <SummaryHeaderSkeleton />
      ) : (
        <View style={styles.summarySection}>
          <Text style={styles.summaryLabel}>Outstanding Rent</Text>
          {loading ? (
            <Skeleton width={200} height={36} style={{ marginVertical: 4 }} />
          ) : (
            <Text style={styles.summaryAmount}>
              {formatCurrency(summary?.total_outstanding || 0)}
            </Text>
          )}
          <View style={styles.statusBadges}>
            {summary && summary.overdue_count > 0 && (
              <Badge label={`${summary.overdue_count} Overdue`} status="cancelled" style={{ marginRight: 8 }} />
            )}
            {summary && summary.pending_count > 0 && (
              <Badge label={`${summary.pending_count} Pending`} status="pending" />
            )}
          </View>
        </View>
      )}

      {/* Filter Bar */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.filterBar}
      >
        {loading && !hasLoaded ? (
          Array(4).fill(0).map((_, i) => (
             <Skeleton key={`filter-skeleton-${i}`} width={80} height={36} borderRadius={20} style={{ marginRight: 8 }} />
          ))
        ) : FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => {
              setActiveFilter(f);
              statusFilterRef.current = f === 'All' ? null : f.toLowerCase();
              fetchBills();
            }}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List Section */}
      <View style={styles.listSection}>
        {loading ? (
           Array(5).fill(0).map((_, i) => (
              <BillRowSkeleton key={`bill-skeleton-${i}`} />
           ))
        ) : bills.length > 0 ? (
          bills.map((bill, index) => {
            const outstanding = bill.amount_due - bill.amount_paid;
            const isLast = index === bills.length - 1;
            const statusColor = 
              bill.status === 'paid' ? colors.status.paid : 
              bill.status === 'overdue' ? colors.status.overdue : 
              colors.status.pending;

            return (
              <View key={bill.id} style={[styles.billRow, isLast && { borderBottomWidth: 0 }]}>
                <View style={styles.billMain}>
                  <View style={[styles.iconBox, { backgroundColor: statusColor + '10' }]}>
                    <Ionicons 
                      name={bill.status === 'paid' ? "checkmark-circle" : "time-outline"} 
                      size={20} 
                      color={statusColor} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.billMonth}>{formatDate(bill.billing_month)}</Text>
                    <Text style={styles.billDue}>Due: {formatDate(bill.due_date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.billAmount}>{formatCurrency(bill.amount_due)}</Text>
                    <Badge 
                      label={capitalize(bill.status)} 
                      status={bill.status === 'paid' ? 'active' : bill.status === 'overdue' ? 'cancelled' : 'pending'} 
                    />
                  </View>
                </View>

                <View style={styles.billActions}>
                  <TouchableOpacity 
                    style={styles.detailsBtn}
                    onPress={() => navigation.navigate('RentBillDetails', { billId: bill.id })}
                  >
                    <Text style={styles.detailsBtnText}>View Details</Text>
                  </TouchableOpacity>
                  {outstanding > 0 && bill.status !== 'waived' && (
                    <TouchableOpacity 
                      style={styles.payBtn}
                      onPress={() => handlePayBill(bill)}
                    >
                      <Text style={styles.payBtnText}>Pay Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={44} color={colors.gray[300]} />
            <Text style={[screenStyles.empty, { marginTop: 12 }]}>No rent bills found</Text>
          </View>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summarySection: {
    backgroundColor: colors.surface,
    padding: 24,
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
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 12,
  },
  statusBadges: {
    flexDirection: 'row',
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: colors.text.primary,
    borderColor: colors.text.primary,
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
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: 20,
  },
  billRow: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  billMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  billMonth: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  billDue: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  billActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  payBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
});
