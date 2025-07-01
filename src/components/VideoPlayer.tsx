
'use client';

import { useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Loader2, VideoOff } from 'lucide-react';

interface VideoPlayerProps {
  stream: MediaStream | null;
  isMuted?: boolean;
  isPlaceholder?: boolean;
}

export function VideoPlayer({ stream, isMuted = false, isPlaceholder = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <Card className="w-full h-full overflow-hidden bg-black aspect-video flex items-center justify-center relative shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className={`w-full h-full object-cover transition-opacity duration-300 ${stream ? 'opacity-100' : 'opacity-0'}`}
      />
      {!stream && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-secondary/20">
          {isPlaceholder ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-2">Connecting...</p>
            </>
          ) : (
            <>
              <VideoOff className="h-12 w-12" />
              <p className="mt-2">No Video</p>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
