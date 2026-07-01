// Converts a File object to a base64 data URL, with basic type/size validation.
// Returns a Promise<string> resolving to the data URL, or rejects with an Error.
export const fileToBase64 = (file, { maxSizeMB = 4 } = {}) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select an image file'));
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      reject(new Error(`Image must be under ${maxSizeMB}MB`));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};
