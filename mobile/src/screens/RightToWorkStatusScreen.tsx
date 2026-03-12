import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  Alert, TouchableOpacity, TextInput, ScrollView,
} from 'react-native';
import { rtwService, type RtwStatus } from '../services/rtwService';

const DOC_TYPES = [
  'passport',
  'birth_certificate',
  'visa',
  'biometric_residence_permit',
];

export default function RightToWorkStatusScreen() {
  const [rtw, setRtw] = useState<RtwStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [docNumber, setDocNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    rtwService.getStatus()
      .then(setRtw)
      .finally(() => setLoading(false));
  }, []);

  async function submit() {
    if (!docNumber.trim()) {
      Alert.alert('Required', 'Please enter a document number');
      return;
    }
    setSubmitting(true);
    try {
      const res = await rtwService.submit({ document_type: docType, document_number: docNumber });
      setRtw(res);
      Alert.alert('Submitted', 'Your documents are under review.');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4f46e5" /></View>;

  const statusStyles: Record<string, { bg: string; border: string; text: string }> = {
    approved: { bg: '#dcfce7', border: '#86efac', text: '#166534' },
    pending:  { bg: '#fef9c3', border: '#fde047', text: '#854d0e' },
    rejected: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
  };
  const ss = rtw ? (statusStyles[rtw.status] ?? statusStyles.pending) : null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Right to Work</Text>
      <Text style={styles.subtitle}>
        Your documents must be approved before you can book shifts.
      </Text>

      {rtw && ss && (
        <View style={[styles.statusCard, { backgroundColor: ss.bg, borderColor: ss.border }]}>
          <Text style={[styles.statusText, { color: ss.text }]}>
            Status: {rtw.status.toUpperCase()}
          </Text>
          <Text style={[styles.statusSub, { color: ss.text }]}>
            Document: {rtw.document_type.replace(/_/g, ' ')}
          </Text>
          <Text style={[styles.statusSub, { color: ss.text }]}>
            Submitted: {new Date(rtw.submitted_at).toLocaleDateString()}
          </Text>
          {rtw.status === 'pending' && (
            <Text style={[styles.note, { color: ss.text }]}>
              ⏳ Awaiting admin review — you can book shifts once approved.
            </Text>
          )}
          {rtw.status === 'rejected' && rtw.rejection_reason && (
            <Text style={[styles.note, { color: ss.text }]}>
              Reason: {rtw.rejection_reason}
            </Text>
          )}
        </View>
      )}

      {(!rtw || rtw.status === 'rejected') && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {rtw?.status === 'rejected' ? 'Resubmit documents' : 'Submit documents'}
          </Text>

          <Text style={styles.label}>Document type</Text>
          <View style={styles.docTypes}>
            {DOC_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, docType === t && styles.typeBtnActive]}
                onPress={() => setDocType(t)}
              >
                <Text style={[styles.typeBtnText, docType === t && styles.typeBtnActiveText]}>
                  {t.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Document number</Text>
          <TextInput
            style={styles.input}
            value={docNumber}
            onChangeText={setDocNumber}
            placeholder="e.g. 123456789"
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={submit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit documents</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#6b7280', marginBottom: 20, lineHeight: 20 },
  statusCard: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 24 },
  statusText: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  statusSub: { fontSize: 13, marginBottom: 2 },
  note: { marginTop: 8, fontSize: 13, lineHeight: 20 },
  form: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  formTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  docTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeBtn: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  typeBtnActive: { borderColor: '#4f46e5', backgroundColor: '#ede9fe' },
  typeBtnText: { fontSize: 12, color: '#374151', textTransform: 'capitalize' },
  typeBtnActiveText: { color: '#4f46e5', fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    padding: 12, marginBottom: 20, fontSize: 15,
  },
  submitBtn: { backgroundColor: '#4f46e5', borderRadius: 8, padding: 14, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
