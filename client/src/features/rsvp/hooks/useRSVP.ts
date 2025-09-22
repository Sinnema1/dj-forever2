import { useQuery, useMutation } from '@apollo/client';
import { GET_RSVP } from '../graphql/queries';
import { CREATE_RSVP, EDIT_RSVP } from '../graphql/mutations';
import { RSVP, CreateRSVPInput, RSVPInput } from '../types/rsvpTypes';
import { reportGraphQLError } from '../../../services/errorReportingService';

interface GetRSVPResponse {
  getRSVP: RSVP | null;
}

interface CreateRSVPResponse {
  createRSVP: RSVP;
}

interface EditRSVPResponse {
  editRSVP: RSVP;
}

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
    rsvp: data?.getRSVP ?? null,
    loading: queryLoading || createLoading || editLoading,
    error: queryError || createError || editError,
    createRSVP,
    editRSVP,
    refetch,
  };
};
