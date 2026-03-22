import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, HelperText, Switch } from 'react-native-paper';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LandlordTenantsStackParamList, LandlordPropertiesStackParamList } from '../../navigation/AppNavigator';
import { useAddTenant } from '../../hooks/useAddTenant';

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
    <ScrollView style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>
          Add New Tenant
        </Text>
        <Text variant="bodyMedium" style={screenStyles.subtitle}>
          {createTenancy
            ? 'Enter tenant details and tenancy information'
            : 'Enter tenant details only'}
        </Text>
      </View>

      <Card mode="contained" style={screenStyles.card}>
        <Card.Title title="Tenant Information" />
        <Card.Content>
          <TextInput
            label="Full Name *"
            value={tenantData.full_name}
            onChangeText={(text) => setTenantData({ ...tenantData, full_name: text })}
            mode="outlined"
            style={screenStyles.input}
            error={!!errors.full_name}
          />
          {errors.full_name && <HelperText type="error">{errors.full_name}</HelperText>}

          <TextInput
            label="Email *"
            value={tenantData.email}
            onChangeText={(text) => setTenantData({ ...tenantData, email: text })}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={screenStyles.input}
            error={!!errors.email}
          />
          {errors.email && <HelperText type="error">{errors.email}</HelperText>}

          <TextInput
            label="Phone Number *"
            value={tenantData.phone}
            onChangeText={(text) => setTenantData({ ...tenantData, phone: text })}
            mode="outlined"
            keyboardType="phone-pad"
            style={screenStyles.input}
            error={!!errors.phone}
          />
          {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}
        </Card.Content>
      </Card>

      <Card mode="contained" style={screenStyles.card}>
        <Card.Title title="Emergency Contact (Optional)" />
        <Card.Content>
          <TextInput
            label="Contact Name"
            value={tenantData.emergency_contact_name}
            onChangeText={(text) => setTenantData({ ...tenantData, emergency_contact_name: text })}
            mode="outlined"
            style={screenStyles.input}
          />

          <TextInput
            label="Contact Phone"
            value={tenantData.emergency_contact_phone}
            onChangeText={(text) => setTenantData({ ...tenantData, emergency_contact_phone: text })}
            mode="outlined"
            keyboardType="phone-pad"
            style={screenStyles.input}
          />

          <TextInput
            label="Relationship"
            value={tenantData.emergency_contact_relation}
            onChangeText={(text) => setTenantData({ ...tenantData, emergency_contact_relation: text })}
            mode="outlined"
            style={screenStyles.input}
            placeholder="e.g., Spouse, Parent, Sibling"
          />
        </Card.Content>
      </Card>

      <Card mode="contained" style={screenStyles.card}>
        <Card.Title 
          title="Tenancy Information" 
          right={() => (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 16 }}>
              <Text variant="bodySmall">Create Tenancy</Text>
              <Switch
                value={createTenancy}
                onValueChange={setCreateTenancy}
                color={colors.primary}
                style={{ marginLeft: 8 }}
              />
            </View>
          )}
        />
        {createTenancy && (
          <Card.Content>
            {!unitId && (
              <>
                <TextInput
                  label="Select Unit *"
                  value={tenancyData.unit_id ? `Unit ${tenancyData.unit_id}` : ''}
                  mode="outlined"
                  style={screenStyles.input}
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
                  <View style={{ marginTop: 8 }}>
                    {availableUnits.map((unit) => (
                      <Button
                        key={unit.id}
                        mode={tenancyData.unit_id === unit.id ? 'contained' : 'outlined'}
                        onPress={() => setTenancyData({ ...tenancyData, unit_id: unit.id })}
                        style={{ marginBottom: 8 }}
                        compact
                      >
                        Unit {unit.unit_number} - {unit.property_name || 'Unknown Property'}
                      </Button>
                    ))}
                  </View>
                )}
                {errors.unit_id && <HelperText type="error">{errors.unit_id}</HelperText>}
              </>
            )}

            {unitId && (
              <Text variant="bodyMedium" style={{ marginBottom: 16, color: colors.primary }}>
                Assigning to Unit ID: {unitId}
              </Text>
            )}

            <TextInput
              label="Move-in Date *"
              value={tenancyData.move_in_date}
              onChangeText={(text) => setTenancyData({ ...tenancyData, move_in_date: text })}
              mode="outlined"
              placeholder="YYYY-MM-DD"
              style={screenStyles.input}
              error={!!errors.move_in_date}
            />
            {errors.move_in_date && <HelperText type="error">{errors.move_in_date}</HelperText>}

            <TextInput
              label="Monthly Rent Amount *"
              value={tenancyData.rent_amount ? String(tenancyData.rent_amount) : ''}
              onChangeText={(text) => setTenancyData({ ...tenancyData, rent_amount: parseFloat(text) || 0 })}
              mode="outlined"
              keyboardType="numeric"
              style={screenStyles.input}
              error={!!errors.rent_amount}
            />
            {errors.rent_amount && <HelperText type="error">{errors.rent_amount}</HelperText>}

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
              style={screenStyles.input}
            />

            <TextInput
              label="Security Deposit *"
              value={tenancyData.deposit_amount ? String(tenancyData.deposit_amount) : ''}
              onChangeText={(text) => setTenancyData({ ...tenancyData, deposit_amount: parseFloat(text) || 0 })}
              mode="outlined"
              keyboardType="numeric"
              style={screenStyles.input}
              error={!!errors.deposit_amount}
            />
            {errors.deposit_amount && <HelperText type="error">{errors.deposit_amount}</HelperText>}
          </Card.Content>
        )}
      </Card>

      <View style={{ padding: 16, gap: 12 }}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          buttonColor={colors.primary}
        >
          {createTenancy ? 'Add Tenant & Create Tenancy' : 'Add Tenant'}
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
}
