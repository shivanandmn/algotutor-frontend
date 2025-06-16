import { useCallback, useEffect, useState } from 'react';
import { useLocalParticipant as useLKLocalParticipant } from "@livekit/components-react";
import { useDataChannel, useConnectionState } from "@livekit/components-react";
import { ConnectionState } from 'livekit-client';

/**
 * Custom hook to manage voice control functionality
 */
export function useVoiceControl(problemContext: string) {
  const { localParticipant } = useLKLocalParticipant();
  const { send } = useDataChannel('problemContext');
  const connectionState = useConnectionState();
  const [contextSent, setContextSent] = useState(false);
  
  // Enable microphone when participant joins
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
      })();
    }
  }, [connectionState, contextSent, send, problemContext]);

  // Toggle microphone state
  const toggleMicrophone = useCallback(async () => {
    if (!localParticipant) return;
    const enabled = !localParticipant.isMicrophoneEnabled;
    await localParticipant.setMicrophoneEnabled(enabled);
  }, [localParticipant]);

  return {
    isMicrophoneEnabled: localParticipant?.isMicrophoneEnabled || false,
    toggleMicrophone,
    isConnected: connectionState === ConnectionState.Connected
  };
}
