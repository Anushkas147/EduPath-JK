import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authMiddleware, optionalAuth, type AuthRequest } from "./authMiddleware";
import { authMiddlewareFallback, optionalAuthFallback } from "./authMiddlewareFallback";
import { AuthService } from "./authService";
import { FallbackAuthService } from "./fallbackAuth";
import { User, UserProfile } from "./mongodb";
import mongoose from "mongoose";
import {
  insertUserProfileSchema,
  insertAssessmentSchema,
  insertSavedCollegeSchema,
  insertSavedCourseSchema,
} from "@shared/schema";
import { z } from "zod";
import { translateText, translateQuizQuestion } from "./translationService";

// Validation schemas for auth
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Check if MongoDB is connected
  const isMongoConnected = mongoose.connection.readyState === 1;
  const authService = isMongoConnected ? AuthService : FallbackAuthService;
  const authMiddlewareToUse = isMongoConnected ? authMiddleware : authMiddlewareFallback;
  
  console.log(`🔧 Using ${isMongoConnected ? 'MongoDB' : 'Fallback'} authentication system`);
  console.log(`🔑 Google Client ID available: ${!!process.env.GOOGLE_CLIENT_ID}`);
  console.log(`🔑 Vite Google Client ID available: ${!!process.env.VITE_GOOGLE_CLIENT_ID}`);

  // Google OAuth route
  app.post('/api/auth/google', async (req, res) => {
    try {
      const { OAuth2Client } = await import('google-auth-library');
      const client = new OAuth2Client();
      
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ message: 'ID token is required' });
      }

      // Verify the Google ID token
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        return res.status(401).json({ message: 'Invalid Google token' });
      }

      // Extract user info from Google
      const {
        sub: googleId,
        email,
        given_name: firstName,
        family_name: lastName,
        picture: profileImageUrl,
        email_verified: isVerified
      } = payload;

      if (!email) {
        return res.status(400).json({ message: 'Email not provided by Google' });
      }

      if (isMongoConnected) {
        // MongoDB flow
        let user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
          // Create new user
          user = new User({
            email: email.toLowerCase(),
            googleId,
            firstName: firstName || '',
            lastName: lastName || '',
            profileImageUrl: profileImageUrl || '',
            isVerified: isVerified || false,
            password: '', // Google users don't need password
          });
          await user.save();
        } else {
          // Update existing user with Google info
          user.googleId = googleId;
          user.firstName = firstName || user.firstName;
          user.lastName = lastName || user.lastName;
          user.profileImageUrl = profileImageUrl || user.profileImageUrl;
          user.isVerified = isVerified || user.isVerified;
          await user.save();
        }

        // Generate token
        const token = authService.generateToken(user._id.toString());
        
        // Set HTTP-only cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({ 
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
            isVerified: user.isVerified
          }, 
          message: 'Google login successful' 
        });
      } else {
        // Fallback mode
        try {
          // Try to login first (if user exists)
          const result = await FallbackAuthService.login({ email, password: 'google_auth' });
          
          // Set HTTP-only cookie
          res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });

          res.json({ user: result.user, message: 'Google login successful' });
        } catch {
          // User doesn't exist, create new one
          const result = await FallbackAuthService.register({
            email,
            password: 'google_auth',
            firstName: firstName || '',
            lastName: lastName || ''
          });
          
          // Set HTTP-only cookie
          res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });

          res.json({ user: result.user, message: 'Google registration successful' });
        }
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      res.status(401).json({ message: 'Google authentication failed' });
    }
  });

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const { user, token } = await authService.register(userData);
      
      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      res.status(201).json({ user, message: 'Registration successful' });
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.errors });
      } else {
        res.status(400).json({ message: error.message || 'Registration failed' });
      }
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const { user, token } = await authService.login(loginData);
      
      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      res.json({ user, message: 'Login successful' });
    } catch (error: any) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.errors });
      } else {
        res.status(401).json({ message: error.message || 'Login failed' });
      }
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    res.json({ message: 'Logout successful' });
  });

  // Also support GET for backward compatibility
  app.get('/api/logout', (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    res.redirect('/');
  });

  app.get('/api/auth/user', authMiddlewareToUse, async (req: AuthRequest, res) => {
    try {
      if (isMongoConnected) {
        const userId = req.user._id.toString();
        // Find or create user profile in MongoDB
        let profile = await UserProfile.findOne({ userId });
        
        res.json({
          id: req.user._id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          profileImageUrl: req.user.profileImageUrl,
          isVerified: req.user.isVerified,
          profile,
        });
      } else {
        // Fallback mode - return user info without MongoDB profile
        res.json({
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          profileImageUrl: req.user.profileImageUrl,
          isVerified: req.user.isVerified,
          profile: null, // No profile in fallback mode
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes  
  app.post('/api/profile', authMiddlewareToUse, async (req: AuthRequest, res) => {
    try {
      const userId = isMongoConnected ? req.user!._id.toString() : req.user!.id;
      const profileData = insertUserProfileSchema.parse(req.body);
      
      const existingProfile = await storage.getUserProfile(userId);
      
      let profile;
      if (existingProfile) {
        profile = await storage.updateUserProfile(userId, profileData);
      } else {
        profile = await storage.createUserProfile(userId, profileData);
      }
      
      await storage.createUserActivity(userId, 'profile_updated', 'Updated profile information');
      
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update profile" });
      }
    }
  });

  app.get('/api/profile', authMiddlewareToUse, async (req: AuthRequest, res) => {
    try {
      const userId = isMongoConnected ? req.user!._id.toString() : req.user!.id;
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        res.status(404).json({ message: "Profile not found" });
        return;
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Assessment routes
  app.post('/api/assessments', authMiddlewareToUse, async (req: AuthRequest, res) => {
    try {
      const userId = isMongoConnected ? req.user!._id.toString() : req.user!.id;
      const assessmentData = insertAssessmentSchema.parse(req.body);
      
      const assessment = await storage.createAssessment(userId, assessmentData);
      res.json(assessment);
    } catch (error) {
      console.error("Error creating assessment:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid assessment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create assessment" });
      }
    }
  });

  app.get('/api/assessments', authMiddlewareToUse, async (req: AuthRequest, res) => {
    try {
      const userId = isMongoConnected ? req.user!._id.toString() : req.user!.id;
      const assessments = await storage.getUserAssessments(userId);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  app.get('/api/assessments/latest/:type', authMiddlewareToUse, async (req: AuthRequest, res) => {
    try {
      const userId = isMongoConnected ? req.user!._id.toString() : req.user!.id;
      const { type } = req.params;
      
      const assessment = await storage.getLatestAssessment(userId, type);
      if (!assessment) {
        res.status(404).json({ message: "Assessment not found" });
        return;
      }
      
      res.json(assessment);
    } catch (error) {
      console.error("Error fetching latest assessment:", error);
      res.status(500).json({ message: "Failed to fetch assessment" });
    }
  });

  // Saved colleges routes
  app.post('/api/saved/colleges', authMiddlewareToUse, async (req: AuthRequest, res) => {
    try {
      const userId = isMongoConnected ? req.user!._id.toString() : req.user!.id;
      const collegeData = insertSavedCollegeSchema.parse(req.body);
      
      const savedCollege = await storage.saveCollege(userId, collegeData);
      res.json(savedCollege);
    } catch (error) {
      console.error("Error saving college:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid college data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save college" });
      }
    }
  });

  app.get('/api/saved/colleges', authMiddlewareToUse, async (req: AuthRequest, res) => {
    try {
      const userId = isMongoConnected ? req.user!._id.toString() : req.user!.id;
      const savedColleges = await storage.getSavedColleges(userId);
      res.json(savedColleges);
    } catch (error) {
      console.error("Error fetching saved colleges:", error);
      res.status(500).json({ message: "Failed to fetch saved colleges" });
    }
  });

  app.delete('/api/saved/colleges/:name', authMiddlewareToUse, async (req: AuthRequest, res) => {
    try {
      const userId = isMongoConnected ? req.user!._id.toString() : req.user!.id;
      const { name } = req.params;
      
      const removed = await storage.removeSavedCollege(userId, decodeURIComponent(name));
      if (removed) {
        res.json({ message: "College removed from saved items" });
      } else {
        res.status(404).json({ message: "Saved college not found" });
      }
    } catch (error) {
      console.error("Error removing saved college:", error);
      res.status(500).json({ message: "Failed to remove saved college" });
    }
  });

  // Saved courses routes
  app.post('/api/saved/courses', authMiddlewareToUse, async (req: AuthRequest, res) => {
    try {
      const userId = isMongoConnected ? req.user!._id.toString() : req.user!.id;
      const courseData = insertSavedCourseSchema.parse(req.body);
      
      const savedCourse = await storage.saveCourse(userId, courseData);
      res.json(savedCourse);
    } catch (error) {
      console.error("Error saving course:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid course data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save course" });
      }
    }
  });

  app.get('/api/saved/courses', authMiddlewareToUse, async (req: AuthRequest, res) => {
    try {
      const userId = isMongoConnected ? req.user!._id.toString() : req.user!.id;
      const savedCourses = await storage.getSavedCourses(userId);
      res.json(savedCourses);
    } catch (error) {
      console.error("Error fetching saved courses:", error);
      res.status(500).json({ message: "Failed to fetch saved courses" });
    }
  });

  app.delete('/api/saved/courses/:id', authMiddlewareToUse, async (req: AuthRequest, res) => {
    try {
      const userId = isMongoConnected ? req.user!._id.toString() : req.user!.id;
      const { id } = req.params;
      
      const removed = await storage.removeSavedCourse(userId, id);
      if (removed) {
        res.json({ message: "Course removed from saved items" });
      } else {
        res.status(404).json({ message: "Saved course not found" });
      }
    } catch (error) {
      console.error("Error removing saved course:", error);
      res.status(500).json({ message: "Failed to remove saved course" });
    }
  });

  // Timeline routes
  app.get('/api/timeline', async (req, res) => {
    try {
      const events = await storage.getTimelineEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching timeline events:", error);
      res.status(500).json({ message: "Failed to fetch timeline events" });
    }
  });

  // User activity routes
  app.get('/api/activity', authMiddlewareToUse, async (req: AuthRequest, res) => {
    try {
      const userId = isMongoConnected ? req.user!._id.toString() : req.user!.id;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const activities = await storage.getUserActivity(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });

  // Translation API endpoints
  app.post('/api/translate', async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      
      if (!text || !targetLanguage) {
        return res.status(400).json({ message: "Text and target language are required" });
      }
      
      const translatedText = await translateText(text, targetLanguage);
      res.json({ translatedText });
    } catch (error: any) {
      console.error("Translation error:", error);
      res.status(500).json({ message: "Translation failed" });
    }
  });

  app.post('/api/translate/quiz-question', async (req, res) => {
    try {
      const { question, targetLanguage } = req.body;
      
      if (!question || !targetLanguage) {
        return res.status(400).json({ message: "Question and target language are required" });
      }
      
      const translatedQuestion = await translateQuizQuestion(question, targetLanguage);
      res.json(translatedQuestion);
    } catch (error: any) {
      console.error("Quiz translation error:", error);
      res.status(500).json({ message: "Quiz translation failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
