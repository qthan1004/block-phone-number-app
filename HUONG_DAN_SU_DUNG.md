# Hướng Dẫn Sử Dụng Ứng Dụng Chặn Cuộc Gọi (Call Blocker App)

Chào mừng bạn đến với ứng dụng **Call Blocker**! 
Ứng dụng giúp bạn tự động nhận diện và chặn các cuộc gọi rác, lừa đảo, hoặc quảng cáo dựa trên danh sách các "số mẫu" (pattern) mà bạn tự định nghĩa. Điểm đặc biệt và thông minh nhất của ứng dụng là sử dụng **tỉ lệ tương đồng** (Matching Rating). Bạn không cần phải nhập chính xác 100% số điện thoại để chặn; nếu số gọi đến giống với số mẫu theo một tỉ lệ phần trăm nhất định, cuộc gọi sẽ tự động bị từ chối.

---

## 1. Màn hình Dashboard (Cấu Hình & Tổng Quan)
Đây là màn hình chính khi bạn mở ứng dụng, hiển thị trạng thái hoạt động và các cấu hình cốt lõi.

- **Kích hoạt Dịch vụ (Enable Service):** Bạn có thể bật hoặc tắt tính năng chặn cuộc gọi bất cứ lúc nào qua công tắc (Toggle).
- **Tỉ lệ Tương đồng (Matching Rating):** Nhập giá trị phần trăm (từ 0 đến 100) để thay đổi mức độ chặn.
  - Mức mặc định là **75%**.
  - **Ví dụ:** Bạn có lưu số mẫu là `0901234567`. Nếu số gọi đến là `0901234568` (chỉ sai 1 số cuối), hệ thống tính toán độ giống nhau là **90%**. Do 90% lớn hơn 75%, cuộc gọi này sẽ tự động bị **chặn**.
  - Nếu bạn nhập **100**, ứng dụng sẽ chỉ chặn khi số gọi đến giống chính xác 100% so với số mẫu trong danh sách đen.
- **Xoá Lịch Sử (Clear Call Log):** Nhấn nút này để xoá toàn bộ danh sách các cuộc gọi rác đã bị chặn trước đó.

---

## 2. Màn hình Blocklist (Danh Sách Chặn)
Nơi bạn quản lý các đầu số / số điện thoại mẫu dùng để so sánh.

- **Thêm số mới:** Nhấn vào nút Thêm để nhập một số điện thoại mẫu mới vào danh sách bị chặn. Cùng với số điện thoại, bạn có thể kèm theo một số ghi chú/nhãn (Label) như *"Spa quảng cáo"*, *"BĐS"*, để dễ nhớ lý do chặn.
- **Chỉnh sửa / Xoá:** Nếu nhập sai hoặc đổi ý không muốn chặn mẫu đó nữa, bạn hoàn toàn có thể nhấn sửa lại số hoặc xoá số đó khỏi Blocklist.
- **Chuẩn hoá thông minh:** Hệ thống hỗ trợ nhận diện các đầu số Việt Nam. Đầu số `+84-` hoặc `0` đều được ứng dụng hiểu và gom về cùng một số, vì thế bạn có thể nhập số theo bất kỳ định dạng nào.

---

## 3. Màn hình Call Log (Lịch Sử Chặn Cuộc Gọi)
Nơi lưu lại các "chiến tích" của ứng dụng: danh sách các cuộc gọi lừa đảo, rác đã bị tự động từ chối.

- **Nhóm theo ngày (Date-Grouping):** Để dễ theo dõi, lịch sử được tự động gom nhóm gọn gàng theo từng khoảng thời gian (Hôm nay, Hôm qua, Tuần này...).
- **Thông tin chi tiết:** Mỗi dòng lịch sử bị chặn cung cấp các thông tin rất trực quan:
  - **Số điện thoại:** Đã gọi đến máy bạn.
  - **Số mẫu:** Số trong danh sách Blocklist của bạn đã "bắt bài" số này.
  - **Tỉ lệ khớp:** Phần trăm trùng khớp (Similarity %) khiến ứng dụng ra quyết định chặn.
  - **Thời gian:** Giờ và phút cuộc gọi diễn ra.

---

## 4. Các Lưu Ý Quan Trọng Để App Hoạt Động Tốt

Bởi vì ứng dụng can thiệp trực tiếp vào chức năng nghe/gọi của điện thoại Android, người dùng lưu ý các vấn đề sau để tránh lỗi:

1. **Cấp quyền hệ thống:** Trong lần đầu tiên chạy app, hệ thống sẽ đòi hỏi quyền quản lý và sàng lọc cuộc gọi (`Call Screening` và `Read Phone State`). Bạn **bắt buộc phải đồng ý** và thiết lập app làm **Ứng dụng Sàng Lọc Cuộc Gọi Mặc Định (Default Call Screening App)**. Nếu không, chức năng chặn cuộc gọi nền sẽ không thể diễn ra.
2. **Xung đột Tiết kiệm Pin (Battery Optimization):** App được thiết kế để tự động chạy ngầm, kể cả khi bạn khởi động lại máy (reboot). Tuy nhiên, trên một vài phiên bản tùy biến như MIUI (Xiaomi), ColorOS (OPPO) hay OneUI (Samsung), trình quản lý pin của Android có thể tự "giết" ứng dụng chạy ngầm. Để app luôn sống, bạn hãy vào `Cài Đặt (Settings) -> Quản lý Pin (Battery) -> Cho phép ứng dụng chạy chế độ Không Hạn Chế (Unrestricted) / Tắt tính năng tối ưu hoá pin cho ứng dụng này`.
3. **Số Khẩn Cấp:** Tuyệt đối an tâm rằng ứng dụng sẽ mặc định bỏ qua (luôn luôn cho qua) các cuộc gọi dịch vụ khẩn cấp (113, 114, 115,...), không phụ thuộc vào thiết lập của bạn.
