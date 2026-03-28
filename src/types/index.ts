/**
 * Đại diện cho một mẫu số điện thoại cần chặn trong hệ thống
 */
export interface BlockedNumber {
  id: string; // Chuỗi định danh duy nhất (UUID)
  phoneNumber: string; // Số mẫu gốc đã được chuẩn hóa (normalize) để thuật toán so sánh dễ hơn
  rawNumber: string; // Số điện thoại ở định dạng nguyên bản do user nhập trên UI
  label?: string; // Tên/Chú thích hiển thị cho user (ví dụ: "Số rác bảo hiểm")
  createdAt: number; // Thời điểm tạo (Unix timestamp)
  updatedAt: number; // Thời điểm sửa đổi cuối cùng (Unix timestamp)
}

/**
 * Các tuỳ chỉnh cài đặt chung của ứng dụng
 */
export interface AppSettings {
  rating: number; // Tỉ lệ tương đồng tối thiểu để chặn cuộc gọi (0-100%, mặc định: 75)
  isServiceEnabled: boolean; // Trạng thái Bật/Tắt module chặn cuộc gọi
  notifyOnBlock: boolean; // Cấu hình có gửi Notification cho user khi chặn 1 cuộc gọi hay không
}

/**
 * Đại diện cho một bản tin lưu trữ lịch sử cuộc gọi (Call Log)
 */
export interface CallLogEntry {
  id: number; // ID tự tăng trong SQLite
  incomingNumber: string; // Số điện thoại thực tế gọi đến máy
  matchedPattern: string; // Pattern số ảo/số thật đã trigger thao tác khớp
  similarity: number; // Tỉ lệ giống nhau thực tế giữa gọi đến và pattern tính bằng %
  action: 'BLOCKED' | 'ALLOWED'; // Hành động đã được thực hiện (Đã chặn / Đã cho qua)
  timestamp: number; // Thời điểm có cuộc gọi đến
}

/**
 * Tập hợp các Key khai báo cho AsyncStorage
 */
export const STORAGE_KEYS = {
  BLOCKED_NUMBERS: '@call_blocker/blocked_numbers', // Key lưu mảng BlockedNumber
  SETTINGS: '@call_blocker/settings', // Key lưu object AppSettings
};
