import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, HelperText, Switch, Menu, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../constants/colors';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAddTenant } from '../../hooks/useAddTenant';
import { LandlordTenantsStackParamList, LandlordPropertiesStackParamList } from '../../navigation/AppNavigator';
import { landlordApi } from '../../api/landlord';
import { Unit } from '../../types';

type AddTenantRouteProp = RouteProp<LandlordTenantsStackParamList & LandlordPropertiesStackParamList, 'AddTenant'>;
type NavigationProp = NativeStackNavigationProp<LandlordTenantsStackParamList & LandlordPropertiesStackParamList, 'AddTenant'>;

export function AddTenantScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddTenantRouteProp>();
  const unitId = route.params?.unitId;

  const [unitDetails, setUnitDetails] = useState<Unit | null>(null);

  const {
    saving,
    createTenancy,
    setCreateTenancy,
    availableUnits,
    tenantForm,
    tenancyForm,
    errors,
    updateTenantField,
    updateTenancyField,
    handleSave,
    loadAvailableUnits,
  } = useAddTenant(unitId);

  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  useEffect(() => {
    if (unitId) {
      landlordApi.getUnit(unitId).then(setUnitDetails).catch(console.error);
    }
  }, [unitId]);

  return (
    <ScreenContainer withKeyboard scrollable edges={['bottom', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Add New Tenant</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {createTenancy ? 'Complete tenant profile and unit assignment' : 'Create basic tenant profile'}
        </Text>
      </View>

      <View style={styles.container}>
        {/* Section 1: Personal Details */}
        <Card>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <TextInput
            label="Full Name *"
            value={tenantForm.full_name}
            onChangeText={(v) => updateTenantField('full_name', v)}
            mode="outlined"
            style={styles.input}
            error={!!errors.full_name}
          />
          {errors.full_name && <HelperText type="error">{errors.full_name}</HelperText>}

          <TextInput
            label="Email *"
            value={tenantForm.email}
            onChangeText={(v) => updateTenantField('email', v)}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            error={!!errors.email}
          />
          {errors.email && <HelperText type="error">{errors.email}</HelperText>}

          <TextInput
            label="Phone *"
            value={tenantForm.phone}
            onChangeText={(v) => updateTenantField('phone', v)}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            error={!!errors.phone}
          />
          {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}
        </Card>

        {/* Section 2: Emergency Contact */}
        <Card>
          <Text style={styles.sectionTitle}>Emergency Contact (Optional)</Text>
          <TextInput
            label="Contact Name"
            value={tenantForm.emergency_contact_name}
            onChangeText={(v) => updateTenantField('emergency_contact_name', v)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Phone"
            value={tenantForm.emergency_contact_phone}
            onChangeText={(v) => updateTenantField('emergency_contact_phone', v)}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />
          <TextInput
            label="Relation"
            value={tenantForm.emergency_contact_relation}
            onChangeText={(v) => updateTenantField('emergency_contact_relation', v)}
            mode="outlined"
            style={styles.input}
            placeholder="e.g. Spouse"
          />
        </Card>

        {/* Section 3: Tenancy Details */}
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tenancy & Unit</Text>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Assign Unit</Text>
              <Switch
                value={createTenancy}
                onValueChange={setCreateTenancy}
                color={colors.primary}
                disabled={!!unitId}
              />
            </View>
          </View>

          {createTenancy && (
            <View style={{ marginTop: 8 }}>
              {unitId ? (
                <View style={styles.unitLockBox}>
                   <Text style={styles.lockLabel}>Assigned Unit</Text>
                   <Text style={styles.lockValue}>
                      {unitDetails ? `${unitDetails.unit_name} (${unitDetails.unit_code})` : 'Loading...'}
                   </Text>
                   {unitDetails?.property && <Text style={styles.lockSub}>{unitDetails.property.name}</Text>}
                </View>
              ) : (
                <View style={{ marginBottom: 16 }}>
                  <Menu
                    visible={menuVisible}
                    onDismiss={closeMenu}
                    anchor={
                      <TouchableOpacity onPress={openMenu} activeOpacity={0.7}>
                        <View pointerEvents="none">
                          <TextInput
                            label="Select Available Unit *"
                            value={tenancyForm.unit_id ? 
                              (availableUnits.find(u => u.id === tenancyForm.unit_id)?.unit_name || `Unit ${tenancyForm.unit_id}`) 
                              : ''}
                            placeholder="Select a unit..."
                            mode="outlined"
                            style={styles.input}
                            editable={false}
                            right={<TextInput.Icon icon="chevron-down" />}
                            error={!!errors.unit_id}
                          />
                        </View>
                      </TouchableOpacity>
                    }
                    contentStyle={styles.dropdownMenuContent}
                    style={styles.menuContainer}
                  >
                    {availableUnits.length > 0 ? (
                      availableUnits.map((u) => (
                        <Menu.Item
                          key={u.id}
                          onPress={() => {
                            updateTenancyField('unit_id', u.id);
                            closeMenu();
                          }}
                          title={u.unit_name}
                          titleStyle={styles.menuItemTitle}
                          style={styles.menuItem}
                        />
                      ))
                    ) : (
                      <Menu.Item title="No units available" disabled titleStyle={styles.menuItemTitle} />
                    )}
                  </Menu>
                  {errors.unit_id && <HelperText type="error" style={{ paddingHorizontal: 0 }}>{errors.unit_id}</HelperText>}
                </View>
              )}

              <TextInput
                label="Move-in Date *"
                value={tenancyForm.move_in_date}
                onChangeText={(v) => updateTenancyField('move_in_date', v)}
                mode="outlined"
                placeholder="YYYY-MM-DD"
                style={styles.input}
                error={!!errors.move_in_date}
              />
              {errors.move_in_date && <HelperText type="error">{errors.move_in_date}</HelperText>}

              <TextInput
                label="Rent Due Day"
                value={String(tenancyForm.rent_due_day)}
                onChangeText={(v) => updateTenancyField('rent_due_day', parseInt(v) || 0)}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />

              <TextInput
                label="Monthly Rent *"
                value={tenancyForm.monthly_rent ? String(tenancyForm.monthly_rent) : ''}
                onChangeText={(v) => updateTenancyField('monthly_rent', parseFloat(v) || 0)}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                left={<TextInput.Affix text="MWK" />}
                error={!!errors.monthly_rent}
              />
              {errors.monthly_rent && <HelperText type="error">{errors.monthly_rent}</HelperText>}

              <TextInput
                label="Security Deposit"
                value={tenancyForm.security_deposit ? String(tenancyForm.security_deposit) : ''}
                onChangeText={(v) => updateTenancyField('security_deposit', parseFloat(v) || 0)}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          )}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            variant="primary"
            label={saving ? 'Processing...' : 'Save Tenant'}
            onPress={handleSave}
            loading={saving}
            disabled={saving}
          />
          <Button
            variant="outline"
            label="Cancel"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 12 }}
            disabled={saving}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.text.secondary,
  },
  container: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    marginBottom: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginRight: 8,
  },
  unitLockBox: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 2, // Force inset to prevent clipping
  },
  lockLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  lockValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  lockSub: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  actions: {
    marginTop: 16,
  },
  dropdownMenuContent: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  menuContainer: {
    marginTop: 60, // Push exactly below the TextInput (typically 56px height)
  },
  menuItem: {
    paddingVertical: 4,
  },
  menuItemTitle: {
    fontSize: 15,
    color: colors.text.primary,
  },
});
