import React, { useEffect, useState } from 'react';
import { getAssetUrl } from '../utils/assets';

export default function OriginalLogoImage({ src = 'logo.jpg', alt = 'Aqui Tem', height = 48, white = false, style = {}, className = '' }) {
  const targetSrc = getAssetUrl(src);
  const [processedSrc, setProcessedSrc] = useState(white ? '' : targetSrc);

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

        // Turn white and near-white background pixels into 100% transparent PNG alpha
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const isNeutral = Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && Math.abs(r - b) < 18;
          if (r > 215 && g > 215 && b > 215) {
            data[i + 3] = 0;
          } else if (isNeutral && r > 185 && g > 185 && b > 185) {
            const avg = (r + g + b) / 3;
            const alpha = Math.round(((215 - avg) / 30) * 255);
            data[i + 3] = alpha;
            if (white) {
              data[i] = 255;
              data[i + 1] = 255;
              data[i + 2] = 255;
            }
          } else if (white) {
            // Foreground pixel: make it pure white (#FFFFFF)
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        setProcessedSrc(canvas.toDataURL('image/png'));
      } catch (e) {
        console.warn('Could not process transparent logo image background:', e);
        setProcessedSrc(targetSrc);
      }
    };
  }, [src, targetSrc, white]);

  if (!processedSrc) return null;

  return (
    <img
      src={processedSrc}
      alt={alt}
      style={{ height: typeof height === 'number' ? `${height}px` : height, width: 'auto', objectFit: 'contain', ...style }}
      className={className}
    />
  );
}
