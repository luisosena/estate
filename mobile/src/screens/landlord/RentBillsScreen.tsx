import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Alert } from 'react-native';
import { Text, Card, Chip, Button, SegmentedButtons } from 'react-native-paper';

import { landlordApi } from '../../api/landlord';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import type { LandlordPaymentsStackParamList } from '../../navigation/AppNavigator';
import type { RentBill } from '../../types';
import { formatCurrency, formatDate, capitalize } from '../../utils/formatters';
import { getStatusColor } from '../../utils/statusColors';

type NavigationProp = NativeStackNavigationProp<LandlordPaymentsStackParamList>;

interface RentBillParams {
  page?: number;
  status?: string;
  property_id?: number;
  tenant_id?: number;
}

export function LandlordRentBillsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bills, setBills] = useState<RentBill[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const statusFilterRef = useRef<string | null>(null);
  const pageRef = useRef(1);

  const fetchBills = useCallback(async (pageNum?: number) => {
    try {
      const currentPage = pageNum ?? pageRef.current;
      const params: RentBillParams = { page: currentPage };
      if (statusFilterRef.current) {
        params.status = statusFilterRef.current;
      }
      const response = await landlordApi.getRentBills(params);
      setBills(response.data);
      setTotalPages(response.meta.total_pages);
      setPage(currentPage);
      pageRef.current = currentPage;
    } catch (error) {
      console.error('Failed to fetch rent bills:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Keep refs in sync with state
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

  const handleWaive = (bill: RentBill) => {
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
              fetchBills(page);
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

  // Calculate summary stats
  const totalOutstanding = bills.reduce((sum, bill) => sum + (bill.amount_due - bill.amount_paid), 0);
  const pendingCount = bills.filter(b => b.status === 'pending').length;
  const overdueCount = bills.filter(b => b.status === 'overdue').length;
  const paidCount = bills.filter(b => b.status === 'paid').length;

  return (
    <View style={screenStyles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={screenStyles.header}>
          <Text variant="headlineSmall" style={screenStyles.title}>Rent Bills</Text>
          <Text variant="bodyMedium" style={screenStyles.subtitle}>
            Manage tenant rent bills
          </Text>
        </View>

        {/* Summary Stats */}
        <Card mode="contained" style={screenStyles.card}>
          <Card.Content>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={screenStyles.date}>Total Outstanding:</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: colors.status.overdue }}>
                {formatCurrency(totalOutstanding)}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Chip
                  mode="flat"
                  style={{ backgroundColor: colors.status.pending + '20' }}
                  textStyle={{ color: colors.status.pending }}
                >
                  {pendingCount} Pending
                </Chip>
              </View>
              <View style={styles.statItem}>
                <Chip
                  mode="flat"
                  style={{ backgroundColor: colors.status.overdue + '20' }}
                  textStyle={{ color: colors.status.overdue }}
                >
                  {overdueCount} Overdue
                </Chip>
              </View>
              <View style={styles.statItem}>
                <Chip
                  mode="flat"
                  style={{ backgroundColor: colors.status.paid + '20' }}
                  textStyle={{ color: colors.status.paid }}
                >
                  {paidCount} Paid
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Filter */}
        <View style={styles.filterContainer}>
          <SegmentedButtons
            value={statusFilter || ''}
            onValueChange={(value) => {
              setStatusFilter(value || null);
              setPage(1);
            }}
            buttons={[
              { value: '', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'paid', label: 'Paid' },
            ]}
          />
        </View>

        {/* Bills List */}
        <Card mode="contained" style={screenStyles.card}>
          <Card.Content>
            {bills.length > 0 ? (
              bills.map((bill) => {
                const outstanding = bill.amount_due - bill.amount_paid;
                const tenantName = bill.tenant?.full_name || 'Unknown';
                
                return (
                  <View key={bill.id} style={styles.billItem}>
                    <View style={styles.billHeader}>
                      <View>
                        <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                          {tenantName}
                        </Text>
                        <Text variant="bodySmall" style={screenStyles.date}>
                          Bill for {formatDate(bill.billing_month)}
                        </Text>
                        {bill.property && (
                          <Text variant="bodySmall" style={screenStyles.date}>
                            {bill.property.name} {bill.unit ? `- ${bill.unit.unit_number}` : ''}
                          </Text>
                        )}
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
                    </View>
                    
                    <View style={styles.billActions}>
                      <Button 
                        mode="outlined" 
                        onPress={() => navigation.navigate('RentBillDetails', { billId: bill.id })} 
                        compact
                      >
                        View Details
                      </Button>
                      {bill.status !== 'waived' && bill.status !== 'paid' && (
                        <Button 
                          mode="outlined" 
                          onPress={() => handleWaive(bill)} 
                          compact 
                          textColor={colors.error}
                        >
                          Waive
                        </Button>
                      )}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <Button 
              mode="outlined" 
              onPress={() => fetchBills(page - 1)} 
              disabled={page === 1}
            >
              Previous
            </Button>
            <Text variant="bodyMedium" style={styles.pageInfo}>
              Page {page} of {totalPages}
            </Text>
            <Button 
              mode="outlined" 
              onPress={() => fetchBills(page + 1)} 
              disabled={page === totalPages}
            >
              Next
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statItem: {
    flex: 1,
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  pageInfo: {
    textAlign: 'center',
  },
});
