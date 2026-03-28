import {normalizePhoneNumber} from '../utils/phoneUtils';

describe('Phone Normalization Utils', () => {
  it('removes spaces and dashes', () => {
    expect(normalizePhoneNumber('098 765 4321')).toBe('0987654321');
    expect(normalizePhoneNumber('098-765-4321')).toBe('0987654321');
  });

  it('removes parentheses', () => {
    expect(normalizePhoneNumber('(098) 765-4321')).toBe('0987654321');
  });

  it('handles +84 prefix correctly', () => {
    expect(normalizePhoneNumber('+84987654321')).toBe('0987654321');
  });

  it('handles 84 prefix without + symbol', () => {
    expect(normalizePhoneNumber('84987654321')).toBe('0987654321');
  });

  it('keeps leading zeroes', () => {
    expect(normalizePhoneNumber('00123456')).toBe('00123456');
  });

  it('returns empty string if input is empty or null', () => {
    expect(normalizePhoneNumber('')).toBe('');
  });
});
