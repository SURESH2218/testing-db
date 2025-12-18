import { pgTable, varchar, timestamp, uuid, boolean, integer } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

/**
 * Users table schema
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull().unique(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  password: varchar("password", { length: 255 }),
  domain: varchar("domain", { length: 100 }),
  onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
  onboardingStep: integer("onboarding_step").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type inference for TypeScript
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
