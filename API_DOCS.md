# 📚 DeutschLernen API Documentation

> **Version:** 1.0.0  
> **Last Updated:** 2025-12-05  
> **Base URL:** `http://localhost:3000` (Development) | Your deployed URL (Production)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [API Endpoints](#api-endpoints)
   - [Health Check](#health-check)
   - [Auth Module](#1-auth-module)
   - [Dictionary Module](#2-dictionary-module)
   - [Flashcard Module](#3-flashcard-module)
     - [Decks](#31-decks)
     - [Public Sharing](#32-public-sharing)
     - [Public Decks (No Auth)](#33-public-decks-anonymous-access)
     - [Words](#34-words)
     - [Sentences](#35-sentences)
     - [AI Assistant](#36-ai-assistant)
   - [Users Module](#4-users-module)
5. [Data Models](#data-models)

---

## Overview

DeutschLernen is a German learning application API built with NestJS. This API provides:

- 🔐 **Authentication** - JWT-based auth with access & refresh tokens
- 📖 **Dictionary** - German-Vietnamese dictionary powered by Faztaa API & Google Translate
- 🎴 **Flashcards** - Decks, words, and sentences management
- 🤖 **AI Assistant** - AI-powered learning tools using Groq/Cloudflare Workers AI
- 👥 **Users** - User management with role-based access

---

## Authentication

Most endpoints require authentication using a **JWT Bearer Token**.

### Headers

```http
Authorization: Bearer <access_token>
```

### Token Types

| Token | Purpose | Expiry |
|-------|---------|--------|
| `accessToken` | API authentication | 15 minutes |
| `refreshToken` | Get new access token | 7 days |

---

## Error Handling

### Standard Error Response

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Invalid/missing token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found |
| `409` | Conflict - Resource already exists |
| `500` | Internal Server Error |

---

## API Endpoints

---

## Health Check

Check if the API is running.

```http
GET /
```

**Response:**
```
Hello World!
```

---

## 1. Auth Module

### 1.1 Register

Create a new user account.

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "role": "learner"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ | Valid email address |
| `password` | string | ✅ | Minimum 8 characters |
| `fullName` | string | ✅ | User's full name |
| `role` | string | ❌ | `learner` (default), `teacher`, `admin` |

**Response:** `201 Created`
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "learner",
    "isActive": true,
    "createdAt": "2024-12-05T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `409 Conflict` - Email already exists

---

### 1.2 Login

Authenticate user and get tokens.

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "learner"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials

---

### 1.3 Refresh Token

Get a new access token using refresh token.

```http
POST /auth/refresh
```

**Headers:**
```http
Authorization: Bearer <refresh_token>
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.4 Forgot Password

Request a password reset email.

```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset email sent"
}
```

---

### 1.5 Reset Password

Reset password using token from email.

```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password successfully reset"
}
```

---

## 2. Dictionary Module

### 2.1 Search Word

Search for a word in the German-Vietnamese dictionary.

```http
GET /dictionary/search?word={word}&source_lang={source_lang}
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `word` | string | ✅ | - | Word to search |
| `source_lang` | string | ❌ | `de` | Source language: `de` (German) or `vi` (Vietnamese) |

**Example Requests:**
```http
GET /dictionary/search?word=Haus
GET /dictionary/search?word=Haus&source_lang=de
GET /dictionary/search?word=nhà&source_lang=vi
```

**Response Types:**

#### Type 1: Exact Match (found: true)
```json
{
  "found": true,
  "key": "Haus",
  "result": [
    {
      "word": "Haus",
      "id": 12345,
      "language": "vi",
      "type": "devi",
      "content": [
        {
          "kind": "(das) danh từ",
          "means": [
            {
              "mean": "nhà, ngôi nhà",
              "examples": [
                {
                  "e": "ein Haus bauen",
                  "m": "xây một ngôi nhà"
                }
              ]
            }
          ]
        }
      ],
      "pronounce": {
        "de": "haʊ̯s"
      },
      "conjugation": null
    }
  ]
}
```

#### Type 2: Related Word Match (found_related: true)
When searching conjugated forms (e.g., "ging" → "gehen"):
```json
{
  "found": false,
  "found_related": true,
  "key": "ging",
  "type": "faztaa_related",
  "result": [
    {
      "word": "gehen",
      "keyword": "gegangen, geh, gehe, gehend, gehst, geht, ging, ginge...",
      "content": [...]
    }
  ]
}
```

#### Type 3: Google Translate Fallback
When no dictionary match found:
```json
{
  "found": true,
  "key": "Guten Morgen",
  "type": "google_translate",
  "result": [
    {
      "word": "Guten Morgen",
      "content": [
        {
          "kind": "Dịch tự động (Google Translate)",
          "means": [
            {
              "mean": "Chào buổi sáng",
              "examples": []
            }
          ]
        }
      ],
      "pronounce": {}
    }
  ]
}
```

---

## 3. Flashcard Module

### 3.1 Decks

#### Create Deck

```http
POST /decks
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "German A1 Vocabulary",
  "isPublic": false
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | ✅ | - | Deck name |
| `isPublic` | boolean | ❌ | `false` | Whether deck is publicly visible |

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "message": "Deck created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "German A1 Vocabulary",
    "userId": "user-uuid",
    "isPublic": false,
    "isPublicShareable": false,
    "publicShareToken": null,
    "createdAt": "2024-12-05T10:00:00.000Z",
    "updatedAt": "2024-12-05T10:00:00.000Z"
  }
}
```

---

#### Get All Decks

Get all decks for the authenticated user.

```http
GET /decks
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Decks retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "German A1 Vocabulary",
      "userId": "user-uuid",
      "isPublic": false,
      "isPublicShareable": false,
      "publicShareToken": null,
      "createdAt": "2024-12-05T10:00:00.000Z",
      "updatedAt": "2024-12-05T10:00:00.000Z"
    }
  ]
}
```

---

#### Get Deck by ID

```http
GET /decks/:id
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Deck retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "German A1 Vocabulary",
    "userId": "user-uuid",
    "isPublic": false,
    "createdAt": "2024-12-05T10:00:00.000Z",
    "updatedAt": "2024-12-05T10:00:00.000Z"
  }
}
```

---

#### Update Deck

```http
PATCH /decks/:id
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Updated Deck Name",
  "isPublic": true
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Deck updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Deck Name",
    "isPublic": true,
    ...
  }
}
```

---

#### Delete Deck

```http
DELETE /decks/:id
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Deck deleted successfully"
}
```

---

#### Get Shuffled Word IDs

Get shuffled word IDs for learning mode. Used for decks with many words (>200).

```http
GET /decks/:id/shuffled-ids
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

For decks with ≤200 words:
```json
{
  "statusCode": 200,
  "message": "Deck has 200 or fewer words, load normally",
  "data": {
    "useBatchLoading": false
  }
}
```

For decks with >200 words:
```json
{
  "statusCode": 200,
  "message": "Shuffled word IDs retrieved successfully",
  "data": {
    "useBatchLoading": true,
    "ids": [
      "word-uuid-1",
      "word-uuid-2",
      "word-uuid-3"
    ]
  }
}
```

---

#### Get Word Count

```http
GET /decks/:id/word-count
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Word count retrieved successfully",
  "data": {
    "count": 150
  }
}
```

---

### 3.2 Public Sharing

These endpoints require authentication and allow deck owners to manage public sharing.

#### Enable Public Share

```http
POST /decks/:id/public-share/enable
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Public sharing enabled successfully",
  "data": {
    "shareToken": "abc123xyz789",
    "isPublic": true,
    "isPublicShareable": true,
    "publicShareEnabledAt": "2024-12-05T10:00:00.000Z"
  }
}
```

---

#### Disable Public Share

```http
DELETE /decks/:id/public-share/disable
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Public sharing disabled successfully"
}
```

---

#### Regenerate Share Token

```http
POST /decks/:id/public-share/regenerate
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Public share token regenerated successfully",
  "data": {
    "shareToken": "newtoken456abc"
  }
}
```

---

#### Get Public Share Info

```http
GET /decks/:id/public-share/info
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Public share info retrieved successfully",
  "data": {
    "shareToken": "abc123xyz789",
    "isPublic": true,
    "isPublicShareable": true,
    "publicShareEnabledAt": "2024-12-05T10:00:00.000Z"
  }
}
```

---

### 3.3 Public Decks (Anonymous Access)

These endpoints do NOT require authentication.

#### Get Public Deck by Token

```http
GET /public/decks/:token
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Public deck retrieved successfully",
  "data": {
    "id": "deck-uuid",
    "name": "German A1 Vocabulary",
    "wordCount": 50,
    "createdAt": "2024-12-05T10:00:00.000Z",
    "owner": {
      "id": "user-uuid",
      "username": "Nguyễn Văn A",
      "email": "user@example.com"
    },
    "words": [
      {
        "id": "word-uuid",
        "german": "Haus",
        "vietnamese": "nhà",
        "example": "Das ist mein Haus."
      }
    ]
  }
}
```

---

#### Get QR Code

```http
GET /public/decks/:token/qr?type=simple&size=300
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `type` | string | ❌ | `simple` | QR type: `simple` or `custom` |
| `size` | number | ❌ | `300` | Size in pixels (100-1000) |

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "QR code generated successfully",
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
    "deckName": "German A1 Vocabulary",
    "url": "https://your-frontend.com/public/learn/abc123xyz789"
  }
}
```

---

#### Download QR Code

```http
GET /public/decks/:token/qr/download?type=simple&size=300
```

**Response:** Binary PNG image file

**Headers:**
```http
Content-Type: image/png
Content-Disposition: attachment; filename="qr-german-a1-vocabulary.png"
```

---

### 3.4 Words

#### Create Word

```http
POST /words
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "deckId": "deck-uuid",
  "word": "Haus",
  "meaning": "nhà, ngôi nhà",
  "genus": "das",
  "plural": "Häuser",
  "audioUrl": "https://example.com/audio/haus.mp3",
  "isLearned": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deckId` | UUID | ✅ | Target deck ID |
| `word` | string | ✅ | German word |
| `meaning` | string | ✅ | Vietnamese meaning |
| `genus` | string | ❌ | Gender: `der`, `die`, `das` |
| `plural` | string | ❌ | Plural form |
| `audioUrl` | URL | ❌ | Audio pronunciation URL |
| `isLearned` | boolean | ❌ | Learning status (default: false) |

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "message": "Word created successfully",
  "data": {
    "id": "word-uuid",
    "deckId": "deck-uuid",
    "word": "Haus",
    "meaning": "nhà, ngôi nhà",
    "genus": "das",
    "plural": "Häuser",
    "audioUrl": "https://example.com/audio/haus.mp3",
    "isLearned": false,
    "createdAt": "2024-12-05T10:00:00.000Z",
    "updatedAt": "2024-12-05T10:00:00.000Z"
  }
}
```

---

#### Get Words by Deck

```http
GET /words/deck/:deckId
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Words retrieved successfully",
  "data": [
    {
      "id": "word-uuid",
      "deckId": "deck-uuid",
      "word": "Haus",
      "meaning": "nhà, ngôi nhà",
      "genus": "das",
      "plural": "Häuser",
      "audioUrl": null,
      "isLearned": false,
      "createdAt": "2024-12-05T10:00:00.000Z",
      "updatedAt": "2024-12-05T10:00:00.000Z"
    }
  ]
}
```

---

#### Get Batch Words

Get multiple words by IDs (for pagination/lazy loading).

```http
POST /words/batch
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "ids": [
    "word-uuid-1",
    "word-uuid-2",
    "word-uuid-3"
  ]
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Words batch retrieved successfully",
  "data": [
    {
      "id": "word-uuid-1",
      "word": "Haus",
      "meaning": "nhà",
      ...
    },
    {
      "id": "word-uuid-2",
      "word": "Auto",
      "meaning": "ô tô",
      ...
    }
  ]
}
```

---

#### Import Words from File

Import words from Excel (.xlsx) or CSV file.

```http
POST /words/import/:deckId
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | Excel (.xlsx) or CSV file |

**File Format (Excel/CSV):**
| Column A | Column B | Column C | Column D |
|----------|----------|----------|----------|
| word | meaning | genus | plural |
| Haus | nhà | das | Häuser |
| Auto | ô tô | das | Autos |

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "message": "Import completed. 10 words imported, 2 failed",
  "data": {
    "imported": 10,
    "failed": 2,
    "errors": [
      "Row 5: Missing word",
      "Row 8: Missing meaning"
    ]
  }
}
```

---

#### Generate Words with AI

Generate vocabulary words using AI based on a topic.

```http
POST /words/generate
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "deckId": "deck-uuid",
  "topic": "Food and Cooking",
  "count": 10,
  "level": "A1"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deckId` | UUID | ✅ | Target deck ID |
| `topic` | string | ✅ | Topic for word generation |
| `count` | number | ✅ | Number of words (1-50) |
| `level` | string | ❌ | CEFR level: A1, A2, B1, B2, C1, C2 |

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "message": "Successfully generated 10 words using AI",
  "data": [
    {
      "id": "word-uuid-1",
      "word": "Brot",
      "meaning": "bánh mì",
      "genus": "das",
      "plural": "Brote"
    },
    {
      "id": "word-uuid-2",
      "word": "kochen",
      "meaning": "nấu ăn",
      "genus": null,
      "plural": null
    }
  ]
}
```

---

#### Get Word by ID

```http
GET /words/:id
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Word retrieved successfully",
  "data": {
    "id": "word-uuid",
    "deckId": "deck-uuid",
    "word": "Haus",
    "meaning": "nhà, ngôi nhà",
    "genus": "das",
    "plural": "Häuser",
    "audioUrl": null,
    "isLearned": true,
    "createdAt": "2024-12-05T10:00:00.000Z",
    "updatedAt": "2024-12-05T10:00:00.000Z"
  }
}
```

---

#### Update Word

```http
PATCH /words/:id
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "word": "Haus",
  "meaning": "nhà, ngôi nhà, tòa nhà",
  "genus": "das",
  "plural": "Häuser",
  "audioUrl": "https://example.com/audio/haus.mp3",
  "isLearned": true
}
```

> ⚠️ Note: `deckId` cannot be changed after creation.

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Word updated successfully",
  "data": {
    "id": "word-uuid",
    ...
  }
}
```

