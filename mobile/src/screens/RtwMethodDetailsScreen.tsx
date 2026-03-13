import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActionSheetIOS, Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { rtwService } from '../services/rtwService';

type Props = NativeStackScreenProps<AppStackParamList, 'RtwMethodDetails'>;
const RTW_METHODS = ['visa', 'share code'] as const;

export default function RtwMethodDetailsScreen({ route, navigation }: Props) {
  const { method, isLocked } = route.params;
  const [selectedMethod, setSelectedMethod] = useState(method || '');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  function buildRtwFields(nextMethod: string, fileName: string, extracted: any) {
    if (nextMethod.toLowerCase().replace(/\s+/g, '_') === 'share_code') {
      return [
        { label: 'Method', value: 'Share code' },
        { label: 'Share Code', value: extracted.shareCode || '' },
        { label: 'Date Of Birth', value: extracted.dateOfBirth || '' },
        { label: 'Expiry Date', value: extracted.expiryDate || '' },
        { label: 'Name', value: extracted.name || '' },
        { label: 'Source File', value: fileName },
      ];
    }

    return [
      { label: 'Method', value: 'Visa' },
      { label: 'Visa Number', value: extracted.visaNumber || '' },
      { label: 'Visa Type', value: extracted.visaType || '' },
      { label: 'Expiry Date', value: extracted.expiryDate || '' },
      { label: 'Name', value: extracted.name || '' },
      { label: 'Date Of Birth', value: extracted.dateOfBirth || '' },
      { label: 'Source File', value: fileName },
    ];
  }

  async function goToVerification(fileName: string, uri: string, mimeType?: string) {
    if (!selectedMethod) {
      Alert.alert('Select method', 'Please choose visa or share code first.');
      return;
    }

    setAnalyzing(true);
    try {
      const extracted = await rtwService.analyzeDocument({
        documentType: selectedMethod,
        uri,
        fileName,
        mimeType,
      });

      navigation.navigate('DocumentVerification', {
        title: `${selectedMethod.toUpperCase()} extraction`,
        fields: buildRtwFields(selectedMethod, fileName, extracted),
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
                  title: `${selectedMethod.toUpperCase()} manual entry`,
                  fields: buildRtwFields(selectedMethod, fileName, {}),
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
      <View style={styles.card}>
        <Text style={styles.title}>Right to work information</Text>
        <Text style={styles.sectionLabel}>Method</Text>
        <View style={styles.buttonGroup}>
          {RTW_METHODS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.typeBtn, selectedMethod === item && styles.typeBtnActive, isLocked && styles.typeBtnLocked]}
              onPress={() => setSelectedMethod(item)}
              disabled={isLocked}
            >
              <Text style={[styles.typeBtnText, selectedMethod === item && styles.typeBtnTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[styles.uploadBtn, isLocked && styles.typeBtnLocked]} onPress={uploadDocument} disabled={isLocked || analyzing}>
          <Text style={styles.uploadBtnText}>{analyzing ? 'Analyzing document...' : uploadedFileName ? 'Change uploaded file' : 'Upload document'}</Text>
        </TouchableOpacity>
        {uploadedFileName ? <Text style={styles.fileName}>Selected: {uploadedFileName}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 4, color: '#111827' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' },
  uploadBtn: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  uploadBtnText: { color: '#3730a3', fontWeight: '700' },
  fileName: { fontSize: 12, color: '#4b5563' },
  buttonGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  typeBtnActive: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  typeBtnLocked: { opacity: 0.6 },
  typeBtnText: { color: '#374151', fontWeight: '600', textTransform: 'capitalize' },
  typeBtnTextActive: { color: '#312e81' },
});
