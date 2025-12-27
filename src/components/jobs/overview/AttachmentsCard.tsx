
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Upload, Download, Trash2, Eye, Loader2 } from "lucide-react";
import { AttachmentUploadDialog } from "../dialogs/AttachmentUploadDialog";
import { useJobAttachments } from "@/hooks/useJobAttachments";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AttachmentsCardProps {
  jobId: string;
}

export const AttachmentsCard = ({ jobId }: AttachmentsCardProps) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    attachments,
    isLoading,
    downloadAttachment,
    viewAttachment,
    deleteAttachment,
    formatFileSize,
    refreshAttachments
  } = useJobAttachments(jobId);

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType?.includes('image')) return 'bg-green-100 text-green-800';
    if (mimeType?.includes('pdf')) return 'bg-red-100 text-red-800';
    if (mimeType?.includes('document') || mimeType?.includes('word')) return 'bg-blue-100 text-blue-800';
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) return 'bg-emerald-100 text-emerald-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleView = async (filePath: string, fileName: string) => {
    await viewAttachment(filePath, fileName);
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    await downloadAttachment(filePath, fileName);
  };

  const handleDelete = async (attachmentId: string, filePath: string) => {
    setDeletingId(attachmentId);
    await deleteAttachment(attachmentId, filePath);
    setDeletingId(null);
    setDeleteConfirmId(null);
  };

  const attachmentToDelete = attachments.find(a => a.id === deleteConfirmId);

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
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin opacity-50" />
              <p>Loading attachments...</p>
            </div>
          ) : attachments.length === 0 ? (
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
              <p className="text-sm text-muted-foreground">
                {attachments.length} file{attachments.length !== 1 ? 's' : ''} attached
              </p>
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={getFileTypeColor(attachment.mime_type)}
                      >
                        {attachment.mime_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {attachment.file_name}
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
                      onClick={() => handleView(attachment.file_path, attachment.file_name)}
                      title="View in new tab"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(attachment.file_path, attachment.file_name)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(attachment.id)}
                      disabled={deletingId === attachment.id}
                      className="text-destructive hover:text-destructive"
                      title="Delete"
                    >
                      {deletingId === attachment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
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
        onUploadComplete={refreshAttachments}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{attachmentToDelete?.file_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => attachmentToDelete && handleDelete(attachmentToDelete.id, attachmentToDelete.file_path)}
              disabled={!!deletingId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
