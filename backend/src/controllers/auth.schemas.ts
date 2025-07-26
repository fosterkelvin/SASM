import { z } from "zod";

export const emailSchema = z.string().email().min(5).max(50);
const passwordSchema = z.string().min(8).max(50);

export const signinSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: z.string().optional(),
});

export const signupSchema = signinSchema
  .extend({
    firstname: z.string().min(2).max(50),
    lastname: z.string().min(2).max(50),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const verificationCodeSchema = z.string().min(6).max(24);

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  verificationCode: verificationCodeSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

export const changeEmailSchema = z.object({
  newEmail: emailSchema,
});
