import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Alert, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { AppStackParamList, TabParamList } from '../navigation/types';
import { bookingService, type Booking } from '../services/bookingService';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'MyJobs'>,
  NativeStackNavigationProp<AppStackParamList>
>;

type Props = { navigation: NavProp };

export default function MyJobsScreen({ navigation }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    bookingService.myBookings()
      .then(setBookings)
      .catch(() => Alert.alert('Error', 'Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#0E7A6D';
      case 'pending': return '#FF9F43';
      case 'completed': return '#27AE60';
      case 'cancelled': return '#EB5757';
      default: return '#6A858C';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0E7A6D" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <View style={styles.container}>
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />

        <View style={styles.content}>

      <View style={styles.hero}>
        <Text style={styles.kicker}>MY SCHEDULE</Text>
        <Text style={styles.title}>My Jobs</Text>
        <Text style={styles.subtitle}>Track your bookings and upcoming shifts.</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>
              Book a shift to see it here. Check the Search tab for available shifts.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.browseButtonText}>Browse Shifts</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          if (!item.shift) return null;
          const start = new Date(item.shift.start_time);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ShiftDetails', { shiftId: item.shift!.id })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.shift.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {getStatusLabel(item.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.location}>{item.shift.location}</Text>
              <Text style={styles.time}>
                {start.toLocaleDateString()} · {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.payRate}>£{item.shift.pay_rate}/hr</Text>
            </TouchableOpacity>
          );
        }}
      />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3FAF8' },
  container: { flex: 1 },
  content: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { marginTop: 12, marginBottom: 16, paddingHorizontal: 4 },
  kicker: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
    color: '#0E6D62',
    marginBottom: 8,
  },
  title: { fontSize: 32, fontWeight: '800', color: '#12303A' },
  subtitle: { color: '#385862', marginTop: 8, lineHeight: 20 },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#12303A',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#6A858C',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#0E7A6D',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', flex: 1, color: '#12303A', marginRight: 8 },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  location: { color: '#42636C', fontSize: 13, marginBottom: 2 },
  time: { color: '#42636C', fontSize: 13, marginBottom: 6 },
  payRate: { fontSize: 15, fontWeight: '700', color: '#0E7A6D' },
});
