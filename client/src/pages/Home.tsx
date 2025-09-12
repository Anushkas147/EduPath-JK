import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  University, 
  Route, 
  Bookmark, 
  Calendar, 
  Star,
  TrendingUp,
  Award,
  Clock,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/LanguageSwitcher";
import { getTranslation } from "@/lib/translations";

export default function Home() {
  const { user } = useAuth();
  const currentLanguage = useLanguage();

  const { data: profile } = useQuery({
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

  const { data: activities } = useQuery({
    queryKey: ["/api/activity"],
    retry: false,
  });

  const { data: timeline } = useQuery({
    queryKey: ["/api/timeline"],
    retry: false,
  });

  // Safe array access with null checks
  const safeColleges = Array.isArray(savedColleges) ? savedColleges : [];
  const safeCourses = Array.isArray(savedCourses) ? savedCourses : [];
  const safeAssessments = Array.isArray(assessments) ? assessments : [];
  const safeActivities = Array.isArray(activities) ? activities : [];
  const safeTimeline = Array.isArray(timeline) ? timeline : [];

  const userName = user?.firstName || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-welcome">
                  {getTranslation("welcomeBack", currentLanguage)}, {userName}!
                </h1>
                <p className="text-muted-foreground">{getTranslation("dashboardDescription", currentLanguage)}</p>
                {profile && !profile.profileCompleted && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      {getTranslation("profileIncomplete", currentLanguage)}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="mt-4 md:mt-0 flex gap-3">
                <Button asChild data-testid="button-take-assessment">
                  <Link href="/quiz">
                    <Star className="w-4 h-4 mr-2" />
                    {getTranslation("takeAssessment", currentLanguage)}
                  </Link>
                </Button>
                <Button variant="outline" asChild data-testid="button-explore-colleges">
                  <Link href="/colleges">
                    <University className="w-4 h-4 mr-2" />
                    {getTranslation("colleges", currentLanguage)}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stat-recommended-colleges">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{getTranslation("recommendedColleges", currentLanguage)}</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <University className="text-primary text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-career-paths">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{getTranslation("careerPaths", currentLanguage)}</p>
                  <p className="text-2xl font-bold text-foreground">8</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                  <Route className="text-emerald-600 dark:text-emerald-400 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-saved-items">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{getTranslation("savedItems", currentLanguage)}</p>
                  <p className="text-2xl font-bold text-foreground">{safeColleges.length + safeCourses.length}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                  <Bookmark className="text-amber-600 dark:text-amber-400 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-deadlines">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{getTranslation("upcomingDeadlines", currentLanguage)}</p>
                  <p className="text-2xl font-bold text-foreground">{safeTimeline.length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <Calendar className="text-red-600 dark:text-red-400 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Personalized Feed */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="text-recommendations-title">
                  <TrendingUp className="w-5 h-5" />
                  {getTranslation("recommendedForYou", currentLanguage)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sample College Recommendation */}
                <Card className="border-l-4 border-l-primary bg-primary/5 dark:bg-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground" data-testid="text-recommended-college">
                        University of Kashmir
                      </h4>
                      <Badge className="bg-primary text-primary-foreground">98% Match</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">Hazratbal, Srinagar</p>
                    <p className="text-sm text-foreground mb-3">
                      Strong programs in Science and Engineering with excellent research facilities.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-muted-foreground">
                          <Star className="w-3 h-3 inline text-yellow-500 mr-1" />
                          NIRF 50-60
                        </span>
                        <span className="text-xs text-muted-foreground">₹15K-30K/sem</span>
                      </div>
                      <Button variant="link" size="sm" asChild data-testid="button-learn-more">
                        <Link href="/colleges/University of Kashmir">{getTranslation("learnMore", currentLanguage)}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Sample Course Recommendation */}
                <Card className="border-l-4 border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground" data-testid="text-recommended-course">
                        B.Sc Computer Science
                      </h4>
                      <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                        High Demand
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">3-Year Undergraduate Program</p>
                    <p className="text-sm text-foreground mb-3">
                      Perfect for students interested in programming and software development.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Avg. Salary: ₹4-8 LPA</span>
                      <Button variant="link" size="sm" asChild data-testid="button-explore-career">
                        <Link href="/courses">{getTranslation("exploreCareerPath", currentLanguage)}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Scholarship Alert */}
                <Card className="border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                        <Award className="text-amber-600 dark:text-amber-400 text-sm" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1" data-testid="text-scholarship-title">
                          Merit Scholarship Available
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          J&K State Merit Scholarship - Deadline: March 15, 2025
                        </p>
                        <Button variant="link" size="sm" className="text-amber-700 dark:text-amber-300 p-0" data-testid="button-apply-scholarship">
                          Apply Now <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="text-activity-title">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {safeActivities.length > 0 ? (
                    safeActivities.slice(0, 5).map((activity, index) => (
                      <div key={activity.id} className="flex items-center space-x-3" data-testid={`activity-${index}`}>
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <p className="text-sm text-foreground">{activity.description}</p>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                      </div>
                      <div className="text-center py-4">
                        <Button asChild data-testid="button-start-exploring">
                          <Link href="/quiz">Start by taking an assessment</Link>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            {profile && !profile.profileCompleted && (
              <Card className="border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="text-lg text-amber-700 dark:text-amber-300" data-testid="text-profile-completion">
                    Complete Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">60%</div>
                    <p className="text-sm text-muted-foreground">Profile completion</p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div className="bg-amber-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                  <Button className="w-full" asChild data-testid="button-complete-profile">
                    <Link href="/profile-setup">Complete Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg" data-testid="text-deadlines-title">Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                      <Calendar className="text-red-600 dark:text-red-400 w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground" data-testid="text-deadline-cuet">
                        CUET Registration
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">Ends in 5 days</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                      <Calendar className="text-amber-600 dark:text-amber-400 w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground" data-testid="text-deadline-merit">
                        Merit List Publication
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">In 12 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg" data-testid="text-quick-actions-title">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                    data-testid="button-take-career-assessment"
                  >
                    <Link href="/quiz">
                      <Star className="mr-2 h-4 w-4 text-primary" />
                      Take Career Assessment
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                    data-testid="button-search-colleges"
                  >
                    <Link href="/colleges">
                      <University className="mr-2 h-4 w-4 text-primary" />
                      Search Colleges
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                    data-testid="button-explore-courses"
                  >
                    <Link href="/courses">
                      <Route className="mr-2 h-4 w-4 text-primary" />
                      Explore Courses
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
