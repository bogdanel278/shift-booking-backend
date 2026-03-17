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

type CompanyDetailsModalProps = {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    userId: string;
};

export default function CompanyDetailsModal({ visible, onClose, onSave, userId }: CompanyDetailsModalProps) {
    const [loading, setLoading] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [legalName, setLegalName] = useState('');
    const [description, setDescription] = useState('');
    const [website, setWebsite] = useState('');
    const [taxId, setTaxId] = useState('');

    useEffect(() => {
        if (visible) {
            loadData();
        }
    }, [visible]);

    const loadData = async () => {
        try {
            const { data } = await supabase
                .from('business_profiles')
                .select('company_name, description, website_url, tax_id')
                .eq('user_id', userId)
                .single();

            if (data) {
                setCompanyName(data.company_name || '');
                setLegalName(data.company_name || ''); // Using same for now
                setDescription(data.description || '');
                setWebsite(data.website_url || '');
                setTaxId(data.tax_id || '');
            }
        } catch (error) {
            console.error('Error loading company details:', error);
        }
    };

    const handleSave = async () => {
        if (!companyName.trim()) {
            Alert.alert('Error', 'Company name is required');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('business_profiles')
                .update({
                    company_name: companyName.trim(),
                    description: description.trim() || null,
                    website_url: website.trim() || null,
                    tax_id: taxId.trim() || null,
                })
                .eq('user_id', userId);

            if (error) throw error;

            Alert.alert('Success', 'Company details updated successfully!');
            onSave();
            onClose();
        } catch (error: any) {
            console.error('Error updating company details:', error);
            Alert.alert('Error', error.message || 'Failed to update company details');
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
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Company Details</Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveButton}>
                        <Text style={[styles.saveButtonText, loading && styles.saveButtonTextDisabled]}>
                            {loading ? 'Saving...' : 'Save'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Trading Name <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={companyName}
                                onChangeText={setCompanyName}
                                placeholder="Your Business Name"
                                placeholderTextColor="#9CA3AF"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Legal Name</Text>
                            <TextInput
                                style={styles.input}
                                value={legalName}
                                onChangeText={setLegalName}
                                placeholder="Legal Entity Name"
                                placeholderTextColor="#9CA3AF"
                                editable={!loading}
                            />
                            <Text style={styles.hint}>Optional: Full registered business name</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Brief description of your business"
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Additional Details</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Website</Text>
                            <TextInput
                                style={styles.input}
                                value={website}
                                onChangeText={setWebsite}
                                placeholder="https://example.com"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="url"
                                autoCapitalize="none"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Tax ID / VAT Number</Text>
                            <TextInput
                                style={styles.input}
                                value={taxId}
                                onChangeText={setTaxId}
                                placeholder="GB123456789"
                                placeholderTextColor="#9CA3AF"
                                editable={!loading}
                            />
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
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    required: {
        color: '#DC2626',
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
