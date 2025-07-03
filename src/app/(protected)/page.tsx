'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Compass, WifiOff, MapPinOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPartner, searchUsers } from '@/lib/api/core.api';
import type { Partner } from '@/lib/types';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { UUID } from 'crypto';

type SearchState = 'idle' | 'locating' | 'searching' | 'error';

export default function HomePage() {
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchUserId, setSearchUserId] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState([10]);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (searchState === 'searching' && searchUserId) {
      intervalId = setInterval(async () => {
        try {
          const partner: Partner | null = await getPartner(searchUserId);
          if (partner) {
            if (intervalId) clearInterval(intervalId);
            setSearchState('idle');
            setSearchUserId(null);
            toast({
              title: 'Partner Found!',
              description: `Connecting with ${partner.name}.`,
            });
            // The user who initiates the search is the "initiator" of the WebRTC call
            router.push(`/chat/${partner.signal_id}?initiator=true`);
          }
        } catch (error) {
          // It's normal to get 404s while polling, so we don't show an error toast here.
          console.log('No partner found yet...');
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [searchState, searchUserId, router, toast]);

  const handleFindPartner = () => {
    setSearchState('locating');
    setErrorDetails(null); // Reset previous errors
    const options = {
      enableHighAccuracy: false, // More reliable on mobile, uses Wi-Fi/cellular
      timeout: 10000, // 10 seconds
      maximumAge: 60000, // Allow caching location for 1 minute to improve speed
    };
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // This signal_id should be robustly unique for the WebRTC session.
          const signal_id = `session_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 9)}`;
          const res: UUID | null = await searchUsers({
            latitude,
            longitude,
            radius_km: radiusKm[0],
            signal_id,
          });

          if (res) {
            setSearchUserId(res);
            setSearchState('searching');
          } else {
            throw new Error('Failed to start search. Please try again.');
          }
        } catch (error: any) {
          const errorMessage =
            error.message || 'The server could not start your search.';
          setErrorDetails(errorMessage);
          toast({
            variant: 'destructive',
            title: 'Search Failed',
            description: errorMessage,
          });
          setSearchState('error');
        }
      },
      (error) => {
        let title = 'Location Error';
        let description = 'An unknown location error occurred.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            title = 'Location Access Denied';
            description =
              "To find a partner, this app needs your location. Please go to your browser's settings and allow location access for this site.";
            break;
          case error.POSITION_UNAVAILABLE:
            title = 'Location Unavailable';
            description =
              'We were unable to determine your location. Please ensure you have a stable network connection and try again.';
            break;
          case error.TIMEOUT:
            title = 'Location Request Timed Out';
            description =
              'The request for your location took too long. Please try again.';
            break;
        }
        setErrorDetails(description);
        toast({
          variant: 'destructive',
          title: title,
          description: description,
        });
        setSearchState('error');
      },
      options
    );
  };

  const renderContent = () => {
    switch (searchState) {
      case 'locating':
        return (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg">Getting your location...</p>
          </>
        );
      case 'searching':
        return (
          <>
            <div className="relative">
              <Compass className="h-16 w-16 text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 animate-ping rounded-full bg-accent/50"></div>
              </div>
            </div>
            <p className="mt-4 text-lg">Searching for a partner...</p>
            <p className="text-muted-foreground">This may take a moment.</p>
          </>
        );
      case 'error':
        return (
          <>
            <MapPinOff className="h-12 w-12 text-destructive" />
            <p className="mt-4 text-lg font-semibold">Location Error</p>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              {errorDetails}
            </p>
            <Button
              onClick={() => {
                setSearchState('idle');
                setErrorDetails(null);
              }}
              className="mt-6"
            >
              Try Again
            </Button>
          </>
        );
      case 'idle':
      default:
        return (
          <div className="w-full space-y-6">
            <div className="space-y-4">
              <Label htmlFor="radius-slider">
                Search Radius: {radiusKm[0]} km
              </Label>
              <Slider
                id="radius-slider"
                min={1}
                max={100}
                step={1}
                value={radiusKm}
                onValueChange={setRadiusKm}
                className="w-full"
              />
            </div>
            <Button size="lg" onClick={handleFindPartner} className="w-full">
              Find a Partner
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="container flex flex-1 flex-col items-center justify-center py-10">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">
            Ready to Connect?
          </CardTitle>
          <CardDescription>
            Click the button below to find a random partner to video chat with.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8 min-h-[200px]">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
