import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Edit3,
  Settings,
  BookOpen,
  University,
  Award,
  TrendingUp,
  Calendar,
  MapPin,
  Mail,
  Clock,
  BarChart3,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const profileUpdateSchema = z.object({
  age: z.number().min(15).max(25).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  currentClass: z.enum(['10', '12', 'graduate']).optional(),
  academicScore: z.number().min(0).max(100).optional(),
  location: z.string().min(1).optional(),
  interests: z.array(z.string()).optional(),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

const districts = [
  'srinagar', 'jammu', 'anantnag', 'baramulla', 'kathua', 
  'udhampur', 'doda', 'rajouri', 'poonch', 'pulwama',
  'kupwara', 'sopore', 'handwara', 'ramban'
];

const interestOptions = [
  'science', 'mathematics', 'arts', 'commerce', 'technology', 
  'medicine', 'engineering', 'literature', 'history', 'sports'
];

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
    retry: false,
  });

  const { data: savedColleges } = useQuery({
    queryKey: ["/api/saved/colleges"],
    retry: false,
  });

  const { data: savedCourses } = useQuery({
    queryKey: ["/api/saved/courses"],
    retry: false,
  });

  const { data: assessments } = useQuery({
    queryKey: ["/api/assessments"],
    retry: false,
  });

  // Safe array access with null checks
  const safeColleges = Array.isArray(savedColleges) ? savedColleges : [];
  const safeCourses = Array.isArray(savedCourses) ? savedCourses : [];
  const safeAssessments = Array.isArray(assessments) ? assessments : [];

  const { data: activities = [] } = useQuery({
    queryKey: ["/api/activity"],
    retry: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      age: profile?.age || undefined,
      gender: profile?.gender || undefined,
      currentClass: profile?.currentClass || undefined,
      academicScore: profile?.academicScore ? Number(profile.academicScore) : undefined,
      location: profile?.location || undefined,
      interests: profile?.interests || [],
    },
  });

  const currentClass = watch("currentClass");

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      await apiRequest("POST", "/api/profile", { ...data, interests: selectedInterests });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Initialize form when profile data is loaded
  useState(() => {
    if (profile) {
      reset({
        age: profile.age || undefined,
        gender: profile.gender || undefined,
        currentClass: profile.currentClass || undefined,
        academicScore: profile.academicScore ? Number(profile.academicScore) : undefined,
        location: profile.location || undefined,
        interests: profile.interests || [],
      });
      setSelectedInterests(profile.interests || []);
    }
  });

  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      setSelectedInterests([...selectedInterests, interest]);
    } else {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    }
  };

  const onSubmit = (data: ProfileUpdateData) => {
    updateMutation.mutate(data);
  };

  const cancelEdit = () => {
    if (profile) {
      reset({
        age: profile.age || undefined,
        gender: profile.gender || undefined,
        currentClass: profile.currentClass || undefined,
        academicScore: profile.academicScore ? Number(profile.academicScore) : undefined,
        location: profile.location || undefined,
        interests: profile.interests || [],
      });
      setSelectedInterests(profile.interests || []);
    }
    setIsEditing(false);
  };

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    const fields = ['age', 'gender', 'currentClass', 'academicScore', 'location'];
    const filledFields = fields.filter(field => profile[field] !== null && profile[field] !== undefined);
    const interestsFilled = profile.interests && profile.interests.length > 0 ? 1 : 0;
    return Math.round(((filledFields.length + interestsFilled) / (fields.length + 1)) * 100);
  };

  const getLatestAssessment = () => {
    if (safeAssessments.length === 0) return null;
    return safeAssessments.reduce((latest, current) => 
      new Date(current.completedAt) > new Date(latest.completedAt) ? current : latest
    );
  };

  const userName = user?.firstName || user?.email?.split('@')[0] || 'Student';
  const profileCompletion = calculateProfileCompletion();
  const latestAssessment = getLatestAssessment();

  if (authLoading || profileLoading) {
    return (
      <div className="pt-20 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover"
                        data-testid="img-profile-picture"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-primary-foreground" data-testid="text-profile-initial">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-profile-name">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : userName}
                    </h1>
                    <div className="space-y-2">
                      {user?.email && (
                        <p className="text-muted-foreground flex items-center" data-testid="text-profile-email">
                          <Mail className="w-4 h-4 mr-2" />
                          {user.email}
                        </p>
                      )}
                      {profile?.currentClass && profile?.location && (
                        <p className="text-muted-foreground flex items-center" data-testid="text-profile-details">
                          <MapPin className="w-4 h-4 mr-2" />
                          Class {profile.currentClass === 'graduate' ? 'Graduate' : `${profile.currentClass}th`} Student • {profile.location.charAt(0).toUpperCase() + profile.location.slice(1)}, J&K
                        </p>
                      )}
                      <div className="flex items-center space-x-4">
                        {profile?.currentClass && profile?.academicScore && (
                          <Badge variant="secondary" data-testid="badge-academic-score">
                            {profile.currentClass === '10' ? 'Class 10th' : profile.currentClass === '12' ? 'Class 12th' : 'Graduate'}: {profile.academicScore}%
                          </Badge>
                        )}
                        {latestAssessment && (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" data-testid="badge-assessment-completed">
                            <Award className="w-3 h-3 mr-1" />
                            Assessment Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => isEditing ? cancelEdit() : setIsEditing(true)}
                    disabled={updateMutation.isPending}
                    data-testid="button-edit-profile"
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                  <Button variant="outline" data-testid="button-settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Profile Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" data-testid="text-academic-info-title">
                    <BookOpen className="w-5 h-5" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="form-edit-profile">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="age" className="text-sm font-medium text-foreground">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            min="15"
                            max="25"
                            placeholder="Enter your age"
                            {...register("age", { valueAsNumber: true })}
                            data-testid="input-edit-age"
                          />
                          {errors.age && (
                            <p className="text-sm text-destructive mt-1">{errors.age.message}</p>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-foreground">Gender</Label>
                          <Select
                            onValueChange={(value) => setValue("gender", value as any)}
                            value={watch("gender") || ""}
                            data-testid="select-edit-gender"
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm font-medium text-foreground">Current Class</Label>
                          <Select
                            onValueChange={(value) => setValue("currentClass", value as any)}
                            value={watch("currentClass") || ""}
                            data-testid="select-edit-class"
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">Class 10th</SelectItem>
                              <SelectItem value="12">Class 12th</SelectItem>
                              <SelectItem value="graduate">Graduate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="academicScore" className="text-sm font-medium text-foreground">
                            Academic Score
                            {currentClass === "10" && " (Percentage)"}
                            {currentClass === "12" && " (Percentile)"}
                          </Label>
                          <Input
                            id="academicScore"
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Enter score"
                            {...register("academicScore", { valueAsNumber: true })}
                            data-testid="input-edit-score"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-foreground">Location (District)</Label>
                        <Select
                          onValueChange={(value) => setValue("location", value)}
                          value={watch("location") || ""}
                          data-testid="select-edit-location"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select District" />
                          </SelectTrigger>
                          <SelectContent>
                            {districts.map((district) => (
                              <SelectItem key={district} value={district}>
                                {district.charAt(0).toUpperCase() + district.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-foreground mb-3 block">
                          Academic Interests
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {interestOptions.map((interest) => (
                            <div key={interest} className="flex items-center space-x-2">
                              <Checkbox
                                id={`edit-${interest}`}
                                checked={selectedInterests.includes(interest)}
                                onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                                data-testid={`checkbox-edit-interest-${interest}`}
                              />
                              <Label htmlFor={`edit-${interest}`} className="text-sm cursor-pointer">
                                {interest.charAt(0).toUpperCase() + interest.slice(1)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          data-testid="button-save-profile"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button type="button" variant="outline" onClick={cancelEdit} data-testid="button-cancel-edit">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      {profile ? (
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">Age</span>
                            <span className="font-medium" data-testid="text-display-age">
                              {profile.age || 'Not specified'}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">Gender</span>
                            <span className="font-medium" data-testid="text-display-gender">
                              {profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1).replace('-', ' ') : 'Not specified'}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">Current Class</span>
                            <span className="font-medium" data-testid="text-display-class">
                              {profile.currentClass ? (
                                profile.currentClass === 'graduate' ? 'Graduate' : `Class ${profile.currentClass}th`
                              ) : 'Not specified'}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">Academic Score</span>
                            <span className="font-medium" data-testid="text-display-score">
                              {profile.academicScore ? `${profile.academicScore}%` : 'Not specified'}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">Location</span>
                            <span className="font-medium" data-testid="text-display-location">
                              {profile.location ? profile.location.charAt(0).toUpperCase() + profile.location.slice(1) : 'Not specified'}
                            </span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Interests</span>
                            <div className="flex flex-wrap gap-1 justify-end max-w-xs" data-testid="list-display-interests">
                              {profile.interests && profile.interests.length > 0 ? (
                                profile.interests.map((interest, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {interest.charAt(0).toUpperCase() + interest.slice(1)}
                                  </Badge>
                                ))
                              ) : (
                                <span className="font-medium">Not specified</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4" data-testid="text-no-profile">
                            No profile information available. Complete your profile to get personalized recommendations.
                          </p>
                          <Button onClick={() => setIsEditing(true)} data-testid="button-complete-profile">
                            Complete Profile
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Assessment Results */}
              {latestAssessment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" data-testid="text-assessment-results-title">
                      <BarChart3 className="w-5 h-5" />
                      Latest Assessment Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(latestAssessment.results as Record<string, number>)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([stream, score], index) => (
                          <div key={stream} className="bg-muted rounded-lg p-4" data-testid={`assessment-result-${stream}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium capitalize">
                                {stream === 'science' ? 'Science Stream' : 
                                 stream === 'engineering' ? 'Engineering' :
                                 stream === 'medical' ? 'Medical' :
                                 stream === 'commerce' ? 'Commerce' :
                                 stream === 'arts' ? 'Arts' :
                                 'Vocational'}
                              </span>
                              <span className={`text-2xl font-bold ${
                                index === 0 ? 'text-primary' : 
                                index === 1 ? 'text-emerald-600 dark:text-emerald-400' : 
                                'text-amber-600 dark:text-amber-400'
                              }`}>
                                {score}%
                              </span>
                            </div>
                            <Progress value={score} className="h-2" />
                          </div>
                        ))}
                      <div className="text-center pt-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Assessment completed on {new Date(latestAssessment.completedAt).toLocaleDateString()}
                        </p>
                        <Button variant="outline" size="sm" data-testid="button-retake-assessment">
                          Retake Assessment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" data-testid="text-recent-activity-title">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activities.length > 0 ? (
                      activities.slice(0, 5).map((activity, index) => (
                        <div key={activity.id} className="flex items-center space-x-3" data-testid={`activity-item-${index}`}>
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <p className="text-sm text-foreground flex-1">{activity.description}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground text-sm" data-testid="text-no-activity">
                          No recent activity. Start exploring colleges and courses to see your activity here.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <Card className={profileCompletion < 100 ? "border-amber-200 dark:border-amber-800" : ""}>
                <CardHeader>
                  <CardTitle className={`text-lg ${profileCompletion < 100 ? 'text-amber-700 dark:text-amber-300' : ''}`} data-testid="text-profile-completion-title">
                    Profile Completion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className={`text-3xl font-bold mb-1 ${
                      profileCompletion < 100 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`} data-testid="text-completion-percentage">
                      {profileCompletion}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {profileCompletion < 100 ? 'Almost complete!' : 'Profile complete!'}
                    </p>
                  </div>
                  <Progress value={profileCompletion} className="mb-4" data-testid="progress-profile-completion" />
                  {profileCompletion < 100 && (
                    <Button 
                      className="w-full" 
                      onClick={() => setIsEditing(true)}
                      data-testid="button-complete-profile-sidebar"
                    >
                      Complete Profile
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-quick-stats-title">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Saved Colleges</span>
                      <span className="font-medium" data-testid="count-saved-colleges">{safeColleges.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Saved Courses</span>
                      <span className="font-medium" data-testid="count-saved-courses">{safeCourses.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Assessments Taken</span>
                      <span className="font-medium" data-testid="count-assessments">{safeAssessments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Activities Logged</span>
                      <span className="font-medium" data-testid="count-activities">{activities.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-quick-actions-sidebar-title">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                    data-testid="button-view-saved-colleges"
                  >
                    <Link href="/colleges">
                      <University className="mr-2 h-4 w-4 text-primary" />
                      View Saved Colleges ({safeColleges.length})
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                    data-testid="button-view-saved-courses"
                  >
                    <Link href="/courses">
                      <BookOpen className="mr-2 h-4 w-4 text-primary" />
                      View Saved Courses ({safeCourses.length})
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                    data-testid="button-assessment-history"
                  >
                    <Link href="/quiz/results">
                      <BarChart3 className="mr-2 h-4 w-4 text-primary" />
                      Assessment History
                    </Link>
                  </Button>
                  <Separator className="my-2" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                    data-testid="button-account-settings"
                  >
                    <Link href="/profile">
                      <Settings className="mr-2 h-4 w-4 text-primary" />
                      Account Settings
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
