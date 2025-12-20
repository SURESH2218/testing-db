import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { env } from "../config/env.config";
import { UnauthorizedError } from "../utils/errors.util";

/**
 * JWT Payload interface
 */
export interface JWTPayload {
  userId: string;
  phoneNumber: string;
  phoneVerified: boolean;
}

/**
 * JWT instance
 */
const app = new Elysia().use(
  jwt({
    name: "jwt",
    secret: env.JWT_SECRET,
    exp: env.JWT_EXPIRES_IN,
  })
);

const jwtMethods = app.decorator.jwt;

/**
 * Generate JWT token
 */
export const generateToken = async (payload: JWTPayload): Promise<string> => {
  return await jwtMethods.sign(payload as any);
};

/**
 * Verify JWT token
 */
export const verifyToken = async (token: string): Promise<JWTPayload> => {
  try {
    const payload = await jwtMethods.verify(token);

    if (!payload) {
      throw UnauthorizedError("Invalid token");
    }

    const { userId, phoneNumber, phoneVerified } = payload as any;

    if (!userId || !phoneNumber) {
      throw UnauthorizedError("Invalid token payload");
    }

    return { userId, phoneNumber, phoneVerified };
  } catch (error: any) {
    if (error.statusCode && error.errorCode) {
      throw error;
    }
    throw UnauthorizedError("Invalid or expired token");
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader: string | null): string => {
  if (!authHeader) {
    throw UnauthorizedError("Authorization header missing");
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw UnauthorizedError("Invalid authorization header format");
  }

  return parts[1];
};
