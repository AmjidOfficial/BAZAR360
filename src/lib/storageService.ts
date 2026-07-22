import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Resizes and compresses an image file using browser Canvas API to optimize performance and bandwidth usage.
 * @param file The original image file from input
 * @param maxWidth The target maximum width in pixels
 * @param maxHeight The target maximum height in pixels
 * @param quality Compression quality from 0.0 to 1.0 (defaults to 0.8)
 * @returns A Promise resolving to a high-speed web-ready Blob
 */
export async function compressAndResizeImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio calculations
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to fetch Canvas 2D rendering context'));
          return;
        }

        // Draw image resized onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas output to high-speed web-ready Blob representation
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas image conversion to Blob failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

interface UploadProgressCallback {
  (progressPercent: number): void;
}

/**
 * Uploads a vehicle listing image to Firebase Storage with automatic compression and real-time upload progress tracking.
 * @param file Raw file uploaded by user
 * @param vehicleId Associated Vehicle/Listing ID to organize storage directories
 * @param onProgress Callback receiving current upload progress percentage
 * @returns Ref download URL of uploaded optimized file
 */
export async function uploadListingImage(
  file: File,
  vehicleId: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  // 1. Process image compression and optimization before transmission
  let uploadBlob: Blob = file;
  if (file.type.startsWith('image/')) {
    try {
      uploadBlob = await compressAndResizeImage(file);
      console.log(`[Media Pipeline] Image optimized successfully. Pre-upload size reduction complete.`);
    } catch (err) {
      console.warn('[Media Pipeline] Image optimization failed, uploading original fallback:', err);
    }
  }

  // 2. Generate a secure, structured path: /vehicles/{vehicleId}/images/{timestamp}-{fileName}
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `vehicles/${vehicleId}/images/${Date.now()}-${cleanFileName}`;
  const storageRef = ref(storage, storagePath);

  // 3. Initiate resumable upload task
  const uploadTask = uploadBytesResumable(storageRef, uploadBlob, {
    contentType: file.type.startsWith('image/') ? 'image/jpeg' : file.type,
    customMetadata: {
      vehicleId,
      uploadedAt: new Date().toISOString(),
      originalSize: file.size.toString(),
      optimizedSize: uploadBlob.size.toString()
    }
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        console.error('[Storage Pipeline] File upload task failed:', error);
        reject(error);
      },
      async () => {
        // Complete, fetch download URL reference
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}
