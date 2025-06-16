import { useState, useCallback, useEffect } from 'react';
import { ConnectionState } from 'livekit-client';

const LIVEKIT_URL = process.env.VITE_LIVEKIT_URL || 'wss://thinkloud-9x8bbl7h.livekit.cloud';
const TOKEN_ENDPOINT = '/api/token';

/**
 * Custom hook to manage LiveKit connection state and functionality
 */
export function useLiveKitConnection() {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch LiveKit token for connection
   */
  const getToken = useCallback(async (userName: string, roomName: string) => {
    try {
      const response = await fetch(`${TOKEN_ENDPOINT}?name=${encodeURIComponent(userName)}&room=${encodeURIComponent(roomName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.text();
      return data;
    } catch (error) {
      console.error('Failed to fetch LiveKit token:', error);
      throw error;
    }
  }, []);

  /**
   * Connect to LiveKit room
   */
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const name = `user-${Math.floor(Math.random() * 1000)}`;
      const roomName = `livekit-voice-room3${name}`;
      
      const newToken = await getToken(name, roomName);
      
      setUserName(name);
      setToken(newToken);
      return true;
    } catch (error) {
      console.error("Failed to connect to LiveKit room:", error);
      const connectionError = error instanceof Error ? error : new Error(String(error));
      setError(connectionError);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [getToken]);

  /**
   * Disconnect from LiveKit room
   */
  const disconnect = useCallback(() => {
    console.log("Disconnecting from LiveKit room");
    setToken(null);
    setUserName(null);
  }, []);

  /**
   * Handle connection errors
   */
  const handleError = useCallback((error: Error) => {
    console.error("LiveKit connection error:", error);
    setError(error);
    setToken(null);
  }, []);

  return {
    token,
    userName,
    isConnecting,
    error,
    connect,
    disconnect,
    handleError,
    liveKitUrl: LIVEKIT_URL
  };
}
