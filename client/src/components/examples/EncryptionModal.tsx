import EncryptionModal from '../EncryptionModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function EncryptionModalExample() {
  const [isEncryptOpen, setIsEncryptOpen] = useState(false);
  const [isDecryptOpen, setIsDecryptOpen] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleEncrypt = async (credentials: { pattern?: number[]; passphrase?: string }) => {
    console.log('Encrypting with credentials:', credentials);
    // Simulate encryption process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setResult(`File encrypted with ${credentials.pattern ? 'pattern' : 'passphrase'}`);
    setIsEncryptOpen(false);
  };

  const handleDecrypt = async (credentials: { pattern?: number[]; passphrase?: string }) => {
    console.log('Decrypting with credentials:', credentials);
    // Simulate decryption process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success/failure
    const success = Math.random() > 0.3; // 70% success rate for demo
    if (success) {
      setResult(`File decrypted successfully with ${credentials.pattern ? 'pattern' : 'passphrase'}`);
      setIsDecryptOpen(false);
    } else {
      throw new Error('Incorrect pattern or passphrase');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-primary">Encryption Modal</h2>
        <p className="text-muted-foreground">
          Test the encryption and decryption modal dialogs
        </p>
      </div>
      
      <div className="space-y-4">
        <Button 
          onClick={() => setIsEncryptOpen(true)} 
          className="w-full"
          data-testid="button-open-encrypt"
        >
          Open Encryption Modal
        </Button>
        
        <Button 
          onClick={() => setIsDecryptOpen(true)} 
          variant="outline" 
          className="w-full"
          data-testid="button-open-decrypt"
        >
          Open Decryption Modal
        </Button>
      </div>
      
      {result && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="text-green-400 font-medium">Success!</div>
          <div className="text-sm text-muted-foreground mt-1">{result}</div>
        </div>
      )}

      <EncryptionModal
        isOpen={isEncryptOpen}
        onClose={() => setIsEncryptOpen(false)}
        onSubmit={handleEncrypt}
        mode="encrypt"
      />

      <EncryptionModal
        isOpen={isDecryptOpen}
        onClose={() => setIsDecryptOpen(false)}
        onSubmit={handleDecrypt}
        mode="decrypt"
        filename="example_document.pdf"
      />
    </div>
  );
}