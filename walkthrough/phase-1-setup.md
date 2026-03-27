# Phase 1: Khởi tạo dự án & Kiểm tra trên máy ảo

Dự án: **CallBlocker** (App chặn cuộc gọi bằng React Native)

## 1. Các bước đã làm

### Bước 1: Khởi tạo dự án React Native
- **Trạng thái:** Hoàn tất
- **Terminal command:** 
  ```bash
  npx -y @react-native-community/cli init CallBlocker --template react-native-template-typescript
  ```
- **Ý nghĩa & Lý do:** Câu lệnh này tải về và cài đặt bộ khung chuẩn (boilerplate) của React Native bằng TypeScript (hiện đại, an toàn hơn JavaScript). 

### Bước 2: Cài đặt Dependencies (Thư viện dùng cho dự án)
- **Trạng thái:** Hoàn tất
- **Terminal command:**
  ```bash
  npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack react-native-screens react-native-safe-area-context
  npm install @react-native-async-storage/async-storage react-native-sqlite-storage react-native-paper react-native-vector-icons @react-native-community/slider uuid
  npm install --save-dev @types/react-native-sqlite-storage @types/uuid
  ```
- **Ý nghĩa & Lý do:** Cài đặt toàn bộ các thư viện được yêu cầu ở Phase 1 (Data Layout, Navigate, Storage Database và Components UI). Việc cài tất cả ở đầu dự án giúp ta dễ dàng Link cấu hình Native C/C++ (Native Modules) một lần thay vì phải compile đi compile lại Gradle mỗi khi thêm 1 module mới.

### Bước 3: Cấu hình Alias (`paths` - Đường dẫn rút gọn)
- **Trạng thái:** Hoàn tất
- **Công việc:** Chỉnh sửa file code `tsconfig.json` và thêm cấu hình vào `babel.config.js`.
- **Ý nghĩa & Lý do:** Việc thiết lập Alias giúp chúng ta code "sạch hơn". Khi cần gọi tới một file khác, coder có thể import code ngắn gọn (ví dụ: `import { Button } from '@components/Button'` thay vì viết kiểu truy ngược tốn kém `../../components/Button`). Đặc biệt hữu ích khi thư mục dự án sâu dần.

### Bước 4: Chạy kiểm tra ứng dụng trên máy ảo Android (Verify Setup)
- **Trạng thái:** Hoàn tất
- **Terminal command:** 
  ```bash
  export ANDROID_HOME=/home/administrator/Android/Sdk
  export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
  
  npm run android
  ```
- **Ý nghĩa & Lý do:** Biên dịch (Build) code JavaScript và Native Android sang mã máy (file APK), cài đặt và chạy thử trên máy ảo (Pixel 6) để đảm bảo config khởi tạo thành công 100% trước khi team bắt tay làm Business Logic cốt lõi (Tránh trường hợp code đến đâu lỗi cấu hình đến đó).

---

## 2. Các Issues (Lỗi / Vấn đề) gặp phải

Dưới đây là ghi nhận 4 lỗi phức tạp chúng ta đã khắc phục để cài đặt dự án.

### Issue 1: Lỗi "adb / emulator not found in PATH"
- **Ở bước nào:** Sang Bước 4 (Chạy app trên máy ảo).
- **Nguyên nhân:** Command React Native không tự tìm và không nhận dạng được Android OS Emulator vì Biến môi trường (`$PATH`) của máy tính bạn chưa chứa đường dẫn đến thư mục cài đặt gốc chứa dòng lệnh SDK của Android.
- **Hướng xử lý:** Trước khi build, chúng ta inject biến `export ANDROID_HOME` và chèn đường dẫn command `.../emulator` cùng `.../platform-tools` vào đầu danh sách thực thi.

### Issue 2: Lỗi Gradle Failed "Android Gradle plugin requires Java 17"
- **Ở bước nào:** Bước 4 (Quá trình Build Gradle báo lỗi FAILED từ đầu).
- **Nguyên nhân:** Bắt đầu từ bản React Native 0.73 trở lên, Android Studio yêu cầu bắt buộc chạy cấu hình bằng Java phiên bản 17. Trong khi đó, máy cài Linux của bạn hiện tại mới chỉ để sẵn bộ source Java 11 từ SDKMAN.
- **Hướng xử lý:** Dùng tool SDKMAN cài đặt mới 1 bản Java 17 sạch (`sdk install java 17.0.18-tem`), sau đó cài đè bản này làm Default (`sdk default java 17.0.18-tem`). Quá trình này không ảnh hưởng đến Node/NPM.

### Issue 3: Lỗi Máy ảo không boot được do "ERROR: Not enough disk space"
- **Ở bước nào:** Chạy lệnh gọi giả lập Pixel 6 hiển thị màn hình (Bước 4).
- **Nguyên nhân:** Mặc dù máy tính bạn check thì còn dư tới 14GB, tuy nhiên chuẩn bảo mật nhân Linux luôn tự động "khóa" lại một vùng dung lượng ~5% của số Total Disk (tương đương 11GB) dành riêng cho tài khoản Root phục hồi sự cố. Tài khoản `administrator` lúc này của bạn thực tế chỉ còn được chia 1.1GB bộ nhớ - con số này không đủ mức cấp phát cấu hình an toàn (~2GB Disk Free) để bật hệ điều hành Android ảo.
- **Hướng xử lý:** Dùng lệnh `du -sh` dò tìm các file tạm, phát hiện thư mục cache nội bộ Node và Gradle chiếm size khổng lồ (`~/.npm` 23GB, `~/.cache` 25GB, `~/.gradle` 5.4GB). Quyết định xóa sạch cache NPM và Gradle (`rm -rf ~/.npm/_cacache ~/.gradle/caches`) để rã đông 27GB free list, giúp ổ ảo khởi chạy bình thường.

### Issue 4: Màn hình điện thoại gặp lỗi Đỏ "Unable to load script" 
- **Ở bước nào:** Máy ảo hiện lên xong rồi nhưng lại báo lỗi Đỏ rực thay vì load UI app (Bước 4).
- **Nguyên nhân:** Lỗi do kiến trúc NodeJS. Khi tôi tự động hóa lệnh `npm run android` ở background (chạy ngầm), Terminal đã chặn tiến trình đó mở ra một cửa sổ popup Server độc lập chạy **Metro Bundler**. Đây là trái tim của React Native (Server biên dịch JS sang máy ảo). Hệ quả là Emulator không thấy JS Bundle đâu.
- **Hướng xử lý:** 
  1. Tôi chạy thủ công kết nối cổng giữa PC và Mobile: `adb reverse tcp:8081 tcp:8081`. 
  2. Bật riêng 1 Server Metro ngầm mới (`npm start`).
  3. Gõ shortcut `Reload` (nhập lệnh phím `R`) trực tiếp từ Metro để yêu cầu Emulator load lại từ đầu kết nối của mình. Kết quả thành công.
