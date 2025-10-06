import { useQuery, useMutation } from '@apollo/client';
import { GET_RSVP } from '../graphql/queries';
import { CREATE_RSVP, EDIT_RSVP } from '../graphql/mutations';
import { RSVP, CreateRSVPInput, RSVPInput } from '../types/rsvpTypes';
import { reportGraphQLError } from '../../../services/errorReportingService';

/**
 * GraphQL query response interface for fetching existing RSVP data
 */
interface GetRSVPResponse {
  /** RSVP data for the current user, null if no RSVP exists */
  getRSVP: RSVP | null;
}

/**
 * GraphQL mutation response interface for RSVP creation
 */
interface CreateRSVPResponse {
  /** Newly created RSVP record */
  createRSVP: RSVP;
}

/**
 * GraphQL mutation response interface for RSVP updates
 */
interface EditRSVPResponse {
  /** Updated RSVP record */
  editRSVP: RSVP;
}

/**
 * useRSVP - Custom Hook for RSVP Management
 *
 * Comprehensive React hook for managing wedding RSVP operations including
 * fetching existing responses, creating new RSVPs, and editing existing ones.
 * Provides integrated error handling, loading states, and automatic data
 * refetching for optimal user experience.
 *
 * @features
 * - **Data Fetching**: Automatic loading of existing RSVP data
 * - **CRUD Operations**: Complete create, read, update functionality
 * - **Error Handling**: Integrated error reporting and GraphQL error tracking
 * - **Loading States**: Consolidated loading state for all operations
 * - **Auto Refetch**: Automatic data refresh after mutations
 * - **Type Safety**: Full TypeScript integration with RSVP interfaces
 * - **Cache Management**: Apollo Client cache integration and updates
 * - **Network Resilience**: Handles network errors and offline scenarios
 *
 * @hook
 * @returns {Object} RSVP management utilities and state
 * @returns {RSVP|null} returns.rsvp - Current user's RSVP data or null if none exists
 * @returns {boolean} returns.loading - True when any RSVP operation is in progress
 * @returns {Error|null} returns.error - Any error from query or mutation operations
 * @returns {Function} returns.createRSVP - Function to create new RSVP submission
 * @returns {Function} returns.editRSVP - Function to update existing RSVP
 * @returns {Function} returns.refetch - Function to manually refetch RSVP data
 *
 * @example
 * ```typescript
 * function RSVPComponent() {
 *   const { rsvp, loading, error, createRSVP, editRSVP } = useRSVP();
 *
 *   // Handle loading state
 *   if (loading) return <LoadingSpinner />;
 *
 *   // Handle errors
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   // Show existing RSVP or create new one
 *   if (rsvp) {
 *     return (
 *       <RSVPSummary
 *         rsvp={rsvp}
 *         onEdit={(updates) => editRSVP(updates)}
 *       />
 *     );
 *   }
 *
 *   return (
 *     <RSVPForm
 *       onSubmit={(formData) => createRSVP(formData)}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Creating a new RSVP
 * const handleNewRSVP = async (formData: CreateRSVPInput) => {
 *   try {
 *     await createRSVP(formData);
 *     // Success - RSVP created and data refetched automatically
 *   } catch (error) {
 *     // Error handling - error is automatically reported
 *     console.error('RSVP creation failed:', error);
 *   }
 * };
 *
 * // Editing existing RSVP
 * const handleEditRSVP = async (updates: RSVPInput) => {
 *   try {
 *     await editRSVP(updates);
 *     // Success - RSVP updated and data refetched automatically
 *   } catch (error) {
 *     // Error handling - error is automatically reported
 *     console.error('RSVP update failed:', error);
 *   }
 * };
 * ```
 *
 * @dependencies
 * - `@apollo/client` - GraphQL client for data operations
 * - `errorReportingService` - Automatic error tracking and reporting
 * - RSVP GraphQL queries and mutations
 * - RSVP TypeScript interfaces
 *
 * @throws {GraphQLError} When GraphQL operations fail
 * @throws {NetworkError} When network connectivity issues occur
 * @throws {ValidationError} When input data validation fails
 */
export const useRSVP = () => {
  const {
    data,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useQuery<GetRSVPResponse>(GET_RSVP);

  const [executeCreateRSVP, { loading: createLoading, error: createError }] =
    useMutation<CreateRSVPResponse, { input: CreateRSVPInput }>(CREATE_RSVP);

  const [executeEditRSVP, { loading: editLoading, error: editError }] =
    useMutation<EditRSVPResponse, { updates: RSVPInput }>(EDIT_RSVP);

  /**
   * Create New RSVP
   *
   * Creates a new RSVP submission for the authenticated user. Handles the complete
   * creation flow including GraphQL mutation, error reporting, and automatic data
   * refetch to update the UI with the new RSVP.
   *
   * @param formData - Complete RSVP form data including guest details and preferences
   * @returns Promise that resolves when RSVP is successfully created
   * @throws {Error} When RSVP creation fails due to validation or network errors
   *
   * @example
   * ```typescript
   * const newRSVP: CreateRSVPInput = {
   *   attending: 'YES',
   *   guestCount: 2,
   *   guests: [
   *     { fullName: 'John Doe', mealPreference: 'chicken', allergies: 'None' },
   *     { fullName: 'Jane Doe', mealPreference: 'vegetarian', allergies: 'Gluten' }
   *   ],
   *   additionalNotes: 'Looking forward to celebrating!',
   *   fullName: 'John Doe',
   *   mealPreference: 'chicken',
   *   allergies: 'None'
   * };
   *
   * await createRSVP(newRSVP);
   * ```
   */
  const createRSVP = async (formData: CreateRSVPInput): Promise<void> => {
    try {
      await executeCreateRSVP({
        variables: { input: formData },
      });
      refetch();
    } catch (error) {
      reportGraphQLError(error, 'createRSVP', formData);
      throw error;
    }
  };

  /**
   * Edit Existing RSVP
   *
   * Updates an existing RSVP with new information. Handles the complete update
   * flow including GraphQL mutation, error reporting, and automatic data refetch
   * to update the UI with the modified RSVP.
   *
   * @param updates - RSVP update data containing modified fields
   * @returns Promise that resolves when RSVP is successfully updated
   * @throws {Error} When RSVP update fails due to validation or network errors
   *
   * @example
   * ```typescript
   * const updates: RSVPInput = {
   *   attending: 'NO',
   *   guestCount: 1,
   *   guests: [{
   *     fullName: 'John Doe',
   *     mealPreference: '',
   *     allergies: ''
   *   }],
   *   additionalNotes: 'Unfortunately cannot attend due to conflict'
   * };
   *
   * await editRSVP(updates);
   * ```
   */
  const editRSVP = async (updates: RSVPInput): Promise<void> => {
    try {
      await executeEditRSVP({
        variables: { updates },
      });
      refetch();
    } catch (error) {
      reportGraphQLError(error, 'editRSVP', updates);
      throw error;
    }
  };

  return {
    /** Current user's RSVP data or null if no RSVP exists */
    rsvp: data?.getRSVP ?? null,
    /** Consolidated loading state for all RSVP operations */
    loading: queryLoading || createLoading || editLoading,
    /** Any error from query or mutation operations */
    error: queryError || createError || editError,
    /** Function to create a new RSVP submission */
    createRSVP,
    /** Function to update an existing RSVP */
    editRSVP,
    /** Function to manually refetch RSVP data */
    refetch,
  };
};
