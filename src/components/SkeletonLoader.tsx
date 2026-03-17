import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function SkeletonLoader() {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            {[1, 2, 3].map((index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.skeletonCard,
                        { opacity: pulseAnim }
                    ]}
                >
                    <View style={styles.skeletonHeader}>
                        <View style={styles.skeletonTitle} />
                        <View style={styles.skeletonBadge} />
                    </View>
                    <View style={styles.skeletonRow}>
                        <View style={styles.skeletonText} />
                    </View>
                    <View style={styles.skeletonRow}>
                        <View style={styles.skeletonText} />
                    </View>
                    <View style={styles.skeletonFooter}>
                        <View style={styles.skeletonButton} />
                    </View>
                </Animated.View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    skeletonCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    skeletonHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    skeletonTitle: {
        width: '60%',
        height: 20,
        backgroundColor: '#E1E9EE',
        borderRadius: 4,
    },
    skeletonBadge: {
        width: 60,
        height: 24,
        backgroundColor: '#E1E9EE',
        borderRadius: 12,
    },
    skeletonRow: {
        marginBottom: 12,
    },
    skeletonText: {
        width: '80%',
        height: 16,
        backgroundColor: '#E1E9EE',
        borderRadius: 4,
    },
    skeletonFooter: {
        marginTop: 8,
    },
    skeletonButton: {
        width: 100,
        height: 32,
        backgroundColor: '#E1E9EE',
        borderRadius: 8,
    },
});
