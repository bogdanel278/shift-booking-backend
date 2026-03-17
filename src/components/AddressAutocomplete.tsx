import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    FlatList,
    Modal,
} from 'react-native';

type AddressAutocompleteProps = {
    value: string;
    onChangeText: (text: string) => void;
    onSelectAddress: (address: string) => void;
    placeholder?: string;
    editable?: boolean;
};

// Common UK addresses for quick selection (can be expanded)
const COMMON_UK_LOCATIONS = [
    'London, UK',
    'Manchester, UK',
    'Birmingham, UK',
    'Leeds, UK',
    'Glasgow, UK',
    'Liverpool, UK',
    'Edinburgh, UK',
    'Bristol, UK',
    'Sheffield, UK',
    'Newcastle, UK',
];

export default function AddressAutocomplete({
    value,
    onChangeText,
    onSelectAddress,
    placeholder = 'Enter business address',
    editable = true,
}: AddressAutocompleteProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

    const handleTextChange = (text: string) => {
        onChangeText(text);

        if (text.length > 2) {
            // Filter suggestions based on input
            const filtered = COMMON_UK_LOCATIONS.filter(location =>
                location.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSelectSuggestion = (suggestion: string) => {
        onSelectAddress(suggestion);
        setShowSuggestions(false);
    };

    const handleFocus = () => {
        if (value.length > 2) {
            const filtered = COMMON_UK_LOCATIONS.filter(location =>
                location.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={handleTextChange}
                onFocus={handleFocus}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                editable={editable}
                multiline={Platform.OS !== 'web'}
                numberOfLines={Platform.OS !== 'web' ? 2 : undefined}
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <FlatList
                        data={filteredSuggestions}
                        keyExtractor={(item, index) => `${item}-${index}`}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.suggestionItem}
                                onPress={() => handleSelectSuggestion(item)}
                            >
                                <Text style={styles.suggestionIcon}>📍</Text>
                                <Text style={styles.suggestionText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        style={styles.suggestionsList}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled
                        scrollEnabled={filteredSuggestions.length > 4}
                    />
                    <TouchableOpacity
                        style={styles.closeSuggestions}
                        onPress={() => setShowSuggestions(false)}
                    >
                        <Text style={styles.closeSuggestionsText}>Close</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Quick Fill Buttons */}
            {!value && editable && (
                <View style={styles.quickFillContainer}>
                    <Text style={styles.quickFillLabel}>Quick fill:</Text>
                    <View style={styles.quickFillButtons}>
                        {COMMON_UK_LOCATIONS.slice(0, 3).map((location) => (
                            <TouchableOpacity
                                key={location}
                                style={styles.quickFillButton}
                                onPress={() => handleSelectSuggestion(location)}
                            >
                                <Text style={styles.quickFillButtonText}>{location.split(',')[0]}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 1,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#111827',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
        minHeight: 44,
    },
    suggestionsContainer: {
        position: 'absolute',
        top: Platform.OS === 'web' ? '100%' : 50,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        marginTop: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        maxHeight: 200,
        zIndex: 1000,
    },
    suggestionsList: {
        maxHeight: 160,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    suggestionIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    suggestionText: {
        fontSize: 15,
        color: '#111827',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    closeSuggestions: {
        padding: 8,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    closeSuggestionsText: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    quickFillContainer: {
        marginTop: 8,
    },
    quickFillLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 6,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    quickFillButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    quickFillButton: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    quickFillButtonText: {
        fontSize: 13,
        color: '#374151',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
});
