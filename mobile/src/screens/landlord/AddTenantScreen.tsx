import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { View, Platform } from 'react-native';
import { Text, TextInput, HelperText, Switch } from 'react-native-paper';

import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAddTenant } from '../../hooks/useAddTenant';
import { LandlordTenantsStackParamList, LandlordPropertiesStackParamList } from '../../navigation/AppNavigator';

type AddTenantRouteProp = RouteProp<LandlordTenantsStackParamList & LandlordPropertiesStackParamList, 'AddTenant'>;
type NavigationProp = NativeStackNavigationProp<LandlordTenantsStackParamList & LandlordPropertiesStackParamList, 'AddTenant'>;

export function AddTenantScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddTenantRouteProp>();
  const unitId = route.params?.unitId;

  const {
    saving,
    createTenancy,
    setCreateTenancy,
    availableUnits,
    tenantData,
    setTenantData,
    tenancyData,
    setTenancyData,
    errors,
    handleSave,
    loadAvailableUnits,
  } = useAddTenant(unitId);

  return (
    <ScreenContainer 
      withKeyboard
      scrollable
      edges={['bottom', 'left', 'right']}
    >
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
          <Text variant="headlineSmall" style={{ fontWeight: '700', color: colors.text.primary, marginBottom: 4 }}>
            Add New Tenant
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.text.secondary }}>
            {createTenancy
              ? 'Enter tenant details and tenancy information'
              : 'Enter tenant details only'}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 16, paddingBottom: 40 }}>
          <Card>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 16 }}>Tenant Information</Text>
            
            <TextInput
              label="Full Name *"
              value={tenantData.full_name}
              onChangeText={(text) => setTenantData({ ...tenantData, full_name: text })}
              mode="outlined"
              style={{ backgroundColor: colors.surface }}
              activeOutlineColor={colors.primary}
              error={!!errors.full_name}
            />
            {errors.full_name && <HelperText type="error" visible>{errors.full_name}</HelperText>}

            <TextInput
              label="Email *"
              value={tenantData.email}
              onChangeText={(text) => setTenantData({ ...tenantData, email: text })}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ backgroundColor: colors.surface, marginTop: 12 }}
              activeOutlineColor={colors.primary}
              error={!!errors.email}
            />
            {errors.email && <HelperText type="error" visible>{errors.email}</HelperText>}

            <TextInput
              label="Phone Number *"
              value={tenantData.phone}
              onChangeText={(text) => setTenantData({ ...tenantData, phone: text })}
              mode="outlined"
              keyboardType="phone-pad"
              style={{ backgroundColor: colors.surface, marginTop: 12 }}
              activeOutlineColor={colors.primary}
              error={!!errors.phone}
            />
            {errors.phone && <HelperText type="error" visible>{errors.phone}</HelperText>}
          </Card>

          <Card>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 16 }}>Emergency Contact (Optional)</Text>
            
            <TextInput
              label="Contact Name"
              value={tenantData.emergency_contact_name}
              onChangeText={(text) => setTenantData({ ...tenantData, emergency_contact_name: text })}
              mode="outlined"
              style={{ backgroundColor: colors.surface }}
              activeOutlineColor={colors.primary}
            />

            <TextInput
              label="Contact Phone"
              value={tenantData.emergency_contact_phone}
              onChangeText={(text) => setTenantData({ ...tenantData, emergency_contact_phone: text })}
              mode="outlined"
              keyboardType="phone-pad"
              style={{ backgroundColor: colors.surface, marginTop: 12 }}
              activeOutlineColor={colors.primary}
            />

            <TextInput
              label="Relationship"
              value={tenantData.emergency_contact_relation}
              onChangeText={(text) => setTenantData({ ...tenantData, emergency_contact_relation: text })}
              mode="outlined"
              style={{ backgroundColor: colors.surface, marginTop: 12 }}
              placeholder="e.g., Spouse, Parent, Sibling"
              activeOutlineColor={colors.primary}
            />
          </Card>

          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary }}>Tenancy Information</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: colors.text.secondary, marginRight: 8 }}>Enable</Text>
                <Switch
                  value={createTenancy}
                  onValueChange={setCreateTenancy}
                  color={colors.primary}
                />
              </View>
            </View>

            {createTenancy && (
              <View>
                {!unitId && (
                  <>
                    <TextInput
                      label="Select Unit *"
                      value={tenancyData.unit_id ? `Unit ${tenancyData.unit_id}` : ''}
                      mode="outlined"
                      style={{ backgroundColor: colors.surface }}
                      activeOutlineColor={colors.primary}
                      editable={false}
                      right={
                        <TextInput.Icon 
                          icon="chevron-down" 
                          onPress={() => loadAvailableUnits()}
                        />
                      }
                      error={!!errors.unit_id}
                      onPressIn={() => loadAvailableUnits()}
                    />
                    {availableUnits.length > 0 && (
                      <View style={{ marginTop: 12 }}>
                        {availableUnits.map((unit) => (
                           <Button
                              key={unit.id}
                              variant={tenancyData.unit_id === unit.id ? 'primary' : 'outline'}
                              label={`Unit ${unit.unit_number}`}
                              onPress={() => setTenancyData({ ...tenancyData, unit_id: unit.id })}
                              style={{ marginBottom: 8 }}
                           />
                        ))}
                      </View>
                    )}
                    {errors.unit_id && <HelperText type="error" visible>{errors.unit_id}</HelperText>}
                  </>
                )}

                {unitId && (
                  <View style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                     <Text style={{ color: '#2563EB', fontWeight: '600' }}>Assigning to Unit ID: {unitId}</Text>
                  </View>
                )}

                <TextInput
                  label="Move-in Date *"
                  value={tenancyData.move_in_date}
                  onChangeText={(text) => setTenancyData({ ...tenancyData, move_in_date: text })}
                  mode="outlined"
                  placeholder="YYYY-MM-DD"
                  style={{ backgroundColor: colors.surface, marginTop: 12 }}
                  activeOutlineColor={colors.primary}
                  error={!!errors.move_in_date}
                />
                {errors.move_in_date && <HelperText type="error" visible>{errors.move_in_date}</HelperText>}

                <TextInput
                  label="Monthly Rent Amount *"
                  value={tenancyData.rent_amount ? String(tenancyData.rent_amount) : ''}
                  onChangeText={(text) => setTenancyData({ ...tenancyData, rent_amount: parseFloat(text) || 0 })}
                  mode="outlined"
                  keyboardType="numeric"
                  style={{ backgroundColor: colors.surface, marginTop: 12 }}
                  activeOutlineColor={colors.primary}
                  error={!!errors.rent_amount}
                />
                {errors.rent_amount && <HelperText type="error" visible>{errors.rent_amount}</HelperText>}

                <TextInput
                  label="Rent Due Day (1-28) *"
                  value={String(tenancyData.rent_due_day)}
                  onChangeText={(text) => {
                    const day = parseInt(text, 10);
                    if (day >= 1 && day <= 28) {
                      setTenancyData({ ...tenancyData, rent_due_day: day });
                    }
                  }}
                  mode="outlined"
                  keyboardType="numeric"
                  style={{ backgroundColor: colors.surface, marginTop: 12 }}
                  activeOutlineColor={colors.primary}
                />

                <TextInput
                  label="Security Deposit *"
                  value={tenancyData.deposit_amount ? String(tenancyData.deposit_amount) : ''}
                  onChangeText={(text) => setTenancyData({ ...tenancyData, deposit_amount: parseFloat(text) || 0 })}
                  mode="outlined"
                  keyboardType="numeric"
                  style={{ backgroundColor: colors.surface, marginTop: 12 }}
                  activeOutlineColor={colors.primary}
                  error={!!errors.deposit_amount}
                />
                {errors.deposit_amount && <HelperText type="error" visible>{errors.deposit_amount}</HelperText>}
              </View>
            )}
          </Card>

          <View style={{ marginTop: 16 }}>
            <Button
              variant="primary"
              label={createTenancy ? 'Add Tenant & Create Tenancy' : 'Add Tenant'}
              onPress={handleSave}
              loading={saving}
            />
            <Button
              variant="outline"
              label="Cancel"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
    </ScreenContainer>
  );
}
