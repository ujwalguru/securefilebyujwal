import { Shield, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenu?: boolean;
  className?: string;
}

export default function Header({ onMenuClick, showMenu = false, className }: HeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          {showMenu && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              data-testid="button-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="space-y-0">
              <h1 className="text-xl font-bold text-primary">SecureShare</h1>
              <p className="text-xs text-muted-foreground leading-none">
                Encrypted File Sharing
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>Client-side Encryption</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex"
            onClick={() => {
              console.log('Info clicked');
              // todo: remove mock functionality - open info modal
            }}
            data-testid="button-info"
          >
            How it works
          </Button>
        </div>
      </div>
    </header>
  );
}