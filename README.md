# 🎓 Student Tribe API

Backend API for student community platform built with **Elysia.js** and **Bun**.

## ✨ Features

- 🔐 **OTP Authentication** with Twilio SMS
- 👥 **User Management** (Admin/Student roles)
- 📝 **Multi-step Onboarding** (Profile, Education, Experience, Skills, Links)
- 🏢 **Organizations Management**
- 💼 **Job Opportunities** (Full-time, Part-time, Internship, Gig)
- 📄 **Application System** with status tracking
- 📚 **Quiz System** with auto-grading
- ☁️ **AWS S3 Integration** for file uploads
- 📖 **Swagger Documentation**
- 🛡️ **Security** (Input sanitization, JWT, Auth middleware)

---

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed
- PostgreSQL database

### Installation

```bash
# Install dependencies
bun install

# Create .env file (see SETUP.md for details)
# Add DATABASE_URL, JWT_SECRET, Twilio keys, AWS keys

# Setup database
bun run db:push

# Start server
bun run dev
```

Server starts at: **http://localhost:3000**  
Swagger docs: **http://localhost:3000/swagger**

---

## 📂 Project Structure

```
app/
├── src/
│   ├── config/          # Environment configuration
│   ├── controllers/     # Request handlers
│   ├── db/schema/       # Database schemas
│   ├── middlewares/     # Auth, Admin, Error handling
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── utils/           # Helper functions
├── drizzle/             # Database migrations
└── package.json
```

---

## 🛠️ Available Commands

```bash
# Development
bun run dev              # Start with hot reload

# Production
bun run start            # Start server

# Database
bun run db:push          # Apply schema changes
bun run db:generate      # Generate migration files
bun run db:studio        # Open database GUI
bun run db:seed          # Seed test data
```

---

## 🔐 API Endpoints

### Authentication

- `POST /api/otp/send` - Send OTP to phone
- `POST /api/otp/verify` - Verify OTP and get JWT token
- `POST /api/otp/resend` - Resend OTP

### Onboarding (Requires JWT)

- `POST /api/onboarding/basic-info` - Add display name, username, email, profile image
- `POST /api/onboarding/profile` - Select domain and skills
- `POST /api/onboarding/education` - Add education details
- `POST /api/onboarding/experience` - Add work experience
- `POST /api/onboarding/profile-links` - Add LinkedIn, GitHub, Behance, Portfolio, etc.
- `POST /api/onboarding/complete` - Complete onboarding
- `GET /api/onboarding/status` - Get progress

### Organizations (Admin)

- `POST /api/admin/organizations` - Create organization
- `GET /api/admin/organizations` - List organizations
- `GET /api/admin/organizations/:id` - Get details
- `PUT /api/admin/organizations/:id` - Update
- `DELETE /api/admin/organizations/:id` - Delete

### Opportunities (Admin)

- `POST /api/admin/opportunities` - Create opportunity
- `GET /api/admin/opportunities` - List opportunities
- `GET /api/admin/opportunities/:id` - Get details
- `PUT /api/admin/opportunities/:id` - Update
- `DELETE /api/admin/opportunities/:id` - Delete

### Opportunities (Student)

- `GET /api/opportunities` - Browse opportunities
- `GET /api/opportunities/:id` - View details
- `POST /api/opportunities/:id/apply` - Apply
- `GET /api/my-applications` - View applications

### Applications (Admin)

- `GET /api/admin/applications` - View all applications
- `GET /api/admin/applications/:id` - View details
- `PATCH /api/admin/applications/:id/status` - Update status

### Quizzes (Admin)

- `POST /api/admin/quizzes` - Create quiz
- `GET /api/admin/quizzes` - List quizzes
- `POST /api/admin/quizzes/:id/questions` - Add question
- `GET /api/admin/quizzes/:id/attempts` - View attempts

### Quizzes (Student)

- `GET /api/quizzes` - List active quizzes
- `GET /api/quizzes/:id/questions` - Get questions
- `POST /api/quizzes/:id/submit` - Submit answers
- `GET /api/quizzes/my-attempts` - View attempts

### File Upload

- `POST /api/s3/presigned-url` - Get S3 upload URL

### Options

- `GET /api/options/domains-and-skills` - Get domains and skills

---

## 🏗️ Tech Stack

- **Runtime:** Bun
- **Framework:** Elysia.js
- **Database:** PostgreSQL (Neon)
- **ORM:** Drizzle ORM
- **Authentication:** JWT + OTP (Twilio)
- **File Storage:** AWS S3
- **Documentation:** Swagger/OpenAPI

---

## 🛡️ Security

✅ JWT authentication  
✅ Role-based access (Admin/Student)  
✅ Input sanitization  
✅ S3 URL validation  
✅ OTP rate limiting  
✅ CORS enabled  
✅ Global error handling

---

## 📊 Database Schema

### Core Tables

- `users` - User accounts with profile
- `domains` - Study domains
- `skills` - Available skills
- `user_skills` - User-skill mapping
- `user_profile_links` - Social/portfolio links

### Onboarding

- `user_education` - Education records
- `user_experience` - Work experience
- `otp_verifications` - OTP tracking

### Organizations & Opportunities

- `organizations` - Companies
- `opportunities` - Job postings
- `opportunity_applications` - Applications

### Quizzes

- `quizzes` - Quiz metadata
- `quiz_questions` - Questions with options
- `quiz_attempts` - Student submissions

---

## 📖 Documentation

### Swagger UI

Interactive API documentation: **http://localhost:3000/swagger**

### Setup Guide

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Authentication

Most endpoints require JWT token:

```
Authorization: Bearer <your-jwt-token>
```

Get token by verifying OTP via `/api/otp/verify`

---

## 📝 Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  },
  "timestamp": "2025-12-20T12:00:00.000Z",
  "path": "/api/endpoint"
}
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Happy Coding! 🚀**
