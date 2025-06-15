import { config } from '../config';

/**
 * Constructs a full API URL by combining the base URL, API base path, and endpoint
 * @param endpoint - The API endpoint path
 * @param params - Optional path parameters to append
 * @returns The complete URL
 */
export function buildApiUrl(endpoint: string, params?: string): string {
  // Start with API base path
  let url = `/${config.api.baseUrl.replace(/^\/|\/$/g, '')}/${endpoint.replace(/^\//, '')}`;
  
  // Add params if they exist
  if (params) {
    url += `/${params.replace(/^\/|\/$/g, '')}`;
  }
  
  return url;
}
