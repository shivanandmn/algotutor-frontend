"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useConnectionState,
  useDataChannel,
  useLocalParticipant
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { motion } from "framer-motion";
import { useCallback, useState, useEffect } from "react";
import { useLiveKitConnection } from "../hooks/useLiveKitConnection";

/**
 * Helper function to handle device failures
 */
function onDeviceFailure(error: Error) {
  console.error("Media device failure:", error);
  alert(
    `Error acquiring camera or microphone permissions: ${error.message}. Please make sure you grant the necessary permissions in your browser and reload the tab.`
  );
}

interface VoiceBotProps {
  context: string;
}

export function VoiceBot({ context }: VoiceBotProps) {
  // Use our custom hook for LiveKit connection management
  const {
    token,
    userName,
    isConnecting,
    error,
    connect,
    disconnect,
    handleError,
    liveKitUrl
  } = useLiveKitConnection();
  
  // Create the problem context object
  const problemContext = JSON.stringify({
    type: 'problem_info',
    title: context,
    content: context,
    userName
  });
  
  // Handle connection button click
  const handleConnect = useCallback(async () => {
    const success = await connect();
    if (!success) {
      onDeviceFailure(error || new Error('Failed to connect'));
    }
  }, [connect, error]);

  return (
    <div className="flex justify-end mb-2">
      {token ? (
        <>
          <LiveKitRoom
            token={token}
            serverUrl={liveKitUrl}
            connect={true}
            onDisconnected={disconnect}
            audio={true}
            video={false}
            onError={handleError}
            options={{ adaptiveStream: true, dynacast: true }}
          >
            <RoomContent 
              userName={userName} 
              problemContext={problemContext} 
              onDisconnect={disconnect} 
            />
            <RoomAudioRenderer />
          </LiveKitRoom>
          <div>
            <button
              onClick={disconnect}
              className="px-3 py-1.5 flex items-center justify-center gap-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:opacity-90 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
              <span>Disconnect</span>
            </button>
          </div>
        </>
      ) : (
        <ConnectButton 
          onClick={handleConnect} 
          isConnecting={isConnecting} 
        />
      )}
    </div>
  );
}

// Component to handle room functionality once connected
function RoomContent({ onDisconnect, userName, problemContext }: { onDisconnect: () => void, userName: string | null, problemContext: string }) {
  const { localParticipant } = useLocalParticipant();
  const { send } = useDataChannel('problemContext');
  const connectionState = useConnectionState();
  const [contextSent, setContextSent] = useState(false);

  // Enable microphone when connected
  useEffect(() => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(true);
    }
  }, [localParticipant]);

  // Send problem context when connected
  useEffect(() => {
    if (connectionState === ConnectionState.Connected && !contextSent) {
      (async () => {
        await send(new TextEncoder().encode(problemContext), { reliable: true });
        setContextSent(true);
        console.log('Problem context sent');
      })();
    }
  }, [connectionState, contextSent, send, problemContext]);

  return null; // This component doesn't render anything visible
}

export default VoiceBot;

interface ConnectButtonProps {
  onClick: () => void;
  isConnecting?: boolean;
}

function ConnectButton({ onClick, isConnecting = false }: ConnectButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <button
        onClick={onClick}
        disabled={isConnecting}
        className={`px-3 py-1.5 flex items-center justify-center gap-1.5 ${isConnecting ? 'bg-blue-400' : 'bg-blue-600'} text-white rounded-md text-sm font-medium hover:opacity-90 transition-colors`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
        <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
      </button>
    </motion.div>
  );
}




