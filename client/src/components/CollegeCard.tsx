import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { MapPin, Star, Bookmark, Users, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/components/LanguageSwitcher";
import { getTranslation } from "@/lib/translations";

interface College {
  name: string;
  location: string;
  cutoff?: string;
  facilities: string[];
  fees: string;
  hostel: string;
  popular_courses: string[];
  nirf: string;
}

interface CollegeCardProps {
  college: College;
  isSaved?: boolean;
}

export default function CollegeCard({ college, isSaved = false }: CollegeCardProps) {
  const currentLanguage = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(isSaved);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await apiRequest("DELETE", `/api/saved/colleges/${encodeURIComponent(college.name)}`);
      } else {
        await apiRequest("POST", "/api/saved/colleges", {
          collegeName: college.name,
          location: college.location,
        });
      }
    },
    onSuccess: () => {
      setIsBookmarked(!isBookmarked);
      queryClient.invalidateQueries({ queryKey: ["/api/saved/colleges"] });
      toast({
        title: isBookmarked ? "College Removed" : "College Saved",
        description: isBookmarked 
          ? `${college.name} removed from saved items`
          : `${college.name} saved to your favorites`,
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

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    saveMutation.mutate();
  };

  const getNirfBadgeColor = (nirf: string) => {
    if (nirf.includes("50-60") || nirf.includes("70-80")) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
    if (nirf.includes("90-100") || nirf.includes("100-150")) return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    if (nirf.includes("150-200")) return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card className="card-hover cursor-pointer" data-testid={`college-card-${college.name.replace(/\s+/g, '-').toLowerCase()}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground mb-1" data-testid="text-college-name">
              {college.name}
            </h3>
            <p className="text-muted-foreground text-sm mb-2" data-testid="text-college-location">
              <MapPin className="w-4 h-4 inline text-primary mr-1" />
              {college.location}
            </p>
            <div className="flex items-center flex-wrap gap-2 text-sm">
              {college.nirf !== "Not listed" && college.nirf !== "Not applicable" && (
                <Badge 
                  className={getNirfBadgeColor(college.nirf)}
                  data-testid="badge-nirf-ranking"
                >
                  NIRF {college.nirf}
                </Badge>
              )}
              <span className="text-muted-foreground" data-testid="text-college-fees">
                {college.fees}
              </span>
              {college.hostel === "Available" && (
                <span className="text-emerald-600 dark:text-emerald-400" data-testid="text-hostel-available">
                  <Users className="w-4 h-4 inline mr-1" />
                  {getTranslation("hostelAvailable", currentLanguage)}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmark}
            disabled={saveMutation.isPending}
            data-testid="button-bookmark-college"
          >
            <Bookmark 
              className={`w-5 h-5 ${
                isBookmarked 
                  ? 'fill-primary text-primary' 
                  : 'text-muted-foreground hover:text-primary'
              }`} 
            />
          </Button>
        </div>

        {college.cutoff && (
          <div className="mb-4" data-testid="text-college-cutoff">
            <span className="text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 inline mr-1" />
              Cutoff: {college.cutoff}
            </span>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-2">Popular Courses:</p>
          <div className="flex flex-wrap gap-2" data-testid="list-popular-courses">
            {college.popular_courses.slice(0, 4).map((course, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
                data-testid={`badge-course-${index}`}
              >
                {course}
              </Badge>
            ))}
            {college.popular_courses.length > 4 && (
              <Badge variant="outline" className="text-xs" data-testid="badge-more-courses">
                +{college.popular_courses.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground" data-testid="list-facilities">
            {college.facilities.slice(0, 3).map((facility, index) => (
              <span key={index} data-testid={`facility-${index}`}>
                <Star className="w-3 h-3 inline text-primary mr-1" />
                {facility}
              </span>
            ))}
          </div>
          <Button 
            variant="link" 
            size="sm" 
            asChild
            data-testid="button-view-details"
          >
            <Link href={`/colleges/${encodeURIComponent(college.name)}`}>
              {getTranslation("viewDetails", currentLanguage)}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
