import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

import { tenantApi } from '../../api/tenant';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ErrorState } from '../../components/common/ScreenContainer/../ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import { useAuth } from '../../context/AuthContext';
import type { TenantPaymentsStackParamList, TenantTabParamList } from '../../navigation/AppNavigator';
import type { TenantDashboard, Payment } from '../../types';
import { formatCurrency, formatDate, capitalize } from '../../utils/formatters';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TenantTabParamList>,
  NativeStackNavigationProp<TenantPaymentsStackParamList>
>;

export function TenantDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TenantDashboard | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Dashboard',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
    });
  }, [navigation]);

  const fetchDashboard = async () => {
    try {
      // 200ms delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));
      setData(await tenantApi.getDashboard());
    } catch (err: any) {
      console.error('Failed to fetch dashboard:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load data. Please try again.');
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

  const outstandingRent = data?.current_month_bill 
    ? data.current_month_bill.amount_due - data.current_month_bill.amount_paid 
    : 0;


  if (error) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <ErrorState message={error} onRetry={fetchDashboard} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable
      refreshing={refreshing}
      onRefresh={onRefresh}
      edges={['top', 'bottom', 'left', 'right']}
    >
      {/* Welcome Header */}
      <View style={styles.headerSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name}!</Text>
        <Text style={styles.subtitle}>Here is your property overview</Text>
      </View>

      {/* Main Action Card */}
      <View style={styles.actionCardContainer}>
        {loading ? (
          <Skeleton width="100%" height={100} borderRadius={16} />
        ) : (
          <View style={styles.actionCard}>
            <View>
              <Text style={styles.actionLabel}>Current Balance</Text>
              <Text style={styles.actionAmount}>{formatCurrency(outstandingRent)}</Text>
              {data?.current_month_bill && (
                <Text style={styles.actionDue}>Due: {formatDate(data.current_month_bill.due_date)}</Text>
              )}
            </View>
            <Button
              variant="primary"
              label="Pay Rent"
              onPress={() => navigation.navigate('MakePayment', { 
                monthlyRent: data?.current_month_bill?.amount_due,
                pendingAmount: outstandingRent,
                rentBillId: data?.current_month_bill?.id
              })}
            />
          </View>
        )}
      </View>

      {/* Unit Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Residence</Text>
        {loading ? (
          <Card>
             <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Skeleton variant="circle" width={48} height={48} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                   <Skeleton width="40%" height={16} style={{ marginBottom: 6 }} />
                   <Skeleton width="60%" height={12} />
                </View>
             </View>
             <View style={{ flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 16 }}>
                <View style={{ flex: 1 }}><Skeleton width="40%" height={10} style={{ marginBottom: 4 }} /><Skeleton width="70%" height={14} /></View>
                <View style={{ flex: 1 }}><Skeleton width="40%" height={10} style={{ marginBottom: 4 }} /><Skeleton width="70%" height={14} /></View>
             </View>
          </Card>
        ) : data?.unit ? (
          <Card>
            <View style={styles.unitHeader}>
              <View style={styles.unitIcon}>
                <Ionicons name="home-outline" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.unitNumber}>Unit {data.unit.unit_name || data.unit.unit_code}</Text>
                <Text style={styles.propertyName}>{data.unit.property?.name}</Text>
              </View>
              {data.tenancy && (
                <Badge 
                  label={data.tenancy.status.toUpperCase()} 
                  status={data.tenancy.status === 'active' ? 'active' : 'default'} 
                />
              )}
            </View>
            
            {data.tenancy && (
              <View style={styles.unitDetails}>
                <View style={styles.unitDetailItem}>
                  <Text style={styles.detailLabel}>Monthly Rent</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(data.tenancy.rent_amount || (data.tenancy as any).monthly_rent)}
                  </Text>
                </View>
                <View style={styles.unitDetailItem}>
                  <Text style={styles.detailLabel}>Move-in Date</Text>
                  <Text style={styles.detailValue}>{formatDate(data.tenancy.move_in_date)}</Text>
                </View>
              </View>
            )}
          </Card>
        ) : (
          <Card><Text style={screenStyles.empty}>No active unit</Text></Card>
        )}
      </View>

      {/* Recent Payments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Payments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Payments')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.listContainer}>
             {Array(3).fill(0).map((_, i) => (
               <View key={`pay-skeleton-${i}`} style={styles.paymentRow}>
                  <Skeleton width={36} height={36} borderRadius={8} style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                     <Skeleton width="40%" height={14} style={{ marginBottom: 6 }} />
                     <Skeleton width="30%" height={10} />
                  </View>
                  <Skeleton width={60} height={20} />
               </View>
             ))}
          </View>
        ) : data?.payments && data.payments.length > 0 ? (
          <View style={styles.listContainer}>
            {data.payments.slice(0, 3).map((payment, index) => {
              const isLast = index === Math.min(data.payments.length, 3) - 1;
              return (
                <View key={payment.id} style={[styles.paymentRow, isLast && { borderBottomWidth: 0 }]}>
                  <View style={styles.paymentIcon}>
                    <Ionicons name="card-outline" size={20} color={colors.text.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                    <Text style={styles.paymentDate}>
                      {payment.paid_at ? formatDate(payment.paid_at) : 'Processing'}
                    </Text>
                  </View>
                  <Badge 
                    label={capitalize(payment.status)} 
                    status={payment.status === 'paid' ? 'active' : 'pending'} 
                  />
                </View>
              );
            })}
          </View>
        ) : (
          <Card>
            <Text style={screenStyles.empty}>No payments yet</Text>
          </Card>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: colors.surface,
    padding: 24,
    paddingBottom: 40,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  actionCardContainer: {
    marginTop: -24,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: colors.text.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  actionLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionAmount: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    marginVertical: 4,
  },
  actionDue: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  unitIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  unitNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  propertyName: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  unitDetails: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 16,
  },
  unitDetailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  listContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  paymentIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  paymentDate: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
