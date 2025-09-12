# Deploy to Vercel

This project is now configured for easy deployment on Vercel. Follow these steps:

## Quick Deploy

1. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your repository
   - Click "Deploy"

## Environment Variables

Set these environment variables in your Vercel dashboard:

```
JWT_SECRET=your-super-secret-jwt-key-here
MONGODB_URI=your-mongodb-connection-string-if-using-mongodb
SESSION_SECRET=your-session-secret-key
```

## Project Structure

```
/
├── api/                 # Serverless API functions
│   ├── auth/
│   │   ├── register.js  # User registration
│   │   ├── login.js     # User login
│   │   ├── logout.js    # User logout
│   │   └── user.js      # Get current user
│   ├── colleges.js      # Get colleges
│   └── courses.js       # Get courses
├── client/              # React frontend
├── vercel.json          # Vercel configuration
└── README.md
```

## Features

- ✅ **Serverless API** - All backend routes converted to Vercel functions
- ✅ **Authentication** - JWT-based auth with HTTP-only cookies
- ✅ **CORS Enabled** - Ready for cross-origin requests
- ✅ **Environment Variables** - Secure secret management
- ✅ **Static Frontend** - Optimized React build
- ✅ **Automatic Routing** - API and frontend routes configured

## Development

For local development:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Production Deployment

Vercel will automatically:
1. Build your React frontend
2. Deploy serverless functions
3. Configure routing
4. Set up HTTPS
5. Provide a production URL

## Custom Domain

To use a custom domain:
1. Go to your Vercel project dashboard
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Database Options

This setup supports:
- **MongoDB Atlas** (recommended for production)
- **In-memory storage** (fallback for development)
- **Any database** (modify API functions as needed)

## Support

For issues with deployment, check:
- Vercel function logs
- Environment variables are set
- Repository is connected properly
- Build logs for errors