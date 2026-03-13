import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'DocumentVerification'>;

export default function DocumentVerificationScreen({ route, navigation }: Props) {
  const { title, fields } = route.params;
  const [values, setValues] = useState(fields.map((f) => f.value));

  const complete = useMemo(() => values.every((v) => v.trim().length > 0), [values]);

  function updateValue(index: number, next: string) {
    setValues((prev) => prev.map((v, i) => (i === index ? next : v)));
  }

  function submitInformation() {
    if (!complete) {
      Alert.alert('Missing information', 'Please verify and complete all fields before submitting.');
      return;
    }

    Alert.alert('Submitted', 'Document information submitted successfully.', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('RightToWorkStatus'),
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Verify document information</Text>
      <Text style={styles.subtitle}>{title}</Text>

      <View style={styles.card}>
        {fields.map((field, index) => (
          <View key={`${field.label}-${index}`} style={styles.fieldBlock}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              value={values[index]}
              onChangeText={(t) => updateValue(index, t)}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, !complete && styles.submitBtnDisabled]}
        onPress={submitInformation}
      >
        <Text style={styles.submitBtnText}>Submit information</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    gap: 12,
  },
  fieldBlock: { gap: 6 },
  label: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    color: '#111827',
  },
  submitBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
