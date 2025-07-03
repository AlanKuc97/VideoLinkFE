'use client';

import { useEffect, useRef, useState } from 'react';
import { VideoControls } from '@/components/VideoControls';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

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
  // Effect for setting up and tearing down WebRTC connection
  useEffect(() => {
    // 1. Initialize Peer Connection
    peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

    // 2. Event handler for when a remote track is received
    peerConnection.current.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // 3. Event handler for generating ICE candidates
    // In a real app, these candidates would be sent to the other peer via a signaling server.
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('--- NEW ICE CANDIDATE --- Please send to other peer');
        console.log(
          JSON.stringify({ type: 'candidate', candidate: event.candidate })
        );
        // TODO: Send candidate to the other peer via signaling server
      }
    };

    // 4. Get local media
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        // Add local tracks to the peer connection
        stream.getTracks().forEach((track) => {
          peerConnection.current?.addTrack(track, stream);
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Media Error',
          description:
            'Could not access camera/microphone. Please check permissions.',
        });
        router.push('/');
      }
    };

    startMedia();

    // In a real application, you would also listen for signaling messages here
    // to handle offers, answers, and candidates from the other peer.

    // 5. Cleanup
    peerConnection.current?.close();
    localStream?.getTracks().forEach((track) => track.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect for handling the offer/answer flow based on initiator status
  useEffect(() => {
    const isInitiator = searchParams.get('initiator') === 'true';

    // This logic would be triggered by signaling messages in a real app.
    // The initiator creates the offer. The other peer receives it, creates an answer.
    if (isInitiator && peerConnection.current && localStream) {
      const createOffer = async () => {
        try {
          const offer = await peerConnection.current!.createOffer();
          await peerConnection.current!.setLocalDescription(offer);
          console.log('--- OFFER CREATED --- Please send to other peer');
          console.log(JSON.stringify({ type: 'offer', sdp: offer.sdp }));
          // TODO: Send offer to the other peer via signaling server
        } catch (error) {
          console.error('Error creating offer:', error);
        }
      };
      // A small delay ensures tracks are added before creating the offer.
      const timer = setTimeout(createOffer, 1000);
      return () => clearTimeout(timer);
    }
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
