import {normalizePhoneNumber} from '../utils/phoneUtils';

describe('phoneUtils Normalization Regex Tests', () => {
  it('correctly normalizes a standard phone number', () => {
    expect(normalizePhoneNumber('+84 987 654 321')).toBe('0987654321');
    expect(normalizePhoneNumber('0987-654-321')).toBe('0987654321');
    expect(normalizePhoneNumber('(028) 3333 4444')).toBe('02833334444');
  });

  it('correctly handles the wildcard asterisk [*] for spam blocking', () => {
    // A user inputs these formats targeting the provided sample prefixes
    expect(normalizePhoneNumber('024889*')).toBe('024889*');
    expect(normalizePhoneNumber('+84 24 889 *')).toBe('024889*');
    expect(normalizePhoneNumber('024-889-***')).toBe('024889***');
  });

  it('removes alphabetic characters but leaves numbers and wildcard asterisks intact', () => {
    expect(normalizePhoneNumber('Spam 024889* !')).toBe('024889*');
    expect(normalizePhoneNumber('Call 090* block')).toBe('090*');
  });
});
