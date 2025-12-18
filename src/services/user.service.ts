import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, type User, type NewUser } from "../db/schema/users.schema";
import { DatabaseError, NotFoundError } from "../utils/errors.util";

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User> => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    return user;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError("Failed to fetch user", error);
  }
};

/**
 * Get user by phone number
 */
export const getUserByPhone = async (phoneNumber: string): Promise<User | null> => {
  try {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user || null;
  } catch (error) {
    throw new DatabaseError("Failed to fetch user by phone", error);
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  } catch (error) {
    throw new DatabaseError("Failed to fetch user by email", error);
  }
};

/**
 * Update user
 */
export const updateUser = async (id: string, userData: Partial<NewUser>): Promise<User> => {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    return updatedUser;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError("Failed to update user", error);
  }
};

/**
 * Check if email exists
 */
export const emailExists = async (email: string): Promise<boolean> => {
  try {
    const user = await getUserByEmail(email);
    return !!user;
  } catch (error) {
    throw new DatabaseError("Failed to check email existence", error);
  }
};
