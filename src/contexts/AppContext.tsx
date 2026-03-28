import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {BlockedNumber, AppSettings, CallLogEntry} from '../types';
import {StorageService} from '../services/StorageService';
import {DatabaseService} from '../services/DatabaseService';
import {NativeCallScreening} from '../services/NativeCallScreening';

/**
 * Interface mô tả luồng Schema "State chung" cho hệ thống,
 * bao gồm cả State Tĩnh (Settings, List) và các Action/Method
 * có thể gọi từ giao diện thiết kế Screens thông qua Hooks
 */
interface AppContextData {
  settings: AppSettings;
  blockedNumbers: BlockedNumber[];
  callLogs: CallLogEntry[];
  isLoading: boolean; // Trạng thái Load dữ liệu (Hiển thị Splash Loader khi = true)

  // Handlers CRUD Action
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  addBlockedNumber: (number: BlockedNumber) => Promise<void>;
  updateBlockedNumber: (
    id: string,
    data: Partial<BlockedNumber>,
  ) => Promise<void>;
  deleteBlockedNumber: (id: string) => Promise<void>;
  refreshCallLogs: () => Promise<void>;
  clearCallLogs: () => Promise<void>;
}

// Khởi tạo Empty API Context
const AppContext = createContext<AppContextData>({} as AppContextData);

/**
 * AppProvider (Wrapper/Container Box).
 * Được đặt tại Root Index của ứng dụng (Thường là `App.tsx`).
 * Box này sẽ quản lý toàn bộ Data layer bên trong và phân phát cho toàn dự án cục bộ.
 */
export const AppProvider = ({children}: {children: ReactNode}) => {
  // === LOCAL REACT STATES ===
  const [settings, setSettings] = useState<AppSettings>({
    rating: 75,
    isServiceEnabled: true,
    notifyOnBlock: true,
  });
  const [blockedNumbers, setBlockedNumbers] = useState<BlockedNumber[]>([]);
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // === INIT & LOAD DATA FUNCTIONS ===

  // Tải dữ liệu Cấu hình List từ JSON Storage
  const loadData = async () => {
    try {
      const [loadedSettings, loadedNumbers] = await Promise.all([
        StorageService.getSettings(),
        StorageService.getBlockedNumbers(),
      ]);

      if (loadedSettings) {
        setSettings(loadedSettings);
      }
      setBlockedNumbers(loadedNumbers);
    } catch (error) {
      console.error('Không thể load dữ liệu từ bộ nhớ cố định', error);
    }
  };

  // Khởi chạy file DB hệ thống, sau đó Fetch Query danh sách lịch sử Call Log SQL
  const initDbAndLoadLogs = async () => {
    try {
      await DatabaseService.initDB();
      const logs = await DatabaseService.getCallLogs();
      setCallLogs(logs);
    } catch (error) {
      console.error('Không thể render Load Database/Logs', error);
    }
  };

  /**
   * Hook Lifecycle `useEffect` chỉ chạy logic Data 1 LẦN DUY NHẤT
   * khi App mở lên lần đầu tiên qua màn hình Loading Splash.
   */
  useEffect(() => {
    const init = async () => {
      setIsLoading(true); // Khoá UI chờ data DB lấy lên
      await Promise.all([loadData(), initDbAndLoadLogs()]);
      setIsLoading(false); // Cập nhật xong mở Component ra
    };
    init();
  }, []);

  /**
   * Đồng bộ Data xuống Native Module mỗi khi list bị thay đổi
   */
  useEffect(() => {
    if (!isLoading) {
      NativeCallScreening.syncData(blockedNumbers, settings);
    }
  }, [blockedNumbers, settings, isLoading]);

  // === MUTATION ACTIONS (Sửa đổi & Đồng bộ với App Layer) ===

  // Cập nhật Cài Đặt (Ví dụ kéo thanh slider 75%)
  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    await StorageService.updateSettings(newSettings);
    // Vừa lưu xuống Storage, vừa Push Data mới vào Live React State App
    setSettings(prev => ({...prev, ...newSettings}));
  };

  // Nút: Lưu Mẫu Chặn Call
  const handleAddBlockedNumber = async (number: BlockedNumber) => {
    await StorageService.addBlockedNumber(number);
    setBlockedNumbers(prev => [...prev, number]); // Load array list mới ra Table
  };

  // Nút: Chỉnh Sửa ghi chú/sdt bịặn theo ID
  const handleUpdateBlockedNumber = async (
    id: string,
    data: Partial<BlockedNumber>,
  ) => {
    await StorageService.updateBlockedNumber(id, data);
    setBlockedNumbers(prev =>
      prev.map(n => (n.id === id ? {...n, ...data, updatedAt: Date.now()} : n)),
    );
  };

  // Nút: Xoá bỏ khỏi List chặn (Trash)
  const handleDeleteBlockedNumber = async (id: string) => {
    await StorageService.deleteBlockedNumber(id);
    setBlockedNumbers(prev => prev.filter(n => n.id !== id));
  };

  // Nút: Bấm Load/Vuốt Lên màn Logging History Call Block (Sync Fetch Refresh SQLite Database)
  const refreshCallLogs = async () => {
    const logs = await DatabaseService.getCallLogs();
    setCallLogs(logs);
  };

  // Nút Tùy chọn: Xoá sạch History Data Trash (Flush Screen)
  const handleClearCallLogs = async () => {
    await DatabaseService.clearCallLogs();
    setCallLogs([]);
  };

  // === RENDER HỘP CHỨA CONTAINER DATA ===
  return (
    <AppContext.Provider
      value={{
        settings,
        blockedNumbers,
        callLogs,
        isLoading,
        updateSettings: handleUpdateSettings,
        addBlockedNumber: handleAddBlockedNumber,
        updateBlockedNumber: handleUpdateBlockedNumber,
        deleteBlockedNumber: handleDeleteBlockedNumber,
        refreshCallLogs,
        clearCallLogs: handleClearCallLogs,
      }}>
      {children}
    </AppContext.Provider>
  );
};

// === GLOBAL HOOK EXPORTER ===
/**
 * Hook `useApp()` tùy chỉnh, thay vì User phải import lằng nhằng AppContext, thì chỉ
 * gọi `const appInfo = useApp();` ngay trong File Code UI sau này.
 */
export const useApp = () => useContext(AppContext);
