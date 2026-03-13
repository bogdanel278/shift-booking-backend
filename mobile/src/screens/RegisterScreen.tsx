import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };
type Role = 'worker' | 'business';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  company_name?: string;
}

export default function RegisterScreen({ navigation }: Props) {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [role, setRole] = useState<Role>('worker');
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await authService.register({ ...data, role });
      setAuth(res.token, res.user);
    } catch (e: unknown) {
      Alert.alert('Registration failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create account</Text>

      {/* Role toggle */}
      <View style={styles.toggle}>
        {(['worker', 'business'] as Role[]).map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.toggleBtn, role === r && styles.toggleActive]}
            onPress={() => setRole(r)}
          >
            <Text style={[styles.toggleText, role === r && styles.toggleActiveText]}>
              {r === 'worker' ? 'Worker' : 'Business'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {(['first_name', 'last_name'] as const).map((field) => (
        <View key={field}>
          <Text style={styles.label}>{field === 'first_name' ? 'First name' : 'Last name'}</Text>
          <Controller
            control={control}
            name={field}
            rules={{ required: 'Required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors[field] && styles.inputError]}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors[field] && <Text style={styles.error}>{errors[field]?.message}</Text>}
        </View>
      ))}

      {role === 'business' && (
        <View>
          <Text style={styles.label}>Company name</Text>
          <Controller
            control={control}
            name="company_name"
            rules={{ required: 'Required for business' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.company_name && styles.inputError]}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.company_name && <Text style={styles.error}>{errors.company_name.message}</Text>}
        </View>
      )}

      <Text style={styles.label}>Email</Text>
      <Controller
        control={control}
        name="email"
        rules={{ required: 'Required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Text style={styles.label}>Password</Text>
      <Controller
        control={control}
        name="password"
        rules={{ required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            secureTextEntry
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  toggle: { flexDirection: 'row', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, marginBottom: 20, overflow: 'hidden' },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#f9fafb' },
  toggleActive: { backgroundColor: '#4f46e5' },
  toggleText: { color: '#374151', fontWeight: '600' },
  toggleActiveText: { color: '#fff' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#374151' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 4, fontSize: 15 },
  inputError: { borderColor: '#ef4444' },
  error: { color: '#ef4444', fontSize: 12, marginBottom: 8 },
  button: { backgroundColor: '#4f46e5', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { marginTop: 16, textAlign: 'center', color: '#4f46e5', fontSize: 14 },
});
