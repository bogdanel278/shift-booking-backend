import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Image,
} from 'react-native';

type FlexHeaderProps = {
    tradingName: string;
    logoUrl?: string | null;
    onLogout: () => void;
};

export default function FlexHeader({
    tradingName,
    logoUrl,
    onLogout,
}: FlexHeaderProps) {
    return (
        <View style={styles.container}>
            {/* Left - Logo */}
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

            {/* Center - Trading Name */}
            <View style={styles.centerSection}>
                <Text style={styles.tradingName} numberOfLines={1}>
                    {tradingName}
                </Text>
            </View>

            {/* Right - Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'ios' ? 60 : Platform.OS === 'web' ? 12 : 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
    },
    logoContainer: {
        width: 50,
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
    centerSection: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    tradingName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
    },
    logoutButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: '#f0f0f0',
        minWidth: 70,
        alignItems: 'center',
    },
    logoutText: {
        color: '#FF3B30',
        fontSize: 14,
        fontWeight: '600',
    },
});
