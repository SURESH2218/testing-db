import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema/users.schema";
import { userProfileLinks, type NewUserProfileLinks } from "../db/schema/userProfileLinks.schema";
import { NotFoundError, BadRequestError } from "../utils/errors.util";

const URL_REGEX = /^https?:\/\/.+/i;

const validateUrl = (url: string | undefined | null, fieldName: string) => {
  if (url && !URL_REGEX.test(url)) {
    throw BadRequestError(
      `Invalid ${fieldName}. Must be a valid URL starting with http:// or https://`
    );
  }
};

export const addOrUpdateProfileLinks = async (
  userId: string,
  profileLinksData: Omit<NewUserProfileLinks, "userId" | "id" | "createdAt" | "updatedAt">
) => {
  // Verify user exists
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    throw NotFoundError("User not found");
  }

  // Validate all URLs
  validateUrl(profileLinksData.linkedinUrl, "LinkedIn URL");
  validateUrl(profileLinksData.githubUrl, "GitHub URL");
  validateUrl(profileLinksData.behanceUrl, "Behance URL");
  validateUrl(profileLinksData.portfolioUrl, "Portfolio URL");
  validateUrl(profileLinksData.personalWebsite, "Personal Website URL");
  validateUrl(profileLinksData.twitterUrl, "Twitter URL");

  // Check if profile links already exist for this user
  const [existingLinks] = await db
    .select()
    .from(userProfileLinks)
    .where(eq(userProfileLinks.userId, userId));

  let result;

  if (existingLinks) {
    // Update existing profile links
    const [updated] = await db
      .update(userProfileLinks)
      .set({
        linkedinUrl: profileLinksData.linkedinUrl,
        githubUrl: profileLinksData.githubUrl,
        behanceUrl: profileLinksData.behanceUrl,
        portfolioUrl: profileLinksData.portfolioUrl,
        personalWebsite: profileLinksData.personalWebsite,
        twitterUrl: profileLinksData.twitterUrl,
        updatedAt: new Date(),
      })
      .where(eq(userProfileLinks.userId, userId))
      .returning();

    result = updated;
  } else {
    // Insert new profile links
    const [inserted] = await db
      .insert(userProfileLinks)
      .values({
        userId,
        linkedinUrl: profileLinksData.linkedinUrl,
        githubUrl: profileLinksData.githubUrl,
        behanceUrl: profileLinksData.behanceUrl,
        portfolioUrl: profileLinksData.portfolioUrl,
        personalWebsite: profileLinksData.personalWebsite,
        twitterUrl: profileLinksData.twitterUrl,
      })
      .returning();

    result = inserted;
  }

  // Update user onboarding step to 6 (profile links completed)
  await db
    .update(users)
    .set({
      onboardingStep: 6,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return {
    id: result.id,
    linkedinUrl: result.linkedinUrl,
    githubUrl: result.githubUrl,
    behanceUrl: result.behanceUrl,
    portfolioUrl: result.portfolioUrl,
    personalWebsite: result.personalWebsite,
    twitterUrl: result.twitterUrl,
    onboardingStep: 6,
  };
};

export const getProfileLinks = async (userId: string) => {
  const [profileLinks] = await db
    .select()
    .from(userProfileLinks)
    .where(eq(userProfileLinks.userId, userId));

  if (!profileLinks) {
    throw NotFoundError("Profile links not found");
  }

  return profileLinks;
};

export const getProfileLinksByUsername = async (username: string) => {
  // Join users and profile links to avoid N+1 query
  const result = await db
    .select({
      id: userProfileLinks.id,
      linkedinUrl: userProfileLinks.linkedinUrl,
      githubUrl: userProfileLinks.githubUrl,
      behanceUrl: userProfileLinks.behanceUrl,
      portfolioUrl: userProfileLinks.portfolioUrl,
      personalWebsite: userProfileLinks.personalWebsite,
      twitterUrl: userProfileLinks.twitterUrl,
      userId: users.id,
      displayName: users.displayName,
      username: users.username,
    })
    .from(userProfileLinks)
    .innerJoin(users, eq(userProfileLinks.userId, users.id))
    .where(eq(users.username, username))
    .limit(1);

  if (!result.length) {
    throw NotFoundError("User or profile links not found");
  }

  return result[0];
};
