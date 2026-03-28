import {NativeModules, Platform} from 'react-native';

const {CallScreeningModule} = NativeModules;

export const NativeCallScreening = {
  /**
   * Yêu cầu hệ thống thiết lập app làm "Caller ID & Spam app" (chỉ chạy trên Android 10+).
   * Mở hộp thoại hệ thống.
   * @returns Promise<boolean> true nếu người dùng cấp quyền, false nếu từ chối.
   */
  requestRole: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return false;
    }
    try {
      return await CallScreeningModule.requestRole();
    } catch (e) {
      console.warn('Failed to request call screening role:', e);
      return false;
    }
  },

  /**
   * Kiểm tra xem app đã là ứng dụng chặn cuộc gọi mặc định chưa.
   */
  checkRoleStatus: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return false;
    }
    try {
      return await CallScreeningModule.checkRoleStatus();
    } catch (e) {
      console.warn('Failed to check role status:', e);
      return false;
    }
  },

  /**
   * Lưu dữ liệu qua SharedPreferences để Native code (Kotlin) có thể đọc nhanh
   * dù ở Background mà không cần khởi động React Native bridge.
   * @param blockedNumbers Mảng Object chứa thông tin số đã chặn
   * @param settings Object cấu hình (strictnessRating, vv)
   */
  syncData: async (blockedNumbers: any[], settings: any): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }
    try {
      return await CallScreeningModule.syncData(
        JSON.stringify(blockedNumbers),
        JSON.stringify(settings),
      );
    } catch (e) {
      console.warn('Failed to sync data to native module:', e);
      return false;
    }
  },
};
