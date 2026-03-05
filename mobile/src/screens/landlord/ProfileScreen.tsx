import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';

export function LandlordProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text variant="headlineSmall" style={screenStyles.title}>Profile</Text>
      </View>
      <Card style={screenStyles.card}>
        <Card.Content>
          <View style={screenStyles.listItem}>
            <Text variant="bodyMedium" style={screenStyles.date}>Name</Text>
            <Text variant="bodyMedium">{user?.name}</Text>
          </View>
          <View style={screenStyles.listItem}>
            <Text variant="bodyMedium" style={screenStyles.date}>Email</Text>
            <Text variant="bodyMedium">{user?.email}</Text>
          </View>
          <View style={screenStyles.listItem}>
            <Text variant="bodyMedium" style={screenStyles.date}>Role</Text>
            <Text variant="bodyMedium">{user?.role}</Text>
          </View>
        </Card.Content>
      </Card>
      <View style={{ padding: 16 }}>
        <Button mode="contained" onPress={logout} buttonColor={colors.error}>Logout</Button>
      </View>
    </ScrollView>
  );
}
