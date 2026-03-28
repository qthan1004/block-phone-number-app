import {
  calculateSimilarityPercentage,
  calculateLevenshteinDistance,
} from './levenshtein';

describe('Levenshtein Matching Engine Tests', () => {
  const spamNumbers = [
    '02488911814',
    '02488906418',
    '02488906350',
    '02488911712',
    '02488911764',
  ];

  it('proves that fuzzy matching with a standard number fails to reliably block the spam ring under a safe 75% strictness', () => {
    const fallbackTargetSetting = '02488900000';
    
    // Test all real spam inputs provided by the user
    // We mathematically prove their similarities hover around 54% - 72%, failing a safe 75% threshold
    spamNumbers.forEach(spam => {
      const similarity = calculateSimilarityPercentage(spam, fallbackTargetSetting);
      expect(similarity).toBeLessThan(75.0);
    });
  });

  it('automatically triggers a 100% block similarity when a valid wildcard prefix is encountered', () => {
    const wildcardRule = '024889*';
    
    spamNumbers.forEach(spam => {
      const similarity = calculateSimilarityPercentage(spam, wildcardRule);
      expect(similarity).toBe(100.0);
    });
  });

  it('calculates correct distance between two identical strings', () => {
    expect(calculateLevenshteinDistance('12345', '12345')).toBe(0);
    expect(calculateSimilarityPercentage('12345', '12345')).toBe(100);
  });

  it('rejects numbers that do not match the wildcard prefix with strict percentages', () => {
    const wildcardRule = '024889*';
    const validNumber = '02888911814'; // Starts with 028, not 024
    
    const similarity = calculateSimilarityPercentage(validNumber, wildcardRule);
    
    // It should fall back to standard Levenshtein calculation
    expect(similarity).toBeLessThan(100);
  });
});
