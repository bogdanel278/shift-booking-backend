import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  Alert, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { bookingService, type Booking } from '../services/bookingService';

const statusColor: Record<string, { bg: string; text: string }> = {
  pending:   { bg: '#fef9c3', text: '#854d0e' },
  confirmed: { bg: '#dcfce7', text: '#166534' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
  completed: { bg: '#dbeafe', text: '#1e40af' },
};

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await bookingService.myBookings();
      setBookings(data);
    } catch {
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  async function cancel(id: number) {
    Alert.alert('Cancel booking?', 'This cannot be undone.', [
      { text: 'Back', style: 'cancel' },
      {
        text: 'Cancel booking',
        style: 'destructive',
        onPress: async () => {
          try {
            await bookingService.cancel(id);
            setBookings((prev) => prev.filter((b) => b.id !== id));
          } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
          }
        },
      },
    ]);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4f46e5" /></View>;

  return (
    <FlatList
      style={styles.container}
      data={bookings}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ paddingBottom: 24 }}
      ListEmptyComponent={<Text style={styles.empty}>No bookings yet.</Text>}
      renderItem={({ item }) => {
        const s = item.shift;
        const colors = statusColor[item.status] ?? { bg: '#f3f4f6', text: '#374151' };
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{s?.title ?? `Booking #${item.id}`}</Text>
              <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                <Text style={[styles.badgeText, { color: colors.text }]}>{item.status}</Text>
              </View>
            </View>
            {s && (
              <>
                <Text style={styles.sub}>📍 {s.location}</Text>
                <Text style={styles.sub}>
                  {new Date(s.start_time).toLocaleDateString()} · £{s.pay_rate}/hr
                </Text>
              </>
            )}
            <Text style={styles.date}>
              Booked {new Date(item.created_at).toLocaleDateString()}
            </Text>
            {(item.status === 'pending' || item.status === 'confirmed') && (
              <TouchableOpacity onPress={() => cancel(item.id)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel booking</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  badge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 2 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  sub: { color: '#6b7280', fontSize: 13, marginBottom: 2 },
  date: { color: '#9ca3af', fontSize: 12, marginTop: 4 },
  cancelBtn: { marginTop: 10 },
  cancelText: { color: '#dc2626', fontWeight: '600', fontSize: 13 },
});
