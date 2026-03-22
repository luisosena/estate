import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Alert } from 'react-native';
import { Text, Card, Chip, Button, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { landlordApi } from '../../api/landlord';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getStatusColor } from '../../utils/statusColors';
import type { RentBill } from '../../types';
import type { LandlordPaymentsStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<LandlordPaymentsStackParamList>;
type RouteProps = RouteProp<LandlordPaymentsStackParamList, 'RentBillDetails'>;

export function LandlordRentBillDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { billId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bill, setBill] = useState<RentBill | null>(null);

  const fetchBill = async () => {
    try {
      const data = await landlordApi.getRentBill(billId);
      setBill(data.data);
    } catch (error) {
      console.error('Failed to fetch rent bill:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [billId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBill();
  };

  const handleWaive = () => {
    if (!bill) return;
    Alert.alert(
      'Waive Rent Bill',
      `Are you sure you want to waive ${formatCurrency(bill.amount_due)} for this bill?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Waive',
          style: 'destructive',
          onPress: async () => {
            try {
              await landlordApi.waiveRentBill(bill.id);
              fetchBill();
            } catch (error: any) {
              console.error('Failed to waive bill:', error);
              const message = error?.response?.data?.message || error?.response?.data?.error || 'Failed to waive bill.';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingScreen />;

  if (!bill) {
    return (
      <View style={screenStyles.container}>
        <Text variant="bodyMedium" style={screenStyles.empty}>
          Rent bill not found
        </Text>
      </View>
    );
  }

  const outstanding = bill.amount_due - bill.amount_paid;
  const tenantName = bill.tenant?.full_name || 'Unknown';
  const tenantEmail = bill.tenant?.email || '';

  return (
    <ScrollView
      style={screenStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>Rent Bill Details</Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>
          {formatDate(bill.billing_month)}
        </Text>
      </View>

      {/* Status Card */}
      <Card mode="contained" style={screenStyles.card}>
        <Card.Content>
          <View style={styles.statusRow}>
            <Text variant="titleMedium">Status</Text>
            <Chip
              mode="flat"
              style={{ backgroundColor: getStatusColor(bill.status) + '20' }}
              textStyle={{ color: getStatusColor(bill.status), fontWeight: 'bold' }}
            >
              {bill.status.toUpperCase()}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Tenant Info */}
      <Card mode="contained" style={screenStyles.card}>
        <Card.Title title="Tenant" titleVariant="titleMedium" />
        <Card.Content>
          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={screenStyles.date}>Name:</Text>
            <Text variant="bodyMedium">{tenantName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={screenStyles.date}>Email:</Text>
            <Text variant="bodyMedium">{tenantEmail}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Property & Unit Info */}
      {(bill.property || bill.unit) && (
        <Card mode="contained" style={screenStyles.card}>
          <Card.Title title="Property & Unit" titleVariant="titleMedium" />
          <Card.Content>
            {bill.property && (
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={screenStyles.date}>Property:</Text>
                <Text variant="bodyMedium">{bill.property.name}</Text>
              </View>
            )}
            {bill.unit && (
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={screenStyles.date}>Unit:</Text>
                <Text variant="bodyMedium">{bill.unit.unit_number}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Bill Details */}
      <Card mode="contained" style={screenStyles.card}>
        <Card.Title title="Bill Details" titleVariant="titleMedium" />
        <Card.Content>
          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={screenStyles.date}>Billing Month:</Text>
            <Text variant="bodyMedium">{formatDate(bill.billing_month)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={screenStyles.date}>Due Date:</Text>
            <Text variant="bodyMedium" style={{ 
              color: bill.status === 'overdue' ? colors.status.overdue : colors.text.secondary 
            }}>
              {formatDate(bill.due_date)}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={screenStyles.date}>Amount Due:</Text>
            <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
              {formatCurrency(bill.amount_due)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={screenStyles.date}>Amount Paid:</Text>
            <Text variant="bodyMedium" style={{ color: colors.status.paid }}>
              {formatCurrency(bill.amount_paid)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={screenStyles.date}>Outstanding:</Text>
            <Text variant="bodyMedium" style={{ 
              fontWeight: 'bold',
              color: outstanding > 0 ? colors.status.overdue : colors.status.paid 
            }}>
              {formatCurrency(outstanding)}
            </Text>
          </View>
          {bill.notes && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.notesSection}>
                <Text variant="bodyMedium" style={screenStyles.date}>Notes:</Text>
                <Text variant="bodyMedium">{bill.notes}</Text>
              </View>
            </>
          )}
        </Card.Content>
        {bill.status !== 'waived' && bill.status !== 'paid' && (
          <Card.Actions>
            <Button
              mode="outlined"
              onPress={handleWaive}
              style={{ marginHorizontal: 16, marginBottom: 8 }}
              textColor={colors.error}
            >
              Waive This Bill
            </Button>
          </Card.Actions>
        )}
      </Card>

      {/* Payment History */}
      {bill.payments && bill.payments.length > 0 && (
        <Card mode="contained" style={screenStyles.card}>
          <Card.Title title="Payment History" titleVariant="titleMedium" />
          <Card.Content>
            {bill.payments.map((payment) => (
              <View key={payment.id} style={styles.paymentItem}>
                <View>
                  <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                    {formatCurrency(payment.amount)}
                  </Text>
                  <Text variant="bodySmall" style={screenStyles.date}>
                    {payment.payment_method ? `${payment.payment_method.replace('_', ' ')} • ` : ''}
                    {payment.paid_at ? formatDate(payment.paid_at) : '-'}
                  </Text>
                  {payment.reference_number && (
                    <Text variant="bodySmall" style={screenStyles.date}>
                      Ref: {payment.reference_number}
                    </Text>
                  )}
                </View>
                <Chip
                  mode="flat"
                  compact
                  style={{ backgroundColor: getStatusColor(payment.status) + '20' }}
                  textStyle={{ color: getStatusColor(payment.status), fontSize: 12 }}
                >
                  {payment.status}
                </Chip>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 8,
  },
  notesSection: {
    gap: 4,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
