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
 * Validate image file size before starting upload or compression.
 * Rejects files larger than maxSizeKB (default 10240KB / 10MB).
 */
export function validateFileSize(file: File, maxSizeKB = 10240): { valid: boolean; error?: string } {
  const maxBytes = maxSizeKB * 1024;
  if (file.size > maxBytes) {
    const fileSizeKB = Math.round(file.size / 1024);
    return {
      valid: false,
      error: `File size (${fileSizeKB}KB) exceeds the maximum allowed limit of ${maxSizeKB}KB before upload processing.`
    };
  }
  return { valid: true };
}

/**
 * Compress images on the client side before upload using canvas
 * to optimize network bandwidth and storage costs.
 * Default for logo & branding assets & vehicle photos: maxDim 1920px (Full HD), quality 0.9.
 */
export function compressImage(file: File, maxDim = 1920, quality = 0.9): Promise<File> {
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

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // Fallback to raw file if canvas fails
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // AUTOMATIC WATERMARK STAMP FOR BAZAR360.ONLINE (Optional stamp for high-res cards)
        if (maxDim > 600) {
          try {
            ctx.save();
            const fontSize = Math.max(12, Math.round(canvas.width * 0.022));
            ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
            const text = "Bazar360.online";
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;
            
            const padding = fontSize * 1.2;
            const x = canvas.width - textWidth - padding;
            const y = canvas.height - padding;
            
            // Draw a clean, elegant semi-transparent text stamp with subtle drop-shadow
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)"; // Sleek semi-transparent white
            ctx.shadowColor = "rgba(0, 0, 0, 0.6)";      // Dark shadow for high contrast
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            ctx.fillText(text, x, y);
            ctx.restore();
          } catch (watermarkErr) {
            console.warn('[Watermark Pipeline] Failed to draw watermark:', watermarkErr);
          }
        }

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
 * - Pre-upload 500KB size validation guard
 * - Client-side canvas compression (max 400px, quality 0.8 default)
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
    maxDim?: number;
    quality?: number;
    maxSizeKB?: number;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    folder?: string;
    tags?: string;
  } = {}
) : Promise<CloudinaryUploadResult> {
  const { onProgress, maxRetries = 3, compress = true, maxDim = 1920, quality = 0.9, maxSizeKB, resourceType = 'auto', folder, tags } = options;

  // Strict client-side validation check blocking files over maxSizeKB (default 500KB if specified)
  if (maxSizeKB) {
    const check = validateFileSize(file, maxSizeKB);
    if (!check.valid) {
      throw new Error(check.error);
    }
  }

  let uploadFile = file;
  if (compress && file.type.startsWith('image/')) {
    try {
      uploadFile = await compressImage(file, maxDim, quality);
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
            if (!response.secure_url) {
              reject(new Error('Cloudinary response missing secure_url field.'));
              return;
            }
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
      console.warn(`[Cloudinary] Client upload attempt ${attempt} failed:`, err.message || err);
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, etc.
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // Fallback: If client-side direct uploads fail due to CORS or network restrictions, route through Server API Proxy
  console.warn('[Cloudinary] Direct browser upload failed, attempting fallback via server proxy endpoint...');
  try {
    return await uploadViaServerProxy(uploadFile, { folder, resourceType: resolvedType, tags });
  } catch (proxyErr: any) {
    console.error('[Cloudinary] Server proxy upload fallback also failed:', proxyErr);
    throw lastError || proxyErr || new Error('Cloudinary upload failed after multiple retries.');
  }
}

/**
 * Helper to convert File object to Base64 data string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Server-side upload proxy fallback for environments with blocked cross-origin requests
 */
async function uploadViaServerProxy(
  file: File, 
  options: { folder?: string; resourceType?: string; tags?: string }
): Promise<CloudinaryUploadResult> {
  const base64 = await fileToBase64(file);
  const response = await fetch('/api/cloudinary/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileData: base64,
      folder: options.folder || 'bazar360/uploads',
      resourceType: options.resourceType || 'image',
      tags: options.tags
    })
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error || `Server proxy upload failed with status ${response.status}`);
  }

  const result = await response.json();
  if (!result.secure_url) {
    throw new Error('Server proxy response missing secure_url');
  }
  return {
    url: result.url,
    secure_url: result.secure_url,
    public_id: result.public_id,
    format: result.format,
    resource_type: result.resource_type,
    bytes: result.bytes
  };
}

/**
 * Directly upload base64 data URL string to Cloudinary and return the secure HTTPS URL.
 */
export async function uploadBase64ToCloudinary(
  base64Data: string,
  folder: string = 'bazar360_branding'
): Promise<string> {
  if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:')) {
    return base64Data;
  }
  try {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append('file', base64Data);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('api_key', CLOUDINARY_API_KEY);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      if (result.secure_url || result.url) {
        return result.secure_url || result.url;
      }
    }

    // Direct fetch failed, attempt server proxy
    console.warn('[Cloudinary] Direct base64 fetch failed, attempting server proxy upload...');
    const proxyRes = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileData: base64Data, folder, resourceType: 'image' })
    });

    if (proxyRes.ok) {
      const result = await proxyRes.json();
      if (result.secure_url || result.url) {
        return result.secure_url || result.url;
      }
    }

    return base64Data;
  } catch (err) {
    console.warn('[Cloudinary] Base64 upload failed:', err);
    return base64Data;
  }
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

import { auth } from '../firebase';

/**
 * Request server-side deletion of Cloudinary assets.
 * Securely contacts our Express API, keeping Cloudinary API Secrets safe in backend memory.
 */
export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!publicId) return { success: false, error: 'Public ID is required for deletion.' };

  try {
    const user = auth.currentUser;
    const idToken = user ? await user.getIdToken() : '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }

    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers,
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
