
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PersonalInfoSectionProps {
  userSettings: any;
  updateUserSettings: (updates: any) => void;
  isEditing?: boolean;
}

export const PersonalInfoSection = ({ userSettings, updateUserSettings, isEditing = true }: PersonalInfoSectionProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    notification_email: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', user.id)
        .single();

      if (data) {
        const nameParts = data.name?.split(' ') || ['', ''];
        setProfile({
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          phone: data.phone || '',
          notification_email: userSettings.notification_email || user.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (field: string, value: string) => {
    if (!user) return;

    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);

    try {
      if (field === 'notification_email') {
        updateUserSettings({ notification_email: value });
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: `${updatedProfile.first_name} ${updatedProfile.last_name}`.trim(),
            phone: updatedProfile.phone
          })
          .eq('id', user.id);

        if (error) throw error;
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        <div className="flex flex-col items-center text-center space-y-3">
          <Avatar className="h-32 w-32">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          {isEditing && <Button variant="outline" size="sm">Change Avatar</Button>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input 
              id="first-name" 
              value={profile.first_name}
              onChange={(e) => updateProfile('first_name', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input 
              id="last-name" 
              value={profile.last_name}
              onChange={(e) => updateProfile('last_name', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={user?.email || ""}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input 
              id="phone" 
              value={profile.phone}
              onChange={(e) => updateProfile('phone', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notification-email">Notification Email</Label>
            <Input 
              id="notification-email" 
              type="email" 
              value={profile.notification_email}
              onChange={(e) => updateProfile('notification_email', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
