import { Elysia, t } from "elysia";
import { authPlugin } from "../middlewares/auth.middleware";
import {
  updateBasicInfoHandler,
  updateProfileHandler,
  addEducationHandler,
  addExperienceHandler,
  completeOnboardingHandler,
  getOnboardingStatusHandler,
} from "../controllers/onboardingController";
import {
  addOrUpdateSocialLinksHandler,
  getSocialLinksHandler,
} from "../controllers/userProfileLinksController";

const onboardingRoutes = new Elysia({ prefix: "/onboarding" })
  .use(authPlugin)
  .post("/basic-info", updateBasicInfoHandler, {
    body: t.Object({
      displayName: t.String({
        minLength: 2,
        maxLength: 255,
        description: "Display name (shown publicly)",
      }),
      username: t.String({
        minLength: 3,
        maxLength: 30,
        pattern: "^[a-z0-9_-]+$",
        description: "Unique username (lowercase, alphanumeric, underscore, dash only)",
      }),
      email: t.String({ format: "email", description: "Email address" }),
      profileImage: t.Optional(
        t.String({
          format: "uri",
          maxLength: 500,
          description: "Profile image URL from S3 (optional)",
        })
      ),
    }),
    detail: {
      tags: ["Onboarding"],
      summary: "Update basic user info",
      description:
        "Update user's display name, username, email, and profile image. User ID is extracted from JWT token.",
      security: [{ BearerAuth: [] }],
    },
  })
  .post("/profile", updateProfileHandler, {
    body: t.Object({
      domainId: t.String({ format: "uuid", description: "Selected domain/field ID" }),
      skillIds: t.Array(t.String({ format: "uuid" }), {
        minItems: 1,
        maxItems: 20,
        description: "Array of skill IDs (1-20 skills)",
      }),
    }),
    detail: {
      tags: ["Onboarding"],
      summary: "Update user domain and skills",
      description: "Update user's domain and skills. User ID is extracted from JWT token.",
      security: [{ BearerAuth: [] }],
    },
  })
  .post("/education", addEducationHandler, {
    body: t.Object({
      degree: t.String({ minLength: 2, maxLength: 255, description: "Degree name (e.g., B.Tech)" }),
      institution: t.String({ minLength: 2, maxLength: 255, description: "Institution name" }),
      fieldOfStudy: t.String({
        minLength: 2,
        maxLength: 255,
        description: "Field of study (e.g., Computer Science)",
      }),
      startYear: t.Number({
        minimum: 1950,
        maximum: 2100,
        description: "Start year (e.g., 2020)",
      }),
      endYear: t.Optional(
        t.Number({ minimum: 1950, maximum: 2100, description: "End year (leave empty if current)" })
      ),
      current: t.Boolean({ default: false, description: "Currently studying?" }),
    }),
    detail: {
      tags: ["Onboarding"],
      summary: "Add education record",
      description: "Add education details to user profile. User ID is extracted from JWT token.",
      security: [{ BearerAuth: [] }],
    },
  })
  .post("/experience", addExperienceHandler, {
    body: t.Object({
      title: t.String({ minLength: 2, maxLength: 255, description: "Job title" }),
      company: t.String({ minLength: 2, maxLength: 255, description: "Company name" }),
      location: t.Optional(t.String({ maxLength: 255, description: "Location (city, country)" })),
      startDate: t.String({
        pattern: "^\\d{4}-\\d{2}$",
        description: "Start date in YYYY-MM format",
      }),
      endDate: t.Optional(
        t.String({ pattern: "^\\d{4}-\\d{2}$", description: "End date (leave empty if current)" })
      ),
      current: t.Boolean({ default: false, description: "Currently working here?" }),
      description: t.Optional(t.String({ maxLength: 2000, description: "Job description" })),
    }),
    detail: {
      tags: ["Onboarding"],
      summary: "Add work experience",
      description: "Add work experience to user profile. User ID is extracted from JWT token.",
      security: [{ BearerAuth: [] }],
    },
  })
  .post("/profile-links", addOrUpdateSocialLinksHandler, {
    body: t.Object({
      linkedinUrl: t.Optional(
        t.String({ maxLength: 500, description: "LinkedIn profile URL (optional)" })
      ),
      githubUrl: t.Optional(
        t.String({ maxLength: 500, description: "GitHub profile URL (optional)" })
      ),
      behanceUrl: t.Optional(
        t.String({ maxLength: 500, description: "Behance profile URL (optional)" })
      ),
      portfolioUrl: t.Optional(
        t.String({ maxLength: 500, description: "Portfolio website URL (optional)" })
      ),
      personalWebsite: t.Optional(
        t.String({ maxLength: 500, description: "Personal website URL (optional)" })
      ),
      twitterUrl: t.Optional(
        t.String({ maxLength: 500, description: "Twitter/X profile URL (optional)" })
      ),
    }),
    detail: {
      tags: ["Onboarding"],
      summary: "Add or update profile links",
      description:
        "Add or update professional profile and portfolio links. User ID is extracted from JWT token.",
      security: [{ BearerAuth: [] }],
    },
  })
  .get("/profile-links", getSocialLinksHandler, {
    detail: {
      tags: ["Onboarding"],
      summary: "Get profile links",
      description:
        "Get user's professional profile and portfolio links. User ID is extracted from JWT token.",
      security: [{ BearerAuth: [] }],
    },
  })
  .post("/complete", completeOnboardingHandler, {
    detail: {
      tags: ["Onboarding"],
      summary: "Complete onboarding",
      description: "Mark user onboarding as complete. User ID is extracted from JWT token.",
      security: [{ BearerAuth: [] }],
    },
  })
  .get("/status", getOnboardingStatusHandler, {
    detail: {
      tags: ["Onboarding"],
      summary: "Get onboarding status",
      description:
        "Get current onboarding progress and completion status. User ID is extracted from JWT token.",
      security: [{ BearerAuth: [] }],
    },
  });

export default onboardingRoutes;
