import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Upload, Download, Trash2, Eye, Loader2 } from "lucide-react";
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
import { ProfessionalCard, ProfessionalSectionHeader } from "@/components/ui/professional-card";

interface AttachmentsCardProps {
  jobId: string;
  embedded?: boolean;
}

export const AttachmentsCard = ({ jobId, embedded = false }: AttachmentsCardProps) => {
  // Use stable ID without special characters (useId() generates IDs with colons which can break label association)
  const fileInputId = useMemo(() => `attachments-input-${jobId}`, [jobId]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    attachments,
    isLoading,
    isUploading,
    uploadAttachments,
    downloadAttachment,
    viewAttachment,
    deleteAttachment,
    formatFileSize,
    refreshAttachments
  } = useJobAttachments(jobId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadAttachments(Array.from(files));
      // Reset input so same file can be uploaded again
      e.target.value = '';
    }
  };

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
            <label
              htmlFor={fileInputId}
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-slate-300 bg-background hover:bg-slate-100 hover:border-slate-400 h-9 px-3 text-slate-700 cursor-pointer ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isUploading ? 'Uploading...' : 'Upload'}
            </label>
          }
        />
      )}

      {isLoading ? (
          <div className="text-center py-4">
            <Loader2 className="h-5 w-5 mx-auto mb-2 animate-spin text-slate-400" />
            <p className="text-xs text-slate-500">Loading...</p>
          </div>
        ) : attachments.length === 0 ? (
          <div className="flex items-center justify-center gap-3 py-4 px-3 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
            <Paperclip className="h-5 w-5 text-slate-400 flex-shrink-0" />
            <span className="text-sm text-slate-500">No attachments yet</span>
            <label
              htmlFor={fileInputId}
              className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-slate-300 bg-background hover:bg-slate-100 h-7 px-2 text-slate-600 cursor-pointer ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
            >
              {isUploading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Upload className="h-3 w-3" />
              )}
              {isUploading ? 'Uploading...' : 'Upload'}
            </label>
          </div>
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

      {embedded && attachments.length > 0 && (
        <div className="flex justify-end mt-3 pt-3 border-t">
          <label
            htmlFor={fileInputId}
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-slate-300 bg-background hover:bg-slate-100 h-9 px-3 text-slate-700 cursor-pointer ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploading ? 'Uploading...' : 'Upload File'}
          </label>
        </div>
      )}

    </>
  );

  return (
    <>
      {/* Hidden file input - using id/label pattern for reliable cross-browser support */}
      <input
        type="file"
        id={fileInputId}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*,video/*,.heic,.heif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
      />

      {embedded ? (
        content
      ) : (
        <ProfessionalCard>{content}</ProfessionalCard>
      )}

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
