import { Elysia, t } from "elysia";
import { sendOTPHandler, verifyOTPHandler, resendOTPHandler } from "../controllers/otpController";

/**
 * Phone number validation schema
 */
const phoneNumberSchema = t.Object({
  phoneNumber: t.String({
    minLength: 10,
    maxLength: 20,
    error: "Phone number must be between 10 and 20 characters",
  }),
});

/**
 * Verify OTP schema
 */
const verifyOTPSchema = t.Object({
  phoneNumber: t.String({
    minLength: 10,
    maxLength: 20,
  }),
  otp: t.String({
    minLength: 6,
    maxLength: 6,
    pattern: "^[0-9]{6}$",
    error: "OTP must be 6 digits",
  }),
  otpId: t.String({
    format: "uuid",
    error: "Invalid OTP ID format",
  }),
});

/**
 * OTP routes
 */
const otpRoutes = new Elysia({ prefix: "/otp" })
  .post("/send", sendOTPHandler, {
    body: phoneNumberSchema,
    detail: {
      tags: ["Authentication"],
      summary: "Send OTP to phone number",
      description: "Generates and sends OTP to the provided phone number",
    },
  })
  .post("/verify", verifyOTPHandler, {
    body: verifyOTPSchema,
    detail: {
      tags: ["Authentication"],
      summary: "Verify OTP and login",
      description: "Verifies OTP and returns JWT token for authenticated user",
    },
  })
  .post("/resend", resendOTPHandler, {
    body: phoneNumberSchema,
    detail: {
      tags: ["Authentication"],
      summary: "Resend OTP",
      description: "Invalidates previous OTPs and sends a new one",
    },
  });

export default otpRoutes;