---

#### Toggle Learned Status

```http
PATCH /words/:id/toggle-learned
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Word learned status toggled successfully",
  "data": {
    "id": "word-uuid",
    "isLearned": true,
    ...
  }
}
```

---

#### Delete Word

```http
DELETE /words/:id
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Word deleted successfully"
}
```

---

### 3.5 Sentences

#### Create Sentence

```http
POST /flashcard/sentences
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "wordId": "word-uuid",
  "german": "Das ist mein Haus.",
  "vietnamese": "Đây là nhà của tôi.",
  "grammarNote": "Sử dụng mạo từ 'mein' (tính từ sở hữu)",
  "difficulty": "A1",
  "isFavorite": false,
  "source": "user-created"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `wordId` | UUID | ✅ | Associated word ID |
| `german` | string | ✅ | German sentence |
| `vietnamese` | string | ✅ | Vietnamese translation |
| `grammarNote` | string | ❌ | Grammar explanation |
| `difficulty` | string | ❌ | CEFR level: A1, A2, B1, B2, C1 |
| `isFavorite` | boolean | ❌ | Favorite status (default: false) |
| `source` | string | ❌ | `user-created` or `ai-generated` |

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "message": "Sentence created successfully",
  "data": {
    "id": "sentence-uuid",
    "wordId": "word-uuid",
    "userId": "user-uuid",
    "german": "Das ist mein Haus.",
    "vietnamese": "Đây là nhà của tôi.",
    "grammarNote": "Sử dụng mạo từ 'mein' (tính từ sở hữu)",
    "difficulty": "A1",
    "isFavorite": false,
    "source": "user-created",
    "createdAt": "2024-12-05T10:00:00.000Z"
  }
}
```

