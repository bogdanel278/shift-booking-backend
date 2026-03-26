import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { bookingService } from '../services/bookingService';
import { rtwService, type WorkerRtwStatus } from '../services/rtwService';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList, 'WorkerDashboard'> };

export default function WorkerDashboardScreen({ navigation }: Props) {
  const { user, clearAuth } = useAuthStore();
  const [bookingCount, setBookingCount] = useState<number | null>(null);
  const [rtw, setRtw] = useState<WorkerRtwStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = () => {
    setLoading(true);
    Promise.all([bookingService.myBookings(), rtwService.getStatus()])
      .then(([bookings, status]) => {
        setBookingCount(bookings.length);
        setRtw(status);
      })
      .catch(() => Alert.alert('Error', 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadDashboard();
    }, []),
  );

  const rtwColor = rtw?.status === 'approved' ? '#16a34a' : rtw?.status === 'pending' ? '#d97706' : '#dc2626';
  const firstName =
    user?.first_name?.trim() ||
    user?.name?.trim().split(/\s+/)[0] ||
    'there';

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0E7A6D" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>WORKSPACE</Text>
          <Text style={styles.title}>Hello, {firstName}</Text>
          <Text style={styles.subtitle}>Track bookings, pick up new shifts, and manage right-to-work.</Text>
        </View>

        <View style={styles.cards}>
          <TouchableOpacity style={[styles.card, styles.cardSoftGreen]} onPress={() => navigation.navigate('MyBookings')}>
            <Text style={styles.cardEyebrow}>MY BOOKINGS</Text>
            <Text style={styles.cardValue}>{bookingCount ?? 0}</Text>
            <Text style={styles.cardLabel}>Current and past shifts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.cardSoftAmber]} onPress={() => navigation.navigate('ShiftList')}>
            <Text style={styles.cardEyebrow}>DISCOVER</Text>
            <Text style={styles.cardValue}>Browse</Text>
            <Text style={styles.cardLabel}>Find shifts near you</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.cardSoftBlue]} onPress={() => navigation.navigate('RightToWorkStatus')}>
            <Text style={styles.cardEyebrow}>COMPLIANCE</Text>
            <Text style={[styles.rtwValue, { color: rtwColor }]}>
              {(rtw?.status ?? 'none').toUpperCase()}
            </Text>
            <Text style={styles.cardLabel}>Right-to-work status</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={clearAuth}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FAF8',
    overflow: 'hidden',
  },
  blobTop: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 999,
    backgroundColor: '#BEECE2',
    top: -90,
    right: -70,
  },
  blobBottom: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: '#FFE3B7',
    bottom: -130,
    left: -110,
  },
  content: { padding: 24, paddingBottom: 36 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { marginTop: 10, marginBottom: 22 },
  kicker: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
    color: '#0E6D62',
    marginBottom: 8,
  },
  title: { fontSize: 32, fontWeight: '800', color: '#12303A' },
  subtitle: { color: '#385862', marginTop: 8, lineHeight: 20 },
  cards: { gap: 12 },
  card: {
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D7ECE7',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0B4F46',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardSoftGreen: { backgroundColor: '#F2FCF8' },
  cardSoftAmber: { backgroundColor: '#FFF8ED' },
  cardSoftBlue: { backgroundColor: '#F2F8FF' },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#5D7E85',
  },
  cardValue: { fontSize: 28, fontWeight: '800', color: '#12303A', marginTop: 8 },
  rtwValue: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  cardLabel: { fontSize: 13, color: '#4E6B74', marginTop: 6 },
  logoutBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F9D3CE',
    backgroundColor: '#FFF1EF',
    alignItems: 'center',
  },
  logoutText: { color: '#C7372F', fontWeight: '700' },
});
