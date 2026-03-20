import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Text, Card, Chip, Button, SegmentedButtons } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { tenantApi } from '../../api/tenant';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getStatusColor } from '../../utils/statusColors';
import type { RentBill, RentBillSummary } from '../../types';
import type { TenantPaymentsStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<TenantPaymentsStackParamList>;

export function TenantRentBillsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bills, setBills] = useState<RentBill[]>([]);
  const [summary, setSummary] = useState<RentBillSummary | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const statusFilterRef = useRef<string | null>(null);

  const fetchBills = useCallback(async () => {
    try {
      const data = await tenantApi.getRentBills();
      let filteredBills = data.data;
      
      // Apply filter if set (use ref to avoid stale closure in callbacks)
      const currentFilter = statusFilterRef.current;
      if (currentFilter) {
        filteredBills = filteredBills.filter(bill => bill.status === currentFilter);
      }
      
      setBills(filteredBills);
      setSummary(data.summary);
    } catch (error) {
      console.error('Failed to fetch rent bills:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    statusFilterRef.current = statusFilter;
  }, [statusFilter]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // Refresh bills when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchBills();
    }, [fetchBills])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBills();
  };

  const handlePayBill = (bill: RentBill) => {
    const outstanding = bill.amount_due - bill.amount_paid;
    navigation.navigate('MakePayment', {
      monthlyRent: bill.amount_due,
      pendingAmount: outstanding,
      rentBillId: bill.id,
    });
  };

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView
      style={screenStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>Rent Bills</Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>
          Track your rent payments
        </Text>
      </View>

      {/* Summary Card */}
      {summary && (
        <Card style={screenStyles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={screenStyles.title}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={screenStyles.date}>Total Outstanding:</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: colors.status.overdue }}>
                {formatCurrency(summary.total_outstanding)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={screenStyles.date}>Pending Bills:</Text>
              <Chip
                mode="flat"
                style={{ backgroundColor: colors.status.pending + '20' }}
                textStyle={{ color: colors.status.pending }}
              >
                {summary.pending_count}
              </Chip>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={screenStyles.date}>Overdue Bills:</Text>
              <Chip
                mode="flat"
                style={{ backgroundColor: colors.status.overdue + '20' }}
                textStyle={{ color: colors.status.overdue }}
              >
                {summary.overdue_count}
              </Chip>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={screenStyles.date}>Paid Bills:</Text>
              <Chip
                mode="flat"
                style={{ backgroundColor: colors.status.paid + '20' }}
                textStyle={{ color: colors.status.paid }}
              >
                {summary.paid_count}
              </Chip>
            </View>
            
            {summary.total_outstanding > 0 && (
              <Button
                mode="contained"
                onPress={() => {
                  // Pay the oldest pending/overdue bill
                  const pendingBill = bills.find(
                    b => b.status === 'pending' || b.status === 'partial' || b.status === 'overdue'
                  );
                  if (pendingBill) {
                    handlePayBill(pendingBill);
                  }
                }}
                style={styles.payButton}
                buttonColor={colors.status.overdue}
                icon="credit-card"
              >
                Pay Outstanding ({formatCurrency(summary.total_outstanding)})
              </Button>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Filter */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={statusFilter || ''}
          onValueChange={(value) => setStatusFilter(value || null)}
          buttons={[
            { value: '', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'overdue', label: 'Overdue' },
            { value: 'paid', label: 'Paid' },
          ]}
        />
      </View>

      {/* Bills List */}
      <Card style={screenStyles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={screenStyles.title}>Rent Bills</Text>
          {bills.length > 0 ? (
            bills.map((bill) => {
              const outstanding = bill.amount_due - bill.amount_paid;
              
              return (
                <View key={bill.id} style={styles.billItem}>
                  <View style={styles.billHeader}>
                    <View>
                      <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                        {formatDate(bill.billing_month)}
                      </Text>
                      <Text variant="bodySmall" style={screenStyles.date}>
                        Due: {formatDate(bill.due_date)}
                      </Text>
                    </View>
                    <Chip
                      mode="flat"
                      compact
                      style={[styles.chip, { backgroundColor: getStatusColor(bill.status) + '20' }]}
                      textStyle={{ color: getStatusColor(bill.status) }}
                    >
                      {bill.status}
                    </Chip>
                  </View>
                  
                  <View style={styles.billDetails}>
                    <View style={styles.detailRow}>
                      <Text variant="bodySmall" style={screenStyles.date}>Amount Due:</Text>
                      <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                        {formatCurrency(bill.amount_due)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text variant="bodySmall" style={screenStyles.date}>Amount Paid:</Text>
                      <Text variant="bodyMedium" style={{ color: colors.status.paid }}>
                        {formatCurrency(bill.amount_paid)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text variant="bodySmall" style={screenStyles.date}>Outstanding:</Text>
                      <Text variant="bodyMedium" style={{ 
                        fontWeight: 'bold',
                        color: outstanding > 0 ? colors.status.overdue : colors.status.paid 
                      }}>
                        {formatCurrency(outstanding)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.billActions}>
                    {bill.status !== 'paid' && bill.status !== 'waived' && (
                      <Button 
                        mode="contained" 
                        onPress={() => handlePayBill(bill)}
                        compact
                        icon="credit-card"
                      >
                        Pay Now
                      </Button>
                    )}
                    <Button 
                      mode="outlined" 
                      onPress={() => navigation.navigate('RentBillDetails', { billId: bill.id })}
                      compact
                    >
                      View Details
                    </Button>
                  </View>
                </View>
              );
            })
          ) : (
            <Text variant="bodyMedium" style={screenStyles.empty}>
              No rent bills found
            </Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  payButton: {
    marginTop: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  billItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  chip: {
    height: 28,
  },
  billDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
});
