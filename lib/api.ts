const DEFAULT_API_URL = "http://localhost:8000";

export const getApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");

export const buildActivityImageUrl = (imageName: string) => {
  const baseUrl = getApiBaseUrl();
  const safeName = encodeURIComponent(imageName);
  return `${baseUrl}/activities/image/${safeName}?ngrok-skip-browser-warning=true`;
};
