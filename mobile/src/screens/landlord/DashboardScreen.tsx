import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../components/common/ScreenContainer';

import { landlordApi } from '../../api/landlord';
import { Skeleton } from '../../components/common/Skeleton';
import { StatCardSkeleton } from '../../components/common/SkeletonVariants';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import { useAuth } from '../../context/AuthContext';
import type { LandlordPaymentsStackParamList } from '../../navigation/AppNavigator';
import type { LandlordDashboard } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<LandlordPaymentsStackParamList>;

export function LandlordDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<LandlordDashboard | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Dashboard',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
      headerRight: () => (
        <View style={{ flexDirection: 'row', padding: 8, gap: 16 }}>
          <Ionicons name="search" size={20} color={colors.text.primary} />
          <Ionicons name="notifications-outline" size={20} color={colors.text.primary} />
        </View>
      ),
    });
  }, [navigation]);

  const fetchDashboard = async () => {
    try {
      // 200ms delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));
      // Fetch dashboard
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

  return (
    <ScreenContainer
      scrollable
      refreshing={refreshing}
      onRefresh={onRefresh}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back, {user?.name}!</Text>
        <Text style={styles.dateText}>{formatDate(new Date().toISOString())}</Text>
      </View>

      {/* Summary Stats Grid */}
      <View style={styles.statsGrid}>
        {loading ? (
          Array(3).fill(0).map((_, i) => <StatCardSkeleton key={`stat-skeleton-${i}`} />)
        ) : data ? (
          <>
            <View style={styles.statSquare}>
              <View style={[styles.statIconBox, { backgroundColor: colors.gray[100] }]}>
                <Ionicons name="business" size={18} color={colors.text.primary} />
              </View>
              <Text style={styles.statGridValue}>{data.total_properties}</Text>
              <Text style={styles.statGridLabel}>Properties</Text>
            </View>
            <View style={styles.statSquare}>
              <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="people" size={18} color={colors.status.occupied} />
              </View>
              <Text style={styles.statGridValue}>{data.total_tenants}</Text>
              <Text style={styles.statGridLabel}>Tenants</Text>
            </View>
            <View style={styles.statSquare}>
              <View style={[styles.statIconBox, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="home-outline" size={18} color={colors.status.expired} />
              </View>
              <Text style={styles.statGridValue}>{data.vacant_units}</Text>
              <Text style={styles.statGridLabel}>Vacant</Text>
            </View>
          </>
        ) : null}
      </View>

      {/* Outstanding Balances */}
      <Card style={styles.cardSpacing}>
        {loading ? (
          <View>
            <Skeleton width="40%" height={12} style={{ marginBottom: 12 }} />
            <Skeleton width="60%" height={32} />
          </View>
        ) : data ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Rent Outstanding</Text>
              {data.pending_rent_bills > 0 || data.overdue_rent_bills > 0 ? (
                <Badge label={`${data.pending_rent_bills + data.overdue_rent_bills} Pending`} status="pending" />
              ) : null}
            </View>
            
            <Text style={styles.largeMoney}>{formatCurrency(data.total_rent_outstanding || 0)}</Text>
            
            <Button
              label="Manage Rent Bills"
              variant="outline"
              style={{ marginTop: 16 }}
              onPress={() => navigation.navigate('RentBills')}
            />
          </>
        ) : null}
      </Card>

      {/* Recent Payments List */}
      <View style={styles.listSection}>
        <Text style={styles.listSectionTitle}>Recent Payments</Text>
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <View key={`pay-skeleton-${i}`} style={styles.rowItem}>
               <Skeleton variant="circle" width={40} height={40} style={{ marginRight: 12 }} />
               <View style={{ flex: 1 }}>
                 <Skeleton width="50%" height={14} style={{ marginBottom: 8 }} />
                 <Skeleton width="30%" height={10} />
               </View>
               <Skeleton width={80} height={20} />
            </View>
          ))
        ) : data?.recent_payments && data.recent_payments.length > 0 ? (
          data.recent_payments.slice(0, 5).map((payment) => (
            <View key={payment.id} style={styles.rowItem}>
              <View style={styles.rowIcon}>
                <Ionicons name="cash-outline" size={20} color={colors.status.paid} />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>{payment.tenant_name}</Text>
                <Text style={styles.rowSubtitle}>Unit {payment.unit_number}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.rowValue}>{formatCurrency(payment.amount)}</Text>
                <Text style={styles.rowDate}>
                  {payment.paid_at ? formatDate(payment.paid_at) : 'Processing'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={screenStyles.empty}>No recent payments</Text>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  dateText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  statSquare: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statGridValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statGridLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    fontWeight: '500',
  },
  cardSpacing: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  largeMoney: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    marginTop: 8,
  },
  listSection: {
    paddingHorizontal: 20,
  },
  listSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  rowSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  rowDate: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
