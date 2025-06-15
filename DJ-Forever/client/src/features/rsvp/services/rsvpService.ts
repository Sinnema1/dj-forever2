import client from '../../../apolloClient';
import { CREATE_RSVP } from '../graphql/mutations';
import { RSVP } from '../types/rsvpTypes';

export interface CreateRSVPInput {
  fullName: string;
  email: string;
  attending: string; // e.g. "yes", "no", "maybe"
  guests?: number;
  notes?: string;
}

export const submitRSVP = async (formData: CreateRSVPInput): Promise<RSVP> => {
  try {
    const { data } = await client.mutate({
      mutation: CREATE_RSVP,
      variables: { input: formData },
    });
    return data.createRSVP;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('RSVP submission error:', error.message);
      throw new Error(error.message);
    }
    console.error('Unknown error creating RSVP:', error);
    throw new Error('An unknown error occurred while creating RSVP.');
  }
};
