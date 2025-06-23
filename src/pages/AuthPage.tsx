import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { testSupabaseAuth } from "@/utils/test-auth";
import { fixAuthIssues } from "@/utils/auth-fix";

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loading, error: authError, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  console.log('🔐 AuthPage render state:', { 
    user: !!user, 
    loading, 
    authLoading, 
    isAuthenticated,
    authError,
    localError
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      console.log("✅ User is authenticated, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, isAuthenticated, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔑 Attempting sign in with email:", email);
    setAuthLoading(true);
    setLocalError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      
      console.log("🔐 Sign in response:", { data: !!data, error });
      
      if (error) {
        console.error("❌ Sign in error:", error);
        setLocalError(error.message);
        toast.error("Sign in failed", {
          description: error.message
        });
      } else if (data.session) {
        console.log("✅ Sign in successful");
        toast.success("Signed in successfully");
        // Navigation will be handled by the useEffect above
      }
    } catch (error: any) {
      console.error("💥 Sign in unexpected error:", error);
      const errorMessage = error?.message || "An unexpected error occurred";
      setLocalError(errorMessage);
      toast.error("Unexpected error", {
        description: errorMessage
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Attempting sign up with email:", email);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return;
    }

    setAuthLoading(true);
    setLocalError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      console.log("📝 Sign up response:", { data: !!data, error });
      
      if (error) {
        console.error("❌ Sign up error:", error);
        setLocalError(error.message);
        toast.error("Sign up failed", {
          description: error.message
        });
      } else if (data.user) {
        if (data.session) {
          console.log("✅ Sign up and auto sign in successful");
          toast.success("Account created and signed in successfully");
          // Don't show onboarding here - let ProtectedRoute handle it
          // Navigation will happen automatically
        } else {
          console.log("📧 Sign up successful, email confirmation required");
          toast.success("Account created successfully", {
            description: "Please check your email to confirm your account"
          });
          setAuthTab("login");
        }
      }
    } catch (error: any) {
      console.error("💥 Sign up unexpected error:", error);
      const errorMessage = error?.message || "An unexpected error occurred";
      setLocalError(errorMessage);
      toast.error("Unexpected error", {
        description: errorMessage
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const clearError = () => {
    setLocalError(null);
  };

  // Show loading if auth is still loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-fixlyfy-bg-interface">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto animate-spin text-fixlyfy mb-4" />
          <p className="text-fixlyfy-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  const displayError = authError || localError;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-fixlyfy-bg-interface to-gray-50">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              F
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-fixlyfy-text">Fixlify</CardTitle>
          <CardDescription className="text-fixlyfy-text-secondary text-base">
            Field service management simplified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {displayError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-700 font-medium">{displayError}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearError}
                  className="mt-2 h-auto p-0 text-red-600 hover:text-red-800 text-xs"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
          
          <Tabs value={authTab} onValueChange={setAuthTab} defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
              <TabsTrigger value="login" className="data-[state=active]:bg-white">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-white">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-fixlyfy-text font-medium">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={authLoading}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-fixlyfy-text font-medium">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={authLoading}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-muted hover:text-fixlyfy-text transition-colors"
                      disabled={authLoading}
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-fixlyfy hover:bg-fixlyfy-light text-white font-medium"
                  disabled={authLoading || !email || !password}
                >
                  {authLoading ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-fixlyfy-text font-medium">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={authLoading}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-fixlyfy-text font-medium">Password</Label>
                  <div className="relative">
                    <Input 
                      id="signup-password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={authLoading}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-muted hover:text-fixlyfy-text transition-colors"
                      disabled={authLoading}
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-fixlyfy-text font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      required 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={authLoading}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-muted hover:text-fixlyfy-text transition-colors"
                      disabled={authLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-fixlyfy-text-muted">
                    Password must be at least 6 characters
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-fixlyfy hover:bg-fixlyfy-light text-white font-medium"
                  disabled={authLoading || !email || !password || !confirmPassword}
                >
                  {authLoading ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : "Create Account"}
                </Button>
                <p className="text-xs text-center text-fixlyfy-text-muted mt-4">
                  You'll be the company administrator
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-6">
          <p className="text-xs text-center text-fixlyfy-text-muted">
            By continuing, you agree to Fixlify's Terms of Service and Privacy Policy.
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="text-xs text-fixlyfy-text-muted hover:text-fixlyfy-text"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
