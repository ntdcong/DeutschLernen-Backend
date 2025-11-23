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
| POST | `/words/import/:deckId` | Import words from Excel/CSV | Yes (Owner/Admin) |
| POST | `/words/generate` | Generate words using AI | Yes (Owner/Admin) |
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

### 4. Import & AI Features 🆕

**Import from Excel/CSV:**
- Supports `.xlsx`, `.xls`, and `.csv` formats
- Batch import multiple words at once
- Partial success handling (continues on errors)
- Detailed error reporting per row
- Required columns: `word`, `meaning`
- Optional columns: `genus`, `plural`, `audioUrl`

**AI-Powered Word Generation:**
- Generate vocabulary based on topics
- Support for 6 difficulty levels (A1-C2)
- Automatic article detection (der/die/das)
- Plural forms for nouns
- Vietnamese translations
- Powered by Groq LLaMA 3.3 70B model
- Maximum 50 words per request
- Topics can be in German or Vietnamese

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

### Import Words from Excel/CSV
```bash
POST /words/import/:deckId
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Form data:
# - file: Excel (.xlsx, .xls) or CSV file

# File format (Excel/CSV columns):
# | word       | meaning    | genus | plural      | audioUrl |
# |------------|------------|-------|-------------|----------|
# | der Apfel  | quả táo    | der   | die Äpfel   |          |
# | die Katze  | con mèo    | die   | die Katzen  |          |

# Response:
{
  "statusCode": 201,
  "message": "Import completed. 10 words imported, 0 failed",
  "data": {
    "imported": 10,
    "failed": 0,
    "errors": []
  }
}
```

**Using curl:**
```bash
curl -X POST \
  "http://localhost:3000/words/import/DECK_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/words.xlsx"
```

### Generate Words with AI
```json
POST /words/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "deckId": "uuid-here",
  "topic": "Tiere",           // Topic in German or Vietnamese
  "count": 10,                // Number of words (1-50)
  "level": "A1"               // Optional: A1, A2, B1, B2, C1, C2
}

# Response:
{
  "statusCode": 201,
  "message": "Successfully generated 10 words using AI",
  "data": [
    {
      "id": "uuid",
      "deckId": "deck-uuid",
      "word": "der Hund",
      "meaning": "con chó",
      "genus": "der",
      "plural": "die Hunde",
      "audioUrl": null,
      "isLearned": false,
      "createdAt": "2025-11-23T15:20:00.000Z",
      "updatedAt": "2025-11-23T15:20:00.000Z"
    }
    // ... more words
  ]
}
```

**Popular Topics:**
- Tiere (Animals)
- Lebensmittel (Food)
- Familie (Family)
- Farben (Colors)
- Kleidung (Clothing)
- Berufe (Professions)
- Wetter (Weather)
- Körperteile (Body parts)
- Verkehrsmittel (Transportation)

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
- **File Processing**: xlsx, csv-parser, multer
- **AI Integration**: Groq SDK (LLaMA 3.3 70B)

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

# Groq AI
GROQ_API_KEY=your-groq-api-key

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
