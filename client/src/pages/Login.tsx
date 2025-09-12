import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    google: any;
    handleGoogleCallback: (response: any) => void;
  }
}

export default function Login() {
  const [, setLocation] = useLocation();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const googleLoginMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Google authentication failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login successful",
        description: `Welcome ${data.user.firstName || 'back'}!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Google authentication failed. Please try again.",
        variant: "destructive",
      });
      // Show dev login on OAuth failure
      setShowDevLogin(true);
    },
  });

  const devLoginMutation = useMutation({
    mutationFn: async () => {
      // First try to register, then login (for testing)
      try {
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: email || "test@example.com",
            password: password || "test123",
            firstName: "Test",
            lastName: "User"
          })
        });
      } catch {}
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email || "test@example.com",
          password: password || "test123"
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Development login failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Development login successful",
        description: `Welcome ${data.user.firstName || 'back'}!`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id',
          callback: window.handleGoogleCallback,
        });
        
        // Render the Google Sign-In button
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          { 
            theme: "outline", 
            size: "large", 
            width: "100%",
            text: "continue_with"
          }
        );
        
        setIsGoogleLoaded(true);
      }
    };
    document.head.appendChild(script);

    // Define global callback function
    window.handleGoogleCallback = (response: any) => {
      googleLoginMutation.mutate(response.credential);
    };

    return () => {
      document.head.removeChild(script);
      delete window.handleGoogleCallback;
    };
  }, []);

  const handleGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="text-primary-foreground w-6 h-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to EduPath J&K</CardTitle>
          <CardDescription>
            {showDevLogin ? "Development Login" : "Sign in with your Gmail account to access the platform (Gmail only)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(googleLoginMutation.error || devLoginMutation.error) && (
            <Alert variant="destructive" data-testid="alert-login-error">
              <AlertDescription>
                {googleLoginMutation.error?.message || devLoginMutation.error?.message || "Login failed. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {showDevLogin ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="test@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-dev-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="test123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-dev-password"
                />
              </div>
              <Button
                onClick={() => devLoginMutation.mutate()}
                disabled={devLoginMutation.isPending}
                className="w-full"
                data-testid="button-dev-login"
              >
                {devLoginMutation.isPending ? "Signing in..." : "Development Login"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDevLogin(false)}
                className="w-full"
                data-testid="button-back-to-google"
              >
                Back to Google Login
              </Button>
              <div className="text-center text-xs text-muted-foreground">
                Use test@example.com / test123 or enter your own
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google Sign-In Button (rendered by Google) */}
              <div id="google-signin-button" className="w-full"></div>
              
              {/* Fallback button if Google button doesn't load */}
              {!isGoogleLoaded && (
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={googleLoginMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
                  data-testid="button-google-signin"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {googleLoginMutation.isPending ? "Signing in..." : "Continue with Gmail"}
                </Button>
              )}
              
              {!isGoogleLoaded && (
                <div className="text-center text-sm text-muted-foreground">
                  Loading Google Sign-In...
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => setShowDevLogin(true)}
                className="w-full"
                data-testid="button-show-dev-login"
              >
                Development Login
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Only Gmail accounts (@gmail.com) are allowed for Google login
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}