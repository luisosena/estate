import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, HelperText } from 'react-native-paper';

import { landlordApi } from '../../api/landlord';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ErrorState } from '../../components/common/ScreenContainer/../ErrorState';
import { colors } from '../../constants/colors';
import { LandlordPropertiesStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<LandlordPropertiesStackParamList, 'AddUnit'>;
type RoutePropType = RouteProp<LandlordPropertiesStackParamList, 'AddUnit'>;

export function AddUnitScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { propertyId } = route.params;

  const [saving, setSaving] = useState(false);
  
  // Form State
  const [unitName, setUnitName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  
  // Validation State
  const [errors, setErrors] = useState<{ unitName?: string; unitCode?: string }>({});

  const validate = () => {
    const newErrors: { unitName?: string; unitCode?: string } = {};
    if (!unitName.trim()) newErrors.unitName = 'Unit name is required';
    if (!unitCode.trim()) newErrors.unitCode = 'Unit code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      
      // Standardized 200ms delay for premium feel
      await new Promise(resolve => setTimeout(resolve, 200));
      
      await landlordApi.createUnit({
        property_id: propertyId,
        unit_name: unitName.trim(),
        unit_code: unitCode.trim(),
      });

      Alert.alert('Success', 'Unit added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Failed to create unit:', error);
      const message = error.response?.data?.message || 'Failed to add unit. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };


  return (
    <ScreenContainer 
      withKeyboard
      scrollable
      edges={['bottom', 'left', 'right']}
    >
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Add New Unit
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Create a specific apartment or space within this property.
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Card>
          <Text style={styles.sectionTitle}>Unit Details</Text>
          
          <TextInput
            label="Unit Name *"
            value={unitName}
            onChangeText={setUnitName}
            mode="outlined"
            placeholder="e.g. Apartment 101"
            style={styles.input}
            activeOutlineColor={colors.primary}
            error={!!errors.unitName}
            disabled={saving}
          />
          {errors.unitName && <HelperText type="error" visible>{errors.unitName}</HelperText>}

          <TextInput
            label="Unit Code *"
            value={unitCode}
            onChangeText={setUnitCode}
            mode="outlined"
            placeholder="e.g. APT-101"
            style={styles.input}
            activeOutlineColor={colors.primary}
            error={!!errors.unitCode}
            disabled={saving}
          />
          <HelperText type="info">A unique identifier for this unit (e.g. for billing).</HelperText>
          {errors.unitCode && <HelperText type="error" visible>{errors.unitCode}</HelperText>}
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            label="Save Unit"
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
    paddingTop: 24,
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
  formContainer: {
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
  input: {
    backgroundColor: colors.surface,
    marginBottom: 4,
  },
  buttonContainer: {
    marginTop: 16,
  },
});
