import FileUpload from '../FileUpload';
import { useState } from 'react';

export default function FileUploadExample() {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{file: File, username: string}>>([]);

  const handleFileSelect = async (file: File, username: string) => {
    console.log('File selected:', file.name, 'by', username);
    
    // Simulate encryption and upload process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setUploadedFiles(prev => [...prev, { file, username }]);
    console.log('File uploaded successfully!');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-primary">Upload Secure File</h2>
        <p className="text-muted-foreground">
          Files are encrypted client-side before upload for maximum security
        </p>
      </div>
      
      <FileUpload onFileSelect={handleFileSelect} />
      
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Uploads</h3>
          <div className="space-y-2">
            {uploadedFiles.map((upload, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-card border rounded-lg"
              >
                <div>
                  <div className="font-medium">{upload.file.name}</div>
                  <div className="text-sm text-muted-foreground">by {upload.username}</div>
                </div>
                <div className="text-xs text-green-400 font-medium">Encrypted ✓</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}