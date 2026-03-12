import Constants from 'expo-constants';

function inferHostFromExpo(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
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

export const API_BASE_URL =
  resolvedEnvBase ||
  (inferredHost ? `http://${inferredHost}:3000` : 'http://localhost:3000');
