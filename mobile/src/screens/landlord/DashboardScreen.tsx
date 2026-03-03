import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { colors } from '../../constants/colors';

export function LandlordDashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Landlord Dashboard</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Manage your properties</Text>
      </View>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium" style={styles.placeholder}>Dashboard data will be loaded from API</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16, paddingTop: 24 },
  title: { color: colors.text.primary, fontWeight: 'bold' },
  subtitle: { color: colors.text.secondary, marginTop: 4 },
  card: { marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.white },
  placeholder: { color: colors.text.secondary, textAlign: 'center', paddingVertical: 40 },
});
