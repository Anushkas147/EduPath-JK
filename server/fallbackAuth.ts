import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

// In-memory storage for development/fallback
const users: Array<{
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  isVerified: boolean;
  createdAt: Date;
}> = [];

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export class FallbackAuthService {
  private static getJWTSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return secret;
  }

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static generateToken(userId: string): string {
    const secret = this.getJWTSecret();
    const expiresIn = process.env.JWT_EXPIRE || '7d';
    return jwt.sign({ userId }, secret, { expiresIn } as any);
  }

  static verifyToken(token: string): { userId: string } {
    return jwt.verify(token, this.getJWTSecret()) as { userId: string };
  }

  static async register(userData: RegisterData) {
    try {
      // Check if user already exists
      const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: undefined,
        isVerified: false,
        createdAt: new Date(),
      };

      users.push(newUser);

      // Generate token
      const token = this.generateToken(newUser.id);

      // Return user without password
      const userResponse = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        profileImageUrl: newUser.profileImageUrl,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt,
      };

      console.log(`✅ User registered successfully (fallback): ${userData.email}`);
      return { user: userResponse, token };
    } catch (error) {
      throw error;
    }
  }

  static async login(loginData: LoginData) {
    try {
      // Find user by email
      const user = users.find(u => u.email.toLowerCase() === loginData.email.toLowerCase());
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await this.comparePassword(loginData.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = this.generateToken(user.id);

      // Return user without password
      const userResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      };

      console.log(`✅ User logged in successfully (fallback): ${loginData.email}`);
      return { user: userResponse, token };
    } catch (error) {
      throw error;
    }
  }

  static async getUserById(userId: string) {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return null;

      // Return user without password
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      };
    } catch (error) {
      throw error;
    }
  }

  static getAllUsers() {
    return users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    }));
  }
}