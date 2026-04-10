import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';

import { ScreenContainer } from '../../components/common/ScreenContainer';

import { tenantApi } from '../../api/tenant';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import type { TenantUtilitiesStackParamList } from '../../navigation/AppNavigator';
import type { Utility } from '../../types';
import { formatCurrency, formatDate, capitalize } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<TenantUtilitiesStackParamList>;

/**
 * Returns the color for utility status display.
 * @param status - Utility status: 'active', 'suspended', or 'disconnected'
 * @returns Hex color string for the given status
 */
const getUtilityStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    active: colors.status.active,
    suspended: colors.status.pending,
    disconnected: colors.status.overdue,
  };
  return statusColors[status] ?? colors.gray[400];
};

export function TenantUtilitiesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [utilities, setUtilities] = useState<Utility[]>([]);

  const fetchUtilities = async () => {
    try {
      const data = await tenantApi.getUtilities();
      setUtilities(data.data);
    } catch (error) {
      console.error('Failed to fetch utilities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Utilities',
      headerShown: true,
    });
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUtilities();
  };

  if (loading) return <LoadingScreen />;

  return (
    <ScreenContainer
      scrollable
      refreshing={refreshing}
      onRefresh={onRefresh}
      edges={['bottom', 'left', 'right']}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 20, marginBottom: 16 }}>
        <Text variant="bodyMedium" style={{ color: colors.text.secondary }}>
          Track your utility connections and billing cycles
        </Text>
      </View>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('UtilityBills')}
        style={{ marginHorizontal: 16, marginBottom: 16 }}
        icon="file-document"
      >
        View Utility Bills
      </Button>

      <Card style={screenStyles.card}>
        <Card.Content>
          {utilities?.length > 0 ? (
            utilities.map((utility) => (
              <View key={utility.id} style={styles.listItem}>
                <View>
                  <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                    {capitalize(utility.utility_type?.name || 'Unknown')}
                  </Text>
                  <Text variant="bodySmall" style={styles.infoLabel}>
                    Billing: {utility.billing_cycle}
                  </Text>
                  {utility.provider && (
                    <Text variant="bodySmall" style={styles.infoLabel}>
                      Provider: {utility.provider}
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {formatCurrency(utility.amount)}
                  </Text>
                  <Chip
                    mode="flat"
                    compact
                    style={[styles.statusChip, { backgroundColor: getUtilityStatusColor(utility.status) + '20' }]}
                  >
                    {utility.status}
                  </Chip>
                </View>
              </View>
            ))
          ) : (
            <Text variant="bodyMedium" style={screenStyles.empty}>No pending utilities</Text>
          )}
        </Card.Content>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  statusChip: {
    height: 24,
    marginTop: 4,
  },
});
