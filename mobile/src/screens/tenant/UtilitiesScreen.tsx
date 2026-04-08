import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';

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

  useEffect(() => {
    fetchUtilities();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUtilities();
  };

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView
      style={screenStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>Utilities</Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>Track your utility connections</Text>
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
              <View key={utility.id} style={screenStyles.listItem}>
                <View>
                  <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                    {capitalize(utility.utility_type?.name || 'Unknown')}
                  </Text>
                  <Text variant="bodySmall" style={screenStyles.date}>
                    Billing: {utility.billing_cycle}
                  </Text>
                  {utility.provider && (
                    <Text variant="bodySmall" style={screenStyles.date}>
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
                    style={[screenStyles.chip, { backgroundColor: getUtilityStatusColor(utility.status) + '20' }]}
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
    </ScrollView>
  );
}
