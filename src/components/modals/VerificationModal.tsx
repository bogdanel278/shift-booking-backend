import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Alert,
    ScrollView,
    Platform,
} from 'react-native';
import { supabase } from '../../api/supabase';
import { fetchCompanyData, formatCompanyAddress, isValidCompanyNumber } from '../../services/companiesHouseService';
import * as DocumentPicker from 'expo-document-picker';

type VerificationModalProps = {
    visible: boolean;
    onClose: () => void;
    onVerificationSubmitted: () => void;
    userId: string;
};

export default function VerificationModal({
    visible,
    onClose,
    onVerificationSubmitted,
    userId,
}: VerificationModalProps) {
    const [companyNumber, setCompanyNumber] = useState('');
    const [vatNumber, setVatNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingCompany, setFetchingCompany] = useState(false);
    const [insuranceDoc, setInsuranceDoc] = useState<{ name: string; uri: string } | null>(null);

    const handleFetchCompanyData = async () => {
        if (!companyNumber.trim()) {
            Alert.alert('Error', 'Please enter a company number');
            return;
        }

        if (!isValidCompanyNumber(companyNumber)) {
            Alert.alert('Invalid Format', 'Please enter a valid UK company number (8 digits or 2 letters + 6 digits)');
            return;
        }

        try {
            setFetchingCompany(true);

            const companyData = await fetchCompanyData(companyNumber);

            if (!companyData) {
                Alert.alert('Not Found', 'Company not found. Please check the number and try again.');
                return;
            }

            // Auto-fill profile with company data
            const address = formatCompanyAddress(companyData.registered_office_address);

            const { error } = await supabase
                .from('business_profiles')
                .update({
                    company_name: companyData.company_name,
                    trading_name: companyData.company_name,
                    business_address: address,
                    company_number: companyData.company_number,
                })
                .eq('user_id', userId);

            if (error) {
                console.error('Error updating profile:', error);
                Alert.alert('Error', 'Failed to update profile with company data');
                return;
            }

            Alert.alert(
                'Success',
                `Company details loaded:\n\n${companyData.company_name}\n${address}\n\nNow upload your insurance document.`
            );
        } catch (error) {
            console.error('Error fetching company:', error);
            Alert.alert('Error', 'Failed to fetch company data. Please try again.');
        } finally {
            setFetchingCompany(false);
        }
    };

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const file = result.assets[0];
                setInsuranceDoc({
                    name: file.name,
                    uri: file.uri,
                });
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const handleSubmitVerification = async () => {
        if (!companyNumber.trim()) {
            Alert.alert('Missing Information', 'Please enter your company number');
            return;
        }

        if (!insuranceDoc) {
            Alert.alert('Missing Document', 'Please upload your insurance certificate');
            return;
        }

        try {
            setLoading(true);

            // Upload insurance document to Supabase Storage
            const fileExt = insuranceDoc.name.split('.').pop();
            const fileName = `${userId}_${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            // Read file as blob for upload
            const response = await fetch(insuranceDoc.uri);
            const blob = await response.blob();

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('verification-docs')
                .upload(filePath, blob, {
                    contentType: 'application/pdf',
                    upsert: false,
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                Alert.alert('Upload Failed', 'Failed to upload insurance document');
                return;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('verification-docs')
                .getPublicUrl(filePath);

            // Update business profile with verification data
            const { error: updateError } = await supabase
                .from('business_profiles')
                .update({
                    company_number: companyNumber.trim().toUpperCase(),
                    vat_number: vatNumber.trim() || null,
                    insurance_doc_url: publicUrl,
                    v_status: 'pending',
                })
                .eq('user_id', userId);

            if (updateError) {
                console.error('Update error:', updateError);
                Alert.alert('Error', 'Failed to save verification data');
                return;
            }

            Alert.alert(
                'Verification Submitted',
                'Your documents have been submitted for review. We\'ll notify you once verification is complete (usually within 24-48 hours).',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            onVerificationSubmitted();
                            onClose();
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error submitting verification:', error);
            Alert.alert('Error', 'Failed to submit verification. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Business Verification</Text>
                    <TouchableOpacity onPress={onClose} disabled={loading}>
                        <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoIcon}>🔒</Text>
                        <Text style={styles.infoText}>
                            To ensure safety and trust, all businesses must verify their identity and provide proof of insurance.
                        </Text>
                    </View>

                    {/* Company Number Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>1. Company Information</Text>

                        <Text style={styles.label}>
                            Company Number <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={[styles.input, styles.inputGrow]}
                                placeholder="e.g., 12345678 or SC123456"
                                value={companyNumber}
                                onChangeText={setCompanyNumber}
                                autoCapitalize="characters"
                                editable={!loading && !fetchingCompany}
                            />
                            <TouchableOpacity
                                style={[styles.fetchButton, fetchingCompany && styles.buttonDisabled]}
                                onPress={handleFetchCompanyData}
                                disabled={loading || fetchingCompany}
                            >
                                {fetchingCompany ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.fetchButtonText}>Fetch</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.hint}>
                            Find your number at{' '}
                            <Text style={styles.link}>beta.companieshouse.gov.uk</Text>
                        </Text>

                        <Text style={styles.label}>VAT Number (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., GB123456789"
                            value={vatNumber}
                            onChangeText={setVatNumber}
                            autoCapitalize="characters"
                            editable={!loading}
                        />
                    </View>

                    {/* Insurance Document Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2. Insurance Certificate</Text>

                        <Text style={styles.label}>
                            Public Liability Insurance <Text style={styles.required}>*</Text>
                        </Text>
                        <Text style={styles.hint}>Upload a PDF of your current insurance certificate</Text>

                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={handlePickDocument}
                            disabled={loading}
                        >
                            <Text style={styles.uploadIcon}>📄</Text>
                            <Text style={styles.uploadText}>
                                {insuranceDoc ? insuranceDoc.name : 'Choose PDF File'}
                            </Text>
                        </TouchableOpacity>

                        {insuranceDoc && (
                            <View style={styles.filePreview}>
                                <Text style={styles.fileIcon}>✓</Text>
                                <Text style={styles.fileName}>{insuranceDoc.name}</Text>
                                <TouchableOpacity onPress={() => setInsuranceDoc(null)}>
                                    <Text style={styles.removeFile}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.buttonDisabled]}
                        onPress={handleSubmitVerification}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit for Verification</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.footerNote}>
                        Your documents will be securely reviewed within 24-48 hours.
                    </Text>
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
    },
    closeButton: {
        fontSize: 28,
        color: '#666',
        fontWeight: '300',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    infoBox: {
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    infoIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#1565C0',
        lineHeight: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 12,
    },
    required: {
        color: '#D32F2F',
    },
    inputRow: {
        flexDirection: 'row',
        gap: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#D0D0D0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#111',
    },
    inputGrow: {
        flex: 1,
    },
    fetchButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
    },
    fetchButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    hint: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    link: {
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
    uploadButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#007AFF',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    uploadText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    filePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
    },
    fileIcon: {
        fontSize: 18,
        color: '#4CAF50',
        marginRight: 8,
    },
    fileName: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    removeFile: {
        fontSize: 14,
        color: '#D32F2F',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    footerNote: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 16,
        fontStyle: 'italic',
    },
});
