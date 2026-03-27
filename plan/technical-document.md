# Technical Design Document
## App Block Number Phone

**Version:** 1.0  
**Ngày tạo:** 2026-03-27  
**Tech Stack:** React Native (Android only)

---

## 1. Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────┐
│                   React Native App                   │
├──────────────────┬──────────────────────────────────┤
│   UI Layer       │   Native Module Layer            │
│  (JS/React)      │   (Java/Kotlin)                  │
│                  │                                  │
│  ┌────────────┐  │  ┌───────────────────────────┐   │
│  │ Settings   │  │  │ CallScreeningService      │   │
│  │ Screen     │  │  │ (extends                  │   │
│  ├────────────┤  │  │  CallScreeningService)    │   │
│  │ Number     │  │  ├───────────────────────────┤   │
│  │ List Screen│  │  │ BootReceiver              │   │
│  ├────────────┤  │  │ (auto-start on boot)      │   │
│  │ Call Log   │  │  ├───────────────────────────┤   │
│  │ Screen     │  │  │ MatchingEngine            │   │
│  └────────────┘  │  │ (Levenshtein algorithm)   │   │
│                  │  └───────────────────────────┘   │
├──────────────────┴──────────────────────────────────┤
│              AsyncStorage / SQLite                   │
│              (Local Persistence)                     │
└─────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack chi tiết

| Layer | Công nghệ | Mục đích |
|-------|-----------|----------|
| Framework | React Native 0.76+ | Cross-platform (chỉ dùng Android) |
| Language (JS) | TypeScript | Type safety cho JS layer |
| Language (Native) | Kotlin | Native module cho Android |
| Navigation | React Navigation v6 | Điều hướng màn hình |
| State Management | React Context + useReducer | Quản lý state đơn giản |
| Storage | AsyncStorage | Lưu settings + danh sách số |
| Database | SQLite (react-native-sqlite-storage) | Lưu call log history |
| Native API | Android CallScreeningService | Chặn cuộc gọi (API 29+) |
| UI Library | React Native Paper / Custom | UI components |

---

## 3. Cấu trúc dự án

```
App block number phone/
├── android/
│   └── app/src/main/java/com/callblocker/
│       ├── CallScreeningServiceModule.kt    # Native module bridge
│       ├── CallScreenerService.kt           # Android CallScreeningService
│       ├── BootReceiver.kt                  # BroadcastReceiver for auto-start
│       └── MatchingEngine.kt                # Levenshtein matching logic
├── src/
│   ├── screens/
│   │   ├── SettingsScreen.tsx               # Cấu hình rating
│   │   ├── NumberListScreen.tsx             # CRUD danh sách số
│   │   ├── NumberFormScreen.tsx             # Form thêm/sửa số
│   │   └── CallLogScreen.tsx               # Lịch sử cuộc gọi bị chặn
│   ├── components/
│   │   ├── NumberItem.tsx                   # Item trong danh sách số
│   │   ├── RatingSlider.tsx                 # Slider chỉnh rating
│   │   └── CallLogItem.tsx                  # Item lịch sử cuộc gọi
│   ├── services/
│   │   ├── StorageService.ts                # CRUD AsyncStorage
│   │   ├── DatabaseService.ts               # SQLite operations
│   │   └── MatchingService.ts               # JS-side matching (backup)
│   ├── utils/
│   │   ├── phoneUtils.ts                    # Normalize số điện thoại
│   │   ├── levenshtein.ts                   # Thuật toán Levenshtein
│   │   └── constants.ts                     # Hằng số (DEFAULT_RATING, etc.)
│   ├── contexts/
│   │   └── AppContext.tsx                   # Global state
│   ├── types/
│   │   └── index.ts                         # TypeScript interfaces
│   └── navigation/
│       └── AppNavigator.tsx                 # Stack navigator
├── plan/
│   ├── BRD.md
│   ├── technical-document.md
│   └── implementation-plan.md
├── package.json
├── tsconfig.json
└── app.json
```

---

## 4. Data Models

### 4.1 BlockedNumber (AsyncStorage)

```typescript
interface BlockedNumber {
  id: string;          // UUID
  phoneNumber: string; // Số mẫu (đã normalize)
  rawNumber: string;   // Số gốc user nhập
  label?: string;      // Ghi chú (optional)
  createdAt: number;   // Timestamp
  updatedAt: number;   // Timestamp
}
```

### 4.2 AppSettings (AsyncStorage)

```typescript
interface AppSettings {
  rating: number;          // 0-100, default: 75
  isServiceEnabled: boolean; // Bật/tắt service
  notifyOnBlock: boolean;    // Thông báo khi chặn
}
```

### 4.3 CallLog (SQLite)

