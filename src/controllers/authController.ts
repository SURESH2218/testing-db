import { successResponse, messageResponse } from "../utils/response.util";
import { NotFoundError, ConflictError } from "../utils/errors.util";

// Mock data - will be replaced with actual database queries
const mockUsers = [
  { id: 1, name: "suresh", email: "suresh@example.com" },
  { id: 2, name: "john", email: "john@example.com" },
];

/**
 * GET all users
 */
export const getRequest = () => {
  return successResponse(mockUsers, "Users fetched successfully");
};

/**
 * GET user by ID
 */
export const getUserById = ({ params }: { params: { id: string } }) => {
  const userId = parseInt(params.id);
  const user = mockUsers.find((u) => u.id === userId);

  if (!user) {
    throw new NotFoundError(`User with ID ${params.id} not found`);
  }

  return successResponse(user, "User fetched successfully");
};

/**
 * POST - Create new user
 */
export const createUser = ({ body }: { body: { name: string; email: string } }) => {
  // Check if email already exists
  const existingUser = mockUsers.find((u) => u.email === body.email);
  if (existingUser) {
    throw new ConflictError("User with this email already exists");
  }

  const newUser = {
    id: mockUsers.length + 1,
    name: body.name,
    email: body.email,
  };

  mockUsers.push(newUser);

  return successResponse(newUser, "User created successfully");
};

/**
 * PUT - Update user
 */
export const updateUser = ({
  params,
  body,
}: {
  params: { id: string };
  body: { name?: string; email?: string };
}) => {
  const userId = parseInt(params.id);
  const userIndex = mockUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new NotFoundError(`User with ID ${params.id} not found`);
  }

  // Check if email already exists (if updating email)
  if (body.email) {
    const existingUser = mockUsers.find((u) => u.email === body.email && u.id !== userId);
    if (existingUser) {
      throw new ConflictError("Email already in use by another user");
    }
  }

  const updatedUser = {
    ...mockUsers[userIndex],
    ...(body.name && { name: body.name }),
    ...(body.email && { email: body.email }),
  };

  mockUsers[userIndex] = updatedUser;

  return successResponse(updatedUser, "User updated successfully");
};

/**
 * DELETE - Delete user
 */
export const deleteUser = ({ params }: { params: { id: string } }) => {
  const userId = parseInt(params.id);
  const userIndex = mockUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new NotFoundError(`User with ID ${params.id} not found`);
  }

  mockUsers.splice(userIndex, 1);

  return messageResponse(`User ${params.id} deleted successfully`);
};
