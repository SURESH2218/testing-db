import type { Context } from "elysia";
import { successResponse } from "../utils/response.util";
import { generatePresignedUrl } from "../services/s3.service";
import type { SuccessResponse } from "../types/response.types";

interface PresignedUrlBody {
  fileName: string;
  fileType: string;
  folder: string;
}

export const getPresignedUrl = async (context: Context): Promise<SuccessResponse> => {
  const body = context.body as PresignedUrlBody;
  const result = await generatePresignedUrl(body.fileName, body.fileType, body.folder);
  return successResponse(result, "Presigned URL generated successfully");
};
