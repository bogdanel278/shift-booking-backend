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

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0E7A6D" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <FlatList
        data={bookings}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.hero}>
            <Text style={styles.kicker}>YOUR WORK</Text>
            <Text style={styles.title}>My Bookings</Text>
            <Text style={styles.subtitle}>Track all booked shifts and manage upcoming work.</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>No bookings yet.</Text>}
        renderItem={({ item }) => {
          const s = item.shift;
          const colors = statusColor[item.status] ?? { bg: '#EEF4F6', text: '#32535D' };
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
                  <Text style={styles.sub}>Location: {s.location}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3FAF8', overflow: 'hidden' },
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
  listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 28 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { marginBottom: 14, marginTop: 6 },
  kicker: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
    color: '#0E6D62',
    marginBottom: 8,
  },
  title: { fontSize: 32, fontWeight: '800', color: '#12303A' },
  subtitle: { color: '#385862', marginTop: 8, lineHeight: 20 },
  empty: { textAlign: 'center', color: '#6A858C', marginTop: 32, fontSize: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7ECE7',
    padding: 16,
    marginBottom: 10,
    shadowColor: '#0B4F46',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: '800', flex: 1, color: '#12303A' },
  badge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  sub: { color: '#42636C', fontSize: 13, marginBottom: 2 },
  date: { color: '#6F8A91', fontSize: 12, marginTop: 5 },
  cancelBtn: { marginTop: 10 },
  cancelText: { color: '#C7372F', fontWeight: '700', fontSize: 13 },
});
