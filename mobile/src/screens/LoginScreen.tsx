import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'> };

interface FormData {
  email: string;
  password: string;
}

export default function LoginScreen({ navigation }: Props) {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await authService.login(data);
      setAuth(res.token, res.user);
    } catch (e: unknown) {
      Alert.alert('Login failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.hero}>
        <Text style={styles.kicker}>WELCOME BACK</Text>
        <Text style={styles.title}>Sign in to Crewlio</Text>
        <Text style={styles.subtitle}>Book shifts faster with your verified worker account.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          rules={{ required: 'Email is required' }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              placeholder="you@example.com"
              placeholderTextColor="#8AA0A4"
            />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

        <Text style={styles.label}>Password</Text>
        <Controller
          control={control}
          name="password"
          rules={{ required: 'Password is required' }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              secureTextEntry
              value={value}
              onChangeText={onChange}
              placeholder="••••••••"
              placeholderTextColor="#8AA0A4"
            />
          )}
        />
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>No account? Create one</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  hero: { marginBottom: 18 },
  kicker: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
    color: '#0E6D62',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#12303A',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#385862',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D7ECE7',
    shadowColor: '#0B4F46',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6, color: '#1E424C' },
  input: {
    borderWidth: 1,
    borderColor: '#C6D8D6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 6,
    fontSize: 15,
    backgroundColor: '#F8FCFB',
    color: '#12303A',
  },
  inputError: { borderColor: '#ef4444' },
  error: { color: '#B42318', fontSize: 12, marginBottom: 8 },
  button: {
    backgroundColor: '#0E7A6D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { marginTop: 14, textAlign: 'center', color: '#0E7A6D', fontSize: 14, fontWeight: '600' },
});
