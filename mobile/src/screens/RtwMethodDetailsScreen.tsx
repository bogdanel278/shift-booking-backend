import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActionSheetIOS, Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { rtwService } from '../services/rtwService';

type Props = NativeStackScreenProps<AppStackParamList, 'RtwMethodDetails'>;
const SHARE_CODE_METHOD = 'share code';

export default function RtwMethodDetailsScreen({ route, navigation }: Props) {
  const { isLocked } = route.params;
  const [selectedMethod] = useState(SHARE_CODE_METHOD);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  function normalizeShareCode(value: string) {
    const normalized = value
      .toUpperCase()
      .replace(/[–—−_]/g, '-')
      .replace(/\s*-\s*/g, '-')
      .replace(/\s+/g, '-')
      .replace(/[^A-Z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const compact = normalized.replace(/-/g, '');
    if (/^[A-Z0-9]{9}$/.test(compact)) {
      return compact;
    }

    return normalized;
  }

  function extractShareCodeFallback(rawText?: string) {
    if (!rawText) return '';

    const normalizedText = rawText.replace(/[–—−_]/g, '-');

    const grouped = normalizedText.match(/\b([A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3})\b/i);
    if (grouped?.[1]) return normalizeShareCode(grouped[1]);

    const compact = normalizedText.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const nearLabel = normalizedText.match(/share\s*code[\s\S]{0,120}/i)?.[0] || '';
    const compactNearLabel = nearLabel.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    const nearLabelNine = compactNearLabel.match(/([A-Z0-9]{9})/);
    if (nearLabelNine?.[1]) return normalizeShareCode(nearLabelNine[1]);

    const genericNine = compact.match(/([A-Z0-9]{9})/);
    if (genericNine?.[1]) return normalizeShareCode(genericNine[1]);

    return '';
  }

  function extractExpiryDateFallback(rawText?: string) {
    if (!rawText) return '';

    const lines = rawText.split('\n');
    const labels = ['expiry', 'expiration', 'expire', 'expires', 'will expire', 'valid until'];

    const extractDate = (input: string) => {
      const normalized = input.replace(/\b([A-Za-z]{3,})\/([A-Za-z]{3,})\b/g, '$2');

      const numeric = normalized.match(/(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})/);
      if (numeric?.[1]) return numeric[1];

      const dayMonthYear = normalized.match(/(\d{1,2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{2,4})/i);
      if (dayMonthYear?.[1]) return dayMonthYear[1];

      const monthDayYear = normalized.match(/((?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{1,2},?\s+\d{2,4})/i);
      if (monthDayYear?.[1]) return monthDayYear[1];

      return '';
    };

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (!labels.some((label) => lower.includes(label))) continue;
      const matched = extractDate(line);
      if (matched) return matched;
    }

    for (let index = 0; index < lines.length - 1; index += 1) {
      const lower = lines[index].toLowerCase();
      if (!labels.some((label) => lower.includes(label))) continue;
      const matched = extractDate(`${lines[index]} ${lines[index + 1]}`);
      if (matched) return matched;
    }

    return '';
  }

  function buildRtwFields(fileName: string, extracted: any) {
    const detectedShareCode =
      extracted.shareCode ||
      extracted.share_code ||
      extractShareCodeFallback(extracted.rawText || extracted.raw_text);

    const detectedExpiryDate =
      extracted.expiryDate ||
      extracted.expiry_date ||
      extractExpiryDateFallback(extracted.rawText || extracted.raw_text);

    return [
      { label: 'Share Code', value: detectedShareCode || '' },
      { label: 'Expiry Date', value: detectedExpiryDate || '' },
    ];
  }

  async function goToVerification(fileName: string, uri: string, mimeType?: string) {
    setAnalyzing(true);
    try {
      const extracted = await rtwService.analyzeDocument({
        documentType: selectedMethod,
        uri,
        fileName,
        mimeType,
      });

      navigation.navigate('DocumentVerification', {
        title: 'SHARE CODE extraction',
        fields: buildRtwFields(fileName, extracted),
        verificationMethod: 'share_code',
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not extract fields from document';
      const isConfigError = /not configured|AZURE_DOC_INTELLIGENCE_ENDPOINT|AZURE_DOC_INTELLIGENCE_KEY/i.test(message);
      if (isConfigError) {
        Alert.alert(
          'Extraction unavailable',
          'Azure OCR is not configured yet. You can continue and fill the details manually.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Continue manually',
              onPress: () => {
                navigation.navigate('DocumentVerification', {
                  title: 'SHARE CODE manual entry',
                  fields: buildRtwFields(fileName, {}),
                  verificationMethod: 'share_code',
                });
              },
            },
          ],
        );
      } else {
        Alert.alert('Extraction failed', message);
      }
    } finally {
      setAnalyzing(false);
    }
  }

  async function pickFromFiles() {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const file = result.assets[0];
    const name = file.name ?? 'file';
    setUploadedFileName(name);
    await goToVerification(name, file.uri, file.mimeType);
  }

  async function pickFromCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Camera permission is required to scan documents.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (result.canceled) return;
    const file = result.assets[0];
    const name = file.fileName ?? 'scanned-document.jpg';
    setUploadedFileName(name);
    await goToVerification(name, file.uri, file.mimeType);
  }

  async function pickFromPhotos() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Photos permission is required to choose images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (result.canceled) return;
    const file = result.assets[0];
    const name = file.fileName ?? 'photo-document.jpg';
    setUploadedFileName(name);
    await goToVerification(name, file.uri, file.mimeType);
  }

  function uploadDocument() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Choose from Files', 'Scan with Camera', 'Photo Library'],
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) void pickFromFiles();
          if (index === 2) void pickFromCamera();
          if (index === 3) void pickFromPhotos();
        },
      );
      return;
    }

    Alert.alert('Upload document', 'Choose source', [
      { text: 'Choose from Files', onPress: () => void pickFromFiles() },
      { text: 'Scan with Camera', onPress: () => void pickFromCamera() },
      { text: 'Photo Library', onPress: () => void pickFromPhotos() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.hero}>
        <Text style={styles.kicker}>DOCUMENT STEP</Text>
        <Text style={styles.title}>Right-to-work details</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Method</Text>
        <Text style={[styles.methodValue, isLocked && styles.typeBtnLocked]}>Share code</Text>
        <TouchableOpacity style={[styles.uploadBtn, isLocked && styles.typeBtnLocked]} onPress={uploadDocument} disabled={isLocked || analyzing}>
          <Text style={styles.uploadBtnText}>{analyzing ? 'Analyzing document...' : uploadedFileName ? 'Change uploaded file' : 'Upload document'}</Text>
        </TouchableOpacity>
        {uploadedFileName ? <Text style={styles.fileName}>Selected: {uploadedFileName}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FAF8',
    padding: 20,
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
  hero: { marginBottom: 14 },
  kicker: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
    color: '#0E6D62',
    marginBottom: 8,
  },
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
  title: { fontSize: 31, fontWeight: '800', marginBottom: 2, color: '#12303A' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#5D7E85', textTransform: 'uppercase', letterSpacing: 1 },
  uploadBtn: {
    backgroundColor: '#E8F5F2',
    borderWidth: 1,
    borderColor: '#B5DDD7',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  uploadBtnText: { color: '#0E6D62', fontWeight: '700' },
  fileName: { fontSize: 12, color: '#4E6B74' },
  methodValue: { color: '#12303A', fontSize: 16, fontWeight: '700', textTransform: 'capitalize' },
  typeBtnLocked: { opacity: 0.6 },
});
