import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { UnifiedOnboardingModal } from "./UnifiedOnboardingModal";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

interface Profile {
  id: string;
  role: string;
  has_completed_onboarding: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  console.log('🛡️ ProtectedRoute:', {
    path: location.pathname,
    hasUser: !!user,
    loading,
    profileLoading,
    isCheckingOnboarding
  });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, role, has_completed_onboarding')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          // If profile doesn't exist, create a default one
          if (error.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                role: 'admin', // Default to admin for new users
                has_completed_onboarding: false
              })
              .select()
              .single();

            if (!createError && newProfile) {
              setProfile(newProfile);
            }
          }
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error in profile fetch:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Check onboarding status
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || !profile) {
        setIsCheckingOnboarding(false);
        return;
      }

      // Skip onboarding check for non-admin users
      if (profile.role !== 'admin') {
        setIsCheckingOnboarding(false);
        return;
      }

      // Show onboarding if not completed
      setShowOnboarding(!profile.has_completed_onboarding);
      setIsCheckingOnboarding(false);
    };

    checkOnboardingStatus();
  }, [user, profile]);

  if (loading || profileLoading || isCheckingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requireAdmin && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Update the profile state to reflect onboarding completion
    setProfile(prev => prev ? { ...prev, has_completed_onboarding: true } : null);
  };

  return (
    <>
      {children}
      {showOnboarding && profile.role === 'admin' && (
        <UnifiedOnboardingModal
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          userRole={profile.role}
          userId={user.id}
        />
      )}
    </>
  );
}
