import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { supabase } from '../api/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AddressAutocomplete from '../components/AddressAutocomplete';

type CompleteProfileScreenProps = {
    onProfileComplete: () => void;
};

export default function CompleteProfileScreen({ onProfileComplete }: CompleteProfileScreenProps) {
    const [loading, setLoading] = useState(false);
    const [tradingName, setTradingName] = useState('');
    const [industry, setIndustry] = useState('');
    const [businessAddress, setBusinessAddress] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    const handleCompleteProfile = async () => {
        // Validation
        if (!tradingName.trim() || !businessAddress.trim()) {
            Alert.alert('Required Fields', 'Please fill in Trading Name and Business Address');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert('Error', 'Not authenticated');
                setLoading(false);
                return;
            }

            console.log('📝 Completing profile for user:', user.id);

            // Update business profile with required fields
            const { error: profileError } = await supabase
                .from('business_profiles')
                .upsert({
                    user_id: user.id,
                    company_name: tradingName.trim(),
                    business_type: industry.trim() || null,
                    description: businessAddress.trim(),
                    logo_url: logoUrl.trim() || null,
                }, {
                    onConflict: 'user_id'
                });

            if (profileError) {
                console.error('❌ Error updating profile:', profileError);
                Alert.alert('Error', 'Failed to save profile: ' + profileError.message);
            } else {
                console.log('✅ Profile completed successfully');
                Alert.alert('Success', 'Profile completed! Welcome to your dashboard.', [
                    { text: 'OK', onPress: () => onProfileComplete() }
                ]);
            }
        } catch (error) {
            console.error('💥 Unexpected error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.responsiveWrapper}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Complete Your Profile</Text>
                    <Text style={styles.headerSubtitle}>
                        Required to start creating shifts
                    </Text>
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Text style={styles.infoIcon}>ℹ️</Text>
                        <Text style={styles.infoText}>
                            Please complete these details to unlock shift creation and access all features.
                        </Text>
                    </View>

                    {/* Trading Name */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Trading Name <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Your Business Name"
                            value={tradingName}
                            onChangeText={setTradingName}
                            editable={!loading}
                            autoFocus
                        />
                        <Text style={styles.hint}>This will appear on your dashboard header</Text>
                    </View>

                    {/* Industry/Category */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Industry / Category</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Restaurant, Retail, Hospitality"
                            value={industry}
                            onChangeText={setIndustry}
                            editable={!loading}
                        />
                    </View>

                    {/* Business Address */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Business Address <Text style={styles.required}>*</Text>
                        </Text>
                        <AddressAutocomplete
                            value={businessAddress}
                            onChangeText={setBusinessAddress}
                            onSelectAddress={setBusinessAddress}
                            placeholder="Full business address&#10;Street, City, Postal Code, Country"
                            editable={!loading}
                        />
                        <Text style={styles.hint}>This will be used as default location for shifts</Text>
                    </View>

                    {/* Logo URL */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Company Logo URL</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="https://example.com/logo.png"
                            value={logoUrl}
                            onChangeText={setLogoUrl}
                            keyboardType="url"
                            autoCapitalize="none"
                            editable={!loading}
                        />
                        <Text style={styles.hint}>Direct link to your logo image</Text>
                    </View>

                    {/* Complete Button */}
                    <TouchableOpacity
                        style={[styles.completeButton, loading && styles.buttonDisabled]}
                        onPress={handleCompleteProfile}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.completeButtonText}>Complete Profile</Text>
                        )}
                    </TouchableOpacity>

                    {/* Logout Option */}
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={async () => {
                            await supabase.auth.signOut();
                        }}
                        disabled={loading}
                    >
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    responsiveWrapper: {
        flex: 1,
        maxWidth: Platform.OS === 'web' ? 600 : undefined,
        alignSelf: 'center',
        width: '100%',
    },
    header: {
        backgroundColor: '#007AFF',
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 70 : Platform.OS === 'web' ? 30 : 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    infoBox: {
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    infoIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#1565C0',
        lineHeight: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    required: {
        color: '#FF3B30',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#000',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    hint: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    completeButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 12,
    },
    completeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        padding: 16,
        alignItems: 'center',
    },
    logoutText: {
        color: '#666',
        fontSize: 14,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
