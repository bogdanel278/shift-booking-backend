import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Image, ActivityIndicator, ActionSheetIOS, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { AppStackParamList, TabParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { takePhoto, pickImage, uploadProfilePicture } from '../services/uploadService';
import { runSupabaseDiagnostics } from '../services/supabaseDiagnostics';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Profile'>,
  NativeStackNavigationProp<AppStackParamList>
>;

type Props = { navigation: NavProp };

export default function ProfileScreen({ navigation }: Props) {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Refresh user data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshUserData = async () => {
        try {
          const updatedUser = await authService.me();
          if (token) {
            setAuth(token, updatedUser);
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      };

      refreshUserData();
    }, [token])
  );

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
      console.log('Starting upload for user:', user.id);
      const uploadResult = await uploadProfilePicture(uri, user.id);
      
      console.log('Upload result:', uploadResult);
      
      if (!uploadResult.success || !uploadResult.url) {
        Alert.alert('Upload Failed', uploadResult.error || 'Could not upload image');
        return;
      }

      console.log('Updating backend with URL:', uploadResult.url);

      // Update backend with new URL
      const updatedUser = await authService.updateProfilePicture(uploadResult.url);
      
      console.log('Backend updated, new user data:', updatedUser);

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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => clearAuth(),
        },
      ],
    );
  };

  const handleRunDiagnostics = async () => {
    Alert.alert('Running Diagnostics', 'Check the console for detailed output...');
    const isHealthy = await runSupabaseDiagnostics();
    
    if (isHealthy) {
      Alert.alert(
        'Diagnostics Passed ✅',
        'Supabase is configured correctly. Check console for details.'
      );
    } else {
      Alert.alert(
        'Diagnostics Failed ❌',
        'There are issues with your Supabase setup. Check console for details and see SUPABASE_SETUP.md for help.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.hero}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={handlePhotoSelection}
          disabled={isUploading || (!!user?.profile_picture_url && !imageError)}
          activeOpacity={!!user?.profile_picture_url && !imageError ? 1 : 0.7}
        >
          {user?.profile_picture_url && !imageError ? (
            <Image 
              source={{ uri: user.profile_picture_url }} 
              style={styles.avatarImage}
              onError={(error) => {
                console.error('Image load error:', error.nativeEvent.error);
                console.log('Failed URL:', user.profile_picture_url);
                setImageError(true);
                Alert.alert('Image Error', `Failed to load profile picture. URL: ${user.profile_picture_url}`);
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', user.profile_picture_url);
                setImageError(false);
              }}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.first_name?.[0] || user?.name?.[0] || user?.email[0] || 'U').toUpperCase()}
              </Text>
            </View>
          )}
          {isUploading ? (
            <View style={styles.uploadingBadge}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : !user?.profile_picture_url || imageError ? (
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          ) : null}
          {user?.is_verified && (
            <View style={styles.verificationBadge}>
              <Ionicons name="checkmark-circle" size={28} color="#27AE60" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.name}>
          {user?.first_name && user?.last_name
            ? `${user.first_name} ${user.last_name}`
            : user?.name || 'User'}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={22} color="#0E7A6D" style={styles.statIcon} />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>£{user?.min_payrate?.toFixed(2) || '0.00'}</Text>
            <Text style={styles.statLabel}>Pay Rate</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="wallet-outline" size={22} color="#0E7A6D" style={styles.statIcon} />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>£0.00</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
        </View>
      </View>

      {(!user?.rtw_verified || !user?.has_bank_account || !user?.profile_picture_url) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Complete Your Profile</Text>
          
          {!user?.rtw_verified && (
            <TouchableOpacity
              style={[styles.menuItem, styles.incompleteItem]}
              onPress={() => navigation.navigate('RightToWorkStatus')}
            >
              <View style={styles.incompleteIconBadge}>
                <Ionicons name="alert-circle" size={22} color="#FF9F43" style={styles.menuIcon} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuText}>Verify Right to Work</Text>
                <Text style={styles.menuSubtext}>Required to book shifts</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8AA0A4" />
            </TouchableOpacity>
          )}

          {!user?.has_bank_account && (
            <TouchableOpacity
              style={[styles.menuItem, styles.incompleteItem]}
              onPress={() => Alert.alert('Coming Soon', 'Bank account setup will be available soon.')}
            >
              <View style={styles.incompleteIconBadge}>
                <Ionicons name="card-outline" size={22} color="#FF9F43" style={styles.menuIcon} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuText}>Add Bank Account</Text>
                <Text style={styles.menuSubtext}>Required for payments</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8AA0A4" />
            </TouchableOpacity>
          )}

          {!user?.profile_picture_url && (
            <TouchableOpacity
              style={[styles.menuItem, styles.incompleteItem]}
              onPress={() => Alert.alert('Coming Soon', 'Profile picture upload will be available soon.')}
            >
              <View style={styles.incompleteIconBadge}>
                <Ionicons name="camera-outline" size={22} color="#FF9F43" style={styles.menuIcon} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuText}>Add Profile Picture</Text>
                <Text style={styles.menuSubtext}>Help employers recognize you</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8AA0A4" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('RightToWorkStatus')}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color="#0E7A6D" style={styles.menuIcon} />
          <Text style={styles.menuText}>Right to Work Status</Text>
          <Ionicons name="chevron-forward" size={20} color="#8AA0A4" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Ionicons name="calendar-outline" size={22} color="#0E7A6D" style={styles.menuIcon} />
          <Text style={styles.menuText}>My Bookings</Text>
          <Ionicons name="chevron-forward" size={20} color="#8AA0A4" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditAccount')}
        >
          <Ionicons name="settings-outline" size={22} color="#0E7A6D" style={styles.menuIcon} />
          <Text style={styles.menuText}>Edit Account</Text>
          <Ionicons name="chevron-forward" size={20} color="#8AA0A4" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert('Coming Soon', 'Notifications settings will be available soon.')}
        >
          <Ionicons name="notifications-outline" size={22} color="#0E7A6D" style={styles.menuIcon} />
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#8AA0A4" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert('Coming Soon', 'Help & Support will be available soon.')}
        >
          <Ionicons name="help-circle-outline" size={22} color="#0E7A6D" style={styles.menuIcon} />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#8AA0A4" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleRunDiagnostics}
        >
          <Ionicons name="bug-outline" size={22} color="#3498db" style={styles.menuIcon} />
          <Text style={styles.menuText}>Run Supabase Diagnostics</Text>
          <Ionicons name="chevron-forward" size={20} color="#8AA0A4" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#EB5757" style={styles.menuIcon} />
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color="#8AA0A4" />
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3FAF8' },
  container: { flex: 1 },
  contentContainer: { paddingTop: 60 },
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
  hero: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0E7A6D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: '#0E7A6D',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  uploadingBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: '#0E7A6D',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#12303A',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6A858C',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: '#E8F5F2',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0E7A6D',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#12303A',
    marginBottom: 12,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7ECE7',
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#12303A',
  },
  incompleteItem: {
    borderColor: '#FFE3B7',
    backgroundColor: '#FFFBF5',
  },
  incompleteIconBadge: {
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuSubtext: {
    fontSize: 12,
    color: '#8AA0A4',
    marginTop: 2,
  },
  logoutItem: {
    marginTop: 8,
    borderColor: '#FFCDD2',
  },
  logoutText: {
    color: '#EB5757',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7ECE7',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    marginRight: 10,
  },
  statTextContainer: {
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#12303A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6A858C',
  },
});
