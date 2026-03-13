import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkerDashboardScreen from '../screens/WorkerDashboardScreen';
import ShiftListScreen from '../screens/ShiftListScreen';
import ShiftDetailsScreen from '../screens/ShiftDetailsScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import RightToWorkStatusScreen from '../screens/RightToWorkStatusScreen';
import IdDocumentDetailsScreen from '../screens/IdDocumentDetailsScreen';
import RtwMethodDetailsScreen from '../screens/RtwMethodDetailsScreen';
import DocumentVerificationScreen from '../screens/DocumentVerificationScreen';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="WorkerDashboard"
        component={WorkerDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="ShiftList"
        component={ShiftListScreen}
        options={{ title: 'Available Shifts' }}
      />
      <Stack.Screen
        name="ShiftDetails"
        component={ShiftDetailsScreen}
        options={{ title: 'Shift Details' }}
      />
      <Stack.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{ title: 'My Bookings' }}
      />
      <Stack.Screen
        name="RightToWorkStatus"
        component={RightToWorkStatusScreen}
        options={{ title: 'Right to Work' }}
      />
      <Stack.Screen
        name="IdDocumentDetails"
        component={IdDocumentDetailsScreen}
        options={{ title: 'ID Document' }}
      />
      <Stack.Screen
        name="RtwMethodDetails"
        component={RtwMethodDetailsScreen}
        options={{ title: 'Right to Work Method' }}
      />
      <Stack.Screen
        name="DocumentVerification"
        component={DocumentVerificationScreen}
        options={{ title: 'Verify Information' }}
      />
    </Stack.Navigator>
  );
}
