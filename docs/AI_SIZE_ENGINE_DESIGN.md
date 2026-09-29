# THIẾT KẾ THUẬT TOÁN AI SIZE ENGINE & FAQ KNOWLEDGE BASE - SPORTX

> **Dự án**: Website Bán Đồ Thể Thao Tích Hợp Chatbot & Thanh Toán Trực Tuyến  
> **Tác giả**: Đinh Công Hùng (MSSV: 2200932)  
> **Module**: AI Size Recommendation Engine & Natural Language FAQ Classifier

---

## 1. Bài toán và Mục tiêu thiết kế

Trong thương mại điện tử ngành thể thao, tỷ lệ đổi trả hàng do **chọn sai kích cỡ (Size)** chiếm tới hơn 35-40% tổng số đơn đổi trả. Người mua hàng thường gặp khó khăn khi chọn size giữa các thương hiệu khác nhau (Nike thường form ôm hơn Adidas, giày bóng đá form khác giày chạy bộ).

**Mục tiêu của AI Size Engine:**
1. Trích xuất tự động thông số thể hình của người dùng từ ngôn ngữ tự nhiên tiếng Việt hoặc tiếng Anh (Chiều cao, Cân nặng, Giới tính, Sở thích mặc ôm hay rộng).
2. Tính toán chỉ số thể trạng (BMI) kết hợp ma trận bảng quy tắc (Multi-criteria Size Rules).
3. Đề xuất kích cỡ chuẩn xác nhất kèm thẻ sản phẩm liên quan (Product Recommendation Card).
4. Phân loại ý định người dùng (Intent Classification) để giải đáp các thắc mắc về chính sách giao nhận, bảo hành, đổi trả với độ tin cậy cao.

---

## 2. Kiến trúc Xử lý Tự nhiên (NLP Pipeline)

```
[Tin nhắn từ người dùng]
         │
         ▼
[1. Tiền xử lý văn bản (Regex & Normalization)]
         │
         ├──────────────────────────────────────────┐
         ▼                                          ▼
[2. Intent Classifier]                     [3. Entity Extraction]
  - Phát hiện Size Fitting                  - Height: (\d{2,3})\s*(cm|m)
  - Phát hiện Return Policy                 - Weight: (\d{2,3})\s*(kg|kí|cân)
  - Phát hiện Shipping Time                 - Gender: nam/nữ/male/female
  - Phát hiện Payment Policy                - Fit: ôm/rộng/thoải mái
         │                                          │
         ├──────────────────────────────────────────┘
         ▼
[4. Decision Engine / Knowledge Matcher]
  - Nếu Intent = Size Fitting ──► [AI Size Matrix & BMI Algorithm]
  - Nếu Intent = FAQ ───────────► [FAQ Knowledge Base Cosine/Keyword Matcher]
         │
         ▼
[5. Response Generator & Product Card Attachment]
```

---

## 3. Thuật toán gợi ý kích cỡ (Size Calculation Algorithm)

### 3.1 Trích xuất đặc trưng (Entity Extraction)
- **Chiều cao ($H$)**: Trích xuất qua regex pattern `/(?:cao|height)\s*(\d+(?:\.\d+)?)\s*(?:cm|m)?/i` (Tự động quy đổi $1.72m \rightarrow 172cm$).
- **Cân nặng ($W$)**: Trích xuất qua pattern `/(?:nặng|weight)\s*(\d+)\s*(?:kg|kí|can|cân)?/i`.
- **Giới tính ($G$)**: Phân loại theo tập từ khóa `{nam, boy, đàn ông, male}` hoặc `{nữ, girl, phụ nữ, female}`.

### 3.2 Đánh giá BMI và Form mặc
Chỉ số khối cơ thể (Body Mass Index - $BMI$):
$$BMI = \frac{W}{(H / 100)^2}$$

- $BMI < 18.5$: Thể trạng gầy $\rightarrow$ Ưu tiên hạ 1 size nếu chọn form Slim Fit.
- $18.5 \le BMI < 24.9$: Thể trạng chuẩn $\rightarrow$ Chọn size chuẩn theo ma trận.
- $BMI \ge 25.0$: Thể trạng đậm người $\rightarrow$ Tự động gợi ý tăng 1 size để vận động thể thao thoải mái.

### 3.3 Thuật toán đối sánh quy tắc (Rule Matching)
Hệ thống duyệt tập quy tắc $R = \{r_1, r_2, ..., r_n\}$ theo thứ tự ưu tiên:
1. $r.category == targetCategory$
2. $r.gender == targetGender \lor r.gender == 'Unisex'$
3. $r.heightMin \le H \le r.heightMax$
4. $r.weightMin \le W \le r.weightMax$

Nếu tìm thấy rule thỏa mãn toàn bộ 4 điều kiện $\rightarrow$ Trả về `suggestedSize = r.suggestedSize` với Confidence = 98%.

---

## 4. FAQ Intent Classifier (Bộ phân loại câu hỏi thường gặp)

Hệ thống định nghĩa 5 nhóm ý định chính:
1. `Return Policy` (Chính sách đổi trả, đổi size)
2. `Shipping Time` (Thời gian giao hàng nội thành/ngoại tỉnh)
3. `Product Care` (Bảo quản, giặt đồ thể thao dry-fit, bảo quản vợt/giày)
4. `Size Fitting` (Tư vấn kích cỡ trang phục & giày)
5. `Payment & Warranty` (Thanh toán VNPAY, MoMo, bảo hành chính hãng)

Mỗi câu hỏi được tính điểm tương đồng từ khóa và trả lời câu trả lời chuẩn xác nhất trong cơ sở tri thức (Knowledge Base).
