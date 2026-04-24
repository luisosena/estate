import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ErrorState } from '../../components/common/ScreenContainer/../ErrorState';

import { tenantApi } from '../../api/tenant';
import { Skeleton } from '../../components/common/Skeleton';
import { SummaryHeaderSkeleton, BillRowSkeleton } from '../../components/common/SkeletonVariants';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { Badge } from '../../components/common/Badge';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import type { TenantUtilitiesStackParamList, TenantPaymentsStackParamList } from '../../navigation/AppNavigator';
import type { UtilityBill, UtilityBillSummary } from '../../types';
import { formatCurrency, formatDate, capitalize } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<
  TenantUtilitiesStackParamList & TenantPaymentsStackParamList
>;

const FILTERS = ['All', 'Pending', 'Overdue', 'Paid'] as const;

export function TenantUtilityBillsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [summary, setSummary] = useState<UtilityBillSummary | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Utility Bills',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
    });
  }, [navigation]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      // 200ms delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));
      const filter = activeFilter === 'All' ? undefined : activeFilter.toLowerCase();
      const data = await tenantApi.getUtilityBills(filter);
      setBills(data.data);
      setSummary(data.summary);
      setHasLoaded(true);
    } catch (err: any) {
      console.error('Failed to fetch utility bills:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [activeFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchBills();
    }, [activeFilter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBills();
  };

  const handlePayBill = () => {
    navigation.navigate('MakePayment', {
      pendingAmount: summary?.total_outstanding || 0,
    });
  };


  if (error) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <ErrorState message={error} onRetry={fetchBills} />
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
      
      {/* Summary Header */}
      {loading && !hasLoaded ? (
        <SummaryHeaderSkeleton />
      ) : (
        <View style={styles.summarySection}>
          <Text style={styles.summaryLabel}>Outstanding Utilities</Text>
          {loading ? (
            <Skeleton width={200} height={36} style={{ marginVertical: 4 }} />
          ) : (
            <Text style={styles.summaryAmount}>
              {formatCurrency(summary?.total_outstanding || 0)}
            </Text>
          )}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Due</Text>
              <Text style={styles.statValue}>{formatCurrency(summary?.total_due || 0)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Paid</Text>
              <Text style={styles.statValue}>{formatCurrency(summary?.total_paid || 0)}</Text>
            </View>
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
        ) : (
          FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* List Section */}
      <View style={styles.listSection}>
        {loading ? (
           Array(5).fill(0).map((_, i) => (
              <BillRowSkeleton key={`bill-skeleton-${i}`} />
           ))
        ) : bills.length > 0 ? (
          bills.map((bill, index) => {
            const utilityName = bill.tenancy_utility?.utility_type?.name || 'Unknown';
            const outstanding = bill.amount_due - bill.amount_paid;
            const isLast = index === bills.length - 1;
            const status = bill.status as 'paid' | 'pending' | 'overdue' | 'waived';

            return (
              <View key={bill.id} style={[styles.billRow, isLast && { borderBottomWidth: 0 }]}>
                <View style={styles.billMain}>
                  <View style={styles.iconBox}>
                    <Ionicons name="flash" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.billTitle}>{capitalize(utilityName)}</Text>
                    <Text style={styles.billMeta}>Billing: {formatDate(bill.billing_month)}</Text>
                    <Text style={styles.billDue}>Due: {formatDate(bill.due_date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.billAmount}>{formatCurrency(bill.amount_due)}</Text>
                    <Badge 
                      label={capitalize(bill.status)} 
                      status={status === 'paid' ? 'active' : status === 'overdue' ? 'cancelled' : 'pending'} 
                    />
                  </View>
                </View>

                {outstanding > 0 && bill.status !== 'waived' && (
                  <TouchableOpacity 
                    style={styles.payBtn}
                    onPress={handlePayBill}
                  >
                    <Text style={styles.payBtnText}>Pay Balance ({formatCurrency(outstanding)})</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="flash-outline" size={44} color={colors.gray[300]} />
            <Text style={[screenStyles.empty, { marginTop: 12 }]}>No utility bills found</Text>
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
    marginBottom: 20,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  billMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  billTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  billMeta: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  billDue: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  payBtn: {
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
