import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, Shield, Lock } from "lucide-react";

// Components
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PatternGrid from "@/components/PatternGrid";
import FileUpload from "@/components/FileUpload";
import FileDashboard from "@/components/FileDashboard";
import EncryptionModal from "@/components/EncryptionModal";
import FilePreview from "@/components/FilePreview";

// Crypto utilities
import { 
  generateSalt, 
  deriveKeyFromPattern, 
  encryptFile, 
  decryptFile,
  packageFile,
  parsePackage,
  patternToString,
  bytesToBase64,
  base64ToBytes
} from "@/lib/crypto";

// Types
import type { FileRecord } from "@shared/schema";

// Mock data for demo - todo: remove mock functionality
const mockFiles: FileRecord[] = [
  {
    id: '1',
    username: 'alice',
    filename: 'document_encrypted.enc',
    originalFilename: 'Project_Proposal.pdf',
    mimetype: 'application/pdf',
    size: 2547832,
    downloadUrl: 'https://example.com/files/1.enc',
    uploadTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    salt: 'base64salt1',
    iv: 'base64iv1',
    kdf: 'PBKDF2',
    iterations: 200000,
    algorithm: 'AES-GCM',
    version: '1.0'
  },
  {
    id: '2',
    username: 'bob',
    filename: 'image_encrypted.enc',
    originalFilename: 'vacation_photo.jpg',
    mimetype: 'image/jpeg',
    size: 1234567,
    downloadUrl: 'https://example.com/files/2.enc',
    uploadTimestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    salt: 'base64salt2',
    iv: 'base64iv2',
    kdf: 'PBKDF2',
    iterations: 200000,
    algorithm: 'AES-GCM',
    version: '1.0'
  },
  {
    id: '3',
    username: 'charlie',
    filename: 'video_encrypted.enc',
    originalFilename: 'presentation_demo.mp4',
    mimetype: 'video/mp4',
    size: 15728640,
    downloadUrl: 'https://example.com/files/3.enc',
    uploadTimestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    salt: 'base64salt3',
    iv: 'base64iv3',
    kdf: 'PBKDF2',
    iterations: 200000,
    algorithm: 'AES-GCM',
    version: '1.0'
  }
];

