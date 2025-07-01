
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <HeartPulse className="h-8 w-8 text-primary" />
      <span className="font-headline text-2xl font-bold">ConnectNow</span>
    </Link>
  );
}