```typescript
interface CallLogEntry {
  id: number;              // Auto-increment
  incomingNumber: string;  // Số gọi đến
  matchedPattern: string;  // Số mẫu khớp
  similarity: number;      // Tỉ lệ matching (%)
  action: 'BLOCKED' | 'ALLOWED';
  timestamp: number;       // Thời gian cuộc gọi
}
```

### 4.4 Storage Keys

```typescript
const STORAGE_KEYS = {
  BLOCKED_NUMBERS: '@call_blocker/blocked_numbers',
  SETTINGS: '@call_blocker/settings',
};
```

---

## 5. Core Algorithm - Matching Engine

### 5.1 Levenshtein Distance

```typescript
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= a.length; i++) matrix[i] = [i];
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[a.length][b.length];
}
```

### 5.2 Similarity Calculator

```typescript
function calculateSimilarity(incoming: string, pattern: string): number {
  const normalizedIncoming = normalizePhone(incoming);
  const normalizedPattern = normalizePhone(pattern);
  
  const distance = levenshteinDistance(normalizedIncoming, normalizedPattern);
  const maxLength = Math.max(normalizedIncoming.length, normalizedPattern.length);
  
  if (maxLength === 0) return 100;
  
  const similarity = (1 - distance / maxLength) * 100;
  return Math.round(similarity * 100) / 100; // 2 decimal places
}
```

### 5.3 Phone Number Normalizer

```typescript
function normalizePhone(phone: string): string {
  // Bỏ tất cả ký tự không phải số
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Xử lý prefix Việt Nam
  if (cleaned.startsWith('+84')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (cleaned.startsWith('84') && cleaned.length > 9) {
    cleaned = '0' + cleaned.substring(2);
  }
  
  return cleaned;
}
```

### 5.4 Matching Flow

```typescript
function checkIncomingCall(
  incomingNumber: string,
  patterns: BlockedNumber[],
  ratingThreshold: number
): { shouldBlock: boolean; matchedPattern?: BlockedNumber; similarity?: number } {
  
  for (const pattern of patterns) {
    const similarity = calculateSimilarity(incomingNumber, pattern.phoneNumber);
    
    if (similarity >= ratingThreshold) {
      return {
        shouldBlock: true,
        matchedPattern: pattern,
        similarity,
      };
    }
  }
  
  return { shouldBlock: false };
}
```

---

## 6. Native Module - Android Call Screening

### 6.1 CallScreenerService (Kotlin)

Sử dụng Android `CallScreeningService` (API 29+):

```kotlin
class CallScreenerService : CallScreeningService() {
    
    override fun onScreenCall(callDetails: Call.Details) {
        val phoneNumber = callDetails.handle?.schemeSpecificPart ?: return
        
        // Đọc danh sách số và rating từ SharedPreferences
        val patterns = loadBlockedNumbers()
        val rating = loadRating()
        
        // Chạy matching
        val result = MatchingEngine.check(phoneNumber, patterns, rating)
        
        val response = CallResponse.Builder()
        
        if (result.shouldBlock) {
            response.setDisallowCall(true)
            response.setRejectCall(true)
            response.setSkipCallLog(false)
            response.setSkipNotification(false)
            
            // Log cuộc gọi bị chặn
            logBlockedCall(phoneNumber, result)
        }
        
        respondToCall(callDetails, response.build())
    }
}
```

### 6.2 BootReceiver (Kotlin)

```kotlin
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            // Đảm bảo service sẵn sàng sau reboot
            // CallScreeningService tự quản lý bởi hệ thống
        }
    }
}
```

### 6.3 React Native Bridge

```kotlin
class CallScreeningModule(reactContext: ReactApplicationContext) 
    : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName() = "CallScreeningModule"
    
    @ReactMethod
    fun requestCallScreeningRole(promise: Promise) {
        // Request ROLE_CALL_SCREENING từ user
    }
    
    @ReactMethod
    fun isCallScreeningEnabled(promise: Promise) {
        // Check xem app có đang là default call screening app không
    }
    
    @ReactMethod
    fun syncData(numbersJson: String, rating: Int, promise: Promise) {
        // Đồng bộ data từ JS layer xuống SharedPreferences
        // để native service có thể đọc
    }
}
```

---

## 7. Luồng xử lý chính

### 7.1 Luồng chặn cuộc gọi

```
Cuộc gọi đến
    │
    ▼
Android System phát hiện incoming call
    │
    ▼
CallScreenerService.onScreenCall() được gọi
    │
    ▼
Đọc danh sách số từ SharedPreferences
    │
    ▼
Normalize số gọi đến
    │
    ▼
Loop qua từng pattern:
    │   ├─ Tính Levenshtein distance
    │   ├─ Tính similarity (%)
    │   └─ So sánh với rating threshold
    │
    ├─ Có pattern match (similarity >= rating)
    │   ├─ respondToCall(REJECT)
    │   └─ Ghi log vào SQLite
    │
    └─ Không có pattern match
        └─ respondToCall(ALLOW)
```

