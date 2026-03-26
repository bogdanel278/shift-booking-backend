import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActionSheetIOS, Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { rtwService } from '../services/rtwService';

type Props = NativeStackScreenProps<AppStackParamList, 'IdDocumentDetails'>;
const ID_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national id', label: 'National ID' },
  { value: 'drivers license', label: 'Driver License' },
] as const;

export default function IdDocumentDetailsScreen({ route, navigation }: Props) {
  const { idType, isLocked, status } = route.params;
  const [selectedType, setSelectedType] = useState(idType || '');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const isPendingReview = status === 'pending';
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';

  function formatPassportDate(value?: string) {
    if (!value) return '';

    const normalized = value
      .trim()
      .replace(/\b([A-Za-z]{3,})\/([A-Za-z]{3,})\b/g, (_, _left, right) => right.toUpperCase())
      .replace(/\s+/g, ' ');

    const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const year = Number(isoMatch[1]);
      const month = Number(isoMatch[2]) - 1;
      const day = Number(isoMatch[3]);
      const date = new Date(Date.UTC(year, month, day));
      const monthLabel = date.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' }).toUpperCase();
      return `${String(day).padStart(2, '0')} ${monthLabel} ${String(year).slice(-2)}`;
    }

    const textMatch = normalized.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{2}|\d{4})$/);
    if (textMatch) {
      const day = textMatch[1].padStart(2, '0');
      const month = textMatch[2].slice(0, 3).toUpperCase();
      const year = textMatch[3].slice(-2);
      return `${day} ${month} ${year}`;
    }

    return normalized;
  }

  function buildFieldsFromExtraction(type: string, fileName: string, extracted: any) {
    const normalized = type.toLowerCase().replace(/\s+/g, '_');

    if (normalized === 'passport') {
      return [
        { label: 'Passport Number', value: extracted.passportNumber || '' },
        { label: 'Expiry Date', value: formatPassportDate(extracted.expiryDate) },
        { label: 'Country of Issue', value: extracted.countryOfIssue || '' },
        { label: 'Name', value: extracted.name || '' },
        { label: 'Date of Birth', value: formatPassportDate(extracted.dateOfBirth) },
      ];
    }

    if (normalized === 'drivers_license') {
      return [
        { label: 'License Number', value: extracted.licenseNumber || '' },
        { label: 'Expiry Date', value: extracted.expiryDate || '' },
        { label: 'Country of Issue', value: extracted.countryOfIssue || '' },
        { label: 'Name', value: extracted.name || '' },
        { label: 'Date of Birth', value: extracted.dateOfBirth || '' },
      ];
    }

    return [
      { label: 'ID Number', value: extracted.idNumber || '' },
      { label: 'Expiry Date', value: extracted.expiryDate || '' },
      { label: 'Country of Issue', value: extracted.countryOfIssue || '' },
      { label: 'Name', value: extracted.name || '' },
      { label: 'Date of Birth', value: extracted.dateOfBirth || '' },
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
        documentType: selectedType === 'drivers license' ? 'license' : selectedType,
        uri,
        fileName,
        mimeType,
      });

      navigation.navigate('DocumentVerification', {
        title: `${selectedType.toUpperCase()} extraction`,
        fields: buildFieldsFromExtraction(selectedType, fileName, extracted),
        verificationMethod: 'passport',
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
                  verificationMethod: 'passport',
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
        <Text style={styles.title}>ID details</Text>
      </View>

      {(isPendingReview || isApproved || isRejected) && (
        <View
          style={[
            styles.noticeCard,
            isPendingReview && styles.noticePending,
            isApproved && styles.noticeApproved,
            isRejected && styles.noticeRejected,
          ]}
        >
          <Text style={styles.noticeTitle}>
            {isPendingReview
              ? 'ID verification pending'
              : isApproved
                ? 'ID verified'
                : 'ID verification rejected'}
          </Text>
          <Text style={styles.noticeText}>
            {isPendingReview
              ? 'You already have a pending ID verification. Please wait for review before uploading again.'
              : isApproved
                ? 'Your ID has been approved. You can continue with the next verification step.'
                : 'Your previous ID verification was rejected. Please review your document and resubmit.'}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Document type</Text>
        <View style={styles.buttonGroup}>
          {ID_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[styles.typeBtn, selectedType === type.value && styles.typeBtnActive, isLocked && styles.typeBtnLocked]}
              onPress={() => setSelectedType(type.value)}
              disabled={isLocked}
            >
              <Text style={[styles.typeBtnText, selectedType === type.value && styles.typeBtnTextActive]}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[styles.uploadBtn, isLocked && styles.typeBtnLocked]} onPress={uploadDocument} disabled={isLocked || analyzing}>
          <Text style={styles.uploadBtnText}>
            {analyzing
              ? 'Analyzing document...'
              : isPendingReview
                ? 'Pending review'
                : isApproved
                  ? 'ID verified'
                  : uploadedFileName
                    ? 'Change uploaded file'
                    : 'Upload document'}
          </Text>
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
  noticeCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  noticePending: {
    backgroundColor: '#FEF9C3',
    borderColor: '#FDE047',
  },
  noticeApproved: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  noticeRejected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  noticeTitle: {
    color: '#12303A',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  noticeText: {
    color: '#42636C',
    fontSize: 13,
    lineHeight: 18,
  },
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
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  typeBtn: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C6D8D6',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#F8FCFB',
  },
  typeBtnActive: { borderColor: '#0E7A6D', backgroundColor: '#E8F5F2' },
  typeBtnLocked: { opacity: 0.6 },
  typeBtnText: { color: '#31535D', fontWeight: '600', fontSize: 12, textAlign: 'center' },
  typeBtnTextActive: { color: '#0E6D62' },
});
