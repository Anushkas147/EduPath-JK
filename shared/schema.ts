import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User profiles for additional educational information
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  age: integer("age"),
  gender: varchar("gender"),
  currentClass: varchar("current_class"), // 10, 12, graduate
  academicScore: decimal("academic_score", { precision: 5, scale: 2 }),
  location: varchar("location"),
  interests: text("interests").array(),
  profileCompleted: boolean("profile_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quiz assessments
export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  assessmentType: varchar("assessment_type").notNull(), // aptitude, interest
  answers: jsonb("answers").notNull(), // Store question-answer pairs
  results: jsonb("results").notNull(), // Store calculated results
  recommendations: text("recommendations").array(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Saved colleges
export const savedColleges = pgTable("saved_colleges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  collegeName: varchar("college_name").notNull(),
  location: varchar("location"),
  savedAt: timestamp("saved_at").defaultNow(),
});

// Saved courses
export const savedCourses = pgTable("saved_courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: varchar("course_id").notNull(),
  courseName: varchar("course_name").notNull(),
  savedAt: timestamp("saved_at").defaultNow(),
});

// Timeline events/deadlines
export const timelineEvents = pgTable("timeline_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  eventType: varchar("event_type").notNull(), // admission, scholarship, exam
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User activity log
export const userActivity = pgTable("user_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  activityType: varchar("activity_type").notNull(), // quiz_completed, college_saved, profile_updated
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  assessments: many(assessments),
  savedColleges: many(savedColleges),
  savedCourses: many(savedCourses),
  activities: many(userActivity),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserProfileSchema = createInsertSchema(userProfiles).pick({
  age: true,
  gender: true,
  currentClass: true,
  academicScore: true,
  location: true,
  interests: true,
}).extend({
  age: z.number().min(15).max(25).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  currentClass: z.enum(['10', '12', 'graduate']).optional(),
  academicScore: z.number().min(0).max(100).optional(),
  location: z.string().min(1).optional(),
  interests: z.array(z.string()).optional(),
});

export const insertAssessmentSchema = createInsertSchema(assessments).pick({
  assessmentType: true,
  answers: true,
  results: true,
  recommendations: true,
}).extend({
  assessmentType: z.enum(['aptitude', 'interest']),
  answers: z.record(z.any()),
  results: z.record(z.any()),
  recommendations: z.array(z.string()).optional(),
});

export const insertSavedCollegeSchema = createInsertSchema(savedColleges).pick({
  collegeName: true,
  location: true,
});

export const insertSavedCourseSchema = createInsertSchema(savedCourses).pick({
  courseId: true,
  courseName: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type SavedCollege = typeof savedColleges.$inferSelect;
export type InsertSavedCollege = z.infer<typeof insertSavedCollegeSchema>;
export type SavedCourse = typeof savedCourses.$inferSelect;
export type InsertSavedCourse = z.infer<typeof insertSavedCourseSchema>;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type UserActivity = typeof userActivity.$inferSelect;
