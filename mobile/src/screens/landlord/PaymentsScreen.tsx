import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { landlordApi } from '../../api/landlord';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Payment } from '../../types';
import type { LandlordPaymentsStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<LandlordPaymentsStackParamList>;

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

export function LandlordPaymentsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);

  const fetchPayments = async () => {
    try {
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

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView
      style={screenStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>Payments</Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>Track all tenant payments</Text>
      </View>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('UtilityBills')}
        style={{ marginHorizontal: 16, marginBottom: 16 }}
        icon="file-document"
      >
        Manage Utility Bills
      </Button>

      <Card style={screenStyles.card}>
        <Card.Content>
          {payments?.length > 0 ? (
            payments.map((payment) => (
              <View key={payment.id} style={screenStyles.listItem}>
                <View>
                  <Text variant="bodyMedium">{payment.tenant_name}</Text>
                  <Text variant="bodySmall" style={screenStyles.date}>
                    {payment.unit_number} • {payment.paid_at
                      ? formatDate(payment.paid_at)
                      : payment.due_date
                      ? `Due: ${formatDate(payment.due_date)}`
                      : '-'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {formatCurrency(payment.amount)}
                  </Text>
                  <Chip
                    mode="flat"
                    compact
                    style={[screenStyles.chip, { backgroundColor: getPaymentStatusColor(payment.status) + '20' }]}
                  >
                    {payment.status}
                  </Chip>
                </View>
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
