import { useQuery, useMutation } from '@apollo/client';
import { GET_RSVP } from '../graphql/queries';
import { CREATE_RSVP, EDIT_RSVP } from '../graphql/mutations';
import { RSVP, CreateRSVPInput, RSVPInput } from '../types/rsvpTypes';

/**
 * Interface for GET_RSVP GraphQL query response.
 */
interface GetRSVPResponse {
  getRSVP: RSVP | null;
}

/**
 * Interface for CREATE_RSVP GraphQL mutation response.
 */
interface CreateRSVPResponse {
  createRSVP: RSVP;
}

/**
 * Interface for EDIT_RSVP GraphQL mutation response.
 */
interface EditRSVPResponse {
  editRSVP: RSVP;
}

/**
 * Custom hook to manage RSVP logic: fetch RSVP for the current user and create a new RSVP.
 */
export const useRSVP = () => {
  // Fetch the current user's RSVP from backend
  const {
    data,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useQuery<GetRSVPResponse>(GET_RSVP);

  // Mutation hook to create RSVP
  const [executeCreateRSVP, { loading: createLoading, error: createError }] = useMutation<
    CreateRSVPResponse,
    { input: CreateRSVPInput }
  >(CREATE_RSVP);

  // Mutation hook to edit RSVP
  const [executeEditRSVP, { loading: editLoading, error: editError }] = useMutation<
    EditRSVPResponse,
    { updates: RSVPInput }
  >(EDIT_RSVP);

  /**
   * Create RSVP and refetch the RSVP data.
   * @param formData - Data to create an RSVP (CreateRSVPInput)
   */
  const createRSVP = async (formData: CreateRSVPInput): Promise<void> => {
    try {
      await executeCreateRSVP({
        variables: { input: formData },
      });

      // Refetch RSVP data after creation
      await refetch();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error creating RSVP:', error.message);
        throw new Error(error.message);
      } else {
        console.error('Unknown error creating RSVP:', error);
        throw new Error('An unknown error occurred while creating RSVP.');
      }
    }
  };

  /**
   * Edit an existing RSVP and refetch the RSVP data.
   * @param formData - Data to update the RSVP (RSVPInput)
   */
  const editRSVP = async (formData: RSVPInput): Promise<void> => {
    try {
      await executeEditRSVP({
        variables: { updates: formData },
      });

      // Refetch RSVP data after update
      await refetch();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error editing RSVP:', error.message);
        throw new Error(error.message);
      } else {
        console.error('Unknown error editing RSVP:', error);
        throw new Error('An unknown error occurred while editing RSVP.');
      }
    }
  };

  return {
    rsvp: data?.getRSVP || null,
    loading: queryLoading || createLoading || editLoading,
    error: queryError || createError || editError,
    createRSVP,
    editRSVP,
  };
};
