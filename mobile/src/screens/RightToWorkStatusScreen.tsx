import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { rtwService, type WorkerRtwStatus } from '../services/rtwService';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'RightToWorkStatus'>;
};

export default function RightToWorkStatusScreen({ navigation }: Props) {
  const [rtw, setRtw] = useState<WorkerRtwStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = () => {
    setLoading(true);
    rtwService.getStatus()
      .then(setRtw)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStatus();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadStatus();
    }, []),
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0E7A6D" /></View>;

  const statusStyles: Record<string, { bg: string; border: string; text: string }> = {
    approved: { bg: '#dcfce7', border: '#86efac', text: '#166534' },
    pending:  { bg: '#fef9c3', border: '#fde047', text: '#854d0e' },
    rejected: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
  };
  const normalizedStatus = typeof rtw?.status === 'string' ? rtw.status : 'pending';
  const statusLabel = normalizedStatus.toUpperCase();
  const latestVerification = rtw?.verification;
  const documentLabel = typeof latestVerification?.verification_method === 'string'
    ? latestVerification.verification_method.replace(/_/g, ' ')
    : 'Not provided';
  const submittedLabel = latestVerification?.submitted_at ? new Date(latestVerification.submitted_at).toLocaleDateString() : 'Unknown';
  const ss = rtw ? (statusStyles[normalizedStatus] ?? statusStyles.pending) : null;

  const idStatus = rtw?.id_step?.status;
  const shareCodeStatus = rtw?.share_code_step?.status;

  const idCompleted = idStatus === 'approved';
  const idPending = idStatus === 'pending';
  const idRejected = idStatus === 'rejected';
  const idLocked = idPending || idCompleted;

  const canStartShareCode = Boolean(rtw?.can_submit_share_code);
  const shareCodeCompleted = shareCodeStatus === 'approved';
  const shareCodePending = shareCodeStatus === 'pending';
  const shareCodeRejected = shareCodeStatus === 'rejected';
  const shareCodeLocked = !canStartShareCode || shareCodePending || shareCodeCompleted;

  return (
    <View style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>COMPLIANCE</Text>
          <Text style={styles.title}>Right to Work</Text>
          <Text style={styles.subtitle}>
            Your documents must be approved before you can book shifts.
          </Text>
        </View>

        {rtw && ss && (
          <View style={[styles.statusCard, { backgroundColor: ss.bg, borderColor: ss.border }]}>
            <Text style={[styles.statusText, { color: ss.text }]}>Status: {statusLabel}</Text>
            <Text style={[styles.statusSub, { color: ss.text }]}>Document: {documentLabel}</Text>
            <Text style={[styles.statusSub, { color: ss.text }]}>Submitted: {submittedLabel}</Text>
            {latestVerification?.verification_method === 'share_code' && latestVerification?.share_code && (
              <Text style={[styles.statusSub, { color: ss.text }]}>Share code: {latestVerification.share_code}</Text>
            )}
            {latestVerification?.id && (
              <Text style={[styles.statusSub, { color: ss.text }]}>Verification ID: {latestVerification.id}</Text>
            )}
            {normalizedStatus === 'pending' && (
              <Text style={[styles.note, { color: ss.text }]}>Awaiting admin review. You can book shifts once approved.</Text>
            )}
            {normalizedStatus === 'rejected' && rtw.notes && (
              <Text style={[styles.note, { color: ss.text }]}>Reason: {rtw.notes}</Text>
            )}
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {!idStatus ? 'Step 1: Submit ID document' : 'Verification checklist'}
          </Text>

          <TouchableOpacity
            style={[styles.checkCard, styles.checkCardMint, idCompleted && styles.checkCardCompleted]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('LivenessVerification')}
          >
            <Text style={styles.cardTitle}>Liveness check</Text>
            {idPending && (
              <View style={styles.pendingPill}>
                <Text style={styles.pendingPillText}>Pending review</Text>
              </View>
            )}
            <Text style={styles.cardBody}>
              {idCompleted
                ? 'Approved. Step 2 is now unlocked.'
                : idPending
                  ? 'Submitted. Waiting for approval.'
                  : idRejected
                    ? 'Rejected. Resubmit your liveness check.'
                    : 'Start Veriff liveness verification.'}
            </Text>
            <View style={[styles.checkBadge, idCompleted ? styles.checkBadgeDone : styles.checkBadgeTodo]}>
              <Text style={styles.checkBadgeText}>{idCompleted ? '✓' : idPending ? '…' : '○'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.checkCard,
              styles.checkCardBlue,
              !canStartShareCode && styles.checkCardLocked,
              shareCodeCompleted && styles.checkCardCompleted,
            ]}
            activeOpacity={0.9}
            disabled={!canStartShareCode}
            onPress={() =>
              navigation.navigate('RtwMethodDetails', {
                method: canStartShareCode ? 'share code' : '',
                isCompleted: shareCodeCompleted,
                isLocked: shareCodeLocked,
              })
            }
          >
            <Text style={styles.cardTitle}>Share code</Text>
            <Text style={styles.cardBody}>
              {!canStartShareCode
                ? 'Please verify ID first.'
                : shareCodeCompleted
                  ? 'Share code approved.'
                  : shareCodePending
                    ? 'Share code submitted. Waiting for approval.'
                    : shareCodeRejected
                      ? 'Share code rejected. Resubmit.'
                      : 'Upload your share code document.'}
            </Text>
            <View
              style={[
                styles.checkBadge,
                !canStartShareCode
                  ? styles.checkBadgeLocked
                  : shareCodeCompleted
                    ? styles.checkBadgeDone
                    : styles.checkBadgeTodo,
              ]}
            >
              {!canStartShareCode ? (
                <Ionicons name="lock-closed" size={13} color="#fff" />
              ) : (
                <Text style={styles.checkBadgeText}>{shareCodeCompleted ? '✓' : shareCodePending ? '…' : '○'}</Text>
              )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FAF8',
    overflow: 'hidden',
  },
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
  content: { padding: 20, paddingBottom: 36 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { marginBottom: 16 },
  kicker: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
    color: '#0E6D62',
    marginBottom: 8,
  },
  title: { fontSize: 32, fontWeight: '800', color: '#12303A', marginBottom: 8 },
  subtitle: { color: '#385862', marginBottom: 14, lineHeight: 20 },
  statusCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#0B4F46',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statusText: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  statusSub: { fontSize: 13, marginBottom: 3 },
  note: { marginTop: 10, fontSize: 13, lineHeight: 20, fontWeight: '500' },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7ECE7',
    padding: 18,
    shadowColor: '#0B4F46',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  formTitle: { fontSize: 18, fontWeight: '800', marginBottom: 14, color: '#12303A' },
  checkCard: {
    position: 'relative',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D5E4E1',
    padding: 14,
    marginBottom: 12,
  },
  checkCardMint: { backgroundColor: '#F2FCF8' },
  checkCardBlue: { backgroundColor: '#F2F8FF' },
  checkCardLocked: {
    backgroundColor: '#EEF2F4',
    borderColor: '#CFD9DC',
    opacity: 0.75,
  },
  checkCardCompleted: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6, color: '#12303A' },
  cardBody: { fontSize: 14, color: '#42636C' },
  pendingPill: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pendingPillText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
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
  checkBadgeTodo: { backgroundColor: '#7A9399' },
  checkBadgeLocked: { backgroundColor: '#5F6D73' },
  checkBadgeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  dashboardBtn: {
    backgroundColor: '#0E7A6D',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  dashboardBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