---

#### Get Sentences by Word

```http
GET /flashcard/sentences/word/:wordId
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Sentences retrieved successfully",
  "data": [
    {
      "id": "sentence-uuid",
      "wordId": "word-uuid",
      "german": "Das ist mein Haus.",
      "vietnamese": "Đây là nhà của tôi.",
      "grammarNote": "...",
      "difficulty": "A1",
      "isFavorite": true,
      "source": "ai-generated",
      "createdAt": "2024-12-05T10:00:00.000Z"
    }
  ]
}
```

---

#### Get Favorite Sentences

Get all favorite sentences for the authenticated user.

```http
GET /flashcard/sentences/favorites
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Favorite sentences retrieved successfully",
  "data": [
    {
      "id": "sentence-uuid",
      "german": "Das ist mein Haus.",
      "vietnamese": "Đây là nhà của tôi.",
      "isFavorite": true,
      "word": {
        "id": "word-uuid",
        "word": "Haus",
        "meaning": "nhà"
      },
      ...
    }
  ]
}
```

---

#### Toggle Favorite

```http
PATCH /flashcard/sentences/:id/favorite
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Favorite status toggled successfully",
  "data": {
    "id": "sentence-uuid",
    "isFavorite": true,
    ...
  }
}
```

---

#### Update Sentence

