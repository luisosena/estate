import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../components/common/ScreenContainer';

import { tenantApi } from '../../api/tenant';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import type { TenantPaymentsStackParamList } from '../../navigation/AppNavigator';
import type { Payment } from '../../types';
import { formatCurrency, capitalize } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<TenantPaymentsStackParamList>;

export function TenantPaymentsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [monthlyRent, setMonthlyRent] = useState(0);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerShown: true,
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
    });
  }, [navigation]);

  const fetchPayments = async () => {
    try {
      setError(null);
      const data = await tenantApi.getPayments();
      setPayments(data.payments);
      setPendingAmount(data.pendingAmount);
      setMonthlyRent(data.tenancy?.monthly_rent || 0);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setError('Failed to load payments. Pull to refresh.');
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

  const handleMakePayment = () => {
    navigation.navigate('MakePayment', {
      monthlyRent,
      pendingAmount,
    });
  };

  if (loading) return <LoadingScreen />;

  return (
    <ScreenContainer
      scrollable
      refreshing={refreshing}
      onRefresh={onRefresh}
      edges={['bottom', 'left', 'right']}
    >
      {/* Balance Section */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Current Pending Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(pendingAmount)}</Text>
        <View style={styles.balanceActions}>
          <Button
            variant="primary"
            label="Make a Payment"
            onPress={handleMakePayment}
            style={{ flex: 1 }}
            icon="card-outline"
          />
        </View>
        <TouchableOpacity 
          style={styles.billsLink}
          onPress={() => navigation.navigate('RentBills')}
        >
          <Text style={styles.billsLinkText}>View All Rent Bills</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Transaction History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction History</Text>

        {payments?.length > 0 ? (
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
  balanceSection: {
    backgroundColor: colors.surface,
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 24,
  },
  balanceActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  billsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  billsLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
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
    paddingHorizontal: 16,
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
