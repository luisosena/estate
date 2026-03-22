import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import { landlordApi } from '../../api/landlord';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { screenStyles } from '../../constants/styles';
import type { Tenant } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LandlordTenantsStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<LandlordTenantsStackParamList, 'TenantsList'>;

export function LandlordTenantsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="account-plus"
          iconColor="#fff"
          size={24}
          onPress={() => navigation.navigate('AddTenant', {})}
        />
      ),
    });
  }, [navigation]);

  const fetchTenants = async () => {
    try {
      const data = await landlordApi.getTenants();
      setTenants(data.data);
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTenants();
  };

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView
      style={screenStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>Tenants</Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>
          {tenants?.length} {tenants?.length === 1 ? 'tenant' : 'tenants'}
        </Text>
      </View>

      {tenants?.length > 0 ? (
        tenants.map((tenant) => (
          <Card mode="contained" 
            key={tenant.id} 
            style={screenStyles.card}
            onPress={() => {
              // Security: Require tenant_code to prevent enumeration attacks
              if (!tenant.tenant_code) {
                Alert.alert(
                  'Unable to View Details',
                  `Tenant ${tenant.full_name} cannot be viewed at this time. Please contact support.`
                );
                return;
              }
              navigation.navigate('TenantDetails', { tenantCode: tenant.tenant_code });
            }}
          >
            <Card.Title title={tenant.full_name} titleVariant="titleMedium" />
            <Card.Content>
              <View style={screenStyles.listItem}>
                <Text variant="bodyMedium" style={screenStyles.date}>Email</Text>
                <Text variant="bodyMedium">{tenant.email}</Text>
              </View>
              <View style={screenStyles.listItem}>
                <Text variant="bodyMedium" style={screenStyles.date}>Phone</Text>
                <Text variant="bodyMedium">{tenant.phone}</Text>
              </View>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card mode="contained" style={screenStyles.card}>
          <Card.Content>
            <Text variant="bodyMedium" style={screenStyles.empty}>No tenants yet</Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}
