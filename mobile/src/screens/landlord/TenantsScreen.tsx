import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { colors } from '../../constants/colors';

export function LandlordTenantsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Tenants</Text>
      </View>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium" style={styles.placeholder}>Tenants list will be loaded from API</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16, paddingTop: 24 },
  title: { color: colors.text.primary, fontWeight: 'bold' },
  card: { marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.white },
  placeholder: { color: colors.text.secondary, textAlign: 'center', paddingVertical: 40 },
});
