'use client';

import { useEffect, useRef, useState } from 'react';
import { VideoControls } from '@/components/VideoControls';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

// Public STUN servers for NAT traversal.
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasMediaPermission, setHasMediaPermission] = useState(true);
  // Effect 1: Get user media
  useEffect(() => {
    let stream: MediaStream | null = null;
    const getMedia = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        setHasMediaPermission(true);
      } catch (error) {
        console.error('Error accessing media devices.', error);
        setHasMediaPermission(false);
        toast({
          variant: 'destructive',
          title: 'Media Access Denied',
          description:
            'Could not access camera/microphone. Please enable permissions in your browser settings.',
        });
      }
    };

    getMedia();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect 2: Setup WebRTC connection
  useEffect(() => {
    if (!localStream) {
      return; // Wait for the local stream to be ready
    }
    const isInitiator = searchParams.get('initiator') === 'true';
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnection.current = pc;
    // Add local stream tracks to the connection
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    // Event handler for when a remote track is received
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // Event handler for generating ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('--- NEW ICE CANDIDATE --- Please send to other peer');
        console.log(
          JSON.stringify({ type: 'candidate', candidate: event.candidate })
        );
        // TODO: Send candidate to the other peer via signaling server
      }
    };

    // If this user is the one who started the search, create the offer
    const createOffer = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        console.log('--- OFFER CREATED --- Please send to other peer');
        console.log(JSON.stringify({ type: 'offer', sdp: offer.sdp }));
        // TODO: Send offer to the other peer via signaling server
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    };

    if (isInitiator) {
      createOffer();
    }

    // Cleanup
    return () => {
      pc.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream, searchParams]);

  const toggleMute = () => {
    if (localStream) {
      const enabled = !isMuted;
      localStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = enabled));
      setIsMuted(!enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const enabled = !isVideoOff;
      localStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = enabled));
      setIsVideoOff(!enabled);
    }
  };

  const handleDisconnect = () => {
    peerConnection.current?.close();
    router.push('/');
  };

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 relative w-full h-full">
        {/* Remote video player */}
        <VideoPlayer
          stream={remoteStream}
          isMuted={false}
          isPlaceholder={!remoteStream}
        />

        {/* Local video player in the corner */}
        <div className="absolute bottom-4 right-4 z-10 w-1/4 max-w-xs">
          <VideoPlayer stream={localStream} isMuted={true} />
        </div>

        {!hasMediaPermission && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30 p-4">
            <Alert variant="destructive" className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Camera & Microphone Required</AlertTitle>
              <AlertDescription>
                This app needs access to your camera and microphone to start a
                video chat. Please grant permission in your browser&apos;s
                address bar. You may need to reload the page after granting
                permission.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Controls */}
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
