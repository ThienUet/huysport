# KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE) - SPORTX PLATFORM

> **Đồ án Tốt nghiệp**: Xây Dựng Hệ Thống Thương Mại Điện Tử Thể Thao Tích Hợp Chatbot Tư Vấn & Cổng Thanh Toán Trực Tuyến  
> **Sinh viên thực hiện**: Đinh Công Hùng (MSSV: 2200932)  
> **Kiến trúc**: Clean Layered Architecture (3-Tier) & Micro-service ready

---

## 1. Sơ đồ Tổng quan Kiến trúc Hệ thống

```
  ┌────────────────────────────────────────────────────────┐
  │                 CLIENT LAYER (Frontend)                │
  │  React 19 + TypeScript + Vite + Tailwind CSS + HeroUI  │
  │  - Global State: Zustand (Toast, Modals, UI state)     │
  │  - Server Cache & Async Data: @tanstack/react-query   │
  │  - HTTP Client: Axios Instance (Interceptors & Error)  │
  └───────────────────────────┬────────────────────────────┘
                              │ REST API (JSON)
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                 APPLICATION LAYER (Backend)            │
  │             Node.js + Express + TypeScript             │
  │                                                        │
  │  ┌───────────────┐ ┌───────────────┐ ┌──────────────┐  │
  │  │ Routes Layer  │ │  Middlewares  │ │ Error Handler│  │
  │  └───────┬───────┘ └───────┬───────┘ └──────────────┘  │
  │          ▼                 ▼                           │
  │  ┌──────────────────────────────────────────────────┐  │
  │  │                Controllers Layer                 │  │
  │  │ (Dashboard, Products, Orders, Customers, Chatbot)│  │
  │  └─────────────────────────┬────────────────────────┘  │
  │                            ▼                           │
  │  ┌──────────────────────────────────────────────────┐  │
  │  │            Domain Services & AI Engines          │  │
  │  │  - Size Calculation Engine (BMI + Physical stats)│  │
  │  │  - FAQ Natural Language Intent Matcher           │  │
  │  │  - VNPAY Sandbox HMAC-SHA512 Cryptography        │  │
  │  └─────────────────────────┬────────────────────────┘  │
  └────────────────────────────┼───────────────────────────┘
                               │ Data Access Layer
                               ▼
  ┌────────────────────────────────────────────────────────┐
  │                  DATA & PERSISTENCE LAYER              │
  │  - MongoDB 7.0 NoSQL Database (via Docker Compose)     │
  │  - Mongoose ODM Models & Schemas (Strict Typing)       │
  │  - Mongo-Express Visual Web Management (Port 8081)     │
  │  - Resilient In-Memory & ACID JSON Cache Sync          │
  └────────────────────────────────────────────────────────┘
```

---

## 2. Các công nghệ & Thư viện chủ đạo

| Thành phần | Công nghệ / Thư viện | Mục đích sử dụng |
|---|---|---|
| **Package Manager** | `pnpm` | Quản lý gói thư viện nhanh, tiết kiệm đĩa cứng và hỗ trợ monorepo |
| **Container & CSDL** | `Docker Compose` + `MongoDB 7.0` | Tự động hóa việc tải và khởi chạy máy chủ CSDL MongoDB |
| **Database ODM** | `Mongoose 8.x` | Xây dựng Schema, validation dữ liệu và thao tác NoSQL |
| **CSDL Web UI** | `Mongo-Express` | Giao diện quản trị và trực quan hóa các collections trên web |
| **Backend Runtime** | `Node.js (>= 18)` | Môi trường thực thi JavaScript bất đồng bộ hiệu năng cao |
| **Backend Framework** | `Express 4.x` | Bộ khung RESTful API gọn nhẹ, dễ mở rộng middleware |
| **Ngôn ngữ Backend** | `TypeScript` | Kiểm soát kiểu dữ liệu tĩnh nghiêm ngặt (Strict typing) |
| **Bảo mật & Mã hóa** | `crypto` + `bcryptjs` + `jwt` | Băm mật khẩu, tạo chữ ký số VNPAY Sandbox và cấp JWT Bearer |
| **Frontend Framework** | `React 19 + Vite` | Thư viện UI reactive thế hệ mới, tối ưu tốc độ build |
| **Data Fetching** | `@tanstack/react-query`| Cache dữ liệu máy chủ, tự động invalidate và re-fetch khi có mutation |
| **State Management** | `Zustand` | Quản lý state toàn cục nhẹ nhàng (Global Toast, UI Drawer) |
| **HTTP Request** | `Axios` | Kết nối API Backend với Base URL và xử lý interceptor |
| **UI Component & Style** | `Tailwind CSS 4` + `Lucide React` | Thiết kế giao diện hiện đại, responsive chuẩn e-commerce |

