import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { LoadingScreen } from '../components/common/LoadingScreen';
import { tabBarScreenOptions, nativeHeaderOptions } from '../constants/styles';
import { useAuth } from '../context/AuthContext';

// Icons

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Tenant Screens
import { AddPropertyScreen } from '../screens/landlord/AddPropertyScreen';
import { AddTenantScreen } from '../screens/landlord/AddTenantScreen';
import { AddUnitScreen } from '../screens/landlord/AddUnitScreen';
import { LandlordDashboardScreen } from '../screens/landlord/DashboardScreen';
import { LandlordDocumentsScreen } from '../screens/landlord/DocumentsScreen';
import { LandlordEditProfileScreen } from '../screens/landlord/EditProfileScreen';
import { LandlordPaymentsScreen } from '../screens/landlord/PaymentsScreen';
import { LandlordProfileScreen } from '../screens/landlord/ProfileScreen';
import { LandlordPropertiesScreen } from '../screens/landlord/PropertiesScreen';
import { PropertyDetailsScreen } from '../screens/landlord/PropertyDetailsScreen';
import { LandlordRentBillDetailsScreen } from '../screens/landlord/RentBillDetailsScreen';
import { LandlordRentBillsScreen } from '../screens/landlord/RentBillsScreen';
import { TenancyUtilitiesScreen } from '../screens/landlord/TenancyUtilitiesScreen';
import { TenantDetailsScreen } from '../screens/landlord/TenantDetailsScreen';
import { LandlordTenantsScreen } from '../screens/landlord/TenantsScreen';
import { UnitDetailsScreen } from '../screens/landlord/UnitDetailsScreen';
import { LandlordUtilityBillsScreen } from '../screens/landlord/UtilityBillsScreen';
import { TenantDashboardScreen } from '../screens/tenant/DashboardScreen';
import { TenantDocumentsScreen } from '../screens/tenant/DocumentsScreen';
import { TenantEditProfileScreen } from '../screens/tenant/EditProfileScreen';
import { MakePaymentScreen } from '../screens/tenant/MakePaymentScreen';
import { TenantPaymentsScreen } from '../screens/tenant/PaymentsScreen';
import { TenantProfileScreen } from '../screens/tenant/ProfileScreen';
import { TenantRentBillDetailsScreen } from '../screens/tenant/RentBillDetailsScreen';
import { TenantRentBillsScreen } from '../screens/tenant/RentBillsScreen';
import { TenantUtilitiesScreen } from '../screens/tenant/UtilitiesScreen';
import { TenantUtilityBillsScreen } from '../screens/tenant/UtilityBillsScreen';

// Landlord Screens

// Detail Screens

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
  Documents: undefined;
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
    <TenantProfileStack.Navigator screenOptions={nativeHeaderOptions}>
      <TenantProfileStack.Screen name="ProfileView" component={TenantProfileScreen} options={{ headerShown: false }} />
      <TenantProfileStack.Screen name="EditProfile" component={TenantEditProfileScreen} options={{ title: 'Edit Profile' }} />
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
  Documents: undefined;
};

export type TenantDocumentsStackParamList = {
  DocumentsList: undefined;
};

export type LandlordPaymentsStackParamList = {
  PaymentsList: undefined;
  UtilityBills: undefined;
  RentBills: undefined;
  RentBillDetails: { billId: number };
};

export type LandlordDocumentsStackParamList = {
  LandlordDocuments: { tenancyId: number };
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
    <LandlordProfileStack.Navigator screenOptions={nativeHeaderOptions}>
      <LandlordProfileStack.Screen name="ProfileView" component={LandlordProfileScreen} options={{ headerShown: false }} />
      <LandlordProfileStack.Screen name="EditProfile" component={LandlordEditProfileScreen} options={{ title: 'Edit Profile' }} />
    </LandlordProfileStack.Navigator>
  );
}

// New Nested Stack Params
export type LandlordPropertiesStackParamList = {
  PropertiesList: undefined;
  PropertyDetails: { propertyId: number };
  AddProperty: undefined;
  AddUnit: { propertyId: number };
  UnitDetails: { unitId: number };
  AddTenant: { unitId?: number };
};

