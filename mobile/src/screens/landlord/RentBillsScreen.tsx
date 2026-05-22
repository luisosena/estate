import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

import { landlordApi } from '../../api/landlord';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ErrorState } from '../../components/common/ErrorState';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Skeleton } from '../../components/common/Skeleton';
import { SummaryHeaderSkeleton, BillRowSkeleton } from '../../components/common/SkeletonVariants';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import type { LandlordPaymentsStackParamList } from '../../navigation/AppNavigator';
import type { RentBill } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getStatusColor } from '../../utils/statusColors';

type NavigationProp = NativeStackNavigationProp<LandlordPaymentsStackParamList>;

interface RentBillParams {
  page?: number;
  status?: string;
}

const FILTERS = ['All', 'Pending', 'Overdue', 'Paid'] as const;

const getBadgeStatus = (status: string): 'active' | 'pending' | 'cancelled' | 'default' => {
  if (status === 'paid' || status === 'waived') return 'active';
  if (status === 'pending') return 'pending';
  if (status === 'overdue') return 'cancelled';
  return 'default';
};

export function LandlordRentBillsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bills, setBills] = useState<RentBill[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const statusFilterRef = useRef<string | null>(null);
  const pageRef = useRef(1);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Rent Bills',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
    });
  }, [navigation]);

  const fetchBills = useCallback(async (pageNum?: number) => {
    try {
      setLoading(true);
      setError(null);
      // 200ms delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));
      // Fetch rent bills
      const currentPage = pageNum ?? pageRef.current;
      const params: RentBillParams = { page: currentPage };
      if (statusFilterRef.current) {
        params.status = statusFilterRef.current;
      }
      const response = await landlordApi.getRentBills(params);
      setBills(response.data);
      setTotalPages(response.meta.total_pages);
      setPage(currentPage);
      pageRef.current = currentPage;
      setHasLoaded(true);
    } catch (err: any) {
      console.error('Failed to fetch rent bills:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load rent bills. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const val = activeFilter === 'All' ? null : activeFilter.toLowerCase();
    statusFilterRef.current = val;
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

  const totalOutstanding = bills.reduce((sum, b) => sum + (b.amount_due - b.amount_paid), 0);
  const pendingCount = bills.filter(b => b.status === 'pending').length;
  const overdueCount = bills.filter(b => b.status === 'overdue').length;

  if (error) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <ErrorState message={error} onRetry={() => fetchBills(1)} />
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
          <Text style={styles.summaryLabel}>Total Outstanding</Text>
          {loading ? (
            <Skeleton width={160} height={28} style={{ marginVertical: 4 }} />
          ) : (
            <Text style={styles.summaryAmount}>{formatCurrency(totalOutstanding)}</Text>
          )}
          <View style={styles.summaryBadges}>
            <Badge label={`${pendingCount} Pending`} status="pending" style={{ marginRight: 8 }} />
            <Badge label={`${overdueCount} Overdue`} status="cancelled" />
          </View>
        </View>
      )}

      {/* Filter Tabs */}
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
              const val = f === 'All' ? null : f.toLowerCase();
              statusFilterRef.current = val;
              fetchBills(1);
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
              <BillRowSkeleton key={`bill-skeleton-${i}`} />
           ))
        ) : bills.length > 0 ? (
          bills.map((bill, index) => {
            const outstanding = bill.amount_due - bill.amount_paid;
            const isLast = index === bills.length - 1;

            return (
              <TouchableOpacity
                key={bill.id}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('RentBillDetails', { billId: bill.id })}
              >
                <View style={[styles.billRow, isLast && { borderBottomWidth: 0 }]}>
                  {/* Left icon */}
                  <View style={[
                    styles.billIcon,
                    { backgroundColor: bill.status === 'overdue' ? '#FEF2F2' : bill.status === 'paid' ? '#ECFDF5' : '#FFF7ED' }
                  ]}>
                    <Ionicons
                      name={bill.status === 'paid' ? 'checkmark-circle' : bill.status === 'overdue' ? 'alert-circle' : 'time'}
                      size={20}
                      color={getStatusColor(bill.status)}
                    />
                  </View>

                  {/* Middle info */}
                  <View style={styles.billInfo}>
                    <Text style={styles.billTenant} numberOfLines={1}>
                      {bill.tenant?.full_name || 'Unknown'}
                    </Text>
                    <Text style={styles.billMeta}>
                      {bill.property?.name}{bill.unit ? ` · Unit ${bill.unit.unit_code}` : ''}
                    </Text>
                    <Text style={styles.billDate}>Due: {formatDate(bill.due_date)}</Text>
                  </View>

                  {/* Right values */}
                  <View style={styles.billRight}>
                    <Badge
                      label={bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      status={getBadgeStatus(bill.status)}
                    />
                    <Text style={[styles.billAmount, { color: outstanding > 0 ? colors.status.overdue : colors.status.paid }]}>
                      {formatCurrency(outstanding)}
                    </Text>
                    <Text style={styles.billAmountLabel}>outstanding</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={40} color={colors.gray[300]} />
            <Text style={[screenStyles.empty, { marginTop: 12 }]}>No rent bills found</Text>
          </View>
        )}
      </View>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <View style={styles.pagination}>
          <Button
            variant="outline"
            label="Previous"
            size="sm"
            onPress={() => fetchBills(page - 1)}
            disabled={page === 1}
          />
          <Text style={{ color: colors.text.secondary, fontWeight: '500' }}>
            {page} / {totalPages}
          </Text>
          <Button
            variant="outline"
            label="Next"
            size="sm"
            onPress={() => fetchBills(page + 1)}
            disabled={page === totalPages}
          />
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScreenContainer>
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
    marginBottom: 12,
  },
  summaryBadges: {
    flexDirection: 'row',
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
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: 16,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  billIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
    paddingRight: 8,
  },
  billTenant: {
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
  billDate: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  billRight: {
    alignItems: 'flex-end',
    minWidth: 90,
  },
  billAmount: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  billAmountLabel: {
    fontSize: 10,
    color: colors.text.secondary,
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
});
