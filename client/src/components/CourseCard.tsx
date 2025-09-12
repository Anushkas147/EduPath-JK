import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Clock, TrendingUp, Bookmark, DollarSign, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Course {
  id: string;
  name: string;
  category: string;
  duration: string;
  type: string;
  description: string;
  avg_starting_salary: string;
  job_growth: string;
  difficulty: string;
}

interface CourseCardProps {
  course: Course;
  isSaved?: boolean;
}

export default function CourseCard({ course, isSaved = false }: CourseCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(isSaved);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await apiRequest("DELETE", `/api/saved/courses/${course.id}`);
      } else {
        await apiRequest("POST", "/api/saved/courses", {
          courseId: course.id,
          courseName: course.name,
        });
      }
    },
    onSuccess: () => {
      setIsBookmarked(!isBookmarked);
      queryClient.invalidateQueries({ queryKey: ["/api/saved/courses"] });
      toast({
        title: isBookmarked ? "Course Removed" : "Course Saved",
        description: isBookmarked 
          ? `${course.name} removed from saved items`
          : `${course.name} saved to your favorites`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update saved courses",
        variant: "destructive",
      });
    },
  });

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    saveMutation.mutate();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      engineering: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      medical: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      commerce: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      arts: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      science: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
      vocational: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    };
    return colors[category as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.toLowerCase().includes("high")) return "text-red-600 dark:text-red-400";
    if (difficulty.toLowerCase().includes("moderate")) return "text-amber-600 dark:text-amber-400";
    return "text-green-600 dark:text-green-400";
  };

  const getJobGrowthProgress = (growth: string) => {
    const percentage = parseInt(growth.match(/\d+/)?.[0] || "0");
    return percentage;
  };

  return (
    <Card className="card-hover cursor-pointer h-full" data-testid={`course-card-${course.id}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                className={getCategoryColor(course.category)}
                data-testid="badge-course-category"
              >
                {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
              </Badge>
              <Badge variant="outline" data-testid="badge-course-type">
                {course.type}
              </Badge>
            </div>
            <CardTitle className="text-lg mb-2" data-testid="text-course-name">
              {course.name}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Clock className="w-4 h-4 mr-1 text-primary" />
              <span data-testid="text-course-duration">{course.duration}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmark}
            disabled={saveMutation.isPending}
            data-testid="button-bookmark-course"
          >
            <Bookmark 
              className={`w-4 h-4 ${
                isBookmarked 
                  ? 'fill-primary text-primary' 
                  : 'text-muted-foreground hover:text-primary'
              }`} 
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3" data-testid="text-course-description">
          {course.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Starting Salary</span>
            <span className="text-sm font-medium text-foreground" data-testid="text-starting-salary">
              {course.avg_starting_salary}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Job Growth</span>
              <span className="text-sm font-medium text-foreground" data-testid="text-job-growth">
                {course.job_growth}
              </span>
            </div>
            <Progress 
              value={getJobGrowthProgress(course.job_growth)} 
              className="h-2"
              data-testid="progress-job-growth"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Difficulty</span>
            <span 
              className={`text-sm font-medium ${getDifficultyColor(course.difficulty)}`}
              data-testid="text-difficulty"
            >
              {course.difficulty}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 mr-1 text-primary" />
            <span>Career Growth</span>
          </div>
          <Button 
            variant="link" 
            size="sm" 
            asChild
            className="p-0 h-auto"
            data-testid="button-view-details"
          >
            <Link href={`/courses#${course.id}`}>
              View Details
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