```http
PATCH /flashcard/sentences/:id
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "german": "Das ist unser Haus.",
  "vietnamese": "Đây là nhà của chúng tôi.",
  "grammarNote": "Updated grammar note"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Sentence updated successfully",
  "data": {
    "id": "sentence-uuid",
    ...
  }
}
```

---

#### Delete Sentence

```http
DELETE /flashcard/sentences/:id
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Sentence deleted successfully"
}
```

---

### 3.6 AI Assistant

All AI endpoints require authentication and use a word ID to generate content.

#### Generate Sentence

Generate an example sentence for a word using AI.

```http
POST /flashcard/ai/generate-sentence
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "wordId": "word-uuid",
  "difficulty": "A1"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `wordId` | UUID | ✅ | Word to generate sentence for |
| `difficulty` | string | ❌ | Target CEFR level |

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Sentence generated successfully",
  "data": {
    "id": "sentence-uuid",
    "german": "Ich wohne in einem großen Haus.",
    "vietnamese": "Tôi sống trong một ngôi nhà lớn.",
    "grammarNote": "Dùng 'in + Dativ' để chỉ vị trí",
    "difficulty": "A1",
    "source": "ai-generated"
  }
}
```

---

#### Get Fun Facts

Get interesting facts about a word.

```http
POST /flashcard/ai/fun-facts
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "wordId": "word-uuid"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Fun facts retrieved successfully",
  "data": "🏠 **Thú vị về 'Haus':**\n\n1. Từ 'Haus' có nguồn gốc từ tiếng Đức cổ 'hūs'\n2. Trong tiếng Đức, 'Hausfrau' (bà nội trợ) là từ ghép phổ biến\n3. Thành ngữ: 'Haus und Hof' = tất cả tài sản..."
}
```

