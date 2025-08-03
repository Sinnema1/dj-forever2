import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// Create an HTTP link for GraphQL server
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || "/graphql",
});

// Handle authentication via token in localStorage
const authLink = setContext((_, { headers }) => {
  // Get auth token from localStorage if it exists
  const token = localStorage.getItem("id_token");

  // Return headers to the context for the httpLink to use
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Handle GraphQL errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }

  if (networkError) {
    console.log(`[Network error]: ${networkError}`);

    // Optional: Handle token expiration/auth errors
    if ("statusCode" in networkError && networkError.statusCode === 401) {
      localStorage.removeItem("id_token");
      localStorage.removeItem("user");
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
