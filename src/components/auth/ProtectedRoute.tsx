import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { EnhancedOnboardingModal } from "./EnhancedOnboardingModal";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      toast.error("Authentication required", {
        description: "Please sign in to access this page"
      });
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('has_completed_onboarding')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking onboarding status:', error);
          // If there's an error, assume onboarding is needed
          setShowOnboarding(true);
        } else {
          setShowOnboarding(!profile?.has_completed_onboarding);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setShowOnboarding(true);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);
  
  if (loading || checkingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <>
      {children}
      <EnhancedOnboardingModal open={showOnboarding} onOpenChange={setShowOnboarding} />
    </>
  );
}
