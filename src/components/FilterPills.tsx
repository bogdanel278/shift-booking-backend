import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export type FilterOption = 'all' | 'open' | 'filled' | 'completed';

type FilterPillsProps = {
    selectedFilter: FilterOption;
    onFilterChange: (filter: FilterOption) => void;
    counts?: {
        all: number;
        open: number;
        filled: number;
        completed: number;
    };
};

export default function FilterPills({ selectedFilter, onFilterChange, counts }: FilterPillsProps) {
    const filters: Array<{ key: FilterOption; label: string; icon: string }> = [
        { key: 'all', label: 'All', icon: '📋' },
        { key: 'open', label: 'Live', icon: '🟢' },
        { key: 'filled', label: 'Pending', icon: '🟡' },
        { key: 'completed', label: 'Completed', icon: '✅' },
    ];

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {filters.map((filter) => {
                    const isSelected = selectedFilter === filter.key;
                    const count = counts ? counts[filter.key] : 0;

                    return (
                        <TouchableOpacity
                            key={filter.key}
                            style={[
                                styles.pill,
                                isSelected && styles.pillSelected,
                            ]}
                            onPress={() => onFilterChange(filter.key)}
                        >
                            <Text style={styles.pillIcon}>{filter.icon}</Text>
                            <Text style={[
                                styles.pillText,
                                isSelected && styles.pillTextSelected,
                            ]}>
                                {filter.label}
                            </Text>
                            {counts && count > 0 && (
                                <View style={[
                                    styles.badge,
                                    isSelected && styles.badgeSelected,
                                ]}>
                                    <Text style={[
                                        styles.badgeText,
                                        isSelected && styles.badgeTextSelected,
                                    ]}>
                                        {count}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    pillSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    pillIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    pillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    pillTextSelected: {
        color: '#fff',
    },
    badge: {
        backgroundColor: '#fff',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
        paddingHorizontal: 6,
    },
    badgeSelected: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    badgeTextSelected: {
        color: '#fff',
    },
});
