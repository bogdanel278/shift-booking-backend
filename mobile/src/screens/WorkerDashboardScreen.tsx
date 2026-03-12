import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';
import { bookingService } from '../services/bookingService';
import { rtwService, type RtwStatus } from '../services/rtwService';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList, 'WorkerDashboard'> };

export default function WorkerDashboardScreen({ navigation }: Props) {
  const { user, clearAuth } = useAuthStore();
  const [bookingCount, setBookingCount] = useState<number | null>(null);
  const [rtw, setRtw] = useState<RtwStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([bookingService.myBookings(), rtwService.getStatus()])
      .then(([bookings, status]) => {
        setBookingCount(bookings.length);
        setRtw(status);
      })
      .catch(() => Alert.alert('Error', 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const rtwColor = rtw?.status === 'approved' ? '#16a34a' : rtw?.status === 'pending' ? '#d97706' : '#dc2626';

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4f46e5" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Hello, {user?.first_name}</Text>
      <Text style={styles.subtitle}>Worker Dashboard</Text>

      <View style={styles.cards}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MyBookings')}>
          <Text style={styles.cardValue}>{bookingCount ?? 0}</Text>
          <Text style={styles.cardLabel}>My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ShiftList')}>
          <Text style={styles.cardValue}>→</Text>
          <Text style={styles.cardLabel}>Find Shifts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('RightToWorkStatus')}>
          <Text style={[styles.cardValue, { color: rtwColor, fontSize: 14 }]}>
            {rtw?.status ?? 'None'}
          </Text>
          <Text style={styles.cardLabel}>Right to Work</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={clearAuth}>
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginTop: 20 },
  subtitle: { color: '#6b7280', marginBottom: 28 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    flex: 1, minWidth: '40%', backgroundColor: '#fff', borderRadius: 12,
    padding: 20, alignItems: 'center', shadowColor: '#000',
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardValue: { fontSize: 28, fontWeight: '700', color: '#4f46e5' },
  cardLabel: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  logoutBtn: { marginTop: 'auto', padding: 14, borderRadius: 8, backgroundColor: '#fee2e2', alignItems: 'center' },
  logoutText: { color: '#dc2626', fontWeight: '600' },
});
