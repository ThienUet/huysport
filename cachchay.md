# 🚀 HƯỚNG DẪN CHẠY VÀ QUẢN LÝ DỰ ÁN SPORTX (MONOREPO)

Dự án **SportX** được quản lý theo mô hình **pnpm monorepo** tại thư mục gốc `HuyHung`, bao gồm 3 ứng dụng chính:
- **`huysports_be`**: Backend API (Node.js + Express + TypeScript + MongoDB).
- **`huysports_client`**: Website khách hàng mua sắm (Next.js 15 + Tailwind CSS).
- **`huysports_admin`**: Trang quản trị hệ thống SportX Admin (React + Vite + Tailwind CSS).

---

## 📋 1. Yêu cầu môi trường (Prerequisites)

- **Node.js**: Phiên bản `>= 18.x` hoặc `>= 20.x`
- **pnpm**: Đã cài đặt global (`npm install -g pnpm`)
- **Docker Desktop**: (Tùy chọn) Dùng để khởi chạy nhanh MongoDB & Mongo Express.

---

## ⚡ 2. Hướng dẫn khởi động nhanh (Quick Start)

Mở Terminal / PowerShell tại thư mục gốc **`HuyHung`**:

### Bước 1: Khởi động Database (Nếu dùng Docker)
```bash
docker-compose up -d
```
> Database MongoDB sẽ chạy tại cổng `27017` và trang quản lý dữ liệu trực quan Mongo Express tại `http://localhost:8081` (user/pass: `admin`/`admin`).

### Bước 2: Cài đặt toàn bộ dependencies
Chỉ cần chạy 1 lệnh duy nhất tại thư mục gốc, hệ thống sẽ tự động cài đặt cho cả 3 project:
```bash
pnpm install
```

### Bước 3: Khởi tạo dữ liệu mẫu cho Backend (Seed Data)
```bash
pnpm --filter huysports_be run db:fresh
```

### Bước 4: Chạy đồng thời tất cả các ứng dụng
```bash
pnpm run dev
```
*(Lệnh này sẽ tự động bật đồng thời cả Backend API, Frontend Client và Admin Dashboard)*.

---

## 🛠️ 3. Danh sách các lệnh điều khiển tại thư mục gốc (`HuyHung`)

| Lệnh | Chức năng |
| :--- | :--- |
| `pnpm start:demo` | **🚀 Build 2 Frontend + Backend rồi chạy bản Build Production** (Tốc độ tối đa, mượt mà, không giật lag) |
| `pnpm run dev` | **Chạy đồng thời** cả 3 project (Admin + Client + BE) ở chế độ Dev |
| `pnpm run dev:admin` | Chỉ chạy riêng giao diện **Admin Dashboard** |
| `pnpm run dev:client` | Chỉ chạy riêng giao diện **Website Khách hàng (Client)** |
| `pnpm run dev:be` | Chỉ chạy riêng **Backend API Server** |
| `pnpm run build` | **Build toàn bộ** các dự án để chuẩn bị deploy/production |
| `pnpm run clean-source` | **Xóa sạch toàn bộ `node_modules` và cache build** trên toàn bộ dự án |

---

## 📦 4. Lệnh chạy riêng cho từng Module (Nếu muốn thao tác lẻ)

### A. Backend (`huysports_be`)
Chạy từ thư mục gốc thông qua `--filter` hoặc `cd huysports_be`:
- Chạy dev server: `pnpm --filter huysports_be dev`
- Khởi tạo lại toàn bộ database + seed mẫu: `pnpm --filter huysports_be run db:fresh`
- Chỉ chạy nạp dữ liệu mẫu: `pnpm --filter huysports_be run db:seed`
- Kiểm tra trạng thái DB: `pnpm --filter huysports_be run db:status`
- Xóa sạch dữ liệu DB: `pnpm --filter huysports_be run db:drop`

### B. Admin (`huysports_admin`)
- Chạy dev server: `pnpm --filter huysports_admin dev`
- Build dự án: `pnpm --filter huysports_admin build`

### C. Client (`huysports_client`)
- Chạy dev server: `pnpm --filter huysports_client dev`
- Build dự án: `pnpm --filter huysports_client build`
- Chạy bản build: `pnpm --filter huysports_client start`

---

## 🧹 5. Dọn dẹp mã nguồn trước khi đẩy Git hoặc nén gửi

Khi muốn dọn sạch `node_modules`, `.next`, `dist` để tiết kiệm dung lượng hoặc giải phóng bộ nhớ:

```bash
pnpm run clean-source
```

Khi muốn cài đặt lại để tiếp tục phát triển:
```bash
pnpm install
```

---

## 🌐 6. Địa chỉ truy cập mặc định (Default Endpoints)

| Ứng dụng | Địa chỉ URL | Ghi chú |
| :--- | :--- | :--- |
| **Website Client** | `http://localhost:3000` | Giao diện mua sắm khách hàng |
| **Admin Dashboard** | `http://localhost:5173` | Trang quản trị hệ thống SportX |
| **Backend API** | `http://localhost:5000/api` | RESTful API Endpoints |
| **Mongo Express UI** | `http://localhost:8081` | Quản trị DB trực quan (admin/admin) |
