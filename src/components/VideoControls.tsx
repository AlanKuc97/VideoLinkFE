
import { Button } from './ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { Card } from './ui/card';

interface VideoControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onDisconnect: () => void;
}

export function VideoControls({
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
  onDisconnect,
}: VideoControlsProps) {
  return (
    <Card className="p-2 rounded-full shadow-2xl">
      <div className="flex items-center space-x-2">
        <Button
          variant={isMuted ? 'destructive' : 'secondary'}
          size="icon"
          className="rounded-full h-12 w-12"
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
        <Button
          variant={isVideoOff ? 'destructive' : 'secondary'}
          size="icon"
          className="rounded-full h-12 w-12"
          onClick={onToggleVideo}
          aria-label={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
        >
          {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="rounded-full h-12 w-12"
          onClick={onDisconnect}
          aria-label="Disconnect"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </Card>
  );
}
