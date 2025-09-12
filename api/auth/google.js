import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

// Simple in-memory storage for demo (replace with your database)
const users = new Map();

const client = new OAuth2Client();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
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

    // Only allow Gmail addresses
    if (!email || !email.endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Only Gmail addresses are allowed' });
    }

    // Check if user exists, if not create new user
    let user = users.get(email);
    
    if (!user) {
      user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        googleId,
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        profileImageUrl: profileImageUrl || '',
        isVerified: isVerified || false,
        createdAt: new Date(),
      };
      users.set(email, user);
    } else {
      // Update existing user info
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.profileImageUrl = profileImageUrl || user.profileImageUrl;
      user.isVerified = isVerified || user.isVerified;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`);

    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        isVerified: user.isVerified
      }, 
      message: 'Google login successful' 
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
}