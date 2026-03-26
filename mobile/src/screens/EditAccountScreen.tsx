import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert, Switch, Image, ActivityIndicator, ActionSheetIOS, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { takePhoto, pickImage, uploadProfilePicture } from '../services/uploadService';

type NavProp = NativeStackNavigationProp<AppStackParamList, 'EditAccount'>;
type Props = { navigation: NavProp };

export default function EditAccountScreen({ navigation }: Props) {
  const { user, token, setAuth } = useAuthStore();
  
  const [minPayRate, setMinPayRate] = useState(user?.min_payrate?.toString() || '0.00');
  const [location, setLocation] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [bankAccount, setBankAccount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handlePhotoSelection = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handleTakePhoto();
          } else if (buttonIndex === 2) {
            await handlePickImage();
          }
        }
      );
    } else {
      Alert.alert(
        'Profile Picture',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: handleTakePhoto },
          { text: 'Choose from Library', onPress: handlePickImage },
        ]
      );
    }
  };

  const handleTakePhoto = async () => {
    const result = await takePhoto();
    if (result && !result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const handlePickImage = async () => {
    const result = await pickImage();
    if (result && !result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user?.id) return;

    setIsUploading(true);
    setImageError(false);
    try {
      const uploadResult = await uploadProfilePicture(uri, user.id);
      
      if (!uploadResult.success || !uploadResult.url) {
        Alert.alert('Upload Failed', uploadResult.error || 'Could not upload image');
        return;
      }

      // Update backend with new URL
      const updatedUser = await authService.updateProfilePicture(uploadResult.url);
      
      if (token) {
        setAuth(token, updatedUser);
      }

      // Silent success - no alert needed
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate pay rate
      const payRateNum = parseFloat(minPayRate);
      if (isNaN(payRateNum) || payRateNum < 0) {
        Alert.alert('Invalid Input', 'Please enter a valid pay rate.');
        setIsSaving(false);
        return;
      }

      // TODO: Call API to update user settings
      Alert.alert('Success', 'Your account settings have been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
      // Refresh user data
      const updatedUser = await authService.me();
      if (token) {
        setAuth(token, updatedUser);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#12303A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          
          <TouchableOpacity 
            style={styles.profilePictureContainer}
            onPress={handlePhotoSelection}
            disabled={isUploading}
          >
            <View style={styles.profilePictureWrapper}>
              {user?.profile_picture_url && !imageError ? (
                <Image 
                  source={{ uri: user.profile_picture_url }} 
                  style={styles.profilePicture}
                  onError={() => setImageError(true)}
                  onLoad={() => setImageError(false)}
                />
              ) : (
                <View style={styles.profilePictureAvatar}>
                  <Text style={styles.profilePictureAvatarText}>
                    {(user?.first_name?.[0] || user?.name?.[0] || user?.email[0] || 'U').toUpperCase()}
                  </Text>
                </View>
              )}
              {isUploading ? (
                <View style={styles.profilePictureUploadingBadge}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              ) : (
                <View style={styles.profilePictureCameraBadge}>
                  <Ionicons name="camera" size={18} color="#fff" />
                </View>
              )}
            </View>
            <View style={styles.profilePictureTextContainer}>
              <Text style={styles.profilePictureLabel}>Change Profile Picture</Text>
              <Text style={styles.profilePictureHelper}>Tap to update your photo</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pay Settings</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Minimum Pay Rate (£/hour)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="cash-outline" size={20} color="#8AA0A4" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={minPayRate}
                onChangeText={setMinPayRate}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#C4D4D8"
              />
            </View>
            <Text style={styles.helperText}>
              Only show shifts that meet your minimum hourly rate
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Preferred Location</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={20} color="#8AA0A4" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Enter city or postcode"
                placeholderTextColor="#C4D4D8"
              />
            </View>
            <Text style={styles.helperText}>
              Help us show you shifts near you
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.toggleContainer}>
            <View style={styles.toggleLeft}>
              <Ionicons name="notifications-outline" size={22} color="#0E7A6D" style={styles.toggleIcon} />
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleLabel}>Push Notifications</Text>
                <Text style={styles.toggleHelper}>Get notified about new shifts</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#D7ECE7', true: '#BEECE2' }}
              thumbColor={notificationsEnabled ? '#0E7A6D' : '#8AA0A4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          
          <TouchableOpacity
            style={styles.bankAccountButton}
            onPress={() => Alert.alert('Coming Soon', 'Bank account management will be available soon.')}
          >
            <Ionicons name="card-outline" size={22} color="#0E7A6D" style={styles.menuIcon} />
            <View style={styles.bankAccountTextContainer}>
              <Text style={styles.bankAccountLabel}>Bank Account</Text>
              <Text style={styles.bankAccountHelper}>
                {user?.has_bank_account ? 'Bank account connected' : 'No bank account added'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8AA0A4" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3FAF8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#D7ECE7',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#12303A',
  },
  headerSpacer: { width: 40 },
  container: { flex: 1 },
  contentContainer: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#12303A',
    marginBottom: 16,
  },
  profilePictureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7ECE7',
    padding: 16,
  },
  profilePictureWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  profilePicture: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profilePictureAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#BEECE2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureAvatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0E7A6D',
  },
  profilePictureUploadingBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0E7A6D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profilePictureCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0E7A6D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profilePictureTextContainer: {
    flex: 1,
  },
  profilePictureLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#12303A',
    marginBottom: 2,
  },
  profilePictureHelper: {
    fontSize: 12,
    color: '#8AA0A4',
  },
  inputContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#12303A',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7ECE7',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: '#12303A',
  },
  helperText: {
    fontSize: 12,
    color: '#8AA0A4',
    marginTop: 6,
    marginLeft: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7ECE7',
    padding: 16,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleIcon: {
    marginRight: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#12303A',
    marginBottom: 2,
  },
  toggleHelper: {
    fontSize: 12,
    color: '#8AA0A4',
  },
  bankAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7ECE7',
    padding: 16,
  },
  menuIcon: {
    marginRight: 12,
  },
  bankAccountTextContainer: {
    flex: 1,
  },
  bankAccountLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#12303A',
    marginBottom: 2,
  },
  bankAccountHelper: {
    fontSize: 12,
    color: '#8AA0A4',
  },
  saveButton: {
    backgroundColor: '#0E7A6D',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 24,
    marginTop: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
});
