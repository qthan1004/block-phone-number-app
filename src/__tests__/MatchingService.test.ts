import {MatchingService} from '../services/MatchingService';
import {BlockedNumber, AppSettings} from '../types';

describe('MatchingService', () => {
  const defaultSettings: AppSettings = {
    isServiceEnabled: true,
    rating: 75,
    notifyOnBlock: true,
  };

  const blockedList: BlockedNumber[] = [
    {
      id: '1',
      label: 'Spammer 1',
      rawNumber: '0987654321', // Length 10
      phoneNumber: '0987654321',
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: '2',
      label: 'Inactive Spammer',
      rawNumber: '0123456789', // Length 10
      phoneNumber: '0123456789',
      createdAt: 0,
      updatedAt: 0,
    },
  ];

  it('should allow call if app is disabled', () => {
    const result = MatchingService.checkCall('0987654321', blockedList, {
      ...defaultSettings,
      isServiceEnabled: false,
    });
    expect(result.isBlocked).toBe(false);
  });

  it('should block call if perfectly matches an active pattern', () => {
    const result = MatchingService.checkCall(
      '0987654321',
      blockedList,
      defaultSettings,
    );
    expect(result.isBlocked).toBe(true);
    expect(result.similarity).toBe(100);
    expect(result.matchedConfigName).toBe('Spammer 1');
  });

  it('should format +84 before matching', () => {
    // Mathing +84987654321 to 0987654321 -> similarity 100%
    const result = MatchingService.checkCall(
      '+84987654321',
      blockedList,
      defaultSettings,
    );
    expect(result.isBlocked).toBe(true);
    expect(result.similarity).toBe(100);
  });

  it('should block call if similarity is above threshold', () => {
    // "0987654321" length 10
    // "0987654322" length 10
    // Distance = 1 -> Similarity = 90% -> Threshold 75% -> BLOCKED
    const result = MatchingService.checkCall(
      '0987654322',
      blockedList,
      defaultSettings,
    );
    expect(result.isBlocked).toBe(true);
    expect(result.similarity).toBe(90);
  });

  it('should allow call if similarity is below threshold', () => {
    // "0987654321" length 10
    // "0980000000" distance 7 -> Similarity 30% -> Threshold 75% -> ALLOW
    const result = MatchingService.checkCall(
      '0980000000',
      blockedList,
      defaultSettings,
    );
    expect(result.isBlocked).toBe(false);
    expect(result.similarity).toBeLessThan(75);
  });
});
