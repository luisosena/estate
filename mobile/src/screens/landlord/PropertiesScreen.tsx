import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card } from 'react-native-paper';

import { landlordApi } from '../../api/landlord';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import { LandlordPropertiesStackParamList } from '../../navigation/AppNavigator';
import type { Property } from '../../types';

type NavigationProp = NativeStackNavigationProp<LandlordPropertiesStackParamList, 'PropertiesList'>;

const getOccupancyColor = (occupied: number, total: number): string => {
  if (total === 0) return colors.gray[400];
  const ratio = occupied / total;
  if (ratio >= 0.8) return colors.status.occupied;
  if (ratio >= 0.5) return colors.status.pending;
  return colors.status.expired;
};

export function LandlordPropertiesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);

  const fetchProperties = async () => {
    try {
      const data = await landlordApi.getProperties();
      setProperties(data.data);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView
      style={screenStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>Properties</Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>
          {properties?.length} {properties?.length === 1 ? 'property' : 'properties'}
        </Text>
      </View>

      {properties?.length > 0 ? (
        properties.map((property) => (
          <Card mode="contained" 
            key={property.id} 
            style={screenStyles.card}
            onPress={() => navigation.navigate('PropertyDetails', { propertyId: property.id })}
          >
            <Card.Title title={property.name} subtitle={property.address} titleVariant="titleMedium" />
            <Card.Content>
              <View style={screenStyles.listItem}>
                <Text variant="bodyMedium" style={screenStyles.date}>Total Units</Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{property.total_units}</Text>
              </View>
              <View style={screenStyles.listItem}>
                <Text variant="bodyMedium" style={screenStyles.date}>Occupied</Text>
                <Text
                  variant="bodyMedium"
                  style={{ fontWeight: 'bold', color: getOccupancyColor(property.occupied_units, property.total_units) }}
                >
                  {property.occupied_units}
                </Text>
              </View>
              <View style={screenStyles.listItem}>
                <Text variant="bodyMedium" style={screenStyles.date}>Vacant</Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{property.vacant_units}</Text>
              </View>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card mode="contained" style={screenStyles.card}>
          <Card.Content>
            <Text variant="bodyMedium" style={screenStyles.empty}>No properties yet</Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}
