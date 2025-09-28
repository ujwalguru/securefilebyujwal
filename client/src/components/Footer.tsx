import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  return (
    <footer className={cn(
      "w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex flex-col items-center justify-center py-6 px-4 space-y-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Made with</span>
          <Heart className="w-4 h-4 text-destructive fill-current" />
          <span>by</span>
          <span className="font-semibold text-primary">Ujwal Guru</span>
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          Secure file sharing with client-side encryption
        </div>
      </div>
    </footer>
  );
}