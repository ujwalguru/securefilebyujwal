import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File, username: string) => void;
  onUploadProgress?: (progress: number) => void;
  disabled?: boolean;
  className?: string;
}

export default function FileUpload({ 
  onFileSelect, 
  onUploadProgress, 
  disabled = false, 
  className 
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [username, setUsername] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, [disabled]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !username.trim()) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const next = prev + Math.random() * 15;
        if (next >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return next;
      });
    }, 100);
    
    try {
      // Call the parent handler
      await onFileSelect(selectedFile, username.trim());
      
      // Complete the progress
      setUploadProgress(100);
      
      // Reset form after a short delay
      setTimeout(() => {
        setSelectedFile(null);
        setUsername('');
        setUploadProgress(0);
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1000);
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
      clearInterval(progressInterval);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.includes('pdf') || file.type.startsWith('text/')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Username Input */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={disabled || isUploading}
          data-testid="input-username"
        />
      </div>

      {/* File Drop Zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
          isDragOver && !disabled ? "border-primary bg-primary/5" : "border-border",
          disabled && "opacity-50 cursor-not-allowed",
          "hover-elevate"
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="file-drop-zone"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          data-testid="file-input"
        />
        
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              {(() => {
                const IconComponent = getFileIcon(selectedFile);
                return <IconComponent className="w-8 h-8 text-primary" />;
              })()}
              <div className="text-left">
                <div className="font-medium text-foreground">{selectedFile.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                </div>
              </div>
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFile}
                  data-testid="button-clear-file"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <Progress 
                  value={uploadProgress} 
                  className="w-full"
                  data-testid="upload-progress"
                />
                <div className="text-sm text-muted-foreground">
                  {uploadProgress < 100 ? `Encrypting and uploading... ${Math.round(uploadProgress)}%` : 'Upload complete!'}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <div className="text-lg font-medium text-foreground">
                Drop your file here
              </div>
              <div className="text-sm text-muted-foreground">
                or click to select a file
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              data-testid="button-select-file"
            >
              Select File
            </Button>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {selectedFile && !isUploading && (
        <div className="flex justify-center animate-fade-in">
          <Button
            onClick={handleUpload}
            disabled={!username.trim() || disabled}
            size="lg"
            className="min-w-32"
            data-testid="button-upload"
          >
            Encrypt & Upload
          </Button>
        </div>
      )}
    </div>
  );
}