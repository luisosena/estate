import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Text, TextInput, HelperText } from 'react-native-paper';

import { colors } from '../../constants/colors';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

interface Props {
  onUpdatePassword: (data: any) => Promise<{ message: string }>;
}

export function ChangePasswordForm({ onUpdatePassword }: Props) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [changingPassword, setChangingPassword] = useState(false);

  const updatePasswordField = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleChangePassword = async () => {
    const newErrors: Record<string, string> = {};
    if (!passwordData.current_password) {
      newErrors.current_password = 'Current password is required';
    }
    if (!passwordData.password) {
      newErrors.password = 'New password is required';
    } else if (passwordData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (passwordData.password !== passwordData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    try {
      setChangingPassword(true);
      await onUpdatePassword(passwordData);
      Alert.alert('Success', 'Password changed successfully');
      setShowPasswordForm(false);
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to change password';
      Alert.alert('Error', message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Card style={styles.container}>
      {!showPasswordForm ? (
        <View style={styles.toggleContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Password & Security</Text>
            <Text style={styles.subtitle}>Keep your account secure by updating your password.</Text>
          </View>
          <Button 
            variant="outline" 
            label="Change Password"
            onPress={() => setShowPasswordForm(true)}
            style={styles.toggleBtn}
          />
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Change Password</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput
              value={passwordData.current_password}
              onChangeText={(value) => updatePasswordField('current_password', value)}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              style={styles.input}
              secureTextEntry
              error={!!passwordErrors.current_password}
            />
            {passwordErrors.current_password && (
              <HelperText type="error" style={styles.errorText}>{passwordErrors.current_password}</HelperText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              value={passwordData.password}
              onChangeText={(value) => updatePasswordField('password', value)}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              style={styles.input}
              secureTextEntry
              error={!!passwordErrors.password}
            />
            {passwordErrors.password && (
              <HelperText type="error" style={styles.errorText}>{passwordErrors.password}</HelperText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput
              value={passwordData.password_confirmation}
              onChangeText={(value) => updatePasswordField('password_confirmation', value)}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              style={styles.input}
              secureTextEntry
              error={!!passwordErrors.password_confirmation}
            />
            {passwordErrors.password_confirmation && (
              <HelperText type="error" style={styles.errorText}>{passwordErrors.password_confirmation}</HelperText>
            )}
          </View>

          <View style={styles.btnRow}>
            <Button
              label="Update"
              onPress={handleChangePassword}
              loading={changingPassword}
              disabled={changingPassword}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              variant="outline"
              label="Cancel"
              onPress={() => {
                setShowPasswordForm(false);
                setPasswordErrors({});
              }}
              disabled={changingPassword}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'column',
  },
  textContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  toggleBtn: {
    alignSelf: 'flex-start',
  },
  formContainer: {
    width: '100%',
  },
  formTitle: {
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
  btnRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
});
