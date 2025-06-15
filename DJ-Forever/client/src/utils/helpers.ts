/**
 * Formats a date string to a more readable format.
 * @param dateString - The date string to format.
 * @returns A human-friendly date string.
 */
export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Formats a number into USD currency.
 * @param value - The number to format.
 * @returns A formatted currency string.
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};
