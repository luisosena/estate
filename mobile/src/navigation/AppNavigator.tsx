import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { tabBarScreenOptions } from '../constants/styles';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Tenant Screens
import { TenantDashboardScreen } from '../screens/tenant/DashboardScreen';
import { TenantPaymentsScreen } from '../screens/tenant/PaymentsScreen';
import { TenantUtilitiesScreen } from '../screens/tenant/UtilitiesScreen';
import { TenantProfileScreen } from '../screens/tenant/ProfileScreen';

// Landlord Screens
import { LandlordDashboardScreen } from '../screens/landlord/DashboardScreen';
import { LandlordPropertiesScreen } from '../screens/landlord/PropertiesScreen';
import { LandlordTenantsScreen } from '../screens/landlord/TenantsScreen';
import { LandlordPaymentsScreen } from '../screens/landlord/PaymentsScreen';
import { LandlordProfileScreen } from '../screens/landlord/ProfileScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type TenantTabParamList = {
  Dashboard: undefined;
  Payments: undefined;
  Utilities: undefined;
  Profile: undefined;
};

export type LandlordTabParamList = {
  Dashboard: undefined;
  Properties: undefined;
  Tenants: undefined;
  Payments: undefined;
  Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const TenantTab = createBottomTabNavigator<TenantTabParamList>();
const LandlordTab = createBottomTabNavigator<LandlordTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function TenantNavigator() {
  return (
    <TenantTab.Navigator screenOptions={tabBarScreenOptions}>
      <TenantTab.Screen
        name="Dashboard"
        component={TenantDashboardScreen}
        options={{ title: 'Home' }}
      />
      <TenantTab.Screen name="Payments" component={TenantPaymentsScreen} />
      <TenantTab.Screen name="Utilities" component={TenantUtilitiesScreen} />
      <TenantTab.Screen name="Profile" component={TenantProfileScreen} />
    </TenantTab.Navigator>
  );
}

function LandlordNavigator() {
  return (
    <LandlordTab.Navigator screenOptions={tabBarScreenOptions}>
      <LandlordTab.Screen
        name="Dashboard"
        component={LandlordDashboardScreen}
        options={{ title: 'Home' }}
      />
      <LandlordTab.Screen name="Properties" component={LandlordPropertiesScreen} />
      <LandlordTab.Screen name="Tenants" component={LandlordTenantsScreen} />
      <LandlordTab.Screen name="Payments" component={LandlordPaymentsScreen} />
      <LandlordTab.Screen name="Profile" component={LandlordProfileScreen} />
    </LandlordTab.Navigator>
  );
}

export function AppNavigator() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated || !user ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <RootStack.Screen
          name="Main"
          component={user.role === 'tenant' ? TenantNavigator : LandlordNavigator}
        />
      )}
    </RootStack.Navigator>
  );
}
