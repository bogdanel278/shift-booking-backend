import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  Alert, TouchableOpacity, ScrollView,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { AppStackParamList } from '../navigation/types';
import { shiftService, type Shift } from '../services/shiftService';
import { bookingService } from '../services/bookingService';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'ShiftDetails'>;
  route: RouteProp<AppStackParamList, 'ShiftDetails'>;
};

export default function ShiftDetailsScreen({ route, navigation }: Props) {
  const { shiftId } = route.params;
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    shiftService.getById(shiftId)
      .then(setShift)
      .catch(() => Alert.alert('Error', 'Failed to load shift'))
      .finally(() => setLoading(false));
  }, [shiftId]);

  async function handleBook() {
    setBooking(true);
    try {
      await bookingService.book(shiftId);
      setBooked(true);
      Alert.alert('Booked!', 'Your booking was submitted successfully.', [
        { text: 'My Bookings', onPress: () => navigation.navigate('MyBookings') },
        { text: 'OK' },
      ]);
    } catch (e: unknown) {
      Alert.alert('Booking failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setBooking(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4f46e5" /></View>;
  if (!shift) return null;

  const start = new Date(shift.start_time);
  const end = new Date(shift.end_time);
  const duration = ((end.getTime() - start.getTime()) / 3600000).toFixed(1);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{shift.title}</Text>
        <View style={[styles.badge, shift.status === 'published' && styles.publishedBadge]}>
          <Text style={styles.badgeText}>{shift.status}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Row label="Location" value={shift.location} />
        <Row label="Pay rate" value={`£${shift.pay_rate}/hr`} />
        <Row label="Start" value={`${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} />
        <Row label="Duration" value={`${duration} hours`} />
        {shift.category && <Row label="Category" value={shift.category} />}
        {shift.max_workers != null && <Row label="Spots" value={String(shift.max_workers)} />}
      </View>

      {shift.description ? (
        <Section title="Description" body={shift.description} />
      ) : null}
      {shift.requirements ? (
        <Section title="Requirements" body={shift.requirements} />
      ) : null}

      <TouchableOpacity
        style={[styles.bookBtn, (booking || booked || shift.status !== 'published') && styles.bookBtnDisabled]}
        onPress={handleBook}
        disabled={booking || booked || shift.status !== 'published'}
      >
        {booking ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.bookBtnText}>
            {booked ? 'Booked ✓' : shift.status !== 'published' ? 'Not available' : 'Book this shift'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.rowItem}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', flex: 1, marginRight: 8 },
  badge: { backgroundColor: '#e5e7eb', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  publishedBadge: { backgroundColor: '#dcfce7' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  row: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, gap: 12 },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: '#6b7280', fontSize: 14 },
  rowValue: { fontWeight: '600', fontSize: 14 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  sectionBody: { color: '#374151', lineHeight: 22 },
  bookBtn: {
    backgroundColor: '#4f46e5', borderRadius: 10, padding: 16,
    alignItems: 'center', marginBottom: 32,
  },
  bookBtnDisabled: { opacity: 0.5 },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