### 7.2 Luồng CRUD số mẫu

```
User thêm/sửa/xoá số trên UI
    │
    ▼
Cập nhật AsyncStorage (JS layer)
    │
    ▼
Gọi CallScreeningModule.syncData()
    │
    ▼
Cập nhật SharedPreferences (Native layer)
    │
    ▼
CallScreenerService sử dụng data mới
```

---

## 8. Permissions & Configuration

### 8.1 AndroidManifest.xml

```xml
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.READ_CALL_LOG" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

<application>
    <!-- Call Screening Service -->
    <service
        android:name=".CallScreenerService"
        android:permission="android.permission.BIND_SCREENING_SERVICE">
        <intent-filter>
            <action android:name="android.telecom.CallScreeningService" />
        </intent-filter>
    </service>
    
    <!-- Boot Receiver -->
    <receiver
        android:name=".BootReceiver"
        android:enabled="true"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.BOOT_COMPLETED" />
        </intent-filter>
    </receiver>
</application>
```

### 8.2 Yêu cầu hệ thống

| Yêu cầu | Giá trị |
|----------|---------|
| Min SDK | 29 (Android 10) |
| Target SDK | 34 (Android 14) |
| Compile SDK | 34 |
| React Native | 0.76+ |
| Node.js | 18+ |
| JDK | 17 |

---

## 9. UI/UX Design

### 9.1 Màn hình chính (Tab Navigation)

```
┌────────────────────────────────┐
│  📱 Call Blocker               │
├────────────────────────────────┤
│                                │
│  🔒 Service: ON    [Toggle]   │
│                                │
│  ┌──────────────────────────┐  │
│  │ Blocked Numbers     (5)  │  │
│  │ Rating: 75%              │  │
│  │ Calls Blocked Today: 3   │  │
│  └──────────────────────────┘  │
│                                │
├────────────────────────────────┤
│  [Numbers]  [Call Log]  [⚙️]   │
└────────────────────────────────┘
```

### 9.2 Màn hình Numbers List

```
┌────────────────────────────────┐
│  ← Blocked Numbers    [+ Add] │
├────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │ 📞 0901234567            │  │
│  │    Spam caller           │  │
│  │              [✏️] [🗑️]   │  │
│  ├──────────────────────────┤  │
│  │ 📞 0987654321            │  │
│  │    Telemarketing         │  │
│  │              [✏️] [🗑️]   │  │
│  └──────────────────────────┘  │
│                                │
│  Empty? "No blocked numbers"   │
└────────────────────────────────┘
```

### 9.3 Màn hình Settings

```
┌────────────────────────────────┐
│  ← Settings                   │
├────────────────────────────────┤
│                                │
│  Matching Rating               │
│  ┌──────────────────────────┐  │
│  │ ○────────●──────────○    │  │
│  │ 0%      75%        100%  │  │
│  └──────────────────────────┘  │
│                                │
│  Service                       │
│  ┌──────────────────────────┐  │
│  │ Enable Blocking  [ON]    │  │
│  │ Notify on Block  [ON]    │  │
│  │ Auto-start       [ON]    │  │
│  └──────────────────────────┘  │
│                                │
│  Data                          │
│  ┌──────────────────────────┐  │
│  │ Clear Call Log           │  │
│  │ Export Data              │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

---

## 10. Xử lý Edge Cases

| Case | Xử lý |
|------|-------|
| Số ẩn (private number) | Không matching, cho qua |
| Danh sách rỗng | Cho tất cả cuộc gọi qua |
| Rating = 0% | Chặn tất cả cuộc gọi |
| Rating = 100% | Chỉ chặn exact match |
| Số rất ngắn (VD: 113, 114) | Vẫn tính Levenshtein bình thường |
| Service bị kill bởi hệ thống | CallScreeningService được hệ thống quản lý, tự restart |
| Nhiều pattern match | Lấy pattern đầu tiên match (first-match wins) |

---

## 11. Giới hạn kỹ thuật

1. **CallScreeningService** chỉ có trên Android 10+ (API 29)
2. User phải **manually** set app làm default Call Screening app
3. Một số OEM (Xiaomi, Huawei, Samsung) có thể kill background service → cần hướng dẫn user tắt battery optimization
4. Không thể chặn cuộc gọi khẩn cấp (112, 113, 114, 115)
5. SharedPreferences dùng để sync data giữa JS ↔ Native vì CallScreeningService chạy trong process riêng
