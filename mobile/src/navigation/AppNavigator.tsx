import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import ShiftDetailsScreen from '../screens/ShiftDetailsScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import RightToWorkStatusScreen from '../screens/RightToWorkStatusScreen';
import EditAccountScreen from '../screens/EditAccountScreen';
import IdDocumentDetailsScreen from '../screens/IdDocumentDetailsScreen';
import RtwMethodDetailsScreen from '../screens/RtwMethodDetailsScreen';
import DocumentVerificationScreen from '../screens/DocumentVerificationScreen';
import LivenessVerificationScreen from '../screens/LivenessVerificationScreen';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShiftDetails"
        component={ShiftDetailsScreen}
        options={{
          headerShown: true,
          title: 'Shift Details',
          headerStyle: { backgroundColor: '#0E7A6D' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
      <Stack.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          headerShown: true,
          title: 'My Bookings',
          headerStyle: { backgroundColor: '#0E7A6D' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
      <Stack.Screen
        name="RightToWorkStatus"
        component={RightToWorkStatusScreen}
        options={{
          headerShown: true,
          title: 'Right to Work',
          headerStyle: { backgroundColor: '#0E7A6D' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
      <Stack.Screen
        name="EditAccount"
        component={EditAccountScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="IdDocumentDetails"
        component={IdDocumentDetailsScreen}
        options={{
          headerShown: true,
          title: 'ID Document',
          headerStyle: { backgroundColor: '#0E7A6D' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
      <Stack.Screen
        name="RtwMethodDetails"
        component={RtwMethodDetailsScreen}
        options={{
          headerShown: true,
          title: 'Right to Work Method',
          headerStyle: { backgroundColor: '#0E7A6D' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
      <Stack.Screen
        name="DocumentVerification"
        component={DocumentVerificationScreen}
        options={{
          headerShown: true,
          title: 'Verify Information',
          headerStyle: { backgroundColor: '#0E7A6D' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
      <Stack.Screen
        name="LivenessVerification"
        component={LivenessVerificationScreen}
        options={{
          headerShown: true,
          title: 'Liveness Verification',
          headerStyle: { backgroundColor: '#0E7A6D' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
    </Stack.Navigator>
  );
}
