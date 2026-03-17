import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    Alert,
} from 'react-native';

type PreferencesModalProps = {
    visible: boolean;
    onClose: () => void;
    userId: string;
};

export default function PreferencesModal({ visible, onClose, userId }: PreferencesModalProps) {
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
                    <Text style={styles.headerTitle}>Preferences</Text>
                    <View style={{ width: 60 }} />
                </View>

                <ScrollView style={styles.content}>
                    <Text style={styles.comingSoon}>⚙️</Text>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                    <Text style={styles.comingSoonSubtext}>
                        Default pay rates and shift preferences will be available in the next update.
                    </Text>
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
    comingSoon: {
        fontSize: 64,
        textAlign: 'center',
        marginTop: 100,
        marginBottom: 24,
    },
    comingSoonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    comingSoonSubtext: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 24,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
});
