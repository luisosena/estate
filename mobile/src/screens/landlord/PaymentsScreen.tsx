import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { landlordApi } from '../../api/landlord';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import { formatCurrency, formatDate, capitalize } from '../../utils/formatters';
import type { Payment } from '../../types';
import type { LandlordPaymentsStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<LandlordPaymentsStackParamList>;

const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    paid: colors.status.paid,
    partial: colors.status.pending,
    overdue: colors.status.overdue,
    pending: colors.status.pending,
    cancelled: colors.status.expired,
  };
  return statusColors[status] ?? colors.text.secondary;
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

      <Card style={[screenStyles.card, { backgroundColor: colors.surfaceVariant, elevation: 0 }]}>
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <Text variant="titleMedium" style={{ fontSize: 18, color: colors.text.primary }}>Recent Transactions</Text>
        </View>
        <Card.Content style={{ paddingHorizontal: 16, paddingTop: 0 }}>
          {payments?.length > 0 ? (
            payments.map((payment, index) => {
              const dateSource = payment.paid_at || payment.due_date;
              const isLast = index === payments.length - 1;

              return (
                <View 
                  key={payment.id} 
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: colors.borderLight,
                  }}
                >
                  <View style={{
                    backgroundColor: colors.gray[700],
                    borderRadius: 12,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                    minWidth: 70,
                  }}>
                    {dateSource ? (
                      <>
                        <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16, marginBottom: 2 }}>
                          {new Date(dateSource).getDate()}
                        </Text>
                        <Text style={{ color: colors.white, fontSize: 10, opacity: 0.9 }}>
                          {new Date(dateSource).toLocaleDateString('en-US', { month: 'short' })}
                        </Text>
                      </>
                    ) : (
                      <Text style={{ color: colors.white, fontSize: 12 }}>-</Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: '500', color: colors.text.primary, marginBottom: 4 }}>
                      {payment.tenant_name || 'Unknown Tenant'}
                    </Text>
                    <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                      {payment.unit_number ? `Unit ${payment.unit_number} • ` : ''}
                      {payment.payment_method === 'mobile_money' ? 'Mobile Money' : 
                       payment.payment_method === 'bank_transfer' ? 'Bank Transfer' :
                       payment.payment_type ? capitalize(payment.payment_type) : '-'}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                    <Text variant="titleMedium" style={{ fontWeight: '600', color: colors.text.primary, marginBottom: 4 }}>
                      {formatCurrency(payment.amount)}
                    </Text>
                    <Text variant="bodySmall" style={{ color: getStatusColor(payment.status) }}>
                      {capitalize(payment.status)}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text variant="bodyMedium" style={[screenStyles.empty, { paddingVertical: 16 }]}>No payments yet</Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
