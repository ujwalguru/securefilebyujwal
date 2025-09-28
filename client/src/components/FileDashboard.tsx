import { useState } from 'react';
import { Download, Eye, File, Image, FileText, Video, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FileRecord } from '@shared/schema';

interface FileDashboardProps {
  files: FileRecord[];
  onDownload: (file: FileRecord) => void;
  onPreview?: (file: FileRecord) => void;
  loading?: boolean;
  className?: string;
}

export default function FileDashboard({ 
  files, 
  onDownload, 
  onPreview, 
  loading = false, 
  className 
}: FileDashboardProps) {
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());

  const handleDownload = async (file: FileRecord) => {
    if (downloadingFiles.has(file.id)) return;
    
    setDownloadingFiles(prev => new Set(prev).add(file.id));
    
    try {
      await onDownload(file);
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return Image;
    if (mimetype.startsWith('video/')) return Video;
    if (mimetype.includes('pdf') || mimetype.startsWith('text/')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getFileType = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return 'Image';
    if (mimetype.startsWith('video/')) return 'Video';
    if (mimetype.includes('pdf')) return 'PDF';
    if (mimetype.startsWith('text/')) return 'Text';
    if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return 'Spreadsheet';
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'Presentation';
    if (mimetype.includes('document') || mimetype.includes('word')) return 'Document';
    return 'File';
  };

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <File className="w-5 h-5" />
            <span>Shared Files</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
                <div className="w-20 h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <File className="w-5 h-5" />
            <span>Shared Files</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 space-y-4">
            <File className="w-16 h-16 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium">No files shared yet</h3>
              <p className="text-muted-foreground">
                Upload your first encrypted file to get started
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <File className="w-5 h-5" />
            <span>Shared Files</span>
          </div>
          <Badge variant="secondary">{files.length} files</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {files.map((file, index) => {
            const IconComponent = getFileIcon(file.mimetype);
            const isDownloading = downloadingFiles.has(file.id);
            const canPreview = onPreview && (
              file.mimetype.startsWith('image/') || 
              file.mimetype.startsWith('video/') || 
              file.mimetype.includes('pdf')
            );
            
            return (
              <div
                key={file.id}
                className={cn(
                  "flex items-center space-x-4 p-4 border rounded-lg transition-all duration-200 hover-elevate",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`file-row-${file.id}`}
              >
                {/* File Icon & Info */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground truncate">
                        {file.originalFilename}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getFileType(file.mimetype)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{file.username}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(file.uploadTimestamp)}</span>
                      </div>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {canPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPreview?.(file)}
                      data-testid={`button-preview-${file.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    disabled={isDownloading}
                    data-testid={`button-download-${file.id}`}
                  >
                    {isDownloading ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span className="ml-1">
                      {isDownloading ? 'Downloading...' : 'Download'}
                    </span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}