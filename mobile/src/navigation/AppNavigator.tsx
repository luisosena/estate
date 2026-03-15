import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { tabBarScreenOptions } from '../constants/styles';

// Icons
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Tenant Screens
import { TenantDashboardScreen } from '../screens/tenant/DashboardScreen';
import { TenantPaymentsScreen } from '../screens/tenant/PaymentsScreen';
import { TenantUtilitiesScreen } from '../screens/tenant/UtilitiesScreen';
import { TenantProfileScreen } from '../screens/tenant/ProfileScreen';
import { MakePaymentScreen } from '../screens/tenant/MakePaymentScreen';

// Landlord Screens
import { LandlordDashboardScreen } from '../screens/landlord/DashboardScreen';
import { LandlordPropertiesScreen } from '../screens/landlord/PropertiesScreen';
import { LandlordTenantsScreen } from '../screens/landlord/TenantsScreen';
import { LandlordPaymentsScreen } from '../screens/landlord/PaymentsScreen';
import { LandlordProfileScreen } from '../screens/landlord/ProfileScreen';

// Detail Screens
import { PropertyDetailsScreen } from '../screens/landlord/PropertyDetailsScreen';
import { UnitDetailsScreen } from '../screens/landlord/UnitDetailsScreen';
import { TenantDetailsScreen } from '../screens/landlord/TenantDetailsScreen';

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

export type TenantPaymentsStackParamList = {
  PaymentsList: undefined;
  MakePayment: { monthlyRent?: number; pendingAmount?: number };
};

export type LandlordTabParamList = {
  Dashboard: undefined;
  Properties: undefined;
  Tenants: undefined;
  Payments: undefined;
  Profile: undefined;
};

// New Nested Stack Params
export type LandlordPropertiesStackParamList = {
  PropertiesList: undefined;
  PropertyDetails: { propertyId: number };
  UnitDetails: { unitId: number };
};

export type LandlordTenantsStackParamList = {
  TenantsList: undefined;
  TenantDetails: { tenantId: number };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const TenantTab = createBottomTabNavigator<TenantTabParamList>();
const LandlordTab = createBottomTabNavigator<LandlordTabParamList>();

const TenantPaymentsStack = createNativeStackNavigator<TenantPaymentsStackParamList>();

const PropertiesStack = createNativeStackNavigator<LandlordPropertiesStackParamList>();
const TenantsStack = createNativeStackNavigator<LandlordTenantsStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function TenantPaymentsNavigator() {
  return (
    <TenantPaymentsStack.Navigator screenOptions={{ headerShown: false }}>
      <TenantPaymentsStack.Screen name="PaymentsList" component={TenantPaymentsScreen} />
      <TenantPaymentsStack.Screen name="MakePayment" component={MakePaymentScreen} />
    </TenantPaymentsStack.Navigator>
  );
}

function TenantNavigator() {
  return (
    <TenantTab.Navigator screenOptions={tabBarScreenOptions}>
      <TenantTab.Screen
        name="Dashboard"
        component={TenantDashboardScreen}
        options={{ 
          title: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <TenantTab.Screen 
        name="Payments" 
        component={TenantPaymentsNavigator}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'card' : 'card-outline'} size={size} color={color} />
          ),
        }}
      />
      <TenantTab.Screen 
        name="Utilities" 
        component={TenantUtilitiesScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'flash' : 'flash-outline'} size={size} color={color} />
          ),
        }}
      />
      <TenantTab.Screen 
        name="Profile" 
        component={TenantProfileScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </TenantTab.Navigator>
  );
}

function LandlordPropertiesNavigator() {
  return (
    <PropertiesStack.Navigator screenOptions={{ headerShown: false }}>
      <PropertiesStack.Screen name="PropertiesList" component={LandlordPropertiesScreen} />
      <PropertiesStack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
      <PropertiesStack.Screen name="UnitDetails" component={UnitDetailsScreen} />
    </PropertiesStack.Navigator>
  );
}

function LandlordTenantsNavigator() {
  return (
    <TenantsStack.Navigator screenOptions={{ headerShown: false }}>
      <TenantsStack.Screen name="TenantsList" component={LandlordTenantsScreen} />
      <TenantsStack.Screen name="TenantDetails" component={TenantDetailsScreen} />
    </TenantsStack.Navigator>
  );
}

function LandlordNavigator() {
  return (
    <LandlordTab.Navigator screenOptions={tabBarScreenOptions}>
      <LandlordTab.Screen
        name="Dashboard"
        component={LandlordDashboardScreen}
        options={{ 
          title: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <LandlordTab.Screen 
        name="Properties" 
        component={LandlordPropertiesNavigator}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'business' : 'business-outline'} size={size} color={color} />
          ),
        }}
      />
      <LandlordTab.Screen 
        name="Tenants" 
        component={LandlordTenantsNavigator}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
          ),
        }}
      />
      <LandlordTab.Screen 
        name="Payments" 
        component={LandlordPaymentsScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'card' : 'card-outline'} size={size} color={color} />
          ),
        }}
      />
      <LandlordTab.Screen 
        name="Profile" 
        component={LandlordProfileScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
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
