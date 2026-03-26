import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

export default function RootNavigator() {
  const token = useAuthStore((s) => s.token);
  return (
    <NavigationContainer>
      {token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
