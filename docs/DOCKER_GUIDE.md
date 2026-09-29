# HƯỚNG DẪN TỰ ĐỘNG HÓA CƠ SỞ DỮ LIỆU MONGODB VỚI DOCKER COMPOSE & DATABASE MIGRATIONS

> **Dự án**: Website Bán Đồ Thể Thao Tích Hợp Chatbot & Thanh Toán Trực Tuyến  
> **Sinh viên thực hiện**: Đinh Công Hùng (MSSV: 2200932)  
> **CSDL**: MongoDB 7.0 + Mongo-Express Web UI + Mongoose ODM (Auto-Seeder & Migration CLI)

---

## 1. Tổng quan Kiến trúc Tự động hóa

Hệ thống được thiết kế với khả năng triển khai CSDL tự động 100% qua Docker Compose và công cụ quản lý Migration CLI viết bằng TypeScript.

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 DOCKER ENGINE COMPOSE                  │
                  │                                                        │
                  │   ┌─────────────────────┐    ┌─────────────────────┐   │
                  │   │   sportx_mongodb    │    │sportx_mongo_express │   │
                  │   │    (MongoDB 7.0)    │◄───│  (Web Admin UI)     │   │
                  │   │   Port 27017:27017  │    │   Port 8081:8081    │   │
                  │   └──────────┬──────────┘    └─────────────────────┘   │
                  │              │ Volume Mount                            │
                  │              ├─► sportx_mongo_data (Persistent)        │
                  │              └─► docker/mongo-init.js (Schema Init)    │
                  └────────────────────────────────────────────────────────┘
                                         ▲
                                         │ Mongoose Connection
                                         │ mongodb://localhost:27017/sportx_db
                  ┌──────────────────────┴─────────────────────────────────┐
                  │               SPORTX BACKEND (Node.js API)             │
                  │  - Auto-Seeding Collections on Boot                    │
                  │  - Migration CLI: pnpm db:fresh / db:seed / db:status  │
                  │  - 100% Real-time Mongoose Synchronization             │
                  └────────────────────────────────────────────────────────┘
```

---

## 2. Thông số Dịch vụ Docker (Services)

| Service Name | Container Name | Docker Image | Cổng (Port) | Init Script / Volume Mount | Mục đích |
|---|---|---|---|---|---|
| `mongodb` | `sportx_mongodb` | `mongo:7.0-jammy` | **`27017`** | `sportx_mongo_data`<br/>`docker/mongo-init.js` | Máy chủ CSDL NoSQL MongoDB chính |
| `mongo-express` | `sportx_mongo_express` | `mongo-express:latest` | **`8081`** | N/A | Giao diện Web trực quan quản trị Collections |

### Thông tin đăng nhập Mongo-Express Web UI:
- **URL**: `http://localhost:8081`
- **Username**: `admin`
- **Password**: `admin`

---

## 3. Quá trình Khởi tạo Docker (Docker Initialization)

File `docker/mongo-init.js` được mount trực tiếp vào `/docker-entrypoint-initdb.d/01-init.js:ro` trong container MongoDB:
- **Tự động tạo Database**: `sportx_db`
- **Tự động tạo 9 Collections**: `users`, `products`, `orders`, `customers`, `sizerules`, `faqs`, `chatsessions`, `coupons`, `settings`
- **Tự động tạo Unique & Compound Indexes**:
  - `users`: `{ id: 1 }` (unique), `{ email: 1 }` (unique)
  - `products`: `{ id: 1 }` (unique), `{ sku: 1 }` (unique), `{ category: 1 }`
  - `orders`: `{ id: 1 }` (unique), `{ orderNumber: 1 }` (unique), `{ fulfillmentStatus: 1 }`, `{ paymentStatus: 1 }`
  - `customers`: `{ id: 1 }` (unique), `{ email: 1 }` (unique), `{ tier: 1 }`
  - `sizerules`: `{ id: 1 }` (unique), `{ ruleCode: 1 }` (unique)
  - `faqs`: `{ id: 1 }` (unique), `{ intent: 1 }`
  - `chatsessions`: `{ id: 1 }` (unique)
  - `coupons`: `{ id: 1 }` (unique), `{ code: 1 }` (unique)

---

## 4. Các lệnh Docker Thao tác nhanh

### 4.1 Khởi động Docker CSDL
```bash
docker compose up -d
```
> *Tải MongoDB 7.0 & Mongo-Express, tự động chạy `mongo-init.js` khi volume rỗng.*

### 4.2 Kiểm tra trạng thái Container
```bash
docker compose ps
```

### 4.3 Xem Logs hoạt động
```bash
docker compose logs -f mongodb
```

### 4.4 Dừng CSDL (Dữ liệu vẫn được giữ an toàn trong Volume)
```bash
docker compose stop
```

### 4.5 Reset hoàn toàn dữ liệu Docker từ đầu
```bash
docker compose down -v
docker compose up -d
```

---

## 5. Công cụ Database Migration CLI (`src/db/migrate.ts`)

Backend cung cấp công cụ dòng lệnh Migration mạnh mẽ với các Flags chuyên dụng:

| Lệnh `pnpm` | Cú pháp CLI | Ý nghĩa & Hành động thực thi |
|---|---|---|
| `pnpm db:status` | `tsx src/db/migrate.ts --status` | Xem kết nối MongoDB & bảng thống kê số lượng bản ghi của 9 Collections |
| `pnpm db:fresh` | `tsx src/db/migrate.ts --fresh` | **Fresh Migration**: Xóa toàn bộ collections, đồng bộ lại indexes, và nạp mới 100% demo data |
| `pnpm db:seed` | `tsx src/db/migrate.ts --seed` | Nạp demo data vào các collection còn rỗng mà không xóa dữ liệu đang có |
| `pnpm db:drop` | `tsx src/db/migrate.ts --drop` | Xóa sạch toàn bộ collections trong `sportx_db` |
| `pnpm db:migrate` | `tsx src/db/migrate.ts` | Khởi tạo bảng, kiểm tra index và seed dữ liệu nếu thiếu |
| `pnpm db:help` | `tsx src/db/migrate.ts --help` | Hiển thị hướng dẫn sử dụng CLI |

---

## 6. Dữ liệu Mẫu Khởi tạo Mặc định (Seed Data)

Khi chạy `pnpm db:fresh` hoặc khởi động Backend lần đầu, các tài khoản và dữ liệu sau sẽ được nạp sẵn:

### Tài khoản Đăng nhập Hệ thống:
1. **Super Admin**:
   - Email: `admin@sportx.store`
   - Password: `Admin@123456`
   - Quyền hạn: Toàn quyền truy cập tất cả module (Dashboard, Orders, Products, Customers, Chatbot, AI Rules, Settings).
2. **Staff (Nhân viên)**:
   - Email: `staff@sportx.store`
   - Password: `Staff@123456`
   - Quyền hạn: Quản lý đơn hàng, kho hàng và trả lời tin nhắn khách hàng.
3. **Customer (Khách hàng mẫu)**:
   - Email: `customer@sportx.store`
   - Password: `Customer@123456`
   - Quyền hạn: Lịch sử đơn hàng, tích điểm thành viên, tư vấn kích cỡ.
