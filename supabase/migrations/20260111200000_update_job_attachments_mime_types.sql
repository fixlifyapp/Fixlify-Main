-- Update job-attachments bucket to support more file types
-- Adds HEIC/HEIF (iOS photos), videos, and more document types

UPDATE storage.buckets
SET
  file_size_limit = 26214400, -- 25MB limit per file (reasonable for photos/docs)
  allowed_mime_types = ARRAY[
    -- Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    -- Videos
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/3gpp',
    'video/x-m4v',
    -- Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    -- Text
    'text/plain',
    'text/csv',
    'text/html',
    -- Archives (for receipts, etc)
    'application/zip',
    'application/x-rar-compressed'
  ]::text[]
WHERE id = 'job-attachments';
