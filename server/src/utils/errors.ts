// Centralized error handling for GraphQL
import { GraphQLError } from "graphql";

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: "UNAUTHENTICATED",
      },
    });
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: "FORBIDDEN",
      },
    });
  }
}

export class ValidationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: "BAD_USER_INPUT",
      },
    });
  }
}

export function formatError(error: GraphQLError) {
  // Log errors (add your logging service here)
  if (process.env.NODE_ENV !== "production") {
    console.error("GraphQL Error:", error);
  }

  return error;
}
