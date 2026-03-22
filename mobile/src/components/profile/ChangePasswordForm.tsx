import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Text, TextInput, Button, HelperText, Card } from 'react-native-paper';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';

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
    <Card mode="contained" style={screenStyles.card}>
      <Card.Content>
        <Button
          mode={showPasswordForm ? 'text' : 'outlined'}
          onPress={() => setShowPasswordForm(!showPasswordForm)}
          style={{ marginBottom: showPasswordForm ? 16 : 0 }}
        >
          {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
        </Button>

        {showPasswordForm && (
          <>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>New Password</Text>

            <TextInput
              label="Current Password"
              value={passwordData.current_password}
              onChangeText={(value) => updatePasswordField('current_password', value)}
              mode="outlined"
              style={screenStyles.input}
              secureTextEntry
              error={!!passwordErrors.current_password}
            />
            {passwordErrors.current_password && <HelperText type="error">{passwordErrors.current_password}</HelperText>}

            <TextInput
              label="New Password"
              value={passwordData.password}
              onChangeText={(value) => updatePasswordField('password', value)}
              mode="outlined"
              style={screenStyles.input}
              secureTextEntry
              error={!!passwordErrors.password}
            />
            {passwordErrors.password && <HelperText type="error">{passwordErrors.password}</HelperText>}

            <TextInput
              label="Confirm New Password"
              value={passwordData.password_confirmation}
              onChangeText={(value) => updatePasswordField('password_confirmation', value)}
              mode="outlined"
              style={screenStyles.input}
              secureTextEntry
              error={!!passwordErrors.password_confirmation}
            />
            {passwordErrors.password_confirmation && <HelperText type="error">{passwordErrors.password_confirmation}</HelperText>}

            <Button
              mode="contained"
              onPress={handleChangePassword}
              loading={changingPassword}
              disabled={changingPassword}
              buttonColor={colors.primary}
              style={{ marginTop: 8 }}
            >
              Update Password
            </Button>
          </>
        )}
      </Card.Content>
    </Card>
  );
}
