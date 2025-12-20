import type { Context } from "elysia";
import * as userSocialLinksService from "../services/userProfileLinks.service";
import { successResponse } from "../utils/response.util";
import type { SuccessResponse } from "../types/response.types";

interface AddSocialLinksBody {
  linkedinUrl?: string;
  githubUrl?: string;
  behanceUrl?: string;
  portfolioUrl?: string;
  personalWebsite?: string;
  twitterUrl?: string;
}

export const addOrUpdateSocialLinksHandler = async (context: any): Promise<SuccessResponse> => {
  const body = context.body as AddSocialLinksBody;
  const result = await userSocialLinksService.addOrUpdateProfileLinks(context.user.id, body);
  return successResponse(result, "Social links updated successfully");
};

export const getSocialLinksHandler = async (context: any): Promise<SuccessResponse> => {
  const result = await userSocialLinksService.getProfileLinks(context.user.id);
  return successResponse(result, "Social links fetched successfully");
};

export const getSocialLinksByUsernameHandler = async (
  context: Context
): Promise<SuccessResponse> => {
  const { username } = context.params as { username: string };
  const result = await userSocialLinksService.getProfileLinksByUsername(username);
  return successResponse(result, "Social links fetched successfully");
};
