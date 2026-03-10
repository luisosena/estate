import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { landlordApi } from '../../api/landlord';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import { RouteProp, useRoute } from '@react-navigation/native';
import { LandlordPropertiesStackParamList } from '../../navigation/AppNavigator';
import type { Unit } from '../../types';

type UnitDetailsRouteProp = RouteProp<LandlordPropertiesStackParamList, 'UnitDetails'>;

export function UnitDetailsScreen() {
  const route = useRoute<UnitDetailsRouteProp>();
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

  useEffect(() => {
    fetchUnit();
  }, [unitId]);

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

  return (
    <ScrollView 
      style={screenStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>Unit {unit.unit_number}</Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>{unit.property_name}</Text>
      </View>

      <Card style={screenStyles.card}>
        <Card.Title title="Unit Information" />
        <Card.Content>
          <View style={screenStyles.listItem}>
             <Text variant="bodyMedium" style={screenStyles.date}>Status</Text>
             <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{unit.status}</Text>
          </View>
          <View style={screenStyles.listItem}>
             <Text variant="bodyMedium" style={screenStyles.date}>Rent Amount</Text>
             <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>${unit.rent_amount ?? 0}</Text>
          </View>
          <View style={screenStyles.listItem}>
             <Text variant="bodyMedium" style={screenStyles.date}>Bedrooms</Text>
             <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{unit.bedrooms}</Text>
          </View>
          <View style={screenStyles.listItem}>
             <Text variant="bodyMedium" style={screenStyles.date}>Bathrooms</Text>
             <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{unit.bathrooms}</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
