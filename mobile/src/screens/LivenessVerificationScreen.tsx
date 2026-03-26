import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { rtwService } from '../services/rtwService';

type Props = NativeStackScreenProps<AppStackParamList, 'LivenessVerification'>;

export default function LivenessVerificationScreen({ navigation }: Props) {
  const [starting, setStarting] = useState(false);

  async function startLiveness() {
    try {
      setStarting(true);
      const session = await rtwService.createLivenessSession({
        vendorData: 'worker-onboarding',
      });

      const canOpen = await Linking.canOpenURL(session.sessionUrl);
      if (!canOpen) {
        Alert.alert('Session created', `Open this URL in your Veriff SDK flow: ${session.sessionUrl}`);
        return;
      }

      await Linking.openURL(session.sessionUrl);

      Alert.alert(
        'Verification started',
        'Complete the Veriff flow, then return to check your status.',
        [{ text: 'OK', onPress: () => navigation.navigate('RightToWorkStatus') }],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start liveness verification.';
      Alert.alert('Liveness failed', message);
    } finally {
      setStarting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.kicker}>IDENTITY STEP</Text>
        <Text style={styles.title}>Start liveness check</Text>
        <Text style={styles.body}>
          This step creates a Veriff session and opens the hosted verification flow immediately.
        </Text>

        <TouchableOpacity style={[styles.button, starting && styles.buttonDisabled]} onPress={() => void startLiveness()} disabled={starting}>
          <Text style={styles.buttonText}>{starting ? 'Starting...' : 'Start Veriff liveness'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FAF8',
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7ECE7',
    padding: 20,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
    color: '#0E6D62',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#12303A',
    marginBottom: 10,
  },
  body: {
    color: '#385862',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  button: {
    backgroundColor: '#0E7A6D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});