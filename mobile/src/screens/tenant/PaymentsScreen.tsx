import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ErrorState } from '../../components/common/ScreenContainer/../ErrorState';
import { tenantApi } from '../../api/tenant';
import { Skeleton } from '../../components/common/Skeleton';
import { BillRowSkeleton } from '../../components/common/SkeletonVariants';
import { Card } from '../../components/common/Card';
import { PaymentRowSkeleton } from '../../components/common/SkeletonVariants';
import { Badge } from '../../components/common/Badge';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import type { TenantPaymentsStackParamList } from '../../navigation/AppNavigator';
import type { Payment } from '../../types';
import { formatCurrency, formatDate, capitalize } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<TenantPaymentsStackParamList>;

export function TenantPaymentsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Payments',
      headerShown: true,
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
    });
  }, [navigation]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      setError(null);
      // 200ms delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));
      const response = await tenantApi.getPayments();
      setPayments(response.data.payments);
      setPendingAmount(response.data.pending_amount);
      
      // Find the most recent paid payment
      const sorted = [...response.data.payments].filter(p => p.status === 'paid').sort((a, b) => {
        const dateA = a.paid_at ?? a.created_at ?? '';
        const dateB = b.paid_at ?? b.created_at ?? '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      setLastPayment(sorted[0] || null);
      setHasLoaded(true);
    } catch (err) {
      console.error('Failed to load payments history:', err);
      setError('Failed to load payments history.');
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


  if (error) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <ErrorState message={error} onRetry={fetchPayments} />
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
      <View style={styles.headerCards}>
        {loading && !hasLoaded ? (
          <>
            <Skeleton width="100%" height={120} borderRadius={16} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={120} borderRadius={16} />
          </>
        ) : (
          <>
            <Card style={styles.balanceCard}>
               <View style={styles.cardHeader}>
                 <Text style={styles.cardLabel}>Pending Balance</Text>
                 <View style={styles.iconCircle}>
                    <Ionicons name="alert-circle" size={18} color={colors.status.pending} />
                 </View>
               </View>
               {loading ? (
                 <Skeleton width={180} height={32} style={{ marginVertical: 4 }} />
               ) : (
                 <Text style={styles.balanceAmount}>{formatCurrency(pendingAmount)}</Text>
               )}
               <TouchableOpacity 
                 style={styles.payBtn}
                 onPress={() => navigation.navigate('MakePayment', { pendingAmount })}
               >
                 <Text style={styles.payBtnText}>Pay Now</Text>
                 <Ionicons name="chevron-forward" size={16} color={colors.white} />
               </TouchableOpacity>
            </Card>

            <Card style={styles.recentCard}>
               <View style={styles.cardHeader}>
                 <Text style={styles.cardLabel}>Last Payment</Text>
                 <Ionicons name="checkmark-done" size={18} color={colors.status.paid} />
               </View>
               {lastPayment ? (
                 <>
                   {loading ? (
                     <Skeleton width={120} height={28} style={{ marginVertical: 4 }} />
                   ) : (
                     <Text style={styles.recentAmount}>{formatCurrency(lastPayment.amount)}</Text>
                   )}
                   <Text style={styles.recentDate}>
                     on {formatDate(lastPayment.paid_at ?? lastPayment.created_at ?? '')}
                   </Text>
                 </>
               ) : (
                 <Text style={styles.recentAmount}>No payments</Text>
               )}
            </Card>
          </>
        )}
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        
        {loading ? (
          <View style={styles.listContainer}>
            {Array(6).fill(0).map((_, i) => (
              <PaymentRowSkeleton key={`skeleton-${i}`} />
            ))}
          </View>
        ) : payments.length > 0 ? (
          <View style={styles.listContainer}>
            {payments.map((payment, index) => {
              const isLast = index === payments.length - 1;
              const dateSource = payment.paid_at || payment.due_date;
              const status = payment.status as 'paid' | 'pending' | 'overdue' | 'cancelled';
              const typeLabel = payment.payment_type === 'rent' ? 'Rent Payment' : 'Utility Payment';

              return (
                <View key={payment.id} style={[styles.paymentRow, isLast && { borderBottomWidth: 0 }]}>
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

                  {/* Info */}
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>{typeLabel}</Text>
                    <Text style={styles.paymentMeta}>
                      {payment.payment_method?.replace('_', ' ') || 'Direct'}
                      {payment.reference_number ? ` · Ref: ${payment.reference_number}` : ''}
                    </Text>
                  </View>

                  {/* Right Amount */}
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.amountText}>{formatCurrency(payment.amount)}</Text>
                    <Badge 
                      label={capitalize(payment.status)} 
                      status={status === 'paid' ? 'active' : status === 'overdue' ? 'cancelled' : 'pending'} 
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={44} color={colors.gray[300]} />
            <Text style={[screenStyles.empty, { marginTop: 12 }]}>No transaction history found</Text>
          </View>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCards: {
    padding: 20,
    gap: 16,
  },
  balanceCard: {
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  recentCard: {
    padding: 20,
    backgroundColor: colors.gray[100],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.status.pending + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 16,
  },
  recentAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  recentDate: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  payBtn: {
    height: 44,
    backgroundColor: colors.text.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  listContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dateBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
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
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  paymentInfo: {
    flex: 1,
    paddingRight: 8,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  paymentMeta: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
});
