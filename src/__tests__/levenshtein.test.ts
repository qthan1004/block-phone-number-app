import {
  calculateLevenshteinDistance,
  calculateSimilarityPercentage,
} from '../utils/levenshtein';

describe('Levenshtein Distance Utils', () => {
  describe('calculateLevenshteinDistance', () => {
    it('returns 0 for identical strings', () => {
      expect(calculateLevenshteinDistance('0987654321', '0987654321')).toBe(0);
    });

    it('returns exact distance when one string is empty', () => {
      expect(calculateLevenshteinDistance('', '123')).toBe(3);
      expect(calculateLevenshteinDistance('123', '')).toBe(3);
    });

    it('calculates substitutions correctly', () => {
      expect(calculateLevenshteinDistance('0987654321', '0987654329')).toBe(1); // 1 substitution
    });

    it('calculates insertions correctly', () => {
      expect(calculateLevenshteinDistance('098', '0987')).toBe(1); // 1 insertion
    });

    it('calculates deletions correctly', () => {
      expect(calculateLevenshteinDistance('0987', '098')).toBe(1); // 1 deletion
    });
  });

  describe('calculateSimilarityPercentage', () => {
    it('returns 100 for identical strings', () => {
      expect(calculateSimilarityPercentage('12345', '12345')).toBe(100);
    });

    it('returns 0 when completely different', () => {
      // "123" and "456" have distance 3, max length 3
      // similarity = (3 - 3) / 3 * 100 = 0
      expect(calculateSimilarityPercentage('123', '456')).toBe(0);
    });

    it('returns correct percentage for partial matches', () => {
      // "1234" vs "1235" -> distance 1, max length 4
      // similarity = (4 - 1) / 4 * 100 = 75
      expect(calculateSimilarityPercentage('1234', '1235')).toBe(75);
    });

    it('returns 100 for two empty strings', () => {
      expect(calculateSimilarityPercentage('', '')).toBe(100);
    });
  });
});
