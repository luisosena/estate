import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../components/common/ScreenContainer';

import { tenantApi } from '../../api/tenant';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
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

  const outstandingRent = data?.current_month_bill 
    ? data.current_month_bill.amount_due - data.current_month_bill.amount_paid 
    : 0;

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
      </View>

      {/* Unit Info Section */}
      {data?.unit && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Residence</Text>
          <Card>
            <View style={styles.unitHeader}>
              <View style={styles.unitIcon}>
                <Ionicons name="home-outline" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.unitNumber}>Unit {data.unit.unit_number}</Text>
                <Text style={styles.propertyName}>{data.unit.property_name}</Text>
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
                  <Text style={styles.detailValue}>{formatCurrency(data.tenancy.rent_amount)}</Text>
                </View>
                <View style={styles.unitDetailItem}>
                  <Text style={styles.detailLabel}>Move-in Date</Text>
                  <Text style={styles.detailValue}>{formatDate(data.tenancy.move_in_date)}</Text>
                </View>
              </View>
            )}
          </Card>
        </View>
      )}

      {/* Recent Payments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Payments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Payments')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {data?.payments && data.payments.length > 0 ? (
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
    paddingHorizontal: 16,
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
