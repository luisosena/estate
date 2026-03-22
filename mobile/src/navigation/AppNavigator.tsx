import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { tabBarScreenOptions } from '../constants/styles';
import { colors } from '../constants/colors';

// Icons
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Tenant Screens
import { TenantDashboardScreen } from '../screens/tenant/DashboardScreen';
import { TenantPaymentsScreen } from '../screens/tenant/PaymentsScreen';
import { TenantUtilitiesScreen } from '../screens/tenant/UtilitiesScreen';
import { TenantUtilityBillsScreen } from '../screens/tenant/UtilityBillsScreen';
import { TenantProfileScreen } from '../screens/tenant/ProfileScreen';
import { TenantEditProfileScreen } from '../screens/tenant/EditProfileScreen';
import { MakePaymentScreen } from '../screens/tenant/MakePaymentScreen';
import { TenantRentBillsScreen } from '../screens/tenant/RentBillsScreen';
import { TenantRentBillDetailsScreen } from '../screens/tenant/RentBillDetailsScreen';

// Landlord Screens
import { LandlordDashboardScreen } from '../screens/landlord/DashboardScreen';
import { LandlordPropertiesScreen } from '../screens/landlord/PropertiesScreen';
import { LandlordTenantsScreen } from '../screens/landlord/TenantsScreen';
import { LandlordPaymentsScreen } from '../screens/landlord/PaymentsScreen';
import { LandlordProfileScreen } from '../screens/landlord/ProfileScreen';
import { LandlordEditProfileScreen } from '../screens/landlord/EditProfileScreen';
import { LandlordUtilityBillsScreen } from '../screens/landlord/UtilityBillsScreen';
import { LandlordRentBillsScreen } from '../screens/landlord/RentBillsScreen';
import { LandlordRentBillDetailsScreen } from '../screens/landlord/RentBillDetailsScreen';
import { TenancyUtilitiesScreen } from '../screens/landlord/TenancyUtilitiesScreen';

// Detail Screens
import { PropertyDetailsScreen } from '../screens/landlord/PropertyDetailsScreen';
import { UnitDetailsScreen } from '../screens/landlord/UnitDetailsScreen';
import { TenantDetailsScreen } from '../screens/landlord/TenantDetailsScreen';
import { AddTenantScreen } from '../screens/landlord/AddTenantScreen';

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

export type TenantProfileStackParamList = {
  ProfileView: undefined;
  EditProfile: undefined;
};

// Create stack navigator for tenant profile
const TenantProfileStack = createNativeStackNavigator<TenantProfileStackParamList>();

function TenantProfileNavigator() {
  return (
    <TenantProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <TenantProfileStack.Screen name="ProfileView" component={TenantProfileScreen} />
      <TenantProfileStack.Screen name="EditProfile" component={TenantEditProfileScreen} />
    </TenantProfileStack.Navigator>
  );
}

export type TenantUtilitiesStackParamList = {
  UtilitiesList: undefined;
  UtilityBills: undefined;
};

export type TenantPaymentsStackParamList = {
  PaymentsList: undefined;
  MakePayment: { monthlyRent?: number; pendingAmount?: number; rentBillId?: number };
  RentBills: undefined;
  RentBillDetails: { billId: number };
};

export type LandlordTabParamList = {
  Dashboard: undefined;
  Properties: undefined;
  Tenants: undefined;
  Payments: undefined;
  Profile: undefined;
};

export type LandlordProfileStackParamList = {
  ProfileView: undefined;
  EditProfile: undefined;
};

// Create stack navigator for landlord profile
const LandlordProfileStack = createNativeStackNavigator<LandlordProfileStackParamList>();

function LandlordProfileNavigator() {
  return (
    <LandlordProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <LandlordProfileStack.Screen name="ProfileView" component={LandlordProfileScreen} />
      <LandlordProfileStack.Screen name="EditProfile" component={LandlordEditProfileScreen} />
    </LandlordProfileStack.Navigator>
  );
}

