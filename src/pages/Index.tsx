import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading, error, isAuthenticated } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  
  console.log('🏠 Index component rendered', { loading, isAuthenticated, user, error });
  
  // Add a simple debug render at the top
  if (typeof window !== 'undefined') {
    console.log('🏠 Index component is rendering, current state:', { loading, isAuthenticated, error });
  }

  // Simple debug render to ensure component is working
  if (loading === undefined) {
    return (
      <div style={{ padding: '20px', background: 'red', color: 'white' }}>
        DEBUG: Index component loaded but auth state is undefined
      </div>
    );
  }
  
  useEffect(() => {
    console.log('🏠 Index page state:', { 
      loading, 
      isAuthenticated, 
      hasUser: !!user, 
      error,
      redirecting 
    });

    // Only redirect if we're sure about authentication state and not already redirecting
    if (!loading && !redirecting) {
      setRedirecting(true);
      
      if (isAuthenticated && user) {
        console.log('✅ User authenticated, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      }
      // Don't redirect to auth automatically - let user choose to login
    }
  }, [user, loading, isAuthenticated, navigate, redirecting]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-fixlyfy-bg">
        <div className="text-center max-w-md">
          <AlertCircle size={40} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-fixlyfy-text-secondary mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-fixlyfy hover:bg-fixlyfy/90"
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-fixlyfy-bg">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto animate-spin text-fixlyfy mb-4" />
          <p className="text-fixlyfy-text-secondary">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, they'll be redirected above
  // If not authenticated, show welcome page with login option
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-fixlyfy-bg">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-fixlyfy">Welcome to Fixlify</h1>
          <p className="text-fixlyfy-text-secondary mb-6">
            Your comprehensive business management platform
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-fixlyfy hover:bg-fixlyfy/90"
            size="lg"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // This shouldn't be reached due to the redirect above, but just in case
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-fixlyfy-bg">
      <div className="text-center">
        <Loader2 size={40} className="mx-auto animate-spin text-fixlyfy mb-4" />
        <p className="text-fixlyfy-text-secondary">Redirecting...</p>
      </div>
    </div>
  );
}
