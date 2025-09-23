/**
 * Utility function to read a file as data URL
 */
export const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (reader.result && typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    });
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });
};

/**
 * Validate file type and size
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Use JPG, PNG ou WebP (máx. 5MB).' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Use JPG, PNG ou WebP (máx. 5MB).' };
  }

  return { valid: true };
};

/**
 * Get image orientation from EXIF data
 */
export const getImageOrientation = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const dataView = new DataView(arrayBuffer);
      
      // Check if it's a valid JPEG
      if (dataView.getUint16(0) !== 0xFFD8) {
        resolve(1); // Default orientation
        return;
      }

      let offset = 2;
      let marker = dataView.getUint16(offset);
      offset += 2;

      while (marker !== 0xFFE1 && offset < dataView.byteLength) {
        offset += dataView.getUint16(offset) + 2;
        if (offset >= dataView.byteLength) break;
        marker = dataView.getUint16(offset);
        offset += 2;
      }

      if (marker !== 0xFFE1) {
        resolve(1); // No EXIF data
        return;
      }

      offset += 2; // Skip length
      if (dataView.getUint32(offset) !== 0x45786966) {
        resolve(1); // No EXIF signature
        return;
      }

      offset += 6; // Skip EXIF signature
      const little = dataView.getUint16(offset) === 0x4949;
      offset += dataView.getUint32(offset + 4, little);
      const tags = dataView.getUint16(offset, little);
      offset += 2;

      for (let i = 0; i < tags; i++) {
        if (dataView.getUint16(offset + (i * 12), little) === 0x0112) {
          resolve(dataView.getUint16(offset + (i * 12) + 8, little));
          return;
        }
      }

      resolve(1); // Default orientation
    };

    reader.readAsArrayBuffer(file.slice(0, 65536));
  });
};