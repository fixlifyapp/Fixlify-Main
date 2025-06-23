import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { OnboardingModal } from "./OnboardingModal";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      toast.error("Authentication required", {
        description: "Please sign in to continue"
      });
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        // Get user profile with role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, has_completed_onboarding')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setCheckingOnboarding(false);
          return;
        }

        setUserRole(profile?.role || 'technician');

        // Only show onboarding for admins who haven't completed it
        if (profile?.role === 'admin' && !profile?.has_completed_onboarding) {
          console.log('Admin user needs onboarding', profile);
          setShowOnboarding(true);
        } else {
          console.log('Onboarding not needed:', { role: profile?.role, completed: profile?.has_completed_onboarding });
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    if (user && !loading) {
      checkOnboardingStatus();
    }
  }, [user, loading]);

  if (loading || checkingOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-fixlyfy-bg-interface">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto animate-spin text-fixlyfy mb-4" />
          <p className="text-fixlyfy-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      {children}
      {showOnboarding && userRole === 'admin' && (
        <OnboardingModal 
          open={showOnboarding} 
          onOpenChange={setShowOnboarding}
        />
      )}
    </>
  );
}
