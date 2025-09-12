import { useState } from "react";
import { GraduationCap, University, Brain, Route, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageSwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getTranslation } from "@/lib/translations";

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const currentLanguage = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="text-primary-foreground w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-foreground">EduPath J&K</span>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                data-testid="button-theme-toggle"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-yellow-500" />
                )}
              </Button>
              <Button asChild data-testid="button-signin">
                <a href="/login">{getTranslation("signIn", currentLanguage)}</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 min-h-screen flex items-center bg-gradient-to-br from-primary to-secondary">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
                {getTranslation("heroTitle1", currentLanguage)}
                <span className="block text-yellow-300">{getTranslation("heroTitle2", currentLanguage)}</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100" data-testid="text-hero-description">
                {getTranslation("heroDescription", currentLanguage)}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-blue-50 px-8 py-4 text-lg"
                  asChild
                  data-testid="button-get-started"
                >
                  <a href="/login">{getTranslation("getStarted", currentLanguage)}</a>
                </Button>
                <Button 
                  size="lg"
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
                  asChild
                  data-testid="button-learn-more"
                >
                  <a href="#features">{getTranslation("learnMore", currentLanguage)}</a>
                </Button>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="mt-16 grid md:grid-cols-3 gap-8">
              <div className="text-center" data-testid="feature-colleges">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <University className="text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{getTranslation("collegesCount", currentLanguage)}</h3>
                <p className="text-blue-100">{getTranslation("collegesDescription", currentLanguage)}</p>
              </div>
              <div className="text-center" data-testid="feature-assessment">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{getTranslation("smartAssessment", currentLanguage)}</h3>
                <p className="text-blue-100">{getTranslation("assessmentDescription", currentLanguage)}</p>
              </div>
              <div className="text-center" data-testid="feature-pathways">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Route className="text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{getTranslation("careerPathways", currentLanguage)}</h3>
                <p className="text-blue-100">{getTranslation("pathwaysDescription", currentLanguage)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-features-title">
              {getTranslation("featuresTitle", currentLanguage)}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {getTranslation("featuresDescription", currentLanguage)}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4">
                <GraduationCap className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{getTranslation("collegeDirectory", currentLanguage)}</h3>
              <p className="text-sm text-muted-foreground">{getTranslation("collegeDirectoryDescription", currentLanguage)}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4">
                <Brain className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Career Assessment</h3>
              <p className="text-sm text-muted-foreground">Take comprehensive aptitude tests to discover your strengths and ideal career paths.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4">
                <Route className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Course Mapping</h3>
              <p className="text-sm text-muted-foreground">Explore detailed career pathways from courses to job opportunities and salary prospects.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-xl flex items-center justify-center mb-4">
                <University className="text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Personalized Recommendations</h3>
              <p className="text-sm text-muted-foreground">Get tailored suggestions for courses and colleges based on your profile and interests.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-cta-title">
            Ready to Start Your Educational Journey?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students who have found their perfect educational path through our platform.
          </p>
          <Button size="lg" asChild data-testid="button-get-started-cta">
            <a href="/signup">Get Started Today</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
