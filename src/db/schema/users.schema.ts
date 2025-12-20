import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  boolean,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { domains } from "./domains.schema";

export const userRoleEnum = pgEnum("user_role", ["student", "admin"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    phoneNumber: varchar("phone_number", { length: 20 }).notNull().unique(),
    phoneVerified: boolean("phone_verified").default(false).notNull(),
    name: varchar("name", { length: 255 }),
    displayName: varchar("display_name", { length: 255 }),
    username: varchar("username", { length: 50 }).unique(),
    email: varchar("email", { length: 255 }).unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    profileImage: varchar("profile_image", { length: 500 }),
    role: userRoleEnum("role").default("student").notNull(),
    domainId: uuid("domain_id").references(() => domains.id),
    onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
    onboardingStep: integer("onboarding_step").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    roleIdx: index("users_role_idx").on(table.role),
    domainIdIdx: index("users_domain_id_idx").on(table.domainId),
    isActiveIdx: index("users_is_active_idx").on(table.isActive),
  })
);

// Type inference for TypeScript
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
