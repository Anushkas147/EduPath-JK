import mongoose from 'mongoose';

// Connect to MongoDB
export const connectMongoDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI environment variable not provided, running without MongoDB');
      return;
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      });
      console.log('Connected to MongoDB successfully');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.warn('Running without MongoDB connection. Authentication will not work properly.');
    // Don't throw error in development - allow server to start
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  profileImageUrl: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  timestamps: true,
});

// User Profile Schema (keeping the existing profile structure)
const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  currentClass: String,
  academicYear: String,
  district: String,
  schoolName: String,
  stream: String,
  subjects: [String],
  careerInterests: [String],
  academicScores: {
    class10Percentage: Number,
    class12Percentage: Number,
    entranceExamScores: [{
      examName: String,
      score: Number,
      maxScore: Number,
      percentile: Number,
    }],
  },
  preferences: {
    preferredLocations: [String],
    budgetRange: {
      min: Number,
      max: Number,
    },
    courseTypes: [String],
  },
}, {
  timestamps: true,
});

export const User = mongoose.model('User', userSchema);
export const UserProfile = mongoose.model('UserProfile', userProfileSchema);

export default { connectMongoDB, User, UserProfile };