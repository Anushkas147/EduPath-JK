import { useState } from "react";
import { useRoute } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Star,
  Users,
  Calendar,
  DollarSign,
  Bookmark,
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  Building,
  Award,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import collegesData from "@/data/colleges.json";
import { Link } from "wouter";

export default function CollegeDetail() {
  const [, params] = useRoute("/colleges/:name");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const collegeName = params?.name ? decodeURIComponent(params.name) : "";
  const college = collegesData.find(c => c.name === collegeName);

  const { data: savedColleges = [] } = useQuery({
    queryKey: ["/api/saved/colleges"],
    retry: false,
  });

  // Check if college is saved
  useState(() => {
    const isSaved = savedColleges.some((saved: any) => saved.collegeName === collegeName);
    setIsBookmarked(isSaved);
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await apiRequest("DELETE", `/api/saved/colleges/${encodeURIComponent(collegeName)}`);
      } else {
        await apiRequest("POST", "/api/saved/colleges", {
          collegeName: collegeName,
          location: college?.location || "",
        });
      }
    },
    onSuccess: () => {
      setIsBookmarked(!isBookmarked);
      queryClient.invalidateQueries({ queryKey: ["/api/saved/colleges"] });
      toast({
        title: isBookmarked ? "College Removed" : "College Saved",
        description: isBookmarked 
          ? `${collegeName} removed from saved items`
          : `${collegeName} saved to your favorites`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update saved colleges",
        variant: "destructive",
      });
    },
  });

  if (!college) {
    return (
      <div className="pt-20 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4" data-testid="text-not-found">
                College Not Found
              </h1>
              <p className="text-muted-foreground mb-4">
                The college you're looking for doesn't exist in our database.
              </p>
              <Button asChild data-testid="button-back-to-colleges">
                <Link href="/colleges">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Colleges
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getNirfBadgeColor = (nirf: string) => {
    if (nirf.includes("50-60") || nirf.includes("70-80")) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
    if (nirf.includes("90-100") || nirf.includes("100-150")) return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    if (nirf.includes("150-200")) return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
    return "bg-muted text-muted-foreground";
  };

  const handleBookmark = () => {
    saveMutation.mutate();
  };

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" asChild className="mb-4" data-testid="button-back">
            <Link href="/colleges">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Colleges
            </Link>
          </Button>

          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-college-name">
                    {college.name}
                  </h1>
                  <div className="flex items-center text-muted-foreground mb-4" data-testid="text-college-location">
                    <MapPin className="w-5 h-5 mr-2 text-primary" />
                    <span className="text-lg">{college.location}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    {college.nirf !== "Not listed" && college.nirf !== "Not applicable" && (
                      <Badge 
                        className={`${getNirfBadgeColor(college.nirf)} text-base px-3 py-1`}
                        data-testid="badge-nirf"
                      >
                        <Award className="w-4 h-4 mr-1" />
                        NIRF {college.nirf}
                      </Badge>
                    )}
                    <div className="flex items-center text-muted-foreground" data-testid="text-fees">
                      <DollarSign className="w-4 h-4 mr-1 text-primary" />
                      <span>{college.fees}</span>
                    </div>
                    {college.hostel === "Available" && (
                      <div className="flex items-center text-emerald-600 dark:text-emerald-400" data-testid="text-hostel">
                        <Users className="w-4 h-4 mr-1" />
                        <span>Hostel Available</span>
                      </div>
                    )}
                    {college.cutoff && (
                      <div className="flex items-center text-muted-foreground" data-testid="text-cutoff">
                        <Calendar className="w-4 h-4 mr-1 text-primary" />
                        <span>Cutoff: {college.cutoff}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:ml-8">
                  <Button
                    size="lg"
                    variant={isBookmarked ? "default" : "outline"}
                    onClick={handleBookmark}
                    disabled={saveMutation.isPending}
                    data-testid="button-save-college"
                  >
                    <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                    {isBookmarked ? 'Saved' : 'Save College'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="courses" data-testid="tab-courses">Courses</TabsTrigger>
                <TabsTrigger value="facilities" data-testid="tab-facilities">Facilities</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="text-about-title">About {college.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-foreground" data-testid="text-college-description">
                        {college.name} is a prestigious educational institution located in {college.location}. 
                        The college offers a wide range of undergraduate and postgraduate programs with a focus on 
                        quality education and holistic development of students.
                      </p>
                      
                      <Separator />
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Key Features</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Quality academic programs</li>
                            <li>• Experienced faculty members</li>
                            <li>• Modern infrastructure</li>
                            <li>• Active placement cell</li>
                            <li>• Student support services</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Accreditation</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {college.nirf !== "Not listed" && college.nirf !== "Not applicable" && (
                              <li>• NIRF Ranked ({college.nirf})</li>
                            )}
                            <li>• UGC Recognized</li>
                            <li>• State Government Approved</li>
                            <li>• NAAC Accredited</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle data-testid="text-admission-title">Admission Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {college.cutoff && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Cutoff Information</h4>
                          <p className="text-muted-foreground">{college.cutoff}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Fee Structure</h4>
                        <p className="text-muted-foreground">{college.fees}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          *Fee structure may vary by program. Please contact the college for detailed information.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Accommodation</h4>
                        <p className="text-muted-foreground">
                          Hostel facilities are {college.hostel.toLowerCase()}. 
                          {college.hostel === "Available" && " Both boys and girls hostel facilities are provided with modern amenities."}
                          {college.hostel === "Limited" && " Limited hostel facilities are available. Early application is recommended."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" data-testid="text-courses-title">
                      <BookOpen className="w-5 h-5" />
                      Popular Courses Offered
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4" data-testid="list-all-courses">
                      {college.popular_courses.map((course, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-muted rounded-lg"
                          data-testid={`course-${index}`}
                        >
                          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                            <BookOpen className="w-4 h-4 text-primary-foreground" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{course}</h4>
                            <p className="text-xs text-muted-foreground">
                              {course.includes('B.') ? 'Undergraduate' : 
                               course.includes('M.') ? 'Postgraduate' : 
                               course.includes('PhD') ? 'Doctoral' : 'Professional'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Course Information</h4>
                      <p className="text-sm text-muted-foreground">
                        For detailed information about specific courses, admission requirements, syllabus, 
                        and career prospects, please contact the college admission office directly.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="facilities" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" data-testid="text-facilities-title">
                      <Building className="w-5 h-5" />
                      Campus Facilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4" data-testid="list-all-facilities">
                      {college.facilities.map((facility, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-muted rounded-lg"
                          data-testid={`facility-${index}`}
                        >
                          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mr-3">
                            <Star className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="font-medium text-foreground">{facility}</span>
                        </div>
                      ))}
                      {college.hostel === "Available" && (
                        <div className="flex items-center p-3 bg-muted rounded-lg" data-testid="facility-hostel">
                          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mr-3">
                            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="font-medium text-foreground">Hostel Accommodation</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Additional Services</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Student counseling services</li>
                        <li>• Career guidance and placement support</li>
                        <li>• Medical facilities and health services</li>
                        <li>• Cafeteria and dining facilities</li>
                        <li>• Transportation services</li>
                        <li>• 24/7 security and safety measures</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-quick-actions-title">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" data-testid="button-apply-now">
                  Apply Now
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-download-brochure">
                  Download Brochure
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-virtual-tour">
                  Virtual Campus Tour
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-contact-title">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Contact college directly for phone number
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Email information available on request
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Official website details available
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {college.location}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Related Colleges */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-related-colleges-title">Similar Colleges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {collegesData
                  .filter(c => 
                    c.name !== college.name && 
                    c.location.includes(college.location.split(',')[1]?.trim() || college.location.split(',')[0])
                  )
                  .slice(0, 3)
                  .map((relatedCollege) => (
                    <div 
                      key={relatedCollege.name}
                      className="p-3 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      data-testid={`related-college-${relatedCollege.name.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      <Link href={`/colleges/${encodeURIComponent(relatedCollege.name)}`}>
                        <h4 className="font-medium text-foreground text-sm mb-1">
                          {relatedCollege.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {relatedCollege.location}
                        </p>
                      </Link>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
