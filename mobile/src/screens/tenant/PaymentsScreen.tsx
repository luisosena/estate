import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { tenantApi } from '../../api/tenant';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Payment, Tenant } from '../../types';

const getPaymentStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    paid: colors.status.paid,
    overdue: colors.status.overdue,
    pending: colors.status.pending,
  };
  return statusColors[status] ?? colors.gray[400];
};

export function TenantPaymentsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);

  const fetchPayments = async () => {
    try {
      const data = await tenantApi.getPayments();
      setPayments(data.payments);
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

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView
      style={screenStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>Payments</Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>View your payment history</Text>
      </View>

      <Card style={screenStyles.card}>
        <Card.Content>
          {payments.length > 0 ? (
            payments.map((payment) => (
              <View key={payment.id} style={screenStyles.listItem}>
                <View>
                  <Text variant="bodyMedium">{formatCurrency(payment.amount)}</Text>
                  <Text variant="bodySmall" style={screenStyles.date}>
                    {payment.paid_at ? formatDate(payment.paid_at) : `Due: ${formatDate(payment.due_date)}`}
                  </Text>
                </View>
                <Chip
                  mode="flat"
                  style={[screenStyles.chip, { backgroundColor: getPaymentStatusColor(payment.status) + '20' }]}
                >
                  {payment.status}
                </Chip>
              </View>
            ))
          ) : (
            <Text variant="bodyMedium" style={screenStyles.empty}>No payments yet</Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
