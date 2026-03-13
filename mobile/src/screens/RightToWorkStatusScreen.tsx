import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, ScrollView,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { rtwService, type RtwStatus } from '../services/rtwService';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'RightToWorkStatus'>;
};

export default function RightToWorkStatusScreen({ navigation }: Props) {
  const [rtw, setRtw] = useState<RtwStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rtwService.getStatus()
      .then(setRtw)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4f46e5" /></View>;

  const statusStyles: Record<string, { bg: string; border: string; text: string }> = {
    approved: { bg: '#dcfce7', border: '#86efac', text: '#166534' },
    pending:  { bg: '#fef9c3', border: '#fde047', text: '#854d0e' },
    rejected: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
  };
  const normalizedStatus = typeof rtw?.status === 'string' ? rtw.status : 'pending';
  const statusLabel = normalizedStatus.toUpperCase();
  const documentLabel = typeof rtw?.verification_method === 'string'
    ? rtw.verification_method.replace(/_/g, ' ')
    : 'Not provided';
  const submittedLabel = rtw?.submitted_at ? new Date(rtw.submitted_at).toLocaleDateString() : 'Unknown';
  const ss = rtw ? (statusStyles[normalizedStatus] ?? statusStyles.pending) : null;
  const isLocked = Boolean(rtw && normalizedStatus !== 'rejected');
  const idCompleted = isLocked;
  const rtwCompleted = isLocked;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Right to Work</Text>
      <Text style={styles.subtitle}>
        Your documents must be approved before you can book shifts.
      </Text>

      {rtw && ss && (
        <View style={[styles.statusCard, { backgroundColor: ss.bg, borderColor: ss.border }]}>
          <Text style={[styles.statusText, { color: ss.text }]}>
            Status: {statusLabel}
          </Text>
          <Text style={[styles.statusSub, { color: ss.text }]}>
            Document: {documentLabel}
          </Text>
          <Text style={[styles.statusSub, { color: ss.text }]}>
            Submitted: {submittedLabel}
          </Text>
          {normalizedStatus === 'pending' && (
            <Text style={[styles.note, { color: ss.text }]}>
              ⏳ Awaiting admin review — you can book shifts once approved.
            </Text>
          )}
          {normalizedStatus === 'rejected' && rtw.notes && (
            <Text style={[styles.note, { color: ss.text }]}>
              Reason: {rtw.notes}
            </Text>
          )}
        </View>
      )}

      <View style={styles.form}>
        <Text style={styles.formTitle}>
          {isLocked ? 'Verification checklist' : normalizedStatus === 'rejected' ? 'Resubmit documents' : 'Submit documents'}
        </Text>

        <TouchableOpacity
          style={[styles.checkCard, idCompleted && styles.checkCardCompleted]}
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate('IdDocumentDetails', {
              idType: isLocked ? 'submitted' : '',
              isCompleted: idCompleted,
              isLocked,
            })
          }
        >
          <Text style={styles.cardTitle}>ID document</Text>
          <Text style={styles.cardBody}>
            {isLocked ? 'Submitted and locked' : 'Tap to choose passport, license or national id.'}
          </Text>
          <View style={[styles.checkBadge, idCompleted ? styles.checkBadgeDone : styles.checkBadgeTodo]}>
            <Text style={styles.checkBadgeText}>{idCompleted ? '✓' : '○'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.checkCard, rtwCompleted && styles.checkCardCompleted]}
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate('RtwMethodDetails', {
              method: isLocked ? documentLabel : '',
              isCompleted: rtwCompleted,
              isLocked,
            })
          }
        >
          <Text style={styles.cardTitle}>Right to work</Text>
          <Text style={styles.cardBody}>
            {isLocked ? documentLabel : 'Tap to choose visa or share code.'}
          </Text>
          <View style={[styles.checkBadge, rtwCompleted ? styles.checkBadgeDone : styles.checkBadgeTodo]}>
            <Text style={styles.checkBadgeText}>{rtwCompleted ? '✓' : '○'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dashboardBtn}
          onPress={() => navigation.navigate('WorkerDashboard')}
        >
          <Text style={styles.dashboardBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
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
  checkCard: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 12,
  },
  checkCardCompleted: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6, color: '#111827' },
  cardBody: { fontSize: 14, color: '#374151' },
  checkBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeDone: { backgroundColor: '#16a34a' },
  checkBadgeTodo: { backgroundColor: '#9ca3af' },
  checkBadgeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  dashboardBtn: { backgroundColor: '#111827', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  dashboardBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
