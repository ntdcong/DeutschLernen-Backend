# API Testing Guide

## Prerequisites
Before testing, you need to configure your NeonDB connection in the `.env` file:

1. Open `.env` file
2. Replace `DATABASE_URL` with your NeonDB connection string:
   ```
   DATABASE_URL=postgresql://username:password@your-neon-host.neon.tech/dbname?sslmode=require
   ```

## Start the Server

```bash
npm run start:dev
```

The server will run on `http://localhost:3000/api`

## API Endpoints

### 1. Register a New User
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyen Van A",
  "role": "learner"
}
```

### 2. Login
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
    "expiresIn": 3600,
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2...",
    "tokenType": "Bearer",
    "user": {
      "id": "uuid-1234-5678",
      "email": "user@example.com",
      "fullName": "Nguyen Van A",
      "role": "learner"
    }
  }
}
```

### 3. Refresh Token
```bash
POST http://localhost:3000/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token-here"
}
```

### 4. Forgot Password
```bash
POST http://localhost:3000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 5. Reset Password
```bash
POST http://localhost:3000/api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-forgot-password",
  "newPassword": "newpassword123"
}
```

### 6. Get All Users (Requires Authentication)
```bash
GET http://localhost:3000/api/users
Authorization: Bearer your-access-token-here
```

**Admin Response:** Full user data
**Regular User Response:** Only id and fullName

### 7. Get User by ID (Requires Authentication)
```bash
GET http://localhost:3000/api/users/:id
Authorization: Bearer your-access-token-here
```

**Admin Response:** Full user data (except password)
**Regular User Response:** Only id and fullName

## Testing with cURL

### Register:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"admin123456\",\"fullName\":\"Admin User\",\"role\":\"admin\"}"
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"admin123456\"}"
```

### Get Users (with token):
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## Notes

- All responses follow the standardized format with `statusCode`, `message`, and `data` fields
- JWT tokens expire after 3600 seconds (1 hour) by default
- Refresh tokens expire after 604800 seconds (7 days) by default
- Password reset tokens expire after 1 hour
- Email sending is not implemented yet (tokens are returned in the response for testing)
