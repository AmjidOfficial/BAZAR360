/**
 * Cloudinary Media Integration Service for Bazar360.online
 * Complete client-side media compression, upload manager with retry logic,
 * progress tracking, and on-demand automatic image optimization.
 */

// Cloudinary Configuration
export const CLOUDINARY_CLOUD_NAME = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || "me634xd0";
export const CLOUDINARY_UPLOAD_PRESET = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET || "bazar360_upload";
export const CLOUDINARY_API_KEY = (import.meta as any).env.VITE_CLOUDINARY_API_KEY || "165721653511945";

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: 'image' | 'video' | 'raw';
  bytes: number;
}

/**
 * Compress images on the client side before upload using canvas
 * to optimize network bandwidth and storage costs.
 */
export function compressImage(file: File, maxDim = 1200, quality = 0.82): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return resolve(file); // Only compress image types
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // Fallback to raw file if canvas fails
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', quality);
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * High-performance Cloudinary upload function with:
 * - Dynamic resource routing (images vs videos)
 * - Real-time progress updates
 * - Fail-safe retry with exponential backoff
 */
export async function uploadToCloudinary(
  file: File,
  options: {
    onProgress?: (progress: number) => void;
    maxRetries?: number;
    compress?: boolean;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    folder?: string;
    tags?: string;
  } = {}
) : Promise<CloudinaryUploadResult> {
  const { onProgress, maxRetries = 3, compress = true, resourceType = 'auto', folder, tags } = options;

  let uploadFile = file;
  if (compress && file.type.startsWith('image/')) {
    try {
      uploadFile = await compressImage(file);
    } catch (e) {
      console.warn('[Cloudinary] Pre-upload compression failed, uploading raw image:', e);
    }
  }

  // Determine resource type endpoint
  let resolvedType = resourceType;
  if (resolvedType === 'auto') {
    if (file.type.startsWith('video/')) {
      resolvedType = 'video';
    } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      resolvedType = 'raw';
    } else {
      resolvedType = 'image';
    }
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resolvedType}/upload`;

  // Internal upload routine with retries
  const attemptUpload = (attempt: number): Promise<CloudinaryUploadResult> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl, true);

      // Track progression
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        });
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              url: response.url,
              secure_url: response.secure_url,
              public_id: response.public_id,
              format: response.format,
              resource_type: response.resource_type,
              bytes: response.bytes
            });
          } catch (err) {
            reject(new Error('Cloudinary response parsing failed.'));
          }
        } else {
          try {
            const errRes = JSON.parse(xhr.responseText);
            reject(new Error(errRes.error?.message || `Cloudinary upload error (${xhr.status})`));
          } catch {
            reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during Cloudinary upload.'));
      };

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('api_key', CLOUDINARY_API_KEY);
      if (folder) {
        formData.append('folder', folder);
      }
      if (tags) {
        formData.append('tags', tags);
      }

      xhr.send(formData);
    });
  };

  // Run attempt with exponential backoff retry logic
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await attemptUpload(attempt);
    } catch (err: any) {
      lastError = err;
      console.warn(`[Cloudinary] Upload attempt ${attempt} failed:`, err.message || err);
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, etc.
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Cloudinary upload failed after multiple retries.');
}

/**
 * Generate automatic, optimized responsive image URLs using Cloudinary transformation parameters.
 * Forces automatic modern formats (WebP, AVIF) and optimal compression settings.
 */
export function getOptimizedUrl(
  urlOrPublicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'thumb' | 'scale' | 'limit';
    quality?: string;
    format?: string;
    watermark?: boolean;
  } = {}
): string {
  if (!urlOrPublicId) return '';

  const { width, height, crop = 'fill', quality = 'auto', format = 'auto', watermark = false } = options;

  // If we got a full URL, parse the public ID or use it as is if not Cloudinary
  let isCloudinary = urlOrPublicId.includes('cloudinary.com');
  if (!isCloudinary && !urlOrPublicId.startsWith('http')) {
    // If it's a raw public ID, construct the Cloudinary base URL
    isCloudinary = true;
    urlOrPublicId = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${urlOrPublicId}`;
  }

  if (!isCloudinary) {
    return urlOrPublicId; // Return raw external URL (e.g., Unsplash)
  }

  // Construct transformation string
  const transforms: string[] = [`f_${format}`, `q_${quality}`];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);
  if (watermark) {
    // Add professional semi-transparent text overlay watermark
    transforms.push('l_text:Arial_20_bold:Bazar360,co_white,o_40,g_south_east,y_15,x_15');
  }

  const transformString = transforms.join(',');

  // Insert transformations into the Cloudinary URL structure
  // Formats: .../upload/v12345/public_id or .../upload/public_id
  if (urlOrPublicId.includes('/upload/')) {
    const parts = urlOrPublicId.split('/upload/');
    return `${parts[0]}/upload/${transformString}/${parts[1]}`;
  }

  return urlOrPublicId;
}

/**
 * Generate a responsive Cloudinary image source set (srcset) for high-DPI screens and fluid layouts.
 */
export function getResponsiveSrcSet(urlOrPublicId: string, widths = [320, 640, 960, 1200, 1600]): string {
  if (!urlOrPublicId) return '';
  return widths
    .map((w) => `${getOptimizedUrl(urlOrPublicId, { width: w })} ${w}w`)
    .join(', ');
}

/**
 * Request server-side deletion of Cloudinary assets.
 * Securely contacts our Express API, keeping Cloudinary API Secrets safe in backend memory.
 */
export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!publicId) return { success: false, error: 'Public ID is required for deletion.' };

  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId, resourceType }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status} during deletion.`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[Cloudinary] Delete request failed:', error);
    return { success: false, error: error.message || 'Failed to communicate with Cloudinary delete API.' };
  }
}
