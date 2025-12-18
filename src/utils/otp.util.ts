import { env } from "../config/env.config";

/**
 * Generate a random OTP code
 */
export const generateOTP = (): string => {
  const length = env.OTP_LENGTH;
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

/**
 * Hash OTP using Bun's built-in password hashing
 */
export const hashOTP = async (otp: string): Promise<string> => {
  return await Bun.password.hash(otp, {
    algorithm: "bcrypt",
    cost: 10,
  });
};

/**
 * Verify OTP against hash
 */
export const verifyOTP = async (otp: string, hash: string): Promise<boolean> => {
  return await Bun.password.verify(otp, hash);
};

/**
 * Calculate OTP expiry time
 */
export const getOTPExpiryTime = (): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + env.OTP_EXPIRY_MINUTES);
  return now;
};

/**
 * Check if OTP is expired
 */
export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > new Date(expiresAt);
};

/**
 * Format phone number (basic validation and formatting)
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters except +
  let formatted = phone.replace(/[^\d+]/g, "");

  // Ensure it starts with +
  if (!formatted.startsWith("+")) {
    formatted = "+" + formatted;
  }

  return formatted;
};

/**
 * Validate phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Basic validation: starts with + and has 10-15 digits
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Log OTP to console (DEV MODE ONLY)
 */
export const logOTPToConsole = (
  phoneNumber: string,
  otp: string,
  otpId: string,
  expiresAt: Date
): void => {
  if (env.isDevelopment()) {
    console.log("\n" + "=".repeat(50));
    console.log("📱 OTP GENERATED (DEV MODE)");
    console.log("=".repeat(50));
    console.log(`📞 Phone Number: ${phoneNumber}`);
    console.log(`🔑 OTP Code: ${otp}`);
    console.log(`🆔 OTP ID: ${otpId}`);
    console.log(`⏰ Expires At: ${expiresAt.toLocaleString()}`);
    console.log(`⏱️  Valid for: ${env.OTP_EXPIRY_MINUTES} minutes`);
    console.log("=".repeat(50) + "\n");
  }
};