---

#### Get Etymology

Get the etymology (origin) of a word.

```http
POST /flashcard/ai/etymology
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "wordId": "word-uuid"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Etymology retrieved successfully",
  "data": "📜 **Nguồn gốc từ 'Haus':**\n\nTừ 'Haus' có nguồn gốc từ tiếng Đức cổ 'hūs', liên quan đến tiếng Anh 'house' và tiếng Hà Lan 'huis'. Gốc Proto-Germanic là *hūsą..."
}
```

---

#### Get Common Phrases

Get common phrases and expressions using a word.

```http
POST /flashcard/ai/phrases
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "wordId": "word-uuid"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Common phrases retrieved successfully",
  "data": "📝 **Cụm từ thường gặp với 'Haus':**\n\n1. **nach Hause** - về nhà\n   - Ich gehe nach Hause. (Tôi về nhà.)\n\n2. **zu Hause** - ở nhà\n   - Ich bin zu Hause. (Tôi đang ở nhà.)\n\n3. **Hausaufgaben** - bài tập về nhà..."
}
```

---

#### Get Common Mistakes

Get common mistakes learners make with a word.

```http
POST /flashcard/ai/common-mistakes
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "wordId": "word-uuid"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Common mistakes retrieved successfully",
  "data": "⚠️ **Lỗi thường gặp với 'Haus':**\n\n1. **nach Hause vs zu Hause**\n   - ❌ Ich bin nach Hause.\n   - ✅ Ich bin zu Hause. (Tôi đang ở nhà)\n   - ✅ Ich gehe nach Hause. (Tôi đi về nhà)\n\n2. **Giới tính (Genus)**\n   - ❌ die Haus\n   - ✅ das Haus..."
}
```

