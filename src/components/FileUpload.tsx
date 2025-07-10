import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, File, Image, FileText, Music, Video, X, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFilesUploaded: (files: AttachmentFile[]) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
}

export interface AttachmentFile {
  name: string;
  path: string;
  type: string;
  size: number;
  uploaded_at: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesUploaded, 
  maxFiles = 5, 
  maxSizeInMB = 10 
}) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<{ file: File; progress: number; error?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/webm',
    'audio/mp4',
    // Other
    'application/json',
    'text/csv'
  ];

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('audio/')) return Music;
    if (type.startsWith('video/')) return Video;
    if (type === 'application/pdf' || type.includes('document')) return FileText;
    return File;
  };

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `File size exceeds ${maxSizeInMB}MB limit`;
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<AttachmentFile | null> => {
    if (!user) return null;

    const validation = validateFile(file);
    if (validation) {
      throw new Error(validation);
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${user.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('thought-attachments')
      .upload(filePath, file, {
        upsert: false
      });

    if (error) throw error;

    return {
      name: file.name,
      path: data.path,
      type: file.type,
      size: file.size,
      uploaded_at: new Date().toISOString()
    };
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    // Initialize upload tracking
    const initialUploads = fileArray.map(file => ({ file, progress: 0 }));
    setUploads(initialUploads);

    const uploadedFiles: AttachmentFile[] = [];
    const failedUploads: string[] = [];

    // Upload files sequentially to avoid overwhelming the system
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      
      try {
        // Update progress
        setUploads(prev => prev.map((upload, index) => 
          index === i ? { ...upload, progress: 50 } : upload
        ));

        const uploadedFile = await uploadFile(file);
        
        if (uploadedFile) {
          uploadedFiles.push(uploadedFile);
          // Complete progress
          setUploads(prev => prev.map((upload, index) => 
            index === i ? { ...upload, progress: 100 } : upload
          ));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        failedUploads.push(`${file.name}: ${errorMessage}`);
        
        setUploads(prev => prev.map((upload, index) => 
          index === i ? { ...upload, error: errorMessage } : upload
        ));
      }
    }

    // Clear uploads after a delay
    setTimeout(() => setUploads([]), 3000);

    if (uploadedFiles.length > 0) {
      onFilesUploaded(uploadedFiles);
      toast({
        title: "Files Uploaded",
        description: `${uploadedFiles.length} file(s) uploaded successfully`,
      });
    }

    if (failedUploads.length > 0) {
      toast({
        title: "Upload Errors",
        description: failedUploads.join(', '),
        variant: "destructive",
      });
    }
  }, [user, maxFiles, onFilesUploaded]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">
          Drag & drop files here, or click to select
        </p>
        <p className="text-xs text-muted-foreground">
          PDF, DOC, TXT, Images, Audio files up to {maxSizeInMB}MB (max {maxFiles} files)
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.webm,.mp4,.json,.csv"
          onChange={handleFileSelect}
        />
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, index) => {
            const Icon = getFileIcon(upload.file.type);
            return (
              <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{upload.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(upload.file.size)}
                  </p>
                  {upload.error ? (
                    <div className="flex items-center space-x-1 mt-1">
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                      <p className="text-xs text-destructive">{upload.error}</p>
                    </div>
                  ) : (
                    <Progress value={upload.progress} className="h-1 mt-1" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* File Type Guidelines */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-medium">Supported file types:</p>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">PDF</Badge>
          <Badge variant="outline" className="text-xs">DOC/DOCX</Badge>
          <Badge variant="outline" className="text-xs">TXT/MD</Badge>
          <Badge variant="outline" className="text-xs">Images</Badge>
          <Badge variant="outline" className="text-xs">Audio</Badge>
          <Badge variant="outline" className="text-xs">CSV/JSON</Badge>
        </div>
      </div>
    </div>
  );
};
