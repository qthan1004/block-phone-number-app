/**
 * Normalizes a phone number for comparison.
 * - Removes spaces, dashes, parentheses
 * - Replaces +84 with 0
 * 
 * @param phone The raw phone number string
 * @returns The normalized phone number string consisting only of digits
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit and non-plus characters
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // Replace +84 prefix with 0
  if (normalized.startsWith('+84')) {
    normalized = '0' + normalized.substring(3);
  } else if (normalized.startsWith('84') && normalized.length >= 10) {
    // Handle cases where 84 is provided without +
    normalized = '0' + normalized.substring(2);
  }
  
  return normalized;
};
