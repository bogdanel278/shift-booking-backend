import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActionSheetIOS, Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { rtwService } from '../services/rtwService';

type Props = NativeStackScreenProps<AppStackParamList, 'IdDocumentDetails'>;
const ID_TYPES = ['passport', 'license', 'national id'] as const;

export default function IdDocumentDetailsScreen({ route, navigation }: Props) {
  const { idType, isLocked } = route.params;
  const [selectedType, setSelectedType] = useState(idType || '');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  function buildFieldsFromExtraction(type: string, fileName: string, extracted: any) {
    const normalized = type.toLowerCase().replace(/\s+/g, '_');

    if (normalized === 'passport') {
      return [
        { label: 'Passport Number', value: extracted.passportNumber || '' },
        { label: 'Expiry Date', value: extracted.expiryDate || '' },
        { label: 'Country of Issue', value: extracted.countryOfIssue || '' },
        { label: 'Name', value: extracted.name || '' },
        { label: 'Date of Birth', value: extracted.dateOfBirth || '' },
        { label: 'Source File', value: fileName },
      ];
    }

    if (normalized === 'license') {
      return [
        { label: 'License Number', value: extracted.licenseNumber || '' },
        { label: 'Expiry Date', value: extracted.expiryDate || '' },
        { label: 'Country of Issue', value: extracted.countryOfIssue || '' },
        { label: 'Name', value: extracted.name || '' },
        { label: 'Date of Birth', value: extracted.dateOfBirth || '' },
        { label: 'Source File', value: fileName },
      ];
    }

    return [
      { label: 'ID Number', value: extracted.idNumber || '' },
      { label: 'Expiry Date', value: extracted.expiryDate || '' },
      { label: 'Country of Issue', value: extracted.countryOfIssue || '' },
      { label: 'Name', value: extracted.name || '' },
      { label: 'Date of Birth', value: extracted.dateOfBirth || '' },
      { label: 'Source File', value: fileName },
    ];
  }

  async function goToVerification(fileName: string, uri: string, mimeType?: string) {
    if (!selectedType) {
      Alert.alert('Select document type', 'Please choose a document type first.');
      return;
    }

    setAnalyzing(true);
    try {
      const extracted = await rtwService.analyzeDocument({
        documentType: selectedType,
        uri,
        fileName,
        mimeType,
      });

      navigation.navigate('DocumentVerification', {
        title: `${selectedType.toUpperCase()} extraction`,
        fields: buildFieldsFromExtraction(selectedType, fileName, extracted),
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
                  title: `${selectedType.toUpperCase()} manual entry`,
                  fields: buildFieldsFromExtraction(selectedType, fileName, {}),
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
        <Text style={styles.title}>ID information</Text>
        <Text style={styles.sectionLabel}>Document type</Text>
        <View style={styles.buttonGroup}>
          {ID_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeBtn, selectedType === type && styles.typeBtnActive, isLocked && styles.typeBtnLocked]}
              onPress={() => setSelectedType(type)}
              disabled={isLocked}
            >
              <Text style={[styles.typeBtnText, selectedType === type && styles.typeBtnTextActive]}>{type}</Text>
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
