import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Text } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import CreateShiftScreen from '../screens/CreateShiftScreen';
import ProfileHubScreen from '../screens/ProfileHubScreen';

export type MainTabParamList = {
    Home: undefined;
    PostShift: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                    paddingBottom: Platform.OS === 'ios' ? 20 : 5,
                    paddingTop: 5,
                    height: Platform.OS === 'ios' ? 85 : 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Shifts',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon icon="📋" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="PostShift"
                component={CreateShiftScreen}
                options={{
                    tabBarLabel: 'Post Shift',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon icon="➕" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileHubScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon icon="👤" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

// Simple tab icon component
function TabIcon({ icon, color, size }: { icon: string; color: string; size: number }) {
    return (
        <Text style={{ fontSize: size * 1.2, color }}>
            {icon}
        </Text>
    );
}
