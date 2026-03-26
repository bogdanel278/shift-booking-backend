import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { supabase, STORAGE_BUCKET } from '../config/supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Request camera permissions
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Required', 'Camera access is needed to take profile pictures.');
    return false;
  }
  return true;
}

/**
 * Request media library permissions
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Required', 'Photo library access is needed to select pictures.');
    return false;
  }
  return true;
}

/**
 * Launch camera to take a photo
 */
export async function takePhoto(): Promise<ImagePicker.ImagePickerResult | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  return result;
}

/**
 * Launch image picker from gallery
 */
export async function pickImage(): Promise<ImagePicker.ImagePickerResult | null> {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  return result;
}

/**
 * Upload image to Supabase Storage
 * @param uri - Local file URI from image picker
 * @param userId - User ID to create unique file path
 */
export async function uploadProfilePicture(uri: string, userId: string): Promise<UploadResult> {
  try {
    console.log('=== UPLOAD DEBUG INFO ===');
    console.log('Upload starting...');
    console.log('URI:', uri);
    console.log('User ID:', userId);
    
    const fileExt = uri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log('File extension:', fileExt);
    console.log('File name:', fileName);
    console.log('File path:', filePath);

    // Fetch the file and convert to array buffer
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    console.log('File size:', arrayBuffer.byteLength, 'bytes');
    console.log('Blob type:', blob.type);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, arrayBuffer, {
        contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }

    console.log('Upload successful:', data);
    console.log('Uploaded path:', data.path);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    console.log('Public URL:', urlData.publicUrl);
    console.log('=== END UPLOAD DEBUG ===');

    return { success: true, url: urlData.publicUrl };
  } catch (error: any) {
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);
    return { success: false, error: error.message || 'Failed to upload image' };
  }
}

/**
 * Delete old profile picture from storage
 * @param url - Full public URL of the image to delete
 * @param userId - User ID to verify ownership
 */
export async function deleteProfilePicture(url: string, userId: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf(STORAGE_BUCKET) + 1).join('/');

    // Verify the file belongs to this user
    if (!filePath.startsWith(userId)) {
      console.warn('Attempted to delete file not belonging to user');
      return false;
    }

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
