import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    Alert,
} from 'react-native';
import { supabase } from '../../api/supabase';
import AddressAutocomplete from '../AddressAutocomplete';

type LocationModalProps = {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    userId: string;
};

export default function LocationModal({ visible, onClose, onSave, userId }: LocationModalProps) {
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postcode, setPostcode] = useState('');
    const [country, setCountry] = useState('');
    const [arrivalInstructions, setArrivalInstructions] = useState('');

    useEffect(() => {
        if (visible) {
            loadData();
        }
    }, [visible]);

    const loadData = async () => {
        try {
            const { data } = await supabase
                .from('business_profiles')
                .select('description')
                .eq('user_id', userId)
                .single();

            if (data && data.description) {
                // Parse description as address (for now)
                setAddress(data.description);
            }
        } catch (error) {
            console.error('Error loading location:', error);
        }
    };

    const handleSave = async () => {
        const fullAddress = [address, city, postcode, country]
            .filter(Boolean)
            .join(', ');

        setLoading(true);
        try {
            const { error } = await supabase
                .from('business_profiles')
                .update({
                    description: fullAddress || null,
                })
                .eq('user_id', userId);

            if (error) throw error;

            Alert.alert('Success', '✓ Location updated successfully!');
            onSave();
            onClose();
        } catch (error: any) {
            console.error('Error updating location:', error);
            Alert.alert('Error', error.message || 'Failed to update location');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Primary Location</Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveButton}>
                        <Text style={[styles.saveButtonText, loading && styles.saveButtonTextDisabled]}>
                            {loading ? 'Saving...' : 'Save'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Business Address</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Full Address</Text>
                            <AddressAutocomplete
                                value={address}
                                onChangeText={setAddress}
                                onSelectAddress={(addr) => {
                                    setAddress(addr);
                                    // Try to parse city from address
                                    const parts = addr.split(',');
                                    if (parts.length > 0) {
                                        setCity(parts[parts.length - 1].trim().replace(' UK', ''));
                                    }
                                }}
                                placeholder="123 High Street, City, Postcode"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>City</Text>
                            <TextInput
                                style={styles.input}
                                value={city}
                                onChangeText={setCity}
                                placeholder="London"
                                placeholderTextColor="#9CA3AF"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Postcode</Text>
                                <TextInput
                                    style={styles.input}
                                    value={postcode}
                                    onChangeText={setPostcode}
                                    placeholder="SW1A 1AA"
                                    placeholderTextColor="#9CA3AF"
                                    autoCapitalize="characters"
                                    editable={!loading}
                                />
                            </View>

                            <View style={[styles.formGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Country</Text>
                                <TextInput
                                    style={styles.input}
                                    value={country}
                                    onChangeText={setCountry}
                                    placeholder="United Kingdom"
                                    placeholderTextColor="#9CA3AF"
                                    editable={!loading}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Arrival Instructions</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Special Instructions</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={arrivalInstructions}
                                onChangeText={setArrivalInstructions}
                                placeholder="e.g., 'Enter through side door', 'Ask for manager'"
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                editable={!loading}
                            />
                            <Text style={styles.hint}>
                                Help workers find your location easily
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    closeButton: {
        padding: 4,
    },
    closeButtonText: {
        fontSize: 16,
        color: '#6B7280',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    saveButton: {
        padding: 4,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    saveButtonTextDisabled: {
        color: '#9CA3AF',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    formGroup: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#111827',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    hint: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
});
