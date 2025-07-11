import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef, ChangeEvent } from "react";
import { toast } from "sonner";
import { FileText, X, Upload } from "lucide-react";
import { useJobAttachments } from "@/hooks/useJobAttachments";
import { useJobHistoryIntegration } from "@/hooks/useJobHistoryIntegration";

interface AttachmentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  onUploadSuccess?: () => void;
}

export function AttachmentUploadDialog({
  open,
  onOpenChange,
  jobId,
  onUploadSuccess,
}: AttachmentUploadDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAttachments, isUploading } = useJobAttachments(jobId);
  const { logFileAttached } = useJobHistoryIntegration(jobId);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) selected`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    console.log("Starting upload for job:", jobId, "Files:", selectedFiles.length);
    const success = await uploadAttachments(selectedFiles);
    
    if (success) {
      console.log("Upload successful, clearing files and closing dialog");
      
      // Log each file attachment
      for (const file of selectedFiles) {
        await logFileAttached(file.name, `job-attachments/${jobId}/${file.name}`);
      }
      
      setSelectedFiles([]);
      onOpenChange(false);
      
      // Always call onUploadSuccess to trigger refresh
      if (onUploadSuccess) {
        console.log("Calling onUploadSuccess callback");
        onUploadSuccess();
      }
      
      // Add a small delay to ensure the upload is processed
      setTimeout(() => {
        console.log("Upload process completed");
      }, 500);
    } else {
      console.error("Upload failed");
    }
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Attachments</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.csv,.xls,.xlsx"
            />
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload size={16} className="mr-2" />
              Choose Files
            </Button>
            <p className="mt-2 text-sm text-gray-500">
              Or drag and drop files here
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supported formats: PDF, JPEG, PNG, DOC, DOCX, TXT, CSV, XLS, XLSX
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="mb-2 block">
              Selected Files ({selectedFiles.length} files)
            </Label>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 border border-gray-200 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    disabled={isUploading}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
              
              {selectedFiles.length === 0 && (
                <p className="text-sm text-gray-500">No files selected</p>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Files"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
