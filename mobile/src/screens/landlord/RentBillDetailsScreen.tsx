import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { landlordApi } from '../../api/landlord';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { DetailBoxSkeleton, ListSectionSkeleton } from '../../components/common/SkeletonVariants';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import type { LandlordPaymentsStackParamList } from '../../navigation/AppNavigator';
import type { RentBill } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getStatusColor } from '../../utils/statusColors';

type NavigationProp = NativeStackNavigationProp<LandlordPaymentsStackParamList>;
type RouteProps = RouteProp<LandlordPaymentsStackParamList, 'RentBillDetails'>;

const getBadgeStatus = (status: string): 'active' | 'pending' | 'cancelled' | 'default' => {
  if (status === 'paid' || status === 'waived') return 'active';
  if (status === 'pending') return 'pending';
  if (status === 'overdue') return 'cancelled';
  return 'default';
};

export function LandlordRentBillDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { billId } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bill, setBill] = useState<RentBill | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Bill Details',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
    });
  }, [navigation]);

  const fetchBill = useCallback(async () => {
    try {
      setLoading(true);
      // 200ms delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));
      // Fetch bill details
      const response = await landlordApi.getRentBill(billId);
      // Backend consistency check: handles both { data: RentBill } and direct RentBill responses
      const billData = (response as any).data || response;
      setBill(billData);
    } catch (error) {
      console.error('Failed to fetch rent bill:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [billId]);

  useEffect(() => {
    fetchBill();
  }, [fetchBill]);

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
              Alert.alert('Error', error?.response?.data?.message || 'Failed to waive bill.');
            }
          },
        },
      ]
    );
  };

  if (!bill && !loading) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={screenStyles.empty}>Rent bill not found</Text>
      </ScreenContainer>
    );
  }

  const outstanding = bill ? (bill.amount_due - bill.amount_paid) : 0;
  const paidPercent = (bill && bill.amount_due > 0) ? Math.min(100, (bill.amount_paid / bill.amount_due) * 100) : 0;

  return (
    <ScreenContainer
      scrollable
      refreshing={refreshing}
      onRefresh={onRefresh}
      edges={['bottom', 'left', 'right']}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        {loading ? (
          <>
            <View style={styles.heroTop}>
              <View>
                <Skeleton width={120} height={14} style={{ marginBottom: 8 }} />
                <Skeleton width={180} height={32} />
              </View>
              <Skeleton width={80} height={24} borderRadius={12} />
            </View>
            <View style={{ marginTop: 24 }}>
               <Skeleton width="100%" height={6} borderRadius={3} style={{ marginBottom: 12 }} />
               <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Skeleton width="30%" height={12} />
                  <Skeleton width="30%" height={12} />
               </View>
            </View>
          </>
        ) : bill && (
          <>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>Bill for {formatDate(bill.billing_month)}</Text>
                <Text style={styles.heroAmount}>{formatCurrency(bill.amount_due)}</Text>
              </View>
              <Badge
                label={bill.status.toUpperCase()}
                status={getBadgeStatus(bill.status)}
              />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${paidPercent}%` as any }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressText}>Paid: {formatCurrency(bill.amount_paid)}</Text>
                <Text style={[styles.progressText, { color: outstanding > 0 ? colors.status.overdue : colors.status.paid }]}>
                  Outstanding: {formatCurrency(outstanding)}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Tenant Row */}
      {loading ? (
        <View style={styles.tenantRowSkeleton}>
          <Skeleton variant="circle" width={44} height={44} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Skeleton width="50%" height={16} style={{ marginBottom: 6 }} />
            <Skeleton width="70%" height={12} />
          </View>
          <Skeleton width={20} height={20} />
        </View>
      ) : bill && (
        <TouchableOpacity style={styles.tenantRow} activeOpacity={0.7}>
          <View style={styles.tenantAvatar}>
            <Text style={styles.tenantAvatarText}>
              {(bill.tenant?.full_name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tenantName}>{bill.tenant?.full_name || 'Unknown'}</Text>
            <Text style={styles.tenantEmail}>{bill.tenant?.email || ''}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      )}

      {/* Details Section */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Bill Details</Text>
        {loading ? (
          <DetailBoxSkeleton rows={4} />
        ) : bill && (
          <View style={styles.detailBox}>
            {bill.property && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Property</Text>
                <Text style={styles.detailValue}>{bill.property.name}</Text>
              </View>
            )}
            {bill.unit && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Unit</Text>
                <Text style={styles.detailValue}>Unit {bill.unit.unit_number}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Billing Month</Text>
              <Text style={styles.detailValue}>{formatDate(bill.billing_month)}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>Due Date</Text>
              <Text style={[styles.detailValue, { color: bill.status === 'overdue' ? colors.status.overdue : colors.text.primary }]}>
                {formatDate(bill.due_date)}
              </Text>
            </View>
          </View>
        )}

        {!loading && bill && bill.notes && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Notes</Text>
            <View style={styles.notesBox}>
              <Text style={{ color: colors.text.secondary, lineHeight: 20 }}>{bill.notes}</Text>
            </View>
          </>
        )}
      </View>

      {/* Payment History */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        {loading ? (
          <ListSectionSkeleton items={1} />
        ) : bill && bill.payments && bill.payments.length > 0 ? (
          <View style={styles.detailBox}>
            {bill.payments.map((payment, idx) => (
              <View
                key={payment.id}
                style={[styles.paymentRow, idx === bill.payments!.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View style={[styles.paymentIcon, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.status.paid} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                  <Text style={styles.paymentMeta}>
                    {payment.payment_method?.replace('_', ' ') || ''}
                    {payment.paid_at ? ` · ${formatDate(payment.paid_at)}` : ''}
                  </Text>
                  {payment.reference_number && (
                    <Text style={styles.paymentRef}>Ref: {payment.reference_number}</Text>
                  )}
                </View>
                <Badge
                  label={payment.status}
                  status={payment.status === 'paid' ? 'active' : 'pending'}
                />
              </View>
            ))}
          </View>
        ) : !loading && (
          <Text style={screenStyles.empty_inline}>No payments recorded.</Text>
        )}
      </View>

      {/* Waive Action */}
      {!loading && bill && bill.status !== 'waived' && bill.status !== 'paid' && (
        <View style={{ paddingHorizontal: 20, marginTop: 8, marginBottom: 40 }}>
          <Button
            variant="outline"
            label="Waive This Bill"
            onPress={handleWaive}
            style={{ borderColor: colors.error }}
          />
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    backgroundColor: colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  heroLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[100],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.status.paid,
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  tenantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginTop: 8,
  },
  tenantRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginTop: 8,
  },
  tenantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tenantAvatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  tenantName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  tenantEmail: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  detailsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  detailBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  notesBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  paymentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  paymentMeta: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  paymentRef: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
