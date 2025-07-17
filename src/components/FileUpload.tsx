
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateFileUpload, validateFileContent, sanitizeErrorMessage } from "@/lib/security";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface FileUploadProps {
  onFileContent: (content: string) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileContent,
  className = ""
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { handleError } = useErrorHandler();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file upload security
    const fileValidation = validateFileUpload(file);
    if (!fileValidation.isValid) {
      toast({
        title: "Invalid file",
        description: fileValidation.error,
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      
      // Validate and sanitize file content
      const contentValidation = validateFileContent(text);
      if (!contentValidation.isValid) {
        toast({
          title: "Invalid file content",
          description: contentValidation.error,
          variant: "destructive",
        });
        return;
      }

      if (contentValidation.content.trim()) {
        onFileContent(contentValidation.content);
        toast({
          title: "File uploaded",
          description: `Content from ${file.name} has been securely processed and added.`,
        });
      }
    } catch (error: any) {
      const sanitizedError = sanitizeErrorMessage(error);
      handleError(error, 'file-upload');
      
      toast({
        title: "Unable to read file",
        description: sanitizedError,
        variant: "destructive",
      });
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.json,.csv"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        onClick={handleFileSelect}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        <span>Upload File</span>
      </Button>
    </div>
  );
};
