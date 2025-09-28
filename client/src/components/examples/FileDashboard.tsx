import FileDashboard from '../FileDashboard';
import { useState } from 'react';
import type { FileRecord } from '@shared/schema';

export default function FileDashboardExample() {
  // todo: remove mock functionality
  const [mockFiles] = useState<FileRecord[]>([
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
  ]);

  const handleDownload = async (file: FileRecord) => {
    console.log('Downloading file:', file.originalFilename);
    // Simulate download delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Download completed for:', file.originalFilename);
  };

  const handlePreview = (file: FileRecord) => {
    console.log('Previewing file:', file.originalFilename);
    // In real app, this would open the encryption modal
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-primary">File Dashboard</h2>
        <p className="text-muted-foreground">
          Browse and download encrypted files shared by users
        </p>
      </div>
      
      <FileDashboard 
        files={mockFiles}
        onDownload={handleDownload}
        onPreview={handlePreview}
      />
    </div>
  );
}