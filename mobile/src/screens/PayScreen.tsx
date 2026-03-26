import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function PayScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.hero}>
        <Text style={styles.kicker}>EARNINGS</Text>
        <Text style={styles.title}>Pay</Text>
        <Text style={styles.subtitle}>Your payment information will appear here.</Text>
      </View>

      <View style={styles.placeholder}>
        <Ionicons name="wallet-outline" size={64} color="#0E7A6D" style={styles.placeholderIcon} />
        <Text style={styles.placeholderTitle}>Coming Soon</Text>
        <Text style={styles.placeholderText}>
          Your earnings, payment history, and payout methods will be available here.
        </Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3FAF8' },
  container: { flex: 1 },
  contentContainer: { paddingTop: 60 },
  blobTop: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: '#BEECE2',
    top: -80,
    right: -60,
  },
  blobBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: '#FFE3B7',
    bottom: -110,
    left: -90,
  },
  hero: { paddingHorizontal: 24, paddingTop: 20 },
  kicker: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
    color: '#0E6D62',
    marginBottom: 8,
  },
  title: { fontSize: 32, fontWeight: '800', color: '#12303A' },
  subtitle: { color: '#385862', marginTop: 8, lineHeight: 20 },
  placeholder: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  placeholderIcon: {
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#12303A',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 15,
    color: '#6A858C',
    textAlign: 'center',
    lineHeight: 22,
  },
});
