import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { landlordApi } from '../../api/landlord';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { LandlordDashboard } from '../../types';

export function LandlordDashboardScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<LandlordDashboard | null>(null);

  const fetchDashboard = async () => {
    try {
      setData(await landlordApi.getDashboard());
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
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>
          Welcome back, {user?.name}!
        </Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>Manage your properties</Text>
      </View>

      {/* Summary Stats */}
      {data && (
        <Card style={screenStyles.card}>
          <Card.Title title="Overview" titleVariant="titleMedium" />
          <Card.Content>
            <View style={screenStyles.listItem}>
              <Text variant="bodyMedium" style={screenStyles.date}>Properties</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{data.total_properties}</Text>
            </View>
            <View style={screenStyles.listItem}>
              <Text variant="bodyMedium" style={screenStyles.date}>Total Units</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{data.total_units}</Text>
            </View>
            <View style={screenStyles.listItem}>
              <Text variant="bodyMedium" style={screenStyles.date}>Occupied</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: colors.status.occupied }}>
                {data.occupied_units}
              </Text>
            </View>
            <View style={screenStyles.listItem}>
              <Text variant="bodyMedium" style={screenStyles.date}>Vacant</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: colors.status.vacant }}>
                {data.vacant_units}
              </Text>
            </View>
            <View style={screenStyles.listItem}>
              <Text variant="bodyMedium" style={screenStyles.date}>Total Tenants</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{data.total_tenants}</Text>
            </View>
            <View style={screenStyles.listItem}>
              <Text variant="bodyMedium" style={screenStyles.date}>Pending Payments</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: colors.status.pending }}>
                {data.pending_payments}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Recent Payments */}
      {data?.recent_payments && data.recent_payments.length > 0 && (
        <Card style={screenStyles.card}>
          <Card.Title title="Recent Payments" titleVariant="titleMedium" />
          <Card.Content>
            {data.recent_payments.slice(0, 5).map((payment) => (
              <View key={payment.id} style={screenStyles.listItem}>
                <View>
                  <Text variant="bodyMedium">{payment.tenant_name}</Text>
                  <Text variant="bodySmall" style={screenStyles.date}>
                    {payment.unit_number} • {payment.paid_at ? formatDate(payment.paid_at) : `Due: ${formatDate(payment.due_date)}`}
                  </Text>
                </View>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {formatCurrency(payment.amount)}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Expiring Leases */}
      {data?.expiring_leases && data.expiring_leases.length > 0 && (
        <Card style={screenStyles.card}>
          <Card.Title title="Expiring Leases" titleVariant="titleMedium" />
          <Card.Content>
            {data.expiring_leases.slice(0, 5).map((tenancy) => (
              <View key={tenancy.id} style={screenStyles.listItem}>
                <View>
                  <Text variant="bodyMedium">{tenancy.tenant?.full_name}</Text>
                  <Text variant="bodySmall" style={screenStyles.date}>
                    {tenancy.unit?.unit_number} • {formatCurrency(tenancy.rent_amount)}/mo
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ color: colors.status.expired }}>
                  {tenancy.move_out_date ? formatDate(tenancy.move_out_date) : tenancy.status}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}
