import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { testConnection } from "./db";
import s3Routes from "./routes/s3.routes";
import { swagger } from "@elysiajs/swagger";
import otpRoutes from "./routes/otp.routes";
import quizRoutes from "./routes/quiz.routes";
// import authRoutes from "./routes/auth.routes";
import studentRoutes from "./routes/student.routes";
import optionsRoutes from "./routes/options.routes";
import { env, validateEnv } from "./config/env.config";
import onboardingRoutes from "./routes/onboarding.routes";
import organizationsRoutes from "./routes/organizations.routes";
import opportunitiesRoutes from "./routes/opportunities.routes";
import applicationsAdminRoutes from "./routes/applications.routes";
import quizStudentRoutes from "./routes/quizStudent.routes";
import { globalErrorHandler } from "./middlewares/errorHandler.middleware";

// Validate environment variables
validateEnv();

// Create Elysia app instance
const app = new Elysia();

// Swagger documentation
app.use(
  swagger({
    documentation: {
      info: {
        title: "Student Tribe API",
        version: "1.0.0",
        description: "API documentation for Student Tribe platform",
      },
      tags: [
        { name: "Authentication", description: "OTP-based authentication endpoints" },
        { name: "Domains & Skills", description: "Get available domains and skills" },
        { name: "Onboarding", description: "User onboarding flow endpoints" },
        { name: "Admin - Organizations", description: "Manage organizations" },
        { name: "Admin - Opportunities", description: "Manage job/internship opportunities" },
        { name: "Admin - Applications", description: "Manage opportunity applications" },
        { name: "Admin - Quizzes", description: "Manage quizzes" },
        { name: "Admin - Quiz Questions", description: "Manage quiz questions" },
        { name: "Admin - Quiz Attempts", description: "View student quiz attempts" },
        { name: "Student - Opportunities", description: "Browse and apply to opportunities" },
        { name: "Student - Quizzes", description: "Take quizzes and view results" },
        { name: "Student - Quiz Attempts", description: "View your quiz attempt history" },
        { name: "S3", description: "File upload utilities" },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  })
);

// Global error handler
// @ts-ignore
app.onError(globalErrorHandler);

// CORS middleware
app.use(cors());

// Health check endpoint
app.get("/health", () => ({
  success: true,
  message: "Server is healthy",
  data: {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  },
}));

// API routes
app.group("/api", (app) =>
  app
    .use(otpRoutes)
    .use(optionsRoutes)
    .use(onboardingRoutes)
    // .use(authRoutes)
    .use(s3Routes)
    .use(studentRoutes)
    .use(quizStudentRoutes)
    .group("/admin", (app) =>
      app
        .use(organizationsRoutes)
        .use(opportunitiesRoutes)
        .use(applicationsAdminRoutes)
        .use(quizRoutes)
    )
);

// 404 handler
app.all("*", () => {
  throw new Error("Route not found");
});

// Start server
app.listen(env.PORT);

// Test database connection on startup
testConnection().then((connected) => {
  if (!connected) {
    console.warn("⚠️  Server started but database connection failed");
  }
});

console.log(`🦊 Elysia is running at http://localhost:${env.PORT}`);
console.log(`📝 Environment: ${env.NODE_ENV}`);
console.log(`🔗 Health check: http://localhost:${env.PORT}/health`);
console.log(`📚 Swagger docs: http://localhost:${env.PORT}/swagger`);
