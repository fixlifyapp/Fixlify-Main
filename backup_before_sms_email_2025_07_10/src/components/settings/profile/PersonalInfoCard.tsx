
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Camera } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PersonalInfoCardProps {
  userSettings: any;
  updateUserSettings: (updates: any) => void;
}

export const PersonalInfoCard = ({ userSettings, updateUserSettings }: PersonalInfoCardProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    notification_email: '',
    avatar_url: ''
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, phone, avatar_url')
        .eq('id', user.id)
        .single();

      if (data) {
        const nameParts = data.name?.split(' ') || ['', ''];
        setProfile({
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          phone: data.phone || '',
          notification_email: userSettings.notification_email || user.email || '',
          avatar_url: data.avatar_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);

    if (field === 'notification_email') {
      updateUserSettings({ notification_email: value });
    } else {
      // Update user settings with profile changes to trigger save button
      updateUserSettings({ 
        profile_changes: {
          first_name: updatedProfile.first_name,
          last_name: updatedProfile.last_name,
          phone: updatedProfile.phone
        }
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      toast.error('Image size must be less than 2MB. Please resize your image and try again.');
      return;
    }

    // Validate image dimensions (optional - max 1024x1024)
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      
      if (img.width > 1024 || img.height > 1024) {
        toast.error('Image dimensions must be 1024x1024 pixels or smaller. Current size: ' + img.width + 'x' + img.height);
        return;
      }

      await uploadAvatar(file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast.error('Invalid image file. Please try a different image.');
    };

    img.src = objectUrl;
  };

  const uploadAvatar = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/avatar.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const newAvatarUrl = publicUrlData.publicUrl;
      
      // Update local state
      setProfile(prev => ({ ...prev, avatar_url: newAvatarUrl }));
      
      // Trigger save button by updating user settings
      updateUserSettings({ 
        profile_changes: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          avatar_url: newAvatarUrl
        }
      });

      toast.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <Card className="fixlyfy-card">
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <User className="h-5 w-5 text-fixlyfy mr-2" />
        <CardTitle className="text-lg">Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || "https://github.com/shadcn.png"} />
              <AvatarFallback className="text-lg">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />
            <Button 
              size="sm" 
              variant="outline" 
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <h3 className="font-medium">{profile.first_name} {profile.last_name}</h3>
            <p className="text-sm text-fixlyfy-text-secondary">{user?.email}</p>
            <p className="text-xs text-fixlyfy-text-secondary mt-1">
              Avatar: Max 2MB, 1024x1024px, JPG/PNG/GIF
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input 
              id="first-name" 
              value={profile.first_name}
              onChange={(e) => handleFieldChange('first_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input 
              id="last-name" 
              value={profile.last_name}
              onChange={(e) => handleFieldChange('last_name', e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone" 
            value={profile.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notification-email">Notification Email</Label>
          <Input 
            id="notification-email" 
            type="email" 
            value={profile.notification_email}
            onChange={(e) => handleFieldChange('notification_email', e.target.value)}
            placeholder="notifications@company.com"
          />
        </div>
      </CardContent>
    </Card>
  );
};
