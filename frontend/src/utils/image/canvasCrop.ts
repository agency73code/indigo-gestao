import imageCompression from 'browser-image-compression';

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Apply EXIF orientation to canvas context
 */
const applyOrientation = (
  ctx: CanvasRenderingContext2D,
  orientation: number,
  width: number,
  height: number
) => {
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0);
      break;
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height);
      break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height);
      break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0);
      break;
    case 7:
      ctx.transform(0, -1, -1, 0, height, width);
      break;
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width);
      break;
    default:
      // No transformation needed
      break;
  }
};

/**
 * Create a cropped image from the original image
 */
export const getCroppedImage = (
  imageSrc: string,
  cropPixels: Area,
  orientation: number = 1,
  size: number = 512
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      canvas.width = size;
      canvas.height = size;

      // Apply orientation transformation
      ctx.save();
      applyOrientation(ctx, orientation, size, size);

      // Draw the cropped area onto the canvas
      ctx.drawImage(
        image,
        cropPixels.x,
        cropPixels.y,
        cropPixels.width,
        cropPixels.height,
        0,
        0,
        size,
        size
      );

      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        'image/webp',
        0.9
      );
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    image.src = imageSrc;
  });
};

/**
 * Compress and convert image to WebP format
 */
export const compressImage = async (
  file: File,
  maxSizeKB: number = 500
): Promise<Blob> => {
  try {
    const options = {
      maxSizeMB: maxSizeKB / 1024,
      maxWidthOrHeight: 512,
      useWebWorker: true,
      fileType: 'image/webp' as const,
      initialQuality: 0.9,
    };

    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Erro ao processar imagem');
  }
};

/**
 * Create a File object from a Blob
 */
export const createFileFromBlob = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, {
    type: blob.type,
    lastModified: Date.now(),
  });
};