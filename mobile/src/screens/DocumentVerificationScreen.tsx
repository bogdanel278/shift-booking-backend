import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { rtwService } from '../services/rtwService';

type Props = NativeStackScreenProps<AppStackParamList, 'DocumentVerification'>;

export default function DocumentVerificationScreen({ route, navigation }: Props) {
  const { title, fields, verificationMethod } = route.params;
  const [values, setValues] = useState(fields.map((f) => f.value));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValues(fields.map((f) => f.value || ''));
  }, [fields]);

  const complete = useMemo(() => values.every((v) => v.trim().length > 0), [values]);

  function updateValue(index: number, next: string) {
    setValues((prev) => prev.map((v, i) => (i === index ? next : v)));
  }

  function toIsoDate(input: string): string {
    const value = input.trim();
    if (!value) return '';

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const normalizedWords = value.replace(/\b([A-Za-z]{3,})\/([A-Za-z]{3,})\b/g, (_, _left, right) => right.toUpperCase());

    const ddmmyyyy = value.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
    if (ddmmyyyy) {
      return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
    }

    const yyyymmdd = value.match(/^(\d{4})[\/-](\d{2})[\/-](\d{2})$/);
    if (yyyymmdd) {
      return `${yyyymmdd[1]}-${yyyymmdd[2]}-${yyyymmdd[3]}`;
    }

    const textMonthMatch = normalizedWords.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{2}|\d{4})$/);
    if (textMonthMatch) {
      const monthLookup: Record<string, string> = {
        JAN: '01',
        FEB: '02',
        MAR: '03',
        APR: '04',
        MAY: '05',
        JUN: '06',
        JUL: '07',
        AUG: '08',
        SEP: '09',
        OCT: '10',
        NOV: '11',
        DEC: '12',
      };

      const day = textMonthMatch[1].padStart(2, '0');
      const month = monthLookup[textMonthMatch[2].slice(0, 3).toUpperCase()];
      const rawYear = textMonthMatch[3];

      if (month) {
        const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
        return `${year}-${month}-${day}`;
      }
    }

    return value;
  }

  function getFieldValue(label: string): string {
    const idx = fields.findIndex((f) => f.label.toLowerCase() === label.toLowerCase());
    if (idx < 0) return '';
    return values[idx]?.trim() || '';
  }

  function getFirstFieldValue(labels: string[]): string {
    for (const label of labels) {
      const value = getFieldValue(label);
      if (value) return value;
    }
    return '';
  }

  function normalizeShareCode(value: string): string {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  }

  function buildSubmitPayload() {
    if (verificationMethod === 'passport') {
      const countryRaw = getFieldValue('Country of Issue');
      const passportCountry = countryRaw.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);
      const idNumber = getFirstFieldValue(['Passport Number', 'License Number', 'ID Number']);

      return {
        verification_method: 'passport' as const,
        passport_number: idNumber,
        passport_country: passportCountry,
        passport_expiry_date: toIsoDate(getFieldValue('Expiry Date')),
      };
    }

    if (verificationMethod === 'visa') {
      return {
        verification_method: 'visa' as const,
        visa_type: getFieldValue('Visa Type') || 'Work Visa',
        visa_reference: getFieldValue('Visa Number'),
        visa_expiry_date: toIsoDate(getFieldValue('Expiry Date')),
      };
    }

    return {
      verification_method: 'share_code' as const,
      share_code: normalizeShareCode(getFieldValue('Share Code')),
    };
  }

  async function submitInformation() {
    if (!complete) {
      Alert.alert('Missing information', 'Please verify and complete all fields before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = buildSubmitPayload();
      await rtwService.submit(payload);

      Alert.alert('Submitted', 'Verification submitted successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('RightToWorkStatus'),
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit verification.';
      Alert.alert('Submission failed', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>REVIEW STEP</Text>
        <Text style={styles.title}>Verify document information</Text>
        <Text style={styles.subtitle}>{title}</Text>
      </View>

      <View style={styles.card}>
        {fields.map((field, index) => (
          <View key={`${field.label}-${index}`} style={styles.fieldBlock}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              value={values[index]}
              onChangeText={(t) => updateValue(index, t)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              placeholderTextColor="#8AA0A4"
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, (!complete || submitting) && styles.submitBtnDisabled]}
        onPress={() => void submitInformation()}
        disabled={!complete || submitting}
      >
        <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit information'}</Text>
      </TouchableOpacity>
      </ScrollView>
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
  content: { padding: 20, gap: 12, paddingBottom: 32 },
  hero: { marginBottom: 8 },
  kicker: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
    color: '#0E6D62',
    marginBottom: 8,
  },
  title: { fontSize: 32, fontWeight: '800', color: '#12303A' },
  subtitle: { fontSize: 14, color: '#385862', marginTop: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7ECE7',
    padding: 18,
    gap: 12,
    shadowColor: '#0B4F46',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  fieldBlock: { gap: 6 },
  label: { fontSize: 13, color: '#31535D', fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#C6D8D6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#F8FCFB',
    color: '#12303A',
  },
  submitBtn: {
    backgroundColor: '#0E7A6D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
