# Phase 2: Data Layer

Dự án: **CallBlocker**

## 1. Các bước đã làm

### Bước 1: Định nghĩa Types
- **Trạng thái:** Hoàn tất
- **File:** `src/types/index.ts`
- **Ý nghĩa & Lý do:** Xác định các interface chuẩn (`BlockedNumber`, `AppSettings`, `CallLogEntry`) giúp đảm bảo Type Safety bằng TypeScript khi truyền dữ liệu giữa các logic Layer và UI.

### Bước 2: Storage Service (AsyncStorage)
- **Trạng thái:** Hoàn tất
- **File:** `src/services/StorageService.ts`
- **Ý nghĩa & Lý do:** Cung cấp API quản lý lưu trữ Persistent cho cấu hình ứng dụng (Settings) và bảng danh sách mẫu số cần chặn. Dữ liệu lưu dưới dạng Local JSON string tối ưu cho những Query đơn giản.

### Bước 3: Database Service (SQLite)
- **Trạng thái:** Hoàn tất
- **File:** `src/services/DatabaseService.ts`
- **Ý nghĩa & Lý do:** Cấu hình và tự động khởi tạo bảng `call_logs` để lưu trữ lịch sử chặn cuộc gọi. Dùng thư viện `react-native-sqlite-storage` vì nó cho phép Query Log limit và sorting nhanh hơn so với AsyncStorage.

### Bước 4: App Context (Global State)
- **Trạng thái:** Hoàn tất
- **File:** `src/contexts/AppContext.tsx`
- **Ý nghĩa & Lý do:** Sử dụng React Context Provider làm cầu nối Data cho UI. Tự động load dữ liệu từ 2 Service trên ngay khi mở ứng dụng (`init()`), từ đó export ra global hooks `useApp()` chứa state và mọi action mutations cần thiết.

---

## 2. Kết luận Phase 2
- Data structure đã hoàn chỉnh. Luồng dữ liệu Local đã sẵn sàng cho UI thao tác.
- Bước kế tiếp (Phase 3) sẽ là xây dựng Engine nội bộ xử lý logic so sánh Levenshtein Distance cho String.

## 3. Kiểm thử (Verification)
- **Thiết lập:** Đã chỉnh sửa tạm `App.tsx` để sử dụng `AppProvider` và hiển thị UI test.
- **Thực thi:** Gọi lệnh `npm run android` trên máy ảo Pixel 6 (API 34).
- **Kết quả:** Ứng dụng không gặp lỗi Crash. Storage và Database SQLite được khởi tạo thành công, trả về trạng thái mặc định (Rating Threshold: 75% và Blocked Numbers Count: 0).
- **Trạng thái:** Báo cáo [Passed] - Sẵn sàng cho Phase 3.

![Emulator Verification](/home/administrator/back up/App block number phone/walkthrough/screen-phase2-ok.png)
