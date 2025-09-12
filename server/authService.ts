import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from './mongodb';

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

export class AuthService {
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
      const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user
      const user = new User({
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });

      await user.save();

      // Generate token
      const token = this.generateToken(user._id.toString());

      // Return user without password
      const userResponse = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      };

      return { user: userResponse, token };
    } catch (error) {
      throw error;
    }
  }

  static async login(loginData: LoginData) {
    try {
      // Find user by email
      const user = await User.findOne({ email: loginData.email.toLowerCase() });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await this.comparePassword(loginData.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = this.generateToken(user._id.toString());

      // Return user without password
      const userResponse = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      };

      return { user: userResponse, token };
    } catch (error) {
      throw error;
    }
  }

  static async getUserById(userId: string) {
    try {
      const user = await User.findById(userId).select('-password');
      return user;
    } catch (error) {
      throw error;
    }
  }
}