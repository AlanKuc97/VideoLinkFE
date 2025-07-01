
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Compass, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPartner, searchUsers } from '@/lib/api/core.api';
import type { Partner } from '@/lib/types';

type SearchState = 'idle' | 'locating' | 'searching' | 'error';

export default function HomePage() {
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchUserId, setSearchUserId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (searchState === 'searching' && searchUserId) {
      intervalId = setInterval(async () => {
        try {
          const partner: Partner | null = await getPartner(searchUserId);
          if (partner) {
            setSearchState('idle');
            setSearchUserId(null);
            if (intervalId) clearInterval(intervalId);
            toast({ title: "Partner Found!", description: `Connecting with ${partner.name}.`});
            router.push(`/chat/${partner.signal_id}`); // Use signal_id as a unique room identifier
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
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // For now, we need a placeholder signal_id. In a real app, this would be generated
          // as part of the WebRTC signaling setup.
          const signal_id = `user_${Date.now()}`;
          const res = await searchUsers({ latitude, longitude, radius_km: 10, signal_id });
          setSearchUserId(res.search_user_id);
          setSearchState('searching');
        } catch (error: any) {
          toast({ variant: 'destructive', title: 'Search Failed', description: error.message });
          setSearchState('error');
        }
      },
      (error) => {
        toast({ variant: 'destructive', title: 'Location Error', description: 'Could not get your location. Please enable location services.' });
        setSearchState('error');
      }
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
            <WifiOff className="h-12 w-12 text-destructive" />
            <p className="mt-4 text-lg">Something went wrong.</p>
            <Button onClick={() => setSearchState('idle')} className="mt-4">Try Again</Button>
          </>
        );
      case 'idle':
      default:
        return (
          <Button size="lg" onClick={handleFindPartner}>Find a Partner</Button>
        );
    }
  };

  return (
    <div className="container flex flex-1 flex-col items-center justify-center py-10">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Ready to Connect?</CardTitle>
          <CardDescription>Click the button below to find a random partner to video chat with.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8 min-h-[200px]">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
