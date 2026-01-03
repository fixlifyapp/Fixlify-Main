
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Debounce hook for autosave
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

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
  const [savingField, setSavingField] = useState<string | null>(null);
  const [savedField, setSavedField] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  // Debounced values for autosave (500ms delay)
  const debouncedProfile = useDebounce(profile, 500);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Autosave effect - triggers when debounced profile changes
  useEffect(() => {
    // Skip initial mount to prevent saving on load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!user || loading) return;

    saveProfile();
  }, [debouncedProfile]);

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

  const saveProfile = async () => {
    if (!user) return;

    setSavingField('profile');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: `${debouncedProfile.first_name} ${debouncedProfile.last_name}`.trim(),
          phone: debouncedProfile.phone
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update notification email if changed
      if (debouncedProfile.notification_email !== userSettings.notification_email) {
        updateUserSettings({ notification_email: debouncedProfile.notification_email });
      }

      setSavingField(null);
      setSavedField('profile');
      setTimeout(() => setSavedField(null), 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSavingField(null);
      toast.error('Failed to update profile');
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // Save indicator component
  const SaveIndicator = () => {
    if (savingField === 'profile') {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (savedField === 'profile') {
      return <Check className="h-4 w-4 text-emerald-500" />;
    }
    return null;
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Personal Information</h3>
        <SaveIndicator />
      </div>

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
              onChange={(e) => handleFieldChange('first_name', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              value={profile.last_name}
              onChange={(e) => handleFieldChange('last_name', e.target.value)}
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
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notification-email">Notification Email</Label>
            <Input
              id="notification-email"
              type="email"
              value={profile.notification_email}
              onChange={(e) => handleFieldChange('notification_email', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
