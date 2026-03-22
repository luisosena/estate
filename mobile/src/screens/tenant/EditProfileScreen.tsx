import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, HelperText } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { tenantApi } from '../../api';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChangePasswordForm } from '../../components/profile/ChangePasswordForm';

type TenantProfileStackParamList = {
  ProfileView: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<TenantProfileStackParamList, 'EditProfile'>;
};

export function TenantEditProfileScreen({ navigation }: Props) {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    full_name: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await tenantApi.getProfile();
      const profileUser = response.user;
      setFormData({
        name: profileUser.name || '',
        email: profileUser.email || '',
        phone: profileUser.phone || '',
        full_name: profileUser.tenant?.full_name || '',
        emergency_contact_name: profileUser.tenant?.emergency_contact_name || '',
        emergency_contact_phone: profileUser.tenant?.emergency_contact_phone || '',
        emergency_contact_relation: profileUser.tenant?.emergency_contact_relation || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      await tenantApi.updateProfile(formData);
      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update profile';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <ScrollView style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>Edit Profile</Text>
      </View>
      
      <Card mode="contained" style={screenStyles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>Personal Information</Text>
          
          <TextInput
            label="Name"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            mode="outlined"
            style={screenStyles.input}
            error={!!errors.name}
          />
          {errors.name && <HelperText type="error">{errors.name}</HelperText>}
          
          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            mode="outlined"
            style={screenStyles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
          />
          {errors.email && <HelperText type="error">{errors.email}</HelperText>}
          
          <TextInput
            label="Phone"
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            mode="outlined"
            style={screenStyles.input}
            keyboardType="phone-pad"
          />
          
          <TextInput
            label="Full Name"
            value={formData.full_name}
            onChangeText={(value) => updateField('full_name', value)}
            mode="outlined"
            style={screenStyles.input}
          />
        </Card.Content>
      </Card>

      <Card mode="contained" style={screenStyles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>Emergency Contact</Text>
          
          <TextInput
            label="Contact Name"
            value={formData.emergency_contact_name}
            onChangeText={(value) => updateField('emergency_contact_name', value)}
            mode="outlined"
            style={screenStyles.input}
          />
          
          <TextInput
            label="Contact Phone"
            value={formData.emergency_contact_phone}
            onChangeText={(value) => updateField('emergency_contact_phone', value)}
            mode="outlined"
            style={screenStyles.input}
            keyboardType="phone-pad"
          />
          
          <TextInput
            label="Relationship"
            value={formData.emergency_contact_relation}
            onChangeText={(value) => updateField('emergency_contact_relation', value)}
            mode="outlined"
            style={screenStyles.input}
          />
        </Card.Content>
      </Card>

      <ChangePasswordForm onUpdatePassword={tenantApi.updatePassword} />

      <View style={{ padding: 16, gap: 12 }}>
        <Button 
          mode="contained" 
          onPress={handleSave} 
          loading={saving}
          disabled={saving || loading}
        >
          Save Changes
        </Button>
        <Button 
          mode="outlined" 
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
}
