import React, { useEffect, useState } from 'react';
import { getAssetUrl } from '../utils/assets';

export default function OriginalLogoImage({ src = 'logo.jpg', alt = 'Aqui Tem', height = 48, style = {}, className = '' }) {
  const targetSrc = getAssetUrl(src);
  const [processedSrc, setProcessedSrc] = useState(targetSrc);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = targetSrc;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Turn white and near-white pixels into 100% transparent alpha
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Check for pure white or near-white background pixels
          if (r > 225 && g > 225 && b > 225) {
            data[i + 3] = 0; // Transparent
          }
        }

        ctx.putImageData(imageData, 0, 0);
        setProcessedSrc(canvas.toDataURL('image/png'));
      } catch (e) {
        console.warn('Could not process transparent logo image background:', e);
      }
    };
  }, [src]);

  return (
    <img
      src={processedSrc}
      alt={alt}
      style={{ height: typeof height === 'number' ? `${height}px` : height, width: 'auto', objectFit: 'contain', ...style }}
      className={className}
    />
  );
}
