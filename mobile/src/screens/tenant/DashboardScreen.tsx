import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { tenantApi } from '../../api/tenant';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import { formatCurrency, formatDate, capitalize } from '../../utils/formatters';
import type { TenantDashboard } from '../../types';

const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    active: colors.status.active,
    paid: colors.status.paid,
    overdue: colors.status.overdue,
    pending: colors.status.pending,
    expired: colors.status.expired,
  };
  return statusColors[status] ?? colors.gray[400];
};

export function TenantDashboardScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<TenantDashboard | null>(null);

  const fetchDashboard = async () => {
    try {
      setData(await tenantApi.getDashboard());
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView
      style={screenStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>
          Welcome back, {user?.name}!
        </Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>
          Here's your property overview
        </Text>
      </View>

      {/* Unit Info Card */}
      {data?.unit && (
        <Card style={screenStyles.card}>
          <Card.Title title="Your Unit" titleVariant="titleMedium" />
          <Card.Content>
            <View style={screenStyles.listItem}>
              <Text variant="bodyMedium" style={screenStyles.date}>Unit:</Text>
              <Text variant="bodyMedium">{data.unit.unit_number}</Text>
            </View>
            <View style={screenStyles.listItem}>
              <Text variant="bodyMedium" style={screenStyles.date}>Property:</Text>
              <Text variant="bodyMedium">{data.unit.property_name}</Text>
            </View>
            {data.tenancy && (
              <>
                <View style={screenStyles.listItem}>
                  <Text variant="bodyMedium" style={screenStyles.date}>Move-in Date:</Text>
                  <Text variant="bodyMedium">{formatDate(data.tenancy.move_in_date)}</Text>
                </View>
                <View style={screenStyles.listItem}>
                  <Text variant="bodyMedium" style={screenStyles.date}>Monthly Rent:</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: colors.primary }}>
                    {formatCurrency(data.tenancy.rent_amount)}
                  </Text>
                </View>
                <View style={screenStyles.listItem}>
                  <Text variant="bodyMedium" style={screenStyles.date}>Status:</Text>
                  <Chip
                    mode="flat"
                    style={[screenStyles.chip, { backgroundColor: getStatusColor(data.tenancy.status) + '20' }]}
                  >
                    {data.tenancy.status}
                  </Chip>
                </View>
              </>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Quick Actions */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 12 }}>
        <Button mode="contained" icon="credit-card" style={{ flex: 1 }} onPress={() => {}}>
          Pay Rent
        </Button>
        <Button mode="outlined" icon="file-document" style={{ flex: 1 }} onPress={() => {}}>
          View Lease
        </Button>
      </View>

      {/* Recent Payments */}
      <Card style={screenStyles.card}>
        <Card.Title title="Recent Payments" titleVariant="titleMedium" />
        <Card.Content>
          {data?.payments && data.payments.length > 0 ? (
            data.payments.slice(0, 3).map((payment) => (
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
                </View>
                <Chip
                  mode="flat"
                  style={[screenStyles.chip, { backgroundColor: getStatusColor(payment.status) + '20' }]}
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

      {/* Utilities Summary */}
      <Card style={screenStyles.card}>
        <Card.Title title="Utilities" titleVariant="titleMedium" />
        <Card.Content>
          {data?.utilities && data.utilities.length > 0 ? (
            data.utilities.slice(0, 3).map((utility) => (
              <View key={utility.id} style={screenStyles.listItem}>
                <View>
                  <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                    {capitalize(utility.utility_type?.name || 'Unknown')}
                  </Text>
                  <Text variant="bodySmall" style={screenStyles.date}>
                    Billing: {utility.billing_cycle}
                  </Text>
                </View>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {formatCurrency(utility.amount)}
                </Text>
              </View>
            ))
          ) : (
            <Text variant="bodyMedium" style={screenStyles.empty}>No pending utilities</Text>
          )}
        </Card.Content>
      </Card>

      {/* Notifications */}
      {data?.notifications && data.notifications.length > 0 && (
        <Card style={screenStyles.card}>
          <Card.Title title="Notifications" titleVariant="titleMedium" />
          <Card.Content>
            {data.notifications.slice(0, 3).map((notification) => (
              <View key={notification.id} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                  {notification.title}
                </Text>
                <Text variant="bodySmall" style={screenStyles.date}>
                  {notification.message}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}
