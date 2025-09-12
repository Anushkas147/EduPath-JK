import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Star,
  Award,
  Users,
  Briefcase,
  Building,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseCard from "@/components/CourseCard";
import coursesData from "@/data/courses.json";
import { useLanguage } from "@/components/LanguageSwitcher";
import { getTranslation, getCategoryTranslation } from "@/lib/translations";

const categoryIcons = {
  engineering: "🔧",
  medical: "🏥",
  commerce: "💼",
  arts: "🎨",
  science: "🔬",
  vocational: "⚙️",
};

export default function Courses() {
  const currentLanguage = useLanguage();
  const [location] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [sortBy, setSortBy] = useState("popularity");

  const { data: savedCourses } = useQuery({
    queryKey: ["/api/saved/courses"],
    retry: false,
  });

  const safeSavedCourses = Array.isArray(savedCourses) ? savedCourses : [];
  const savedCourseIds = safeSavedCourses.map((saved: any) => saved.courseId);

  // Handle direct course selection from URL hash
  useEffect(() => {
    console.log('Window location hash:', window.location.hash);
    const hash = window.location.hash.slice(1); // Remove the # symbol
    console.log('Hash extracted:', hash);
    if (hash) {
      const course = coursesData.find(c => c.id === hash);
      console.log('Course found:', course);
      if (course) {
        setSelectedCourse(course);
      }
    } else {
      // Clear selected course when no hash
      setSelectedCourse(null);
    }
  }, [location]);

  // Also listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      console.log('Hash changed:', window.location.hash);
      const hash = window.location.hash.slice(1);
      if (hash) {
        const course = coursesData.find(c => c.id === hash);
        console.log('Course found on hash change:', course);
        if (course) {
          setSelectedCourse(course);
        }
      } else {
        setSelectedCourse(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const filteredCourses = coursesData.filter(course => {
    if (selectedCategory === "all") return true;
    return course.category === selectedCategory;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "salary":
        const salaryA = parseInt(a.avg_starting_salary.match(/\d+/)?.[0] || "0");
        const salaryB = parseInt(b.avg_starting_salary.match(/\d+/)?.[0] || "0");
        return salaryB - salaryA;
      case "growth":
        const growthA = parseInt(a.job_growth.match(/\d+/)?.[0] || "0");
        const growthB = parseInt(b.job_growth.match(/\d+/)?.[0] || "0");
        return growthB - growthA;
      case "duration":
        const durationA = parseInt(a.duration.match(/\d+/)?.[0] || "0");
        const durationB = parseInt(b.duration.match(/\d+/)?.[0] || "0");
        return durationA - durationB;
      default:
        return 0;
    }
  });

  const categories = [
    { id: "all", name: getCategoryTranslation("all", currentLanguage), count: coursesData.length },
    ...Object.keys(categoryIcons).map(cat => ({
      id: cat,
      name: getCategoryTranslation(cat, currentLanguage),
      count: coursesData.filter(c => c.category === cat).length
    }))
  ];

  if (selectedCourse) {
    return <CourseDetailView course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-courses-title">
            {getTranslation("courseExplorer", currentLanguage)}
          </h1>
          <p className="text-muted-foreground" data-testid="text-courses-description">
            {getTranslation("discoverCoursesDesc", currentLanguage)}
          </p>
        </div>

        {/* Course Categories */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {categories.slice(1).map(({ id, name, count }) => (
            <Card 
              key={id}
              className={`card-hover cursor-pointer transition-all ${
                selectedCategory === id ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10' : ''
              }`}
              onClick={() => setSelectedCategory(selectedCategory === id ? "all" : id)}
              data-testid={`category-card-${id}`}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{categoryIcons[id as keyof typeof categoryIcons]}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2" data-testid={`text-category-${id}`}>
                  {name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{count} courses</p>
                <div className="text-xs text-muted-foreground">
                  {id === "engineering" && "Technical problem solving"}
                  {id === "medical" && "Healthcare and life sciences"}
                  {id === "commerce" && "Business and finance"}
                  {id === "arts" && "Literature and humanities"}
                  {id === "science" && "Research and analysis"}
                  {id === "vocational" && "Practical skills"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Sort */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Filter by:</span>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48" data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(({ id, name, count }) => (
                      <SelectItem key={id} value={id}>
                        {name} ({count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="salary">Starting Salary</SelectItem>
                    <SelectItem value="growth">Job Growth</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Results */}
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-muted-foreground" data-testid="text-results-count">
                Showing {sortedCourses.length} courses
                {selectedCategory !== "all" && ` in ${selectedCategory}`}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {sortedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isSaved={savedCourseIds.includes(course.id)}
                />
              ))}
            </div>

            {sortedCourses.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-courses">
                    No courses found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try selecting a different category to see available courses.
                  </p>
                  <Button onClick={() => setSelectedCategory("all")} data-testid="button-show-all">
                    Show All Courses
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Statistics */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-stats-title">Course Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1" data-testid="text-total-courses">
                    {coursesData.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Courses Available</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Undergraduate</span>
                    <span className="font-medium" data-testid="count-undergraduate">
                      {coursesData.filter(c => c.type === "undergraduate").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Professional</span>
                    <span className="font-medium" data-testid="count-professional">
                      {coursesData.filter(c => c.type === "professional" || c.name.includes("MBBS")).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diploma</span>
                    <span className="font-medium" data-testid="count-diploma">
                      {coursesData.filter(c => c.type === "diploma").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Categories */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-popular-categories-title">Popular Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.slice(1, 4).map(({ id, name, count }) => (
                  <div 
                    key={id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => setSelectedCategory(id)}
                    data-testid={`popular-category-${id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{categoryIcons[id as keyof typeof categoryIcons]}</span>
                      <span className="font-medium text-foreground">{name}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Career Insights */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-insights-title">Career Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">💡 Did you know?</h4>
                  <p className="text-sm text-muted-foreground">
                    Engineering and Technology fields are expected to see 22% job growth in the next decade.
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">🚀 Trending</h4>
                  <p className="text-sm text-muted-foreground">
                    Healthcare and Medical sciences offer some of the highest starting salaries.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Course Detail View Component
function CourseDetailView({ course, onBack }: { course: any; onBack: () => void }) {
  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Button variant="outline" onClick={onBack} className="mb-6" data-testid="button-back-to-courses">
            ← Back to Courses
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="mb-8">
                <CardHeader>
                  <div className="mb-4">
                    <Badge className="mb-2" data-testid="badge-course-category-detail">
                      {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                    </Badge>
                    <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-course-name-detail">
                      {course.name}
                    </h1>
                    <p className="text-muted-foreground" data-testid="text-course-description-detail">
                      {course.description}
                    </p>
                  </div>
                </CardHeader>
              </Card>

              {/* Career Pathway */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" data-testid="text-career-pathway-title">
                    <TrendingUp className="w-5 h-5" />
                    Career Pathway
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {course.career_path.map((level: any, index: number) => (
                    <div key={level.level} className="bg-muted rounded-lg p-6" data-testid={`career-level-${level.level}`}>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-primary' : index === 1 ? 'bg-emerald-600' : 'bg-amber-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{level.title}</h4>
                          <p className="text-sm text-muted-foreground">{level.salary_range}</p>
                        </div>
                      </div>
                      <div className="ml-11 space-y-2">
                        {level.positions.map((position: string, idx: number) => (
                          <div key={idx} className="flex items-center space-x-2" data-testid={`position-${level.level}-${idx}`}>
                            <Briefcase className={`w-4 h-4 ${
                              index === 0 ? 'text-primary' : index === 1 ? 'text-emerald-600' : 'text-amber-600'
                            }`} />
                            <span className="text-sm text-foreground">{position}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Skills and Exams */}
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-skills-exams-title">Required Skills & Important Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">Technical Skills</h4>
                      <div className="space-y-3">
                        {course.skills_required.map((skill: any, index: number) => (
                          <div key={index} className="space-y-1" data-testid={`skill-${index}`}>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-foreground">{skill.skill}</span>
                              <span className="text-muted-foreground">{skill.importance}%</span>
                            </div>
                            <Progress value={skill.importance} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">Important Exams</h4>
                      <div className="space-y-2">
                        {course.important_exams.map((exam: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2" data-testid={`exam-${index}`}>
                            <Award className="w-4 h-4 text-primary" />
                            <span className="text-sm text-foreground">{exam}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-quick-stats-title">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Duration</span>
                      <span className="text-sm font-medium" data-testid="text-duration-stat">{course.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Starting Salary</span>
                      <span className="text-sm font-medium" data-testid="text-salary-stat">{course.avg_starting_salary}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Job Growth</span>
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400" data-testid="text-growth-stat">
                        {course.job_growth}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Difficulty</span>
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400" data-testid="text-difficulty-stat">
                        {course.difficulty}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Employers */}
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-top-employers-title">Top Employers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {course.top_employers.map((employer: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3" data-testid={`employer-${index}`}>
                      <div className="w-8 h-8 bg-muted rounded border flex items-center justify-center">
                        <span className="text-xs font-bold">{employer.logo}</span>
                      </div>
                      <span className="text-sm text-foreground">{employer.name}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
