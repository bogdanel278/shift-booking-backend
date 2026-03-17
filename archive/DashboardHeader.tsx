import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Image,
} from 'react-native';

type DashboardHeaderProps = {
    tradingName: string;
    logoUrl?: string | null;
    shiftsCount: number;
    onProfilePress: () => void;
    onLogout: () => void;
};

export default function DashboardHeader({
    tradingName,
    logoUrl,
    shiftsCount,
    onProfilePress,
    onLogout,
}: DashboardHeaderProps) {
    return (
        <View style={styles.container}>
            {/* Left Section - Logo and Business Name */}
            <View style={styles.leftSection}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    {logoUrl ? (
                        <Image
                            source={{ uri: logoUrl }}
                            style={styles.logo}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.logo, styles.logoPlaceholder]}>
                            <Text style={styles.logoText}>
                                {tradingName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Business Info */}
                <View style={styles.businessInfo}>
                    <Text style={styles.tradingName} numberOfLines={1}>
                        {tradingName}
                    </Text>
                    <Text style={styles.shiftsCount}>
                        {shiftsCount} {shiftsCount === 1 ? 'shift' : 'shifts'}
                    </Text>
                </View>
            </View>

            {/* Right Section - Action Buttons */}
            <View style={styles.rightSection}>
                {/* Profile Details Button */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onProfilePress}
                >
                    <Text style={styles.actionButtonIcon}>⚙️</Text>
                    {Platform.OS === 'web' && (
                        <Text style={styles.actionButtonText}>Profile</Text>
                    )}
                </TouchableOpacity>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.actionButton, styles.logoutButton]}
                    onPress={onLogout}
                >
                    <Text style={styles.actionButtonIcon}>🚪</Text>
                    {Platform.OS === 'web' && (
                        <Text style={styles.actionButtonText}>Logout</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'ios' ? 50 : Platform.OS === 'web' ? 12 : 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 16,
    },
    logoContainer: {
        marginRight: 12,
    },
    logo: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    logoPlaceholder: {
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    businessInfo: {
        flex: 1,
    },
    tradingName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 2,
    },
    shiftsCount: {
        fontSize: 13,
        color: '#666',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: Platform.OS === 'web' ? 12 : 8,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        gap: 6,
    },
    logoutButton: {
        backgroundColor: '#FEE',
    },
    actionButtonIcon: {
        fontSize: 18,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
});
