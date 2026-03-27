import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlockedNumber, AppSettings, STORAGE_KEYS } from '../types';

// Cấu hình cài đặt mặc định áp dụng khi người dùng cài app lần đầu tiên
const DEFAULT_SETTINGS: AppSettings = {
  rating: 75,
  isServiceEnabled: true,
  notifyOnBlock: true,
};

/**
 * StorageService: Service chuyên trách thao tác Read/Write dữ liệu vào AsyncStorage.
 * AsyncStorage trên Android sẽ lưu trữ JSON data dưới dạng file XML trong thư mục Data của App.
 * Tốc độ lấy data cực nhanh, phù hợp cho file cài đặt (Settings) và các List dữ liệu tĩnh nhỏ.
 */
export const StorageService = {
  // ==========================================
  // QUẢN LÝ CÀI ĐẶT ỨNG DỤNG (SETTINGS)
  // ==========================================

  /**
   * Lấy cấu hình cài đặt hiện tại của ứng dụng.
   * Nếu chưa có sẽ merge và trả về cấu hình mặc định (DEFAULT_SETTINGS)
   */
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
      return DEFAULT_SETTINGS;
    } catch (e) {
      console.error('Lỗi khi lấy cài đặt từ bộ nhớ:', e);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Cập nhật một phần hoặc toàn bộ cài đặt ứng dụng.
   * Cấu hình mới truyền vào sẽ luôn đè lên Cấu hình cũ.
   */
  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Lỗi khi lưu cài đặt vào bộ nhớ:', e);
      throw e;
    }
  },

  // ==========================================
  // QUẢN LÝ DANH SÁCH MẪU SỐ BỊ CHẶN
  // ==========================================

  /**
   * Lấy danh sách toàn bộ mẫu số điện thoại đã bị người dùng thêm vào danh sách chặn
   */
  async getBlockedNumbers(): Promise<BlockedNumber[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_NUMBERS);
      if (data) {
        return JSON.parse(data);
      }
      return []; // Trả về mảng rỗng nếu chưa có data
    } catch (e) {
      console.error('Lỗi khi lấy danh sách cấu hình chặn:', e);
      return [];
    }
  },

  /**
   * Thêm một số điện thoại mới vào cuối danh sách chặn
   */
  async addBlockedNumber(number: BlockedNumber): Promise<void> {
    try {
      const current = await this.getBlockedNumbers();
      current.push(number);
      await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_NUMBERS, JSON.stringify(current));
    } catch (e) {
      console.error('Lỗi khi thêm số vào danh sách:', e);
      throw e;
    }
  },

  /**
   * Sửa cấu hình một số điện thoại đã nằm trong danh sách dựa theo "id" (UUID)
   */
  async updateBlockedNumber(id: string, data: Partial<BlockedNumber>): Promise<void> {
    try {
      const current = await this.getBlockedNumbers();
      const index = current.findIndex(n => n.id === id);
      
      // Nếu tìm thấy item trong danh sách
      if (index > -1) {
        // Cập nhật record với data mới và tick lại Timestamp sửa đổi mới nhất
        current[index] = { ...current[index], ...data, updatedAt: Date.now() };
        await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_NUMBERS, JSON.stringify(current));
      }
    } catch (e) {
      console.error('Lỗi khi cập nhật số bị chặn:', e);
      throw e;
    }
  },

  /**
   * Xóa vĩnh viễn một số khỏi danh sách chặn (Remove) dựa trên id của hệ thống
   */
  async deleteBlockedNumber(id: string): Promise<void> {
    try {
      const current = await this.getBlockedNumbers();
      // Loại bỏ chính record có chứa `id`
      const updated = current.filter(n => n.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_NUMBERS, JSON.stringify(updated));
    } catch (e) {
      console.error('Lỗi khi xóa tài nguyên chặn:', e);
      throw e;
    }
  }
};
