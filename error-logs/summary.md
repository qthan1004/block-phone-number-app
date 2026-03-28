# Build Error Summary - 2026-03-28

## Lỗi chính: `react-native-screens` không tương thích

### Nguyên nhân gốc
```
e: RNScreensPackage.kt:3:27 Unresolved reference: BaseReactPackage
e: RNScreensPackage.kt:19:26 Unresolved reference: BaseReactPackage
e: RNScreensPackage.kt:24:5 'createViewManagers' overrides nothing
e: RNScreensPackage.kt:45:5 'getModule' overrides nothing
e: RNScreensPackage.kt:55:5 'getReactModuleInfoProvider' overrides nothing
```

### Giải thích
- Package `react-native-screens` trong `node_modules` đang dùng API **mới** (`BaseReactPackage`) không tồn tại trong React Native **0.73.0** (dùng `TurboReactPackage` hoặc `ReactPackage` cũ).
- Nguyên nhân: Yarn install đã resolve `react-native-screens` phiên bản **mới nhất** (>= 4.x) thay vì phiên bản tương thích với RN 0.73.
- `package.json` khai báo `"react-native-screens": "^3.29.0"` nhưng yarn có thể đã resolve lên major version 4+ nếu npm registry cho phép.

### Giải pháp gợi ý
1. **Lock phiên bản `react-native-screens`** về đúng bản tương thích RN 0.73:
   ```bash
   yarn add react-native-screens@3.29.0
   ```
2. Hoặc nếu vẫn lỗi, thử:
   ```bash
   yarn add react-native-screens@~3.29.0
   ```
3. Kiểm tra lại tất cả deps có tương thích RN 0.73 không bằng:
   ```bash
   npx react-native info
   ```

### Environment đã config
- `ANDROID_HOME=D:\AndroidSDK`
- `JAVA_HOME=D:\gradle_home\jdks\eclipse_adoptium-17-amd64-windows\jdk-17.0.17+10` (Java 17)
- `GRADLE_USER_HOME=D:\gradle_home` (tránh lỗi khoảng trắng ở C:\Users\Quoc Thanh)

### Log file chi tiết
- `error-logs/build-error-20260328-144910.log`
