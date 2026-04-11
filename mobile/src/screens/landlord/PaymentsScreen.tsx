import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../components/common/ScreenContainer';

import { landlordApi } from '../../api/landlord';
import { BillRowSkeleton, PaymentRowSkeleton } from '../../components/common/SkeletonVariants';
import { Badge } from '../../components/common/Badge';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import type { LandlordPaymentsStackParamList } from '../../navigation/AppNavigator';
import type { Payment } from '../../types';
import { formatCurrency, capitalize } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<LandlordPaymentsStackParamList>;

const getStatusBadge = (status: string): 'active' | 'pending' | 'cancelled' | 'default' => {
  if (status === 'paid') return 'active';
  if (status === 'pending' || status === 'partial') return 'pending';
  if (status === 'cancelled' || status === 'overdue') return 'cancelled';
  return 'default';
};

export function LandlordPaymentsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Payments',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
    });
  }, [navigation]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // 200ms delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));
      // Fetch payments
      const data = await landlordApi.getPayments();
      setPayments(data.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  return (
    <ScreenContainer
      scrollable
      refreshing={refreshing}
      onRefresh={onRefresh}
      edges={['bottom', 'left', 'right']}
    >
      {/* Quick Nav Buttons */}
      <View style={styles.quickNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('RentBills')}
        >
          <View style={[styles.navIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="home-outline" size={20} color="#2563EB" />
          </View>
          <Text style={styles.navLabel}>Rent Bills</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
        </TouchableOpacity>

        <View style={styles.navDivider} />

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('UtilityBills')}
        >
          <View style={[styles.navIcon, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="flash-outline" size={20} color="#EA580C" />
          </View>
          <Text style={styles.navLabel}>Utility Bills</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>

        {loading ? (
          <View style={styles.listContainer}>
            {Array(6).fill(0).map((_, i) => (
              <PaymentRowSkeleton key={`skeleton-${i}`} />
            ))}
          </View>
        ) : payments?.length > 0 ? (
          <View style={styles.listContainer}>
            {payments.map((payment, index) => {
              const dateSource = payment.paid_at || payment.due_date;
              const isLast = index === payments.length - 1;
              const methodLabel =
                payment.payment_method === 'mobile_money' ? 'Mobile Money' :
                payment.payment_method === 'bank_transfer' ? 'Bank Transfer' :
                payment.payment_type ? capitalize(payment.payment_type) : 'Payment';

              return (
                <View
                  key={payment.id}
                  style={[styles.rowItem, isLast && { borderBottomWidth: 0 }]}
                >
                  {/* Date Badge */}
                  <View style={styles.dateBadge}>
                    {dateSource ? (
                      <>
                        <Text style={styles.dateDay}>
                          {new Date(dateSource).getDate()}
                        </Text>
                        <Text style={styles.dateMonth}>
                          {new Date(dateSource).toLocaleDateString('en-US', { month: 'short' })}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.dateDay}>—</Text>
                    )}
                  </View>

                  {/* Tenant Info */}
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {payment.tenant_name || 'Unknown Tenant'}
                    </Text>
                    <Text style={styles.rowSubtitle}>
                      {payment.unit_number ? `Unit ${payment.unit_number} · ` : ''}{methodLabel}
                    </Text>
                  </View>

                  {/* Amount + Status */}
                  <View style={styles.rowRight}>
                    <Text style={styles.rowAmount}>
                      {formatCurrency(payment.amount)}
                    </Text>
                    <Badge
                      label={capitalize(payment.status)}
                      status={getStatusBadge(payment.status)}
                      style={{ marginTop: 4 }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={40} color={colors.gray[300]} />
            <Text style={[screenStyles.empty, { marginTop: 12 }]}>No payments yet</Text>
          </View>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  quickNav: {
    margin: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  navIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  navLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  navDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 16,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  listContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dateBadge: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dateDay: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 18,
  },
  dateMonth: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  rowInfo: {
    flex: 1,
    paddingRight: 8,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
});
