
'use client';

import { useEffect, useRef, useState } from 'react';
import { VideoControls } from '@/components/VideoControls';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function ChatPage({ params }: { params: { id: string } }) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // In a real WebRTC application, you would use a peer connection.
  // const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
      } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Media Error',
            description: 'Could not access your camera and microphone. Please check permissions.',
        });
        router.push('/');
      }
    };
    startMedia();

    // Placeholder for WebRTC setup
    setupWebRTC();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
      // peerConnection.current?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupWebRTC = () => {
    // This is where you would set up your RTCPeerConnection.
    // 1. Create a new RTCPeerConnection.
    // 2. Add local stream tracks to the connection.
    // 3. Set up event handlers for ICE candidates and remote tracks.
    // 4. Use a signaling server (e.g., WebSockets) to exchange SDP offers/answers and ICE candidates.
    // The `params.id` would be the room or signal ID for this chat.
    console.log(`Setting up WebRTC for room: ${params.id}`);
    
    // For demonstration, we'll simulate a remote stream appearing after a delay.
    const timer = setTimeout(() => {
      // In a real app, this would be a MediaStream from the remote peer.
      // We are creating a dummy stream for visual representation.
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Remote Peer (Simulated)', canvas.width/2, canvas.height/2);
      }
      const dummyStream = canvas.captureStream();
      setRemoteStream(dummyStream);
    }, 3000);

    return () => clearTimeout(timer);
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleDisconnect = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex-1 relative w-full h-full">
            <VideoPlayer stream={remoteStream} isMuted={true} isPlaceholder={!remoteStream} />
            <div className="absolute bottom-4 right-4 z-10 w-1/4 max-w-xs">
                <VideoPlayer stream={localStream} isMuted={true} />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                <VideoControls
                    isMuted={isMuted}
                    isVideoOff={isVideoOff}
                    onToggleMute={toggleMute}
                    onToggleVideo={toggleVideo}
                    onDisconnect={handleDisconnect}
                />
            </div>
        </div>
    </div>
  );
}
