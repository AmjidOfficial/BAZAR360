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
        const baseSize = Math.max(16, Math.floor(canvas.width * 0.025));
        ctx.font = `bold ${baseSize}px "Inter", "Space Grotesk", sans-serif`;
        
        const watermarkText = 'Bazar360.online';
        const textMetrics = ctx.measureText(watermarkText);
        const textWidth = textMetrics.width;
        
        // Positioning details: bottom right with standard margin
        const padding = baseSize * 0.8;
        const x = canvas.width - textWidth - padding;
        const y = canvas.height - padding;

        // Draw a premium glassmorphic background capsule for the watermark text
        const badgeWidth = textWidth + padding;
        const badgeHeight = baseSize * 1.8;
        const badgeX = x - padding / 2;
        const badgeY = y - baseSize * 1.2;

        ctx.save();
        // Soft dark backdrop shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 15;
        
        // Draw rounded rectangle
        ctx.beginPath();
        const radius = badgeHeight / 2;
        ctx.roundRect ? ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, radius) : ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
        ctx.fill();
        ctx.restore();

        // Draw watermark text (High contrast Golden / Orange aesthetic)
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(watermarkText, x, y);

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
