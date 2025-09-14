import { registerUser, loginWithQrToken } from "../services/authService.js";
import {
  getRSVP,
  createRSVP,
  updateRSVP,
  submitRSVP,
} from "../services/rsvpService.js";

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      // Return the authenticated user from context
      return context.user || null;
    },
    getRSVP: async (_: any, __: any, context: any) => {
      // Get RSVP for the authenticated user
      if (!context.user) {
        throw new Error("Authentication required");
      }

      try {
        return await getRSVP(context.user._id);
      } catch (error: any) {
        console.error("Error in getRSVP resolver:", error);
        throw new Error(error?.message || "Failed to fetch RSVP");
      }
    },
  },
  Mutation: {
    registerUser: async (_: any, args: any) => {
      // Register user with qrToken
      return registerUser(args);
    },
    loginWithQrToken: async (_: any, args: any) => {
      // Login user with qrToken
      const { qrToken } = args;
      try {
        return await loginWithQrToken({ qrToken });
      } catch (error: any) {
        // Apollo will return this error in the errors array
        throw new Error(error?.message || "Login failed");
      }
    },
    submitRSVP: async (_: any, args: any, context: any) => {
      // Legacy mutation - create new RSVP
      if (!context.user) {
        throw new Error("Authentication required");
      }

      try {
        return await createRSVP({
          ...args,
          userId: context.user._id,
          fullName: args.fullName || context.user.fullName,
        });
      } catch (error: any) {
        console.error("Error in submitRSVP resolver:", error);
        throw new Error(error?.message || "Failed to submit RSVP");
      }
    },
    createRSVP: async (_: any, { input }: any, context: any) => {
      // New mutation for creating RSVP
      if (!context.user) {
        throw new Error("Authentication required");
      }

      try {
        return await createRSVP({
          ...input,
          userId: context.user._id,
          fullName: input.fullName || context.user.fullName,
        });
      } catch (error: any) {
        console.error("Error in createRSVP resolver:", error);
        throw new Error(error?.message || "Failed to create RSVP");
      }
    },
    editRSVP: async (_: any, { updates }: any, context: any) => {
      // Update existing RSVP
      if (!context.user) {
        throw new Error("Authentication required");
      }

      try {
        return await updateRSVP(context.user._id, updates);
      } catch (error: any) {
        console.error("Error in editRSVP resolver:", error);
        throw new Error(error?.message || "Failed to update RSVP");
      }
    },
  },
};
