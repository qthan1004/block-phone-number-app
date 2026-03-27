# Implementation Plan
## App Block Number Phone

**Version:** 1.0  
**Ngày tạo:** 2026-03-27  
**Ước tính thời gian:** ~3-5 ngày  

---

## Phase 1: Khởi tạo dự án (0.5 ngày)

### 1.1 Tạo React Native project
```bash
npx -y @react-native-community/cli init CallBlocker --template react-native-template-typescript
```

### 1.2 Cài đặt dependencies
```bash
# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# Storage
npm install @react-native-async-storage/async-storage

# SQLite
npm install react-native-sqlite-storage
npm install --save-dev @types/react-native-sqlite-storage

# UI Components
npm install react-native-paper react-native-vector-icons
npm install @react-native-community/slider

# Utils
npm install uuid
npm install --save-dev @types/uuid
```

### 1.3 Cấu hình TypeScript & ESLint
- Cập nhật `tsconfig.json` với strict mode
- Thêm path aliases (`@screens`, `@components`, `@services`, `@utils`)

---

## Phase 2: Data Layer (0.5 ngày)

### 2.1 Định nghĩa Types
- [ ] Tạo `src/types/index.ts` - Interfaces cho BlockedNumber, AppSettings, CallLogEntry

### 2.2 Storage Service
- [ ] Tạo `src/services/StorageService.ts`
  - `getBlockedNumbers(): Promise<BlockedNumber[]>`
  - `addBlockedNumber(number: BlockedNumber): Promise<void>`
  - `updateBlockedNumber(id: string, data: Partial<BlockedNumber>): Promise<void>`
  - `deleteBlockedNumber(id: string): Promise<void>`
  - `getSettings(): Promise<AppSettings>`
  - `updateSettings(settings: Partial<AppSettings>): Promise<void>`

### 2.3 Database Service (SQLite)
- [ ] Tạo `src/services/DatabaseService.ts`
  - `initDB(): Promise<void>` - Tạo table call_logs
  - `insertCallLog(entry: CallLogEntry): Promise<void>`
  - `getCallLogs(limit?: number): Promise<CallLogEntry[]>`
  - `clearCallLogs(): Promise<void>`

### 2.4 Context
- [ ] Tạo `src/contexts/AppContext.tsx`
  - Provider với state: blockedNumbers, settings, callLogs
  - Actions: add/update/delete number, update settings, refresh logs

---

## Phase 3: Matching Engine (0.5 ngày)

### 3.1 Utilities
- [ ] Tạo `src/utils/phoneUtils.ts` - normalizePhone(), formatPhone()
- [ ] Tạo `src/utils/levenshtein.ts` - levenshteinDistance(), calculateSimilarity()
- [ ] Tạo `src/utils/constants.ts` - DEFAULT_RATING, STORAGE_KEYS

### 3.2 Matching Service
- [ ] Tạo `src/services/MatchingService.ts`
  - `checkIncomingCall()` - Logic chính
  - Unit tests cho matching algorithm

### 3.3 Test cases cho Matching
```typescript
// Test plan
describe('MatchingEngine', () => {
  test('exact match = 100%', ...);
  test('1 digit diff ≈ 90%', ...);
  test('normalize +84 prefix', ...);
  test('normalize 84 prefix', ...);
  test('empty pattern list = allow', ...);
  test('rating 0 = block all', ...);
  test('rating 100 = exact match only', ...);
});
```

---

## Phase 4: UI Screens (1-1.5 ngày)

### 4.1 Navigation Setup
- [ ] Tạo `src/navigation/AppNavigator.tsx`
  - Bottom Tab Navigator: Numbers | Call Log | Settings
  - Stack Navigator cho Number Form (Add/Edit)

### 4.2 Settings Screen
- [ ] Tạo `src/screens/SettingsScreen.tsx`
  - Rating slider (0-100, default 75)
  - Service toggle (enable/disable)
  - Notification toggle
  - Clear call log button
  - Hiển thị trạng thái Call Screening role

### 4.3 Number List Screen
- [ ] Tạo `src/screens/NumberListScreen.tsx`
  - FlatList hiển thị danh sách số
  - FAB button thêm số mới
  - Swipe to delete
  - Search/filter

### 4.4 Number Form Screen
- [ ] Tạo `src/screens/NumberFormScreen.tsx`
  - Input số điện thoại (với validation)
  - Input label/ghi chú (optional)
  - Save/Cancel buttons
  - Chế độ Add/Edit

### 4.5 Call Log Screen
- [ ] Tạo `src/screens/CallLogScreen.tsx`
  - FlatList hiển thị lịch sử
  - Mỗi item: số gọi đến, số mẫu khớp, tỉ lệ, thời gian
  - Filter: All | Blocked | Allowed
  - Pull-to-refresh

