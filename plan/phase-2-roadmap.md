# Phase 2 Roadmap: Advanced Call Blocker Features

Tài liệu này lưu trữ các ý tưởng và định hướng kiến trúc cho Phase 2 của ứng dụng Call Blocker. Mục tiêu là nâng cấp ứng dụng từ việc chặn cá nhân lên mức độ cao cấp hơn, hỗ trợ chia sẻ qua mạng lưới đám mây (Cloud Sync) và xây dựng bộ công cụ chặn theo luật đa điều kiện (Multi-Condition Rule Engine).

---

## 1. Cloud Blocklist (Tính năng Đồng bộ Firebase)
Chia sẻ cấu hình chặn và danh sách số rác phổ biến lên đám mây. Cộng đồng sẽ cùng đóng góp và sử dụng chung một tập rules chống spam (tương tự mô hình truecaller).

### 1.1 Yêu cầu nghiệp vụ
- Khởi tạo 1 project Firebase (sử dụng Firestore hoặc Realtime Database).
- App có tính năng "Tải danh sách cộng đồng". Khi nhấn, app sẽ GET danh sách trên đám mây về thiết bị và lưu vào bộ nhớ trong (`AsyncStorage`/`SQLite`).
- Mọi kiểm tra matching vẫn chạy hoàn toàn offline (dựa trên cache đã tải), đảm bảo thời gian chặn cuộc gọi `< 100ms`.

### 1.2 Hướng Nghiên Cứu (Research Items)
- **Công nghệ cần tích hợp:** Cài đặt package `@react-native-firebase/app` và `@react-native-firebase/firestore`.
- **Dữ liệu Merge (Gộp data):** Khi lấy data từ Firebase, phải xử lý gộp (merge) mà không ghi đè số do người dùng tự lưu.
  - *Giải pháp:* Trong model `BlockedNumber`, thêm cờ báo hiệu nguồn gốc (VD: `source: 'LOCAL' | 'CLOUD'`). Trên giao diện UI đánh dấu các số từ Cloud là Read-only (chỉ xem, không được xoá cục bộ).
- **Background Sync:** Nghiên cứu `WorkManager` trên Android để cho phép App chạy ngầm tải data Firebase mỗi ngày 1 lần vào ban đêm.

---

## 2. Multi-Condition Rule Engine (Công cụ chặn đa điều kiện)
Thay vì chỉ matching số trên Levenshtein, người dùng có thể tạo ra các "Luật" cực kỳ mạnh mẽ kết hợp nhiều điều kiện (IF-THEN).

### 2.1 Các dạng Luật (Rules) được đề xuất
1. **Chặn người lạ (Only Contacts):** Chặn mọi cuộc gọi nếu số điện thoại không có trong danh bạ máy.
2. **Chặn theo Mã vùng / Prefix:** Chặn toàn bộ cuộc gọi bắt đầu bằng những đầu số cụ thể (VD: chặn toàn bộ đầu +8424, 028).
3. **Chặn độ dài bất thường:** Chặn nếu tổng số chữ số < 8 hoặc > 12.
4. **Luật Ngoại Lệ (Whitelist Override):** Một danh sách "Số người thân" không bao giờ bị chặn dù bất kỳ luật nào có kết quả là BLOCK.

### 2.2 Hướng Nghiên Cứu & Kiến Trúc Kỹ Thuật
Quá trình tính toán luật nên thực hiện hoàn toàn dưới Native (Kotlin) để đảm bảo không bỏ sót / kẹt cuộc gọi.

- **Check Danh Bạ (Contacts Check):**  
  - Cần yêu cầu thêm quyền từ người dùng trong `AndroidManifest.xml`: `<uses-permission android:name="android.permission.READ_CONTACTS" />`
  - *Research:* Cần viết hàm Kotlin query vào `ContactsContract.PhoneLookup` để check xem `incomingNumber` có tồn tại Contact ID nào hay không.
- **Cấu trúc lưu Rule từ React Native sang Kotlin:**
  Bạn cần định nghĩa một mảng JSON các Luật. Ví dụ thiết kế UI trên React Native map ra JSON:
  ```json
  {
    "rules": [
      { "id": "1", "type": "WHITELIST", "value": "0988111222", "action": "ALLOW" },
      { "id": "2", "type": "ONLY_CONTACTS", "action": "BLOCK", "enabled": true },
      { "id": "3", "type": "PREFIX", "value": "024", "action": "BLOCK" }
    ]
  }
  ```
  Truyền chuỗi JSON này bằng `CallScreeningModule.syncData()` xuống SharedPreferences.
- **Thứ tự ưu tiên xử lý (Execution Order):**  
  Trong hàm `onScreenCall` của file `CallScreenerService.kt`, luôn phải check theo thứ bậc:
  `Whitelist -> Rules Engine -> Levenshtein Pattern Matching`. Nếu rơi vào Whitelist thì `return ALLOW` ngay lập tức.
