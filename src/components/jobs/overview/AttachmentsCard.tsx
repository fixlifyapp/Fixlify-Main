import React, { useState } from "react";
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
import { ProfessionalCard, ProfessionalSectionHeader, ProfessionalEmptyState } from "@/components/ui/professional-card";

interface AttachmentsCardProps {
  jobId: string;
  embedded?: boolean;
}

export const AttachmentsCard = ({ jobId, embedded = false }: AttachmentsCardProps) => {
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
    if (mimeType?.includes('image')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (mimeType?.includes('pdf')) return 'bg-red-50 text-red-700 border-red-200';
    if (mimeType?.includes('document') || mimeType?.includes('word')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) return 'bg-violet-50 text-violet-700 border-violet-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
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

  const content = (
    <>
      {!embedded && (
        <ProfessionalSectionHeader
          icon={Paperclip}
          title="Attachments"
          subtitle={attachments.length > 0 ? `${attachments.length} file${attachments.length !== 1 ? 's' : ''}` : undefined}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadDialogOpen(true)}
              className="text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          }
        />
      )}

      {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-slate-400" />
            <p className="text-sm text-slate-500">Loading attachments...</p>
          </div>
        ) : attachments.length === 0 ? (
          <ProfessionalEmptyState
            icon={Paperclip}
            title="No attachments"
            description="Upload files to attach them to this job"
            action={
              <Button
                variant="outline"
                onClick={() => setUploadDialogOpen(true)}
                className="text-slate-700 border-slate-300 hover:bg-slate-100"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload your first file
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${getFileTypeColor(attachment.mime_type)}`}
                    >
                      {attachment.mime_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">
                      {attachment.file_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(attachment.file_size)} • {new Date(attachment.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(attachment.file_path, attachment.file_name)}
                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    title="View in new tab"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment.file_path, attachment.file_name)}
                    className="text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirmId(attachment.id)}
                    disabled={deletingId === attachment.id}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
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

      {embedded && (
        <div className="flex justify-end mt-3 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadDialogOpen(true)}
            className="text-slate-700 border-slate-300 hover:bg-slate-100"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>
      )}
    </>
  );

  return (
    <>
      {embedded ? (
        content
      ) : (
        <ProfessionalCard>{content}</ProfessionalCard>
      )}

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
