import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';

import { tenantApi } from '../../api/tenant';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import type { TenantPaymentsStackParamList } from '../../navigation/AppNavigator';
import type { Payment, Tenant } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<TenantPaymentsStackParamList>;

const getPaymentStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    paid: colors.status.paid,
    partial: colors.status.pending,
    overdue: colors.status.overdue,
    pending: colors.status.pending,
    cancelled: colors.status.expired,
  };
  return statusColors[status] ?? colors.gray[400];
};

export function TenantPaymentsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [monthlyRent, setMonthlyRent] = useState(0);

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
    <ScrollView
      style={screenStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>Payments</Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>Manage your rent payments</Text>
      </View>

      {/* Pending Payment Card or All Settled Card */}
      {error ? (
        <Card style={[screenStyles.card, { backgroundColor: colors.error + '15' }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: colors.error }}>
              ⚠️ {error}
            </Text>
          </Card.Content>
        </Card>
      ) : pendingAmount > 0 ? (
        <Card style={[screenStyles.card, { backgroundColor: colors.warning + '15' }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: colors.status.overdue }}>
              Pending Payment
            </Text>
            <Text variant="headlineMedium" style={[styles.pendingAmount, { color: colors.status.overdue }]}>
              {formatCurrency(pendingAmount)}
            </Text>
            <Text variant="bodyMedium" style={styles.monthlyRent}>
              Monthly Rent: {formatCurrency(monthlyRent)}
            </Text>
            <Button
              mode="contained"
              onPress={handleMakePayment}
              style={styles.makePaymentButton}
              buttonColor={colors.status.overdue}
            >
              Make Payment
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <Card style={[screenStyles.card, { backgroundColor: colors.status.paid + '15' }]}>
          <Card.Content style={styles.settledContent}>
            <Text variant="titleMedium" style={{ color: colors.status.paid }}>
              ✓ All Payments Settled
            </Text>
            <Text variant="bodyMedium" style={styles.settledText}>
              You have no pending payments
            </Text>
            <Button
              mode="outlined"
              onPress={handleMakePayment}
              style={styles.addPaymentButton}
            >
              Add Payment
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Rent Bills Link */}
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('RentBills')}
        style={{ marginHorizontal: 16, marginBottom: 16 }}
        icon="home"
      >
        View Rent Bills
      </Button>

      {/* Payment History */}
      <Card style={screenStyles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={screenStyles.title}>
            Payment History
          </Text>
          {payments?.length > 0 ? (
            payments.map((payment) => (
              <View key={payment.id} style={screenStyles.listItem}>
                <View>
                  <Text variant="bodyMedium">{formatCurrency(payment.amount)}</Text>
                  <Text variant="bodySmall" style={screenStyles.date}>
                    {payment.paid_at
                      ? formatDate(payment.paid_at)
                      : payment.due_date
                      ? `Due: ${formatDate(payment.due_date)}`
                      : '-'}
                  </Text>
                  <Text variant="bodySmall" style={screenStyles.date}>
                    {payment.payment_type === 'rent' ? 'Rent' : 'Utility'}
                  </Text>
                </View>
                <Chip
                  mode="flat"
                  style={[
                    screenStyles.chip,
                    { backgroundColor: getPaymentStatusColor(payment.status) + '20' },
                  ]}
                  textStyle={{ color: getPaymentStatusColor(payment.status) }}
                >
                  {payment.status}
                </Chip>
              </View>
            ))
          ) : (
            <Text variant="bodyMedium" style={screenStyles.empty}>
              No payment history yet
            </Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pendingAmount: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  monthlyRent: {
    color: colors.text.secondary,
    marginTop: 4,
  },
  makePaymentButton: {
    marginTop: 16,
  },
  settledContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  settledText: {
    color: colors.text.secondary,
    marginTop: 4,
    marginBottom: 16,
  },
  addPaymentButton: {
    marginTop: 8,
  },
});
