import Constants from 'expo-constants';
import { Platform } from 'react-native';

function inferHostFromExpo(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as unknown as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost ??
    // Fallbacks for older/newer runtime shapes
    (Constants as unknown as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } }).manifest2?.extra?.expoGo?.debuggerHost ??
    null;

  if (!hostUri) return null;
  const host = hostUri.split(':')[0];
  return host || null;
}

const envBase = process.env.EXPO_PUBLIC_API_BASE_URL;
const inferredHost = inferHostFromExpo();

const resolvedEnvBase = (() => {
  if (!envBase) return null;
  if (inferredHost && (envBase.includes('localhost') || envBase.includes('127.0.0.1'))) {
    return envBase
      .replace('localhost', inferredHost)
      .replace('127.0.0.1', inferredHost);
  }
  return envBase;
})();

const emulatorOrSimulatorDefault = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'
  : 'http://localhost:3000';

const candidateBases = [
  resolvedEnvBase,
  inferredHost ? `http://${inferredHost}:3000` : null,
  emulatorOrSimulatorDefault,
  'http://localhost:3000',
].filter((value): value is string => Boolean(value));

export const API_BASE_URL_CANDIDATES = Array.from(new Set(candidateBases));

export const API_BASE_URL =
  API_BASE_URL_CANDIDATES[0];
