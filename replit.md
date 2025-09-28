# Overview

SecureShare is a full-stack secure file-sharing web application that implements client-side encryption with pattern-based authentication. The application allows users to upload files which are encrypted using AES-GCM before being stored, and can be decrypted by recipients who know the correct pattern or passphrase. The system prioritizes security through client-side encryption, ensuring that files are never stored unencrypted on the server.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **Styling**: Tailwind CSS with a custom dark purple theme (#4B0082/#6A0DAD) and shadcn/ui component library
- **State Management**: TanStack Query for server state management and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling via shadcn/ui

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL for cloud hosting
- **API Design**: RESTful API with endpoints for file upload, listing, and download operations

## Encryption System
- **Client-side Encryption**: All files are encrypted in the browser before upload using Web Crypto API
- **Algorithm**: AES-GCM with 256-bit keys for authenticated encryption
- **Key Derivation**: PBKDF2 with SHA-256, 200,000+ iterations, and random 16-byte salts
- **Authentication Methods**: 3x3 Android-style pattern grid or text passphrase input
- **File Format**: Custom .enc format with JSON header containing metadata and encrypted payload

## Data Storage
- **File Storage**: Encrypted files stored as Base64-encoded data in PostgreSQL database
- **Metadata Storage**: File information including encryption parameters, usernames, timestamps, and file properties
- **Schema**: Type-safe database schema using Drizzle ORM with Zod validation

## Security Features
- **Zero-knowledge Architecture**: Server never has access to encryption keys or unencrypted content
- **Pattern Validation**: Client-side pattern strength validation with visual feedback
- **Secure Headers**: Proper CORS, content security, and security headers implementation
- **Input Validation**: Comprehensive validation using Zod schemas on both client and server

## User Interface Components
- **Pattern Grid**: Interactive 3x3 dot grid with smooth animations for pattern input
- **File Upload**: Drag-and-drop interface with progress indicators and file type detection
- **File Dashboard**: Responsive table showing all uploaded files with download capabilities
- **Encryption Modal**: Unified interface for both encryption (upload) and decryption (download) flows
- **File Preview**: In-browser preview for images, videos, PDFs, and text files after decryption

# External Dependencies

## Database Services
- **Neon**: Serverless PostgreSQL database hosting with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Radix UI**: Unstyled, accessible UI component primitives
- **shadcn/ui**: Pre-built component library with consistent design system
- **Lucide React**: Icon library for consistent iconography

## Development and Build Tools
- **Vite**: Fast build tool and development server with HMR
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer plugin

## Runtime Libraries
- **Express.js**: Web application framework for the Node.js backend
- **TanStack Query**: Data fetching and caching library for React
- **React Hook Form**: Form state management with validation
- **date-fns**: Date manipulation and formatting utilities
- **Wouter**: Minimalist routing library for React applications