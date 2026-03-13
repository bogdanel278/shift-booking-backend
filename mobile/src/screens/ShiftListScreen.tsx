import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { shiftService, type Shift } from '../services/shiftService';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList, 'ShiftList'> };

export default function ShiftListScreen({ navigation }: Props) {
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
      s.location.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4f46e5" /></View>;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search shifts…"
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<Text style={styles.empty}>No shifts available.</Text>}
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
              <Text style={styles.location}>📍 {item.location}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  search: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 15,
  },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  payRate: { fontSize: 15, fontWeight: '700', color: '#4f46e5' },
  location: { color: '#6b7280', fontSize: 13, marginBottom: 2 },
  time: { color: '#6b7280', fontSize: 13 },
  badge: {
    marginTop: 8, alignSelf: 'flex-start',
    backgroundColor: '#ede9fe', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 2,
  },
  badgeText: { color: '#4f46e5', fontSize: 12, fontWeight: '600' },
});
