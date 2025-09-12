import {
  users,
  userProfiles,
  assessments,
  savedColleges,
  savedCourses,
  timelineEvents,
  userActivity,
  type User,
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
  type Assessment,
  type InsertAssessment,
  type SavedCollege,
  type InsertSavedCollege,
  type SavedCourse,
  type InsertSavedCourse,
  type TimelineEvent,
  type UserActivity,
} from "@shared/schema";
import { db, testDatabaseConnection } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(userId: string, profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Assessment operations
  createAssessment(userId: string, assessment: InsertAssessment): Promise<Assessment>;
  getUserAssessments(userId: string): Promise<Assessment[]>;
  getLatestAssessment(userId: string, type: string): Promise<Assessment | undefined>;
  
  // Saved items operations
  saveCollege(userId: string, college: InsertSavedCollege): Promise<SavedCollege>;
  getSavedColleges(userId: string): Promise<SavedCollege[]>;
  removeSavedCollege(userId: string, collegeName: string): Promise<boolean>;
  
  saveCourse(userId: string, course: InsertSavedCourse): Promise<SavedCourse>;
  getSavedCourses(userId: string): Promise<SavedCourse[]>;
  removeSavedCourse(userId: string, courseId: string): Promise<boolean>;
  
  // Timeline and activity operations
  getTimelineEvents(): Promise<TimelineEvent[]>;
  createUserActivity(userId: string, activityType: string, description: string, metadata?: any): Promise<UserActivity>;
  getUserActivity(userId: string, limit?: number): Promise<UserActivity[]>;
}

export class MemoryStorage implements IStorage {
  private users = new Map<string, any>();
  private profiles = new Map<string, any>();
  private assessments = new Map<string, any[]>();
  private savedColleges = new Map<string, any[]>();
  private savedCourses = new Map<string, any[]>();
  private timelineEvents: any[] = [];
  private userActivities = new Map<string, any[]>();

  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user = {
      id: userData.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user as User;
  }

