import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { landlordApi } from '../../api/landlord';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LandlordPropertiesStackParamList } from '../../navigation/AppNavigator';
import { formatCurrency } from '../../utils/formatters';
import type { Property, Unit } from '../../types';

type PropertyDetailsRouteProp = RouteProp<LandlordPropertiesStackParamList, 'PropertyDetails'>;
type NavigationProp = NativeStackNavigationProp<LandlordPropertiesStackParamList, 'PropertyDetails'>;

export function PropertyDetailsScreen() {
  const route = useRoute<PropertyDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { propertyId } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);

  const fetchPropertyAndUnits = useCallback(async () => {
    try {
      setError(null);
      const [propData, unitsData] = await Promise.all([
        landlordApi.getProperty(propertyId),
        landlordApi.getUnits(propertyId)
      ]);
      setProperty(propData);
      setUnits(unitsData.data);
    } catch (err) {
      console.error('Failed to fetch property details:', err);
      setError('Failed to load property details. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchPropertyAndUnits();
  }, [propertyId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPropertyAndUnits();
  };

  if (loading) return <LoadingScreen />;
  if (error) {
    return (
      <View style={[screenStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={[screenStyles.empty, { color: colors.error, marginBottom: 16 }]}>{error}</Text>
      </View>
    );
  }
  if (!property) {
    return (
      <View style={[screenStyles.container, { justifyContent: 'center' }]}>
        <Text style={screenStyles.empty}>Property isolated or not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={screenStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>{property.name}</Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>{property.address}</Text>
      </View>

      <View style={{ padding: 16 }}>
        <Text variant="titleMedium">Units</Text>
      </View>
      
      {units?.length > 0 ? (
        units.map((unit) => (
          <Card mode="contained" 
            key={unit.id} 
            style={screenStyles.card}
            onPress={() => navigation.navigate('UnitDetails', { unitId: unit.id })}
          >
            <Card.Title 
              title={`Unit ${unit.unit_number}`} 
              subtitle={`Status: ${unit.status || 'unknown'}`} 
            />
            <Card.Content>
              <View style={screenStyles.listItem}>
                 <Text variant="bodyMedium" style={screenStyles.date}>Rent Amount</Text>
                 <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {formatCurrency(unit.rent_amount ?? 0)}
                 </Text>
              </View>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card mode="contained" style={screenStyles.card}>
          <Card.Content>
            <Text variant="bodyMedium" style={screenStyles.empty}>No units found for this property.</Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}
