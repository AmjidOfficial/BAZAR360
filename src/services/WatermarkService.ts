/**
 * WatermarkService.ts
 * High-performance browser-side watermarking engine.
 * Applies professional branding to vehicle media and showroom logos.
 */

export const applyWatermark = async (imageFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Keep original aspect ratio and dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Calculate watermark scale based on image width
        // Ensure watermark size is proportional
        const baseSize = Math.max(14, Math.floor(canvas.width * 0.022));
        ctx.font = `bold ${baseSize}px "Inter", "Space Grotesk", sans-serif`;
        
        const watermarkText = 'Bazar360.online';
        const textMetrics = ctx.measureText(watermarkText);
        const textWidth = textMetrics.width;
        
        // Positioning details: bottom right with standard margin
        const padding = baseSize * 1.2;
        const x = canvas.width - textWidth - padding;
        const y = canvas.height - padding;

        // Draw a clean, elegant semi-transparent text stamp with subtle drop-shadow for legibility on all backgrounds
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'; // Sleek semi-transparent white
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';      // Dark shadow for high contrast
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(watermarkText, x, y);
        ctx.restore();

        // Convert canvas to Data URL (High quality JPEG)
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
};
