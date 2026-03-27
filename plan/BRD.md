# Business Requirements Document (BRD)
## App Block Number Phone

**Version:** 1.0  
**Ngày tạo:** 2026-03-27  
**Trạng thái:** Draft  

---

## 1. Tổng quan dự án

### 1.1 Mục tiêu
Xây dựng ứng dụng Android chặn cuộc gọi đến từ các số điện thoại khớp (matching) với danh sách mẫu (pattern) đã được cấu hình trước, dựa trên tỉ lệ tương đồng (rating) có thể tuỳ chỉnh.

### 1.2 Phạm vi
- **Nền tảng:** Android only (không publish lên Store)
- **Công nghệ:** React Native
- **Đối tượng sử dụng:** Cá nhân (internal use)
- **Phân phối:** Build APK cài trực tiếp trên thiết bị

---

## 2. Yêu cầu nghiệp vụ

### 2.1 Màn hình Settings

| # | Yêu cầu | Mô tả |
|---|---------|-------|
| BR-01 | Cấu hình Rating | Cho phép người dùng cấu hình tỉ lệ matching mặc định, giá trị default = **75%**, range: 0-100% |
| BR-02 | Thêm số mẫu | Người dùng có thể thêm mới một số điện thoại/pattern vào danh sách chặn |
| BR-03 | Xem danh sách | Hiển thị toàn bộ danh sách các số mẫu đã thêm |
| BR-04 | Sửa số mẫu | Cho phép chỉnh sửa số mẫu đã tồn tại |
| BR-05 | Xoá số mẫu | Cho phép xoá số mẫu khỏi danh sách |

### 2.2 Chức năng chặn cuộc gọi

| # | Yêu cầu | Mô tả |
|---|---------|-------|
| BR-06 | Lắng nghe cuộc gọi đến | App chạy background service, tự động phát hiện khi có cuộc gọi đến |
| BR-07 | Matching số | So sánh số gọi đến với từng số trong danh sách mẫu, tính tỉ lệ tương đồng |
| BR-08 | Chặn cuộc gọi | Nếu tỉ lệ matching >= rating đã cấu hình → tự động chặn (reject) cuộc gọi |
| BR-09 | Ghi log | Ghi lại lịch sử các cuộc gọi bị chặn (số gọi đến, số mẫu khớp, tỉ lệ matching, thời gian) |

---

## 3. Quy tắc nghiệp vụ

### 3.1 Thuật toán Matching
- Sử dụng **Levenshtein Distance** (Edit Distance) hoặc thuật toán tương đương để tính tỉ lệ tương đồng giữa hai chuỗi số
- **Công thức tính rating:**
  ```
  similarity = 1 - (levenshtein_distance(incoming, pattern) / max(len(incoming), len(pattern)))
  rating = similarity * 100 (%)
  ```
- So sánh **từ phải sang trái** (vì số điện thoại thường có prefix khác nhau: +84, 0, ...)
- Normalize số trước khi so sánh: loại bỏ khoảng trắng, dấu gạch ngang, xử lý prefix quốc gia

### 3.2 Ví dụ Matching

| Số gọi đến | Số mẫu | Similarity | Rating 75% | Kết quả |
|------------|---------|------------|------------|---------|
| 0901234567 | 0901234567 | 100% | ✅ >= 75% | **CHẶN** |
| 0901234568 | 0901234567 | 90% | ✅ >= 75% | **CHẶN** |
| 0901234000 | 0901234567 | 70% | ❌ < 75% | **CHO QUA** |
| 0909999999 | 0901234567 | 40% | ❌ < 75% | **CHO QUA** |

### 3.3 Xử lý prefix quốc gia
- `+84901234567` và `0901234567` được coi là **cùng một số**
- Trước khi matching, normalize về dạng thống nhất (bỏ prefix `+84`, thay bằng `0`)

---

## 4. Yêu cầu phi chức năng

| # | Yêu cầu | Mô tả |
|---|---------|-------|
| NFR-01 | Performance | Quá trình matching phải hoàn thành trong < 100ms để không ảnh hưởng cuộc gọi |
| NFR-02 | Battery | Service chạy nền tối ưu, không tiêu hao pin quá mức |
| NFR-03 | Persistence | Dữ liệu (danh sách số, settings) phải được lưu trữ persistent trên thiết bị |
| NFR-04 | Auto-start | App tự khởi động lại service sau khi reboot thiết bị |
| NFR-05 | Permission | App cần xin quyền: READ_PHONE_STATE, CALL_SCREENING, READ_CALL_LOG |

---

## 5. Giới hạn & Ràng buộc

- Chỉ hỗ trợ Android (API level 24+, Android 7.0+)
- Không publish lên Google Play Store
- Không cần backend/server, toàn bộ dữ liệu lưu local
- Không cần đăng nhập/xác thực
- Call Screening API yêu cầu Android 10+ (API 29) để chặn cuộc gọi trực tiếp

---

## 6. Acceptance Criteria

1. ✅ Người dùng có thể thêm/sửa/xoá số mẫu trong danh sách
2. ✅ Người dùng có thể thay đổi tỉ lệ rating (0-100%)
3. ✅ App tự động chặn cuộc gọi khi tỉ lệ matching >= rating
4. ✅ App chạy nền và tự khởi động sau reboot
5. ✅ Lịch sử cuộc gọi bị chặn được lưu và hiển thị
6. ✅ Build APK thành công và cài đặt được trên thiết bị Android
