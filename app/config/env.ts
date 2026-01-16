/**
 * This file defines environment variables for server-side code.
 */
export const API_BASE_URL = (() => {
  const value = import.meta.env.VITE_API_BASE_URL;
  if (!value) {
    throw new Error('API_BASE_URL is not set');
  }
  return value;
})();
