import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql/error/index.js";
import dotenv from "dotenv";
import { createError } from "../middleware/errorHandler.js";
import { CONFIG } from "../constants/config.js";

dotenv.config();

/**
 * Defines the shape of a decoded JWT payload.
 */
interface DecodedToken {
  data: {
    _id: unknown;
    fullName: string;
    email: string;
  };
}

/**
 * Middleware function to authenticate JWT tokens from requests.
 * Extracts user data from the token and attaches it to the context.
 *
 * @param {object} param0 - The GraphQL context object containing the request.
 * @param {object} param0.req - The HTTP request object from Express.
 * @returns {object} - An object containing the user if authenticated.
 */
export const authenticateToken = ({ req }: { req: any }) => {
  let token = req.body.token || req.query.token || req.headers.authorization;

  // Check for Bearer token format and extract it
  if (req.headers.authorization && token?.startsWith("Bearer ")) {
    token = token.split(" ")[1].trim();
  }

  // Skip auth for Introspection Queries and missing tokens
  if (!token) {
    if (req.body?.operationName === "IntrospectionQuery") {
      if (process.env.NODE_ENV !== "test") {
        console.log(`Skipping auth for ${req.body.operationName}.`);
      }
    } else {
      if (process.env.NODE_ENV !== "test") {
        console.log(
          `No token provided for ${
            req.body?.operationName || "Unknown Operation"
          }.`
        );
      }
    }
    return { req }; // Proceed without attaching a user
  }

  try {
    if (!CONFIG.JWT_SECRET) {
      throw createError("JWT secret is missing in environment variables.", 500);
    }

    // Verify token and attach user data to context
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET, {
      maxAge: "2h",
    }) as DecodedToken;

    console.log("Token verified. User:", decoded.data);

    return {
      ...req,
      user: decoded.data, // Context will have user object available
    };
  } catch (err: any) {
    console.error("Invalid token:", err.message);

    // Return context without user or throw, depending on your design
    throw new AuthenticationError(
      "Invalid or expired token. Please log in again."
    );
  }
};

/**
 * Generates a signed JWT token for authentication.
 *
 * @param {string} fullName - The full name of the user.
 * @param {string} email - The email of the user.
 * @param {string} _id - The user's ID.
 * @returns {string} - A JWT token.
 */
export const signToken = (
  fullName: string,
  email: string,
  _id: unknown
): string => {
  if (!CONFIG.JWT_SECRET) {
    throw createError("JWT secret is missing in environment variables.", 500);
  }

  const payload = { fullName, email, _id };

  return jwt.sign({ data: payload }, CONFIG.JWT_SECRET, {
    expiresIn: "2h",
  });
};

/**
 * Custom AuthenticationError class for GraphQL.
 * Automatically applies the UNAUTHENTICATED error code.
 */
export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: { code: "UNAUTHENTICATED" },
    });

    Object.defineProperty(this, "name", { value: "AuthenticationError" });
  }
}
