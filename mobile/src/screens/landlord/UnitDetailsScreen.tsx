import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ErrorState } from '../../components/common/ScreenContainer/../ErrorState';

import { landlordApi } from '../../api/landlord';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { ProfileHeaderSkeleton, DetailBoxSkeleton, TenantCardSkeleton } from '../../components/common/SkeletonVariants';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import { LandlordPropertiesStackParamList } from '../../navigation/AppNavigator';
import type { Unit } from '../../types';
import { formatCurrency, formatDate, capitalize } from '../../utils/formatters';

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
  const [activeTab, setActiveTab] = useState<'information' | 'tenants'>('information');

  const fetchUnit = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setError(null);
      // 200ms delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));
      // Fetch unit details
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Unit Details',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
      headerRight: () => {
        if (!loading && unit && (unit.status === 'vacant' || unit.status === 'available')) {
          return (
            <Button
               label="Add Tenant"
               onPress={() => navigation.navigate('AddTenant', { unitId })}
               style={{ minHeight: 32, paddingHorizontal: 12, paddingVertical: 4 }}
            />
          );
        }
        if (!loading) {
          return (
            <TouchableOpacity style={{ padding: 8 }}>
               <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          );
        }
        return null;
      },
    });
  }, [navigation, unit, unitId, loading]);

  useEffect(() => {
    fetchUnit();
  }, [fetchUnit]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUnit();
  };

  if (error || (!unit && !loading)) {
  
  if (error) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <ErrorState message={error} onRetry={() => {}} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['bottom', 'left', 'right']} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={screenStyles.empty}>{error || 'Unit not found.'}</Text>
      </ScreenContainer>
    );
  }

  const activeTenancy = unit?.tenancies?.find((t) => t.status === 'active');

  return (
    <ScreenContainer 
      scrollable
      refreshing={refreshing}
      onRefresh={onRefresh}
      edges={['bottom', 'left', 'right']}
    >
      {/* Profile/Header Section */}
      <View style={styles.profileSection}>
        {loading ? (
          <ProfileHeaderSkeleton />
        ) : unit && (
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Ionicons name="home" size={24} color={colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={styles.propertyTitle}>{unit.unit_name || unit.unit_code || `Unit ${unit.id}`}</Text>
                <Badge 
                  label={unit.status ? unit.status.charAt(0).toUpperCase() + unit.status.slice(1) : 'Unknown'} 
                  status={unit.status === 'occupied' ? 'active' : unit.status === 'available' ? 'pending' : 'default'} 
                  style={{ marginLeft: 8 }} 
                />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="business-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.subtext}> {unit.property_name || 'Unknown Property'}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['information', 'tenants'] as const).map((tab) => (
          <TouchableOpacity 
            key={tab}
            disabled={loading}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {loading ? (
          <View>
             <View style={styles.sectionHeader}>
                <Skeleton width="40%" height={16} />
             </View>
             <DetailBoxSkeleton rows={4} />
          </View>
        ) : (
          activeTab === 'information' && unit && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Specifications</Text>
              </View>
              
              <View style={styles.specificationBox}>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Unit Code</Text>
                  <Text style={styles.specValue}>{unit.unit_code}</Text>
                </View>
                <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.specLabel}>Status</Text>
                  <Text style={[styles.specValue, { color: unit.status === 'occupied' ? colors.success : colors.warning }]}>
                    {capitalize(unit.status || 'unknown')}
                  </Text>
                </View>
              </View>
            </View>
          )
        )}
        
        {!loading && activeTab === 'tenants' && unit && (
          <View>
            {/* Current Tenant */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Current Tenant</Text>
            </View>
            {activeTenancy?.tenant_name ? (
              <View style={styles.tenantRowBox}>
                <View style={styles.tenantAvatar}>
                   <Text style={styles.tenantAvatarText}>{activeTenancy.tenant_name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                   <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                     <Text style={styles.tenantTitle}>{activeTenancy.tenant_name}</Text>
                     {activeTenancy?.monthly_rent && (
                       <Text style={styles.specValueMain}>{formatCurrency(activeTenancy.monthly_rent)}/mo</Text>
                     )}
                   </View>
                   <Text style={styles.tenantSubtitle}>{activeTenancy.tenant_email}</Text>
                   {activeTenancy?.start_date && (
                     <Text style={styles.tenantDate}>Since {formatDate(activeTenancy.start_date)}</Text>
                   )}
                </View>
              </View>
            ) : (
              <Text style={screenStyles.empty_inline}>No active tenant.</Text>
            )}

            <View style={{ height: 24 }} />

            {/* Past Tenants */}
            {unit.tenancies && unit.tenancies.filter(t => t.status !== 'active').length > 0 && (
              <>
                 <View style={styles.sectionHeader}>
                   <Text style={styles.sectionTitle}>Past Tenants</Text>
                 </View>
                 <View style={styles.pastTenantsBox}>
                   {unit.tenancies.filter(t => t.status !== 'active').map((tenancy, idx, arr) => (
                     <View key={tenancy.id} style={[styles.pastTenantRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
                       <Text style={styles.tenantTitle}>{tenancy.tenant_name || 'Unknown'}</Text>
                       <Text style={styles.tenantDate}>
                         {tenancy.end_date ? `Ended: ${formatDate(tenancy.end_date)}` : tenancy.status}
                       </Text>
                     </View>
                   ))}
                 </View>
              </>
            )}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    backgroundColor: colors.surface,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtext: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tab: {
    marginRight: 24,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.text.primary,
  },
  tabContent: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  specificationBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  specLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  specValueMain: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  tenantRowBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pastTenantsBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tenantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tenantAvatarText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  tenantTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  tenantSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  tenantDate: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  pastTenantRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    width: '100%',
  },
});
