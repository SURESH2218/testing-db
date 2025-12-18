import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { otpVerifications, type OtpVerification } from "../db/schema/otp.schema";
import { users, type User } from "../db/schema/users.schema";
import { env } from "../config/env.config";
import {
  generateOTP,
  hashOTP,
  verifyOTP,
  getOTPExpiryTime,
  isOTPExpired,
  formatPhoneNumber,
  isValidPhoneNumber,
  logOTPToConsole,
} from "../utils/otp.util";
import {
  ValidationError,
  BadRequestError,
  NotFoundError,
  DatabaseError,
} from "../utils/errors.util";
import { generateToken } from "./jwt.service";

/**
 * Send OTP to phone number
 */
export const sendOTP = async (phoneNumber: string) => {
  // Format and validate phone number
  const formattedPhone = formatPhoneNumber(phoneNumber);

  if (!isValidPhoneNumber(formattedPhone)) {
    throw new ValidationError("Invalid phone number format");
  }

  // Check rate limiting
  const since = new Date();
  since.setMinutes(since.getMinutes() - env.OTP_RATE_LIMIT_MINUTES);

  const recentOTPs = await db
    .select()
    .from(otpVerifications)
    .where(
      and(eq(otpVerifications.phoneNumber, formattedPhone), gte(otpVerifications.createdAt, since))
    );

  if (recentOTPs.length >= env.OTP_MAX_REQUESTS) {
    throw new BadRequestError(
      `Too many OTP requests. Please try again after ${env.OTP_RATE_LIMIT_MINUTES} minutes`
    );
  }

  // Generate OTP
  const otp = generateOTP();
  const otpHash = await hashOTP(otp);
  const expiresAt = getOTPExpiryTime();

  // Save OTP to database
  const [otpRecord] = await db
    .insert(otpVerifications)
    .values({
      phoneNumber: formattedPhone,
      otpHash,
      expiresAt,
    })
    .returning();

  // Log OTP to console (DEV MODE)
  logOTPToConsole(formattedPhone, otp, otpRecord.otpId, expiresAt);

  // TODO: In production, send OTP via SMS service (Twilio, MSG91, etc.)

  return {
    phoneNumber: formattedPhone,
    otpId: otpRecord.otpId,
    expiresIn: env.OTP_EXPIRY_MINUTES * 60, // in seconds
  };
};

/**
 * Verify OTP and return user token
 */
export const verifyOTPAndLogin = async (phoneNumber: string, otp: string, otpId: string) => {
  // Format phone number
  const formattedPhone = formatPhoneNumber(phoneNumber);

  // Find valid OTP record
  const now = new Date();
  const [otpRecord] = await db
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.phoneNumber, formattedPhone),
        eq(otpVerifications.otpId, otpId),
        eq(otpVerifications.verified, false),
        gte(otpVerifications.expiresAt, now)
      )
    );

  if (!otpRecord) {
    throw new NotFoundError("OTP not found or expired");
  }

  // Check if expired
  if (isOTPExpired(otpRecord.expiresAt)) {
    throw new BadRequestError("OTP has expired");
  }

  // Check max attempts
  if (otpRecord.attempts >= env.OTP_MAX_ATTEMPTS) {
    throw new BadRequestError("Maximum verification attempts exceeded. Please request a new OTP");
  }

  // Verify OTP
  const isValid = await verifyOTP(otp, otpRecord.otpHash);

  if (!isValid) {
    // Increment attempts
    await db
      .update(otpVerifications)
      .set({ attempts: sql`${otpVerifications.attempts} + 1` })
      .where(eq(otpVerifications.id, otpRecord.id));

    const remainingAttempts = env.OTP_MAX_ATTEMPTS - (otpRecord.attempts + 1);

    throw new BadRequestError(`Invalid OTP. ${remainingAttempts} attempt(s) remaining`);
  }

  // Mark OTP as verified
  await db
    .update(otpVerifications)
    .set({ verified: true })
    .where(eq(otpVerifications.id, otpRecord.id));

  // Create or update user
  const [existingUser] = await db.select().from(users).where(eq(users.phoneNumber, formattedPhone));

  let user: User;

  if (existingUser) {
    // Update phone verification status
    const [updatedUser] = await db
      .update(users)
      .set({
        phoneVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.phoneNumber, formattedPhone))
      .returning();

    user = updatedUser;
  } else {
    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        phoneNumber: formattedPhone,
        phoneVerified: true,
        onboardingStep: 1,
      })
      .returning();

    user = newUser;
  }

  // Check if user is new (for onboarding flow)
  const isNewUser = !user.name || !user.email || !user.onboardingComplete;

  // Generate JWT token
  const token = await generateToken({
    userId: user.id,
    phoneNumber: user.phoneNumber,
    phoneVerified: user.phoneVerified,
  });

  // Delete OTP record (security best practice)
  await db.delete(otpVerifications).where(eq(otpVerifications.id, otpRecord.id));

  return {
    token,
    userId: user.id,
    phoneNumber: user.phoneNumber,
    phoneVerified: user.phoneVerified,
    isNewUser,
    onboardingComplete: user.onboardingComplete,
    onboardingStep: user.onboardingStep,
  };
};

/**
 * Resend OTP
 */
export const resendOTP = async (phoneNumber: string) => {
  // Format phone number
  const formattedPhone = formatPhoneNumber(phoneNumber);

  if (!isValidPhoneNumber(formattedPhone)) {
    throw new ValidationError("Invalid phone number format");
  }

  // Check rate limiting
  const since = new Date();
  since.setMinutes(since.getMinutes() - env.OTP_RATE_LIMIT_MINUTES);

  const recentOTPs = await db
    .select()
    .from(otpVerifications)
    .where(
      and(eq(otpVerifications.phoneNumber, formattedPhone), gte(otpVerifications.createdAt, since))
    );

  if (recentOTPs.length >= env.OTP_MAX_REQUESTS) {
    throw new BadRequestError(
      `Too many OTP requests. Please try again after ${env.OTP_RATE_LIMIT_MINUTES} minutes`
    );
  }

  // Invalidate all previous OTPs for this phone
  await db
    .update(otpVerifications)
    .set({ verified: true })
    .where(eq(otpVerifications.phoneNumber, formattedPhone));

  // Generate new OTP
  const otp = generateOTP();
  const otpHash = await hashOTP(otp);
  const expiresAt = getOTPExpiryTime();

  // Save new OTP to database
  const [otpRecord] = await db
    .insert(otpVerifications)
    .values({
      phoneNumber: formattedPhone,
      otpHash,
      expiresAt,
    })
    .returning();

  // Log OTP to console (DEV MODE)
  logOTPToConsole(formattedPhone, otp, otpRecord.otpId, expiresAt);

  // TODO: In production, send OTP via SMS service

  return {
    phoneNumber: formattedPhone,
    otpId: otpRecord.otpId,
    expiresIn: env.OTP_EXPIRY_MINUTES * 60,
  };
};