---

## 3. Luồng Xử lý Thanh toán VNPAY (Payment Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Khách hàng
    participant FE as Frontend (SportX)
    participant BE as Backend (Node.js API)
    participant VNP as VNPAY Sandbox Gateway

    User->>FE: Chọn đơn hàng & Click "Thanh toán qua VNPAY"
    FE->>BE: POST /api/payment/vnpay/create-payment-url (orderId, amount)
    BE->>BE: Sắp xếp tham số alpha-b & Ký mã hóa HMAC-SHA512 bằng HashSecret
    BE-->>FE: Trả về vnpayPaymentUrl
    FE->>VNP: Redirect người dùng sang cổng thanh toán VNPAY
    User->>VNP: Nhập thẻ ngân hàng / Quét mã VNPAY-QR & Xác thực OTP
    VNP-->>BE: Gửi Webhook IPN (GET /api/payment/vnpay/ipn) xác nhận thanh toán
    BE->>BE: Xác minh chữ ký SHA512 & Cập nhật Order `paymentStatus = 'Paid'`
    BE-->>VNP: Trả về { RspCode: "00", Message: "Confirm Success" }
    VNP-->>FE: Redirect người dùng về /payment/result kèm vnp_ResponseCode
    FE->>User: Hiển thị màn hình thông báo Đặt hàng thành công!
```

---

## 4. Luồng Xác thực & Phân quyền RBAC (JWT Authentication & Role Guard)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản trị / Nhân viên
    participant FE as Frontend Admin (React + Zustand)
    participant BE as Backend API (Express + JWT)
    participant DB as JSON ACID DataStore

    Admin->>FE: Nhập Email & Password (hoặc chọn 1-Click Demo)
    FE->>BE: POST /api/auth/login { email, password }
    BE->>DB: Tìm user & đối chiếu bcrypt.compareSync(password, hash)
    BE->>BE: Tạo JSON Web Token (payload: id, email, role, exp: 7d)
    BE-->>FE: Trả về { user, tokens: { accessToken, expiresIn } }
    FE->>FE: Lưu token & user vào Zustand Store + LocalStorage
    FE->>Admin: Chuyển hướng vào Trang Tổng Quan (Dashboard)

    Note over FE,BE: Mọi request tiếp theo tự động đính kèm header Bearer Token
    Admin->>FE: Truy cập menu /settings (Cài đặt hệ thống)
    FE->>FE: RoleGuard kiểm tra if (user.role === 'ADMIN')
    FE->>BE: GET /api/settings (Header: Authorization: Bearer <token>)
    BE->>BE: authenticate() verify JWT & authorizeRoles('ADMIN')
    alt Token hợp lệ và Role = ADMIN
        BE-->>FE: 200 OK + Dữ liệu cấu hình
        FE-->>Admin: Hiển thị màn hình Cài đặt
    else Role = STAFF
        BE-->>FE: 403 Forbidden ("Không đủ quyền hạn")
        FE-->>Admin: Hiển thị màn hình Cảnh báo giới hạn truy cập
    end
```

---

## 5. Hướng dẫn Khởi chạy Hệ thống với PNPM

### 4.1 Khởi chạy Backend (`huysports_be`)
```bash
cd huysports_be
pnpm install
pnpm build
pnpm start   # Hoặc pnpm dev để chạy với ts-node-dev trên Port 5000
```

### 4.2 Khởi chạy Frontend Admin (`huysports_admin`)
```bash
cd huysports_admin
pnpm install
pnpm build   # Kiểm tra và đóng gói dự án
pnpm dev     # Chạy máy chủ phát triển Vite tại http://localhost:5173
```
