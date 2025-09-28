import FilePreview from '../FilePreview';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function FilePreviewExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<any>(null);

  // todo: remove mock functionality
  const mockFiles = {
    image: {
      name: 'sample_image.jpg',
      type: 'image/jpeg',
      size: 1234567,
      data: new Uint8Array() // In real app, this would be actual image data
    },
    text: {
      name: 'sample_document.txt',
      type: 'text/plain',
      size: 5432,
      data: new TextEncoder().encode(`This is a sample text file for preview demonstration.

It contains multiple lines of text to show how the preview component handles text files.

Features:
- Line breaks are preserved
- Long content is scrollable
- Text encoding is handled properly
- Truncation occurs for very large files

This preview system supports various file types including images, videos, PDFs, and text files.`)
    },
    video: {
      name: 'sample_video.mp4',
      type: 'video/mp4',
      size: 15728640,
      data: new Uint8Array() // In real app, this would be actual video data
    },
    pdf: {
      name: 'sample_document.pdf',
      type: 'application/pdf',
      size: 2547832,
      data: new Uint8Array() // In real app, this would be actual PDF data
    }
  };

  const openPreview = (fileType: keyof typeof mockFiles) => {
    setCurrentFile(mockFiles[fileType]);
    setIsOpen(true);
  };

  const handleDownload = () => {
    console.log('Download initiated for:', currentFile?.name);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-primary">File Preview</h2>
        <p className="text-muted-foreground">
          Preview decrypted files in-browser before downloading
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => openPreview('image')} 
          variant="outline"
          data-testid="button-preview-image"
        >
          Preview Image
        </Button>
        
        <Button 
          onClick={() => openPreview('text')} 
          variant="outline"
          data-testid="button-preview-text"
        >
          Preview Text
        </Button>
        
        <Button 
          onClick={() => openPreview('video')} 
          variant="outline"
          data-testid="button-preview-video"
        >
          Preview Video
        </Button>
        
        <Button 
          onClick={() => openPreview('pdf')} 
          variant="outline"
          data-testid="button-preview-pdf"
        >
          Preview PDF
        </Button>
      </div>

      <FilePreview
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        file={currentFile}
        onDownload={handleDownload}
      />
    </div>
  );
}