export type LandlordTenantsStackParamList = {
  TenantsList: undefined;
  AddTenant: { unitId?: number };
  TenantDetails: { tenantCode: string };
  TenancyUtilities: { tenancyId: number; tenantName: string };
  LandlordDocuments: { tenancyId: number };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const TenantTab = createBottomTabNavigator<TenantTabParamList>();
const LandlordTab = createBottomTabNavigator<LandlordTabParamList>();

const TenantPaymentsStack = createNativeStackNavigator<TenantPaymentsStackParamList>();
const TenantUtilitiesStack = createNativeStackNavigator<TenantUtilitiesStackParamList>();
const TenantDocumentsStack = createNativeStackNavigator<TenantDocumentsStackParamList>();
const LandlordDocumentsStack = createNativeStackNavigator<LandlordDocumentsStackParamList>();

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
    <TenantPaymentsStack.Navigator screenOptions={nativeHeaderOptions}>
      <TenantPaymentsStack.Screen name="PaymentsList" component={TenantPaymentsScreen} />
      <TenantPaymentsStack.Screen name="MakePayment" component={MakePaymentScreen} />
      <TenantPaymentsStack.Screen name="RentBills" component={TenantRentBillsScreen} />
      <TenantPaymentsStack.Screen name="RentBillDetails" component={TenantRentBillDetailsScreen} />
    </TenantPaymentsStack.Navigator>
  );
}

function TenantUtilitiesNavigator() {
  return (
    <TenantUtilitiesStack.Navigator screenOptions={nativeHeaderOptions}>
      <TenantUtilitiesStack.Screen name="UtilitiesList" component={TenantUtilitiesScreen} />
      <TenantUtilitiesStack.Screen name="UtilityBills" component={TenantUtilityBillsScreen} />
    </TenantUtilitiesStack.Navigator>
  );
}

function TenantDocumentsNavigator() {
  return (
    <TenantDocumentsStack.Navigator screenOptions={nativeHeaderOptions}>
      <TenantDocumentsStack.Screen name="DocumentsList" component={TenantDocumentsScreen} />
    </TenantDocumentsStack.Navigator>
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
        name="Documents" 
        component={TenantDocumentsNavigator}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'document' : 'document-outline'} size={size} color={color} />
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
    <PropertiesStack.Navigator screenOptions={nativeHeaderOptions}>
      <PropertiesStack.Screen name="PropertiesList" component={LandlordPropertiesScreen} options={{ title: 'Properties' }} />
      <PropertiesStack.Screen name="PropertyDetails" component={PropertyDetailsScreen} options={{ title: 'Property Details' }} />
      <PropertiesStack.Screen name="AddProperty" component={AddPropertyScreen} options={{ title: 'Add Property' }} />
      <PropertiesStack.Screen name="AddUnit" component={AddUnitScreen} options={{ title: 'Add Unit' }} />
      <PropertiesStack.Screen name="UnitDetails" component={UnitDetailsScreen} options={{ title: 'Unit Details' }} />
      <PropertiesStack.Screen name="AddTenant" component={AddTenantScreen} options={{ title: 'Add Tenant' }} />
    </PropertiesStack.Navigator>
  );
}

function LandlordTenantsNavigator() {
  return (
    <TenantsStack.Navigator screenOptions={nativeHeaderOptions}>
      <TenantsStack.Screen name="TenantsList" component={LandlordTenantsScreen} options={{ title: 'Tenants' }} />
      <TenantsStack.Screen name="AddTenant" component={AddTenantScreen} options={{ title: 'Add Tenant' }} />
      <TenantsStack.Screen name="TenantDetails" component={TenantDetailsScreen} options={{ title: 'Tenant Details' }} />
      <TenantsStack.Screen name="TenancyUtilities" component={TenancyUtilitiesScreen} options={{ title: 'Utilities' }} />
      <TenantsStack.Screen name="LandlordDocuments" component={LandlordDocumentsScreen} options={{ title: 'Documents' }} />
    </TenantsStack.Navigator>
  );
}

// Create Payments stack navigator for landlord
const PaymentsStack = createNativeStackNavigator<LandlordPaymentsStackParamList>();

function LandlordPaymentsNavigator() {
  return (
    <PaymentsStack.Navigator screenOptions={nativeHeaderOptions}>
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
