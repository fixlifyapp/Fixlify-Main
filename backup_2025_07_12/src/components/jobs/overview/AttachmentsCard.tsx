
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Upload, Download, Trash2, Eye } from "lucide-react";
import { AttachmentUploadDialog } from "../dialogs/AttachmentUploadDialog";

interface AttachmentsCardProps {
  attachments: Array<{
    id: string;
    filename: string;
    file_size: number;
    file_type: string;
    uploaded_at: string;
    uploaded_by: string;
  }>;
  jobId: string;
  onAttachmentsUpdate: () => void;
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
    try {
      // Implement download logic here
      console.log('Downloading:', attachment.filename);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      // Implement delete logic here
      console.log('Deleting attachment:', attachmentId);
      onAttachmentsUpdate();
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitleWithIcon icon={Paperclip}>
            Attachments
          </CardTitleWithIcon>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadDialogOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </CardHeader>
        <CardContent>
          {attachments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Paperclip className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No attachments</p>
              <Button
                variant="ghost"
                onClick={() => setUploadDialogOpen(true)}
                className="mt-2"
              >
                Upload your first file
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <CardTitleWithIcon icon={Paperclip}>
                  Files ({attachments.length})
                </CardTitleWithIcon>
              </div>
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <Badge 
                        variant="outline" 
                        className={getFileTypeColor(attachment.file_type)}
                      >
                        {attachment.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {attachment.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.file_size)} • 
                        {new Date(attachment.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(attachment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(attachment)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(attachment.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AttachmentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        jobId={jobId}
        onUploadComplete={onAttachmentsUpdate}
      />
    </>
  );
};
