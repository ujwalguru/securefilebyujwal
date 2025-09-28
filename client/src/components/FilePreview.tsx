import { useState } from 'react';
import { X, Download, Eye, FileText, Image as ImageIcon, Video, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    name: string;
    type: string;
    size: number;
    data: Uint8Array;
  } | null;
  onDownload?: () => void;
}

export default function FilePreview({ isOpen, onClose, file, onDownload }: FilePreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  if (!file) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return Video;
    if (type.includes('pdf') || type.startsWith('text/')) return FileText;
    return File;
  };

  const createObjectURL = () => {
    const blob = new Blob([file.data], { type: file.type });
    return URL.createObjectURL(blob);
  };

  const handleDownload = () => {
    const blob = new Blob([file.data], { type: file.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload?.();
  };

  const renderPreview = () => {
    // Image preview
    if (file.type.startsWith('image/') && !imageError) {
      return (
        <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
          <img
            src={createObjectURL()}
            alt={file.name}
            className="max-w-full max-h-96 object-contain rounded"
            onError={() => setImageError(true)}
            data-testid="preview-image"
          />
        </div>
      );
    }

    // Video preview
    if (file.type.startsWith('video/') && !videoError) {
      return (
        <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
          <video
            src={createObjectURL()}
            controls
            className="max-w-full max-h-96 rounded"
            onError={() => setVideoError(true)}
            data-testid="preview-video"
          >
            Your browser does not support video playback.
          </video>
        </div>
      );
    }

    // PDF preview (basic iframe)
    if (file.type === 'application/pdf') {
      return (
        <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg h-96">
          <iframe
            src={createObjectURL()}
            className="w-full h-full rounded border"
            title={file.name}
            data-testid="preview-pdf"
          />
        </div>
      );
    }

    // Text preview
    if (file.type.startsWith('text/')) {
      try {
        const text = new TextDecoder().decode(file.data);
        return (
          <div className="p-4 bg-muted/30 rounded-lg max-h-96 overflow-y-auto">
            <pre className="text-sm font-mono whitespace-pre-wrap break-words" data-testid="preview-text">
              {text.slice(0, 10000)}{text.length > 10000 ? '\n... (truncated)' : ''}
            </pre>
          </div>
        );
      } catch (error) {
        console.error('Error decoding text:', error);
      }
    }

    // Fallback for unsupported file types
    const IconComponent = getFileIcon(file.type);
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg space-y-4">
        <IconComponent className="w-16 h-16 text-muted-foreground" />
        <div className="text-center space-y-2">
          <div className="font-medium">Preview not available</div>
          <div className="text-sm text-muted-foreground">
            This file type cannot be previewed in the browser
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" data-testid="file-preview-modal">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              {(() => {
                const IconComponent = getFileIcon(file.type);
                return <IconComponent className="w-5 h-5 text-primary flex-shrink-0" />;
              })()}
              <div className="min-w-0">
                <div className="font-medium truncate">{file.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                data-testid="button-download-preview"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                data-testid="button-close-preview"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}