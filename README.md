# DeutschLerne Backend API

NestJS backend application with authentication and user management.

## Features

- ✅ User Registration
- ✅ User Login with JWT
- ✅ Access & Refresh Tokens
- ✅ Password Reset Flow
- ✅ Role-Based Access Control (Admin, Teacher, Learner)
- ✅ User List & Detail APIs with role-based filtering
- ✅ Flashcard Deck Management
- ✅ Vocabulary Word Management
- ✅ **Import Words from Excel/CSV** 🆕
- ✅ **AI-Powered Word Generation (Groq)** 🆕
- ✅ Standardized JSON Response Format
- ✅ NeonDB (PostgreSQL) Integration
- ✅ Input Validation
- ✅ Global Error Handling

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update with your NeonDB credentials:
```env
DATABASE_URL=postgresql://username:password@your-neon-host.neon.tech/dbname?sslmode=require
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret-key
GROQ_API_KEY=your-groq-api-key
```

### 3. Run Development Server
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

## API Documentation

**Main Documentation:**
- [Complete API Reference](./Docs/API_DOCUMENTATION.md) - Full API documentation
- [Import & AI Guide](./Docs/IMPORT_AI_GUIDE.md) - Quick guide for new features
- [Quick Start](./QUICK_START.md) - 🇻🇳 Hướng dẫn nhanh tiếng Việt

**Key Features:**
- 📊 Import words from Excel/CSV files
- 🤖 AI-powered word generation using Groq
- 🔐 JWT authentication with role-based access
- 📦 Batch operations for large datasets

## Project Structure

```
src/
├── features/
│   ├── auth/                 # Authentication module
│   │   ├── dto/             # Data transfer objects
│   │   ├── guards/          # JWT guards
│   │   ├── strategies/      # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/               # User management module
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   └── flashcard/           # Flashcard module
│       ├── decks/           # Deck management
│       │   ├── dto/
│       │   ├── decks.controller.ts
│       │   ├── decks.service.ts
│       │   └── decks.module.ts
│       └── words/           # Word management
│           ├── dto/
│           ├── words.controller.ts
│           ├── words.service.ts
│           ├── groq.service.ts    # AI integration
│           └── words.module.ts
├── entities/            # TypeORM entities
│   ├── user.entity.ts
│   ├── deck.entity.ts
│   └── word.entity.ts
├── common/              # Shared utilities
│   ├── filters/        # Exception filters
│   ├── interceptors/   # Response transformers
│   └── interfaces/     # TypeScript interfaces
├── database/            # Database configuration
│   └── database.module.ts
├── app.module.ts
└── main.ts
```

## Response Format

All API responses follow this standardized format:

```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": {
    // Response data here
  }
}
```

## Technologies

- **Framework:** NestJS
- **Database:** PostgreSQL (NeonDB)
- **ORM:** TypeORM
- **Authentication:** JWT with Passport
- **Validation:** class-validator
- **Password Hashing:** bcrypt
- **File Processing:** xlsx, csv-parser, multer
- **AI Integration:** Groq SDK (LLaMA 3.3 70B)

## Available Scripts

- `npm run start` - Start production server
- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start debug mode
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## License

MIT
