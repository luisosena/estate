import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, HelperText } from 'react-native-paper';

import { landlordApi } from '../../api';
import { ChangePasswordForm } from '../../components/profile/ChangePasswordForm';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import { useAuth } from '../../context/AuthContext';

type LandlordProfileStackParamList = {
  ProfileView: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<LandlordProfileStackParamList, 'EditProfile'>;
};

export function LandlordEditProfileScreen({ navigation }: Props) {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await landlordApi.getProfile();
      const profileUser = response.user;
      setFormData({
        name: profileUser.name || '',
        email: profileUser.email || '',
        phone: profileUser.phone || '',
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
      await landlordApi.updateProfile(formData);
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
        </Card.Content>
      </Card>

      <ChangePasswordForm onUpdatePassword={landlordApi.updatePassword} />

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
