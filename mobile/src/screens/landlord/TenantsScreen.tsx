import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../components/common/ScreenContainer';

import { landlordApi } from '../../api/landlord';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import { LandlordTenantsStackParamList } from '../../navigation/AppNavigator';
import type { Tenant } from '../../types';

type NavigationProp = NativeStackNavigationProp<LandlordTenantsStackParamList, 'TenantsList'>;

export function LandlordTenantsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Tenants', // Aligned with the reference
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('AddTenant', {})}
        >
          <Ionicons name="add" size={24} color={colors.text.primary} />
        </TouchableOpacity>
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
    <ScreenContainer
      scrollable
      refreshing={refreshing}
      onRefresh={onRefresh}
      edges={['bottom', 'left', 'right']}
    >
      <View style={styles.listContainer}>
        {tenants?.length > 0 ? (
          tenants.map((tenant) => {
            // Assume active if they have an active tenancy (mocking based on standard logic)
            const isActive = true; 

            return (
              <TouchableOpacity
                key={tenant.id}
                activeOpacity={0.7}
                onPress={() => {
                  if (!tenant.tenant_code) {
                    Alert.alert(
                      'Unable to View Details',
                      `Tenant ${tenant.full_name} cannot be viewed at this time.`
                    );
                    return;
                  }
                  navigation.navigate('TenantDetails', { tenantCode: tenant.tenant_code });
                }}
              >
                <View style={styles.tenantRow}>
                  {/* Avatar Space */}
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {tenant.full_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  {/* Main Details */}
                  <View style={styles.tenantInfo}>
                    <Text style={styles.tenantName}>{tenant.full_name}</Text>
                    <Text style={styles.tenantLocation}>{tenant.email}</Text>
                    <View style={styles.tenantStatsRow}>
                      <Text style={styles.statsText}>
                        Phone: <Text style={{ fontWeight: '600', color: colors.text.primary }}>{tenant.phone}</Text>
                      </Text>
                    </View>
                  </View>

                  {/* Right Action / Status */}
                  <View style={styles.tenantRight}>
                    {isActive ? (
                       <Badge label="Active" status="active" icon="checkmark-circle" />
                    ) : (
                       <Badge label="Inactive" status="default" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <Card>
            <Text style={screenStyles.empty}>No tenants found</Text>
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
  listContainer: {
    paddingVertical: 12,
  },
  tenantRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  tenantLocation: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  tenantStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  tenantRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
});
