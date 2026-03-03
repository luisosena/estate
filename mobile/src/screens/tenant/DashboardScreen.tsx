import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { tenantApi, TenantDashboard } from '../../api/tenant';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { colors } from '../../constants/colors';

export function TenantDashboardScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<TenantDashboard | null>(null);

  const fetchDashboard = async () => {
    try {
      const dashboardData = await tenantApi.getDashboard();
      setData(dashboardData);
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

  if (loading) {
    return <LoadingScreen />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-TZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.greeting}>
          Welcome back, {user?.name}!
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Here's your property overview
        </Text>
      </View>

      {/* Unit Info Card */}
      {data?.unit && (
        <Card style={styles.card}>
          <Card.Title title="Your Unit" titleVariant="titleMedium" />
          <Card.Content>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Unit:</Text>
              <Text variant="bodyMedium">{data.unit.unit_number}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Property:</Text>
              <Text variant="bodyMedium">{data.unit.property_name}</Text>
            </View>
            {data.tenancy && (
              <>
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.label}>Move-in Date:</Text>
                  <Text variant="bodyMedium">{formatDate(data.tenancy.move_in_date)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.label}>Monthly Rent:</Text>
                  <Text variant="bodyMedium" style={styles.rent}>
                    {formatCurrency(data.tenancy.rent_amount)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.label}>Status:</Text>
                  <Chip 
                    mode="flat" 
                    style={[
                      styles.chip,
                      { backgroundColor: data.tenancy.status === 'active' ? colors.status.active + '20' : colors.status.expired + '20' }
                    ]}
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
      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="credit-card"
          style={styles.actionButton}
          onPress={() => {}}
        >
          Pay Rent
        </Button>
        <Button
          mode="outlined"
          icon="file-document"
          style={styles.actionButton}
          onPress={() => {}}
        >
          View Lease
        </Button>
      </View>

      {/* Recent Payments */}
      <Card style={styles.card}>
        <Card.Title title="Recent Payments" titleVariant="titleMedium" />
        <Card.Content>
          {data?.payments && data.payments.length > 0 ? (
            data.payments.slice(0, 3).map((payment) => (
              <View key={payment.id} style={styles.paymentItem}>
                <View>
                  <Text variant="bodyMedium">{formatCurrency(payment.amount)}</Text>
                  <Text variant="bodySmall" style={styles.date}>
                    {payment.paid_at ? formatDate(payment.paid_at) : `Due: ${formatDate(payment.due_date)}`}
                  </Text>
                </View>
                <Chip
                  mode="flat"
                  style={[
                    styles.chip,
                    { 
                      backgroundColor: payment.status === 'paid' 
                        ? colors.status.paid + '20' 
                        : payment.status === 'overdue' 
                          ? colors.status.overdue + '20'
                          : colors.status.pending + '20'
                    }
                  ]}
                >
                  {payment.status}
                </Chip>
              </View>
            ))
          ) : (
            <Text variant="bodyMedium" style={styles.empty}>
              No payments yet
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Utilities Summary */}
      <Card style={styles.card}>
        <Card.Title title="Utilities" titleVariant="titleMedium" />
        <Card.Content>
          {data?.utilities && data.utilities.length > 0 ? (
            data.utilities.slice(0, 3).map((utility) => (
              <View key={utility.id} style={styles.utilityItem}>
                <View>
                  <Text variant="bodyMedium" style={styles.utilityType}>
                    {utility.type.charAt(0).toUpperCase() + utility.type.slice(1)}
                  </Text>
                  <Text variant="bodySmall" style={styles.date}>
                    Due: {formatDate(utility.due_date)}
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.amount}>
                  {formatCurrency(utility.amount)}
                </Text>
              </View>
            ))
          ) : (
            <Text variant="bodyMedium" style={styles.empty}>
              No pending utilities
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Notifications */}
      {data?.notifications && data.notifications.length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="Notifications" titleVariant="titleMedium" />
          <Card.Content>
            {data.notifications.slice(0, 3).map((notification) => (
              <View key={notification.id} style={styles.notificationItem}>
                <Text variant="bodyMedium" style={styles.notificationTitle}>
                  {notification.title}
                </Text>
                <Text variant="bodySmall" style={styles.notificationMessage}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  greeting: {
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.text.secondary,
    marginTop: 4,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    color: colors.text.secondary,
  },
  rent: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  chip: {
    height: 28,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  date: {
    color: colors.text.secondary,
    marginTop: 2,
  },
  utilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  utilityType: {
    fontWeight: '500',
  },
  amount: {
    fontWeight: 'bold',
  },
  empty: {
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  notificationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notificationTitle: {
    fontWeight: '500',
  },
  notificationMessage: {
    color: colors.text.secondary,
    marginTop: 4,
  },
});
