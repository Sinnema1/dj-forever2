import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS, GET_USER_BY_ID } from '../graphql/queries';
import { DELETE_USER, UPDATE_USER } from '../graphql/mutations';
import { UserType, UpdateUserInput } from '../types/userTypes';

interface GetUsersResponse {
  getUsers: UserType[];
}

interface GetUserByIdResponse {
  getUserById: UserType;
}

interface DeleteUserResponse {
  deleteUser: { _id: string };
}

export const useUsers = (userId?: string) => {
  // Fetch all users (for admin view)
  const {
    data: allUsersData,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery<GetUsersResponse>(GET_USERS);

  // Fetch single user by ID (for profile)
  const {
    data: userByIdData,
    loading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useQuery<GetUserByIdResponse>(GET_USER_BY_ID, {
    skip: !userId,
    variables: { id: userId },
  });

  // Mutation for deleting a user
  const [deleteUserMutation] = useMutation<DeleteUserResponse, { id: string }>(DELETE_USER);

  // Mutation for updating a user
  const [updateUserMutation] = useMutation<{ updateUser: UserType }, { input: UpdateUserInput }>(UPDATE_USER);

  /**
   * Deletes a user and refetches the user list.
   * @param id - The user ID.
   */
  const deleteUser = async (id: string) => {
    await deleteUserMutation({ variables: { id } });
    refetchUsers();
  };

  /**
   * Updates a user's profile information.
   * @param updateData - The data to update (fullName and/or email).
   */
  const updateUser = async (updateData: UpdateUserInput) => {
    return await updateUserMutation({ 
      variables: { input: updateData }
    });
  };

  return {
    allUsers: allUsersData?.getUsers || [],
    user: userByIdData?.getUserById || null,
    loading: usersLoading || userLoading,
    error: usersError || userError,
    refetchUsers,
    deleteUser,
    updateUser,
  };
};
