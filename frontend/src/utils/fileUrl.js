const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  if (/^https?:\/\//i.test(filePath) || filePath.startsWith('data:')) return filePath;

  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${base}${normalizedPath}`;
};

