import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type ShiftCardProps = {
    jobTitle: string;
    date: string;
    hourlyRate: number;
    location?: string;
    status?: string;
    onPress?: () => void;
    onDuplicate?: () => void;
    onViewApplicants?: () => void;
};

export default function ShiftCard({
    jobTitle,
    date,
    hourlyRate,
    location,
    status = 'open',
    onPress,
    onDuplicate,
    onViewApplicants,
}: ShiftCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
        });
    };

    const getStatusColor = () => {
        switch (status) {
            case 'open':
                return '#4CAF50';
            case 'filled':
                return '#FF9800';
            case 'completed':
                return '#2196F3';
            default:
                return '#9E9E9E';
        }
    };

    const CardContent = (
        <View style={styles.card}>
            {/* Header Row */}
            <View style={styles.headerRow}>
                <Text style={styles.jobTitle}>{jobTitle}</Text>
                <View style={[styles.dateBadge, { backgroundColor: getStatusColor() }]}>
                    <Text style={styles.dateText}>{formatDate(date)}</Text>
                </View>
            </View>

            {/* Details Row */}
            <View style={styles.detailsRow}>
                <View style={styles.rateContainer}>
                    <Text style={styles.rateLabel}>Hourly Rate</Text>
                    <Text style={styles.rateValue}>£{hourlyRate.toFixed(2)}/hr</Text>
                </View>
                {location && (
                    <View style={styles.locationContainer}>
                        <Text style={styles.locationIcon}>📍</Text>
                        <Text style={styles.locationText} numberOfLines={1}>
                            {location}
                        </Text>
                    </View>
                )}
            </View>

            {/* Status Badge and Quick Actions */}
            <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { borderColor: getStatusColor() }]}>
                    <Text style={[styles.statusText, { color: getStatusColor() }]}>
                        {status.toUpperCase()}
                    </Text>
                </View>

                {/* Quick Action Buttons */}
                <View style={styles.quickActions}>
                    {onViewApplicants && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                onViewApplicants();
                            }}
                        >
                            <Text style={styles.actionButtonIcon}>👥</Text>
                            <Text style={styles.actionButtonText}>Applicants</Text>
                        </TouchableOpacity>
                    )}
                    {onDuplicate && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                onDuplicate();
                            }}
                        >
                            <Text style={styles.actionButtonIcon}>📋</Text>
                            <Text style={styles.actionButtonText}>Duplicate</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {CardContent}
            </TouchableOpacity>
        );
    }

    return CardContent;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
        marginRight: 12,
    },
    dateBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    dateText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    rateContainer: {
        flex: 1,
    },
    rateLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    rateValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
    locationIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    locationText: {
        fontSize: 14,
        color: '#666',
        maxWidth: 120,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1.5,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    quickActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    actionButtonIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    actionButtonText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#333',
    },
});
