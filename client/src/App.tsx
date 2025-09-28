import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
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

// API Functions
const fetchFiles = async (): Promise<FileRecord[]> => {
  const response = await fetch('/api/files');
  if (!response.ok) {
    throw new Error('Failed to fetch files');
  }
  return response.json();
};

const uploadFile = async (fileData: any): Promise<FileRecord> => {
  const response = await apiRequest('POST', '/api/files', fileData);
  return response.json();
};

const downloadFileData = async (id: string) => {
  const response = await fetch(`/api/files/${id}/download`);
  if (!response.ok) {
    throw new Error('Failed to download file');
  }
  return response.json();
};

const deleteFile = async (id: string): Promise<void> => {
  await apiRequest('DELETE', `/api/files/${id}`);
};

function HomePage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'download'>('upload');
  const [currentUser, setCurrentUser] = useState<string>('testuser'); // todo: replace with actual user management
  const queryClientInstance = useQueryClient();
  
  // Fetch files from API
  const { data: files = [], isLoading: isLoadingFiles, error: filesError } = useQuery({
    queryKey: ['/api/files'],
    queryFn: fetchFiles,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time sync
  });
  
  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['/api/files'] });
      toast({
        title: "File uploaded successfully!",
        description: "Your encrypted file is now available for download.",
      });
    },
    onError: (error: Error) => {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['/api/files'] });
      toast({
        title: "File deleted",
        description: "File has been permanently removed.",
      });
    },
    onError: (error: Error) => {
      console.error('Delete failed:', error);
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
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
  
  const { toast } = useToast();
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
      
      // Create file metadata for upload
      const fileData = {
        username: encryptionModal.username,
        filename: `${encryptionModal.file.name}.enc`,
        originalFilename: encryptionModal.file.name,
        mimetype: encryptionModal.file.type,
        size: encryptionModal.file.size,
        downloadUrl: '', // Will be set by server
        salt: header.salt,
        iv: header.iv,
        kdf: header.kdf,
        iterations: header.iterations,
        algorithm: header.algorithm,
        version: header.version,
        encryptedData: bytesToBase64(ciphertext)
      };
      
      // Upload to server
      await uploadMutation.mutateAsync(fileData);
      
      // Close modal
      setEncryptionModal({ isOpen: false, mode: 'encrypt' });
      
      console.log('File encrypted and uploaded successfully!');
      
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    } finally {
      // Loading state is handled by uploadMutation.isPending
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

  // Handle file deletion
  const handleDelete = async (file: FileRecord) => {
    try {
      await deleteMutation.mutateAsync(file.id);
      console.log('File deleted successfully:', file.originalFilename);
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  };

  // Handle decryption and download
  const handleDecryption = async (credentials: { pattern?: number[]; passphrase?: string }) => {
    if (!encryptionModal.encryptedFile) return;

    try {
      // Download the encrypted file data from the server
      const fileData = await downloadFileData(encryptionModal.encryptedFile.id);
      const encryptedData = base64ToBytes(fileData.encryptedData);
      
      // Generate key from pattern/passphrase
      const patternString = credentials.pattern 
        ? patternToString(credentials.pattern) 
        : credentials.passphrase!;
      const salt = base64ToBytes(encryptionModal.encryptedFile.salt);
      const key = await deriveKeyFromPattern(patternString, salt);
      
      // Decrypt the file
      const iv = base64ToBytes(encryptionModal.encryptedFile.iv);
      const decryptedData = await decryptFile(encryptedData, iv, key);
      
      // Close encryption modal
      setEncryptionModal({ isOpen: false, mode: 'decrypt' });
      
      // Create decrypted file for preview
      const decryptedFile = {
        name: encryptionModal.encryptedFile.originalFilename,
        type: encryptionModal.encryptedFile.mimetype,
        size: encryptionModal.encryptedFile.size,
        data: decryptedData
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
                    onDelete={handleDelete}
                    currentUser={currentUser}
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