import {BlockedNumber, AppSettings} from '../types';
import {calculateSimilarityPercentage} from '../utils/levenshtein';
import {normalizePhoneNumber} from '../utils/phoneUtils';

export interface MatchResult {
  isBlocked: boolean;
  similarity: number;
  matchedPattern?: string;
  matchedConfigName?: string;
}

export class MatchingService {
  /**
   * Tương quan logic phân tích cuộc gọi đến với danh sách mẫu số bị chặn.
   * Nếu phần trăm giống nhau >= cài đặt threshold -> Chặn.
   *
   * @param incomingNumber Số điện thoại gọi đến (sẽ được tự động chuẩn hóa)
   * @param blockedNumbers Danh sách các cấu hình số bị chặn
   * @param settings Cấu hình chung chứa rating threshold
   * @returns MatchResult Kết quả phân tích có bị chặn hay không
   */
  static checkCall(
    incomingNumber: string,
    blockedNumbers: BlockedNumber[],
    settings: AppSettings,
  ): MatchResult {
    // Bỏ qua nếu ứng dụng đang bị vô hiệu hóa
    if (!settings.isServiceEnabled) {
      return {isBlocked: false, similarity: 0};
    }

    const normalizedIncoming = normalizePhoneNumber(incomingNumber);
    if (!normalizedIncoming) {
      return {isBlocked: false, similarity: 0};
    }

    let highestSimilarity = 0;
    let fallbackResult: MatchResult = {isBlocked: false, similarity: 0};

    for (const blocked of blockedNumbers) {
      const normalizedPattern = normalizePhoneNumber(blocked.rawNumber);
      if (!normalizedPattern) {
        continue;
      }

      const similarity = calculateSimilarityPercentage(
        normalizedIncoming,
        normalizedPattern,
      );

      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        fallbackResult = {
          isBlocked: similarity >= settings.rating,
          similarity,
          matchedPattern: blocked.rawNumber,
          matchedConfigName: blocked.label || 'Unknown Rule',
        };
      }

      // Tối ưu hóa: Nếu phát hiện 1 mẫu khớp 100%, chặn ngay lập tức không cần duyệt tiếp
      if (similarity === 100) {
        return fallbackResult;
      }
    }

    return fallbackResult;
  }
}
