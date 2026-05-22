import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

import { landlordApi } from '../../api/landlord';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ErrorState } from '../../components/common/ScreenContainer/../ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import { ProfileHeaderSkeleton, DetailsStatsSkeleton } from '../../components/common/SkeletonVariants';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import { LandlordPropertiesStackParamList } from '../../navigation/AppNavigator';
import type { Property, Unit } from '../../types';
import { formatCurrency } from '../../utils/formatters';

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Property Details',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
      headerRight: () => (
        <TouchableOpacity style={{ padding: 8 }}>
          <Ionicons name="create-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchPropertyAndUnits = useCallback(async () => {
    try {
      setError(null);
      // 200ms delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));
      // Fetch property and units details
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

  useFocusEffect(
    React.useCallback(() => {
      fetchPropertyAndUnits();
    }, [fetchPropertyAndUnits])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPropertyAndUnits();
  };


  if (error) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <ErrorState message={error} onRetry={() => {}} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer 
      scrollable
      refreshing={refreshing}
      onRefresh={onRefresh}
      edges={['bottom', 'left', 'right']}
    >
      <View style={styles.profileSection}>
        {loading ? (
          <>
            <ProfileHeaderSkeleton />
            <DetailsStatsSkeleton />
          </>
        ) : property ? (
          <>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Ionicons name="business" size={28} color={colors.white} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.propertyName}>{property.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
                  <Text style={styles.subtext} numberOfLines={1}> {property.address}</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsCard}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{property.total_units}</Text>
                <Text style={styles.statLabel}>Total Units</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: property.occupied_units > 0 ? colors.status.occupied : colors.text.primary }]}>
                  {property.occupied_units}
                </Text>
                <Text style={styles.statLabel}>Occupied</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: property.vacant_units > 0 ? colors.status.expired : colors.text.primary }]}>
                  {property.vacant_units}
                </Text>
                <Text style={styles.statLabel}>Vacant</Text>
              </View>
            </View>
          </>
        ) : null}
      </View>

      {/* Units List */}
      <View style={styles.listSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.listSectionTitle}>Units</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddUnit', { propertyId })}>
             <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.unitsContainer}>
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <View key={`unit-skeleton-${i}`} style={styles.rowItem}>
                 <Skeleton width={40} height={40} borderRadius={8} style={{ marginRight: 16 }} />
                 <View style={{ flex: 1 }}>
                    <Skeleton width="40%" height={14} style={{ marginBottom: 6 }} />
                    <Skeleton width="60%" height={12} />
                 </View>
                 <Skeleton width={60} height={24} borderRadius={12} />
              </View>
            ))
          ) : units?.length > 0 ? (
            units.map((unit) => {
              const isActive = (unit.status === 'occupied');
              return (
                <TouchableOpacity
                  key={unit.id}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('UnitDetails', { unitId: unit.id })}
                >
                  <View style={styles.rowItem}>
                    <View style={[styles.rowIcon, { backgroundColor: isActive ? '#ECFDF5' : '#F3F4F6' }]}>
                      <Ionicons name="home-outline" size={18} color={isActive ? colors.status.occupied : colors.text.secondary} />
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle}>{unit.unit_name || unit.unit_code}</Text>
                      <Text style={styles.rowSubtitle}>Code: {unit.unit_code}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Badge 
                         label={unit.status ? unit.status.charAt(0).toUpperCase() + unit.status.slice(1) : 'Unknown'} 
                         status={isActive ? 'active' : 'default'} 
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })
          ) : (
            <Card>
              <Text style={screenStyles.empty}>No units found for this property.</Text>
            </Card>
          )}
        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    backgroundColor: colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.gray[800],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtext: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  statsCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    paddingVertical: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  unitsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  rowSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
