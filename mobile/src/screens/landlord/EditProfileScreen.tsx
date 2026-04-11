import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { Text, TextInput, HelperText } from 'react-native-paper';

import { ScreenContainer } from '../../components/common/ScreenContainer';

import { landlordApi } from '../../api';
import { ChangePasswordForm } from '../../components/profile/ChangePasswordForm';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import { useAuth } from '../../context/AuthContext';

type LandlordProfileStackParamList = {
  ProfileView: undefined;
  EditProfile: undefined;
};

type NavigationProp = NativeStackNavigationProp<LandlordProfileStackParamList>;

export function LandlordEditProfileScreen() {
  const { user, refreshUser } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Edit Profile',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
    });
  }, [navigation]);

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
        username: profileUser.username || '',
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
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
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
    <ScreenContainer scrollable withKeyboard edges={['bottom', 'left', 'right']}>
      <View style={styles.content}>
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              style={styles.input}
              error={!!errors.name}
              placeholder="Enter your full name"
            />
            {errors.name && <HelperText type="error" style={styles.errorText}>{errors.name}</HelperText>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              value={formData.username}
              onChangeText={(value) => updateField('username', value)}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              style={styles.input}
              autoCapitalize="none"
              error={!!errors.username}
              placeholder="Enter your username"
            />
            {errors.username && <HelperText type="error" style={styles.errorText}>{errors.username}</HelperText>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
              placeholder="Enter your email"
            />
            {errors.email && <HelperText type="error" style={styles.errorText}>{errors.email}</HelperText>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="Enter phone number"
            />
          </View>
        </Card>

        <View style={styles.divider} />

        <ChangePasswordForm onUpdatePassword={landlordApi.updatePassword} />

        <View style={styles.actionContainer}>
          <Button 
            label="Save Changes"
            onPress={handleSave} 
            loading={saving}
            disabled={saving || loading}
          />
          <Button 
            variant="outline"
            label="Cancel"
            onPress={() => navigation.goBack()}
            disabled={saving}
            style={{ marginTop: 12 }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  formCard: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.surface,
    fontSize: 15,
  },
  errorText: {
    paddingHorizontal: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 16,
  },
  actionContainer: {
    marginTop: 16,
  },
});
