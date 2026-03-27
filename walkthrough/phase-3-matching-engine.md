# Phase 3: Matching Engine

Dự án: **CallBlocker**

## 1. Các bước đã làm

### Bước 1: Utility Functions
- **Trạng thái:** Hoàn tất
- **File:** `src/utils/levenshtein.ts`, `src/utils/phoneUtils.ts`
- **Ý nghĩa & Lý do:** 
  - `phoneUtils.ts`: Chuẩn hóa số điện thoại như xử lý đầu số quốc gia `+84` thành `0`, loại bỏ khoảng trắng, ký tự đặc biệt để đảm bảo việc so sánh tính chính xác.
  - `levenshtein.ts`: Thuật toán tính độ tương đồng của 2 chuỗi bằng `%`. Xử lý các phép thế, chèn, xóa ký tự.

### Bước 2: Matching Service
- **Trạng thái:** Hoàn tất
- **File:** `src/services/MatchingService.ts`
- **Ý nghĩa & Lý do:** Trung tâm logic tổng hợp của ứng dụng. Nhận số điện thoại từ Receiver, lặp qua danh sách số đang bị chặn, lấy `similarity = calculateSimilarityPercentage(incoming, rule)`. Nều `%` >= `AppSetting.rating` (vd 75%) thì trả về quyết định `isBlocked: true`.

### Bước 3: Unit Tests
- **Trạng thái:** Hoàn tất
- **File:** `src/__tests__/levenshtein.test.ts`, `src/__tests__/MatchingService.test.ts`, `src/__tests__/phoneUtils.test.ts`
- **Ý nghĩa & Lý do:** Đảm bảo hệ thống chặn hoạt động chính xác bằng Testing tự động. Thử nghiệm hơn 10 Test Cases cho các rủi ro khác nhau (ví dụ: `App Enabled` vs `App Disabled`, số tắt `84`, chuỗi khoảng trắng, threshold cận mức, ...).
- **Kết quả:** `PASS` 100%.

## 2. Kết luận Phase 3
- Hệ thống não bộ của App (Core Engine) đã hoàn chỉnh và được kiểm soát chất lượng qua Jest.
- Bước kế tiếp (Phase 4), tiến hành xây dựng các màn hình Giao diện UI (React Navigation, Paper) để người dùng thao tác nhập liệu với Data Layer và Engine đã có.

## 3. Kiểm thử trên Máy ảo (Verification)
- **Thiết lập:** Cập nhật UI tạm trên `App.tsx` bằng cách cung cấp dữ liệu giả (Mock `blockedNumbers` chứa mẫu `0987654000`) và thực hiện tính toán độ giống nhau với cuộc gọi mô phỏng `+84 987 654 321`.
- **Kết quả:** `MatchingService` đã bóc tách `+84`, loại bỏ khoảng trắng thành `0987654321`. Mức độ tương đồng là **70%** (do khác 3 ký tự đuôi). Nhỏ hơn Setting mặc định (75%), nên quyết định trả ra là `ALLOWED` (Cho phép gọi).
- Kết quả chạy trên React Native UI hoàn toàn khớp với tính toán thuật toán, chứng tỏ lớp logic đã tích hợp tốt với State.

![Matching Engine Simulator](/home/administrator/back up/App block number phone/walkthrough/screen-phase3-ok.png)