---

## 4. Users Module

#### Get All Users

```http
GET /users
Authorization: Bearer <access_token>
```

**Response (Admin):** `200 OK`
```json
{
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "learner",
      "isActive": true,
      "createdAt": "2024-12-05T10:00:00.000Z",
      "updatedAt": "2024-12-05T10:00:00.000Z"
    }
  ]
}
```

**Response (Non-Admin):** `200 OK`
```json
{
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "user-uuid",
      "fullName": "Nguyễn Văn A"
    }
  ]
}
```

---

#### Get User by ID

```http
GET /users/:id
Authorization: Bearer <access_token>
```

**Response (Admin):** `200 OK`
```json
{
  "message": "User retrieved successfully",
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "learner",
    "isActive": true,
    "createdAt": "2024-12-05T10:00:00.000Z",
    "updatedAt": "2024-12-05T10:00:00.000Z"
  }
}
```

**Response (Non-Admin):** `200 OK`
```json
{
  "message": "User retrieved successfully",
  "data": {
    "id": "user-uuid",
    "fullName": "Nguyễn Văn A",
    "email": "user@example.com",
    "isActive": true,
    "createdAt": "2024-12-05T10:00:00.000Z"
  }
}
```

---

## Data Models

### User

```typescript
{
  id: string;           // UUID
  email: string;        // Unique email
  fullName: string;     // Display name
  role: "learner" | "teacher" | "admin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Deck

```typescript
{
  id: string;                    // UUID
  name: string;                  // Deck name
  userId: string;                // Owner UUID
  isPublic: boolean;             // Visibility
  isPublicShareable: boolean;    // Shareable via token
  publicShareToken: string | null;
  publicShareEnabledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Word

```typescript
{
  id: string;           // UUID
  deckId: string;       // Parent deck UUID
  word: string;         // German word
  meaning: string;      // Vietnamese meaning
  genus: string | null; // der/die/das
  plural: string | null;
  audioUrl: string | null;
  isLearned: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Sentence

```typescript
{
  id: string;                  // UUID
  wordId: string;              // Associated word UUID
  userId: string;              // Creator UUID
  german: string;              // German sentence
  vietnamese: string;          // Vietnamese translation
  grammarNote: string | null;  // Grammar explanation
  difficulty: string | null;   // A1, A2, B1, B2, C1
  isFavorite: boolean;
  source: "ai-generated" | "user-created";
  createdAt: Date;
}
```

---

## Quick Reference

### Endpoints Summary

| Module | Endpoint | Method | Auth | Description |
|--------|----------|--------|------|-------------|
| **Auth** | `/auth/register` | POST | ❌ | Register new user |
| | `/auth/login` | POST | ❌ | Login |
| | `/auth/refresh` | POST | 🔄 | Refresh token |
| | `/auth/forgot-password` | POST | ❌ | Request password reset |
| | `/auth/reset-password` | POST | ❌ | Reset password |
| **Dictionary** | `/dictionary/search` | GET | ❌ | Search word |
| **Decks** | `/decks` | GET | ✅ | List decks |
| | `/decks` | POST | ✅ | Create deck |
| | `/decks/:id` | GET | ✅ | Get deck |
| | `/decks/:id` | PATCH | ✅ | Update deck |
| | `/decks/:id` | DELETE | ✅ | Delete deck |
| | `/decks/:id/shuffled-ids` | GET | ✅ | Get shuffled word IDs |
| | `/decks/:id/word-count` | GET | ❌ | Get word count |
| **Public Sharing** | `/decks/:id/public-share/enable` | POST | ✅ | Enable sharing |
| | `/decks/:id/public-share/disable` | DELETE | ✅ | Disable sharing |
| | `/decks/:id/public-share/regenerate` | POST | ✅ | Regenerate token |
| | `/decks/:id/public-share/info` | GET | ✅ | Get share info |
| **Public Decks** | `/public/decks/:token` | GET | ❌ | Get shared deck |
| | `/public/decks/:token/qr` | GET | ❌ | Get QR code |
| | `/public/decks/:token/qr/download` | GET | ❌ | Download QR |
| **Words** | `/words` | POST | ✅ | Create word |
| | `/words/deck/:deckId` | GET | ✅ | Get words by deck |
| | `/words/batch` | POST | ✅ | Get batch words |
| | `/words/import/:deckId` | POST | ✅ | Import from file |
| | `/words/generate` | POST | ✅ | Generate with AI |
| | `/words/:id` | GET | ✅ | Get word |
| | `/words/:id` | PATCH | ✅ | Update word |
| | `/words/:id/toggle-learned` | PATCH | ✅ | Toggle learned |
| | `/words/:id` | DELETE | ✅ | Delete word |
| **Sentences** | `/flashcard/sentences` | POST | ✅ | Create sentence |
| | `/flashcard/sentences/word/:wordId` | GET | ✅ | Get by word |
| | `/flashcard/sentences/favorites` | GET | ✅ | Get favorites |
| | `/flashcard/sentences/:id/favorite` | PATCH | ✅ | Toggle favorite |
| | `/flashcard/sentences/:id` | PATCH | ✅ | Update sentence |
| | `/flashcard/sentences/:id` | DELETE | ✅ | Delete sentence |
| **AI Assistant** | `/flashcard/ai/generate-sentence` | POST | ✅ | Generate sentence |
| | `/flashcard/ai/fun-facts` | POST | ✅ | Get fun facts |
| | `/flashcard/ai/etymology` | POST | ✅ | Get etymology |
| | `/flashcard/ai/phrases` | POST | ✅ | Get phrases |
| | `/flashcard/ai/common-mistakes` | POST | ✅ | Get mistakes |
| **Users** | `/users` | GET | ✅ | List users |
| | `/users/:id` | GET | ✅ | Get user |

**Legend:**
- ✅ = Requires `Authorization: Bearer <access_token>`
- 🔄 = Requires `Authorization: Bearer <refresh_token>`
- ❌ = No authentication required

---

> 📝 **Note:** This documentation reflects the current state of the API. For the latest updates, check the source code or contact the development team.
