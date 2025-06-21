import { registerUser, loginUser } from "../services/authService";
import { submitRSVP } from "../services/rsvpService";

export const resolvers = {
  Query: {
    me: () => null,
    getRSVP: () => null,
  },
  Mutation: {
    registerUser: async (_: any, args: any) => {
      console.log("registerUser resolver called with args:", args);
      return registerUser(args);
    },
    loginUser: async (_: any, args: any) => {
      console.log("loginUser resolver called with args:", args);
      return loginUser(args);
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
