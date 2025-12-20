import type { Context } from "elysia";
import { successResponse, messageResponse } from "../utils/response.util";
import * as organizationsService from "../services/organizations.service";
import type { SuccessResponse } from "../types/response.types";

interface CreateOrganizationBody {
  title: string;
  description: string;
  type: "non-profit" | "for-profit" | "ngo" | "public" | "private" | "ppp";
  city: string;
  logo?: string;
}

interface UpdateOrganizationBody {
  title?: string;
  description?: string;
  type?: "non-profit" | "for-profit" | "ngo" | "public" | "private" | "ppp";
  city?: string;
  logo?: string;
}

interface AuthenticatedContext extends Context {
  user: {
    id: string;
    phoneNumber: string;
    role: string;
  };
}

export const createOrganization = async (
  context: AuthenticatedContext
): Promise<SuccessResponse> => {
  const body = context.body as CreateOrganizationBody;
  const organization = await organizationsService.createOrganization({
    ...body,
    createdById: context.user.id,
  });
  return successResponse(organization, "Organization created successfully");
};

export const getAllOrganizations = async (): Promise<SuccessResponse> => {
  const organizations = await organizationsService.getAllOrganizations();
  return successResponse(organizations, "Organizations fetched successfully");
};

export const getOrganizationById = async (context: Context): Promise<SuccessResponse> => {
  const { id } = context.params as { id: string };
  const organization = await organizationsService.getOrganizationById(id);
  return successResponse(organization, "Organization fetched successfully");
};

export const updateOrganization = async (context: Context): Promise<SuccessResponse> => {
  const { id } = context.params as { id: string };
  const body = context.body as UpdateOrganizationBody;
  const organization = await organizationsService.updateOrganization(id, body);
  return successResponse(organization, "Organization updated successfully");
};

export const deleteOrganization = async (context: Context): Promise<SuccessResponse> => {
  const { id } = context.params as { id: string };
  await organizationsService.deleteOrganization(id);
  return messageResponse("Organization deleted successfully");
};
