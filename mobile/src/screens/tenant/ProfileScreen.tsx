import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useLayoutEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ErrorState } from '../../components/common/ScreenContainer/../ErrorState';

import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import { useAuth } from '../../context/AuthContext';

type TenantProfileStackParamList = {
  ProfileView: undefined;
  EditProfile: undefined;
};

type NavigationProp = NativeStackNavigationProp<TenantProfileStackParamList>;

export function TenantProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Profile',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
    });
  }, [navigation]);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const menuItems = [
    {
      id: 'edit',
      title: 'Edit Profile',
      subtitle: 'Personal details and contact info',
      icon: 'person-outline',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: 'security',
      title: 'Privacy & Security',
      subtitle: 'Manage your password and data',
      icon: 'lock-closed-outline',
      onPress: () => navigation.navigate('EditProfile'), // For now combined in Edit Profile
    },
    {
      id: 'support',
      title: 'Support & Help',
      subtitle: 'Contact support or read FAQs',
      icon: 'help-circle-outline',
      onPress: () => {}, // Placeholder
    },
    {
      id: 'logout',
      title: 'Logout',
      subtitle: 'Sign out of your account',
      icon: 'log-out-outline',
      onPress: logout,
      isDestructive: true,
    },
  ];


  return (
    <ScreenContainer scrollable edges={['top', 'bottom', 'left', 'right']}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Menu Section */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              index === menuItems.length - 1 && { borderBottomWidth: 0 }
            ]}
            onPress={item.onPress}
          >
            <View style={[
              styles.iconBox,
              item.isDestructive && { backgroundColor: colors.error + '10' }
            ]}>
              <Ionicons 
                name={item.icon as any} 
                size={22} 
                color={item.isDestructive ? colors.error : colors.primary} 
              />
            </View>
            <View style={styles.menuContent}>
              <Text style={[
                styles.menuTitle,
                item.isDestructive && { color: colors.error }
              ]}>
                {item.title}
              </Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Estate Practice Mobile v1.0.0</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '20',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray[600],
    letterSpacing: 1,
  },
  menuContainer: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primary + '05',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: colors.gray[400],
  },
});
