import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../api/supabase';
import { ShiftInsert } from '../types/database';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/MainNavigator';
import AddressAutocomplete from '../components/AddressAutocomplete';

type CreateShiftScreenProps = {
    navigation: BottomTabNavigationProp<MainTabParamList, 'PostShift'>;
};

export default function CreateShiftScreen({ navigation }: CreateShiftScreenProps) {
    // Verification status
    const [verificationStatus, setVerificationStatus] = useState<'unverified' | 'pending' | 'verified' | 'rejected' | null>(null);
    const [checkingVerification, setCheckingVerification] = useState(true);

    // Form fields
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(Date.now() + 4 * 60 * 60 * 1000)); // Default 4 hours later
    const [payRate, setPayRate] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // Location management
    const [useDifferentLocation, setUseDifferentLocation] = useState(false);
    const [businessAddress, setBusinessAddress] = useState('');
    const [fetchingAddress, setFetchingAddress] = useState(true);

    // Date/Time picker visibility
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    // Check verification status and fetch business address on mount
    useEffect(() => {
        checkVerificationAndFetchAddress();
    }, []);

    const checkVerificationAndFetchAddress = async () => {
        try {
            setCheckingVerification(true);
            setFetchingAddress(true);

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setCheckingVerification(false);
                setFetchingAddress(false);
                return;
            }

            // Fetch verification status and business address
            const { data, error } = await supabase
                .from('business_profiles')
                .select('v_status, business_address')
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setVerificationStatus(data?.v_status || 'unverified');

                if (data?.business_address) {
                    setBusinessAddress(data.business_address);
                    setLocation(data.business_address);
                }
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        } finally {
            setCheckingVerification(false);
            setFetchingAddress(false);
        }
    };

    const handleDurationButtonPress = (hours: number) => {
        const newEndDate = new Date(startDate.getTime() + hours * 60 * 60 * 1000);
        setEndDate(newEndDate);
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            // Keep the same time, just change the date
            const newDate = new Date(selectedDate);
            newDate.setHours(startDate.getHours(), startDate.getMinutes());
            setStartDate(newDate);

            // Adjust end date to maintain duration
            const duration = endDate.getTime() - startDate.getTime();
            setEndDate(new Date(newDate.getTime() + duration));
        }
    };

    const onStartTimeChange = (event: any, selectedDate?: Date) => {
        setShowStartTimePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);

            // Auto-adjust end time if it's now before start time
            if (endDate <= selectedDate) {
                setEndDate(new Date(selectedDate.getTime() + 4 * 60 * 60 * 1000));
            }
        }
    };

    const onEndTimeChange = (event: any, selectedDate?: Date) => {
        setShowEndTimePicker(false);
        if (selectedDate) {
            // Validate end time is after start time
            if (selectedDate <= startDate) {
                Alert.alert('Invalid Time', 'End time must be after start time');
                return;
            }
            setEndDate(selectedDate);
        }
    };

    const handleCreateShift = async () => {
        // Validation
        if (!title || !payRate || !location) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        // Validate date is not in the past
        const now = new Date();
        if (startDate < now) {
            Alert.alert('Invalid Date', 'Cannot create a shift in the past');
            return;
        }

        // Validate end time is after start time
        if (endDate <= startDate) {
            Alert.alert('Invalid Time', 'End time must be after start time');
            return;
        }

        const rate = parseFloat(payRate);
        if (isNaN(rate) || rate <= 0) {
            Alert.alert('Error', 'Please enter a valid pay rate');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert('Error', 'You must be logged in to create a shift');
                setLoading(false);
                return;
            }

            // Build the shift insert object
            const shiftData: ShiftInsert = {
                business_id: user.id,
                title: title.trim(),
                location: location.trim(),
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
                pay_rate: rate,
                description: description.trim() || null,
                status: 'open',
            };

            const { data, error } = await supabase
                .from('shifts')
                .insert(shiftData)
                .select()
                .single();

            if (error) {
                console.error('❌ Error creating shift:', error);
                Alert.alert('Error', `Failed to create shift: ${error.message}`);
            } else {
                Alert.alert(
                    'Success',
                    'Shift created successfully!',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error('💥 Unexpected error:', error);
            Alert.alert('Error', 'An unexpected error occurred: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // HARD GUARD: Show verification required screen if not verified
    if (checkingVerification) {
        return (
            <View style={styles.container}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Checking verification status...</Text>
                </View>
            </View>
        );
    }

    if (verificationStatus !== 'verified') {
        return (
            <View style={styles.container}>
                <View style={styles.responsiveWrapper}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.cancelButton}>Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Create Shift</Text>
                        <View style={{ width: 60 }} />
                    </View>

                    <View style={styles.blockedContainer}>
                        <Text style={styles.lockIcon}>�</Text>
                        <Text style={styles.blockedTitle}>Verification Required</Text>
                        <Text style={styles.blockedMessage}>
                            You must complete business verification before you can post shifts.
                        </Text>
                        <Text style={styles.blockedSubMessage}>
                            This helps us ensure all shifts are posted by legitimate businesses.
                        </Text>

                        <TouchableOpacity
                            style={styles.verifyButton}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <Text style={styles.verifyButtonText}>Go to Verification</Text>
                        </TouchableOpacity>

                        {verificationStatus === 'pending' && (
                            <View style={styles.pendingBox}>
                                <Text style={styles.pendingText}>
                                    ⏳ Your verification is pending review
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.responsiveWrapper}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Shift</Text>
                    <View style={{ width: 60 }} />
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                    {/* Title */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Shift Title / Position <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Server, Barista, Cook"
                            value={title}
                            onChangeText={setTitle}
                            editable={!loading}
                        />
                    </View>

                    {/* Location */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Location <Text style={styles.required}>*</Text>
                        </Text>

                        {fetchingAddress ? (
                            <View style={[styles.input, styles.loadingContainer]}>
                                <ActivityIndicator size="small" color="#007AFF" />
                                <Text style={styles.loadingText}>Loading business address...</Text>
                            </View>
                        ) : !useDifferentLocation && businessAddress ? (
                            <>
                                <View style={styles.prefilledLocationContainer}>
                                    <Text style={styles.prefilledLocationText}>{businessAddress}</Text>
                                    <Text style={styles.prefilledLocationLabel}>📍 Your business address</Text>
                                </View>
                                <TouchableOpacity onPress={() => setUseDifferentLocation(true)}>
                                    <Text style={styles.linkText}>Use different location for this shift</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <AddressAutocomplete
                                    value={location}
                                    onChangeText={setLocation}
                                    onSelectAddress={setLocation}
                                    placeholder="Enter shift location"
                                    editable={!loading}
                                />
                                {businessAddress && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setUseDifferentLocation(false);
                                            setLocation(businessAddress);
                                        }}
                                    >
                                        <Text style={styles.linkText}>← Use business address instead</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>

                    {/* Date Picker */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Date <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.dateTimeButton}
                            onPress={() => setShowDatePicker(true)}
                            disabled={loading}
                        >
                            <Text style={styles.dateTimeIcon}>📅</Text>
                            <Text style={styles.dateTimeText}>{formatDate(startDate)}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                                minimumDate={new Date()}
                            />
                        )}
                    </View>

                    {/* Start Time Picker */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Start Time <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.dateTimeButton}
                            onPress={() => setShowStartTimePicker(true)}
                            disabled={loading}
                        >
                            <Text style={styles.dateTimeIcon}>🕐</Text>
                            <Text style={styles.dateTimeText}>{formatTime(startDate)}</Text>
                        </TouchableOpacity>
                        {showStartTimePicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onStartTimeChange}
                            />
                        )}
                    </View>

                    {/* End Time Picker */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            End Time <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.dateTimeButton}
                            onPress={() => setShowEndTimePicker(true)}
                            disabled={loading}
                        >
                            <Text style={styles.dateTimeIcon}>🕐</Text>
                            <Text style={styles.dateTimeText}>{formatTime(endDate)}</Text>
                        </TouchableOpacity>
                        {showEndTimePicker && (
                            <DateTimePicker
                                value={endDate}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onEndTimeChange}
                                minimumDate={startDate}
                            />
                        )}

                        {/* Quick Duration Buttons */}
                        <View style={styles.durationButtonsContainer}>
                            <TouchableOpacity
                                style={styles.durationButton}
                                onPress={() => handleDurationButtonPress(4)}
                                disabled={loading}
                            >
                                <Text style={styles.durationButtonText}>4 Hours</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.durationButton}
                                onPress={() => handleDurationButtonPress(8)}
                                disabled={loading}
                            >
                                <Text style={styles.durationButtonText}>8 Hours</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.durationButton}
                                onPress={() => handleDurationButtonPress(12)}
                                disabled={loading}
                            >
                                <Text style={styles.durationButtonText}>12 Hours</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.hint}>
                            Duration: {Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60) * 10) / 10} hours
                        </Text>
                    </View>

                    {/* Pay Rate */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Pay Rate ($/hour) <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 25.00"
                            value={payRate}
                            onChangeText={setPayRate}
                            keyboardType="decimal-pad"
                            editable={!loading}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Description (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Any additional details about the shift..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            editable={!loading}
                        />
                    </View>

                    {/* Create Button */}
                    <TouchableOpacity
                        style={[styles.createButton, loading && styles.buttonDisabled]}
                        onPress={handleCreateShift}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.createButtonText}>Create Shift</Text>
                        )}
                    </TouchableOpacity>

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            ℹ️ This shift will be posted immediately and visible to workers.
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    },
    responsiveWrapper: {
        flex: 1,
        width: '100%',
        maxWidth: Platform.OS === 'web' ? 800 : undefined,
        alignSelf: 'center',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
    },
    blockedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    lockIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    blockedTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    blockedMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 24,
    },
    blockedSubMessage: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    verifyButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 48,
        marginBottom: 16,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    pendingBox: {
        backgroundColor: '#FFF3CD',
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
    },
    pendingText: {
        fontSize: 14,
        color: '#856404',
        textAlign: 'center',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'ios' ? 60 : Platform.OS === 'web' ? 20 : 20,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cancelButton: {
        color: '#007AFF',
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    required: {
        color: '#FF3B30',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    dateTimeButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateTimeIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    dateTimeText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    durationButtonsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    durationButton: {
        flex: 1,
        backgroundColor: '#E3F2FD',
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    durationButtonText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    hint: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        fontStyle: 'italic',
    },
    createButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    infoBox: {
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        padding: 12,
        marginTop: 20,
    },
    infoText: {
        fontSize: 14,
        color: '#1976D2',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    prefilledLocationContainer: {
        backgroundColor: '#f0f8ff',
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    prefilledLocationText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    prefilledLocationLabel: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '500',
    },
    linkText: {
        fontSize: 14,
        color: '#007AFF',
        marginTop: 8,
        textDecorationLine: 'underline',
    },
});
