import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { AppStackParamList, TabParamList } from '../navigation/types';
import { shiftService, type Shift } from '../services/shiftService';
import { useAuthStore } from '../store/authStore';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<AppStackParamList>
>;

type Props = { navigation: NavProp };

export default function HomeScreen({ navigation }: Props) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    shiftService.getAvailable()
      .then(data => setShifts(data.slice(0, 5))) // Only show first 5
      .catch(() => Alert.alert('Error', 'Failed to load shifts'))
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />

      <View style={styles.hero}>
        <Text style={styles.greeting}>{greeting()}</Text>
        <Text style={styles.name}>{user?.first_name || user?.name || 'Worker'}</Text>
        <Text style={styles.subtitle}>Ready to find your next shift?</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Shifts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0E7A6D" style={styles.loader} />
        ) : shifts.length === 0 ? (
          <Text style={styles.empty}>No shifts available right now.</Text>
        ) : (
          shifts.map((item) => {
            const start = new Date(item.start_time);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => navigation.navigate('ShiftDetails', { shiftId: item.id })}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.payRate}>£{item.pay_rate}/hr</Text>
                </View>
                <Text style={styles.location}>{item.location}</Text>
                <Text style={styles.time}>
                  {start.toLocaleDateString()} · {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {item.category && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.category}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <View style={styles.actionRow}>
            <Ionicons name="calendar-outline" size={20} color="#0E7A6D" />
            <Text style={styles.actionText}>My Bookings</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('RightToWorkStatus')}
        >
          <View style={styles.actionRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#0E7A6D" />
            <Text style={styles.actionText}>Right to Work Status</Text>
          </View>
        </TouchableOpacity>
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
  greeting: {
    fontSize: 16,
    color: '#0E6D62',
    fontWeight: '600',
    marginBottom: 4,
  },
  name: {
    fontSize: 32,
    fontWeight: '800',
    color: '#12303A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#385862',
    lineHeight: 22,
  },
  section: { paddingHorizontal: 24, paddingVertical: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#12303A',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E7A6D',
  },
  loader: { marginVertical: 20 },
  empty: { textAlign: 'center', color: '#6A858C', marginVertical: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7ECE7',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0B4F46',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1, color: '#12303A' },
  payRate: { fontSize: 15, fontWeight: '800', color: '#0E7A6D' },
  location: { color: '#42636C', fontSize: 13, marginBottom: 4 },
  time: { color: '#42636C', fontSize: 13 },
  badge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5F2',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#0E7A6D' },
  quickActions: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7ECE7',
    padding: 16,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#12303A',
  },
});
