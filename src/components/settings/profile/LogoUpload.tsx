import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

interface LogoUploadProps {
  currentLogoUrl?: string;
  onUploadSuccess: (url: string) => void;
  companyName?: string;
}

export const LogoUpload = ({ currentLogoUrl, onUploadSuccess, companyName }: LogoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - only PNG and JPG allowed
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file format. Only PNG and JPG files are allowed.');
      return;
    }

    // Validate file size - max 500KB
    const maxSize = 500 * 1024; // 500KB in bytes
    if (file.size > maxSize) {
      const fileSizeKB = Math.round(file.size / 1024);
      toast.error(`File size too large (${fileSizeKB}KB). Maximum allowed size is 500KB.`);
      return;
    }

    setIsUploading(true);

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Please log in to upload a logo');
        setIsUploading(false);
        return;
      }

      const userId = session.user.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/logo_${Date.now()}.${fileExt}`;

      console.log('Uploading file:', fileName);

      // Upload file
      const { data, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false // Don't upsert to avoid conflicts
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      console.log('Upload successful, public URL:', publicUrl);

      // Call success callback with the URL
      onUploadSuccess(publicUrl);
      
      toast.success('Logo uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
      // Reset input to allow re-selecting the same file
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Logo Preview */}
      <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
        {currentLogoUrl ? (
          <img 
            src={currentLogoUrl} 
            alt="Company Logo" 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No logo</p>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="relative">
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Upload logo"
        />
        <button
          type="button"
          disabled={isUploading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4 inline-block mr-2" />
          {isUploading ? 'Uploading...' : 'Choose File'}
        </button>
      </div>

      <p className="text-xs text-gray-500">
        PNG or JPG only. Max 500KB.
      </p>
    </div>
  );
};
