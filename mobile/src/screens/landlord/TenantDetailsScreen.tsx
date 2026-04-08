import { useNavigation } from '@react-navigation/native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';

import { landlordApi, isValidTenantCode } from '../../api/landlord';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import { LandlordTenantsStackParamList } from '../../navigation/AppNavigator';
import type { Tenant } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';



type NavigationProp = NativeStackNavigationProp<LandlordTenantsStackParamList>;

type TenantDetailsRouteProp = RouteProp<LandlordTenantsStackParamList, 'TenantDetails'>;

export function TenantDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TenantDetailsRouteProp>();
  const { tenantCode } = route.params;

  // Note: This is a client-side warning only. The backend validates the tenant code
  // via findTenantByIdentifier() and will return 404 for invalid codes.
  // This warning helps catch development issues but doesn't block execution.
  if (tenantCode && !isValidTenantCode(tenantCode)) {
    console.warn(
      `Security: Received non-standard tenantCode '${tenantCode}'. ` +
      `Expected format TEN-XXXXXX. Proceeding with API validation...`
    );
  }

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  const fetchTenant = useCallback(async () => {
    try {
      setError(null);
      const data = await landlordApi.getTenant(tenantCode);
      setTenant(data);
    } catch (err) {
      console.error('Failed to fetch tenant details:', err);
      setError('Failed to load tenant details. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tenantCode]);

  useEffect(() => {
    fetchTenant();
  }, [tenantCode, fetchTenant]);

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

  const activeTenancy = tenant.tenancies?.find((t) => t.status === 'active');
  const pastTenancies = tenant.tenancies?.filter((t) => t.status !== 'active') || [];

  return (
    <ScrollView 
       style={screenStyles.container}
       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>{tenant.full_name}</Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>{tenant.email}</Text>
        {tenant.tenant_code && (
          <Text variant="bodySmall" style={[screenStyles.subtitle, { marginTop: 4 }]}>
            Code: {tenant.tenant_code}
          </Text>
        )}
      </View>

      {/* Tenancy Information */}
      {activeTenancy && (
        <Card mode="contained" style={screenStyles.card}>
          <Card.Title title="Current Tenancy" titleVariant="titleMedium" />
          <Card.Content>
            {activeTenancy.unit && (
              <>
                <View style={screenStyles.listItem}>
                  <Text variant="bodyMedium" style={screenStyles.date}>Unit</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {activeTenancy.unit.unit_number || activeTenancy.unit.unit_name || `Unit ${activeTenancy.unit.id}`}
                  </Text>
                </View>
                {activeTenancy.unit.property_name && (
                  <View style={screenStyles.listItem}>
                    <Text variant="bodyMedium" style={screenStyles.date}>Property</Text>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                      {activeTenancy.unit.property_name}
                    </Text>
                  </View>
                )}
              </>
            )}
            <View style={screenStyles.listItem}>
              <Text variant="bodyMedium" style={screenStyles.date}>Move-in Date</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                {formatDate(activeTenancy.move_in_date)}
              </Text>
            </View>
            <View style={screenStyles.listItem}>
              <Text variant="bodyMedium" style={screenStyles.date}>Monthly Rent</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: colors.primary }}>
                {formatCurrency(activeTenancy.monthly_rent || activeTenancy.rent_amount || 0)}
              </Text>
            </View>
            {activeTenancy.security_deposit && activeTenancy.security_deposit > 0 && (
              <View style={screenStyles.listItem}>
                <Text variant="bodyMedium" style={screenStyles.date}>Security Deposit</Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {formatCurrency(activeTenancy.security_deposit || 0)}
                </Text>
              </View>
            )}
            <View style={screenStyles.listItem}>
              <Text variant="bodyMedium" style={screenStyles.date}>Status</Text>
              <Text variant="bodyMedium" style={{ 
                fontWeight: 'bold', 
                color: activeTenancy.status === 'active' ? colors.status.occupied : colors.gray[400] 
              }}>
                {activeTenancy.status.charAt(0).toUpperCase() + activeTenancy.status.slice(1)}
              </Text>
            </View>
            
            {activeTenancy.status === 'active' && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate('TenancyUtilities', { 
                  tenancyId: activeTenancy.id, 
                  tenantName: tenant?.full_name || 'Tenant' 
                })}
                style={{ marginTop: 16 }}
                icon="flash"
              >
                Manage Utilities
              </Button>
            )}
          </Card.Content>
        </Card>
      )}

      <Card mode="contained" style={screenStyles.card}>
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

      {/* Emergency Contact */}
      {(tenant.emergency_contact_name || tenant.emergency_contact_phone) && (
        <Card mode="contained" style={screenStyles.card}>
          <Card.Title title="Emergency Contact" />
          <Card.Content>
            {tenant.emergency_contact_name && (
              <View style={screenStyles.listItem}>
                <Text variant="bodyMedium" style={screenStyles.date}>Name</Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{tenant.emergency_contact_name}</Text>
              </View>
            )}
            {tenant.emergency_contact_phone && (
              <View style={screenStyles.listItem}>
                <Text variant="bodyMedium" style={screenStyles.date}>Phone</Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{tenant.emergency_contact_phone}</Text>
              </View>
            )}
            {tenant.emergency_contact_relation && (
              <View style={screenStyles.listItem}>
                <Text variant="bodyMedium" style={screenStyles.date}>Relationship</Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{tenant.emergency_contact_relation}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Past Tenancies */}
      {pastTenancies.length > 0 && (
        <Card mode="contained" style={screenStyles.card}>
          <Card.Title title="Past Tenancies" titleVariant="titleMedium" />
          <Card.Content>
            {pastTenancies.map((tenancy) => (
              <View key={tenancy.id} style={screenStyles.listItem}>
                <View>
                  <Text variant="bodyMedium">
                    {tenancy.unit?.unit_number || tenancy.unit?.unit_name || `Unit ${tenancy.unit?.id}`}
                  </Text>
                  <Text variant="bodySmall" style={screenStyles.date}>
                    {tenancy.move_out_date ? `Ended: ${formatDate(tenancy.move_out_date)}` : tenancy.status}
                  </Text>
                </View>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: colors.gray[400] }}>
                  {formatCurrency(tenancy.monthly_rent || tenancy.rent_amount || 0)}/mo
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}
