import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Trophy, TrendingUp, ArrowRight, BookOpen, University } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface StreamScores {
  science: number;
  engineering: number;
  medical: number;
  commerce: number;
  arts: number;
  vocational: number;
}

interface QuizResults {
  scores: StreamScores;
  recommendations: string[];
  answers: Record<number, string>;
}

const streamLabels = {
  science: 'Science Stream',
  engineering: 'Engineering',
  medical: 'Medical',
  commerce: 'Commerce',
  arts: 'Arts',
  vocational: 'Vocational',
};

const streamColors = {
  science: 'bg-blue-500',
  engineering: 'bg-green-500',
  medical: 'bg-red-500',
  commerce: 'bg-yellow-500',
  arts: 'bg-purple-500',
  vocational: 'bg-orange-500',
};

export default function QuizResults() {
  const [results, setResults] = useState<QuizResults | null>(null);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('quizResults');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
  }, []);

  if (!results) {
    return (
      <div className="pt-20 min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4" data-testid="text-no-results">
              No Results Found
            </h2>
            <p className="text-muted-foreground mb-4">
              It looks like you haven't completed an assessment yet.
            </p>
            <Button asChild data-testid="button-take-quiz">
              <Link href="/quiz">Take Assessment</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedStreams = Object.entries(results.scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const topStream = sortedStreams[0];

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="text-emerald-600 dark:text-emerald-400 text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-assessment-complete">
              Assessment Complete!
            </h1>
            <p className="text-muted-foreground mb-8" data-testid="text-results-description">
              Based on your responses, here are your recommended streams and career paths:
            </p>
          </div>

          {/* Top Recommendations */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {sortedStreams.map(([stream, score], index) => (
              <Card 
                key={stream}
                className={`${index === 0 ? 'border-primary bg-primary/5 dark:bg-primary/10' : ''}`}
                data-testid={`result-card-${stream}`}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    {index === 0 && (
                      <Badge className="mb-2" data-testid="badge-top-match">
                        Top Match
                      </Badge>
                    )}
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {streamLabels[stream as keyof typeof streamLabels]}
                    </h3>
                    <div className="text-3xl font-bold text-primary mb-2" data-testid={`score-${stream}`}>
                      {score}%
                    </div>
                    <Progress value={score} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {score >= 80 && "Excellent match for your interests"}
                      {score >= 60 && score < 80 && "Good match for your profile"} 
                      {score < 60 && "Moderate alignment with interests"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Recommendations */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-recommendations-title">
                <TrendingUp className="w-5 h-5" />
                Personalized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.recommendations.map((recommendation, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-muted rounded-lg"
                    data-testid={`recommendation-${index}`}
                  >
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold mt-1">
                      {index + 1}
                    </div>
                    <p className="text-foreground">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All Stream Scores */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle data-testid="text-detailed-scores-title">Detailed Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(results.scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([stream, score]) => (
                    <div key={stream} className="flex items-center space-x-4" data-testid={`detailed-score-${stream}`}>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground">
                            {streamLabels[stream as keyof typeof streamLabels]}
                          </span>
                          <span className="text-sm font-medium text-foreground">{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-explore-courses">
              <Link href="/courses">
                <BookOpen className="w-4 h-4 mr-2" />
                Explore Recommended Courses
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-find-colleges">
              <Link href="/colleges">
                <University className="w-4 h-4 mr-2" />
                Find Matching Colleges
              </Link>
            </Button>
          </div>

          {/* Additional Actions */}
          <div className="text-center mt-8 space-y-4">
            <p className="text-muted-foreground">
              Want to save these results or explore more options?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" asChild data-testid="button-retake-quiz">
                <Link href="/quiz">Retake Assessment</Link>
              </Button>
              <Button variant="outline" asChild data-testid="button-view-profile">
                <Link href="/profile">View My Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
