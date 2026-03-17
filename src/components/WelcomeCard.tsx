import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type WelcomeCardProps = {
    onCreateShift: () => void;
};

export default function WelcomeCard({ onCreateShift }: WelcomeCardProps) {
    return (
        <View style={styles.container}>
            <View style={styles.welcomeCard}>
                <Text style={styles.emoji}>👋</Text>
                <Text style={styles.title}>Welcome to Your Dashboard!</Text>
                <Text style={styles.subtitle}>Get started in 3 simple steps:</Text>

                <View style={styles.stepsContainer}>
                    <View style={styles.step}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Post Your First Shift</Text>
                            <Text style={styles.stepDescription}>
                                Create a shift with job details, time, and pay rate
                            </Text>
                        </View>
                    </View>

                    <View style={styles.step}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Review Applicants</Text>
                            <Text style={styles.stepDescription}>
                                Qualified workers will apply to your shifts
                            </Text>
                        </View>
                    </View>

                    <View style={styles.step}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Confirm & Track</Text>
                            <Text style={styles.stepDescription}>
                                Accept workers and track shift completion
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.ctaButton} onPress={onCreateShift}>
                    <Text style={styles.ctaButtonText}>Post Your First Shift</Text>
                    <Text style={styles.ctaButtonIcon}>➕</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    welcomeCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        maxWidth: 500,
        width: '100%',
    },
    emoji: {
        fontSize: 48,
        textAlign: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    stepsContainer: {
        marginBottom: 24,
    },
    step: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    stepDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    ctaButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    ctaButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
    ctaButtonIcon: {
        fontSize: 20,
    },
});
