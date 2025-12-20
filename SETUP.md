# Student Tribe API - Setup Guide

## Prerequisites

Install Bun runtime:

**Windows:**

```bash
powershell -c "irm bun.sh/install.ps1|iex"
```

**Mac/Linux:**

```bash
curl -fsSL https://bun.sh/install | bash
```

Verify:

```bash
bun --version
```

---

## Quick Start

### 1. Install Dependencies

```bash
cd app
bun install
```

### 2. Environment Setup

Create `.env` file in the `app` directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@host:5432/database

# JWT
JWT_SECRET=your-jwt-secret-key-change-this
JWT_EXPIRES_IN=7d

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3
OTP_MAX_REQUESTS=3
OTP_RATE_LIMIT_MINUTES=5

# Twilio SMS
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# AWS S3
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_S3_ACCESS_KEY_ID=your-access-key
AWS_S3_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-south-1
```

### 3. Database Setup

```bash
bun run db:push
```

### 4. Run Server

```bash
bun run dev
```

Server starts at `http://localhost:3000`

---

## API Documentation

Swagger UI: `http://localhost:3000/swagger`

---

## Available Commands

```bash
bun run dev          # Start development server with hot reload
bun run start        # Production server
bun run db:push      # Apply schema changes to database
bun run db:generate  # Generate migration files
bun run db:studio    # Open Drizzle Studio (DB GUI)
```

---

## API Overview

### Authentication Flow

1. **Send OTP**: `POST /api/otp/send` - Send OTP to phone number
2. **Verify OTP**: `POST /api/otp/verify` - Returns JWT token

### Onboarding Flow (Requires JWT)

1. **Basic Info**: `POST /api/onboarding/basic-info`

   - Fields: displayName, username, email, profileImage (optional)

2. **Domain & Skills**: `POST /api/onboarding/profile`

   - Select domain and skills

3. **Education**: `POST /api/onboarding/education`

   - Add education details

4. **Experience**: `POST /api/onboarding/experience`

   - Add work experience

5. **Profile Links**: `POST /api/onboarding/profile-links`

   - Links: LinkedIn, GitHub, Behance, Portfolio, Personal Website, Twitter (all optional)

6. **Complete**: `POST /api/onboarding/complete`
   - Mark onboarding as complete

### Get Options

- **Domains & Skills**: `GET /api/options/domains-and-skills`

---

## Project Structure

```
app/
├── src/
│   ├── config/          # Environment configuration
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── db/
│   │   └── schema/      # Database table definitions
│   ├── routes/          # API route definitions
│   ├── middlewares/     # Authentication, error handling
│   └── utils/           # Helper functions
├── drizzle/
│   └── migrations/      # Database migrations
├── .env                 # Environment variables
└── package.json
```

---

## Testing

**Health Check:**

```bash
curl http://localhost:3000/health
```

**Example Response:**

```json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "uptime": 123.45,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "environment": "production"
  }
}
```

---

## Troubleshooting

### Database Issues

- Verify DATABASE_URL in `.env`
- Check internet connection (if using cloud database)

### Dependency Issues

```bash
rm -rf node_modules
bun install
```

---

## Tech Stack

- **Runtime**: Bun
- **Framework**: Elysia
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **Validation**: Elysia's built-in type system
- **Authentication**: JWT + Phone OTP (Twilio)

---

For detailed API documentation with request/response examples, check Swagger at `http://localhost:3000/swagger`
