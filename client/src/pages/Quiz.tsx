import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Brain, Clock, BarChart3, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QuizQuestion from "@/components/QuizQuestion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";
import { getTranslation } from "@/lib/translations";
import multilingualQuizQuestions from "@/data/quiz-questions-multilingual.json";

interface QuizAnswers {
  [questionId: number]: string;
}

interface StreamScores {
  science: number;
  engineering: number;
  medical: number;
  commerce: number;
  arts: number;
  vocational: number;
}

export default function Quiz() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const currentLanguage = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [isStarted, setIsStarted] = useState(false);

  const currentQuestion = multilingualQuizQuestions[currentQuestionIndex];
  const totalQuestions = multilingualQuizQuestions.length;

  // Transform multilingual question to current language
  const localizedQuestion = currentQuestion ? {
    ...currentQuestion,
    question: currentQuestion.question[currentLanguage as keyof typeof currentQuestion.question] || currentQuestion.question.en,
    options: currentQuestion.options.map(option => ({
      ...option,
      text: option.text[currentLanguage as keyof typeof option.text] || option.text.en
    }))
  } : null;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isAnswered = answers[currentQuestion?.id] !== undefined;

  const calculateResults = (answers: QuizAnswers): StreamScores => {
    const scores: StreamScores = {
      science: 0,
      engineering: 0,
      medical: 0,
      commerce: 0,
      arts: 0,
      vocational: 0,
    };

    multilingualQuizQuestions.forEach((question) => {
      const selectedOptionId = answers[question.id];
      if (selectedOptionId) {
        const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
        if (selectedOption) {
          Object.entries(selectedOption.weights).forEach(([stream, weight]) => {
            if (stream in scores) {
              scores[stream as keyof StreamScores] += weight;
            }
          });
        }
      }
    });

    // Normalize scores to percentages
    const maxPossibleScore = totalQuestions * 3; // Max weight per question is 3
    Object.keys(scores).forEach((stream) => {
      scores[stream as keyof StreamScores] = Math.round(
        (scores[stream as keyof StreamScores] / maxPossibleScore) * 100
      );
    });

    return scores;
  };

  const getRecommendations = (scores: StreamScores): string[] => {
    const sortedStreams = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const recommendations: string[] = [];
    
    sortedStreams.forEach(([stream, score]) => {
      if (score >= 70) {
        switch (stream) {
          case 'science':
            recommendations.push('Consider pursuing B.Sc in Physics, Chemistry, or Mathematics');
            break;
          case 'engineering':
            recommendations.push('Engineering programs like Computer Science or Mechanical Engineering would suit you');
            break;
          case 'medical':
            recommendations.push('Medical field with MBBS or nursing programs aligns with your interests');
            break;
          case 'commerce':
            recommendations.push('Business and commerce streams like B.Com or BBA are recommended');
            break;
          case 'arts':
            recommendations.push('Liberal arts programs in Literature, History, or Social Sciences suit you');
            break;
          case 'vocational':
            recommendations.push('Technical and vocational training programs would be beneficial');
            break;
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Consider exploring multiple streams to find your best fit');
    }

    return recommendations;
  };

  const mutation = useMutation({
    mutationFn: async (assessmentData: any) => {
      await apiRequest("POST", "/api/assessments", assessmentData);
    },
    onSuccess: () => {
      setLocation("/quiz/results");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save assessment results",
        variant: "destructive",
      });
    },
  });

  const handleAnswerSelect = (optionId: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionId,
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Calculate results and submit
      const results = calculateResults(answers);
      const recommendations = getRecommendations(results);

      const assessmentData = {
        assessmentType: 'aptitude' as const,
        answers,
        results,
        recommendations,
      };

      // Store results in sessionStorage for the results page
      sessionStorage.setItem('quizResults', JSON.stringify({
        scores: results,
        recommendations,
        answers,
      }));

      mutation.mutate(assessmentData);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const startQuiz = () => {
    setIsStarted(true);
  };

  if (!isStarted) {
    return (
      <div className="pt-20 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Quiz Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-quiz-title">
                {getTranslation("assessment", currentLanguage)} & Interest Assessment
              </h1>
              <p className="text-muted-foreground mb-6" data-testid="text-quiz-description">
                Discover your ideal stream and career path through our comprehensive assessment
              </p>
              <Card className="inline-block">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span data-testid="info-duration">
                      <Clock className="w-4 h-4 inline text-primary mr-1" />
                      15-20 minutes
                    </span>
                    <span data-testid="info-questions">
                      <Brain className="w-4 h-4 inline text-primary mr-1" />
                      {totalQuestions} questions
                    </span>
                    <span data-testid="info-results">
                      <BarChart3 className="w-4 h-4 inline text-primary mr-1" />
                      Instant results
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Start Quiz Card */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-center" data-testid="text-ready-title">
                  {getTranslation("readyToStart", currentLanguage)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground" data-testid="text-quiz-instructions">
                    {getTranslation("quizInstructions", currentLanguage)}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2">{getTranslation("assessmentCoverage", currentLanguage)}</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Interest analysis</li>
                        <li>• Aptitude evaluation</li>
                        <li>• Career preferences</li>
                        <li>• Learning style assessment</li>
                      </ul>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2">{getTranslation("streamCoverage", currentLanguage)}</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Science & Engineering</li>
                        <li>• Medical & Healthcare</li>
                        <li>• Commerce & Business</li>
                        <li>• Arts & Humanities</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={startQuiz}
                  data-testid="button-start-quiz"
                >
                  {getTranslation("startAssessment", currentLanguage)}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              {localizedQuestion && (
                <QuizQuestion
                  question={localizedQuestion}
                  selectedAnswer={answers[currentQuestion.id] || null}
                  onAnswerSelect={handleAnswerSelect}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={totalQuestions}
                />
              )}

              <div className="flex items-center justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  data-testid="button-previous"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {getTranslation("previous", currentLanguage)}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!isAnswered || mutation.isPending}
                  data-testid="button-next"
                >
                  {mutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {getTranslation("submitting", currentLanguage)}
                    </>
                  ) : isLastQuestion ? (
                    <>
                      {getTranslation("completeAssessment", currentLanguage)}
                      <BarChart3 className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      {getTranslation("next", currentLanguage)}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
