import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../api/supabase';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootNavigator() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

    useEffect(() => {
        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                checkProfileCompletion(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('Auth state changed:', _event, session?.user?.id);
            setSession(session);
            if (session) {
                checkProfileCompletion(session.user.id);
            } else {
                setProfileComplete(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const checkProfileCompletion = async (userId: string) => {
        try {
            console.log('🔍 Checking profile completion for user:', userId);

            const { data, error } = await supabase
                .from('business_profiles')
                .select('company_name, description, logo_url, business_type')
                .eq('user_id', userId)
                .single();

            if (error) {
                console.log('⚠️ No business profile found, needs completion');
                setProfileComplete(false);
            } else {
                // Check if trading_name (company_name) and business_address (description) are filled
                const isComplete = !!(data?.company_name && data?.description);
                console.log('📋 Profile completion status:', {
                    company_name: !!data?.company_name,
                    description: !!data?.description,
                    isComplete
                });
                setProfileComplete(isComplete);
            }
        } catch (error) {
            console.error('Error checking profile:', error);
            setProfileComplete(false);
        } finally {
            setLoading(false);
        }
    };

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
                <AuthNavigator />
            ) : profileComplete === false ? (
                <CompleteProfileScreen
                    onProfileComplete={() => {
                        if (session?.user) {
                            checkProfileCompletion(session.user.id);
                        }
                    }}
                />
            ) : (
                <AppNavigator />
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
