import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
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
import type { RentBill } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<TenantPaymentsStackParamList>;
type RouteProps = RouteProp<TenantPaymentsStackParamList, 'RentBillDetails'>;

export function TenantRentBillDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { billId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bill, setBill] = useState<RentBill | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Bill Details',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
    });
  }, [navigation]);

  const fetchBill = useCallback(async () => {
    try {
      const response = await tenantApi.getRentBill(billId);
      // Backend consistency check: handles both { data: RentBill } and direct RentBill responses
      const billData = (response as any).data || response;
      setBill(billData);
    } catch (error) {
      console.error('Failed to fetch rent bill:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [billId]);

  useEffect(() => {
    fetchBill();
  }, [fetchBill]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBill();
  };

  const handlePayBill = () => {
    if (!bill) return;
    const outstanding = bill.amount_due - bill.amount_paid;
    navigation.navigate('MakePayment', {
      monthlyRent: bill.amount_due,
      pendingAmount: outstanding,
      rentBillId: bill.id,
    });
  };

  if (loading) return <LoadingScreen />;

  if (!bill) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={screenStyles.empty}>Rent bill not found</Text>
      </ScreenContainer>
    );
  }

  const outstanding = bill.amount_due - bill.amount_paid;
  const paidPercent = bill.amount_due > 0 ? Math.min(100, (bill.amount_paid / bill.amount_due) * 100) : 0;

  return (
    <ScreenContainer
      scrollable
      refreshing={refreshing}
      onRefresh={onRefresh}
      edges={['bottom', 'left', 'right']}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>Rent for {formatDate(bill.billing_month)}</Text>
            <Text style={styles.heroAmount}>{formatCurrency(bill.amount_due)}</Text>
          </View>
          <Badge
            label={bill.status.toUpperCase()}
            status={bill.status === 'paid' ? 'active' : bill.status === 'overdue' ? 'cancelled' : 'pending'}
          />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${paidPercent}%` as any }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>Paid: {formatCurrency(bill.amount_paid)}</Text>
            <Text style={[styles.progressText, { color: outstanding > 0 ? colors.status.overdue : colors.status.paid }]}>
              {outstanding > 0 ? `Outstanding: ${formatCurrency(outstanding)}` : 'Fully Paid'}
            </Text>
          </View>
        </View>
      </View>

      {/* Bill Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.detailBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Billing Month</Text>
            <Text style={styles.detailValue}>{formatDate(bill.billing_month)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={[styles.detailValue, { color: bill.status === 'overdue' ? colors.status.overdue : colors.text.primary }]}>
              {formatDate(bill.due_date)}
            </Text>
          </View>
          {bill.property && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Property</Text>
              <Text style={styles.detailValue}>{bill.property.name}</Text>
            </View>
          )}
          {bill.unit && (
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>Unit</Text>
              <Text style={styles.detailValue}>Unit {bill.unit.unit_number}</Text>
            </View>
          )}
        </View>

        {bill.notes && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Notes</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{bill.notes}</Text>
            </View>
          </>
        )}
      </View>

      {/* Payment History */}
      {bill.payments && bill.payments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <View style={styles.listContainer}>
            {bill.payments.map((payment, index) => {
              const isLast = index === bill.payments!.length - 1;
              return (
                <View key={payment.id} style={[styles.paymentRow, isLast && { borderBottomWidth: 0 }]}>
                  <View style={styles.paymentIcon}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.status.paid} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                    <Text style={styles.paymentMeta}>
                      {payment.payment_method?.replace('_', ' ') || 'Payment'}
                      {payment.paid_at ? ` · ${formatDate(payment.paid_at)}` : ''}
                    </Text>
                  </View>
                  <Badge 
                    label="Paid" 
                    status="active" 
                  />
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Pay Now Button */}
      {outstanding > 0 && bill.status !== 'waived' && (
        <View style={styles.footer}>
          <Button
            variant="primary"
            label={`Pay Outstanding (${formatCurrency(outstanding)})`}
            onPress={handlePayBill}
            icon="card-outline"
          />
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    backgroundColor: colors.surface,
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  heroLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[100],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.status.paid,
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
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
  detailBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  notesBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
  },
  notesText: {
    color: colors.text.secondary,
    lineHeight: 22,
    fontSize: 14,
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
  paymentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  paymentMeta: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
});
