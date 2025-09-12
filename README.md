# EduPath J&K - Educational Guidance Platform

EduPath J&K is a comprehensive educational guidance platform designed specifically for students in Jammu and Kashmir. The application helps students make informed decisions about their academic and career paths by providing aptitude assessments, college exploration tools, course recommendations, and personalized career guidance.

## 🌟 Features

- **User Authentication**: Secure login system integrated with Replit Auth
- **Personalized Profiles**: Complete educational profile management for students
- **Aptitude Assessments**: Interactive quizzes to identify student strengths and interests
- **College Explorer**: Browse and save colleges across Jammu & Kashmir
- **Course Recommendations**: Detailed course information with career pathways
- **Timeline Tracker**: Keep track of important academic deadlines and events
- **Activity Dashboard**: Monitor user engagement and progress

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Components**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom theming support
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query for server state, React hooks for local state

### Backend
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety
- **Authentication**: Replit OIDC integration with session management
- **Database**: PostgreSQL with Drizzle ORM
- **Session Storage**: PostgreSQL-based sessions using connect-pg-simple

### Database Schema
- **Users**: Core user information from authentication
- **User Profiles**: Educational details and preferences
- **Assessments**: Quiz results and recommendations
- **Saved Items**: Colleges and courses bookmarked by users
- **Timeline Events**: Academic deadlines and important dates
- **Activity Logs**: User engagement tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 20 or later
- PostgreSQL database
- Replit account (for authentication)

### Environment Variables
Create a `.env` file with the following variables:
```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_secure_session_secret
REPLIT_DOMAINS=your_replit_domain
REPL_ID=your_repl_id
ISSUER_URL=https://replit.com/oidc
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd edupath-jk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run db:push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Apply database schema changes

## 🔒 Security Features

- **Secure Authentication**: OIDC integration with Replit Auth
- **Session Management**: Secure session handling with PostgreSQL storage
- **Input Validation**: Comprehensive input validation using Zod schemas
- **CSRF Protection**: Built-in protection against cross-site request forgery
- **Secure Cookies**: HTTP-only, secure cookies for session management
- **Client-Server Separation**: Clear separation between frontend and backend concerns

## 🎯 Target Audience

- **Students**: Class 10th, 12th, and graduates in Jammu & Kashmir
- **Educational Counselors**: Tools for guiding students in career decisions
- **Parents**: Information to help support their children's educational choices

## 🗂️ Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   └── data/          # Static data files
├── server/                # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── replitAuth.ts      # Authentication setup
│   ├── storage.ts         # Database operations
│   └── db.ts              # Database configuration
├── shared/                # Shared code between client and server
│   └── schema.ts          # Database schema and types
└── README.md
```

## 🎨 UI/UX Features

- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Responsive Design**: Mobile-first design that works on all devices
- **Accessibility**: WCAG compliant components with proper ARIA support
- **Modern Interface**: Clean, intuitive design following modern UI principles

## 📊 Data Sources

- **College Data**: Curated information about government colleges in J&K
- **Course Information**: Comprehensive course details with career pathways
- **Assessment Questions**: Educational aptitude and interest evaluation tools

## 🔄 Development Workflow

1. **Development**: Use `npm run dev` for hot-reloading development
2. **Database Changes**: Update schema in `shared/schema.ts` and run `npm run db:push`
3. **Type Safety**: TypeScript ensures type safety across the entire stack
4. **Code Quality**: ESLint and Prettier configurations for consistent code style

## 🚢 Deployment

The application is designed to run on Replit with automatic deployments:

1. **Production Build**: `npm run build`
2. **Start Production**: `npm start`
3. **Database Migration**: Automatic via Drizzle ORM
4. **Environment**: Configured via Replit Secrets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `replit.md`

---

Built with ❤️ for the students of Jammu & Kashmir