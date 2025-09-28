import { useState } from 'react';
import { Lock, Unlock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PatternGrid from './PatternGrid';
import { validatePatternStrength } from '@/lib/crypto';
import { cn } from '@/lib/utils';

interface EncryptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (credentials: { pattern?: number[]; passphrase?: string }) => Promise<void>;
  mode: 'encrypt' | 'decrypt';
  filename?: string;
  loading?: boolean;
  error?: string;
}

export default function EncryptionModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  filename,
  loading = false,
  error
}: EncryptionModalProps) {
  const [activeTab, setActiveTab] = useState<'pattern' | 'passphrase'>('pattern');
  const [pattern, setPattern] = useState<number[]>([]);
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    let credentials: { pattern?: number[]; passphrase?: string } = {};
    
    if (activeTab === 'pattern') {
      if (pattern.length < 4) return;
      credentials.pattern = pattern;
    } else {
      if (!passphrase.trim()) return;
      credentials.passphrase = passphrase;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(credentials);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setPattern([]);
    setPassphrase('');
    setActiveTab('pattern');
    onClose();
  };

  const patternValidation = pattern.length >= 4 ? validatePatternStrength(pattern) : null;
  const isValid = activeTab === 'pattern' 
    ? pattern.length >= 4 && patternValidation?.isValid 
    : passphrase.trim().length > 0;

  const getTitle = () => {
    if (mode === 'encrypt') return 'Set Encryption Key';
    return `Decrypt${filename ? ` ${filename}` : ' File'}`;
  };

  const getDescription = () => {
    if (mode === 'encrypt') {
      return 'Choose a secure pattern or passphrase to encrypt your file. This will be required to decrypt it later.';
    }
    return 'Enter the pattern or passphrase used to encrypt this file.';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="encryption-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {mode === 'encrypt' ? (
              <Lock className="w-5 h-5 text-primary" />
            ) : (
              <Unlock className="w-5 h-5 text-primary" />
            )}
            <span>{getTitle()}</span>
          </DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pattern' | 'passphrase')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pattern" data-testid="tab-pattern">
              Pattern
            </TabsTrigger>
            <TabsTrigger value="passphrase" data-testid="tab-passphrase">
              Passphrase
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pattern" className="space-y-4">
            <div className="space-y-4">
              <PatternGrid 
                onPatternChange={setPattern}
                disabled={isSubmitting}
                className="scale-75 origin-top"
              />
              
              {pattern.length > 0 && pattern.length < 4 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Pattern must connect at least 4 dots
                  </AlertDescription>
                </Alert>
              )}
              
              {patternValidation && (
                <div className={cn(
                  "text-sm text-center font-medium",
                  patternValidation.strength === 'strong' ? 'text-green-400' :
                  patternValidation.strength === 'medium' ? 'text-yellow-400' : 'text-destructive'
                )}>
                  {patternValidation.message}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="passphrase" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passphrase">
                {mode === 'encrypt' ? 'Create Passphrase' : 'Enter Passphrase'}
              </Label>
              <div className="relative">
                <Input
                  id="passphrase"
                  type={showPassphrase ? "text" : "password"}
                  placeholder={mode === 'encrypt' ? 'Create a strong passphrase' : 'Enter the passphrase'}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  disabled={isSubmitting}
                  className="pr-10"
                  data-testid="input-passphrase"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  data-testid="button-toggle-passphrase"
                >
                  {showPassphrase ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {mode === 'encrypt' && passphrase.length > 0 && passphrase.length < 8 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Passphrase should be at least 8 characters for better security
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            data-testid="button-submit"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>
                  {mode === 'encrypt' ? 'Encrypting...' : 'Decrypting...'}
                </span>
              </div>
            ) : (
              mode === 'encrypt' ? 'Encrypt File' : 'Decrypt File'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}