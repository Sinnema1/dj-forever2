/**
 * Apollo Client Configuration
 *
 * Optimized GraphQL client setup for the DJ Forever 2 wedding website.
 * Provides authentication, error handling, and network resilience with
 * enhanced bundle optimization through modular imports.
 *
 * Performance Optimizations:
 * - Modular Apollo Client imports for optimal tree-shaking
 * - Separate bundle chunking for Apollo dependencies
 * - Reduced bundle size through selective imports
 * - Enhanced caching strategy for production performance
 *
 * @fileoverview Optimized Apollo Client with modular imports
 * @version 3.0 - Bundle optimization update
 * @since 1.0.0
 */

// Modular Apollo Client imports for optimal tree-shaking and smaller bundle size
// These imports are split into separate chunks via Vite configuration
import { ApolloClient } from '@apollo/client/core';
import { InMemoryCache } from '@apollo/client/cache';
import { createHttpLink } from '@apollo/client/link/http';
import { from } from '@apollo/client/link/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { logError, logWarn } from '../utils/logger';
import {
  reportGraphQLError,
  reportNetworkError,
} from '../services/errorReportingService';

/**
 * HTTP Link Configuration
 *
 * Creates the core HTTP transport for GraphQL operations. Uses environment
 * variable for endpoint configuration with fallback to '/graphql' for
 * development and production consistency.
 */
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || '/graphql',
});

/**
 * Authentication Link
 *
 * Automatically attaches JWT authentication tokens to all GraphQL requests.
 * Retrieves the token from localStorage and adds it to the Authorization header.
 * Supports the QR-code authentication flow by automatically including tokens
 * from successful QR logins.
 *
 * @example
 * ```typescript
 * // Token is automatically retrieved and attached:
 * // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * // No manual token management needed:
 * const { data } = useQuery(GET_RSVP); // Automatically authenticated
 * ```
 */
const authLink = setContext((_, { headers }) => {
  // Get auth token from localStorage if it exists
  const token = localStorage.getItem('id_token');

  // Return headers to the context for the httpLink to use
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

/**
 * Error Handling Link
 *
 * Comprehensive error handling for GraphQL and network errors. Provides
 * automatic error reporting, logging, and user-friendly error management.
 * Integrates with the error reporting service for production monitoring.
 *
 * Handles:
 * - GraphQL errors (validation, authorization, server errors)
 * - Network errors (connectivity issues, timeouts)
 * - Authentication errors (invalid tokens, expired sessions)
 *
 * @example
 * ```typescript
 * // Errors are automatically caught and reported:
 * try {
 *   await createRSVP({ variables: { input: rsvpData } });
 * } catch (error) {
 *   // Error already logged and reported automatically
 *   // Handle user-facing error messaging here
 * }
 * ```
 */
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(error => {
      logError(`GraphQL error: ${error.message}`, 'ApolloClient', {
        message: error.message,
        locations: error.locations,
        path: error.path,
      });

      // Report to error tracking service
      reportGraphQLError(
        error,
        operation.operationName || 'unknown',
        operation.variables
      );
    });
  }

  if (networkError) {
    logWarn('Network error', 'ApolloClient', networkError);

    // Report network error
    reportNetworkError(
      networkError as Error,
      operation.getContext().uri || '/graphql',
      'POST'
    );

    // Optional: Handle token expiration/auth errors
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      localStorage.removeItem('id_token');
      localStorage.removeItem('user');
      // Could also trigger a global auth state refresh here
    }
  }
});

// Create the Apollo Client
const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;
