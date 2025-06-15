import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../graphql/queries';
import { DELETE_USER, UPDATE_USER } from '../graphql/mutations';
import { UserType, UpdateUserInput } from '../types/userTypes';

interface GetMeResponse {
  me: UserType;
}

interface UpdateUserResponse {
  updateUser: UserType;
}

interface DeleteUserResponse {
  deleteUser: { _id: string };
}

export const useUsers = () => {
  // Fetch the current user profile
  const {
    data: meData,
    loading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useQuery<GetMeResponse>(GET_ME);

  // Mutation to update a user
  const [updateUserMutation] = useMutation<
    UpdateUserResponse,
    { input: UpdateUserInput }
  >(UPDATE_USER);

  // Mutation to delete a user
  const [deleteUserMutation] = useMutation<DeleteUserResponse, { id: string }>(DELETE_USER);

  /**
   * Updates the current user's profile information.
   * @param input - The updated user information.
   */
  const updateUser = async (input: UpdateUserInput): Promise<void> => {
    await updateUserMutation({ variables: { input } });
    // Refetch user data after update
    if (refetchUser) {
      refetchUser();
    }
  };

  /**
   * Deletes a user.
   * @param id - The user ID to delete.
   */
  const deleteUser = async (id: string): Promise<void> => {
    await deleteUserMutation({ variables: { id } });
    // No allUsers to refetch
  };

  return {
    user: meData?.me || null,
    loading: userLoading,
    error: userError,
    refetchUser,
    updateUser,
    deleteUser,
  };
};
