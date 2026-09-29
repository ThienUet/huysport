# TÀI LIỆU ĐẶC TẢ RESTful API - HỆ THỐNG SPORTX E-COMMERCE

> **Dự án**: Website Bán Đồ Thể Thao Tích Hợp Chatbot Tư Vấn Size & FAQ và Cổng Thanh Toán Trực Tuyến  
> **Tác giả**: Đinh Công Hùng (MSSV: 2200932)  
> **Base URL**: `http://localhost:5000/api`  
> **Chuẩn dữ liệu**: JSON (`Content-Type: application/json; charset=utf-8`)

---

## 1. Tổng quan kiến trúc API

Tất cả các phản hồi từ hệ thống đều tuân theo cấu trúc JSON chuẩn:

### 1.1 Cấu trúc phản hồi thành công (Success Response)
```json
{
  "success": true,
  "data": { ... },
  "message": "Thông điệp mô tả (nếu có)"
}
```

### 1.2 Cấu trúc phản hồi lỗi (Error Response)
```json
{
  "success": false,
  "error": "Mô tả nguyên nhân lỗi",
  "details": [ ... ]
}
```

---

## 2. Danh sách Endpoints chi tiết

### 2.1 Xác thực & Phân quyền RBAC (`/api/auth`)

| Method | Endpoint | Quyền hạn | Mô tả |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản mới (Hỗ trợ phân quyền Staff/Customer) |
| `POST` | `/api/auth/login` | Public | Đăng nhập tài khoản, cấp phát Bearer JWT Token |
| `GET` | `/api/auth/me` | Authenticated | Lấy thông tin tài khoản đang đăng nhập từ JWT Token |
| `POST` | `/api/auth/change-password` | Authenticated | Đổi mật khẩu cá nhân |
| `GET` | `/api/auth/users` | `ADMIN` | Lấy danh sách toàn bộ người dùng & nhân sự hệ thống |
| `PATCH` | `/api/auth/users/:id/role` | `ADMIN` | Cập nhật vai trò (`ADMIN`, `STAFF`, `CUSTOMER`) |
| `PATCH` | `/api/auth/users/:id/status` | `ADMIN` | Khóa hoặc mở khóa tài khoản nhân sự (`Active`/`Blocked`) |

#### Ví dụ `POST /api/auth/login` Response:
```json
{
  "success": true,
  "message": "Đăng nhập thành công! Chào mừng Đinh Công Hùng (Super Admin)",
  "data": {
    "user": {
      "id": "usr-admin-01",
      "email": "admin@sportx.store",
      "fullName": "Đinh Công Hùng (Super Admin)",
      "phone": "+84 912 345 678",
      "role": "ADMIN",
      "avatar": "https://images.unsplash.com/...",
      "status": "Active"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "7d"
    }
  }
}
```

---

### 2.2 Dashboard & Thống kê (`/api/dashboard`)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Thống kê tổng quan: Doanh thu, Đơn hàng, Khách hàng, Tỷ lệ tăng trưởng |
| `GET` | `/api/dashboard/recent-orders` | Danh sách 5-10 đơn hàng mới nhất |
| `GET` | `/api/dashboard/top-products` | Top 5 sản phẩm bán chạy nhất |
| `GET` | `/api/dashboard/revenue-chart` | Dữ liệu biểu đồ doanh thu theo 7 ngày gần nhất |

#### Ví dụ `GET /api/dashboard/stats` Response:
```json
{
  "success": true,
  "data": {
    "totalRevenue": 48250.0,
    "revenueChange": 18.2,
    "totalOrders": 1284,
    "ordersChange": 8.4,
    "totalCustomers": 942,
    "customersChange": 12.5,
    "avgOrderValue": 142.5,
    "aovChange": -2.1
  }
}
```

---

### 2.2 Quản lý Sản phẩm & Biến thể (`/api/products`)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/products` | Lấy danh sách sản phẩm (hỗ trợ lọc: `category`, `stockStatus`, `search`) |
| `GET` | `/api/products/:id` | Xem chi tiết sản phẩm và danh sách SKU biến thể |
| `POST` | `/api/products` | Tạo sản phẩm mới kèm danh sách biến thể (Size, Màu, Tồn kho) |
| `PUT` | `/api/products/:id` | Cập nhật thông tin sản phẩm hoặc trạng thái |
| `DELETE` | `/api/products/:id` | Xóa sản phẩm khỏi kho hàng |

