/**
 * Extracts and returns an error message from an error object.
 * @param error - The error to process.
 * @returns A string message for display.
 */
export const handleError = (error: unknown): string => {
  if (error && typeof error === 'object') {
    // Check for Axios error with a response
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    if (err.response && err.response.data && err.response.data.message) {
      return err.response.data.message;
    } else if (err.message) {
      return err.message;
    }
  }
  return 'An unexpected error occurred.';
};
