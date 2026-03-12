import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkerDashboardScreen from '../screens/WorkerDashboardScreen';
import ShiftListScreen from '../screens/ShiftListScreen';
import ShiftDetailsScreen from '../screens/ShiftDetailsScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import RightToWorkStatusScreen from '../screens/RightToWorkStatusScreen';

export type AppStackParamList = {
  WorkerDashboard: undefined;
  ShiftList: undefined;
  ShiftDetails: { shiftId: number };
  MyBookings: undefined;
  RightToWorkStatus: undefined;
};

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
    </Stack.Navigator>
  );
}
