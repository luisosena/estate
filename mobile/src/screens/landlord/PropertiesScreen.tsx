import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../components/common/ScreenContainer';

import { landlordApi } from '../../api/landlord';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import { LandlordPropertiesStackParamList } from '../../navigation/AppNavigator';
import type { Property } from '../../types';

type NavigationProp = NativeStackNavigationProp<LandlordPropertiesStackParamList, 'PropertiesList'>;

export function LandlordPropertiesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Properties',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
            // Placeholder since there's no AddProperty screen yet
            import('react-native').then(({ Alert }) => {
              Alert.alert('Coming Soon', 'The ability to add properties is being implemented.');
            });
          }}
        >
          <Ionicons name="add" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
    <ScreenContainer
      scrollable
      refreshing={refreshing}
      onRefresh={onRefresh}
      edges={['bottom', 'left', 'right']}
    >
      <View style={{ paddingVertical: 12 }}>
        {properties?.length > 0 ? (
          properties.map((property) => {
            const isFull = property.occupied_units === property.total_units;
            
            return (
              <TouchableOpacity
                key={property.id}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('PropertyDetails', { propertyId: property.id })}
              >
                <View style={styles.propertyRow}>
                  {/* Avatar Space */}
                  <View style={styles.buildingIcon}>
                    <Ionicons name="business" size={24} color={colors.white} />
                  </View>

                  {/* Main Details */}
                  <View style={styles.propertyInfo}>
                    <Text style={styles.propertyName}>{property.name}</Text>
                    <Text style={styles.propertyLocation} numberOfLines={1}>{property.address}</Text>
                    
                    <View style={styles.propertyStatsRow}>
                      <Text style={styles.statsText}>
                        Units: <Text style={{ fontWeight: '600', color: colors.text.primary }}>{property.total_units}</Text>
                      </Text>
                      <Text style={styles.statsDivider}> • </Text>
                      <Text style={styles.statsText}>
                        Vacant: <Text style={{ fontWeight: '600', color: property.vacant_units > 0 ? colors.error : colors.text.primary }}>
                          {property.vacant_units}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* Right Action / Status */}
                  <View style={styles.propertyRight}>
                    {isFull ? (
                       <Badge label="Full" status="active" />
                    ) : (
                       <Badge label="Spaces" status="default" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        ) : (
          <Card style={{ marginHorizontal: 20 }}>
            <Text style={screenStyles.empty}>No properties found</Text>
          </Card>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  propertyRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    alignItems: 'center',
  },
  buildingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.gray[800],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  propertyInfo: {
    flex: 1,
    paddingRight: 12,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  propertyLocation: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  propertyStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  statsDivider: {
    fontSize: 12,
    color: colors.gray[300],
  },
  propertyRight: {
    alignItems: 'flex-end',
  },
});
