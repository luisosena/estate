import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';

import { landlordApi } from '../../api/landlord';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import { LandlordPropertiesStackParamList } from '../../navigation/AppNavigator';
import type { Unit } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

type UnitDetailsRouteProp = RouteProp<LandlordPropertiesStackParamList, 'UnitDetails'>;
type NavigationProp = NativeStackNavigationProp<LandlordPropertiesStackParamList, 'UnitDetails'>;

export function UnitDetailsScreen() {
  const route = useRoute<UnitDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { unitId } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);

  const fetchUnit = useCallback(async () => {
    try {
      setError(null);
      const data = await landlordApi.getUnit(unitId);
      setUnit(data);
    } catch (err) {
      console.error('Failed to fetch unit details:', err);
      setError('Failed to load unit details. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [unitId]);

  // Set up navigation header for Add Tenant button on vacant units
  useLayoutEffect(() => {
    if (unit && (unit.status === 'vacant' || unit.status === 'available')) {
      navigation.setOptions({
        headerRight: () => (
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AddTenant', { unitId })}
            buttonColor={colors.primary}
            textColor="#fff"
            compact
            style={{ marginRight: 8 }}
          >
            Add Tenant
          </Button>
        ),
      });
    } else {
      // Reset header when unit is not vacant
      navigation.setOptions({
        headerRight: undefined,
      });
    }
  }, [navigation, unit, unitId]);

  useEffect(() => {
    fetchUnit();
  }, [unitId, fetchUnit]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUnit();
  };

  if (loading) return <LoadingScreen />;
  if (error) {
    return (
      <View style={[screenStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={[screenStyles.empty, { color: colors.error, marginBottom: 16 }]}>{error}</Text>
      </View>
    );
  }
  if (!unit) {
    return (
      <View style={[screenStyles.container, { justifyContent: 'center' }]}>
        <Text style={screenStyles.empty}>Unit not found.</Text>
      </View>
    );
  }

  const activeTenancy = unit.tenancies?.find((t) => t.status === 'active');
  const currentTenant = activeTenancy?.tenant;
  const isVacant = unit.status === 'vacant' || unit.status === 'available';

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'occupied':
        return colors.status.occupied;
      case 'vacant':
      case 'available':
        return colors.status.vacant;
      case 'maintenance':
        return colors.status.pending;
      default:
        return colors.gray[400];
    }
  };

  return (
    <ScrollView 
      style={screenStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>
          Unit {unit.unit_number || unit.unit_name || unit.id}
        </Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>
          {unit.property_name}
        </Text>
        {unit.unit_code && (
          <Text variant="bodySmall" style={[screenStyles.subtitle, { marginTop: 4 }]}>
            Code: {unit.unit_code}
          </Text>
        )}
      </View>

      <Card mode="contained" style={screenStyles.card}>
        <Card.Title title="Unit Information" />
        <Card.Content>
          <View style={screenStyles.listItem}>
             <Text variant="bodyMedium" style={screenStyles.date}>Status</Text>
             <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: getStatusColor(unit.status) }}>
               {unit.status ? unit.status.charAt(0).toUpperCase() + unit.status.slice(1) : 'Unknown'}
             </Text>
          </View>
          {unit.rent_amount !== undefined && (
            <View style={screenStyles.listItem}>
               <Text variant="bodyMedium" style={screenStyles.date}>Rent Amount</Text>
               <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: colors.primary }}>
                 {formatCurrency(unit.rent_amount)}
               </Text>
            </View>
          )}
          {unit.bedrooms !== undefined && (
            <View style={screenStyles.listItem}>
               <Text variant="bodyMedium" style={screenStyles.date}>Bedrooms</Text>
               <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{unit.bedrooms}</Text>
            </View>
          )}
          {unit.bathrooms !== undefined && (
            <View style={screenStyles.listItem}>
               <Text variant="bodyMedium" style={screenStyles.date}>Bathrooms</Text>
               <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{unit.bathrooms}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Current Tenant Info */}
      {currentTenant && (
        <Card mode="contained" style={screenStyles.card}>
          <Card.Title title="Current Tenant" titleVariant="titleMedium" />
          <Card.Content>
            <View style={screenStyles.listItem}>
               <Text variant="bodyMedium" style={screenStyles.date}>Name</Text>
               <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{currentTenant.full_name}</Text>
            </View>
            <View style={screenStyles.listItem}>
               <Text variant="bodyMedium" style={screenStyles.date}>Email</Text>
               <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{currentTenant.email}</Text>
            </View>
            {activeTenancy?.start_date && (
              <View style={screenStyles.listItem}>
                 <Text variant="bodyMedium" style={screenStyles.date}>Move-in Date</Text>
                 <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                   {formatDate(activeTenancy.start_date)}
                 </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Past Tenants */}
      {unit.tenancies && unit.tenancies.filter(t => t.status !== 'active').length > 0 && (
        <Card mode="contained" style={screenStyles.card}>
          <Card.Title title="Past Tenants" titleVariant="titleMedium" />
          <Card.Content>
            {unit.tenancies.filter(t => t.status !== 'active').map((tenancy) => (
              <View key={tenancy.id} style={screenStyles.listItem}>
                <View>
                  <Text variant="bodyMedium">{tenancy.tenant?.full_name || 'Unknown'}</Text>
                  <Text variant="bodySmall" style={screenStyles.date}>
                    {tenancy.end_date ? `Ended: ${formatDate(tenancy.end_date)}` : tenancy.status}
                  </Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}
