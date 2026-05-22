import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, HelperText, Menu, TouchableRipple } from 'react-native-paper';

import { landlordApi } from '../../api/landlord';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ErrorState } from '../../components/common/ScreenContainer/../ErrorState';
import { colors } from '../../constants/colors';
import { LandlordPropertiesStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<LandlordPropertiesStackParamList, 'AddProperty'>;

const PROPERTY_TYPES = [
  { label: 'Apartment', value: 'apartment' },
  { label: 'House', value: 'house' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Mixed', value: 'mixed' },
];

export function AddPropertyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState('apartment');
  const [description, setDescription] = useState('');
  
  // Validation State
  const [errors, setErrors] = useState<{ name?: string; address?: string }>({});
  
  // Menu State
  const [menuVisible, setMenuVisible] = useState(false);

  const validate = () => {
    const newErrors: { name?: string; address?: string } = {};
    if (!name.trim()) newErrors.name = 'Property name is required';
    if (!address.trim()) newErrors.address = 'Full address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      
      // Standardized 200ms delay for premium feel
      await new Promise(resolve => setTimeout(resolve, 200));
      
      await landlordApi.createProperty({
        name: name.trim(),
        address: address.trim(),
        property_type: type,
        description: description.trim(),
      });

      Alert.alert('Success', 'Property added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Failed to create property:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to add property. Please try again.');
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
          Add New Property
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Expand your portfolio by adding a new property location.
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Card>
          <Text style={styles.sectionTitle}>Property Details</Text>
          
          <TextInput
            label="Property Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            placeholder="e.g. Sunset Apartments"
            style={styles.input}
            activeOutlineColor={colors.primary}
            error={!!errors.name}
            disabled={saving}
          />
          {errors.name && <HelperText type="error" visible>{errors.name}</HelperText>}

          <View style={styles.menuContainer}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableRipple 
                  onPress={() => !saving && setMenuVisible(true)} 
                  style={styles.menuAnchor}
                >
                  <View pointerEvents="none">
                    <TextInput
                      label="Property Type"
                      value={PROPERTY_TYPES.find(t => t.value === type)?.label}
                      mode="outlined"
                      editable={false}
                      style={styles.input}
                      right={<TextInput.Icon icon="chevron-down" />}
                      disabled={saving}
                    />
                  </View>
                </TouchableRipple>
              }
            >
              {PROPERTY_TYPES.map((item) => (
                <Menu.Item 
                  key={item.value}
                  onPress={() => {
                    setType(item.value);
                    setMenuVisible(false);
                  }} 
                  title={item.label} 
                />
              ))}
            </Menu>
          </View>

          <TextInput
            label="Full Address *"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="e.g. 123 Main Street, City"
            style={[styles.input, styles.multilineInput]}
            activeOutlineColor={colors.primary}
            error={!!errors.address}
            disabled={saving}
          />
          {errors.address && <HelperText type="error" visible>{errors.address}</HelperText>}

          <TextInput
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            placeholder="Amenities, nearby landmarks, etc."
            style={[styles.input, styles.multilineInput]}
            activeOutlineColor={colors.primary}
            disabled={saving}
          />
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            label="Save Property"
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
  multilineInput: {
    marginTop: 8,
    minHeight: 80,
  },
  menuContainer: {
    marginTop: 8,
  },
  menuAnchor: {
    borderRadius: 4,
  },
  buttonContainer: {
    marginTop: 16,
  },
});
