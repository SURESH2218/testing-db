import * as otpService from "../services/otp.service";
import { successResponse } from "../utils/response.util";

/**
 * Send OTP to phone number
 */
export const sendOTPHandler = async ({ body }: { body: { phoneNumber: string } }) => {
  const result = await otpService.sendOTP(body.phoneNumber);

  return successResponse(result, "OTP sent successfully");
};

/**
 * Verify OTP and login
 */
export const verifyOTPHandler = async ({
  body,
}: {
  body: { phoneNumber: string; otp: string; otpId: string };
}) => {
  const result = await otpService.verifyOTPAndLogin(body.phoneNumber, body.otp, body.otpId);

  return successResponse(result, "Phone verified successfully");
};

/**
 * Resend OTP
 */
export const resendOTPHandler = async ({ body }: { body: { phoneNumber: string } }) => {
  const result = await otpService.resendOTP(body.phoneNumber);

  return successResponse(result, "OTP resent successfully");
};
