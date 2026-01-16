import React, { useEffect, useState, useCallback } from 'react';
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
  organization_id?: string;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, error, isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Force sign out and redirect on auth error
  const handleAuthError = useCallback(async () => {
    console.log('Auth error detected, signing out...');
    setAuthError(true);
    try {
      await signOut();
    } catch (e) {
      console.error('Error signing out:', e);
    }
    // Clear any cached auth data
    localStorage.removeItem('fixlify-auth-token');
    localStorage.removeItem('sb-mqppvcrlvsgrsqelglod-auth-token');
    window.location.href = '/auth';
  }, [signOut]);

  // Handle auth errors
  useEffect(() => {
    if (error && error.includes('refresh_token')) {
      handleAuthError();
    }
  }, [error, handleAuthError]);

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
          .select('id, role, has_completed_onboarding, organization_id')
          .eq('id', user.id)
          .single();

        if (error) {
          // Handle 401 unauthorized - session is invalid
          if (error.message?.includes('401') || error.code === '401' || error.message?.includes('JWT')) {
            console.error('Profile fetch returned 401 - session invalid');
            handleAuthError();
            return;
          }

          // If profile doesn't exist, create one with proper organization
          if (error.code === 'PGRST116') {
            // Check if user was invited to an organization
            const { data: invitation } = await supabase
              .from('team_invitations')
              .select('role, invited_by, organization_id')
              .eq('email', user.email?.toLowerCase())
              .eq('status', 'pending')
              .single();

            let organizationId: string | null = null;
            let userRole = 'technician'; // Default role for new users (not admin!)

            if (invitation && invitation.invited_by) {
              // User was invited - get inviter's organization
              const { data: inviterProfile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', invitation.invited_by)
                .single();

              if (inviterProfile?.organization_id) {
                organizationId = inviterProfile.organization_id;
                userRole = invitation.role || 'technician';

                // Update invitation status to accepted
                await supabase
                  .from('team_invitations')
                  .update({ status: 'accepted' })
                  .eq('email', user.email?.toLowerCase())
                  .eq('status', 'pending');
              }
            }

            // If no invitation found, this is a new organization owner
            if (!organizationId) {
              // Create a new organization for this user
              const { data: newOrg, error: orgError } = await supabase
                .from('organizations')
                .insert({ name: 'My Company' })
                .select()
                .single();

              if (!orgError && newOrg) {
                organizationId = newOrg.id;
                userRole = 'admin'; // Only org creators become admin
              }
            }

            // Create the profile with organization
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                role: userRole,
                organization_id: organizationId,
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
      } catch (error: any) {
        // Check if it's an auth error (401)
        if (error?.status === 401 || error?.message?.includes('401')) {
          console.error('Profile fetch threw 401 error');
          handleAuthError();
          return;
        }
        // Silent fail for other errors - profile will be null
        console.error('Profile fetch error:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, handleAuthError]);

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

  // If auth error occurred, redirect to auth page
  if (authError) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (loading || profileLoading || isCheckingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated && !loading) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!user && !loading) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Wait for profile to load before rendering children
  // The 401 handling above will catch invalid sessions
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
