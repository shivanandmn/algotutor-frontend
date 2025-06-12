import { config } from '../config';

/**
 * Constructs a full API URL by combining the base URL, API base path, and endpoint
 * @param endpoint - The API endpoint path
 * @param params - Optional path parameters to append
 * @returns The complete URL
 */
export function buildApiUrl(endpoint: string, params?: string): string {
  try {
    // Create URL object from base URL
    const url = new URL(config.api.url);
    
    // Combine API base path and endpoint
    const apiPath = [config.api.baseUrl, endpoint]
      .map(part => part.replace(/^\/|\/$/g, '')) // Remove leading/trailing slashes
      .filter(Boolean)
      .join('/');
    
    // Add params if they exist
    if (params) {
      const cleanParams = params.replace(/^\/|\/$/g, '');
      if (cleanParams) {
        url.pathname = `${apiPath}/${cleanParams}`;
      } else {
        url.pathname = apiPath;
      }
    } else {
      url.pathname = apiPath;
    }
    
    return url.toString();
  } catch (error) {
    console.error('Error building API URL:', error);
    if (error instanceof Error) {
      throw new Error(`Invalid API URL configuration: ${error.message}`);
    }
    throw new Error('Invalid API URL configuration');
  }
}
