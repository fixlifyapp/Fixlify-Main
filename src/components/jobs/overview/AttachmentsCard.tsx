
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Upload, File, Download, Trash2, Eye, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AttachmentUploadDialog } from "../dialogs/AttachmentUploadDialog";
import { useJobAttachments } from "@/hooks/useJobAttachments";

interface AttachmentsCardProps {
  jobId: string;
  editable?: boolean;
  onUpdate?: () => void;
}

export const AttachmentsCard = ({ attachments = [], jobId, onAttachmentsUpdate }: AttachmentsCardProps) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes('image')) return 'bg-green-100 text-green-800';
    if (fileType.includes('pdf')) return 'bg-red-100 text-red-800';
    if (fileType.includes('document') || fileType.includes('word')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleDownload = async (attachment: any) => {
    await downloadAttachment(attachment.file_path, attachment.file_name);
  };

  const handleDelete = async (attachment: any) => {
    const success = await deleteAttachment(attachment.id, attachment.file_path);
    if (success && onUpdate) {
      onUpdate();
    }
  };

  const handleUploadSuccess = () => {
    console.log("Upload success callback triggered, refreshing attachments");
    setIsUploadDialogOpen(false);
    
    // Force refresh the attachments list
    refreshAttachments();
    
    // Also trigger any parent update callback
    if (onUpdate) {
      console.log("Calling parent onUpdate callback");
      onUpdate();
    }
    
    // Add a small delay and refresh again to ensure we get the latest data
    setTimeout(() => {
      console.log("Secondary refresh triggered");
      refreshAttachments();
    }, 1000);
  };

  if (isLoading) {
    return (
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <ModernCardTitle icon={Paperclip}>
            Attachments
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            Loading attachments...
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }

  return (
    <>
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={Paperclip}>
              Attachments ({attachments.length})
            </ModernCardTitle>
            {editable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUploadDialogOpen(true)}
                className="text-fixlyfy hover:text-fixlyfy-dark"
              >
                <Upload className="h-4 w-4" />
              </Button>
            )}
          </div>
        </ModernCardHeader>
        <ModernCardContent>
          {attachments.length > 0 ? (
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getFileType(attachment.mime_type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.file_size)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => handleView(attachment)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                      onClick={() => handleDownload(attachment)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    {editable && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDelete(attachment)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              {editable ? "No attachments. Click the upload button to add files." : "No attachments"}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>

      <AttachmentUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        jobId={jobId}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
};
