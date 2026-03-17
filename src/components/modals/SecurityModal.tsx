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
    Alert,
} from 'react-native';
import { supabase } from '../../api/supabase';

type SecurityModalProps = {
    visible: boolean;
    onClose: () => void;
    userId: string;
};

export default function SecurityModal({ visible, onClose, userId }: SecurityModalProps) {
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (visible) {
            loadEmail();
        }
    }, [visible]);

    const loadEmail = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || '');
            }
        } catch (error) {
            console.error('Error loading email:', error);
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Email not found');
            return;
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;

            Alert.alert(
                'Password Reset Email Sent',
                'Check your email for a link to reset your password.'
            );
        } catch (error: any) {
            console.error('Error sending reset email:', error);
            Alert.alert('Error', error.message || 'Failed to send reset email');
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
                    <Text style={styles.headerTitle}>Account Security</Text>
                    <View style={{ width: 60 }} />
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Email Address</Text>
                        <View style={styles.emailRow}>
                            <Text style={styles.emailText}>{email}</Text>
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>✓ Verified</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Password</Text>
                        <TouchableOpacity style={styles.actionButton} onPress={handleResetPassword}>
                            <Text style={styles.actionButtonIcon}>🔑</Text>
                            <Text style={styles.actionButtonText}>Reset Password</Text>
                        </TouchableOpacity>
                        <Text style={styles.hint}>
                            We'll send a password reset link to your email
                        </Text>
                    </View>
                </ScrollView>
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
    emailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    emailText: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    verifiedBadge: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    verifiedText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#059669',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    actionButtonIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    hint: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 8,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
});
