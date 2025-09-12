import jwt from 'jsonwebtoken';

// Simple in-memory storage for demo (replace with your database)
const users = new Map();

function verifyToken(req) {
  const token = req.headers.cookie?.split(';')
    .find(c => c.trim().startsWith('token='))
    ?.split('=')[1];

  if (!token) {
    throw new Error('No token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  return decoded;
}

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

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const decoded = verifyToken(req);
    
    // Find user
    let user = null;
    for (const [email, userData] of users.entries()) {
      if (userData.id === decoded.userId) {
        user = userData;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Access denied. No token provided.' });
  }
}