import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ErrorState } from '../../components/common/ScreenContainer/../ErrorState';

import { landlordApi } from '../../api/landlord';
import { Skeleton } from '../../components/common/Skeleton';
import { ProfileHeaderSkeleton, DetailsStatsSkeleton } from '../../components/common/SkeletonVariants';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import { LandlordTenantsStackParamList } from '../../navigation/AppNavigator';
import type { Tenant, TenantDashboard } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<LandlordTenantsStackParamList>;
type TenantDetailsRouteProp = RouteProp<LandlordTenantsStackParamList, 'TenantDetails'>;

export function TenantDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TenantDetailsRouteProp>();
  const { tenantCode } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<TenantDashboard | null>(null);
  const [activeTab, setActiveTab] = useState<'information' | 'payments' | 'utilities'>('information');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Tenant Details',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
      headerRight: () => (
        <TouchableOpacity style={{ padding: 8 }}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchTenant = useCallback(async () => {
    try {
      setError(null);
      // 200ms delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));
      // Fetch tenant details
      const data = await landlordApi.getTenant(tenantCode);
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load tenant details. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tenantCode]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTenant();
  };

  const tenant = dashboardData?.tenant;
  const activeTenancy = dashboardData?.tenancy;
  const activeUnit = dashboardData?.unit;
  

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
        ) : tenant ? (
          <>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{tenant.full_name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.profileInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={styles.tenantName}>{tenant.full_name}</Text>
                  <Badge label="Active" status="active" icon="checkmark-circle" style={{ marginLeft: 8 }} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="mail-outline" size={14} color={colors.text.secondary} />
                  <Text style={styles.subtext}> {tenant.email}</Text>
                  <Text style={styles.subtext}>  •  </Text>
                  <Ionicons name="pricetag-outline" size={14} color={colors.text.secondary} />
                  <Text style={styles.subtext}> {tenant.tenant_code || 'N/A'}</Text>
                </View>
              </View>
            </View>

            {activeTenancy && (
              <View style={styles.statsCard}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{formatCurrency(activeTenancy.monthly_rent || activeTenancy.rent_amount || 0)}</Text>
                  <Text style={styles.statLabel}>Monthly Rent</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>1</Text>
                  <Text style={styles.statLabel}>Active Tenancy</Text>
                </View>
              </View>
            )}
          </>
        ) : null}
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['information', 'payments', 'utilities'] as const).map((tab) => (
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
              <View style={{ gap: 8 }}>
                 <Skeleton width="100%" height={40} borderRadius={8} />
                 <Skeleton width="60%" height={40} borderRadius={8} />
              </View>
              <View style={{ height: 24 }} />
              <View style={styles.sectionHeader}>
                 <Skeleton width="40%" height={16} />
              </View>
              <View style={{ gap: 12 }}>
                 {Array(3).fill(0).map((_, i) => (
                    <View key={`tab-skeleton-${i}`} style={styles.listItem}>
                       <Skeleton width="30%" height={14} />
                       <Skeleton width="40%" height={14} />
                    </View>
                 ))}
              </View>
           </View>
        ) : (
          activeTab === 'information' && tenant && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <TouchableOpacity>
                  <Text style={styles.editLink}>Edit</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.contactButtonsRow}>
                <TouchableOpacity style={styles.contactButtonBlue}>
                  <Text style={styles.contactButtonBlueText}>{tenant.email}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButtonBlue}>
                  <Text style={styles.contactButtonBlueText}>{tenant.phone}</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 24 }} />

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tenancy Details</Text>
              </View>
              {activeTenancy ? (
                 <View>
                     <View style={styles.listItem}>
                      <Text style={styles.infoLabel}>Unit</Text>
                      <Text style={{ fontWeight: '600' }}>
                        {activeUnit?.unit_name || activeUnit?.unit_code || `Unit ${activeUnit?.id}`}
                      </Text>
                    </View>
                    <View style={styles.listItem}>
                      <Text style={styles.infoLabel}>Move-in Date</Text>
                      <Text style={{ fontWeight: '600' }}>{formatDate(activeTenancy.move_in_date)}</Text>
                    </View>
                    {(activeTenancy.security_deposit ?? 0) > 0 && (
                       <View style={styles.listItem}>
                         <Text style={styles.infoLabel}>Security Deposit</Text>
                         <Text style={{ fontWeight: '600' }}>{formatCurrency(activeTenancy.security_deposit || 0)}</Text>
                       </View>
                    )}
                 </View>
              ) : (
                 <Text style={screenStyles.empty}>No active tenancy found.</Text>
              )}

              <View style={{ height: 24 }} />

               {/* Emergency Contact section styled minimally */}
              {(tenant.emergency_contact_name || tenant.emergency_contact_phone) && (
                <>
                   <View style={styles.sectionHeader}>
                     <Text style={styles.sectionTitle}>Emergency</Text>
                   </View>
                   <View style={styles.listItem}>
                     <Text style={styles.infoLabel}>Name</Text>
                     <Text style={{ fontWeight: '600' }}>{tenant.emergency_contact_name}</Text>
                   </View>
                   <View style={styles.listItem}>
                     <Text style={styles.infoLabel}>Phone</Text>
                     <Text style={{ fontWeight: '600' }}>{tenant.emergency_contact_phone}</Text>
                   </View>
                </>
              )}
            </>
          )
        )}
        
        {activeTab === 'payments' && !loading && (
           <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={screenStyles.empty}>Payment history will appear here.</Text>
           </View>
        )}
        
        {activeTab === 'utilities' && !loading && (
           <View style={{ alignItems: 'center', paddingTop: 40 }}>
              {activeTenancy && tenant ? (
                 <Button 
                    label="Manage Utilities" 
                    icon="flash"
                    onPress={() => navigation.navigate('TenancyUtilities', { 
                       tenancyId: activeTenancy.id, 
                       tenantName: tenant.full_name 
                    })} 
                 />
              ) : (
                 <Text style={screenStyles.empty}>No active utilities.</Text>
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
    marginBottom: 20,
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
  avatarText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtext: {
    fontSize: 13,
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
    paddingLeft: 20,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  editLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    textDecorationLine: 'underline',
  },
  contactButtonsRow: {
    gap: 8,
  },
  contactButtonBlue: {
    backgroundColor: '#EFF6FF', // Light blue
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  contactButtonBlueText: {
    color: '#2563EB', // Blue 600
    fontSize: 14,
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
});
