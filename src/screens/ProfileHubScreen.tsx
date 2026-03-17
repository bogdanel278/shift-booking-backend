import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Platform,
    Alert,
    ScrollView,
} from 'react-native';
import { supabase } from '../api/supabase';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/MainNavigator';
import CompanyDetailsModal from '../components/modals/CompanyDetailsModal';
import LocationModal from '../components/modals/LocationModal';
import PreferencesModal from '../components/modals/PreferencesModal';
import SecurityModal from '../components/modals/SecurityModal';
import VerificationModal from '../components/modals/VerificationModal';

type ProfileHubScreenProps = {
    navigation: BottomTabNavigationProp<MainTabParamList, 'Profile'>;
};

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

type SettingsTile = {
    id: string;
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    badge?: {
        text: string;
        color: string;
    };
};

export default function ProfileHubScreen({ navigation }: ProfileHubScreenProps) {
    const [loading, setLoading] = useState(true);
    const [companyName, setCompanyName] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [industry, setIndustry] = useState('');
    const [memberSince, setMemberSince] = useState('2026');
    const [totalShifts, setTotalShifts] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('unverified');

    // Modal states
    const [showCompanyDetailsModal, setShowCompanyDetailsModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    useEffect(() => {
        loadProfile();
        loadStats();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUserId(user.id);

            const { data: profile } = await supabase
                .from('business_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (profile) {
                setCompanyName(profile.company_name || 'Your Business');
                setLogoUrl(profile.logo_url);
                setIndustry(profile.business_type || 'Industry');
                setVerificationStatus(profile.v_status || 'unverified');

                // Extract year from created_at
                if (profile.created_at) {
                    const year = new Date(profile.created_at).getFullYear();
                    setMemberSince(year.toString());
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: shifts, count } = await supabase
                .from('shifts')
                .select('*', { count: 'exact', head: true })
                .eq('business_id', user.id);

            setTotalShifts(count || 0);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await supabase.auth.signOut();
                    },
                },
            ]
        );
    };

    const getInitials = () => {
        if (!companyName) return '?';
        return companyName
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getVerificationBadge = () => {
        switch (verificationStatus) {
            case 'verified':
                return { text: 'Verified', color: '#4CAF50' };
            case 'pending':
                return { text: 'Pending', color: '#FF9800' };
            case 'rejected':
                return { text: 'Rejected', color: '#F44336' };
            default:
                return { text: 'Not Verified', color: '#F44336' };
        }
    };

    const settingsTiles: SettingsTile[] = [
        {
            id: 'verification',
            icon: '🔐',
            title: 'Business Verification',
            subtitle: 'Verify identity and upload insurance',
            onPress: () => setShowVerificationModal(true),
            badge: getVerificationBadge(),
        },
        {
            id: 'company',
            icon: '🏢',
            title: 'Company Details',
            subtitle: 'Trading name, description, website',
            onPress: () => setShowCompanyDetailsModal(true),
        },
        {
            id: 'location',
            icon: '📍',
            title: 'Primary Location',
            subtitle: 'Business address and directions',
            onPress: () => setShowLocationModal(true),
        },
        {
            id: 'preferences',
            icon: '⚙️',
            title: 'Preferences',
            subtitle: 'Default rates and shift settings',
            onPress: () => setShowPreferencesModal(true),
        },
        {
            id: 'security',
            icon: '🔒',
            title: 'Account Security',
            subtitle: 'Email, password, authentication',
            onPress: () => setShowSecurityModal(true),
        },
    ];

    const renderHeader = () => (
        <View style={styles.headerSection}>
            {/* Logo and Company Info */}
            <View style={styles.companyHeader}>
                <View style={styles.logoContainer}>
                    {logoUrl ? (
                        <Image source={{ uri: logoUrl }} style={styles.logo} />
                    ) : (
                        <View style={[styles.logo, styles.logoPlaceholder]}>
                            <Text style={styles.logoText}>{getInitials()}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.companyInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.companyName}>{companyName}</Text>
                        <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedIcon}>✓</Text>
                        </View>
                    </View>
                    <Text style={styles.industry}>{industry}</Text>
                    <Text style={styles.memberSince}>Member since {memberSince}</Text>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{totalShifts}</Text>
                    <Text style={styles.statLabel}>Total Shifts</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>4.8</Text>
                    <Text style={styles.statLabel}>Avg Rating</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>-</Text>
                    <Text style={styles.statLabel}>Active Workers</Text>
                </View>
            </View>
        </View>
    );

    const renderSettingsTile = ({ item }: { item: SettingsTile }) => (
        <TouchableOpacity style={styles.tile} onPress={item.onPress}>
            <View style={styles.tileLeft}>
                <View style={styles.tileIcon}>
                    <Text style={styles.tileIconText}>{item.icon}</Text>
                </View>
                <View style={styles.tileContent}>
                    <View style={styles.tileTitleRow}>
                        <Text style={styles.tileTitle}>{item.title}</Text>
                        {item.badge && (
                            <View style={[styles.badge, { backgroundColor: item.badge.color }]}>
                                <Text style={styles.badgeText}>{item.badge.text}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.tileSubtitle}>{item.subtitle}</Text>
                </View>
            </View>
            <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
    );

    const renderFooter = () => (
        <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>Version 1.0.0</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.responsiveWrapper}>
                {renderHeader()}

                <FlatList
                    data={settingsTiles}
                    renderItem={renderSettingsTile}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListFooterComponent={renderFooter}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Modals */}
            {userId && (
                <>
                    <VerificationModal
                        visible={showVerificationModal}
                        onClose={() => setShowVerificationModal(false)}
                        onVerificationSubmitted={() => {
                            loadProfile();
                        }}
                        userId={userId}
                    />
                    <CompanyDetailsModal
                        visible={showCompanyDetailsModal}
                        onClose={() => setShowCompanyDetailsModal(false)}
                        onSave={() => {
                            loadProfile();
                            setShowCompanyDetailsModal(false);
                        }}
                        userId={userId}
                    />
                    <LocationModal
                        visible={showLocationModal}
                        onClose={() => setShowLocationModal(false)}
                        onSave={() => {
                            loadProfile();
                            setShowLocationModal(false);
                        }}
                        userId={userId}
                    />
                    <PreferencesModal
                        visible={showPreferencesModal}
                        onClose={() => setShowPreferencesModal(false)}
                        userId={userId}
                    />
                    <SecurityModal
                        visible={showSecurityModal}
                        onClose={() => setShowSecurityModal(false)}
                        userId={userId}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        alignItems: 'center',
    },
    responsiveWrapper: {
        flex: 1,
        width: '100%',
        maxWidth: Platform.OS === 'web' ? 800 : undefined,
    },
    headerSection: {
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    companyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoContainer: {
        marginRight: 16,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    logoPlaceholder: {
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    companyInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
        marginRight: 8,
    },
    verifiedBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifiedIcon: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    industry: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    memberSince: {
        fontSize: 14,
        color: '#9CA3AF',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E5E7EB',
    },
    listContent: {
        padding: 16,
    },
    tile: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    tileLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    tileIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    tileIconText: {
        fontSize: 20,
    },
    tileContent: {
        flex: 1,
    },
    tileTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    tileTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
        textTransform: 'uppercase',
    },
    tileSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    chevron: {
        fontSize: 24,
        color: '#D1D5DB',
        fontWeight: '300',
    },
    footer: {
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        alignItems: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FEE2E2',
        marginBottom: 16,
        minWidth: 200,
        justifyContent: 'center',
    },
    logoutIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#DC2626',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
});
