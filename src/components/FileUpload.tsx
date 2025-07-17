
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      
      if (text.trim()) {
        onFileContent(text);
        toast({
          title: "File uploaded",
          description: `Content from ${file.name} has been added to your input.`,
        });
      } else {
        toast({
          title: "Empty file",
          description: "The selected file appears to be empty.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error reading file",
        description: "Could not read the selected file. Please try again.",
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
