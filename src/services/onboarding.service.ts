import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema/users.schema";
import { userSkills } from "../db/schema/userSkills.schema";
import { userEducation, type NewUserEducation } from "../db/schema/education.schema";
import { userExperience, type NewUserExperience } from "../db/schema/experience.schema";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/errors.util";
import { sanitizeString } from "../utils/sanitization.util";

export const updateBasicInfo = async (
  userId: string,
  displayName: string,
  username: string,
  email: string,
  profileImage?: string
) => {
  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedUsername = username.trim().toLowerCase();

  // Check if email already exists
  const [existingEmailUser] = await db.select().from(users).where(eq(users.email, sanitizedEmail));

  if (existingEmailUser && existingEmailUser.id !== userId) {
    throw ConflictError("Email already in use");
  }

  // Check if username already exists
  const [existingUsernameUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, sanitizedUsername));

  if (existingUsernameUser && existingUsernameUser.id !== userId) {
    throw ConflictError("Username already taken");
  }

  // Validate username format (alphanumeric, underscore, dash only)
  const usernameRegex = /^[a-z0-9_-]{3,30}$/;
  if (!usernameRegex.test(sanitizedUsername)) {
    throw BadRequestError(
      "Username must be 3-30 characters and contain only letters, numbers, underscores, and dashes"
    );
  }

  const updateData: any = {
    displayName: sanitizeString(displayName),
    username: sanitizedUsername,
    email: sanitizedEmail,
    onboardingStep: 2,
    updatedAt: new Date(),
  };

  if (profileImage) {
    updateData.profileImage = profileImage;
  }

  const [updatedUser] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning();

  if (!updatedUser) {
    throw NotFoundError("User not found");
  }

  return {
    userId: updatedUser.id,
    displayName: updatedUser.displayName,
    username: updatedUser.username,
    email: updatedUser.email,
    onboardingStep: updatedUser.onboardingStep,
  };
};

export const updateProfile = async (userId: string, domainId: string, skillIds: string[]) => {
  if (!skillIds || skillIds.length === 0) {
    throw BadRequestError("At least one skill is required");
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      domainId,
      onboardingStep: 3,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  if (!updatedUser) {
    throw NotFoundError("User not found");
  }

  await db.delete(userSkills).where(eq(userSkills.userId, userId));

  const skillRecords = skillIds.map((skillId) => ({
    userId,
    skillId,
  }));

  await db.insert(userSkills).values(skillRecords);

  return {
    userId: updatedUser.id,
    domainId: updatedUser.domainId,
    skillIds,
    onboardingStep: updatedUser.onboardingStep,
  };
};

export const addEducation = async (
  userId: string,
  educationData: Omit<NewUserEducation, "userId" | "id" | "createdAt">
) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    throw NotFoundError("User not found");
  }

  const sanitizedData = {
    degree: sanitizeString(educationData.degree),
    institution: sanitizeString(educationData.institution),
    fieldOfStudy: sanitizeString(educationData.fieldOfStudy),
    startYear: educationData.startYear,
    endYear: educationData.endYear,
    current: educationData.current,
  };

  const [education] = await db
    .insert(userEducation)
    .values({
      userId,
      ...sanitizedData,
    })
    .returning();

  await db
    .update(users)
    .set({
      onboardingStep: 4,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return {
    id: education.id,
    degree: education.degree,
    institution: education.institution,
    fieldOfStudy: education.fieldOfStudy,
    startYear: education.startYear,
    endYear: education.endYear,
    current: education.current,
    onboardingStep: 4,
  };
};

export const addExperience = async (
  userId: string,
  experienceData: Omit<NewUserExperience, "userId" | "id" | "createdAt">
) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    throw NotFoundError("User not found");
  }

  const sanitizedData = {
    title: sanitizeString(experienceData.title),
    company: sanitizeString(experienceData.company),
    location: experienceData.location ? sanitizeString(experienceData.location) : undefined,
    startDate: experienceData.startDate,
    endDate: experienceData.endDate,
    current: experienceData.current,
    description: experienceData.description
      ? sanitizeString(experienceData.description)
      : undefined,
  };

  const [experience] = await db
    .insert(userExperience)
    .values({
      userId,
      ...sanitizedData,
    })
    .returning();

  await db
    .update(users)
    .set({
      onboardingStep: 5,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return {
    id: experience.id,
    title: experience.title,
    company: experience.company,
    location: experience.location,
    startDate: experience.startDate,
    endDate: experience.endDate,
    current: experience.current,
    description: experience.description,
    onboardingStep: 5,
  };
};

export const completeOnboarding = async (userId: string) => {
  const [updatedUser] = await db
    .update(users)
    .set({
      onboardingComplete: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  if (!updatedUser) {
    throw NotFoundError("User not found");
  }

  return {
    userId: updatedUser.id,
    onboardingComplete: updatedUser.onboardingComplete,
  };
};

export const getOnboardingStatus = async (userId: string) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    throw NotFoundError("User not found");
  }

  const steps = [
    user.phoneVerified,
    user.displayName && user.username && user.email,
    user.domainId,
    user.onboardingStep >= 4,
    user.onboardingStep >= 5,
    user.onboardingStep >= 6,
  ];

  const completedSteps = steps.filter(Boolean).length;
  const profileCompletion = Math.round((completedSteps / steps.length) * 100);

  const stepNames = [];
  if (user.phoneVerified) stepNames.push("phone_verified");
  if (user.displayName && user.username && user.email) stepNames.push("basic_info");
  if (user.domainId) stepNames.push("profile");
  if (user.onboardingStep >= 4) stepNames.push("education");
  if (user.onboardingStep >= 5) stepNames.push("experience");
  if (user.onboardingStep >= 6) stepNames.push("profile_links");

  const pendingSteps = [];
  if (!user.phoneVerified) pendingSteps.push("phone_verified");
  if (!user.displayName || !user.username || !user.email) pendingSteps.push("basic_info");
  if (!user.domainId) pendingSteps.push("profile");
  if (user.onboardingStep < 4) pendingSteps.push("education");
  if (user.onboardingStep < 5) pendingSteps.push("experience");
  if (user.onboardingStep < 6) pendingSteps.push("profile_links");

  return {
    userId: user.id,
    currentStep: user.onboardingStep,
    completedSteps: stepNames,
    pendingSteps,
    onboardingComplete: user.onboardingComplete,
    profileCompletion,
  };
};
