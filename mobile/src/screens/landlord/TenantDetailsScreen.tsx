import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { landlordApi } from '../../api/landlord';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import { RouteProp, useRoute } from '@react-navigation/native';
import { LandlordTenantsStackParamList } from '../../navigation/AppNavigator';
import type { Tenant } from '../../types';

type TenantDetailsRouteProp = RouteProp<LandlordTenantsStackParamList, 'TenantDetails'>;

export function TenantDetailsScreen() {
  const route = useRoute<TenantDetailsRouteProp>();
  const { tenantId } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  const fetchTenant = useCallback(async () => {
    try {
      setError(null);
      const data = await landlordApi.getTenant(tenantId);
      setTenant(data);
    } catch (err) {
      console.error('Failed to fetch tenant details:', err);
      setError('Failed to load tenant details. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTenant();
  }, [tenantId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTenant();
  };

  if (loading) return <LoadingScreen />;
  if (error) {
    return (
      <View style={[screenStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={[screenStyles.empty, { color: colors.error, marginBottom: 16 }]}>{error}</Text>
      </View>
    );
  }
  if (!tenant) {
    return (
      <View style={[screenStyles.container, { justifyContent: 'center' }]}>
        <Text style={screenStyles.empty}>Tenant not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
       style={screenStyles.container}
       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>{tenant.full_name}</Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>{tenant.email}</Text>
      </View>
      <Card style={screenStyles.card}>
         <Card.Title title="Contact Information" />
         <Card.Content>
            <View style={screenStyles.listItem}>
               <Text variant="bodyMedium" style={screenStyles.date}>Phone</Text>
               <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{tenant.phone}</Text>
            </View>
            {tenant.identification_number && (
               <View style={screenStyles.listItem}>
                  <Text variant="bodyMedium" style={screenStyles.date}>{tenant.identification_type || 'ID'}</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{tenant.identification_number}</Text>
               </View>
            )}
         </Card.Content>
      </Card>
    </ScrollView>
  );
}
