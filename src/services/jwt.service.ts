import { env } from "../config/env.config";
import { UnauthorizedError } from "../utils/errors.util";

/**
 * JWT Payload interface
 */
export interface JWTPayload {
  userId: string;
  phoneNumber: string;
  phoneVerified: boolean;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token for user
 * Using simple base64 encoding for dev mode
 * In production, use proper JWT library
 */
export const generateToken = async (payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> => {
  const tokenData = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };

  // Simple base64 encoding for dev mode
  return Buffer.from(JSON.stringify(tokenData)).toString("base64");
};

/**
 * Verify and decode JWT token
 */
export const verifyToken = async (token: string): Promise<JWTPayload> => {
  try {
    // Decode base64 token
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const payload = JSON.parse(decoded) as JWTPayload;

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedError("Token expired");
    }

    if (!payload.userId || !payload.phoneNumber) {
      throw new UnauthorizedError("Invalid token payload");
    }

    return payload;
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    throw new UnauthorizedError("Invalid or expired token");
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader?: string): string => {
  if (!authHeader) {
    throw new UnauthorizedError("Authorization header missing");
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new UnauthorizedError("Invalid authorization header format");
  }

  return parts[1];
};
