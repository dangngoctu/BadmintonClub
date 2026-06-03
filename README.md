# 🏸 Quản lý sân cầu lông

Website **Frontend thuần (ReactJS + Vite)** quản lý 2 sân cầu lông. Dữ liệu được lưu **tự động trong trình duyệt (localStorage)** và có thể **xuất/nhập ra file JSON** để sao lưu.

## Chức năng

- **Quản lý sân**: Mở / đóng 2 sân cho đăng ký tham gia.
- **Đăng ký tham gia**: Khi sân mở, chọn người chơi đăng ký vào sân.
- **Lịch sử mở sân**: Mỗi lượt mở sân được lưu lại kèm thời gian, thời lượng và số người tham gia.
- **Trận đấu 2 vs 2**: Lập 2 đội từ người đã đăng ký, nhập tỉ số, lưu lịch sử thi đấu (tự xác định đội thắng).
- **Người chơi**: Thêm / sửa / xoá danh sách người chơi.
- **Xuất / Nhập JSON**: Sao lưu toàn bộ dữ liệu ra file `.json` và nạp lại khi cần.

## Cách chạy

```bash
npm install
npm run dev
```

Mở trình duyệt tại địa chỉ Vite in ra (mặc định http://localhost:5173).

Build bản production:

```bash
npm run build
npm run preview
```

## Lưu trữ dữ liệu

- Dữ liệu nằm trong `localStorage` của trình duyệt với khoá `badminton-data-v1`.
- Vì là app frontend thuần, trình duyệt **không thể tự ghi đè file JSON trên ổ đĩa**. Hãy dùng nút **⬇️ Xuất JSON** để tải file sao lưu và **⬆️ Nhập JSON** để khôi phục.

## Cấu trúc dự án

```
src/
  main.jsx                  điểm vào, bọc app trong StoreProvider
  App.jsx                   bố cục, điều hướng tab, xuất/nhập JSON
  index.css                 toàn bộ giao diện
  store/
    storage.js              đọc/ghi localStorage + dữ liệu mặc định
    StoreContext.jsx        state toàn cục + các hành động (actions)
  utils/
    helpers.js              định dạng thời gian, tra cứu tên
  components/
    CourtsPanel.jsx         quản lý sân + đăng ký tham gia
    PlayersPanel.jsx        quản lý người chơi
    MatchesPanel.jsx        tạo trận 2v2 + lịch sử trận
    MatchCard.jsx           thẻ hiển thị 1 trận (dùng chung)
    HistoryPanel.jsx        lịch sử mở sân + thống kê
```

## Mô hình dữ liệu (JSON)

```json
{
  "courts":   [{ "id": "court-1", "name": "Sân 1" }],
  "players":  [{ "id": "...", "name": "...", "createdAt": "..." }],
  "sessions": [{ "id": "...", "courtId": "court-1", "status": "active|closed",
                 "openedAt": "...", "closedAt": null, "participantIds": [] }],
  "matches":  [{ "id": "...", "sessionId": "...", "courtId": "court-1",
                 "teamA": ["id","id"], "teamB": ["id","id"],
                 "scoreA": 21, "scoreB": 18, "playedAt": "..." }]
}
```