function HomePage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'download'>('upload');
  const [files, setFiles] = useState<FileRecord[]>(mockFiles);
  const [encryptionModal, setEncryptionModal] = useState<{
    isOpen: boolean;
    mode: 'encrypt' | 'decrypt';
    file?: File;
    username?: string;
    encryptedFile?: FileRecord;
  }>({ isOpen: false, mode: 'encrypt' });
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    file: { name: string; type: string; size: number; data: Uint8Array } | null;
  }>({ isOpen: false, file: null });
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection for upload
  const handleFileSelect = async (file: File, username: string) => {
    setEncryptionModal({
      isOpen: true,
      mode: 'encrypt',
      file,
      username
    });
  };

  // Handle encryption and upload
  const handleEncryption = async (credentials: { pattern?: number[]; passphrase?: string }) => {
    if (!encryptionModal.file || !encryptionModal.username) return;

    setIsUploading(true);
    
    try {
      // Convert file to bytes
      const fileBytes = new Uint8Array(await encryptionModal.file.arrayBuffer());
      
      // Generate salt and derive key
      const salt = generateSalt();
      const patternString = credentials.pattern 
        ? patternToString(credentials.pattern) 
        : credentials.passphrase!;
      const key = await deriveKeyFromPattern(patternString, salt);
      
      // Encrypt file
      const { iv, ciphertext } = await encryptFile(fileBytes, key);
      
      // Create header
      const header = {
        version: '1.0',
        username: encryptionModal.username,
        salt: bytesToBase64(salt),
        iv: bytesToBase64(iv),
        kdf: 'PBKDF2',
        iterations: 200000,
        algorithm: 'AES-GCM',
        uploadTimestamp: new Date().toISOString(),
        filename: encryptionModal.file.name,
        mimetype: encryptionModal.file.type
      };
      
      // Package file
      const packagedFile = packageFile(header, ciphertext);
      
      // Simulate upload to server - todo: replace with actual upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create file record
      const newFile: FileRecord = {
        id: Date.now().toString(),
        username: encryptionModal.username,
        filename: `${encryptionModal.file.name}.enc`,
        originalFilename: encryptionModal.file.name,
        mimetype: encryptionModal.file.type,
        size: encryptionModal.file.size,
        downloadUrl: `https://example.com/files/${Date.now()}.enc`,
        uploadTimestamp: new Date(),
        salt: header.salt,
        iv: header.iv,
        kdf: header.kdf,
        iterations: header.iterations,
        algorithm: header.algorithm,
        version: header.version
      };
      
      // Add to files list
      setFiles(prev => [newFile, ...prev]);
      
      // Close modal
      setEncryptionModal({ isOpen: false, mode: 'encrypt' });
      
      console.log('File encrypted and uploaded successfully!');
      
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file download request
  const handleDownload = async (file: FileRecord) => {
    setEncryptionModal({
      isOpen: true,
      mode: 'decrypt',
      encryptedFile: file
    });
  };

  // Handle decryption and download
  const handleDecryption = async (credentials: { pattern?: number[]; passphrase?: string }) => {
    if (!encryptionModal.encryptedFile) return;

    try {
      // Simulate downloading encrypted file - todo: replace with actual download
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock encrypted file data for demo
      const mockText = "This is decrypted content from the encrypted file. In a real implementation, this would be the actual file data.";
      const mockBytes = new TextEncoder().encode(mockText);
      
      // For demo, we'll simulate decryption success/failure
      const patternString = credentials.pattern 
        ? patternToString(credentials.pattern) 
        : credentials.passphrase!;
      
      // Simulate pattern validation (in real app, this would attempt actual decryption)
      if (patternString.length < 3) {
        throw new Error('Incorrect pattern or passphrase');
      }
      
      // Close encryption modal
      setEncryptionModal({ isOpen: false, mode: 'decrypt' });
      
      // Create decrypted file for preview
      const decryptedFile = {
        name: encryptionModal.encryptedFile.originalFilename,
        type: encryptionModal.encryptedFile.mimetype,
        size: encryptionModal.encryptedFile.size,
        data: mockBytes
      };
      
      // Open preview modal
      setPreviewModal({
        isOpen: true,
        file: decryptedFile
      });
      
      console.log('File decrypted successfully!');
      
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  };

  // Handle file preview request
  const handlePreview = (file: FileRecord) => {
    handleDownload(file);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary">SecureShare</h1>
                <p className="text-sm text-muted-foreground">Client-side Encrypted File Sharing</p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Share files securely with end-to-end encryption. Your files are encrypted on your device 
              before upload, ensuring maximum privacy and security.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Lock className="w-8 h-8 text-primary mx-auto" />
                <CardTitle className="text-lg">Client-side Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Files are encrypted on your device using AES-GCM before upload
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Shield className="w-8 h-8 text-primary mx-auto" />
                <CardTitle className="text-lg">Pattern Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Secure your files with Android-style patterns or passphrases
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Download className="w-8 h-8 text-primary mx-auto" />
                <CardTitle className="text-lg">Secure Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Share files with confidence knowing they're protected
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Interface */}
          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upload' | 'download')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="flex items-center space-x-2" data-testid="tab-upload">
                    <Upload className="w-4 h-4" />
                    <span>Upload File</span>
                  </TabsTrigger>
                  <TabsTrigger value="download" className="flex items-center space-x-2" data-testid="tab-download">
                    <Download className="w-4 h-4" />
                    <span>Browse Files</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab}>
                <TabsContent value="upload" className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Upload Encrypted File</h2>
                    <p className="text-muted-foreground">
                      Select a file and create a security pattern to encrypt and share your file securely.
                    </p>
                  </div>
                  <FileUpload onFileSelect={handleFileSelect} />
                </TabsContent>
                
                <TabsContent value="download" className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Browse Shared Files</h2>
                    <p className="text-muted-foreground">
                      Download and decrypt files shared by other users. You'll need the correct pattern or passphrase.
                    </p>
                  </div>
                  <FileDashboard 
                    files={files}
                    onDownload={handleDownload}
                    onPreview={handlePreview}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />

      {/* Modals */}
      <EncryptionModal
        isOpen={encryptionModal.isOpen}
        onClose={() => setEncryptionModal({ isOpen: false, mode: 'encrypt' })}
        onSubmit={encryptionModal.mode === 'encrypt' ? handleEncryption : handleDecryption}
        mode={encryptionModal.mode}
        filename={encryptionModal.encryptedFile?.originalFilename}
        loading={isUploading}
      />
      
      <FilePreview
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, file: null })}
        file={previewModal.file}
      />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      {/* Add more routes as needed */}
      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Page Not Found</h1>
            <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;