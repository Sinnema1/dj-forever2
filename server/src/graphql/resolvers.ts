import { registerUser, loginWithQrToken } from "../services/authService.js";
import { submitRSVP } from "../services/rsvpService.js";

export const resolvers = {
  Query: {
    me: () => null,
    getRSVP: () => null,
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
      // For now, mock userId and fullName; in real app, get from auth context
      const userId = args.userId || "000000000000000000000000";
      const fullName = args.fullName || "E2E User";
      return submitRSVP({ ...args, userId, fullName });
    },
    editRSVP: () => null,
  },
};