#### Ví dụ Request `POST /api/products`:
```json
{
  "title": "Nike Mercurial Superfly 9 Elite FG",
  "sku": "NK-MERC-001",
  "brand": "Nike",
  "category": "Football",
  "basePrice": 229.0,
  "discountPrice": 199.0,
  "status": "Active",
  "thumbnail": "⚽",
  "sizes": ["M (41 EU)", "L (42 EU)"],
  "colors": [
    { "name": "Red", "hex": "#DC2626" },
    { "name": "Black", "hex": "#0F172A" }
  ],
  "variants": [
    {
      "sku": "NK-MERC-001-RED-41",
      "size": "M (41 EU)",
      "color": "Red",
      "colorHex": "#DC2626",
      "price": 199.0,
      "stock": 15
    }
  ]
}
```

---

### 2.3 Quản lý Đơn hàng & Xử lý Giao nhận (`/api/orders`)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/orders` | Danh sách đơn hàng (lọc: `status`, `paymentMethod`, `search`) |
| `GET` | `/api/orders/:id` | Chi tiết đơn hàng, lịch sử giao dịch và timeline |
| `POST` | `/api/orders` | Khởi tạo đơn hàng mới từ giỏ hàng |
| `PATCH` | `/api/orders/:id/status` | Cập nhật trạng thái fulfillment và thanh toán |

#### Các trạng thái Đơn hàng:
- **Payment Status**: `Paid`, `Unpaid`
- **Fulfillment Status**: `Pending Approval`, `Processing`, `Shipping`, `Completed`, `Canceled`
- **Payment Method**: `VNPAY`, `MoMo`, `COD`

---

### 2.4 Quản lý Khách hàng & Phân hạng Tier (`/api/customers`)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/customers` | Danh sách khách hàng (lọc: `tier`, `status`, `search`) |
| `GET` | `/api/customers/:id` | Hồ sơ chi tiết, sổ địa chỉ và lịch sử mua sắm |
| `PATCH` | `/api/customers/:id/status` | Khóa hoặc mở khóa tài khoản khách hàng (`Active`/`Blocked`) |

---

### 2.5 AI Chatbot Engine & Knowledge Base (`/api/chatbot`)

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/chatbot/message` | Xử lý tin nhắn người dùng (tự động phân tích NLP để tư vấn size hoặc trả lời FAQ) |
| `GET` | `/api/chatbot/size-rules` | Danh sách các quy tắc gợi ý size (Chiều cao, Cân nặng, Form) |
| `POST` | `/api/chatbot/size-rules` | Tạo quy tắc gợi ý kích cỡ mới |
| `DELETE` | `/api/chatbot/size-rules/:id` | Xóa quy tắc kích cỡ |
| `GET` | `/api/chatbot/faqs` | Danh sách tri thức hỏi đáp (Knowledge Base) |
| `POST` | `/api/chatbot/faqs` | Thêm mới câu hỏi & câu trả lời FAQ |
| `DELETE` | `/api/chatbot/faqs/:id` | Xóa FAQ |
| `GET` | `/api/chatbot/sessions` | Lịch sử các phiên trò chuyện giữa AI và người dùng |

#### Ví dụ Request `POST /api/chatbot/message`:
```json
{
  "message": "Mình cao 1m72 nặng 68kg nam thì nên mặc áo đá bóng size gì?",
  "sessionId": "session-1"
}
```
#### Phản hồi từ AI Engine:
```json
{
  "success": true,
  "data": {
    "intent": "Size Recommendation",
    "reply": "Dựa trên số đo chiều cao 172cm và cân nặng 68kg (Form Regular Fit), size phù hợp nhất với bạn là **Size L** (hoặc Size M nếu muốn mặc ôm body).",
    "suggestedSize": "Size L",
    "confidence": 0.98,
    "productCard": {
      "name": "Áo Đấu CLB Thể Thao Pro Dry-Fit",
      "category": "Apparel • Football",
      "price": "$45.00",
      "sizeSuggested": "Size L",
      "thumbnail": "⚽"
    }
  }
}
```

---

### 2.6 Cổng Thanh toán Trực tuyến (`/api/payment`)

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/payment/vnpay/create-payment-url` | Tạo đường dẫn thanh toán qua cổng VNPAY Sandbox (HMAC-SHA512) |
| `GET` | `/api/payment/vnpay/return` | Xử lý redirect URL trả về từ VNPAY sau khi khách hàng giao dịch |
| `GET` | `/api/payment/vnpay/ipn` | Webhook IPN xử lý bất đồng bộ từ máy chủ VNPAY |

---

### 2.7 Marketing, Khuyến mãi & Cài đặt (`/api/marketing`, `/api/settings`)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/marketing/coupons` | Danh sách mã giảm giá và voucher khuyến mãi |
| `POST` | `/api/marketing/coupons` | Tạo mã giảm giá mới |
| `DELETE` | `/api/marketing/coupons/:id` | Xóa mã giảm giá |
| `GET` | `/api/settings` | Lấy cấu hình hệ thống (Thông tin cửa hàng, Cổng thanh toán, Phí ship) |
| `PUT` | `/api/settings` | Cập nhật cấu hình hệ thống |
