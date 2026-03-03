import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/colors';

export function LandlordProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Profile</Text>
      </View>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium">Name: {user?.name}</Text>
          <Text variant="bodyMedium">Email: {user?.email}</Text>
          <Text variant="bodyMedium">Role: {user?.role}</Text>
        </Card.Content>
      </Card>
      <View style={styles.logoutContainer}>
        <Button mode="contained" onPress={logout} buttonColor={colors.error}>Logout</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16, paddingTop: 24 },
  title: { color: colors.text.primary, fontWeight: 'bold' },
  card: { marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.white },
  logoutContainer: { padding: 16 },
});
