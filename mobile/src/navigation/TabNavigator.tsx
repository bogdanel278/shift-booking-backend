import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import MyJobsScreen from '../screens/MyJobsScreen';
import PayScreen from '../screens/PayScreen';
import ProfileScreen from '../screens/ProfileScreen';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

// Custom icon component
const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => {
  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (label) {
      case 'MyJobs': return focused ? 'briefcase' : 'briefcase-outline';
      case 'Search': return focused ? 'search' : 'search-outline';
      case 'Home': return focused ? 'home' : 'home-outline';
      case 'Pay': return focused ? 'wallet' : 'wallet-outline';
      case 'Profile': return focused ? 'person' : 'person-outline';
      default: return 'ellipse';
    }
  };

  return (
    <View style={[styles.tabItem, label === 'Home' && styles.homeTab]}>
      <Ionicons 
        name={getIconName()} 
        size={24} 
        color={focused ? '#0E7A6D' : '#8AA0A4'} 
      />
    </View>
  );
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#D7ECE7',
          height: 70,
          paddingTop: 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
        },
        tabBarActiveTintColor: '#0E7A6D',
        tabBarInactiveTintColor: '#8AA0A4',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingHorizontal: 4,
        },
      }}
    >
      <Tab.Screen
        name="MyJobs"
        component={MyJobsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="MyJobs" focused={focused} />,
          tabBarLabel: 'Jobs',
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Search" focused={focused} />,
          tabBarLabel: 'Search',
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Pay"
        component={PayScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Pay" focused={focused} />,
          tabBarLabel: 'Pay',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} />,
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeTab: {
    marginTop: -6,
  },
});
