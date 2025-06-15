export const resolvers = {
  Query: {
    me: () => null,
    getRSVP: () => null,
  },
  Mutation: {
    registerUser: () => ({ token: "", user: null }),
    loginUser: () => ({ token: "", user: null }),
    submitRSVP: () => null,
    editRSVP: () => null,
  },
};
