import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    Alert,
    TextInput,
    Switch,
    ActivityIndicator,
} from 'react-native';
import { supabase } from '../../api/supabase';

type ExperienceLevel = 'entry' | 'pro' | 'expert';

type PreferencesModalProps = {
    visible: boolean;
    onClose: () => void;
    userId: string;
};

export default function PreferencesModal({ visible, onClose, userId }: PreferencesModalProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [defaultExperience, setDefaultExperience] = useState<ExperienceLevel>('entry');
    const [defaultUniform, setDefaultUniform] = useState('');
    const [defaultPPE, setDefaultPPE] = useState(false);

    useEffect(() => {
        if (visible) {
            loadPreferences();
        }
    }, [visible]);

    const loadPreferences = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('business_profiles')
                .select('default_min_experience, default_uniform_instructions, default_ppe_required')
                .eq('user_id', userId)
                .single();

            if (error) {
                console.error('Error loading preferences:', error);
            } else if (data) {
                setDefaultExperience((data.default_min_experience as ExperienceLevel) || 'entry');
                setDefaultUniform(data.default_uniform_instructions || '');
                setDefaultPPE(data.default_ppe_required || false);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const { error } = await supabase
                .from('business_profiles')
                .update({
                    default_min_experience: defaultExperience,
                    default_uniform_instructions: defaultUniform.trim() || null,
                    default_ppe_required: defaultPPE,
                })
                .eq('user_id', userId);

            if (error) {
                console.error('Error saving preferences:', error);
                Alert.alert('Error', 'Failed to save preferences');
            } else {
                Alert.alert('Success', 'Default preferences saved successfully!');
                onClose();
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    const getExperienceIcon = (level: ExperienceLevel) => {
        switch (level) {
            case 'entry': return '⭐';
            case 'pro': return '⭐⭐';
            case 'expert': return '⭐⭐⭐';
        }
    };

    const getExperienceLabel = (level: ExperienceLevel) => {
        switch (level) {
            case 'entry': return 'Entry Level (0-1 years)';
            case 'pro': return 'Professional (2-5 years)';
            case 'expert': return 'Expert (5+ years)';
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Default Shift Preferences</Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        style={styles.saveButton}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#007AFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Loading preferences...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.content}>
                        <Text style={styles.sectionDescription}>
                            Set default values that will auto-fill when creating new shifts. You can always change them per shift.
                        </Text>

                        {/* Experience Level Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Minimum Experience Level</Text>
                            <Text style={styles.sectionSubtitle}>
                                Choose the default minimum experience for your shifts
                            </Text>

                            <View style={styles.experienceButtons}>
                                {(['entry', 'pro', 'expert'] as ExperienceLevel[]).map((level) => (
                                    <TouchableOpacity
                                        key={level}
                                        style={[
                                            styles.experienceButton,
                                            defaultExperience === level && styles.experienceButtonActive,
                                        ]}
                                        onPress={() => setDefaultExperience(level)}
                                    >
                                        <Text style={styles.experienceIcon}>
                                            {getExperienceIcon(level)}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.experienceLabel,
                                                defaultExperience === level && styles.experienceLabelActive,
                                            ]}
                                        >
                                            {getExperienceLabel(level)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Uniform & PPE Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Uniform & PPE Requirements</Text>

                            <View style={styles.toggleRow}>
                                <View style={styles.toggleLabel}>
                                    <Text style={styles.toggleTitle}>PPE Required</Text>
                                    <Text style={styles.toggleSubtitle}>
                                        Safety equipment needed by default
                                    </Text>
                                </View>
                                <Switch
                                    value={defaultPPE}
                                    onValueChange={setDefaultPPE}
                                    trackColor={{ false: '#E5E7EB', true: '#34D399' }}
                                    thumbColor={Platform.OS === 'ios' ? '#fff' : defaultPPE ? '#10B981' : '#f4f3f4'}
                                />
                            </View>

                            <Text style={styles.inputLabel}>Default Uniform Instructions</Text>
                            <TextInput
                                style={styles.textArea}
                                value={defaultUniform}
                                onChangeText={setDefaultUniform}
                                placeholder="E.g., Full black attire (smart), non-slip shoes required"
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                            <Text style={styles.helperText}>
                                💡 Common templates: "Full Black (Smart)", "Casual (Clean)", "Safety Gear Provided"
                            </Text>
                        </View>

                        <View style={styles.infoBox}>
                            <Text style={styles.infoIcon}>ℹ️</Text>
                            <Text style={styles.infoText}>
                                These defaults will automatically fill in when you create a new shift, saving you time.
                                You can always modify them for individual shifts.
                            </Text>
                        </View>
                    </ScrollView>
                )}
            </View>
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
        minWidth: 60,
        alignItems: 'flex-end',
    },
    saveButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionDescription: {
        fontSize: 15,
        color: '#6B7280',
        marginBottom: 24,
        lineHeight: 22,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    experienceButtons: {
        gap: 12,
    },
    experienceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    experienceButtonActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#6366F1',
    },
    experienceIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    experienceLabel: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    experienceLabelActive: {
        color: '#4F46E5',
        fontWeight: '600',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 8,
    },
    toggleLabel: {
        flex: 1,
        marginRight: 12,
    },
    toggleTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 2,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    toggleSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    textArea: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: '#111827',
        minHeight: 100,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    helperText: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 8,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        borderRadius: 10,
        padding: 16,
        marginTop: 8,
        marginBottom: 20,
    },
    infoIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#1E40AF',
        lineHeight: 20,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
});
