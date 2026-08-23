/**
 * Image Processor Utility for Bazar360 / Auto Choice
 * Encapsulates client-side canvas resizing, compression, size validation, and payload protection.
 */

export interface ProcessImageOptions {
  maxDim?: number;      // Maximum width or height (default 1920px Full HD)
  quality?: number;     // Compression quality from 0.0 to 1.0 (default 0.9)
  maxSizeKB?: number;   // Max allowed size before processing in KB (default 5120KB / 5MB)
}

export interface ProcessedImageResult {
  compressedFile: File;
  originalSizeKB: number;
  compressedSizeKB: number;
  savedPercentage: number;
  width: number;
  height: number;
}

/**
 * Validates file size prior to processing or uploading.
 */
export function validateImageSize(file: File, maxSizeKB = 5120): { valid: boolean; error?: string; sizeKB: number } {
  const sizeKB = Math.round((file.size / 1024) * 10) / 10;
  if (file.size > maxSizeKB * 1024) {
    return {
      valid: false,
      sizeKB,
      error: `File size (${sizeKB} KB) exceeds maximum limit of ${maxSizeKB / 1024} MB.`,
    };
  }
  return { valid: true, sizeKB };
}

/**
 * Resizes and compresses an image using HTML Canvas for Full HD crisp quality.
 * Ensures payloads stay optimized for Cloudinary offloading.
 */
export async function processImageForUpload(
  file: File,
  options: ProcessImageOptions = {}
): Promise<ProcessedImageResult> {
  const { maxDim = 1920, quality = 0.9, maxSizeKB = 5120 } = options;

  // 1. Validation check
  const validation = validateImageSize(file, maxSizeKB);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const originalSizeKB = validation.sizeKB;

  // Non-image fallback
  if (!file.type.startsWith('image/')) {
    return {
      compressedFile: file,
      originalSizeKB,
      compressedSizeKB: originalSizeKB,
      savedPercentage: 0,
      width: 0,
      height: 0,
    };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down dimensions while retaining aspect ratio
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve({
          compressedFile: file,
          originalSizeKB,
          compressedSizeKB: originalSizeKB,
          savedPercentage: 0,
          width: img.width,
          height: img.height,
        });
      }

      // Smooth image scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve({
              compressedFile: file,
              originalSizeKB,
              compressedSizeKB: originalSizeKB,
              savedPercentage: 0,
              width,
              height,
            });
          }

          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
            type: mimeType,
            lastModified: Date.now(),
          });

          const compressedSizeKB = Math.round((compressedFile.size / 1024) * 10) / 10;
          const savedPercentage = Math.max(
            0,
            Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100)
          );

          resolve({
            compressedFile,
            originalSizeKB,
            compressedSizeKB,
            savedPercentage,
            width,
            height,
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for canvas processing: ' + err));
    };

    img.src = objectUrl;
  });
}

export const imageProcessor = {
  validateImageSize,
  processImageForUpload,
};

export default imageProcessor;
