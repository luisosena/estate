import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ErrorState } from '../../components/common/ScreenContainer/../ErrorState';
import { tenantApi } from '../../api/tenant';
import { Skeleton } from '../../components/common/Skeleton';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import type { TenantUtilitiesStackParamList } from '../../navigation/AppNavigator';
import type { Utility } from '../../types';
import { formatCurrency, capitalize } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<TenantUtilitiesStackParamList>;

export function TenantUtilitiesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [summary, setSummary] = useState({ total_outstanding: 0 });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Utilities',
      headerShown: true,
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
    });
  }, [navigation]);

  const fetchUtilities = async () => {
    try {
      setLoading(true);
      setError(null);
      // 200ms delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));
      const response = await tenantApi.getUtilities();
      const utilitiesData = response.data || (Array.isArray(response) ? response : []);
      setUtilities(utilitiesData);
      
      const outstanding = utilitiesData.reduce((sum: number, u: any) => sum + (u.amount_due - u.amount_paid), 0);
      setSummary({ total_outstanding: outstanding });
      setHasLoaded(true);
    } catch (err: any) {
      console.error('Failed to fetch utilities:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUtilities();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUtilities();
  };


  if (error) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <ErrorState message={error} onRetry={fetchUtilities} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable
      refreshing={refreshing}
      onRefresh={onRefresh}
      edges={['bottom', 'left', 'right']}
    >
      <View style={styles.summaryContainer}>
        {loading && !hasLoaded ? (
          <Skeleton width="100%" height={120} borderRadius={16} />
        ) : (
          <Card style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              <View>
                <Text style={styles.summaryLabel}>Outstanding Utilities</Text>
                {loading ? (
                  <Skeleton width={180} height={32} style={{ marginVertical: 4 }} />
                ) : (
                  <Text style={styles.summaryAmount}>{formatCurrency(summary.total_outstanding)}</Text>
                )}
              </View>
              <View style={styles.iconCircle}>
                <Ionicons name="flash" size={24} color={colors.primary} />
              </View>
            </View>
            <TouchableOpacity 
              style={styles.historyLink}
              onPress={() => navigation.navigate('UtilityBills')}
            >
              <Text style={styles.historyLinkText}>View Billing History</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </Card>
        )}
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>My Utility Connections</Text>

        {loading ? (
          <View style={{ gap: 12 }}>
            {Array(3).fill(0).map((_, i) => (
              <View key={`skeleton-${i}`} style={styles.utilityItem}>
                 <Skeleton width={44} height={44} borderRadius={10} style={{ marginRight: 12 }} />
                 <View style={{ flex: 1 }}>
                    <Skeleton width="50%" height={16} style={{ marginBottom: 6 }} />
                    <Skeleton width="30%" height={12} />
                 </View>
                 <Skeleton width={80} height={20} borderRadius={10} />
              </View>
            ))}
          </View>
        ) : utilities.length > 0 ? (
          <View style={styles.utilitiesList}>
            {utilities.map((utility) => {
               const status = utility.status === 'active' ? 'active' : utility.status === 'suspended' ? 'pending' : 'cancelled';
               return (
                  <View key={utility.id} style={styles.utilityItem}>
                    <View style={styles.utilityIcon}>
                      <Ionicons name="flash-outline" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.utilityInfo}>
                      <Text style={styles.utilityName}>{capitalize(utility.utility_type?.name || 'Unknown')}</Text>
                      <Text style={styles.utilityMeta}>Ref: {utility.account_number || 'N/A'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                       <Badge label={capitalize(utility.status)} status={status} />
                    </View>
                  </View>
               );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="flash-off-outline" size={44} color={colors.gray[300]} />
            <Text style={[screenStyles.empty, { marginTop: 12 }]}>No active utilities found</Text>
          </View>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    padding: 20,
  },
  summaryCard: {
    padding: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  historyLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  listSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  utilitiesList: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 16,
  },
  utilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  utilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  utilityInfo: {
    flex: 1,
  },
  utilityName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  utilityMeta: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
});
