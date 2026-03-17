import React, { useState } from 'react';
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
import { supabase } from '../api/supabase';
import { ShiftInsert } from '../types/database';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';

type CreateShiftScreenProps = {
    navigation: NativeStackNavigationProp<AppStackParamList, 'CreateShift'>;
};

export default function CreateShiftScreen({ navigation }: CreateShiftScreenProps) {
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [payRate, setPayRate] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateShift = async () => {
        // Validation
        if (!title || !startDate || !startTime || !endTime || !payRate || !location) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const rate = parseFloat(payRate);
        if (isNaN(rate) || rate <= 0) {
            Alert.alert('Error', 'Please enter a valid pay rate');
            return;
        }

        setLoading(true);
        try {
            // Get current user's ID
            const { data: { user } } = await supabase.auth.getUser();

            console.log('👤 Current user:', { id: user?.id, email: user?.email });

            if (!user) {
                Alert.alert('Error', 'You must be logged in to create a shift');
                setLoading(false);
                return;
            }

            // Combine date and time into ISO strings for PostgreSQL timestamp
            const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
            const endDateTime = new Date(`${startDate}T${endTime}`).toISOString();

            // Build the shift insert object matching database columns
            const shiftData: ShiftInsert = {
                business_id: user.id, // CRITICAL: Link shift to logged-in employer
                title: title.trim(),
                location: location.trim(),
                start_time: startDateTime,
                end_time: endDateTime,
                pay_rate: rate,
                description: description.trim() || null,
                status: 'open', // Default status
            };

            console.log('📤 Attempting to create shift with data:', shiftData);

            // Insert into shifts table
            const { data, error } = await supabase
                .from('shifts')
                .insert(shiftData)
                .select()
                .single();

            console.log('📥 Shift creation response:', {
                success: !!data,
                error: error?.message,
                errorDetails: error?.details,
                errorHint: error?.hint,
                code: error?.code
            });

            if (error) {
                console.error('❌ Error creating shift:', error);
                Alert.alert('Error', `Failed to create shift:\n\n${error.message}\n\nDetails: ${error.details || 'None'}\nHint: ${error.hint || 'None'}`);
            } else {
                console.log('✅ Shift created successfully:', data);
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

    return (
        <View style={styles.container}>
            {/* Responsive wrapper for web */}
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
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Downtown Restaurant, 123 Main St"
                            value={location}
                            onChangeText={setLocation}
                            editable={!loading}
                        />
                    </View>

                    {/* Date */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Date <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="YYYY-MM-DD (e.g., 2026-03-15)"
                            value={startDate}
                            onChangeText={setStartDate}
                            editable={!loading}
                        />
                        <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
                    </View>

                    {/* Start Time */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Start Time <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="HH:MM (e.g., 09:00)"
                            value={startTime}
                            onChangeText={setStartTime}
                            editable={!loading}
                        />
                        <Text style={styles.hint}>Format: HH:MM (24-hour)</Text>
                    </View>

                    {/* End Time */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            End Time <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="HH:MM (e.g., 17:00)"
                            value={endTime}
                            onChangeText={setEndTime}
                            editable={!loading}
                        />
                        <Text style={styles.hint}>Format: HH:MM (24-hour)</Text>
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
                            ℹ️ This shift will be linked to your business account and visible to workers.
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
        alignItems: 'center', // Center on web
    },
    responsiveWrapper: {
        flex: 1,
        width: '100%',
        maxWidth: Platform.OS === 'web' ? 800 : undefined, // Constrain width on web
        alignSelf: 'center',
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
});