// New Nested Stack Params
export type LandlordPropertiesStackParamList = {
  PropertiesList: undefined;
  PropertyDetails: { propertyId: number };
  UnitDetails: { unitId: number };
  AddTenant: { unitId?: number };
};

export type LandlordTenantsStackParamList = {
  TenantsList: undefined;
  AddTenant: { unitId?: number };
  TenantDetails: { tenantCode: string };
  TenancyUtilities: { tenancyId: number; tenantName: string };
};

export type LandlordPaymentsStackParamList = {
  PaymentsList: undefined;
  UtilityBills: undefined;
  RentBills: undefined;
  RentBillDetails: { billId: number };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const TenantTab = createBottomTabNavigator<TenantTabParamList>();
const LandlordTab = createBottomTabNavigator<LandlordTabParamList>();

const TenantPaymentsStack = createNativeStackNavigator<TenantPaymentsStackParamList>();
const TenantUtilitiesStack = createNativeStackNavigator<TenantUtilitiesStackParamList>();

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
      <TenantPaymentsStack.Screen name="RentBills" component={TenantRentBillsScreen} />
      <TenantPaymentsStack.Screen name="RentBillDetails" component={TenantRentBillDetailsScreen} />
    </TenantPaymentsStack.Navigator>
  );
}

function TenantUtilitiesNavigator() {
  return (
    <TenantUtilitiesStack.Navigator screenOptions={{ headerShown: false }}>
      <TenantUtilitiesStack.Screen name="UtilitiesList" component={TenantUtilitiesScreen} />
      <TenantUtilitiesStack.Screen name="UtilityBills" component={TenantUtilityBillsScreen} />
    </TenantUtilitiesStack.Navigator>
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
        component={TenantUtilitiesNavigator}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'flash' : 'flash-outline'} size={size} color={color} />
          ),
        }}
      />
      <TenantTab.Screen 
        name="Profile" 
        component={TenantProfileNavigator}
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
      <PropertiesStack.Screen name="PropertiesList" component={LandlordPropertiesScreen} options={{ title: 'Properties' }} />
      <PropertiesStack.Screen name="PropertyDetails" component={PropertyDetailsScreen} options={{ title: 'Property Details' }} />
      <PropertiesStack.Screen name="UnitDetails" component={UnitDetailsScreen} options={{ title: 'Unit Details' }} />
      <PropertiesStack.Screen name="AddTenant" component={AddTenantScreen} options={{ title: 'Add Tenant' }} />
    </PropertiesStack.Navigator>
  );
}

function LandlordTenantsNavigator() {
  return (
    <TenantsStack.Navigator screenOptions={{ headerShown: false }}>
      <TenantsStack.Screen name="TenantsList" component={LandlordTenantsScreen} options={{ title: 'Tenants' }} />
      <TenantsStack.Screen name="AddTenant" component={AddTenantScreen} options={{ title: 'Add Tenant' }} />
      <TenantsStack.Screen name="TenantDetails" component={TenantDetailsScreen} options={{ title: 'Tenant Details' }} />
      <TenantsStack.Screen name="TenancyUtilities" component={TenancyUtilitiesScreen} options={{ title: 'Utilities' }} />
    </TenantsStack.Navigator>
  );
}

// Create Payments stack navigator for landlord
const PaymentsStack = createNativeStackNavigator<LandlordPaymentsStackParamList>();

function LandlordPaymentsNavigator() {
  return (
    <PaymentsStack.Navigator screenOptions={{ headerShown: false }}>
      <PaymentsStack.Screen name="PaymentsList" component={LandlordPaymentsScreen} />
      <PaymentsStack.Screen name="UtilityBills" component={LandlordUtilityBillsScreen} />
      <PaymentsStack.Screen name="RentBills" component={LandlordRentBillsScreen} />
      <PaymentsStack.Screen name="RentBillDetails" component={LandlordRentBillDetailsScreen} />
    </PaymentsStack.Navigator>
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
        component={LandlordPaymentsNavigator}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'card' : 'card-outline'} size={size} color={color} />
          ),
        }}
      />
      <LandlordTab.Screen 
        name="Profile" 
        component={LandlordProfileNavigator}
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