### 4.6 Components
- [ ] `src/components/NumberItem.tsx` - Item trong danh sách
- [ ] `src/components/RatingSlider.tsx` - Custom slider
- [ ] `src/components/CallLogItem.tsx` - Item lịch sử
- [ ] `src/components/EmptyState.tsx` - Placeholder khi danh sách rỗng

---

## Phase 5: Native Module - Call Screening (1-1.5 ngày)

### 5.1 Kotlin Native Module
- [ ] Tạo `android/.../CallScreenerService.kt`
  - Extends `android.telecom.CallScreeningService`
  - Đọc data từ SharedPreferences
  - Chạy matching algorithm (Kotlin implementation)
  - Respond ALLOW/REJECT

- [ ] Tạo `android/.../MatchingEngine.kt`
  - Port thuật toán Levenshtein sang Kotlin
  - normalizePhone() Kotlin version

- [ ] Tạo `android/.../CallScreeningModule.kt`
  - React Native bridge module
  - `requestCallScreeningRole()` - Mở dialog xin quyền
  - `isCallScreeningEnabled()` - Check trạng thái
  - `syncData()` - JS → SharedPreferences

- [ ] Tạo `android/.../CallScreeningPackage.kt`
  - Register native module

### 5.2 Boot Receiver
- [ ] Tạo `android/.../BootReceiver.kt`
- [ ] Cập nhật `AndroidManifest.xml` - Đăng ký service + receiver + permissions

### 5.3 Data Sync
- [ ] Implement sync logic: khi user thay đổi data trong JS → gọi `syncData()` → cập nhật SharedPreferences
- [ ] CallScreenerService đọc từ SharedPreferences khi có cuộc gọi

---

## Phase 6: Integration & Testing (0.5 ngày)

### 6.1 Integration
- [ ] Kết nối UI với Native Module
- [ ] Khi app mở: check CallScreening role, request nếu chưa có
- [ ] Khi data thay đổi: auto sync xuống native
- [ ] Khi service chặn cuộc gọi: log vào SQLite, UI refresh

### 6.2 Testing Checklist

#### Unit Tests
```bash
# Chạy unit tests
npx jest --coverage
```

#### Manual Testing
| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| T-01 | Add number | Settings → Add → nhập "0901234567" → Save | Số xuất hiện trong danh sách |
| T-02 | Edit number | Tap edit trên item → sửa số → Save | Số được cập nhật |
| T-03 | Delete number | Swipe left hoặc tap delete → Confirm | Số bị xoá |
| T-04 | Change rating | Settings → kéo slider → 80% | Rating được lưu |
| T-05 | Block call (exact) | Gọi từ số đã thêm vào danh sách | Cuộc gọi bị chặn |
| T-06 | Block call (fuzzy) | Gọi từ số gần giống (>= rating) | Cuộc gọi bị chặn |
| T-07 | Allow call | Gọi từ số không matching | Cuộc gọi đi qua bình thường |
| T-08 | Call log | Sau khi chặn → vào Call Log | Thấy entry mới |
| T-09 | Reboot | Restart thiết bị → gọi test | Service vẫn hoạt động |
| T-10 | Service toggle | Tắt service → gọi test | Cuộc gọi đi qua |

---

## Phase 7: Build & Deploy (0.5 ngày)

### 7.1 Build APK
```bash
# Debug APK
cd android && ./gradlew assembleDebug

# Release APK (unsigned)
cd android && ./gradlew assembleRelease
```

### 7.2 Cài đặt
```bash
# Cài APK lên thiết bị qua ADB
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### 7.3 Post-install Setup
1. Mở app → Grant permissions khi được hỏi
2. Vào Settings → Set app làm "Caller ID & Spam" app
3. Thêm các số cần chặn
4. Test bằng cách gọi từ số khác

---

## Tổng kết Timeline

| Phase | Công việc | Thời gian |
|-------|-----------|-----------|
| 1 | Khởi tạo dự án | 0.5 ngày |
| 2 | Data Layer | 0.5 ngày |
| 3 | Matching Engine | 0.5 ngày |
| 4 | UI Screens | 1-1.5 ngày |
| 5 | Native Module | 1-1.5 ngày |
| 6 | Integration & Testing | 0.5 ngày |
| 7 | Build & Deploy | 0.5 ngày |
| **Tổng** | | **~4-5 ngày** |

---

## Rủi ro & Giải pháp

| Rủi ro | Xác suất | Giải pháp |
|--------|----------|-----------|
| OEM kill background service | Cao (Xiaomi, Huawei) | Hướng dẫn user tắt battery optimization |
| CallScreeningService không khả dụng | Thấp (API 29+) | Kiểm tra API level, hiển thị warning |
| React Native native module phức tạp | Trung bình | Có thể dùng Expo với custom dev client nếu cần |
| Performance matching với danh sách lớn | Thấp | Optimize: early termination, cache results |
