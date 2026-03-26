import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { AppStackParamList, TabParamList } from '../navigation/types';
import { shiftService, type Shift } from '../services/shiftService';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Search'>,
  NativeStackNavigationProp<AppStackParamList>
>;

type Props = { navigation: NavProp };

export default function SearchScreen({ navigation }: Props) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    shiftService.getAvailable()
      .then(setShifts)
      .catch(() => Alert.alert('Error', 'Failed to load shifts'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = shifts.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(search.toLowerCase())),
  );

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
        <Text style={styles.kicker}>DISCOVER</Text>
        <Text style={styles.title}>Browse Shifts</Text>
        <Text style={styles.subtitle}>Find your next shift by role or location.</Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search by title, location, or category"
        placeholderTextColor="#8AA0A4"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {search ? 'No shifts match your search.' : 'No shifts available.'}
          </Text>
        }
        renderItem={({ item }) => {
          const start = new Date(item.start_time);
          return (
            <TouchableOpacity
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
  search: {
    backgroundColor: '#F8FCFB',
    borderWidth: 1,
    borderColor: '#C6D8D6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 12,
    fontSize: 15,
    color: '#12303A',
  },
  empty: { textAlign: 'center', color: '#6A858C', marginTop: 40 },
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '800', flex: 1, color: '#12303A' },
  payRate: { fontSize: 15, fontWeight: '800', color: '#0E7A6D' },
  location: { color: '#42636C', fontSize: 13, marginBottom: 2 },
  time: { color: '#42636C', fontSize: 13 },
  badge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5F2',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#0E7A6D' },
});
