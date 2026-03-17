import React, { useState, useEffect } from 'react';
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
import { AppStackParamList } from '../navigation/AppNavigator';

type ProfileScreenProps = {
    navigation: NativeStackNavigationProp<AppStackParamList, 'Profile'>;
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // User info
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    // Business profile
    const [companyName, setCompanyName] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [taxId, setTaxId] = useState('');
    const [description, setDescription] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert('Error', 'Not authenticated');
                return;
            }

            // Load user data
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (userData) {
                setEmail(userData.email || '');
                setName(userData.name || '');
                setPhone(userData.phone || '');
            }

            // Load business profile
            const { data: businessData, error: businessError } = await supabase
                .from('business_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (businessData) {
                setCompanyName(businessData.company_name || '');
                setBusinessType(businessData.business_type || '');
                setTaxId(businessData.tax_id || '');
                setDescription(businessData.description || '');
                setWebsiteUrl(businessData.website_url || '');
                setLogoUrl(businessData.logo_url || '');
            }

            if (userError || businessError) {
                console.log('Profile not complete, user can fill it now');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!companyName.trim()) {
            Alert.alert('Error', 'Company name is required');
            return;
        }

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert('Error', 'Not authenticated');
                return;
            }

            // Update user table
            const { error: userError } = await supabase
                .from('users')
                .update({
                    name: name.trim() || companyName.trim(),
                    phone: phone.trim() || null,
                })
                .eq('id', user.id);

            if (userError) {
                console.error('Error updating user:', userError);
            }

            // Update or insert business profile
            const { error: profileError } = await supabase
                .from('business_profiles')
                .upsert({
                    user_id: user.id,
                    company_name: companyName.trim(),
                    business_type: businessType.trim() || null,
                    tax_id: taxId.trim() || null,
                    description: description.trim() || null,
                    website_url: websiteUrl.trim() || null,
                    logo_url: logoUrl.trim() || null,
                }, {
                    onConflict: 'user_id'
                });

            if (profileError) {
                console.error('Error updating business profile:', profileError);
                Alert.alert('Error', 'Failed to save profile: ' + profileError.message);
            } else {
                Alert.alert('Success', 'Profile updated successfully!');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await supabase.auth.signOut();
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Responsive wrapper for web */}
            <View style={styles.responsiveWrapper}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Business Profile</Text>
                    <View style={{ width: 60 }} />
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                    {/* Account Info Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account Information</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={[styles.input, styles.disabledInput]}
                                value={email}
                                editable={false}
                            />
                            <Text style={styles.hint}>Email cannot be changed</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Contact Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Your name"
                                value={name}
                                onChangeText={setName}
                                editable={!saving}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="+1 (555) 123-4567"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                editable={!saving}
                            />
                        </View>
                    </View>

                    {/* Business Info Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Business Details</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Trading Name / Company Name <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Your Company Ltd."
                                value={companyName}
                                onChangeText={setCompanyName}
                                editable={!saving}
                            />
                            <Text style={styles.hint}>This will appear on your dashboard</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Category / Business Type</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Restaurant, Retail, Hospitality"
                                value={businessType}
                                onChangeText={setBusinessType}
                                editable={!saving}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Business Address <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Full business address&#10;Street, City, Postal Code, Country"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                editable={!saving}
                            />
                            <Text style={styles.hint}>Required for profile completion</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Company Logo URL</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="https://example.com/logo.png"
                                value={logoUrl}
                                onChangeText={setLogoUrl}
                                keyboardType="url"
                                autoCapitalize="none"
                                editable={!saving}
                            />
                            <Text style={styles.hint}>Direct link to your logo (will appear in header)</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Tax ID / Business Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="XX-XXXXXXX"
                                value={taxId}
                                onChangeText={setTaxId}
                                editable={!saving}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Website URL</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="https://yourcompany.com"
                                value={websiteUrl}
                                onChangeText={setWebsiteUrl}
                                keyboardType="url"
                                autoCapitalize="none"
                                editable={!saving}
                            />
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, saving && styles.buttonDisabled]}
                        onPress={handleSaveProfile}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Profile</Text>
                        )}
                    </TouchableOpacity>

                    {/* Logout Button */}
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        disabled={saving}
                    >
                        <Text style={styles.logoutButtonText}>Logout</Text>
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
        maxWidth: Platform.OS === 'web' ? 800 : undefined,
        alignSelf: 'center',
        width: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: Platform.OS === 'ios' ? 60 : Platform.OS === 'web' ? 16 : 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 16,
    },
    formGroup: {
        marginBottom: 16,
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
    disabledInput: {
        backgroundColor: '#f0f0f0',
        color: '#999',
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
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FF3B30',
        marginBottom: 20,
    },
    logoutButtonText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
