import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { supabase } from '../api/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';

type RegisterScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        // Validation
        if (!email || !password || !businessName) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            console.log('📝 Attempting registration with email:', email);

            // Step 1: Sign up with Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password,
                options: {
                    data: {
                        role: 'business',
                        business_name: businessName,
                    },
                },
            });

            console.log('📥 Registration response:', {
                hasData: !!data,
                hasUser: !!data?.user,
                userId: data?.user?.id,
                userConfirmed: data?.user?.confirmed_at,
                error: error?.message
            });

            if (error) {
                console.error('❌ Registration error:', error);
                Alert.alert('Registration Failed', error.message);
            } else if (data.user) {
                console.log('✅ Auth registration successful! User ID:', data.user.id);

                // Step 2: Create corresponding entry in public.users table
                console.log('📝 Creating user record in users table...');
                const { error: userError } = await supabase
                    .from('users')
                    .insert({
                        id: data.user.id,
                        email: email.trim(),
                        name: businessName,
                        role: 'business',
                    });

                if (userError) {
                    console.error('❌ Error creating user record:', userError);
                    Alert.alert('Warning', 'Account created but profile setup failed. Please contact support.');
                } else {
                    console.log('✅ User record created in users table');

                    // Step 3: Create business profile
                    console.log('📝 Creating business profile...');
                    const { error: profileError } = await supabase
                        .from('business_profiles')
                        .insert({
                            user_id: data.user.id,
                            company_name: businessName,
                        });

                    if (profileError) {
                        console.error('⚠️ Warning: Business profile creation failed:', profileError);
                    } else {
                        console.log('✅ Business profile created');
                    }

                    // Success message
                    if (data.user.confirmed_at) {
                        Alert.alert(
                            'Success',
                            'Account created successfully! You can now log in.',
                            [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
                        );
                    } else {
                        Alert.alert(
                            'Success',
                            'Account created! Please check your email to verify your account before logging in.',
                            [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
                        );
                    }
                }
            }
        } catch (error) {
            console.error('💥 Unexpected registration error:', error);
            Alert.alert('Error', 'An unexpected error occurred: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <View style={styles.formWrapper}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Sign up as an employer</Text>

                        <View style={styles.form}>
                            <Text style={styles.label}>Business Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Your Business Name"
                                value={businessName}
                                onChangeText={setBusinessName}
                                autoCapitalize="words"
                                editable={!loading}
                            />

                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="your@email.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoComplete="email"
                                editable={!loading}
                            />

                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="At least 6 characters"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoComplete="password-new"
                                editable={!loading}
                            />

                            <Text style={styles.label}>Confirm Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                autoComplete="password-new"
                                editable={!loading}
                            />

                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleRegister}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Sign Up</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() => navigation.navigate('Login')}
                                disabled={loading}
                            >
                                <Text style={styles.linkText}>
                                    Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        paddingTop: 40,
        alignItems: 'center', // Center on web
    },
    formWrapper: {
        width: '100%',
        maxWidth: Platform.OS === 'web' ? 500 : undefined, // Constrain width on web
        alignSelf: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
    },
    form: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    linkButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    linkText: {
        color: '#666',
        fontSize: 14,
    },
    linkTextBold: {
        color: '#007AFF',
        fontWeight: '600',
    },
});
