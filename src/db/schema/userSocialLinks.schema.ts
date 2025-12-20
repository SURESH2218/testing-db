import { pgTable, varchar, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./users.schema";

export const userProfileLinks = pgTable(
  "user_profile_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    linkedinUrl: varchar("linkedin_url", { length: 500 }),
    githubUrl: varchar("github_url", { length: 500 }),
    behanceUrl: varchar("behance_url", { length: 500 }),
    portfolioUrl: varchar("portfolio_url", { length: 500 }),
    personalWebsite: varchar("personal_website", { length: 500 }),
    twitterUrl: varchar("twitter_url", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("profile_links_user_id_idx").on(table.userId),
  })
);

// Type inference for TypeScript
export type UserProfileLinks = InferSelectModel<typeof userProfileLinks>;
export type NewUserProfileLinks = InferInsertModel<typeof userProfileLinks>;
