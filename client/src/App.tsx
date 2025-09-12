import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import ErrorBoundary from "@/components/ErrorBoundary";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Home from "@/pages/Home";
import ProfileSetup from "@/pages/ProfileSetup";
import Quiz from "@/pages/Quiz";
import QuizResults from "@/pages/QuizResults";
import Colleges from "@/pages/Colleges";
import CollegeDetail from "@/pages/CollegeDetail";
import Courses from "@/pages/Courses";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && <Navigation />}
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
          </>
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/profile-setup" component={ProfileSetup} />
            <Route path="/quiz" component={Quiz} />
            <Route path="/quiz/results" component={QuizResults} />
            <Route path="/colleges" component={Colleges} />
            <Route path="/colleges/:name" component={CollegeDetail} />
            <Route path="/courses" component={Courses} />
            <Route path="/profile">
              <ErrorBoundary fallback={
                <div className="pt-20 min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Profile temporarily unavailable</h2>
                    <p className="text-muted-foreground mb-4">Please try refreshing the page</p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              }>
                <Profile />
              </ErrorBoundary>
            </Route>
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <Toaster />
            <Router />
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
