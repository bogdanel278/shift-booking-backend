import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    Alert,
    Platform,
    Dimensions,
} from 'react-native';
import { supabase } from '../api/supabase';
import { Shift } from '../types/database';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/MainNavigator';
import { useFocusEffect } from '@react-navigation/native';
import FlexHeader from '../components/FlexHeader';
import ShiftCard from '../components/ShiftCard';
import WelcomeCard from '../components/WelcomeCard';
import SkeletonLoader from '../components/SkeletonLoader';
import FilterPills, { FilterOption } from '../components/FilterPills';
import VerificationRequiredModal from '../components/modals/VerificationRequiredModal';

type DashboardScreenProps = {
    navigation: BottomTabNavigationProp<MainTabParamList, 'Home'>;
};

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [filteredShifts, setFilteredShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');

    // Business profile data
    const [tradingName, setTradingName] = useState('Business');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [profileComplete, setProfileComplete] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState<'unverified' | 'pending' | 'verified' | 'rejected'>('unverified');
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    // Get current user and load business profile
    useEffect(() => {
        const loadUserAndProfile = async () => {
            const { data } = await supabase.auth.getUser();
            if (data.user) {
                setUserId(data.user.id);

                // Load business profile for header
                const { data: profileData } = await supabase
                    .from('business_profiles')
                    .select('company_name, description, logo_url, v_status')
                    .eq('user_id', data.user.id)
                    .single();

                if (profileData) {
                    setTradingName(profileData.company_name || 'Business');
                    setLogoUrl(profileData.logo_url);
                    setVerificationStatus(profileData.v_status || 'unverified');

                    // Check if profile is complete (has both trading_name and business_address)
                    const isComplete = !!(profileData.company_name && profileData.description);
                    setProfileComplete(isComplete);
                }
            }
        };
        loadUserAndProfile();
    }, []);

    // Fetch shifts for the logged-in business
    const fetchShifts = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert('Error', 'Please log in to view shifts');
                return;
            }

            // Query shifts table where business_id matches the logged-in user's ID
            const { data, error } = await supabase
                .from('shifts')
                .select('*')
                .eq('business_id', user.id)
                .order('start_time', { ascending: false });

            if (error) {
                console.error('Error fetching shifts:', error);
                Alert.alert('Error', 'Failed to load shifts');
            } else {
                setShifts(data || []);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Filter shifts based on selected filter
    useEffect(() => {
        if (selectedFilter === 'all') {
            setFilteredShifts(shifts);
        } else {
            setFilteredShifts(shifts.filter(shift => shift.status === selectedFilter));
        }
    }, [shifts, selectedFilter]);

    // Calculate filter counts
    const getFilterCounts = () => {
        return {
            all: shifts.length,
            open: shifts.filter(s => s.status === 'open').length,
            filled: shifts.filter(s => s.status === 'filled').length,
            completed: shifts.filter(s => s.status === 'completed').length,
        };
    };

    // Fetch shifts on screen load and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchShifts();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchShifts();
    };

    const handleCreateShift = () => {
        // Check verification status first
        if (verificationStatus !== 'verified') {
            setShowVerificationModal(true);
            return;
        }

        if (!profileComplete) {
            Alert.alert(
                'Profile Incomplete',
                'Please complete your business profile (Trading Name and Business Address) before creating shifts.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Complete Profile', onPress: () => navigation.navigate('Profile') }
                ]
            );
            return;
        }
        navigation.navigate('PostShift');
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await supabase.auth.signOut();
                },
            },
        ]);
    };

    const handleShiftPress = (shift: Shift) => {
        // TODO: Navigate to shift details or show more info
        console.log('Shift pressed:', shift.id);
    };

    const handleDuplicateShift = async (shift: Shift) => {
        Alert.alert(
            'Duplicate Shift',
            `You can create a new shift based on "${shift.title}". We'll take you to the Post Shift screen where you can fill in the details.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Go to Post Shift',
                    onPress: () => {
                        // Navigate to PostShift tab
                        // TODO: In future, implement context to pre-fill data
                        navigation.navigate('PostShift');
                    }
                }
            ]
        );
    };

    const handleViewApplicants = (shift: Shift) => {
        // TODO: Navigate to applicants screen
        Alert.alert('View Applicants', `Viewing applicants for "${shift.title}"`);
    };

    const renderShiftCard = ({ item }: { item: Shift }) => (
        <ShiftCard
            jobTitle={item.title}
            date={item.start_time}
            hourlyRate={item.pay_rate}
            location={item.location || undefined}
            status={item.status || 'open'}
            onPress={() => handleShiftPress(item)}
            onDuplicate={() => handleDuplicateShift(item)}
            onViewApplicants={() => handleViewApplicants(item)}
        />
    );

    return (
        <View style={styles.container}>
            {/* Responsive wrapper for web - constrains max width on large screens */}
            <View style={styles.responsiveWrapper}>
                {/* Flex Header with Logo and Trading Name */}
                <FlexHeader
                    tradingName={tradingName}
                    logoUrl={logoUrl}
                    onLogout={handleLogout}
                />

                {/* Filter Pills */}
                {shifts.length > 0 && (
                    <FilterPills
                        selectedFilter={selectedFilter}
                        onFilterChange={setSelectedFilter}
                        counts={getFilterCounts()}
                    />
                )}

                {/* Loading State - Skeleton Loaders */}
                {loading && <SkeletonLoader />}

                {/* Empty State - Welcome Card */}
                {!loading && shifts.length === 0 && (
                    <WelcomeCard onCreateShift={handleCreateShift} />
                )}

                {/* Shifts List */}
                {!loading && shifts.length > 0 && (
                    <FlatList
                        data={filteredShifts}
                        renderItem={renderShiftCard}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        ListEmptyComponent={
                            selectedFilter !== 'all' ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateIcon}>�</Text>
                                    <Text style={styles.emptyStateTitle}>No {selectedFilter} shifts</Text>
                                    <Text style={styles.emptyStateText}>
                                        Try a different filter
                                    </Text>
                                </View>
                            ) : null
                        }
                    />
                )}

                {/* Floating Action Button - Create Shift (only show if not empty state) */}
                {shifts.length > 0 && (
                    <TouchableOpacity
                        style={[
                            styles.fab,
                            verificationStatus !== 'verified' && styles.fabDisabled
                        ]}
                        onPress={handleCreateShift}
                    >
                        <Text style={styles.fabIcon}>+</Text>
                    </TouchableOpacity>
                )}

                {/* Verification Required Modal */}
                <VerificationRequiredModal
                    visible={showVerificationModal}
                    onClose={() => setShowVerificationModal(false)}
                    onGoToVerification={() => {
                        setShowVerificationModal(false);
                        navigation.navigate('Profile');
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center', // Center content on web
    },
    responsiveWrapper: {
        flex: 1,
        width: '100%',
        maxWidth: Platform.OS === 'web' ? 1200 : undefined, // Constrain width on large screens
        alignSelf: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100, // Space for FAB
        ...(Platform.OS === 'web' && {
            paddingHorizontal: 32, // More padding on web
        }),
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyStateIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: Platform.OS === 'web' ? 32 : 20,
        bottom: Platform.OS === 'web' ? 32 : 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    fabDisabled: {
        backgroundColor: '#B0B0B0',
        opacity: 0.5,
    },
    fabIcon: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '300',
    },
});
