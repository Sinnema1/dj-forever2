import { GraphQLError } from "graphql";
import { registerUser, loginWithQrToken } from "../services/authService.js";
import { getRSVP, createRSVP, updateRSVP } from "../services/rsvpService.js";
import { AuthenticationError, ValidationError } from "../utils/errors.js";
import type {
  GraphQLContext,
  RegisterUserArgs,
  LoginArgs,
  CreateRSVPInput,
  RSVPInput,
  SubmitRSVPArgs,
} from "../types/graphql.js";

// Helper function to ensure user authentication
function requireAuth(context: GraphQLContext) {
  if (!context.user) {
    throw new AuthenticationError("Authentication required");
  }
  return context.user;
}

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: GraphQLContext) => {
      // Return the authenticated user from context
      return context.user || null;
    },
    getRSVP: async (_: unknown, __: unknown, context: GraphQLContext) => {
      // Get RSVP for the authenticated user
      const user = requireAuth(context);

      try {
        return await getRSVP(user._id?.toString() || user.id?.toString());
      } catch (error: any) {
        console.error("Error in getRSVP resolver:", error);
        throw new GraphQLError(error?.message || "Failed to fetch RSVP");
      }
    },
  },
  Mutation: {
    registerUser: async (_: unknown, args: RegisterUserArgs) => {
      try {
        return await registerUser(args);
      } catch (error: any) {
        console.error("Error in registerUser resolver:", error);
        throw new ValidationError(error?.message || "Registration failed");
      }
    },
    loginWithQrToken: async (_: unknown, args: LoginArgs) => {
      const { qrToken } = args;
      try {
        return await loginWithQrToken({ qrToken });
      } catch (error: any) {
        console.error("Error in loginWithQrToken resolver:", error);
        throw new AuthenticationError(error?.message || "Login failed");
      }
    },
    submitRSVP: async (
      _: unknown,
      args: SubmitRSVPArgs,
      context: GraphQLContext
    ) => {
      // Legacy mutation - create new RSVP
      const user = requireAuth(context);

      try {
        return await createRSVP({
          ...args,
          userId: user._id?.toString() || user.id?.toString(),
          fullName: args.fullName || user.fullName,
        });
      } catch (error: any) {
        console.error("Error in submitRSVP resolver:", error);
        throw new GraphQLError(error?.message || "Failed to submit RSVP");
      }
    },
    createRSVP: async (
      _: unknown,
      { input }: { input: CreateRSVPInput },
      context: GraphQLContext
    ) => {
      // New mutation for creating RSVP
      const user = requireAuth(context);

      try {
        return await createRSVP({
          ...input,
          userId: user._id?.toString() || user.id?.toString(),
          fullName: input.fullName || user.fullName,
        });
      } catch (error: any) {
        console.error("Error in createRSVP resolver:", error);
        throw new GraphQLError(error?.message || "Failed to create RSVP");
      }
    },
    editRSVP: async (
      _: unknown,
      { updates }: { updates: RSVPInput },
      context: GraphQLContext
    ) => {
      // Update existing RSVP
      const user = requireAuth(context);

      try {
        return await updateRSVP(
          user._id?.toString() || user.id?.toString(),
          updates
        );
      } catch (error: any) {
        console.error("Error in editRSVP resolver:", error);
        throw new GraphQLError(error?.message || "Failed to update RSVP");
      }
    },
  },
};
