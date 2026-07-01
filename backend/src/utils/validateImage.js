// Validates that a string is either an http(s) URL or a reasonably-sized base64 image data URL.
// Returns an error message string if invalid, or null if valid/empty.
export const validateImageField = (value, label = 'Image') => {
  if (!value) return null;
  if (typeof value !== 'string') return `${label} must be a string`;

  const isDataUrl = value.startsWith('data:image/');
  const isHttpUrl = /^https?:\/\//.test(value);

  if (!isDataUrl && !isHttpUrl) {
    return `${label} must be an image upload or a valid URL`;
  }
  // ~4MB raw image ceiling (base64 encoding inflates size by ~33%)
  if (isDataUrl && value.length > 5_600_000) {
    return `${label} is too large. Please use an image under 4MB.`;
  }
  return null;
};
