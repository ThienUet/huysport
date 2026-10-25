# -*- coding: utf-8 -*-
"""
Script tái thiết kế toàn bộ 6 biểu đồ UML & ERD với phông chữ LỚN, ĐẬM, RÕ NÉT (High-Legibility)
Tối ưu hóa đặc biệt cho văn bản Word A4 để không bị vỡ hình hay mờ chữ:
1. uc_customer.png: Use Case Khách hàng & Chatbot (Font 12-14pt bold)
2. uc_admin.png: Use Case Quản trị viên (Font 12-14pt bold)
3. class_diagram.png: Biểu đồ Lớp Class Diagram (Font 11-13pt bold, 2 cột rộng rãi)
4. seq_payment.png: Biểu đồ tuần tự Thanh toán VNPAY (Font 11-12pt bold)
5. seq_chatbot.png: Biểu đồ tuần tự AI Chatbot tư vấn size (Font 11-12pt bold)
6. erd_diagram.png: Sơ đồ ERD thực thể dữ liệu (Font 11-13pt bold)
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

IMG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "images"))
os.makedirs(IMG_DIR, exist_ok=True)

plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Segoe UI']
plt.rcParams['axes.unicode_minus'] = False

# ==============================================================================
# 1. BIỂU ĐỒ USE CASE KHÁCH HÀNG & CHATBOT (FONT LỚN)
# ==============================================================================
def draw_uc_customer():
    fig, ax = plt.subplots(figsize=(8.5, 10.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Boundary Box
    sys_box = patches.FancyBboxPatch((24, 4), 52, 92, boxstyle="round,pad=0.8", 
                                     edgecolor="#1A365D", facecolor="#F8FAFC", linewidth=2.2)
    ax.add_patch(sys_box)
    ax.text(50, 93.5, "Phân hệ Khách hàng & Chatbot (SportX)", 
            ha='center', va='center', fontsize=13, fontweight='bold', color="#1A365D")

    # Vẽ Actor người lớn, rõ
    def draw_actor(x, y, name, color="#1A202C"):
        circle = patches.Circle((x, y + 2.8), 2.0, edgecolor=color, facecolor="#E2E8F0", lw=2.2)
        ax.add_patch(circle)
        ax.plot([x, x], [y + 0.8, y - 3.2], color=color, lw=2.2) # Thân
        ax.plot([x - 2.8, x + 2.8], [y - 0.5, y - 0.5], color=color, lw=2.2) # Tay
        ax.plot([x, x - 2.5], [y - 3.2, y - 7.5], color=color, lw=2.2) # Chân trái
        ax.plot([x, x + 2.5], [y - 3.2, y - 7.5], color=color, lw=2.2) # Chân phải
        ax.text(x, y - 10.5, name, ha='center', va='center', fontsize=11.5, fontweight='bold', color=color)

    draw_actor(11, 75, "Khách vãng lai\n(Guest)")
    draw_actor(11, 32, "Khách hàng\n(Customer)")

    # Secondary Actors bên phải
    def draw_sys_actor(x, y, w, h, name):
        box = patches.FancyBboxPatch((x, y), w, h, boxstyle="square,pad=0.4", 
                                     edgecolor="#22543D", facecolor="#F0FFF4", lw=2.0)
        ax.add_patch(box)
        ax.text(x + w/2, y + h/2, f"<<Hệ thống ngoài>>\n{name}", 
                ha='center', va='center', fontsize=10.5, fontweight='bold', color="#22543D")

    draw_sys_actor(78, 68, 20, 8.5, "Cổng VNPAY")
    draw_sys_actor(78, 22, 20, 8.5, "Động cơ AI Chatbot\n(NLP Engine)")

    # Mũi tên kế thừa Khách hàng -> Khách vãng lai
    ax.annotate("", xy=(11, 64), xytext=(11, 44),
                arrowprops=dict(arrowstyle="-|>", color="#4A5568", lw=2.0, mutation_scale=18))
    ax.text(13.5, 54, "<<kế thừa>>", fontsize=10, color="#4A5568", fontweight='bold', fontstyle='italic')

    # Danh sách Use Case với chữ 11.5pt đậm
    usecases = [
        ("UC-01: Đăng ký & Đăng nhập", 50, 87),
        ("UC-05: Xem danh mục & Trang chủ", 50, 79),
        ("UC-06: Tìm kiếm & Lọc sản phẩm", 50, 71),
        ("UC-08: Xem chi tiết sản phẩm", 50, 63),
        ("UC-09: Quản lý giỏ hàng", 50, 55),
        ("UC-10: Nhập mã giảm giá", 50, 47),
        ("UC-11: Đặt hàng (Checkout)", 50, 39),
        ("UC-12: Theo dõi đơn mua", 50, 31),
        ("UC-14: Thanh toán trực tuyến", 50, 23),
        ("UC-15: Chatbot tư vấn chọn size", 50, 15),
        ("UC-17: Tra cứu hỏi đáp FAQ", 50, 7),
    ]

    for name, cx, cy in usecases:
        ellipse = patches.Ellipse((cx, cy), 42, 6.5, edgecolor="#2B6CB0", facecolor="#EBF8FF", lw=1.8)
        ax.add_patch(ellipse)
        ax.text(cx, cy, name, ha='center', va='center', fontsize=11, color="#1A365D", fontweight='bold')

    # Đường nối Actor -> Use Case (dày 1.6pt)
    guest_lines = [87, 79, 71, 63, 55, 15]
    for y_uc in guest_lines:
        ax.plot([17, 29], [75, y_uc], color="#4A5568", lw=1.6)

    cust_lines = [47, 39, 31, 23, 7]
    for y_uc in cust_lines:
        ax.plot([17, 29], [32, y_uc], color="#2B6CB0", lw=1.8)

    # Nối UC-14 -> VNPAY
    ax.plot([71, 78], [23, 72], color="#22543D", lw=1.8, linestyle="--")

    # Nối UC-15, UC-17 -> AI Chatbot
    ax.plot([71, 78], [15, 27], color="#22543D", lw=1.8, linestyle="--")
    ax.plot([71, 78], [7, 25], color="#22543D", lw=1.8, linestyle="--")

    plt.tight_layout()
    output_path = os.path.join(IMG_DIR, "uc_customer.png")
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print("Regenerated uc_customer.png with LARGE BOLD fonts")

# ==============================================================================
# 2. BIỂU ĐỒ USE CASE QUẢN TRỊ VIÊN (FONT LỚN)
# ==============================================================================
def draw_uc_admin():
    fig, ax = plt.subplots(figsize=(8.5, 8.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Boundary Box
    sys_box = patches.FancyBboxPatch((28, 4), 68, 92, boxstyle="round,pad=0.8", 
                                     edgecolor="#9B2C2C", facecolor="#FFF5F5", linewidth=2.2)
    ax.add_patch(sys_box)
    ax.text(62, 93, "Phân hệ Quản trị hệ thống (SportX Admin)", 
            ha='center', va='center', fontsize=13, fontweight='bold', color="#742A2A")

    # Actor Admin
    def draw_admin_actor(x, y, name):
        circle = patches.Circle((x, y + 3.2), 2.2, edgecolor="#742A2A", facecolor="#FED7D7", lw=2.2)
        ax.add_patch(circle)
        ax.plot([x, x], [y + 1.0, y - 3.8], color="#742A2A", lw=2.2)
        ax.plot([x - 3.0, x + 3.0], [y - 0.6, y - 0.6], color="#742A2A", lw=2.2)
        ax.plot([x, x - 2.8], [y - 3.8, y - 8.5], color="#742A2A", lw=2.2)
        ax.plot([x, x + 2.8], [y - 3.8, y - 8.5], color="#742A2A", lw=2.2)
        ax.text(x, y - 12.0, name, ha='center', va='center', fontsize=12, fontweight='bold', color="#742A2A")

    draw_admin_actor(13, 50, "Quản trị viên\n(Admin)")

    admin_ucs = [
        ("UC-19: Quản lý sản phẩm, biến thể & tồn kho", 62, 82),
        ("UC-20: Quản lý & Cập nhật trạng thái đơn hàng", 62, 71),
        ("UC-21: Quản lý hồ sơ & Phân hạng khách hàng", 62, 60),
        ("UC-22: Quản lý mã khuyến mãi (Coupons)", 62, 49),
        ("UC-23: Cấu hình quy tắc AI Size & FAQ Chatbot", 62, 38),
        ("UC-24: Báo cáo & Thống kê doanh thu bán hàng", 62, 27),
        ("UC-25: Cài đặt hệ thống & Cổng thanh toán", 62, 16),
    ]

    for name, cx, cy in admin_ucs:
        ellipse = patches.Ellipse((cx, cy), 58, 8.0, edgecolor="#C53030", facecolor="#FFFFFF", lw=2.0)
        ax.add_patch(ellipse)
        ax.text(cx, cy, name, ha='center', va='center', fontsize=11.5, color="#742A2A", fontweight='bold')
        ax.plot([20, 33], [50, cy], color="#9B2C2C", lw=1.8)

    plt.tight_layout()
    output_path = os.path.join(IMG_DIR, "uc_admin.png")
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print("Regenerated uc_admin.png with LARGE BOLD fonts")

# ==============================================================================
# 3. BIỂU ĐỒ LỚP (CLASS DIAGRAM) - 2 CỘT RỘNG RÃI, CHỮ 11-13PT
# ==============================================================================
def draw_class_diagram():
    fig, ax = plt.subplots(figsize=(8.5, 11.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 97.5, "BIỂU ĐỒ LỚP TỔNG THỂ HỆ THỐNG SPORTX (CLASS DIAGRAM)", 
            ha='center', va='center', fontsize=13.5, fontweight='bold', color="#1A365D")

    def draw_uml_class(x, y, w, h, class_name, attributes, methods, color="#1A365D"):
        # Header (Navy)
        hdr_h = 3.6
        header_box = patches.Rectangle((x, y + h - hdr_h), w, hdr_h, facecolor=color, edgecolor="#1A202C", lw=1.8)
        ax.add_patch(header_box)
        ax.text(x + w/2, y + h - hdr_h/2, class_name, ha='center', va='center', 
                color="white", fontsize=12, fontweight='bold')

        # Attributes section
        attr_h = (h - hdr_h) * 0.55
        body_attr = patches.Rectangle((x, y + h - hdr_h - attr_h), w, attr_h, facecolor="#F8FAFC", edgecolor="#1A202C", lw=1.8)
        ax.add_patch(body_attr)
        y_text = y + h - hdr_h - 1.2
        for attr in attributes:
            ax.text(x + 1.2, y_text, attr, ha='left', va='top', fontsize=10.5, color="#1A202C", fontweight='bold')
            y_text -= 1.6

        # Methods section
        method_h = (h - hdr_h) * 0.45
        body_method = patches.Rectangle((x, y), w, method_h, facecolor="#EDF2F7", edgecolor="#1A202C", lw=1.8)
        ax.add_patch(body_method)
        y_text = y + method_h - 1.2
        for method in methods:
            ax.text(x + 1.2, y_text, method, ha='left', va='top', fontsize=10.5, color="#2B6CB0", fontweight='bold')
            y_text -= 1.6

    # Cột 1 (Bên trái): User, Customer, SizeEngine
    draw_uml_class(3, 68, 44, 26, "User", 
                   ["- id: String (PK)", "- email: String (Unique)", "- passwordHash: String", "- fullName: String", "- role: String (admin/customer)", "- status: String"],
                   ["+ login(): AuthToken", "+ register(): User", "+ updateProfile()"])

    draw_uml_class(3, 36, 44, 27, "Customer",
                   ["- id: String (PK)", "- userId: String (FK)", "- phone: String", "- tier: String (VIP/Loyal/New)", "- totalOrders: Int", "- lifetimeSpent: Float"],
                   ["+ getOrderHistory(): List", "+ addAddress(addr)", "+ updateTier()"])

    draw_uml_class(3, 4, 44, 27, "AISizeEngine",
                   ["- knowledgeBase: List<FAQ>", "- sizeRules: List<SizeRule>", "- bmiThresholds: Map"],
                   ["+ extractEntities(text): Stats", "+ calculateBMI(H, W): Float", "+ recommendSize(H, W): Size", "+ matchFAQ(query): Answer"])

    # Cột 2 (Bên phải): Product, Order, OrderItem
    draw_uml_class(53, 68, 44, 26, "Product",
                   ["- id: String (PK)", "- sku: String (Unique)", "- title: String", "- brand: String", "- category: String", "- basePrice: Float", "- totalStock: Int"],
                   ["+ getVariants(): List", "+ updateStock(qty)", "+ getDiscountPrice()"])

    draw_uml_class(53, 36, 44, 27, "Order",
                   ["- id: String (PK)", "- orderNumber: String (UK)", "- customerId: String (FK)", "- totalAmount: Float", "- paymentStatus: String", "- fulfillmentStatus: String"],
                   ["+ calculateTotal(): Float", "+ updateStatus(status)", "+ cancelOrder()"])

    draw_uml_class(53, 4, 44, 27, "OrderItem",
                   ["- id: String (PK)", "- orderId: String (FK)", "- productId: String (FK)", "- size: String", "- color: String", "- qty: Int", "- unitPrice: Float"],
                   ["+ getSubTotal(): Float", "+ updateQuantity(qty)"])

    # Mối quan hệ giữa các lớp (Đường kẻ đậm, nhãn chữ 11pt bold)
    # User -> Customer (1 : 1)
    ax.annotate("", xy=(25, 63), xytext=(25, 68), arrowprops=dict(arrowstyle="->", lw=2.0, color="#1A202C"))
    ax.text(26.5, 65, "1 : 1", fontsize=11, fontweight='bold', color="#1A202C")

    # Customer -> Order (1 : N)
    ax.annotate("", xy=(53, 49.5), xytext=(47, 49.5), arrowprops=dict(arrowstyle="->", lw=2.0, color="#1A202C"))
    ax.text(47.5, 51, "1", fontsize=11, fontweight='bold', color="#1A202C")
    ax.text(51, 51, "N", fontsize=11, fontweight='bold', color="#1A202C")
    ax.text(47.5, 47, "places", fontsize=10, fontstyle='italic', color="#4A5568")

    # Order -> OrderItem (1 : N) (Composition)
    ax.annotate("", xy=(75, 31), xytext=(75, 36), arrowprops=dict(arrowstyle="->", lw=2.0, color="#1A202C"))
    ax.text(76.5, 33.5, "1 : N", fontsize=11, fontweight='bold', color="#1A202C")

    # Product -> OrderItem (1 : N)
    ax.annotate("", xy=(85, 31), xytext=(85, 68), arrowprops=dict(arrowstyle="->", lw=1.8, color="#4A5568", linestyle="--"))
    ax.text(86, 50, "references", fontsize=10, fontstyle='italic', color="#4A5568")

    plt.tight_layout()
    output_path = os.path.join(IMG_DIR, "class_diagram.png")
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print("Regenerated class_diagram.png with LARGE BOLD fonts")

# # ==============================================================================
# 4. BIỂU ĐỒ TUẦN TỰ: THANH TOÁN VNPAY (RỘNG RÃI, KHÔNG DÍU CHỮ)
# ==============================================================================
def draw_seq_payment():
    fig, ax = plt.subplots(figsize=(11.0, 8.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 97.5, "BIỂU ĐỒ TUẦN TỰ: ĐẶT HÀNG & THANH TOÁN TRỰC TUYẾN VNPAY", 
            ha='center', va='center', fontsize=13, fontweight='bold', color="#1A365D")

    cols = [
        ("Khách hàng\n(User)", 10),
        ("Giao diện\n(Client App)", 30),
        ("Máy chủ API\n(Backend)", 50),
        ("Cổng VNPAY\n(Gateway)", 70),
        ("Cơ sở dữ liệu\n(MongoDB)", 90)
    ]

    for name, x in cols:
        box = patches.FancyBboxPatch((x - 7.5, 87), 15, 7.2, boxstyle="round,pad=0.3",
                                     edgecolor="#1A365D", facecolor="#EBF8FF", lw=1.8)
        ax.add_patch(box)
        ax.text(x, 90.6, name, ha='center', va='center', fontsize=9.5, fontweight='bold', color="#1A365D")
        ax.plot([x, x], [87, 4], color="#A0AEC0", linestyle="--", lw=1.5)

    msgs = [
        (81, 10, 30, "1. Chọn 'Thanh toán qua VNPAY'", True),
        (74, 30, 50, "2. POST /api/payment/create-url", True),
        (68, 50, 90, "3. Lưu đơn hàng tạm (status: Unpaid)", True),
        (62, 90, 50, "4. Trả về mã đơn hàng ID", False),
        (56, 50, 50, "5. Ký mã hóa HMAC-SHA512", True, True),
        (50, 50, 30, "6. Trả về liên kết paymentUrl", False),
        (44, 30, 70, "7. Chuyển hướng sang VNPAY", True),
        (37, 10, 70, "8. Quét mã QR / Xác thực OTP thẻ", True),
        (30, 70, 50, "9. Webhook IPN: Thanh toán OK", True),
        (23, 50, 90, "10. Cập nhật paymentStatus='Paid'", True),
        (17, 50, 70, "11. Phản hồi RspCode: '00'", False),
        (11, 70, 30, "12. Chuyển về trang /order-success", False),
        (5, 30, 10, "13. Thông báo Đặt hàng thành công", False)
    ]

    for item in msgs:
        if len(item) == 5:
            y, x1, x2, text, is_sync = item
            is_self = False
        else:
            y, x1, x2, text, is_sync, is_self = item

        if is_self:
            ax.plot([x1, x1 + 6, x1 + 6, x1], [y + 1.6, y + 1.6, y - 1.6, y - 1.6], color="#1A365D", lw=1.6)
            ax.annotate("", xy=(x1, y - 1.6), xytext=(x1 + 3, y - 1.6),
                        arrowprops=dict(arrowstyle="->", color="#1A365D", lw=1.6))
            ax.text(x1 + 7.5, y, text, ha='left', va='center', fontsize=9.2, fontweight='bold', color="#1A365D")
        else:
            style = "->"
            linestyle = "-" if is_sync else "--"
            color = "#1A365D" if is_sync else "#4A5568"
            ax.annotate("", xy=(x2, y), xytext=(x1, y),
                        arrowprops=dict(arrowstyle=style, color=color, lw=1.6, linestyle=linestyle))
            mid_x = (x1 + x2) / 2
            ax.text(mid_x, y + 1.3, text, ha='center', va='bottom', fontsize=9.2, fontweight='bold', color="#1A202C")

    plt.tight_layout()
    output_path = os.path.join(IMG_DIR, "seq_payment.png")
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print("Regenerated seq_payment.png with NO OVERLAP")

# ==============================================================================
# 5. BIỂU ĐỒ TUẦN TỰ: AI CHATBOT TƯ VẤN SIZE (RỘNG RÃI, KHÔNG DÍU CHỮ)
# ==============================================================================
def draw_seq_chatbot():
    fig, ax = plt.subplots(figsize=(11.0, 8.0), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 97.5, "BIỂU ĐỒ TUẦN TỰ: AI CHATBOT TƯ VẤN KÍCH CỠ", 
            ha='center', va='center', fontsize=13, fontweight='bold', color="#1A365D")

    cols = [
        ("Khách hàng\n(User)", 10),
        ("Giao diện\n(Client UI)", 30),
        ("Máy chủ API\n(Backend)", 50),
        ("Động cơ AI\n(SizeEngine)", 70),
        ("Cơ sở dữ liệu\n(MongoDB)", 90)
    ]

    for name, x in cols:
        box = patches.FancyBboxPatch((x - 7.5, 87), 15, 7.2, boxstyle="round,pad=0.3",
                                     edgecolor="#22543D", facecolor="#F0FFF4", lw=1.8)
        ax.add_patch(box)
        ax.text(x, 90.6, name, ha='center', va='center', fontsize=9.5, fontweight='bold', color="#22543D")
        ax.plot([x, x], [87, 4], color="#A0AEC0", linestyle="--", lw=1.5)

    msgs = [
        (81, 10, 30, "1. Gửi số đo: 1m72, 65kg", True),
        (74, 30, 50, "2. POST /api/chatbot/message {text}", True),
        (67, 50, 70, "3. Chuyển text sang SizeEngine", True),
        (60, 70, 70, "4. Trích xuất H=172, W=65 -> BMI=21.97", True, True),
        (53, 70, 90, "5. Truy vấn bảng luật SizeRule", True),
        (46, 90, 70, "6. Trả về rule: 168-175cm, 62-68kg", False),
        (39, 70, 70, "7. Khớp ma trận -> Khuyên dùng Size L", True, True),
        (32, 70, 90, "8. Lấy gợi ý top 3 đồ thể thao size L", True),
        (25, 90, 70, "9. Trả về danh sách sản phẩm", False),
        (18, 70, 50, "10. Trả về kết quả: Size L + Sản phẩm", False),
        (11, 50, 30, "11. Phản hồi JSON {size, cards}", False),
        (4, 30, 10, "12. Hiển thị tư vấn & nút Mua ngay", False)
    ]

    for item in msgs:
        if len(item) == 5:
            y, x1, x2, text, is_sync = item
            is_self = False
        else:
            y, x1, x2, text, is_sync, is_self = item

        if is_self:
            ax.plot([x1, x1 + 6, x1 + 6, x1], [y + 1.6, y + 1.6, y - 1.6, y - 1.6], color="#22543D", lw=1.6)
            ax.annotate("", xy=(x1, y - 1.6), xytext=(x1 + 3, y - 1.6),
                        arrowprops=dict(arrowstyle="->", color="#22543D", lw=1.6))
            ax.text(x1 + 7.5, y, text, ha='left', va='center', fontsize=9.2, fontweight='bold', color="#22543D")
        else:
            style = "->"
            linestyle = "-" if is_sync else "--"
            color = "#22543D" if is_sync else "#4A5568"
            ax.annotate("", xy=(x2, y), xytext=(x1, y),
                        arrowprops=dict(arrowstyle=style, color=color, lw=1.6, linestyle=linestyle))
            mid_x = (x1 + x2) / 2
            ax.text(mid_x, y + 1.3, text, ha='center', va='bottom', fontsize=9.2, fontweight='bold', color="#1A202C")

    plt.tight_layout()
    output_path = os.path.join(IMG_DIR, "seq_chatbot.png")
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print("Regenerated seq_chatbot.png with NO OVERLAP")

# ==============================================================================
# 6. SƠ ĐỒ THỰC THỂ LIÊN KẾT (ERD) - 2 CỘT RỘNG RÃI, CHỮ 11-13PT
# ==============================================================================
def draw_erd_diagram():
    fig, ax = plt.subplots(figsize=(8.5, 11.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 97.5, "SƠ ĐỒ THỰC THỂ LIÊN KẾT (ERD) - CƠ SỞ DỮ LIỆU SPORTX", 
            ha='center', va='center', fontsize=13.5, fontweight='bold', color="#1A365D")

    def draw_erd_table(x, y, w, h, table_name, fields, color="#1A365D"):
        # Header (Navy)
        hdr_h = 3.6
        box_hdr = patches.Rectangle((x, y + h - hdr_h), w, hdr_h, facecolor=color, edgecolor="#1A202C", lw=1.8)
        ax.add_patch(box_hdr)
        ax.text(x + w/2, y + h - hdr_h/2, table_name, ha='center', va='center', 
                color="white", fontsize=12, fontweight='bold')

        # Body
        body_h = h - hdr_h
        box_body = patches.Rectangle((x, y), w, body_h, facecolor="#F8FAFC", edgecolor="#1A202C", lw=1.8)
        ax.add_patch(box_body)

        y_text = y + body_h - 1.2
        for f in fields:
            is_pk = "PK" in f
            is_fk = "FK" in f
            f_color = "#C53030" if is_pk else ("#2B6CB0" if is_fk else "#1A202C")
            ax.text(x + 1.2, y_text, f, ha='left', va='top', fontsize=10.5, color=f_color, fontweight='bold')
            y_text -= 1.6

    # 1. USERS (Bên trái trên)
    draw_erd_table(3, 68, 44, 26, "USERS", 
                   ["* id : ObjectId (PK)", "email : String (Unique)", "passwordHash : String", "fullName : String", "role : String (admin/customer)", "status : String ('active')"])

    # 2. CUSTOMERS (Bên trái giữa)
    draw_erd_table(3, 36, 44, 27, "CUSTOMERS",
                   ["* id : ObjectId (PK)", "userId : ObjectId (FK)", "fullName : String", "email : String (Unique)", "phone : String", "tier : String ('VIP'/'Loyal')", "lifetimeSpent : Float"])

    # 3. SIZE_RULES (Bên trái dưới)
    draw_erd_table(3, 4, 44, 27, "SIZE_RULES",
                   ["* id : ObjectId (PK)", "ruleCode : String (Unique)", "category : String ('Football')", "heightMin, heightMax : Int", "weightMin, weightMax : Int", "suggestedSize : String ('L')", "isActive : Boolean"])

    # 4. PRODUCTS (Bên phải trên)
    draw_erd_table(53, 68, 44, 26, "PRODUCTS",
                   ["* id : ObjectId (PK)", "sku : String (Unique)", "title : String", "brand : String ('Adidas')", "category : String ('Football')", "basePrice : Float", "totalStock : Int"])

    # 5. ORDERS (Bên phải giữa)
    draw_erd_table(53, 36, 44, 27, "ORDERS",
                   ["* id : ObjectId (PK)", "orderNumber : String (UK)", "customerId : ObjectId (FK)", "totalAmount : Float", "paymentMethod : String", "paymentStatus : String ('Paid')", "fulfillmentStatus : String"])

    # 6. ORDER_ITEMS (Bên phải dưới)
    draw_erd_table(53, 4, 44, 27, "ORDER_ITEMS",
                   ["* id : ObjectId (PK)", "orderId : ObjectId (FK)", "productId : ObjectId (FK)", "productName : String", "size : String ('L')", "color : String ('Trắng')", "qty : Int", "unitPrice : Float"])

    # Mối quan hệ ERD (1-1, 1-N)
    # USERS -> CUSTOMERS (1 : 1)
    ax.plot([25, 25], [68, 63], color="#1A202C", lw=2.2)
    ax.text(26.5, 65.5, "1 : 1", fontsize=11.5, fontweight='bold', color="#1A202C")

    # CUSTOMERS -> ORDERS (1 : N)
    ax.plot([47, 53], [49.5, 49.5], color="#1A202C", lw=2.2)
    ax.text(47.5, 51, "1", fontsize=11.5, fontweight='bold', color="#1A202C")
    ax.text(51, 51, "N", fontsize=11.5, fontweight='bold', color="#1A202C")

    # ORDERS -> ORDER_ITEMS (1 : N)
    ax.plot([75, 75], [36, 31], color="#1A202C", lw=2.2)
    ax.text(76.5, 33.5, "1 : N", fontsize=11.5, fontweight='bold', color="#1A202C")

    # PRODUCTS -> ORDER_ITEMS (1 : N)
    ax.plot([85, 85], [68, 31], color="#4A5568", lw=1.8, linestyle="--")
    ax.text(86, 50, "1 : N", fontsize=11, fontweight='bold', color="#4A5568")

    plt.tight_layout()
    output_path = os.path.join(IMG_DIR, "erd_diagram.png")
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print("Regenerated erd_diagram.png with LARGE BOLD fonts")

if __name__ == "__main__":
    print("Regenerating all 6 diagrams with large bold fonts...")
    draw_uc_customer()
    draw_uc_admin()
    draw_class_diagram()
    draw_seq_payment()
    draw_seq_chatbot()
    draw_erd_diagram()
    print("SUCCESS: All 6 diagrams regenerated successfully!")
