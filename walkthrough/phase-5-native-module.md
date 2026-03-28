# Walkthrough - Phase 5: Native Module (Call Screening)

## 1. Mục tiêu hoàn thành
Đã hoàn thành việc tích hợp Native System cho hệ điều hành Android. Bước này giúp ứng dụng CallBlocker có khả năng can thiệp trực tiếp vào các cuộc gọi đến ngay từ tầng hệ thống (OS level) thay vì chỉ giao diện hiển thị.

## 2. Các thay đổi chính đã thực hiện (Kotlin & Android)

- **`MatchingEngine.kt`**: 
  - Chuyển thể thuật toán Levenshtein và chuẩn hóa số điện thoại từ React Native sang Kotlin. Việc này giúp thuật toán so khớp chạy background với tốc độ cực nhanh, không có độ trễ khi có người gọi tới.

- **`CallScreenerService.kt`**:
  - Service kế thừa `android.telecom.CallScreeningService`.
  - Nhiệm vụ: Đánh chặn (Intercept) ngay lập tức khi cuộc gọi tới chưa đổ chuông.
  - Logic **Silent Reject**: Đã cài đặt tự động từ chối ngầm, không hiện thông báo cuộc gọi bị chặn tới người dùng (`setRejectCall(true)` và `setSkipNotification(true)`).
  - Logic **System Block**: Thêm thao tác đẩy (Insert) trực tiếp số điện thoại spam vào `BlockedNumberContract` của Android, để những lần gọi sau hệ thống OS sẽ tự động đá ra mà không cần qua App của chúng ta xử lý nữa.

- **`CallScreeningModule.kt` & `CallScreeningPackage.kt`**:
  - Tạo Bridge API để phía React Native có thể kích hoạt pop-up gọi hệ thống xin quyền cấp phép (`RoleManager.ROLE_CALL_SCREENING`).

- **Cấu hình App (Manifest & MainApplication)**:
  - Khai báo các quyền: `READ_PHONE_STATE`, `READ_CALL_LOG`, `READ_CONTACTS`, `WRITE_BLOCKED_NUMBERS`.
  - Khai báo Service cho Android OS nhận diện.

## 3. Tích hợp React Native (TypeScript)

- **`NativeCallScreening.ts`**:
  - Class bọc (Wrapper) cung cấp các hàm `requestRole()`, `syncData(...)` qua NativeModules.

- **`AppContext.tsx`**:
  - Viết Background Sync: Bất cứ khi nào màn hình cài đặt có thay đổi mới (`blockedNumbers` thêm, xóa, sửa hoặc chỉnh rating `strictness`), state sẽ gọi `NativeCallScreening.syncData()` để âm thầm đẩy vào `SharedPreferences` cho Service Native sẵn sàng sử dụng.

## 4. Xác minh (Verification)
- Toàn bộ native Android codebase đã được đóng gói thành các class độc lập không làm ảnh hưởng luồng React Native hiện tại.
- Để test, giờ đây bắt buộc phải chạy app lên điện thoại Android thực, sau đó đồng ý quyền làm **Caller ID & Spam**.
- App đã có thể chặn ngầm không thông báo, cộng dồn vào danh sách blacklist có sẵn của máy.