  // User profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    return this.profiles.get(userId);
  }

  async createUserProfile(userId: string, profile: InsertUserProfile): Promise<UserProfile> {
    const newProfile = {
      id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...profile,
      profileCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.profiles.set(userId, newProfile);
    return newProfile as UserProfile;
  }

  async updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    const existingProfile = this.profiles.get(userId);
    const updatedProfile = {
      ...existingProfile,
      ...profile,
      updatedAt: new Date(),
    };
    this.profiles.set(userId, updatedProfile);
    return updatedProfile as UserProfile;
  }

  // Assessment operations
  async createAssessment(userId: string, assessment: InsertAssessment): Promise<Assessment> {
    const newAssessment = {
      id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...assessment,
      completedAt: new Date(),
    };

    if (!this.assessments.has(userId)) {
      this.assessments.set(userId, []);
    }
    this.assessments.get(userId)!.push(newAssessment);

    // Create activity log
    await this.createUserActivity(
      userId,
      'quiz_completed',
      `Completed ${assessment.assessmentType} assessment`,
      { assessmentId: newAssessment.id }
    );

    return newAssessment as Assessment;
  }

  async getUserAssessments(userId: string): Promise<Assessment[]> {
    return this.assessments.get(userId) || [];
  }

  async getLatestAssessment(userId: string, type: string): Promise<Assessment | undefined> {
    const userAssessments = this.assessments.get(userId) || [];
    return userAssessments
      .filter(a => a.assessmentType === type)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
  }

  // Saved items operations
  async saveCollege(userId: string, college: InsertSavedCollege): Promise<SavedCollege> {
    const savedCollege = {
      id: `saved_college_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...college,
      savedAt: new Date(),
    };

    if (!this.savedColleges.has(userId)) {
      this.savedColleges.set(userId, []);
    }
    this.savedColleges.get(userId)!.push(savedCollege);

    await this.createUserActivity(
      userId,
      'college_saved',
      `Saved ${college.collegeName} to favorites`
    );

    return savedCollege as SavedCollege;
  }

  async getSavedColleges(userId: string): Promise<SavedCollege[]> {
    return this.savedColleges.get(userId) || [];
  }

  async removeSavedCollege(userId: string, collegeName: string): Promise<boolean> {
    const colleges = this.savedColleges.get(userId) || [];
    const initialLength = colleges.length;
    const filtered = colleges.filter(c => c.collegeName !== collegeName);
    this.savedColleges.set(userId, filtered);
    return filtered.length < initialLength;
  }

  async saveCourse(userId: string, course: InsertSavedCourse): Promise<SavedCourse> {
    const savedCourse = {
      id: `saved_course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...course,
      savedAt: new Date(),
    };

    if (!this.savedCourses.has(userId)) {
      this.savedCourses.set(userId, []);
    }
    this.savedCourses.get(userId)!.push(savedCourse);

    await this.createUserActivity(
      userId,
      'course_saved',
      `Saved ${course.courseName} to favorites`
    );

    return savedCourse as SavedCourse;
  }

  async getSavedCourses(userId: string): Promise<SavedCourse[]> {
    return this.savedCourses.get(userId) || [];
  }

  async removeSavedCourse(userId: string, courseId: string): Promise<boolean> {
    const courses = this.savedCourses.get(userId) || [];
    const initialLength = courses.length;
    const filtered = courses.filter(c => c.courseId !== courseId);
    this.savedCourses.set(userId, filtered);
    return filtered.length < initialLength;
  }

  // Timeline and activity operations
  async getTimelineEvents(): Promise<TimelineEvent[]> {
    return this.timelineEvents.filter(e => e.isActive);
  }

  async createUserActivity(userId: string, activityType: string, description: string, metadata?: any): Promise<UserActivity> {
    const activity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      activityType,
      description,
      metadata: metadata || {},
      createdAt: new Date(),
    };

    if (!this.userActivities.has(userId)) {
      this.userActivities.set(userId, []);
    }
    this.userActivities.get(userId)!.push(activity);
    return activity as UserActivity;
  }

  async getUserActivity(userId: string, limit = 10): Promise<UserActivity[]> {
    const activities = this.userActivities.get(userId) || [];
    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export class DatabaseStorage implements IStorage {
  private fallbackStorage = new MemoryStorage();

  private async withFallback<T>(dbOperation: () => Promise<T>): Promise<T> {
    try {
      if (!db || !(await testDatabaseConnection())) {
        throw new Error('Database not healthy');
      }
      return await dbOperation();
    } catch (error) {
      console.error('Database operation failed, using fallback storage:', error);
      // Return fallback result (this requires implementing fallback mapping)
      throw error;
    }
  }

  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    try {
      return await this.withFallback(async () => {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      });
    } catch (error) {
      return this.fallbackStorage.getUser(id);
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(userId: string, profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values({
        userId,
        ...profile,
        profileCompleted: true,
      })
      .returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({
        ...profile,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Assessment operations
  async createAssessment(userId: string, assessment: InsertAssessment): Promise<Assessment> {
    const [newAssessment] = await db
      .insert(assessments)
      .values({
        userId,
        ...assessment,
      })
      .returning();

    // Create activity log
    await this.createUserActivity(
      userId,
      'quiz_completed',
      `Completed ${assessment.assessmentType} assessment`,
      { assessmentId: newAssessment.id }
    );

    return newAssessment;
  }

  async getUserAssessments(userId: string): Promise<Assessment[]> {
    return db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, userId))
      .orderBy(desc(assessments.completedAt));
  }

  async getLatestAssessment(userId: string, type: string): Promise<Assessment | undefined> {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(and(eq(assessments.userId, userId), eq(assessments.assessmentType, type)))
      .orderBy(desc(assessments.completedAt))
      .limit(1);
    return assessment;
  }

  // Saved items operations
  async saveCollege(userId: string, college: InsertSavedCollege): Promise<SavedCollege> {
    const [savedCollege] = await db
      .insert(savedColleges)
      .values({
        userId,
        ...college,
      })
      .returning();

    await this.createUserActivity(
      userId,
      'college_saved',
      `Saved ${college.collegeName} to favorites`
    );

    return savedCollege;
  }

  async getSavedColleges(userId: string): Promise<SavedCollege[]> {
    return db
      .select()
      .from(savedColleges)
      .where(eq(savedColleges.userId, userId))
      .orderBy(desc(savedColleges.savedAt));
  }

  async removeSavedCollege(userId: string, collegeName: string): Promise<boolean> {
    const result = await db
      .delete(savedColleges)
      .where(and(eq(savedColleges.userId, userId), eq(savedColleges.collegeName, collegeName)));
    
    return result.rowCount > 0;
  }

  async saveCourse(userId: string, course: InsertSavedCourse): Promise<SavedCourse> {
    const [savedCourse] = await db
      .insert(savedCourses)
      .values({
        userId,
        ...course,
      })
      .returning();

    await this.createUserActivity(
      userId,
      'course_saved',
      `Saved ${course.courseName} to favorites`
    );

    return savedCourse;
  }

  async getSavedCourses(userId: string): Promise<SavedCourse[]> {
    return db
      .select()
      .from(savedCourses)
      .where(eq(savedCourses.userId, userId))
      .orderBy(desc(savedCourses.savedAt));
  }

  async removeSavedCourse(userId: string, courseId: string): Promise<boolean> {
    const result = await db
      .delete(savedCourses)
      .where(and(eq(savedCourses.userId, userId), eq(savedCourses.courseId, courseId)));
    
    return result.rowCount > 0;
  }

  // Timeline and activity operations
  async getTimelineEvents(): Promise<TimelineEvent[]> {
    return db
      .select()
      .from(timelineEvents)
      .where(eq(timelineEvents.isActive, true))
      .orderBy(timelineEvents.eventDate);
  }

  async createUserActivity(userId: string, activityType: string, description: string, metadata?: any): Promise<UserActivity> {
    const [activity] = await db
      .insert(userActivity)
      .values({
        userId,
        activityType,
        description,
        metadata: metadata || {},
      })
      .returning();
    return activity;
  }

  async getUserActivity(userId: string, limit = 10): Promise<UserActivity[]> {
    return db
      .select()
      .from(userActivity)
      .where(eq(userActivity.userId, userId))
      .orderBy(desc(userActivity.createdAt))
      .limit(limit);
  }
}

// Use memory storage in development to avoid SSL certificate issues
// Use database storage only in production
export const storage = (process.env.NODE_ENV === 'production' && db) 
  ? new DatabaseStorage() 
  : new MemoryStorage();

if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Using in-memory storage for development (avoiding SSL certificate issues)');
} else if (db) {
  console.log('🔧 Using PostgreSQL database storage');
} else {
  console.log('🔧 Using in-memory storage (no database available)');
}
