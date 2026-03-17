import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import CreateShiftScreen from '../screens/CreateShiftScreen';
import ProfileScreen from '../screens/ProfileScreen';

/**
 * AppStack Navigation
 * 
 * Screens available when user IS authenticated:
 * - Dashboard: View all shifts created by the business
 * - CreateShift: Form to create a new shift (modal)
 * - Profile: Business profile and account settings
 */
export type AppStackParamList = {
    Dashboard: undefined;
    CreateShift: {
        duplicateFrom?: {
            title: string;
            location: string;
            pay_rate: number;
            description: string | null;
        };
    } | undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="Dashboard"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    title: 'My Shifts',
                }}
            />
            <Stack.Screen
                name="CreateShift"
                component={CreateShiftScreen}
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                    title: 'Create Shift',
                }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                }}
            />
        </Stack.Navigator>
    );
}
