import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AlertCircle, User, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

type UserProfile = {
  id?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  currentClass?: '10' | '12' | 'graduate';
  academicScore?: number;
  location?: string;
  interests?: string[];
  profileCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

interface ProfileGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireFields?: string[];
}

export function ProfileGuard({ 
  children, 
  redirectTo = "/profile-setup",
  requireFields = ['age', 'gender', 'currentClass', 'academicScore', 'location', 'interests']
}: ProfileGuardProps) {
  const [currentPath, setLocation] = useLocation();
  
  // Create field labels mapping
  const fieldLabels: Record<string, string> = {
    'age': 'Age',
    'gender': 'Gender', 
    'currentClass': 'Current Class',
    'academicScore': 'Academic Score',
    'location': 'Location',
    'interests': 'Academic Interests'
  };
  
  const { data: profile, isLoading, error } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    retry: false,
  });

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    
    const filledFields = requireFields.filter(field => {
      if (field === 'interests') {
        return profile.interests && profile.interests.length > 0;
      }
      const value = profile[field as keyof UserProfile];
      return value !== null && value !== undefined && value !== '';
    });
    
    return Math.round((filledFields.length / requireFields.length) * 100);
  };

  const isProfileComplete = () => {
    if (!profile) return false;
    const completion = calculateProfileCompletion();
    return completion >= 80; // Require at least 80% completion
  };


  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Profile Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Unable to load your profile. Please try again.
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile || !isProfileComplete()) {
    const completion = calculateProfileCompletion();
    
    return (
      <div className="pt-20 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <User className="w-5 h-5" />
                Complete Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                  {completion}%
                </div>
                <p className="text-muted-foreground mb-4">Profile completion</p>
                <Progress value={completion} className="w-full" />
              </div>

              <div className="space-y-4">
                <p className="text-foreground">
                  You need to complete your profile before accessing the career assessment quiz. 
                  This helps us provide personalized recommendations.
                </p>

                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Required information:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {requireFields.map((field) => {
                      const label = fieldLabels[field] || field;
                      const isComplete = field === 'interests' 
                        ? profile?.interests && profile.interests.length > 0
                        : profile?.[field as keyof UserProfile] !== null && 
                          profile?.[field as keyof UserProfile] !== undefined &&
                          profile?.[field as keyof UserProfile] !== '';
                      
                      return (
                        <div key={field} className="flex items-center gap-2">
                          {isComplete ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-muted rounded-full" />
                          )}
                          <span className={isComplete ? "text-green-600" : "text-muted-foreground"}>
                            {label}
                          </span>
                          {isComplete && (
                            <Badge variant="secondary" className="text-xs">
                              Complete
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    // Store current path as return destination
                    sessionStorage.setItem('profileReturnPath', currentPath);
                    setLocation(redirectTo);
                  }}
                  className="flex-1"
                >
                  Complete Profile
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/")}
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Profile is complete, render the protected content
  return <>{children}</>;
}

export default ProfileGuard;