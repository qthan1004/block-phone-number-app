/**
 * Calculates the Levenshtein distance between two strings.
 * This measures the minimum number of single-character edits (insertions, deletions, or substitutions)
 * required to change one string into the other.
 *
 * @param a The first string
 * @param b The second string
 * @returns The Levenshtein distance
 */
export const calculateLevenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }

  const matrix: number[][] = [];

  // Initialize the first row and column
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          ),
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Calculates the similarity percentage between two strings based on their Levenshtein distance.
 *
 * @param a The first string
 * @param b The second string
 * @returns A number between 0 and 100 representing the similarity percentage
 */
export const calculateSimilarityPercentage = (a: string, b: string): number => {
  if (a === b) {
    return 100;
  }
  // Wildcard Prefix Matching Rule
  if (b.endsWith('*')) {
    const prefix = b.slice(0, -1);
    if (a.startsWith(prefix)) {
      return 100;
    }
  }

  if (a.length === 0 && b.length === 0) {
    return 100;
  }
  if (a.length === 0 || b.length === 0) {
    return 0;
  }

  const distance = calculateLevenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);

  if (maxLength === 0) {
    return 100;
  }

  const similarity = ((maxLength - distance) / maxLength) * 100;
  // Round to 2 decimal places
  return Math.round(similarity * 100) / 100;
};
