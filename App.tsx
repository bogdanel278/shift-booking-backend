import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from './src/api/supabase';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import CompleteProfileScreen from './src/screens/CompleteProfileScreen';

/**
 * Main App Component
 * 
 * Manages authentication state and profile completion guard:
 * - AuthStack (Login/Register) when user is logged out
 * - CompleteProfileScreen when user needs to complete their profile
 * - MainNavigator (Bottom Tabs) when user is fully set up
 * 
 * Uses Supabase onAuthStateChange listener to automatically detect
 * login/logout events and switch navigation stacks accordingly.
 */
export default function App() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);

    // Check if user profile is complete
    const checkProfileCompletion = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('business_profiles')
                .select('company_name, description')
                .eq('user_id', userId)
                .single();

            if (error) {
                console.error('Error checking profile:', error);
                setIsProfileComplete(false);
                return;
            }

            // Profile is complete if both company_name and description are filled
            const complete = !!(data?.company_name && data?.description);
            console.log('Profile complete:', complete);
            setIsProfileComplete(complete);
        } catch (err) {
            console.error('Unexpected error checking profile:', err);
            setIsProfileComplete(false);
        }
    };

    useEffect(() => {
        // Check for existing session on app startup
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                checkProfileCompletion(session.user.id);
            }
            setLoading(false);
        });

        // Subscribe to auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('Auth state changed:', _event, session?.user?.email);
            setSession(session);
            if (session?.user) {
                checkProfileCompletion(session.user.id);
            } else {
                setIsProfileComplete(null);
            }
        });

        // Cleanup subscription on unmount
        return () => subscription.unsubscribe();
    }, []);

    // Show loading screen while checking auth state
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {!session ? (
                // User is not authenticated -> Show Auth Stack
                <AuthNavigator />
            ) : isProfileComplete === false ? (
                // User is authenticated but profile incomplete -> Show Complete Profile Screen
                <CompleteProfileScreen
                    onProfileComplete={() => {
                        // Re-check profile completion after user completes profile
                        if (session.user) {
                            checkProfileCompletion(session.user.id);
                        }
                    }}
                />
            ) : isProfileComplete === true ? (
                // User is authenticated and profile complete -> Show Main App with Bottom Tabs
                <MainNavigator />
            ) : (
                // Still loading profile status
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            )}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
});
