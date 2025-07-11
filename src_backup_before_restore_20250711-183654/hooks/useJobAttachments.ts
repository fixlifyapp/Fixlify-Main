
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface JobAttachment {
  id: string;
  job_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by?: string;
}

export const useJobAttachments = (jobId?: string) => {
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState<JobAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAttachments = async () => {
    if (!jobId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_attachments')
        .select('*')
        .eq('job_id', jobId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      toast.error('Failed to load attachments');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAttachments = async (files: File[]) => {
    if (files.length === 0 || !jobId) return true;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${jobId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload to storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('job-attachments')
          .upload(fileName, file);

        if (storageError) throw storageError;

        // Save attachment record to database
        const { error: dbError } = await supabase
          .from('job_attachments')
          .insert({
            job_id: jobId,
            file_name: file.name,
            file_path: storageData.path,
            file_size: file.size,
            mime_type: file.type || 'application/octet-stream'
          });

        if (dbError) throw dbError;

        return storageData;
      });

      await Promise.all(uploadPromises);
      toast.success(`${files.length} file(s) uploaded successfully`);
      await fetchAttachments(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error uploading attachments:', error);
      toast.error('Failed to upload attachments');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteAttachment = async (attachmentId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('job-attachments')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion failed:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('job_attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) throw dbError;

      toast.success('Attachment deleted successfully');
      await fetchAttachments(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Failed to delete attachment');
      return false;
    }
  };

  const downloadAttachment = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('job-attachments')
        .download(filePath);

      if (error) throw error;

      // Create blob URL and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast.error('Failed to download file');
    }
  };

  const viewAttachment = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('job-attachments')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;

      // Open in new tab
      window.open(data.signedUrl, '_blank');
      toast.success('Opening file...');
    } catch (error) {
      console.error('Error viewing attachment:', error);
      toast.error('Failed to view file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Spreadsheet';
    return 'File';
  };

  useEffect(() => {
    if (jobId) {
      fetchAttachments();
    }
  }, [jobId]);

  return {
    attachments,
    isLoading,
    uploadAttachments,
    deleteAttachment,
    downloadAttachment,
    viewAttachment,
    formatFileSize,
    getFileType,
    isUploading,
    refreshAttachments: fetchAttachments
  };
};
