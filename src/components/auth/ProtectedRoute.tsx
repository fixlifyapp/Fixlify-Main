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

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

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

      // Check if user has completed onboarding
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('has_completed_onboarding')
        .eq('id', user.id)
        .single();

      if (!error && profileData) {
        setShowOnboarding(!profileData.has_completed_onboarding);
      }
      
      setIsCheckingOnboarding(false);
    };

    checkOnboardingStatus();
  }, [user, profile]);

  if (isLoading || isCheckingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check role-based access
  if (requireAdmin && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
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
