import {
  enablePromise,
  openDatabase,
  SQLiteDatabase,
} from 'react-native-sqlite-storage';
import {CallLogEntry} from '../types';

// Bật hỗ trợ Promise cho SQLite Native Module để sử dụng async/await dễ dàng hơn thay vì Callback
enablePromise(true);

const DATABASE_NAME = 'CallBlocker.db';

/**
 * DatabaseService: Quản lý Engine xử lý cơ sở dữ liệu (Database) cục bộ trên Phone.
 * Bằng việc sử dụng SQLite, việc hiển thị cũng như lưu lại Call Log (vốn có thể lên tới
 * hàng trăm hoặc nghìn record) sẽ chạy rất nhanh, hỗ trợ Query Filter/Limit so với
 * lưu dạng Array cứng ở AsyncStorage.
 */
export const DatabaseService = {
  /**
   * Kết nối hoặc tạo một file kết nối chung (connection pool) tới SQLite App Folder.
   * `location: 'default'` trỏ File lưu tại Local Data / Documents trên điện thoại Android/iOS
   */
  async getDBConnection(): Promise<SQLiteDatabase> {
    return openDatabase({name: DATABASE_NAME, location: 'default'});
  },

  /**
   * Khởi tạo các Schema cấu trúc cho Bảng chứa trong Database khi ứng dụng mở lần đầu.
   */
  async initDB(): Promise<void> {
    try {
      const db = await this.getDBConnection();
      // Thực thi tạo bảng 'call_logs' (nếu nó chưa tồn tại)
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS call_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Cột khoá chính sinh tự động (Log ID)
          incomingNumber TEXT NOT NULL,          -- Số máy gọi đến 
          matchedPattern TEXT,                   -- Tên mẫu đã kích hoạt lệnh Block
          similarity REAL,                       -- Phần trăm tỉ lệ (%) khớp
          action TEXT NOT NULL,                  -- Lịch sử đã lưu "BLOCKED" (Bị Chặn)
          timestamp INTEGER NOT NULL             -- Giờ phút xảy ra
        );
      `);
    } catch (error) {
      console.error('Lỗi khởi tạo (init) SQLite Schema:', error);
      throw error;
    }
  },

  /**
   * Chèn mới 1 dòng ghi nhận (Log) sự kiện chặn/cho qua cuộc gọi vào DB.
   * Cấu trúc bảo vệ SQL Injection sử dụng Query Injection parameter ([?, ?, ?]).
   */
  async insertCallLog(entry: Omit<CallLogEntry, 'id'>): Promise<void> {
    try {
      const db = await this.getDBConnection();
      const insertQuery = `
        INSERT INTO call_logs (incomingNumber, matchedPattern, similarity, action, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `;
      await db.executeSql(insertQuery, [
        entry.incomingNumber,
        entry.matchedPattern || '',
        entry.similarity || 0,
        entry.action,
        entry.timestamp,
      ]);
    } catch (error) {
      console.error('Lỗi khi chèn Log vào DB:', error);
      throw error;
    }
  },

  /**
   * Trích xuất các bản tin Call Log từ CSDL và mapping chúng gán thành mảng JavaScript Array.
   * Mặc định lấy theo thứ tự Thời gian mới nhất xếp lên đầu, giới hạn lấy 100 Logs.
   */
  async getCallLogs(limit: number = 100): Promise<CallLogEntry[]> {
    try {
      const db = await this.getDBConnection();
      const [results] = await db.executeSql(
        'SELECT * FROM call_logs ORDER BY timestamp DESC LIMIT ?',
        [limit],
      );

      const logs: CallLogEntry[] = [];
      // Cursor Loop: Fetch từng item do DB trả về đưa vào JS object
      for (let i = 0; i < results.rows.length; i++) {
        logs.push(results.rows.item(i));
      }
      return logs;
    } catch (error) {
      console.error('Lỗi lấy History Data Query:', error);
      throw error;
    }
  },

  /**
   * Xóa toàn bộ Data Logs (Hành động Flush/Truncate Table để tiết kiệm bộ nhớ)
   */
  async clearCallLogs(): Promise<void> {
    try {
      const db = await this.getDBConnection();
      await db.executeSql('DELETE FROM call_logs');
    } catch (error) {
      console.error('Lỗi khi xóa bảng Call Logs SQLite:', error);
      throw error;
    }
  },
};
