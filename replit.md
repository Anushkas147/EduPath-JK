# Overview

EduPath J&K is a comprehensive educational guidance platform designed specifically for students in Jammu and Kashmir. The application helps students make informed decisions about their academic and career paths by providing aptitude assessments, college exploration tools, course recommendations, and personalized career guidance. The platform serves as a bridge between students' interests and available educational opportunities in the region.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a modern React-based frontend built with TypeScript and Vite. The UI is constructed using shadcn/ui components with Radix UI primitives, providing a consistent and accessible design system. Styling is handled through Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes. The routing is managed using Wouter for client-side navigation, and state management is handled through React Query for server state and local React state for UI interactions.

## Backend Architecture
The backend is built on Express.js with TypeScript, following a RESTful API design pattern. The server implements a modular route structure with separate handlers for authentication, user profiles, assessments, saved items, and timeline management. The application uses session-based authentication integrated with Replit's OpenID Connect (OIDC) system for user management, providing secure login and user session handling.

## Database Design
The application uses PostgreSQL as its primary database with Drizzle ORM for type-safe database operations. The schema includes tables for users, user profiles, assessments, saved colleges, saved courses, timeline events, and user activities. The database design supports educational data specific to the J&K region, including college information with local districts and course mappings tailored to Indian educational streams.

## Authentication System
Authentication is handled through Replit's OIDC integration with session management using express-session and PostgreSQL session storage. The system maintains user sessions with proper security measures including CSRF protection and secure cookie handling. User profiles are linked to authentication data and support educational-specific fields like current class, academic scores, and regional location data.

## Data Management
The application manages static educational data through JSON files for colleges and courses, while dynamic user data is stored in PostgreSQL. The college data includes information about government institutions in J&K with details like location, fees, facilities, and popular courses. Course data includes career pathways, salary information, and skill requirements organized by educational streams (Science, Commerce, Arts, Engineering, Medical, Vocational).

# External Dependencies

- **Neon Database**: PostgreSQL database hosting service for persistent data storage
- **Replit Authentication**: OpenID Connect integration for user authentication and session management
- **Radix UI**: Component primitives for accessible and customizable UI elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design and theming
- **React Query**: Data fetching and caching library for server state management
- **Drizzle ORM**: Type-safe ORM for PostgreSQL database operations with migration support
- **Express Session Store**: PostgreSQL-based session storage using connect-pg-simple