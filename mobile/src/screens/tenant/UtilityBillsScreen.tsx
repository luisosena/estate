import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { tenantApi } from '../../api/tenant';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import { formatCurrency, formatDate, capitalize } from '../../utils/formatters';
import type { UtilityBill, UtilityBillSummary } from '../../types';
import type { TenantUtilitiesStackParamList, TenantPaymentsStackParamList } from '../../navigation/AppNavigator';

// Combine navigation types for navigating between stacks
type NavigationProp = NativeStackNavigationProp<
  TenantUtilitiesStackParamList & TenantPaymentsStackParamList
>;

const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    paid: colors.status.paid,
    partial: colors.status.pending,
    overdue: colors.status.overdue,
    pending: colors.status.pending,
    waived: colors.gray[400],
  };
  return statusColors[status] ?? colors.gray[400];
};

export function TenantUtilityBillsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [summary, setSummary] = useState<UtilityBillSummary | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  const fetchBills = async () => {
    try {
      const data = await tenantApi.getUtilityBills(filter || undefined);
      setBills(data.data);
      setSummary(data.summary);
    } catch (error) {
      console.error('Failed to fetch utility bills:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [filter]);

  // Refresh bills when screen comes into focus (e.g., after making payment)
  useFocusEffect(
    useCallback(() => {
      fetchBills();
    }, []) // Empty deps - fetchBills already has filter in its scope
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBills();
  };

  const handlePayBill = () => {
    navigation.navigate('MakePayment', {
      pendingAmount: summary?.total_outstanding || 0,
    });
  };

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView
      style={screenStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>Utility Bills</Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>Track your utility payments</Text>
      </View>

      {/* Summary Card */}
      {summary && (
        <Card style={screenStyles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={screenStyles.title}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={screenStyles.date}>Total Due:</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                {formatCurrency(summary.total_due)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={screenStyles.date}>Total Paid:</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: colors.status.paid }}>
                {formatCurrency(summary.total_paid)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={screenStyles.date}>Outstanding:</Text>
              <Text variant="bodyMedium" style={{ 
                fontWeight: 'bold', 
                color: summary.total_outstanding > 0 ? colors.status.overdue : colors.status.paid 
              }}>
                {formatCurrency(summary.total_outstanding)}
              </Text>
            </View>
            <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 8 }]}>
              <Text variant="bodyMedium" style={screenStyles.date}>Total Bills:</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                {summary.bill_count}
              </Text>
            </View>
            
            {summary.total_outstanding > 0 && (
              <Button
                mode="contained"
                onPress={handlePayBill}
                style={styles.payButton}
                buttonColor={colors.status.overdue}
              >
                Pay Outstanding ({formatCurrency(summary.total_outstanding)})
              </Button>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <Button
          mode={filter === null ? 'contained' : 'outlined'}
          onPress={() => setFilter(null)}
          style={styles.filterButton}
          compact
        >
          All
        </Button>
        <Button
          mode={filter === 'pending' ? 'contained' : 'outlined'}
          onPress={() => setFilter('pending')}
          style={styles.filterButton}
          compact
        >
          Pending
        </Button>
        <Button
          mode={filter === 'overdue' ? 'contained' : 'outlined'}
          onPress={() => setFilter('overdue')}
          style={styles.filterButton}
          compact
        >
          Overdue
        </Button>
        <Button
          mode={filter === 'paid' ? 'contained' : 'outlined'}
          onPress={() => setFilter('paid')}
          style={styles.filterButton}
          compact
        >
          Paid
        </Button>
      </View>

      {/* Bills List */}
      <Card style={screenStyles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={screenStyles.title}>Bills</Text>
          {bills.length > 0 ? (
            bills.map((bill) => {
              const utilityName = bill.tenancy_utility?.utility_type?.name || 'Unknown';
              const outstanding = bill.amount_due - bill.amount_paid;
              
              return (
                <View key={bill.id} style={styles.billItem}>
                  <View style={styles.billHeader}>
                    <View>
                      <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                        {capitalize(utilityName)}
                      </Text>
                      <Text variant="bodySmall" style={screenStyles.date}>
                        Billing Month: {formatDate(bill.billing_month)}
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
                    <View style={styles.detailRow}>
                      <Text variant="bodySmall" style={screenStyles.date}>Due Date:</Text>
                      <Text variant="bodyMedium" style={{ 
                        color: bill.status === 'overdue' ? colors.status.overdue : colors.text.secondary 
                      }}>
                        {formatDate(bill.due_date)}
                      </Text>
                    </View>
                    {bill.units_consumed !== null && (
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={screenStyles.date}>Units Consumed:</Text>
                        <Text variant="bodyMedium">
                          {bill.units_consumed} {bill.tenancy_utility?.utility_type?.unit}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <Text variant="bodyMedium" style={screenStyles.empty}>No utility bills found</Text>
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
    paddingVertical: 4,
  },
  payButton: {
    marginTop: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
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
});
