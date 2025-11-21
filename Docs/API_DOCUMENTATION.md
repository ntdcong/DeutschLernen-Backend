# DeutschLernen API Documentation

## 📚 Overview

Professional REST API for the DeutschLernen (German Learning) platform. Built with NestJS, TypeScript, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Postman (for API testing)

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run development server
npm run start:dev
```

Server runs at: `http://localhost:3000`

## 📖 API Documentation

### Import to Postman

1. Open Postman
2. Click **Import** → **Upload Files**
3. Select `DeutschLernen-API.postman_collection.json`
4. Collection will be imported with all endpoints and examples

### Authentication

Most endpoints require JWT authentication. After login, the access token is automatically saved to collection variables.

**Header Format:**
```
Authorization: Bearer <your_access_token>
```

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access, can set decks as public, manage all resources |
| **Teacher** | Create/manage own decks and words, cannot set public |
| **Learner** | Create/manage own decks and words, cannot set public |

## 📋 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login and get tokens | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | Yes |
| GET | `/users/:id` | Get user by ID | Yes |

### Decks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/decks` | Create new deck | Yes |
| GET | `/decks` | Get all accessible decks | Yes |
| GET | `/decks/:id` | Get deck by ID | Yes |
| PATCH | `/decks/:id` | Update deck | Yes (Owner/Admin) |
| DELETE | `/decks/:id` | Delete deck | Yes (Owner/Admin) |
| GET | `/decks/:id/shuffled-ids` | Get shuffled word IDs | Yes |
| GET | `/decks/:id/word-count` | Get word count | Yes |

### Words

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/words` | Create new word | Yes (Owner/Admin) |
| GET | `/words/deck/:deckId` | Get all words in deck | Yes |
| POST | `/words/batch` | Batch load words | Yes |
| GET | `/words/:id` | Get word by ID | Yes |
| PATCH | `/words/:id` | Update word | Yes (Owner/Admin) |
| PATCH | `/words/:id/toggle-learned` | Toggle learned status | Yes (Owner/Admin) |
| DELETE | `/words/:id` | Delete word | Yes (Owner/Admin) |

## 🎯 Key Features

### 1. Role-Based Access Control

**`isPublic` Field Security:**
- Only **Admin** users can set `isPublic = true`
- Non-admin users attempting to set `isPublic = true` will have it automatically forced to `false`
- This is enforced at the service layer, cannot be bypassed

### 2. Performance Optimization

**Conditional Batch Loading:**
- Decks with **≤200 words**: Load all words normally
- Decks with **>200 words**: Use ID-first batch loading strategy

**Workflow for Large Decks:**
1. Frontend calls `GET /decks/:id/shuffled-ids`
2. Backend returns shuffled array of word IDs
3. Frontend loads first batch (50-100 words) via `POST /words/batch`
4. Frontend pre-fetches next batch when user reaches word N-10
5. Seamless UX with no loading delays

### 3. Data Validation

All endpoints use class-validator for input validation:
- Email format validation
- Password strength requirements
- UUID validation
- URL validation for audio files
- Required field enforcement

## 📝 Example Requests

### Register User
```json
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "learner"
}
```

### Create Deck
```json
POST /decks
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "German Vocabulary A1",
  "isPublic": false
}
```

### Create Word
```json
POST /words
Authorization: Bearer <token>
Content-Type: application/json

{
  "deckId": "uuid-here",
  "word": "der Hund",
  "meaning": "dog",
  "genus": "der",
  "plural": "die Hunde",
  "audioUrl": "https://example.com/audio.mp3",
  "isLearned": false
}
```

### Batch Load Words
```json
POST /words/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

## 🔄 Response Format

All endpoints return a consistent response format:

**Success Response:**
```json
{
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## 🗄️ Database Schema

### Users Table
- `id` (UUID, PK)
- `email` (unique)
- `password` (hashed)
- `full_name`
- `role` (enum: learner, teacher, admin)
- `is_active`
- `reset_password_token`
- `reset_password_expires`
- `created_at`, `updated_at`

### Decks Table
- `id` (UUID, PK)
- `name`
- `user_id` (FK → users)
- `is_public` (default: false)
- `created_at`, `updated_at`

### Words Table
- `id` (UUID, PK)
- `deck_id` (FK → decks)
- `word`
- `meaning`
- `genus` (nullable)
- `plural` (nullable)
- `audio_url` (nullable)
- `is_learned` (default: false)
- `created_at`, `updated_at`

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Input validation and sanitization
- SQL injection protection (TypeORM)
- CORS configuration
- Rate limiting (recommended for production)

## 🧪 Testing

### Using Postman Collection

1. Import the collection
2. Run "Login" request to get tokens
3. Tokens are auto-saved to variables
4. Test other endpoints with saved authentication

### Using PowerShell Scripts

```powershell
# Test authentication endpoints
.\test_scripts\test-auth-api.ps1
```

## 📦 Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5
- **Database**: PostgreSQL (via NeonDB)
- **ORM**: TypeORM 0.3
- **Authentication**: JWT (Passport)
- **Validation**: class-validator, class-transformer
- **Password**: bcrypt

## 🚀 Deployment

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# App
NODE_ENV=production
PORT=3000
```

### Production Build

```bash
# Build
npm run build

# Start production server
npm run start:prod
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Postman Documentation](https://learning.postman.com)

## 🤝 Support

For issues or questions, please refer to:
- API Documentation: This file
- Postman Collection: `DeutschLernen-API.postman_collection.json`
- Implementation Details: `walkthrough.md`

## 📄 License

Private - DeutschLernen Project

---

**Last Updated**: November 2025  
**API Version**: 1.0.0
