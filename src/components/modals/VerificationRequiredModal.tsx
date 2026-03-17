import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';

type VerificationRequiredModalProps = {
    visible: boolean;
    onClose: () => void;
    onGoToVerification: () => void;
};

export default function VerificationRequiredModal({
    visible,
    onClose,
    onGoToVerification,
}: VerificationRequiredModalProps) {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>🔒</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Verification Required</Text>

                    {/* Message */}
                    <Text style={styles.message}>
                        To ensure safety and trust on our platform, all businesses must complete identity verification and provide proof of insurance before posting shifts.
                    </Text>

                    {/* Features List */}
                    <View style={styles.featuresList}>
                        <FeatureItem icon="✓" text="Verify your business identity" />
                        <FeatureItem icon="✓" text="Upload insurance certificate" />
                        <FeatureItem icon="✓" text="Get verified in 24-48 hours" />
                    </View>

                    {/* Action Buttons */}
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={onGoToVerification}
                    >
                        <Text style={styles.primaryButtonText}>
                            Complete Verification
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={onClose}
                    >
                        <Text style={styles.secondaryButtonText}>Not Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
    return (
        <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <Text style={styles.featureText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 28,
        width: '100%',
        maxWidth: 400,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    icon: {
        fontSize: 64,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111',
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    featuresList: {
        marginBottom: 28,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureIcon: {
        fontSize: 18,
        color: '#4CAF50',
        marginRight: 12,
        fontWeight: '700',
    },
    featureText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
    },
    primaryButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        padding: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 15,
        fontWeight: '600',
    },
});
