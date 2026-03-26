/**
 * Supabase Configuration Diagnostics
 * Run this to check if your Supabase setup is correct
 */

import { supabase, STORAGE_BUCKET } from '../config/supabase';

export async function runSupabaseDiagnostics() {
  console.log('=== SUPABASE DIAGNOSTICS ===\n');

  // 1. Check if Supabase is initialized
  console.log('1. Checking Supabase initialization...');
  if (!supabase) {
    console.error('❌ Supabase client not initialized');
    return false;
  }
  console.log('✅ Supabase client initialized\n');

  // 2. Check storage bucket
  console.log('2. Checking storage bucket access...');
  console.log(`   Bucket name: ${STORAGE_BUCKET}`);
  
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Failed to list buckets:', listError.message);
      return false;
    }

    console.log(`   Found ${buckets?.length || 0} buckets`);
    
    const targetBucket = buckets?.find(b => b.id === STORAGE_BUCKET);
    if (!targetBucket) {
      console.error(`❌ Bucket '${STORAGE_BUCKET}' not found`);
      console.log('   Available buckets:', buckets?.map(b => b.id).join(', '));
      console.log('\n   👉 Please create a bucket named:', STORAGE_BUCKET);
      return false;
    }

    console.log(`✅ Bucket '${STORAGE_BUCKET}' found`);
    console.log(`   - Public: ${targetBucket.public ? 'Yes ✅' : 'No ❌'}`);
    
    if (!targetBucket.public) {
      console.warn('   ⚠️  WARNING: Bucket is not public. Images may not be accessible.');
      console.log('   👉 Go to Supabase Dashboard > Storage > Edit bucket settings > Make public');
    }
    console.log('');

  } catch (error: any) {
    console.error('❌ Storage check failed:', error.message);
    return false;
  }

  // 3. Test upload (small test file)
  console.log('3. Testing upload capability...');
  try {
    const testFileName = `test_${Date.now()}.txt`;
    const testPath = `diagnostics/${testFileName}`;
    const testData = new TextEncoder().encode('Diagnostic test file');

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(testPath, testData, {
        contentType: 'text/plain',
        upsert: true,
      });

    if (error) {
      console.error('❌ Upload test failed:', error.message);
      console.log('   This might be due to:');
      console.log('   - Missing storage policies');
      console.log('   - Invalid API key');
      console.log('   - Network issues');
      return false;
    }

    console.log('✅ Upload test successful');
    console.log(`   Uploaded to: ${data.path}\n`);

    // 4. Test public URL generation
    console.log('4. Testing public URL generation...');
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(testPath);

    console.log('✅ Public URL generated:');
    console.log(`   ${urlData.publicUrl}`);
    console.log('   👉 Try opening this URL in your browser to verify access\n');

    // 5. Clean up test file
    console.log('5. Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([testPath]);

    if (deleteError) {
      console.warn('⚠️  Could not delete test file:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up\n');
    }

  } catch (error: any) {
    console.error('❌ Test upload failed:', error.message);
    return false;
  }

  console.log('=== DIAGNOSTICS COMPLETE ===');
  console.log('✅ All checks passed! Supabase is configured correctly.\n');
  return true;
}

// For use in React components
export async function checkSupabaseHealth(): Promise<{
  isHealthy: boolean;
  bucketExists: boolean;
  bucketIsPublic: boolean;
  canUpload: boolean;
  errors: string[];
}> {
  const result = {
    isHealthy: false,
    bucketExists: false,
    bucketIsPublic: false,
    canUpload: false,
    errors: [] as string[],
  };

  try {
    // Check bucket
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      result.errors.push(`Failed to list buckets: ${error.message}`);
      return result;
    }

    const bucket = buckets?.find(b => b.id === STORAGE_BUCKET);
    if (!bucket) {
      result.errors.push(`Bucket '${STORAGE_BUCKET}' not found`);
      return result;
    }

    result.bucketExists = true;
    result.bucketIsPublic = bucket.public;

    if (!bucket.public) {
      result.errors.push('Bucket exists but is not public');
    }

    // Test upload
    const testPath = `health-check/test.txt`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(testPath, new Uint8Array([1, 2, 3]), { upsert: true });

    if (uploadError) {
      result.errors.push(`Upload test failed: ${uploadError.message}`);
    } else {
      result.canUpload = true;
      // Clean up
      await supabase.storage.from(STORAGE_BUCKET).remove([testPath]);
    }

    result.isHealthy = result.bucketExists && result.bucketIsPublic && result.canUpload;
    
  } catch (error: any) {
    result.errors.push(`Health check error: ${error.message}`);
  }

  return result;
}
