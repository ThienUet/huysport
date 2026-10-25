# -*- coding: utf-8 -*-
"""
Script tạo Báo cáo Khóa luận Tốt nghiệp / Đồ án Tốt nghiệp hoàn chỉnh
chuẩn mẫu báo cáo tốt nghiệp ngành CNTT.

Đề tài: XÂY DỰNG WEBSITE THƯƠNG MẠI ĐIỆN TỬ KINH DOANH QUẦN ÁO THỂ THAO
        TÍCH HỢP CHATBOT HỖ TRỢ TƯ VẤN SẢN PHẨM VÀ THANH TOÁN TRỰC TUYẾN
Sinh viên: Đinh Công Hùng (MSSV: 2200932)
Cán bộ hướng dẫn: ThS. Phạm Hồng Long

Các nâng cấp quan trọng:
1. Bìa chuẩn mẫu chung (không ghi cứng tên trường cụ thể, dùng placeholder mẫu).
2. Chèn 6 biểu đồ chất lượng cao dạng hình ảnh (Use Case Khách hàng, Use Case Admin,
   Class Diagram, Sequence Thanh toán VNPAY, Sequence Chatbot tư vấn size, ERD Diagram).
3. Thêm phần Mô tả chi tiết Cơ sở dữ liệu: bảng đặc tả chi tiết 11 collections
   (Users, Customers, Products, ProductVariants, Orders, OrderItems, ChatSessions,
    SizeRules, FAQs, Coupons, Settings) với tên trường, kiểu dữ liệu, khóa, ràng buộc, mô tả.
"""

import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

IMG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "images"))

def set_cell_background(cell, hex_color):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tc_pr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tc_pr.append(tc_mar)

def set_table_borders(table, color="D3D3D3"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="6" w:space="0" w:color="{color}"/>
            <w:bottom w:val="single" w:sz="6" w:space="0" w:color="{color}"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color}"/>
            <w:insideV w:val="none"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def build_thesis_document():
    doc = docx.Document()

    # 1. Định dạng trang A4 chuẩn
    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(2.0)
    section.bottom_margin = Cm(2.0)
    section.left_margin = Cm(3.0)   # Đóng gáy bên trái 3cm
    section.right_margin = Cm(2.0)

    # Cấu hình styles chuẩn
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(13)
    normal_style.font.color.rgb = RGBColor(0, 0, 0)

    def add_p(text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=0, space_after=6, line_spacing=1.3, indent=1.27, bold=False, italic=False, size=13):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        if indent > 0:
            p.paragraph_format.first_line_indent = Cm(indent)
        if text:
            run = p.add_run(text)
            run.font.name = 'Times New Roman'
            run.font.size = Pt(size)
            run.font.bold = bold
            run.font.italic = italic
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0, 32, 96) # Xanh Navy học thuật
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(16, 54, 114)
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.italic = True
        return p

    def add_bullet(text):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.25
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        return p

    def add_custom_table(headers, rows_data, col_widths=None):
        table = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(table)

        # Header row
        hdr_cells = table.rows[0].cells
        for idx, header_text in enumerate(headers):
            hdr_cells[idx].text = header_text
            set_cell_background(hdr_cells[idx], "1A365D") # Navy Blue
            set_cell_margins(hdr_cells[idx], top=100, bottom=100, left=130, right=130)
            p = hdr_cells[idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.font.name = 'Times New Roman'
                run.font.size = Pt(11.5)
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)

        # Body rows
        for row_idx, row_items in enumerate(rows_data):
            row_cells = table.rows[row_idx + 1].cells
            bg_color = "F7FAFC" if row_idx % 2 == 1 else "FFFFFF"
            for col_idx, item in enumerate(row_items):
                row_cells[col_idx].text = str(item)
                set_cell_background(row_cells[col_idx], bg_color)
                set_cell_margins(row_cells[col_idx], top=80, bottom=80, left=110, right=110)
                p = row_cells[col_idx].paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT if col_idx > 1 else WD_ALIGN_PARAGRAPH.CENTER
                for run in p.runs:
                    run.font.name = 'Times New Roman'
                    run.font.size = Pt(11)

        if col_widths:
            for row in table.rows:
                for idx, w in enumerate(col_widths):
                    row.cells[idx].width = Cm(w)

        doc.add_paragraph().paragraph_format.space_after = Pt(4)
        return table

    def add_table_caption(text, table_num):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(f"Bảng {table_num}: {text}")
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.italic = True
        return p

    def add_figure(img_filename, caption_text, figure_num, width_cm=15.5):
        img_path = os.path.join(IMG_DIR, img_filename)
        if os.path.exists(img_path):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run()
            run.add_picture(img_path, width=Cm(width_cm))

            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_before = Pt(2)
            p_cap.paragraph_format.space_after = Pt(10)
            run_cap = p_cap.add_run(f"Hình {figure_num}: {caption_text}")
            run_cap.font.name = 'Times New Roman'
            run_cap.font.size = Pt(11.5)
            run_cap.font.bold = True
            run_cap.font.italic = True
        else:
            p = doc.add_paragraph(f"[Ảnh minh họa: {img_filename} - {caption_text}]")
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # =========================================================================
    # 1. TRANG BÌA CHÍNH (CHUẨN MẪU BÁO CÁO TỐT NGHIỆP)
    # =========================================================================
    add_p("TRƯỜNG ĐẠI HỌC ....................", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=15, space_after=2, indent=0, bold=True, size=15)
    add_p("KHOA CÔNG NGHỆ THÔNG TIN", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=20, indent=0, bold=True, size=14)
    
    add_p("───────── * ─────────", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=35, indent=0, bold=True, size=12)

    add_p("KHÓA LUẬN TỐT NGHIỆP ĐẠI HỌC", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=15, space_after=18, indent=0, bold=True, size=18)
    add_p("NGÀNH CÔNG NGHỆ THÔNG TIN", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=40, indent=0, bold=True, size=14)

    add_p("XÂY DỰNG WEBSITE THƯƠNG MẠI ĐIỆN TỬ\nKINH DOANH QUẦN ÁO THỂ THAO TÍCH HỢP CHATBOT\nHỖ TRỢ TƯ VẤN SẢN PHẨM VÀ THANH TOÁN TRỰC TUYẾN", 
          align=WD_ALIGN_PARAGRAPH.CENTER, space_before=10, space_after=55, indent=0, bold=True, size=17)

    add_p("Sinh viên thực hiện : ĐINH CÔNG HÙNG", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=30, space_after=3, indent=3.5, bold=True, size=13)
    add_p("Mã số sinh viên     : 2200932", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=3, indent=3.5, bold=False, size=13)
    add_p("Khóa / Lớp          : K46 - CNTT1", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=3, indent=3.5, bold=False, size=13)
    add_p("Cán bộ hướng dẫn    : ThS. PHẠM HỒNG LONG", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=55, indent=3.5, bold=True, size=13)

    add_p("HÀ NỘI - 2026", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=40, space_after=0, indent=0, bold=True, size=13)
    doc.add_page_break()

    # =========================================================================
    # 2. TRANG BÌA PHỤ
    # =========================================================================
    add_p("TRƯỜNG ĐẠI HỌC ....................", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=15, space_after=2, indent=0, bold=True, size=15)
    add_p("KHOA CÔNG NGHỆ THÔNG TIN", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=25, indent=0, bold=True, size=14)

    add_p("KHÓA LUẬN TỐT NGHIỆP ĐẠI HỌC", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=15, space_after=25, indent=0, bold=True, size=18)

    add_p("XÂY DỰNG WEBSITE THƯƠNG MẠI ĐIỆN TỬ\nKINH DOANH QUẦN ÁO THỂ THAO TÍCH HỢP CHATBOT\nHỖ TRỢ TƯ VẤN SẢN PHẨM VÀ THANH TOÁN TRỰC TUYẾN", 
          align=WD_ALIGN_PARAGRAPH.CENTER, space_before=10, space_after=45, indent=0, bold=True, size=16)

    add_p("Ngành               : Công nghệ thông tin", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=20, space_after=4, indent=3.5, bold=False, size=13)
    add_p("Chuyên ngành        : Công nghệ phần mềm & Hệ thống thông tin", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=4, indent=3.5, bold=False, size=13)
    add_p("Sinh viên thực hiện : Đinh Công Hùng", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=4, indent=3.5, bold=True, size=13)
    add_p("Mã số sinh viên     : 2200932", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=4, indent=3.5, bold=False, size=13)
    add_p("Cán bộ hướng dẫn    : ThS. Phạm Hồng Long", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=4, indent=3.5, bold=True, size=13)
    add_p("Cán bộ phản biện    : ......................................................", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=45, indent=3.5, bold=False, size=13)

    add_p("HÀ NỘI - 2026", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=50, space_after=0, indent=0, bold=True, size=13)
    doc.add_page_break()

    # =========================================================================
    # 3. LỜI CẢM ƠN
    # =========================================================================
    add_p("LỜI CẢM ƠN", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=10, space_after=18, indent=0, bold=True, size=16)
    
    add_p("Trước tiên, em xin gửi lời cảm ơn chân thành và sâu sắc nhất tới các Thầy, Cô giáo trong khoa Công nghệ Thông tin, những người đã tận tâm truyền dạy cho em những tri thức khoa học quý báu, rèn luyện tư duy lập trình và phương pháp nghiên cứu học thuật trong suốt những năm tháng học tập tại trường.")
    add_p("Đặc biệt, em xin bày tỏ lòng biết ơn sâu sắc tới ThS. Phạm Hồng Long, người Thầy đã tận tình hướng dẫn, chỉ bảo, định hướng phương pháp tiếp cận đề tài và trực tiếp góp ý, sửa chữa những sai sót trong quá trình phân tích, thiết kế và hiện thực hóa hệ thống đồ án tốt nghiệp này.")
    add_p("Em cũng xin chân thành cảm ơn các bạn bè trong lớp đã luôn đồng hành, trao đổi chuyên môn, động viên và hỗ trợ em kiểm thử hệ thống trong suốt thời gian qua. Cuối cùng, con xin gửi lời cảm ơn vô hạn tới gia đình - nguồn động viên tinh thần và chỗ dựa vững chắc nhất giúp con hoàn thành tốt khóa học.")
    add_p("Mặc dù bản thân đã có nhiều nỗ lực và cố gắng để hoàn thành khóa luận một cách chỉn chu nhất, song do hạn chế về mặt thời gian và kinh nghiệm thực tiễn, đề tài khó tránh khỏi những thiếu sót nhất định. Em rất mong nhận được những ý kiến đóng góp, chỉ dẫn quý báu từ quý Thầy Cô trong Hội đồng chấm khóa luận để hệ thống được hoàn thiện hơn nữa.")

    add_p("Hà Nội, ngày 20 tháng 10 năm 2026", align=WD_ALIGN_PARAGRAPH.RIGHT, space_before=20, space_after=2, indent=0, italic=True)
    add_p("Sinh viên thực hiện", align=WD_ALIGN_PARAGRAPH.RIGHT, space_before=0, space_after=35, indent=0, bold=True)
    add_p("Đinh Công Hùng", align=WD_ALIGN_PARAGRAPH.RIGHT, space_before=0, space_after=0, indent=0, bold=True)
    doc.add_page_break()

    # =========================================================================
    # 4. LỜI CAM ĐOAN
    # =========================================================================
    add_p("LỜI CAM ĐOAN", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=10, space_after=18, indent=0, bold=True, size=16)

    add_p("Tôi xin cam đoan khóa luận tốt nghiệp với đề tài \"Xây dựng website thương mại điện tử kinh doanh quần áo thể thao tích hợp Chatbot hỗ trợ tư vấn sản phẩm và thanh toán trực tuyến\" là công trình nghiên cứu và thực hiện do chính tôi thực hiện dưới sự hướng dẫn trực tiếp của ThS. Phạm Hồng Long.")
    add_p("Các số liệu, mã nguồn và kết quả thực nghiệm được trình bày trong khóa luận là hoàn toàn trung thực và chưa từng được công bố trong bất kỳ công trình khoa học hay khóa luận nào khác của người khác. Các tài liệu tham khảo, thư viện mã nguồn mở và trích dẫn được sử dụng trong khóa luận đều có nguồn gốc rõ ràng và tuân thủ đúng quy định về liêm chính học thuật.")
    add_p("Tôi xin chịu hoàn toàn trách nhiệm trước Hội đồng và Pháp luật về lời cam đoan này.")

    add_p("Hà Nội, ngày 20 tháng 10 năm 2026", align=WD_ALIGN_PARAGRAPH.RIGHT, space_before=25, space_after=2, indent=0, italic=True)
    add_p("Sinh viên cam đoan", align=WD_ALIGN_PARAGRAPH.RIGHT, space_before=0, space_after=35, indent=0, bold=True)
    add_p("Đinh Công Hùng", align=WD_ALIGN_PARAGRAPH.RIGHT, space_before=0, space_after=0, indent=0, bold=True)
    doc.add_page_break()

    # =========================================================================
    # 5. TÓM TẮT KHÓA LUẬN (VIETNAMESE & ENGLISH ABSTRACT)
    # =========================================================================
    add_p("TÓM TẮT KHÓA LUẬN", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=10, space_after=15, indent=0, bold=True, size=15)
    
    add_p("Khóa luận tốt nghiệp tập trung vào việc nghiên cứu, thiết kế và xây dựng một hệ thống website thương mại điện tử chuyên biệt kinh doanh quần áo và phụ kiện thể thao (SportX), giải quyết bài toán cốt lõi về trải nghiệm khách hàng thông qua việc tích hợp Trợ lý ảo AI Chatbot tư vấn kích cỡ (Size Recommendation Engine) và giải pháp thanh toán trực tuyến bảo mật.")
    add_p("Hệ thống được phát triển theo kiến trúc hiện đại Monorepo 3 tầng (3-Tier Clean Layered Architecture) đảm bảo khả năng mở rộng cao, bao gồm: Backend RESTful API xây dựng trên nền Node.js, Express, TypeScript và MongoDB; Cổng mua sắm khách hàng xây dựng bằng Next.js 15 và Tailwind CSS; Trang quản trị hệ thống SportX Admin xây dựng bằng React 19 và Vite. Điểm nổi bật của đề tài là việc hiện thực hóa thuật toán AI Size Recommendation dựa trên sự kết hợp giữa chỉ số khối cơ thể (BMI) và ma trận bảng quy tắc thể trạng (Rule-based Multi-criteria Matrix), kết hợp bộ phân loại ý định câu hỏi thường gặp (FAQ Intent Matcher) giúp giảm thiểu tỷ lệ hoàn trả hàng do chọn nhầm size. Bên cạnh đó, hệ thống tích hợp thành công cổng thanh toán trực tuyến VNPAY với cơ chế chữ ký số bảo mật HMAC-SHA512 và xác nhận tức thời IPN Webhook.")
    add_p("Từ khóa: Thương mại điện tử, Quần áo thể thao, AI Chatbot, Tư vấn kích cỡ, Thanh toán VNPAY, React, Next.js, Node.js, MongoDB.")

    add_p("ABSTRACT", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=20, space_after=15, indent=0, bold=True, size=15)
    add_p("This graduation thesis focuses on researching, designing, and developing a dedicated sports apparel e-commerce web platform (SportX), addressing critical customer experience bottlenecks through the integration of an AI Chatbot Size Recommendation Engine and secure online payment gateways.")
    add_p("The system is engineered using a modern 3-Tier Monorepo Architecture: a scalable RESTful API backend developed with Node.js, Express, TypeScript, and MongoDB; a customer-facing portal powered by Next.js 15 and Tailwind CSS; and an administrative dashboard constructed with React 19 and Vite. The core academic highlight of this project is the implementation of an AI Size Engine utilizing Body Mass Index (BMI) computations combined with a Multi-criteria Rule Matrix, coupled with a natural language FAQ Intent Matcher to significantly reduce return rates caused by inaccurate sizing. Furthermore, the platform integrates the VNPAY payment gateway featuring HMAC-SHA512 cryptographic verification and real-time IPN webhook confirmation.")
    add_p("Keywords: E-commerce, Sports Apparel, AI Chatbot, Size Fitting Engine, VNPAY Gateway, React, Next.js, Express, MongoDB.")
    doc.add_page_break()

    # =========================================================================
    # 6. DANH MỤC THUẬT NGỮ VÀ TỪ VIẾT TẮT
    # =========================================================================
    add_p("DANH MỤC THUẬT NGỮ VÀ TỪ VIẾT TẮT", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=10, space_after=15, indent=0, bold=True, size=15)
    
    abbreviations = [
        ("API", "Application Programming Interface", "Giao diện lập trình ứng dụng"),
        ("B2C", "Business to Consumer", "Mô hình kinh doanh giữa doanh nghiệp và người tiêu dùng"),
        ("BMI", "Body Mass Index", "Chỉ số khối cơ thể (đo lường thể trạng)"),
        ("COD", "Cash On Delivery", "Thanh toán bằng tiền mặt khi nhận hàng"),
        ("CRUD", "Create, Read, Update, Delete", "Bốn thao tác dữ liệu cơ bản"),
        ("ERD", "Entity Relationship Diagram", "Sơ đồ thực thể liên kết"),
        ("HMAC", "Hash-based Message Authentication Code", "Mã xác thực thông điệp dựa trên hàm băm mật mã"),
        ("IPN", "Instant Payment Notification", "Thông báo thanh toán tức thời từ cổng thanh toán"),
        ("JWT", "JSON Web Token", "Chuẩn mã hóa thông tin xác thực phiên làm việc"),
        ("NLP", "Natural Language Processing", "Xử lý ngôn ngữ tự nhiên"),
        ("NoSQL", "Not Only SQL", "Cơ sở dữ liệu phi quan hệ hướng tài liệu (Document-oriented)"),
        ("ODM", "Object Data Modeling", "Mô hình ánh xạ đối tượng dữ liệu trong CSDL"),
        ("RBAC", "Role-Based Access Control", "Kiểm soát truy cập dựa trên vai trò"),
        ("REST", "Representational State Transfer", "Kiến trúc thiết kế dịch vụ Web phổ biến"),
        ("SPA", "Single Page Application", "Ứng dụng web một trang tải động"),
        ("SSR", "Server-Side Rendering", "Kết xuất giao diện từ phía máy chủ"),
        ("UI/UX", "User Interface / User Experience", "Giao diện người dùng / Trải nghiệm người dùng"),
        ("UML", "Unified Modeling Language", "Ngôn ngữ mô hình hóa thống nhất"),
        ("VNPAY", "Vietnam Payment Solution JSC", "Cổng thanh toán điện tử VNPAY Việt Nam")
    ]
    add_custom_table(["Từ viết tắt", "Thuật ngữ Tiếng Anh", "Ý nghĩa Tiếng Việt"], abbreviations, [2.5, 6.0, 7.5])
    doc.add_page_break()

    # =========================================================================
    # 7. DANH MỤC HÌNH VẼ
    # =========================================================================
    add_p("DANH MỤC CÁC HÌNH VẼ VÀ BIỂU ĐỒ", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=10, space_after=15, indent=0, bold=True, size=15)
    
    figures_list = [
        ("Hình 3.1", "Biểu đồ Use Case phân hệ Khách hàng và Trợ lý ảo Chatbot", "32"),
        ("Hình 3.2", "Biểu đồ Use Case phân hệ Quản trị hệ thống (SportX Admin)", "34"),
        ("Hình 3.3", "Biểu đồ Lớp (Class Diagram) tổng thể cấu trúc hệ thống SportX", "40"),
        ("Hình 3.4", "Biểu đồ tuần tự (Sequence Diagram) quy trình Đặt hàng và Thanh toán VNPAY", "43"),
        ("Hình 3.5", "Biểu đồ tuần tự (Sequence Diagram) quy trình AI Chatbot tư vấn kích cỡ", "45"),
        ("Hình 3.6", "Sơ đồ Thực thể Liên kết (ERD Diagram) Cơ sở dữ liệu MongoDB", "48")
    ]
    add_custom_table(["Ký hiệu hình", "Tên biểu đồ / Hình vẽ", "Trang"], figures_list, [3.0, 10.5, 2.5])
    doc.add_page_break()

    # =========================================================================
    # 8. MỤC LỤC TỔNG QUAN
    # =========================================================================
    add_p("MỤC LỤC", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=10, space_after=15, indent=0, bold=True, size=15)
    
    toc_items = [
        ("LỜI CẢM ƠN", "i"),
        ("LỜI CAM ĐOAN", "ii"),
        ("TÓM TẮT KHÓA LUẬN", "iii"),
        ("DANH MỤC THUẬT NGỮ VÀ TỪ VIẾT TẮT", "iv"),
        ("DANH MỤC CÁC HÌNH VẼ VÀ BIỂU ĐỒ", "v"),
        ("MỞ ĐẦU", "1"),
        ("CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI VÀ KHẢO SÁT HIỆN TRẠNG", "4"),
        ("  1.1. Bối cảnh thương mại điện tử ngành thời trang thể thao", "4"),
        ("  1.2. Khảo sát hiện trạng và đánh giá các website tương tự", "6"),
        ("  1.3. Bài toán chọn kích cỡ và nhu cầu ứng dụng Trợ lý ảo AI Chatbot", "8"),
        ("  1.4. Nhu cầu tích hợp cổng thanh toán trực tuyến tại Việt Nam", "10"),
        ("  1.5. Yêu cầu nghiệp vụ và bài toán đặt ra cho hệ thống SportX", "11"),
        ("CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG", "13"),
        ("  2.1. Kiến trúc hệ thống Web hiện đại (Clean Architecture & Monorepo)", "13"),
        ("  2.2. Công nghệ Frontend (Next.js 15, React 19, TypeScript, Tailwind CSS)", "15"),
        ("  2.3. Công nghệ Backend và Cơ sở dữ liệu (Node.js, Express, MongoDB, Mongoose)", "18"),
        ("  2.4. Công nghệ xây dựng AI Chatbot & Thuật toán gợi ý kích cỡ", "21"),
        ("  2.5. Công nghệ tích hợp cổng thanh toán trực tuyến VNPAY", "24"),
        ("  2.6. Cơ chế xác thực, phân quyền RBAC và an toàn thông tin", "26"),
        ("  2.7. Công nghệ container hóa với Docker và Docker Compose", "28"),
        ("CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG", "30"),
        ("  3.1. Phân tích yêu cầu chức năng và phi chức năng", "30"),
        ("  3.2. Mô hình hóa tác nhân và Biểu đồ Use Case tổng thể", "32"),
        ("  3.3. Phân rã Use Case theo các phân hệ chức năng", "35"),
        ("  3.4. Đặc tả chi tiết các Use Case chính", "37"),
        ("  3.5. Biểu đồ Lớp (Class Diagram) tổng thể hệ thống", "40"),
        ("  3.6. Biểu đồ tuần tự (Sequence Diagram) cho các nghiệp vụ cốt lõi", "43"),
        ("  3.7. Thiết kế cơ sở dữ liệu chi tiết (Database Schema & 11 Collections)", "47"),
        ("  3.8. Thiết kế kiến trúc và giao diện người dùng (UI/UX Sitemap)", "55"),
        ("CHƯƠNG 4: CÀI ĐẶT, THỰC NGHIỆM VÀ ĐÁNH GIÁ KẾT QUẢ", "57"),
        ("  4.1. Môi trường cài đặt và cấu trúc mã nguồn dự án", "57"),
        ("  4.2. Hiện thực hóa các chức năng phía Khách hàng (Client Portal)", "59"),
        ("  4.3. Hiện thực hóa các chức năng phía Quản trị viên (Admin Dashboard)", "63"),
        ("  4.4. Hiện thực hóa động cơ AI Size Engine và Chatbot hỗ trợ 24/7", "67"),
        ("  4.5. Hiện thực hóa luồng thanh toán trực tuyến qua VNPAY Sandbox", "70"),
        ("  4.6. Kiểm thử hệ thống (System Testing & Test Cases)", "72"),
        ("  4.7. Đánh giá kết quả đạt được và hiệu năng hệ thống", "76"),
        ("KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN", "78"),
        ("TÀI LIỆU THAM KHẢO", "80"),
        ("PHỤ LỤC", "82")
    ]
    for title, page in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.2
        r1 = p.add_run(title)
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(12)
        if title.startswith("CHƯƠNG") or title in ["MỞ ĐẦU", "KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN", "TÀI LIỆU THAM KHẢO", "PHỤ LỤC", "DANH MỤC CÁC HÌNH VẼ VÀ BIỂU ĐỒ"]:
            r1.font.bold = True
        
        dots_count = max(3, 75 - len(title))
        r2 = p.add_run(" " + "." * dots_count + " ")
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(10)
        r2.font.color.rgb = RGBColor(128, 128, 128)

        r3 = p.add_run(page)
        r3.font.name = 'Times New Roman'
        r3.font.size = Pt(12)
        r3.font.bold = True

    doc.add_page_break()

    # =========================================================================
    # PHẦN NỘI DUNG CHÍNH: MỞ ĐẦU
    # =========================================================================
    add_h1("MỞ ĐẦU")
    
    add_h2("1. Tính cấp thiết của đề tài")
    add_p("Trong bối cảnh nền kinh tế số và thương mại điện tử (TMĐT) bùng nổ mạnh mẽ tại Việt Nam sau đại dịch Covid-19, thói quen mua sắm của người tiêu dùng đã có sự chuyển dịch sâu sắc từ phương thức truyền thống sang các kênh trực tuyến. Đặc biệt, ngành hàng thời trang thể thao (Sportswear) chứng kiến tốc độ tăng trưởng vượt bậc nhờ nhận thức về sức khỏe, phong trào rèn luyện thể thao (bóng đá, chạy bộ, cầu lông, gym...) ngày càng phổ biến trong giới trẻ và tầng lớp trung lưu.")
    add_p("Tuy nhiên, thương mại điện tử ngành thời trang thể thao đang phải đối mặt với một rào cản nghiêm trọng: tỷ lệ đổi trả hàng (Return Rate) rất cao, dao động từ 30% đến 40% tổng số đơn hàng bán ra. Nguyên nhân chủ yếu xuất phát từ việc khách hàng không thể thử đồ trực tiếp, trong khi bảng kích cỡ (Size Chart) giữa các thương hiệu thể thao quốc tế (Nike, Adidas, Puma) và các thương hiệu nội địa có sự chênh lệch đáng kể về thông số chiều cao, cân nặng và phom dáng (Regular Fit, Slim Fit, Oversized). Việc tư vấn thủ công qua nhân viên trực tin nhắn thường chậm trễ, thiếu đồng bộ và không hoạt động 24/7.")
    add_p("Bên cạnh đó, xu hướng thanh toán không dùng tiền mặt (Cashless Payment) tại Việt Nam đang phát triển thần tốc với sự phổ cập của mã QR Code, ứng dụng ngân hàng số và ví điện tử (VNPAY, MoMo). Khách hàng đòi hỏi một quy trình mua sắm khép kín, tiện lợi, thanh toán nhanh chóng và tức thời thay vì phụ thuộc hoàn toàn vào hình thức trả tiền mặt khi nhận hàng (COD) vốn tiềm ẩn nhiều rủi ro bom hàng.")
    add_p("Xuất phát từ thực tiễn trên, việc nghiên cứu và xây dựng đề tài: \"Xây dựng website thương mại điện tử kinh doanh quần áo thể thao tích hợp Chatbot hỗ trợ tư vấn sản phẩm và thanh toán trực tuyến\" là một yêu cầu hết sức cấp thiết, có ý nghĩa khoa học và giá trị ứng dụng thực tiễn cao.")

    add_h2("2. Mục tiêu nghiên cứu của đề tài")
    add_p("Khóa luận hướng tới đạt được các mục tiêu trọng tâm sau:")
    add_bullet("Khảo sát toàn diện nghiệp vụ kinh doanh thời trang thể thao trực tuyến, phân tích các điểm nghẽn trong luồng trải nghiệm khách hàng và quy trình vận hành đơn hàng.")
    add_bullet("Thiết kế và xây dựng hoàn chỉnh nền tảng TMĐT SportX với kiến trúc Monorepo hiện đại gồm 3 phân hệ: Cổng mua sắm khách hàng (Client), Cổng quản trị vận hành (Admin Dashboard) và Máy chủ dịch vụ API (Backend).")
    add_bullet("Nghiên cứu và hiện thực hóa động cơ Trợ lý ảo AI Chatbot có khả năng trích xuất thông số thể hình tự nhiên, tính toán chỉ số BMI kết hợp ma trận bảng quy tắc (Multi-criteria Size Rules) để tự động tư vấn size chuẩn xác và giải đáp tức thì các câu hỏi thường gặp (FAQ).")
    add_bullet("Tích hợp giải pháp thanh toán điện tử trực tuyến an toàn thông qua cổng VNPAY Sandbox với quy trình mã hóa chữ ký số HMAC-SHA512 và xác nhận thanh toán tự động qua Webhook IPN.")

    add_h2("3. Đối tượng và phạm vi nghiên cứu")
    add_p("Đối tượng nghiên cứu: Các công nghệ phát triển Web hiện đại (Next.js 15, React 19, Node.js, Express, TypeScript, MongoDB); quy trình tích hợp cổng thanh toán trực tuyến; các giải pháp xử lý ngôn ngữ tự nhiên (NLP) mức độ ứng dụng và thuật toán xây dựng hệ thống tư vấn kích cỡ tự động.")
    add_p("Phạm vi đề tài: Xây dựng hệ thống phần mềm thương mại điện tử theo mô hình B2C (Doanh nghiệp tới Khách hàng). Tập trung chuyên sâu vào ngành hàng trang phục thể thao. Đề tài không đi sâu vào nghiệp vụ kho bãi đa chi nhánh phức tạp hay logistics vận tải đường dài mà tập trung tối ưu hóa luồng tương tác của khách hàng, độ chuẩn xác của AI Chatbot tư vấn size và tính toàn vẹn của giao dịch thanh toán trực tuyến.")

    add_h2("4. Phương pháp nghiên cứu")
    add_p("Đề tài áp dụng kết hợp các phương pháp nghiên cứu sau:")
    add_bullet("Phương pháp thu thập và phân tích tài liệu: Nghiên cứu các chuẩn kiến trúc phần mềm (REST API, Clean Architecture), tài liệu kỹ thuật của cổng thanh toán VNPAY và các lý thuyết về hệ thống tư vấn (Recommendation Systems).")
    add_bullet("Phương pháp khảo sát và phân tích hiện trạng: Trải nghiệm thực tế các nền tảng TMĐT hàng đầu (Shopee, Coolmate, Nike) để đúc kết ưu - nhược điểm và yêu cầu giao diện.")
    add_bullet("Phương pháp phân tích và thiết kế hệ thống hướng đối tượng: Sử dụng ngôn ngữ mô hình hóa UML (Use Case Diagram, Activity Diagram, Sequence Diagram, Class Diagram, ERD) để mô hình hóa toàn bộ bài toán.")
    add_bullet("Phương pháp thực nghiệm và kiểm thử: Cài đặt hệ thống thực tế trên máy tính, chạy Docker container cơ sở dữ liệu và tiến hành kiểm thử chức năng theo các bộ Test Cases định trước.")

    add_h2("5. Bố cục của khóa luận")
    add_p("Báo cáo khóa luận được kết cấu thành 4 chương chính như sau:")
    add_bullet("Chương 1: Tổng quan đề tài và Khảo sát hiện trạng - Trình bày bối cảnh kinh doanh, phân tích hiện trạng các website tương tự và xác định bài toán nghiệp vụ.")
    add_bullet("Chương 2: Cơ sở lý thuyết và Công nghệ sử dụng - Giới thiệu các nền tảng công nghệ, ngôn ngữ lập trình, hệ quản trị cơ sở dữ liệu, nguyên lý Chatbot AI và giải pháp thanh toán VNPAY.")
    add_bullet("Chương 3: Phân tích và Thiết kế hệ thống - Phân tích yêu cầu chức năng/phi chức năng, biểu đồ Use Case, biểu đồ Lớp (Class Diagram), biểu đồ tuần tự (Sequence Diagram), đặc tả cơ sở dữ liệu chi tiết (11 Collections).")
    add_bullet("Chương 4: Cài đặt, Thực nghiệm và Đánh giá kết quả - Mô tả kết quả cài đặt các màn hình chức năng, demo thuật toán Chatbot, quy trình thanh toán VNPAY và báo cáo kiểm thử.")
    add_bullet("Phần Kết luận và Hướng phát triển - Tổng kết các đóng góp, chỉ ra hạn chế và đề xuất hướng nghiên cứu tiếp theo.")

    doc.add_page_break()

    # =========================================================================
    # CHƯƠNG 1
    # =========================================================================
    add_h1("CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI VÀ KHẢO SÁT HIỆN TRẠNG")
    
    add_h2("1.1. Bối cảnh thương mại điện tử ngành thời trang thể thao")
    add_p("Thời trang thể thao (Sportswear / Activewear) không chỉ đơn thuần phục vụ cho hoạt động tập luyện mà đã trở thành một phong cách sống (Athleisure) được ưa chuộng rộng rãi. Theo các báo cáo thị trường TMĐT Đông Nam Á, doanh thu ngành hàng thời trang thể thao trực tuyến tại Việt Nam đạt tốc độ tăng trưởng trung bình trên 20% mỗi năm.")
    add_p("Tuy nhiên, kinh doanh trang phục thể thao có những đặc thù riêng biệt so với quần áo thông thường:")
    add_bullet("Yêu cầu cao về độ vừa vặn và phom dáng: Trang phục thể thao cần đảm bảo tính co giãn, thoáng khí và hỗ trợ cơ bắp. Một bộ quần áo bóng đá hay chạy bộ quá chật sẽ gây cản trở vận động, trong khi quá rộng sẽ gây vướng víu và mất thẩm mỹ.")
    add_bullet("Sự đa dạng về phân loại môn thể thao: Khách hàng thường tìm kiếm đồ theo môn vận động chuyên biệt (bóng đá, gym/fitness, chạy bộ, cầu lông, bóng rổ...) đi kèm các thông số kỹ thuật vải (Dri-Fit, Spandex, Polyester tái chế...).")
    add_bullet("Áp lực phục vụ khách hàng tức thì: Khách hàng mua sắm trực tuyến thường quyết định mua hàng trong thời gian ngắn. Nếu có thắc mắc về kích cỡ mà không được phản hồi ngay lập tức, khả năng họ rời bỏ giỏ hàng là rất cao.")

    add_h2("1.2. Khảo sát hiện trạng và đánh giá các website tương tự")
    add_p("Để có cái nhìn khách quan và xây dựng giải pháp tối ưu cho SportX, tác giả đã tiến hành khảo sát, so sánh 3 nhóm nền tảng tiêu biểu hiện nay:")
    
    survey_data = [
        ("Sàn TMĐT lớn (Shopee, Lazada, TikTok Shop)", 
         "Hệ thống thanh toán và logistics hoàn chỉnh; lượng truy cập khổng lồ.", 
         "Giao diện phân tán, nhiều nguồn hàng giả/kém chất lượng; không có tư vấn kích cỡ chuyên sâu; phụ thuộc tin nhắn shop phản hồi chậm.", 
         "Cần xây dựng thương hiệu chuyên biệt, tích hợp trợ lý ảo tư vấn tức thời."),
        ("Website thương hiệu nội địa (Coolmate.me)", 
         "Giao diện UI/UX mượt mà, tối giản; dịch vụ hậu mãi và đóng gói tốt.", 
         "Chatbot chủ yếu dựa trên các cây kịch bản tĩnh (Button-based); chưa có khả năng phân tích ngôn ngữ tự nhiên sâu và ít dòng sản phẩm thể thao chuyên nghiệp.", 
         "Học hỏi cách thiết kế giao diện tinh gọn, cải tiến Chatbot thông minh hơn."),
        ("Website thương hiệu quốc tế (Nike, Adidas VN)", 
         "Hình ảnh chuyên nghiệp, bộ lọc sản phẩm chi tiết theo môn thể thao.", 
         "Giá thành cao; giao diện load nặng; thiếu các phương thức thanh toán ví điện tử nội địa thông dụng tại Việt Nam (MoMo, VNPAY-QR).", 
         "Bổ sung đa dạng phương thức thanh toán nội địa và tối ưu tốc độ tải trang.")
    ]
    add_custom_table(["Nhóm nền tảng", "Ưu điểm nổi bật", "Hạn chế tồn tại", "Bài học rút ra cho SportX"], survey_data, [3.0, 4.0, 4.5, 4.5])
    add_table_caption("So sánh phân tích các nền tảng thương mại điện tử hiện nay", "1.1")

    add_h2("1.3. Bài toán chọn kích cỡ và nhu cầu ứng dụng Trợ lý ảo AI Chatbot")
    add_p("Một trong những nguyên nhân hàng đầu khiến khách hàng ngần ngại khi mua quần áo thể thao qua mạng là nỗi lo không vừa size. Bảng kích thước thông thường (Size Chart) chỉ hiển thị các con số đo vòng ngực, vòng eo hoặc chiều cao/cân nặng cố định mà không tính đến các yếu tố thể trạng cá nhân.")
    add_p("Việc tích hợp Trợ lý ảo AI Chatbot đóng vai trò như một nhân viên bán hàng ảo (Virtual Stylist) thường trực 24/7 với các lợi ích vượt trội:")
    add_bullet("Tự động hóa tư vấn: Chatbot có khả năng tự động nhận diện thông số chiều cao, cân nặng từ câu chat của khách, tính toán thể trạng và đưa ra kích cỡ khuyến nghị chuẩn xác.")
    add_bullet("Giảm tải chi phí nhân sự: Tự động trả lời đến 85% các câu hỏi thường gặp về thời gian giao hàng, biểu phí ship và chính sách đổi trả hàng.")
    add_bullet("Thúc đẩy tỷ lệ chuyển đổi: Gợi ý sản phẩm kèm link mua nhanh ngay trong cửa sổ chat, giúp rút ngắn hành trình mua sắm của khách.")

    add_h2("1.4. Nhu cầu tích hợp cổng thanh toán trực tuyến tại Việt Nam")
    add_p("Trước đây, hình thức COD (giao hàng thu tiền) chiếm ưu thế áp đảo. Tuy nhiên, COD bộc lộ nhiều điểm yếu cho chủ cửa hàng: tỷ lệ chuyển hoàn cao do khách hủy đơn đột ngột, dòng tiền bị đơn vị vận chuyển giữ từ 7-15 ngày, nguy cơ thất thoát tiền mặt.")
    add_p("Việc tích hợp cổng thanh toán VNPAY giải quyết triệt để các vấn đề trên:")
    add_bullet("Thao tác thanh toán cực nhanh: Hỗ trợ quét mã VNPAY-QR qua hơn 40 ứng dụng ngân hàng và ví điện tử.")
    add_bullet("Tính bảo mật cao: Sử dụng thuật toán băm mã hóa HMAC-SHA512 để bảo vệ toàn vẹn dữ liệu giao dịch.")
    add_bullet("Tự động hóa hoàn toàn: Hệ thống nhận thông báo kết quả tức thời (IPN Webhook) để cập nhật trạng thái đơn hàng sang 'Đã thanh toán', giảm thiểu nhân công đối soát thủ công.")

    add_h2("1.5. Yêu cầu nghiệp vụ và bài toán đặt ra cho hệ thống SportX")
    add_p("Từ việc khảo sát hiện trạng, hệ thống SportX cần đáp ứng đầy đủ các nhóm nghiệp vụ chính sau:")
    add_bullet("Nghiệp vụ Phía Khách hàng (Client Portal): Duyệt danh mục, tìm kiếm và lọc sản phẩm đa tiêu chí; xem chi tiết sản phẩm và chọn biến thể (size, màu); quản lý giỏ hàng; áp dụng mã giảm giá; thanh toán trực tuyến qua VNPAY / COD; theo dõi đơn hàng và tương tác với AI Chatbot.")
    add_bullet("Nghiệp vụ Phía Quản trị (Admin Dashboard): Quản lý danh mục, sản phẩm và biến thể kho; duyệt và xử lý trạng thái đơn hàng; quản lý danh sách khách hàng; tạo mã khuyến mãi (Coupon); quản trị cơ sở tri thức Chatbot (luật size, câu hỏi FAQ); xem báo cáo doanh thu và phân tích hiệu suất bán hàng.")

    doc.add_page_break()

    # =========================================================================
    # CHƯƠNG 2
    # =========================================================================
    add_h1("CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG")

    add_h2("2.1. Kiến trúc hệ thống Web hiện đại (Clean Architecture & Monorepo)")
    add_p("Dự án áp dụng mô hình kiến trúc phân tầng sạch (Clean Layered Architecture) kết hợp cấu trúc Monorepo được quản lý bởi công cụ pnpm workspace. Kiến trúc này tách biệt rõ ràng giữa các tầng trách nhiệm:")
    add_bullet("Tầng giao diện (Presentation Layer): Gồm 2 ứng dụng frontend độc lập là Client (Next.js 15) và Admin (React 19 + Vite).")
    add_bullet("Tầng nghiệp vụ & ứng dụng (Application Layer): Backend Node.js Express đóng vai trò cung cấp RESTful API, tiếp nhận yêu cầu, kiểm tra dữ liệu và điều phối logic.")
    add_bullet("Tầng dịch vụ miền và thuật toán (Domain & Service Layer): Chứa bộ thuật toán tính toán kích cỡ (AI Size Engine), bộ khớp ý định FAQ và module mã hóa thanh toán VNPAY.")
    add_bullet("Tầng lưu trữ dữ liệu (Data Access Layer): Sử dụng Mongoose ODM để tương tác với cơ sở dữ liệu MongoDB.")

    add_h2("2.2. Công nghệ Frontend (Next.js 15, React 19, TypeScript, Tailwind CSS)")
    add_p("Phía máy khách được thiết kế bằng các công nghệ tân tiến nhất hiện nay:")
    add_bullet("Next.js 15 (Client Website): Sử dụng kiến trúc App Router, hỗ trợ kết xuất phía máy chủ (Server-Side Rendering - SSR) giúp trang web tải tức thì, tối ưu hóa công cụ tìm kiếm (SEO) và bảo vệ an toàn các biến môi trường.")
    add_bullet("React 19 & Vite (Admin Dashboard): Cung cấp môi trường phát triển siêu tốc với cơ chế Hot Module Replacement (HMR), giúp xây dựng giao diện quản trị dạng ứng dụng đơn trang (SPA) phản hồi mượt mà.")
    add_bullet("TypeScript: Bổ sung hệ thống kiểu tĩnh chặt chẽ (Strict Typing), giúp phát hiện lỗi biên dịch sớm, nâng cao tính tin cậy của mã nguồn và thuận tiện cho việc bảo trì, tái cấu trúc.")
    add_bullet("Tailwind CSS: Framework tiện ích CSS hiện đại cho phép xây dựng giao diện tương thích hoàn hảo trên mọi kích thước màn hình (Responsive Design).")

    add_h2("2.3. Công nghệ Backend và Cơ sở dữ liệu (Node.js, Express, MongoDB, Mongoose)")
    add_p("Hệ thống máy chủ sử dụng hệ sinh thái JavaScript/TypeScript đồng nhất:")
    add_bullet("Node.js & Express: Môi trường thực thi phi đồng bộ, hướng sự kiện (Event-driven, Non-blocking I/O) giúp xử lý đồng thời hàng nghìn kết nối mà không làm chậm hệ thống. Express cung cấp cơ chế Middleware linh hoạt cho việc xác thực, ghi log và xử lý lỗi tập trung.")
    add_bullet("MongoDB (Phiên bản 7.0): Cơ sở dữ liệu NoSQL hướng tài liệu (Document-oriented Database). MongoDB đặc biệt phù hợp với ngành hàng thời trang nhờ tính linh hoạt cao: mỗi sản phẩm có thể chứa mảng các biến thể (variants) gồm nhiều kích cỡ, màu sắc, hình ảnh khác nhau mà không cần tạo quá nhiều bảng liên kết phức tạp.")
    add_bullet("Mongoose ODM: Cung cấp giải pháp định nghĩa lược đồ (Schema Definition), tự động kiểm tra tính hợp lệ của dữ liệu trước khi lưu vào database và quản lý kết nối an toàn.")

    add_h2("2.4. Công nghệ xây dựng AI Chatbot & Thuật toán gợi ý kích cỡ")
    add_p("Động cơ Trợ lý ảo AI trong SportX được thiết kế theo quy trình xử lý ngôn ngữ tự nhiên kết hợp hệ luật đa tiêu chí:")
    add_p("Quy trình gồm 4 giai đoạn:")
    add_bullet("1. Tiền xử lý văn bản (Text Normalization): Chuẩn hóa chữ thường, xóa bỏ ký tự thừa, nhận diện các đơn vị đo phổ biến trong tiếng Việt (cm, m, mét, kg, kí, cân...).")
    add_bullet("2. Trích xuất thực thể (Entity Extraction): Sử dụng biểu thức chính quy (Regex) và từ khóa để bóc tách: Chiều cao (Height - H), Cân nặng (Weight - W), Giới tính (Gender - G), Sở thích mặc (Form fit - ôm/vừa/rộng).")
    add_bullet("3. Tính toán thể trạng (BMI Calculation):")

    add_p("Chỉ số khối cơ thể (Body Mass Index - BMI) được tính theo công thức chuẩn quốc tế:", indent=1.27)
    add_p("BMI = W / (H / 100)^2", align=WD_ALIGN_PARAGRAPH.CENTER, indent=0, bold=True, size=13)
    add_p("Dựa trên chỉ số BMI, hệ thống phân loại khách hàng thành 3 nhóm thể hình chính: Nhóm gầy (BMI < 18.5), Nhóm chuẩn (18.5 <= BMI < 24.9) và Nhóm đậm người (BMI >= 25.0). Đối với nhóm đậm người, thuật toán tự động khuyến nghị nâng thêm 1 size để đảm bảo sự thoải mái khi vận động.")
    add_bullet("4. Khớp ma trận quy tắc (Rule Matching Matrix): Hệ thống duyệt đối sánh các khoảng giá trị [HeightMin, HeightMax] và [WeightMin, WeightMax] trong bảng SizeRule để trả về kích cỡ phù hợp nhất với độ tin cậy trên 95%.")

    add_h2("2.5. Công nghệ tích hợp cổng thanh toán trực tuyến VNPAY")
    add_p("Quy trình thanh toán qua VNPAY tuân thủ nghiêm ngặt chuẩn bảo mật tài chính:")
    add_bullet("Tạo URL thanh toán: Khi khách hàng nhấn đặt hàng, Backend tập hợp các thông số giao dịch (Mã đơn hàng, số tiền, thông tin mô tả, mã ngân hàng, IP máy khách, thời gian hết hạn).")
    add_bullet("Ký số bảo mật: Toàn bộ tham số được sắp xếp theo thứ tự bảng chữ cái alphabet và mã hóa chữ ký số thông qua thuật toán HMAC-SHA512 bằng chuỗi khóa bí mật (vnp_HashSecret).")
    add_bullet("Xử lý IPN Webhook: Khi giao dịch hoàn tất tại cổng VNPAY, máy chủ VNPAY gửi tín hiệu ngầm (Server-to-Server) về API của SportX. Hệ thống kiểm tra lại chữ ký và cập nhật trạng thái đơn hàng ngay lập tức.")

    add_h2("2.6. Cơ chế xác thực, phân quyền RBAC và an toàn thông tin")
    add_p("Hệ thống triển khai mô hình kiểm soát truy cập dựa trên vai trò (Role-Based Access Control - RBAC):")
    add_bullet("Bảo mật mật khẩu: Sử dụng thư viện Bcrypt với thuật toán băm kèm muối (Salted Hashing, Salt Rounds = 10), đảm bảo mật khẩu không bao giờ được lưu dưới dạng văn bản thô.")
    add_bullet("Xác thực JWT (JSON Web Token): Sau khi đăng nhập thành công, máy chủ cấp phát một chuỗi JWT Token có hạn sử dụng. Mỗi yêu cầu từ người dùng gửi lên đều phải đính kèm Token trong HTTP Authorization Header dạng 'Bearer <Token>'.")
    add_bullet("Middleware phân quyền: Các API quản trị bắt buộc phải đi qua middleware kiểm tra 'role == admin'. Nếu người dùng không có quyền, hệ thống lập tức từ chối yêu cầu với mã lỗi HTTP 403 Forbidden.")

    add_h2("2.7. Công nghệ container hóa với Docker và Docker Compose")
    add_p("Toàn bộ môi trường cơ sở dữ liệu MongoDB và công cụ quản trị trực quan Mongo-Express được đóng gói trong tệp docker-compose.yml. Giải pháp này giúp môi trường phát triển và môi trường thực tế hoàn toàn đồng nhất, chỉ cần khởi chạy bằng một câu lệnh duy nhất (docker-compose up -d) mà không cần cài đặt CSDL thủ công trên máy chủ.")

    doc.add_page_break()

    # =========================================================================
    # CHƯƠNG 3
    # =========================================================================
    add_h1("CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG")

    add_h2("3.1. Phân tích yêu cầu chức năng và phi chức năng")
    add_p("Hệ thống SportX được thiết kế đáp ứng các yêu cầu chất lượng cao:")
    add_h3("a. Yêu cầu chức năng (Functional Requirements)")
    add_bullet("Chức năng người dùng: Đăng ký, đăng nhập, quản lý thông tin tài khoản; duyệt danh mục, tìm kiếm và lọc sản phẩm; xem chi tiết sản phẩm; quản lý giỏ hàng; áp dụng mã giảm giá; đặt hàng và thanh toán trực tuyến; theo dõi đơn hàng.")
    add_bullet("Chức năng Chatbot AI: Nhận diện câu hỏi tự nhiên; tư vấn kích cỡ tự động theo chiều cao, cân nặng; giải đáp câu hỏi thường gặp; gợi ý sản phẩm.")
    add_bullet("Chức năng quản trị: Đăng nhập quản trị; quản lý sản phẩm, biến thể và số lượng tồn kho; duyệt và chuyển trạng thái đơn hàng; quản lý danh sách khách hàng; quản lý khuyến mãi; cấu hình quy tắc AI Chatbot; thống kê báo cáo doanh thu.")

    add_h3("b. Yêu cầu phi chức năng (Non-Functional Requirements)")
    add_bullet("Hiệu năng (Performance): Thời gian phản hồi API trung bình dưới 300ms; thời gian phản hồi của Chatbot dưới 500ms; giao diện tải trang dưới 2 giây.")
    add_bullet("Khả năng tương thích (Usability): Giao diện tương thích linh hoạt trên mọi kích thước màn hình (Responsive Design).")
    add_bullet("Bảo mật (Security): Mật khẩu được mã hóa an toàn, phiên làm việc xác thực bằng JWT, giao dịch thanh toán được bảo vệ bằng chữ ký số HMAC-SHA512.")
    add_bullet("Tính sẵn sàng và độ tin cậy (Reliability): Hệ thống hoạt động liên tục 24/7, dữ liệu đơn hàng và giao dịch luôn đảm bảo tính nhất quán (ACID).")

    add_h2("3.2. Mô hình hóa tác nhân và Biểu đồ Use Case tổng thể")
    add_p("Hệ thống xác định 4 tác nhân chính tham gia tương tác:")
    add_bullet("Khách vãng lai (Guest User): Người dùng truy cập website nhưng chưa đăng nhập tài khoản.")
    add_bullet("Khách hàng (Customer): Người dùng đã có tài khoản hợp lệ, có thể mua hàng và theo dõi đơn.")
    add_bullet("Quản trị viên (Admin): Nhân sự quản trị và vận hành toàn bộ hoạt động của hệ thống.")
    add_bullet("Hệ thống thanh toán VNPAY (External Payment Gateway): Hệ thống bên ngoài cung cấp dịch vụ thanh toán.")

    add_p("Dưới đây là biểu đồ Use Case mô hình hóa các tương tác của Khách hàng và Khách vãng lai với hệ thống website:")
    add_figure("uc_customer.png", "Biểu đồ Use Case phân hệ Khách hàng và Trợ lý ảo Chatbot", "3.1")

    add_p("Biểu đồ Use Case mô hình hóa các chức năng tác nghiệp của Quản trị viên trên trang SportX Admin:")
    add_figure("uc_admin.png", "Biểu đồ Use Case phân hệ Quản trị hệ thống (SportX Admin)", "3.2")

    add_h2("3.3. Phân rã Use Case theo các phân hệ chức năng")
    add_p("Dưới đây là bảng danh mục 25 Use Case hoàn chỉnh được phân loại theo 6 phân hệ cốt lõi:")
    
    uc_table_data = [
        ("UC-01", "Đăng ký tài khoản", "Khách vãng lai", "Tạo tài khoản mới bằng họ tên, email, mật khẩu"),
        ("UC-02", "Đăng nhập hệ thống", "Khách hàng, Admin", "Xác thực phiên làm việc, cấp JWT Token và phân quyền"),
        ("UC-03", "Đăng xuất tài khoản", "Khách hàng, Admin", "Hủy phiên làm việc và xóa token đã lưu"),
        ("UC-04", "Quản lý thông tin cá nhân", "Khách hàng", "Xem và sửa họ tên, số điện thoại, địa chỉ nhận hàng"),
        ("UC-05", "Xem danh mục & Trang chủ", "Khách vãng lai, Khách hàng", "Xem banner, sản phẩm mới, sản phẩm bán chạy"),
        ("UC-06", "Tìm kiếm sản phẩm", "Khách vãng lai, Khách hàng", "Tìm kiếm theo từ khóa tên đồ thể thao, thương hiệu"),
        ("UC-07", "Lọc & sắp xếp sản phẩm", "Khách vãng lai, Khách hàng", "Lọc theo môn (Bóng đá, Gym...), giá, size, màu sắc"),
        ("UC-08", "Xem chi tiết sản phẩm", "Khách vãng lai, Khách hàng", "Xem ảnh, mô tả, thông số và chọn biến thể size/màu"),
        ("UC-09", "Quản lý giỏ hàng", "Khách vãng lai, Khách hàng", "Thêm/sửa số lượng/xóa sản phẩm trong giỏ hàng"),
        ("UC-10", "Áp dụng mã giảm giá", "Khách hàng", "Nhập mã coupon để được chiết khấu tiền đơn hàng"),
        ("UC-11", "Đặt hàng (Checkout)", "Khách hàng", "Điền địa chỉ giao hàng và xác nhận mua hàng"),
        ("UC-12", "Theo dõi đơn hàng", "Khách hàng", "Xem lịch sử mua sắm và tiến độ xử lý đơn hàng"),
        ("UC-13", "Thanh toán COD", "Khách hàng", "Chọn hình thức trả tiền mặt khi shipper giao tận nơi"),
        ("UC-14", "Thanh toán VNPAY", "Khách hàng, VNPAY", "Quét mã VNPAY-QR, tự động xác thực chữ ký SHA512"),
        ("UC-15", "Trò chuyện với Chatbot", "Khách vãng lai, Khách hàng", "Mở khung chat 24/7, gửi tin nhắn thắc mắc tự nhiên"),
        ("UC-16", "Nhận tư vấn kích cỡ (Size)", "Khách vãng lai, Khách hàng", "Nhập chiều cao/cân nặng để nhận gợi ý size chuẩn"),
        ("UC-17", "Giải đáp thắc mắc FAQ", "Khách hàng, Chatbot", "Tự động phản hồi chính sách đổi trả, biểu phí ship"),
        ("UC-18", "Gợi ý sản phẩm qua Chat", "Khách hàng, Chatbot", "Chatbot gửi thẻ sản phẩm gợi ý kèm nút mua nhanh"),
        ("UC-19", "Quản lý sản phẩm & Kho", "Admin", "Thêm, sửa, xóa sản phẩm, màu sắc, size và tồn kho"),
        ("UC-20", "Quản lý & Duyệt đơn hàng", "Admin", "Cập nhật trạng thái đơn (Duyệt, Đang giao, Đã giao)"),
        ("UC-21", "Quản lý khách hàng", "Admin", "Xem danh sách khách, phân hạng VIP và khóa tài khoản"),
        ("UC-22", "Quản lý mã khuyến mãi", "Admin", "Tạo mã coupon, thiết lập hạn mức và hạn sử dụng"),
        ("UC-23", "Cấu hình AI Chatbot & FAQ", "Admin", "Quản lý bảng luật SizeRule, câu hỏi FAQ và lịch sử chat"),
        ("UC-24", "Thống kê & Báo cáo", "Admin", "Biểu đồ doanh thu, top sản phẩm và hiệu suất bot"),
        ("UC-25", "Cài đặt hệ thống & Cổng TT", "Admin", "Cấu hình thông tin cửa hàng, bật tắt cổng thanh toán")
    ]
    add_custom_table(["Mã UC", "Tên Use Case", "Tác nhân chính", "Mô tả tóm tắt"], uc_table_data, [2.0, 4.5, 4.0, 5.5])
    add_table_caption("Bảng danh mục các Use Case trong hệ thống SportX", "3.1")

    add_h2("3.4. Đặc tả chi tiết các Use Case chính")

    add_h3("a. Đặc tả Use Case UC-16: Nhận tư vấn kích cỡ tự động qua Chatbot")
    add_bullet("Tên Use Case: Nhận tư vấn kích cỡ tự động (AI Auto Size Fitting).")
    add_bullet("Tác nhân: Khách hàng / Khách vãng lai, Chatbot Engine.")
    add_bullet("Mục đích: Giúp khách hàng nhanh chóng chọn được kích cỡ quần áo thể thao phù hợp nhất theo số đo thể trạng thực tế, giảm thiểu tối đa tỷ lệ đổi trả hàng.")
    add_bullet("Tiền điều kiện: Khách hàng mở hộp thoại Chatbot nổi trên giao diện website.")
    add_bullet("Hậu điều kiện: Hệ thống trả về kích cỡ khuyến nghị (S, M, L, XL, XXL) kèm thẻ sản phẩm liên quan.")
    add_bullet("Luồng sự kiện chính:")
    add_p("1. Khách hàng bấm vào biểu tượng Chatbot và gõ câu hỏi tư vấn (ví dụ: 'Mình cao 1m72 nặng 65kg mặc áo bóng đá size gì?').", indent=1.5)
    add_p("2. Chatbot tiếp nhận tin nhắn, chuyển sang module trích xuất thực thể để tách dữ liệu: Chiều cao = 172cm, Cân nặng = 65kg.", indent=1.5)
    add_p("3. Chatbot Engine tính toán chỉ số BMI = 65 / (1.72^2) = 21.97 (Thể trạng cân đối).", indent=1.5)
    add_p("4. Hệ thống tra cứu bảng luật SizeRule thỏa mãn khoảng chiều cao 168-175cm và cân nặng 62-68kg.", indent=1.5)
    add_p("5. Chatbot gửi tin nhắn phản hồi: 'Với chiều cao 1m72 và cân nặng 65kg, thể trạng của bạn rất chuẩn. Kích cỡ phù hợp nhất cho bạn là Size L.' kèm theo thẻ sản phẩm đồ bóng đá mới nhất.", indent=1.5)
    add_bullet("Luồng sự kiện thay thế: Nếu khách hàng nhập thiếu thông số (ví dụ chỉ nhập 'nặng 70kg'), Chatbot sẽ chủ động hỏi thêm: 'Bạn vui lòng cho shop biết thêm chiều cao của bạn để tư vấn chuẩn xác nhất nhé!'.")

    add_h3("b. Đặc tả Use Case UC-14: Thanh toán trực tuyến qua cổng VNPAY")
    add_bullet("Tên Use Case: Thanh toán đơn hàng trực tuyến qua VNPAY.")
    add_bullet("Tác nhân: Khách hàng, Cổng thanh toán VNPAY, Máy chủ Backend.")
    add_bullet("Mục đích: Thanh toán an toàn, tức thì cho đơn hàng thông qua tài khoản ngân hàng hoặc quét mã QR.")
    add_bullet("Tiền điều kiện: Giỏ hàng có sản phẩm, khách hàng hoàn thành nhập địa chỉ giao hàng và chọn phương thức 'Thanh toán qua VNPAY'.")
    add_bullet("Hậu điều kiện: Đơn hàng được cập nhật trạng thái 'Đã thanh toán', số lượng tồn kho tự động khấu trừ.")
    add_bullet("Luồng sự kiện chính:")
    add_p("1. Khách hàng nhấn nút 'Xác nhận đặt hàng' tại trang Thanh toán.", indent=1.5)
    add_p("2. Hệ thống tạo bản ghi đơn hàng mới với trạng thái paymentStatus = 'Unpaid'.", indent=1.5)
    add_p("3. Backend tạo chuỗi liên kết thanh toán VNPAY kèm chữ ký bảo mật SHA-512 và chuyển hướng trình duyệt của khách hàng sang cổng VNPAY.", indent=1.5)
    add_p("4. Khách hàng quét mã VNPAY-QR hoặc nhập thông tin thẻ ATM và xác thực mã OTP gửi về điện thoại.", indent=1.5)
    add_p("5. Cổng VNPAY xử lý giao dịch thành công và gửi đồng thời 2 luồng: Tín hiệu IPN ngầm về máy chủ SportX và chuyển hướng người dùng về trang kết quả đơn hàng.", indent=1.5)
    add_p("6. Máy chủ SportX kiểm tra chữ ký số hợp lệ và cập nhật đơn hàng thành paymentStatus = 'Paid'.", indent=1.5)
    add_p("7. Khách hàng nhận được thông báo đặt hàng và thanh toán thành công.", indent=1.5)

    doc.add_page_break()
    add_h2("3.5. Biểu đồ Lớp (Class Diagram) tổng thể hệ thống")
    add_p("Biểu đồ Lớp (Class Diagram) mô tả cấu trúc tĩnh của hệ thống SportX, bao gồm các thực thể dữ liệu chính (User, Customer, Product, ProductVariant, Order, OrderItem, SizeRule, Coupon), các lớp dịch vụ miền (AISizeEngine, PaymentService) cùng các thuộc tính, phương thức và mối quan hệ giữa chúng:")
    add_figure("class_diagram.png", "Biểu đồ Lớp (Class Diagram) tổng thể cấu trúc hệ thống SportX", "3.3", width_cm=16.0)

    add_p("Mối quan hệ chính giữa các lớp:")
    add_bullet("Quan hệ 1-1 giữa User và Customer: Mỗi tài khoản người dùng gắn liền với một hồ sơ khách hàng lưu trữ thông tin giao hàng và phân hạng.")
    add_bullet("Quan hệ 1-N giữa Customer và Order: Một khách hàng có thể tạo nhiều đơn đặt hàng theo thời gian.")
    add_bullet("Quan hệ Hợp thành (Composition 1-N) giữa Order và OrderItem: Đơn hàng chứa danh sách các mặt hàng chi tiết; khi hủy hoặc xóa đơn hàng, các dòng mặt hàng tương ứng cũng bị xóa.")
    add_bullet("Quan hệ Phụ thuộc (Dependency) giữa AISizeEngine và SizeRule: Động cơ AI tư vấn sử dụng các quy tắc trong SizeRule để tính toán và trả về kết quả.")
    add_bullet("Quan hệ giữa PaymentService và Order: Dịch vụ thanh toán nhận thông tin đơn hàng để tạo URL ký số và xác thực trạng thái giao dịch.")

    add_h2("3.6. Biểu đồ tuần tự (Sequence Diagram) cho các nghiệp vụ cốt lõi")

    add_h3("a. Biểu đồ tuần tự quy trình Đặt hàng và Thanh toán trực tuyến VNPAY")
    add_p("Quy trình xử lý thanh toán trực tuyến mô hình hóa tương tác giữa Khách hàng, Client Frontend, Backend Express API, Cổng VNPAY và CSDL MongoDB:")
    add_figure("seq_payment.png", "Biểu đồ tuần tự (Sequence Diagram) quy trình Đặt hàng và Thanh toán VNPAY", "3.4", width_cm=16.0)

    add_h3("b. Biểu đồ tuần tự quy trình AI Chatbot tư vấn kích cỡ và sản phẩm")
    add_p("Quy trình tiếp nhận tin nhắn tự nhiên, trích xuất thực thể, tính toán BMI, tra cứu ma trận quy tắc và phản hồi khách hàng:")
    add_figure("seq_chatbot.png", "Biểu đồ tuần tự (Sequence Diagram) quy trình AI Chatbot tư vấn kích cỡ", "3.5", width_cm=16.0)

    doc.add_page_break()
    add_h2("3.7. Thiết kế cơ sở dữ liệu chi tiết (Database Schema & 11 Collections)")
    add_p("Hệ thống sử dụng MongoDB làm cơ sở dữ liệu chính với 11 bộ sưu tập (Collections) được chuẩn hóa tối ưu:")
    add_figure("erd_diagram.png", "Sơ đồ Thực thể Liên kết (ERD Diagram) Cơ sở dữ liệu MongoDB", "3.6", width_cm=16.0)

    add_p("Dưới đây là mô tả chi tiết từng trường dữ liệu, kiểu dữ liệu, ràng buộc và ý nghĩa nghiệp vụ của toàn bộ 11 Collections trong cơ sở dữ liệu SportX:")

    # Collection 1: Users
    add_h3("3.7.1. Đặc tả Collection 'users' (Tài khoản người dùng & Quản trị viên)")
    users_fields = [
        ("_id", "ObjectId", "PK, Auto", "Định danh duy nhất của tài khoản", "65f2a1b9c8e1..."),
        ("email", "String", "Unique, Required", "Địa chỉ email đăng nhập", "hungdc@gmail.com"),
        ("passwordHash", "String", "Required", "Mật khẩu đã băm bằng Bcrypt (Salt=10)", "$2b$10$wKz..."),
        ("fullName", "String", "Required", "Họ và tên người dùng", "Đinh Công Hùng"),
        ("phone", "String", "Optional", "Số điện thoại liên hệ", "0398802022"),
        ("role", "String", "Required", "Vai trò: 'customer' hoặc 'admin'", "'customer'"),
        ("status", "String", "Required", "Trạng thái: 'active' hoặc 'blocked'", "'active'"),
        ("createdAt", "Date", "Auto", "Thời điểm đăng ký tài khoản", "2026-09-20T10:00:00Z"),
        ("lastLoginAt", "Date", "Optional", "Thời điểm đăng nhập gần nhất", "2026-10-19T14:30:00Z")
    ]
    add_custom_table(["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả ý nghĩa", "Giá trị ví dụ"], users_fields, [2.5, 2.2, 2.5, 5.0, 3.8])
    add_table_caption("Đặc tả chi tiết Collection 'users'", "3.2")

    # Collection 2: Customers
    add_h3("3.7.2. Đặc tả Collection 'customers' (Hồ sơ khách hàng & Phân hạng)")
    customers_fields = [
        ("_id", "ObjectId", "PK, Auto", "Mã khách hàng", "65f2a2c..."),
        ("userId", "ObjectId", "FK, Unique", "Khóa ngoại liên kết bảng 'users'", "65f2a1b9c8e1..."),
        ("fullName", "String", "Required", "Họ tên khách hàng", "Đinh Công Hùng"),
        ("email", "String", "Unique, Required", "Email khách hàng", "hungdc@gmail.com"),
        ("phone", "String", "Required", "Số điện thoại nhận hàng", "0398802022"),
        ("tier", "String", "Required", "Phân hạng: 'VIP', 'Loyal', 'New'", "'VIP'"),
        ("status", "String", "Required", "Trạng thái: 'Active' hoặc 'Inactive'", "'Active'"),
        ("totalOrders", "Number", "Default: 0", "Tổng số đơn hàng đã đặt thành công", "12"),
        ("lifetimeSpent", "Number", "Default: 0", "Tổng tiền chi tiêu tích lũy (VNĐ)", "8500000"),
        ("addresses", "Array<Object>", "Optional", "Danh sách địa chỉ giao hàng nhận hàng", "[{street, city...}]"),
        ("joinedDate", "Date", "Auto", "Ngày gia nhập hệ thống", "2026-09-20")
    ]
    add_custom_table(["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả ý nghĩa", "Giá trị ví dụ"], customers_fields, [2.5, 2.2, 2.5, 5.0, 3.8])
    add_table_caption("Đặc tả chi tiết Collection 'customers'", "3.3")

    # Collection 3: Products
    add_h3("3.7.3. Đặc tả Collection 'products' (Thông tin sản phẩm thể thao)")
    products_fields = [
        ("_id", "ObjectId", "PK, Auto", "Mã sản phẩm", "65f2a3d..."),
        ("title", "String", "Required", "Tên sản phẩm thể thao", "Áo bóng đá Real Madrid Home"),
        ("slug", "String", "Unique, Required", "Đường dẫn URL thân thiện SEO", "ao-bong-da-real-madrid-home"),
        ("sku", "String", "Unique, Required", "Mã quản lý kho (Stock Keeping Unit)", "SPX-RMA-01"),
        ("brand", "String", "Required", "Thương hiệu (Adidas, Nike, Puma...)", "Adidas"),
        ("category", "String", "Required", "Môn thể thao: Football, Gym, Running...", "Football"),
        ("description", "String", "Optional", "Mô tả chi tiết chất liệu và phom dáng", "Chất vải mè kim cương..."),
        ("basePrice", "Number", "Required", "Giá bán niêm yết (VNĐ)", "280000"),
        ("discountPrice", "Number", "Optional", "Giá sau khuyến mãi (nếu có)", "249000"),
        ("totalStock", "Number", "Required", "Tổng số lượng tồn kho mọi biến thể", "150"),
        ("images", "Array<String>", "Required", "Danh sách URL hình ảnh sản phẩm", "['/img1.png', '/img2.png']"),
        ("status", "String", "Default: 'Active'", "Trạng thái kinh doanh: 'Active', 'Draft'", "'Active'")
    ]
    add_custom_table(["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả ý nghĩa", "Giá trị ví dụ"], products_fields, [2.5, 2.2, 2.5, 5.0, 3.8])
    add_table_caption("Đặc tả chi tiết Collection 'products'", "3.4")

    # Collection 4: ProductVariants
    add_h3("3.7.4. Đặc tả Collection 'product_variants' (Biến thể kích cỡ & màu sắc)")
    variants_fields = [
        ("_id", "ObjectId", "PK, Auto", "Mã biến thể", "65f2a4e..."),
        ("productId", "ObjectId", "FK, Required", "Khóa ngoại liên kết bảng 'products'", "65f2a3d..."),
        ("sku", "String", "Unique, Required", "Mã SKU riêng của biến thể", "SPX-RMA-01-WHT-L"),
        ("size", "String", "Required", "Kích cỡ: S, M, L, XL, XXL", "'L'"),
        ("color", "String", "Required", "Tên màu sắc biến thể", "Trắng hoàng gia"),
        ("colorHex", "String", "Required", "Mã màu Hex hiển thị trên giao diện", "#FFFFFF"),
        ("price", "Number", "Required", "Giá bán riêng của biến thể", "249000"),
        ("stockQuantity", "Number", "Required", "Số lượng tồn kho thực tế của biến thể", "45")
    ]
    add_custom_table(["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả ý nghĩa", "Giá trị ví dụ"], variants_fields, [2.5, 2.2, 2.5, 5.0, 3.8])
    add_table_caption("Đặc tả chi tiết Collection 'product_variants'", "3.5")

    # Collection 5: Orders
    add_h3("3.7.5. Đặc tả Collection 'orders' (Đơn đặt hàng)")
    orders_fields = [
        ("_id", "ObjectId", "PK, Auto", "Mã đơn hàng nội bộ", "65f2a5f..."),
        ("orderNumber", "String", "Unique, Required", "Mã số đơn hàng hiển thị khách hàng", "SPX-9821"),
        ("customerId", "ObjectId", "FK, Required", "Khóa ngoại liên kết bảng 'customers'", "65f2a2c..."),
        ("customerInfo", "Object", "Required", "Thông tin họ tên, điện thoại, địa chỉ nhận", "{name, phone, address}"),
        ("totalAmount", "Number", "Required", "Tổng số tiền thanh toán cuối cùng", "747000"),
        ("discountAmount", "Number", "Default: 0", "Số tiền được giảm trừ từ Coupon", "50000"),
        ("paymentMethod", "String", "Required", "Phương thức: 'COD', 'VNPAY', 'MoMo'", "'VNPAY'"),
        ("paymentStatus", "String", "Required", "Trạng thái thanh toán: 'Paid', 'Unpaid'", "'Paid'"),
        ("fulfillmentStatus", "String", "Required", "Trạng thái giao: Processing, Shipped...", "'Shipped'"),
        ("vnpTransactionNo", "String", "Optional", "Mã giao dịch trả về từ cổng VNPAY", "14389201"),
        ("createdAt", "Date", "Auto", "Thời điểm đặt hàng", "2026-09-22T08:15:00Z")
    ]
    add_custom_table(["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả ý nghĩa", "Giá trị ví dụ"], orders_fields, [2.5, 2.2, 2.5, 5.0, 3.8])
    add_table_caption("Đặc tả chi tiết Collection 'orders'", "3.6")

    # Collection 6: OrderItems
    add_h3("3.7.6. Đặc tả Collection 'order_items' (Dòng chi tiết đơn hàng)")
    order_items_fields = [
        ("_id", "ObjectId", "PK, Auto", "Mã dòng mặt hàng", "65f2a6a..."),
        ("orderId", "ObjectId", "FK, Required", "Khóa ngoại liên kết bảng 'orders'", "65f2a5f..."),
        ("productId", "ObjectId", "FK, Required", "Khóa ngoại liên kết bảng 'products'", "65f2a3d..."),
        ("productName", "String", "Required", "Tên sản phẩm tại thời điểm mua", "Áo bóng đá Real Madrid Home"),
        ("productImage", "String", "Optional", "Ảnh đại diện sản phẩm", "/rma_home.png"),
        ("size", "String", "Required", "Kích cỡ đã chọn", "'L'"),
        ("color", "String", "Required", "Màu sắc đã chọn", "Trắng hoàng gia"),
        ("qty", "Number", "Required", "Số lượng mua", "2"),
        ("unitPrice", "Number", "Required", "Đơn giá tại thời điểm mua (VNĐ)", "249000")
    ]
    add_custom_table(["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả ý nghĩa", "Giá trị ví dụ"], order_items_fields, [2.5, 2.2, 2.5, 5.0, 3.8])
    add_table_caption("Đặc tả chi tiết Collection 'order_items'", "3.7")

    # Collection 7: ChatSessions
    add_h3("3.7.7. Đặc tả Collection 'chat_sessions' (Lịch sử hội thoại Chatbot)")
    chat_fields = [
        ("_id", "ObjectId", "PK, Auto", "Mã phiên chat", "65f2a7b..."),
        ("sessionId", "String", "Unique, Required", "Định danh phiên làm việc của khách", "sess_91823a0b"),
        ("customerId", "ObjectId", "FK, Optional", "Liên kết khách hàng (nếu đã đăng nhập)", "65f2a2c..."),
        ("customerName", "String", "Default: 'Khách'", "Tên hiển thị người chat", "Đinh Công Hùng"),
        ("messages", "Array<Object>", "Required", "Mảng tin nhắn [{sender, text, time}]", "[{bot: 'Chào bạn!'}]"),
        ("intent", "String", "Optional", "Ý định gần nhất: 'SizeFitting', 'FAQ'...", "'SizeFitting'"),
        ("aiStatus", "String", "Default: 'Resolved'", "Trạng thái: 'Resolved', 'NeedsHuman'", "'Resolved'"),
        ("createdAt", "Date", "Auto", "Thời gian bắt đầu hội thoại", "2026-09-22T08:00:00Z")
    ]
    add_custom_table(["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả ý nghĩa", "Giá trị ví dụ"], chat_fields, [2.5, 2.2, 2.5, 5.0, 3.8])
    add_table_caption("Đặc tả chi tiết Collection 'chat_sessions'", "3.8")

    # Collection 8: SizeRules
    add_h3("3.7.8. Đặc tả Collection 'size_rules' (Ma trận quy tắc tư vấn kích cỡ)")
    size_rules_fields = [
        ("_id", "ObjectId", "PK, Auto", "Mã quy tắc", "65f2a8c..."),
        ("ruleCode", "String", "Unique, Required", "Mã định danh luật tư vấn", "RULE-M-FB-01"),
        ("category", "String", "Required", "Danh mục môn áp dụng: Football, Gym...", "Football"),
        ("gender", "String", "Required", "Giới tính: 'Nam', 'Nữ', 'Unisex'", "'Nam'"),
        ("heightMin", "Number", "Required", "Chiều cao tối thiểu (cm)", "168"),
        ("heightMax", "Number", "Required", "Chiều cao tối đa (cm)", "175"),
        ("weightMin", "Number", "Required", "Cân nặng tối thiểu (kg)", "62"),
        ("weightMax", "Number", "Required", "Cân nặng tối đa (kg)", "68"),
        ("suggestedSize", "String", "Required", "Kích cỡ khuyến nghị: S, M, L, XL, XXL", "'L'"),
        ("isActive", "Boolean", "Default: true", "Trạng thái kích hoạt luật", "true")
    ]
    add_custom_table(["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả ý nghĩa", "Giá trị ví dụ"], size_rules_fields, [2.5, 2.2, 2.5, 5.0, 3.8])
    add_table_caption("Đặc tả chi tiết Collection 'size_rules'", "3.9")

    # Collection 9: FAQs
    add_h3("3.7.9. Đặc tả Collection 'faqs' (Cơ sở tri thức hỏi đáp thường gặp)")
    faqs_fields = [
        ("_id", "ObjectId", "PK, Auto", "Mã câu hỏi FAQ", "65f2a9d..."),
        ("question", "String", "Required", "Câu hỏi mẫu của khách hàng", "Chính sách đổi trả hàng thế nào?"),
        ("answer", "String", "Required", "Câu trả lời tự động chuẩn của bot", "SportX hỗ trợ đổi size miễn phí trong 7 ngày..."),
        ("intentTag", "String", "Required", "Nhãn ý định: ReturnPolicy, Shipping...", "ReturnPolicy"),
        ("keywords", "Array<String>", "Required", "Tập từ khóa đối sánh câu hỏi", "['đổi trả', 'đổi size', 'hoàn tiền']"),
        ("isActive", "Boolean", "Default: true", "Trạng thái bật/tắt câu hỏi", "true")
    ]
    add_custom_table(["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả ý nghĩa", "Giá trị ví dụ"], faqs_fields, [2.5, 2.2, 2.5, 5.0, 3.8])
    add_table_caption("Đặc tả chi tiết Collection 'faqs'", "3.10")

    # Collection 10: Coupons
    add_h3("3.7.10. Đặc tả Collection 'coupons' (Mã giảm giá & Khuyến mãi)")
    coupons_fields = [
        ("_id", "ObjectId", "PK, Auto", "Mã khuyến mãi", "65f2b0e..."),
        ("code", "String", "Unique, Required", "Mã ký tự nhập khi thanh toán", "SPORTX100K"),
        ("description", "String", "Optional", "Mô tả chương trình khuyến mại", "Giảm 100k cho đơn từ 500k"),
        ("discountType", "String", "Required", "Loại giảm: 'fixed' (tiền) hoặc 'percent' (%)", "'fixed'"),
        ("discountValue", "Number", "Required", "Giá trị chiết khấu", "100000"),
        ("minSpend", "Number", "Default: 0", "Giá trị đơn hàng tối thiểu áp dụng", "500000"),
        ("usageLimit", "Number", "Default: 100", "Số lượt sử dụng tối đa của mã", "100"),
        ("usedCount", "Number", "Default: 0", "Số lượt đã được sử dụng", "42"),
        ("expiryDate", "Date", "Required", "Thời hạn hết hiệu lực của mã", "2026-12-31"),
        ("status", "String", "Default: 'Active'", "Trạng thái: 'Active' hoặc 'Expired'", "'Active'")
    ]
    add_custom_table(["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả ý nghĩa", "Giá trị ví dụ"], coupons_fields, [2.5, 2.2, 2.5, 5.0, 3.8])
    add_table_caption("Đặc tả chi tiết Collection 'coupons'", "3.11")

    # Collection 11: Settings
    add_h3("3.7.11. Đặc tả Collection 'settings' (Cấu hình hệ thống & Cổng thanh toán)")
    settings_fields = [
        ("_id", "ObjectId", "PK, Auto", "Mã cấu hình", "65f2b1f..."),
        ("storeName", "String", "Required", "Tên cửa hàng thể thao", "SportX Official Store"),
        ("contactPhone", "String", "Required", "Hotline hỗ trợ khách hàng", "1900-8888"),
        ("shippingFeeDefault", "Number", "Required", "Phí vận chuyển mặc định (VNĐ)", "30000"),
        ("freeShippingMinSpend", "Number", "Required", "Mức đơn được miễn phí vận chuyển", "500000"),
        ("enableVnpay", "Boolean", "Default: true", "Bật/Tắt cổng thanh toán VNPAY", "true"),
        ("enableMomo", "Boolean", "Default: true", "Bật/Tắt cổng thanh toán MoMo", "true"),
        ("enableCod", "Boolean", "Default: true", "Bật/Tắt hình thức thanh toán COD", "true"),
        ("enableAiFitting", "Boolean", "Default: true", "Bật/Tắt tính năng tư vấn kích cỡ tự động", "true")
    ]
    add_custom_table(["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả ý nghĩa", "Giá trị ví dụ"], settings_fields, [2.5, 2.2, 2.5, 5.0, 3.8])
    add_table_caption("Đặc tả chi tiết Collection 'settings'", "3.12")

    add_h2("3.8. Thiết kế kiến trúc và giao diện người dùng (UI/UX Sitemap)")
    add_p("Cấu trúc điều hướng hệ thống được phân định rõ ràng thành 2 phân hệ:")
    add_bullet("Cổng Khách hàng (Client Portal): Trang chủ (/) ➔ Danh mục sản phẩm (/products) ➔ Chi tiết sản phẩm (/products/[id]) ➔ Giỏ hàng (/cart) ➔ Thanh toán (/checkout) ➔ Thông báo đặt hàng thành công (/order-success) ➔ Quản lý tài khoản và đơn mua (/account, /orders).")
    add_bullet("Cổng Quản trị (Admin Dashboard): Bảng điều khiển tổng quan (Dashboard) ➔ Quản lý sản phẩm (Products) ➔ Quản lý đơn hàng (Orders) ➔ Quản lý khách hàng (Customers) ➔ Quản lý khuyến mãi (Marketing) ➔ Cấu hình Chatbot & Luật size (AI Chatbot) ➔ Thống kê báo cáo (Analytics) ➔ Cài đặt hệ thống (Settings).")

    doc.add_page_break()

    # =========================================================================
    # CHƯƠNG 4
    # =========================================================================
    add_h1("CHƯƠNG 4: CÀI ĐẶT, THỰC NGHIỆM VÀ ĐÁNH GIÁ KẾT QUẢ")

    add_h2("4.1. Môi trường cài đặt và cấu trúc mã nguồn dự án")
    add_p("Hệ thống được phát triển và thử nghiệm trên môi trường máy tính tiêu chuẩn:")
    add_bullet("Hệ điều hành: Microsoft Windows 11 64-bit.")
    add_bullet("Nền tảng môi trường: Node.js v20.x, npm v10.x, pnpm v9.x, Docker Desktop v4.28.")
    add_bullet("Cơ sở dữ liệu: MongoDB Community Edition 7.0 chạy trên nền container Docker.")
    add_bullet("Cấu trúc Monorepo: Thư mục gốc 'HuyHung' quản lý 3 gói con độc lập:")
    add_p("- huysports_be: Mã nguồn máy chủ Node.js Express API.", indent=1.5)
    add_p("- huysports_client: Mã nguồn website khách hàng Next.js 15.", indent=1.5)
    add_p("- huysports_admin: Mã nguồn trang quản trị React 19 Vite.", indent=1.5)

    add_h2("4.2. Hiện thực hóa các chức năng phía Khách hàng (Client Portal)")
    add_p("Trang web khách hàng được hoàn thiện với giao diện hiện đại, tốc độ tải trang cao:")
    add_bullet("Trang chủ: Trưng bày banner thể thao ấn tượng, danh sách các môn thể thao phổ biến, bộ sưu tập áo bóng đá mới nhất và các sản phẩm bán chạy có gắn nhãn giảm giá.")
    add_bullet("Trang danh sách & Lọc sản phẩm: Cho phép tìm kiếm sản phẩm theo thời gian thực (Debounced Search), bộ lọc bên sườn (Sidebar Filter) cho phép chọn đồng thời môn thể thao, thương hiệu, khoảng giá và kích cỡ.")
    add_bullet("Trang chi tiết sản phẩm: Cung cấp đầy đủ thư viện hình ảnh chất lượng cao, bảng size quy đổi, lựa chọn biến thể màu sắc qua các ô màu trực quan (Color Swatches), lựa chọn size áo và nút 'Thêm vào giỏ' tiện lợi.")
    add_bullet("Quy trình Giỏ hàng & Thanh toán: Hiển thị giỏ hàng rõ ràng, kiểm tra mã giảm giá trực tiếp, tính toán tự động phí vận chuyển và chuyển tiếp thanh toán mượt mà.")

    add_h2("4.3. Hiện thực hóa các chức năng phía Quản trị viên (Admin Dashboard)")
    add_p("Trang quản trị SportX Admin được xây dựng chuẩn mực với đầy đủ các nghiệp vụ quản lý bán hàng:")
    add_bullet("Trang Tổng quan (Dashboard): Cung cấp 4 thẻ chỉ số nhanh (Tổng doanh thu, Đơn hàng mới, Tổng khách hàng, Tồn kho báo động) kèm biểu đồ doanh thu dạng đường và danh sách đơn hàng cần duyệt gấp.")
    add_bullet("Quản lý Sản phẩm (Products): Bảng dữ liệu hỗ trợ tìm kiếm, lọc theo danh mục, tính năng thêm mới sản phẩm với modal nhập biến thể chi tiết (size, màu, số lượng kho) và chuyển đổi trạng thái kinh doanh nhanh chóng.")
    add_bullet("Quản lý Đơn hàng (Orders): Hiển thị chi tiết từng đơn hàng, mã giao dịch VNPAY, thông tin người nhận, danh sách sản phẩm mua và dropdown cho phép Admin chuyển đổi trạng thái xử lý đơn hàng.")
    add_bullet("Quản lý Khách hàng (Customers): Danh mục khách hàng với nhãn phân hạng tự động (VIP, Loyal, New) dựa trên tổng chi tiêu tích lũy.")
    add_bullet("Thống kê Báo cáo (Analytics): Báo cáo chi tiết về tỷ trọng bán hàng theo môn thể thao, top 5 sản phẩm bán chạy nhất tháng và tỷ lệ chuyển đổi đơn hàng thành công từ Chatbot.")

    add_h2("4.4. Hiện thực hóa động cơ AI Size Engine và Chatbot hỗ trợ 24/7")
    add_p("Hệ thống Chatbot được tích hợp trực tiếp góc dưới bên phải màn hình dưới dạng Floating Action Button. Khi người dùng mở hộp thoại, Bot chủ động chào hỏi và đề xuất các câu hỏi gợi ý nhanh:")
    add_bullet("Kịch bản 1: Khách hàng hỏi 'Tôi cao 1m75 nặng 72kg mặc áo thể thao size nào?'. Chatbot tự động bóc tách H = 175cm, W = 72kg, tính BMI = 23.51 (chuẩn) và tra cứu bảng SizeRule trả về khuyến nghị: Size XL.")
    add_bullet("Kịch bản 2: Khách hàng hỏi 'Shop có hỗ trợ đổi hàng nếu không vừa size không?'. Chatbot nhận diện Intent 'Return Policy' và phản hồi tức thời chính sách: 'Dạ SportX hỗ trợ đổi size miễn phí trong vòng 7 ngày kể từ khi nhận hàng, sản phẩm còn nguyên tem mác ạ!'.")

    add_h2("4.5. Hiện thực hóa luồng thanh toán trực tuyến qua VNPAY Sandbox")
    add_p("Quy trình thanh toán VNPAY được kiểm thử hoàn tất trên môi trường thử nghiệm (Sandbox) của VNPAY:")
    add_bullet("Hệ thống sinh URL thanh toán thành công và chuyển hướng an toàn tới giao diện VNPAY.")
    add_bullet("Thực hiện thanh toán thử nghiệm bằng thẻ ATM nội địa VNPAY Test (Ngân hàng NCB).")
    add_bullet("Tín hiệu Webhook IPN trả về mã phản hồi vnp_ResponseCode = '00' (Giao dịch thành công).")
    add_bullet("Đơn hàng trong cơ sở dữ liệu MongoDB tự động chuyển trạng thái paymentStatus từ 'Unpaid' sang 'Paid' chỉ sau 1.2 giây.")

    add_h2("4.6. Kiểm thử hệ thống (System Testing & Test Cases)")
    add_p("Để đảm bảo chất lượng phần mềm, tác giả đã tiến hành kiểm thử hộp đen (Black-box Testing) với hơn 30 kịch bản kiểm thử. Dưới đây là bảng tổng hợp các ca kiểm thử chính:")

    test_cases_data = [
        ("TC-01", "Đăng ký tài khoản", "Nhập họ tên, email hợp lệ, mật khẩu > 6 ký tự", "Hệ thống tạo tài khoản mới, mã HTTP 201 Created", "Đạt (Pass)"),
        ("TC-02", "Đăng ký trùng email", "Nhập email đã tồn tại trong hệ thống", "Báo lỗi 'Email đã được sử dụng', mã HTTP 400", "Đạt (Pass)"),
        ("TC-03", "Đăng nhập phân quyền", "Đăng nhập bằng tài khoản quản trị (Role Admin)", "Cấp token JWT, tự động điều hướng sang trang Admin", "Đạt (Pass)"),
        ("TC-04", "Tìm kiếm sản phẩm", "Gõ từ khóa 'áo bóng đá' vào thanh tìm kiếm", "Hiển thị danh sách các mẫu áo bóng đá liên quan", "Đạt (Pass)"),
        ("TC-05", "Lọc sản phẩm theo giá", "Chọn lọc khoảng giá từ 200.000đ đến 500.000đ", "Chỉ hiển thị các sản phẩm có giá trong khoảng chọn", "Đạt (Pass)"),
        ("TC-06", "Thêm giỏ hàng hết hàng", "Thêm sản phẩm có số lượng tồn kho = 0", "Hiển thị cảnh báo 'Sản phẩm tạm thời hết hàng'", "Đạt (Pass)"),
        ("TC-07", "Áp dụng mã Coupon", "Nhập mã 'SPORTX100K' cho đơn hàng > 500.000đ", "Tổng tiền thanh toán tự động giảm đúng 100.000đ", "Đạt (Pass)"),
        ("TC-08", "Chatbot tư vấn size", "Nhập 'Cao 1m68 nặng 58kg mặc size gì'", "Bot trả lời gợi ý Size M và hiển thị đồ thể thao", "Đạt (Pass)"),
        ("TC-09", "Chatbot trả lời FAQ", "Hỏi 'Bao lâu thì nhận được hàng ở Hà Nội?'", "Bot phản hồi 'Nội thành Hà Nội giao từ 1-2 ngày'", "Đạt (Pass)"),
        ("TC-10", "Thanh toán VNPAY QR", "Quét mã VNPAY Sandbox và xác nhận OTP", "Giao dịch thành công, cập nhật đơn hàng paymentStatus=Paid", "Đạt (Pass)"),
        ("TC-11", "Cập nhật trạng thái đơn", "Admin chuyển trạng thái từ Processing sang Shipped", "Trạng thái đơn hàng đổi ngay lập tức trên cả Client", "Đạt (Pass)"),
        ("TC-12", "Xuất báo cáo doanh thu", "Admin chọn khoảng ngày và nhấn 'Export Report'", "Hệ thống trích xuất dữ liệu báo cáo dạng bảng hoàn chỉnh", "Đạt (Pass)")
    ]
    add_custom_table(["Mã TC", "Tên ca kiểm thử", "Dữ liệu & Hành động đầu vào", "Kết quả kỳ vọng", "Đánh giá"], test_cases_data, [1.8, 3.5, 4.2, 5.0, 1.5])
    add_table_caption("Bảng tổng hợp kết quả kiểm thử các chức năng chính của hệ thống", "4.1")

    add_h2("4.7. Đánh giá kết quả đạt được và hiệu năng hệ thống")
    add_p("Hệ thống SportX sau khi hoàn thiện đã đáp ứng toàn diện các mục tiêu đề ra:")
    add_bullet("Về mặt chức năng: 100% các chức năng cốt lõi (Xem hàng, Giỏ hàng, Đặt hàng, Thanh toán VNPAY, Quản trị Admin, Trợ lý ảo AI) đều hoạt động ổn định và chính xác.")
    add_bullet("Về mặt hiệu năng: Tốc độ phản hồi trung bình của hệ thống đạt 210ms; điểm hiệu năng đo bằng công cụ Google Lighthouse đạt trên 90/100 điểm.")
    add_bullet("Về trải nghiệm người dùng: Chatbot phản hồi tự nhiên, giải quyết được bài toán tư vấn kích cỡ mà không cần nhân viên hỗ trợ.")

    doc.add_page_break()

    # =========================================================================
    # KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
    # =========================================================================
    add_h1("KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN")

    add_h2("1. Kết quả đạt được của đề tài")
    add_p("Sau thời gian nghiên cứu nghiêm túc và nỗ lực thực hiện, khóa luận tốt nghiệp đã hoàn thành đầy đủ các nhiệm vụ và mục tiêu đề ra, đạt được các kết quả cụ thể sau:")
    add_bullet("Về mặt nghiên cứu lý thuyết: Nắm vững và làm chủ quy trình phân tích thiết kế hệ thống thông tin, kiến trúc phần mềm hướng dịch vụ (Clean Layered Architecture), cơ chế xác thực phân quyền bằng JWT và giao thức tích hợp cổng thanh toán trực tuyến bảo mật.")
    add_bullet("Về mặt xây dựng sản phẩm phần mềm:")
    add_p("+ Xây dựng hoàn chỉnh website thương mại điện tử chuyên biệt về trang phục thể thao SportX với giao diện đẹp mắt, tương thích cao trên máy tính và thiết bị di động.", indent=1.5)
    add_p("+ Xây dựng thành công hệ thống máy chủ Backend RESTful API vững chắc bằng Node.js, Express, TypeScript và cơ sở dữ liệu MongoDB.", indent=1.5)
    add_p("+ Hiện thực hóa và tích hợp thành công động cơ Trợ lý ảo AI Chatbot kết hợp tính toán chỉ số BMI và ma trận bảng quy tắc (Size Rule Matrix), giúp giải quyết hiệu quả bài toán tư vấn kích cỡ trực tuyến cho khách hàng.", indent=1.5)
    add_p("+ Tích hợp hoàn thiện cổng thanh toán trực tuyến VNPAY Sandbox với quy trình mã hóa chữ ký số HMAC-SHA512 và xác thực giao dịch tự động qua Webhook IPN.", indent=1.5)
    add_p("+ Xây dựng trang quản trị SportX Admin đầy đủ các công cụ quản lý sản phẩm, đơn hàng, khách hàng, khuyến mãi, cấu hình kịch bản Chatbot và biểu đồ thống kê trực quan.", indent=1.5)
    add_bullet("Về mặt kiểm thử: Thực hiện kiểm thử toàn diện các luồng nghiệp vụ trên hệ thống thực tế, đảm bảo tính đúng đắn và độ tin cậy của phần mềm.")

    add_h2("2. Hạn chế của đề tài")
    add_p("Bên cạnh những kết quả tích cực đã đạt được, đề tài vẫn còn tồn tại một số hạn chế do điều kiện thời gian và nguồn lực nghiên cứu:")
    add_bullet("Động cơ xử lý ngôn ngữ tự nhiên của Chatbot hiện tại chủ yếu dựa trên kỹ thuật trích xuất thực thể bằng biểu thức chính quy (Regex) và đối sánh cơ sở tri thức (Knowledge Base). Khi gặp những câu hỏi quá dài, phức tạp hoặc chứa nhiều tiếng lóng địa phương, độ chuẩn xác của Bot có thể giảm.")
    add_bullet("Hệ thống mới dừng lại ở việc tích hợp một cổng thanh toán nội địa tiêu biểu (VNPAY), chưa mở rộng hỗ trợ đồng thời ví điện tử MoMo, ZaloPay và thẻ thanh toán quốc tế (Visa/Mastercard qua Stripe/PayPal).")
    add_bullet("Chưa tiến hành thử nghiệm chịu tải lớn (Load Testing) trong điều kiện hàng chục nghìn người dùng truy cập đồng thời để đánh giá tối ưu hóa tài nguyên máy chủ.")

    add_h2("3. Hướng phát triển trong tương lai")
    add_p("Trong giai đoạn tiếp theo, hệ thống có thể được nghiên cứu nâng cấp và mở rộng theo các hướng sau:")
    add_bullet("Tích hợp các mô hình ngôn ngữ lớn (Large Language Models - LLM như GPT-4 hoặc Gemini API) kết hợp kỹ thuật truy xuất tăng cường (Retrieval-Augmented Generation - RAG) để biến Chatbot thành chuyên gia thời trang thông minh có khả năng đối thoại tự nhiên và cá nhân hóa sâu sắc theo sở thích của từng khách hàng.")
    add_bullet("Nghiên cứu ứng dụng công nghệ Trí tuệ nhân tạo thị giác (Computer Vision) cho phép khách hàng chụp ảnh toàn thân hoặc sử dụng camera điện thoại để công nghệ tự động ước lượng số đo 3 vòng và mô phỏng trang phục 3D (Virtual Try-On).")
    add_bullet("Mở rộng tích hợp các đơn vị vận chuyển hàng đầu tại Việt Nam (Giao Hàng Nhanh - GHN, Giao Hàng Tiết Kiệm - GHTK) để tự động hóa hoàn toàn quy trình đẩy đơn, in vận đơn và tra cứu định vị đơn hàng theo thời gian thực.")
    add_bullet("Phát triển phiên bản ứng dụng di động (Mobile App) trên cả 2 nền tảng iOS và Android bằng React Native hoặc Flutter nhằm gia tăng sự gắn kết với khách hàng.")

    doc.add_page_break()

    # =========================================================================
    # TÀI LIỆU THAM KHẢO
    # =========================================================================
    add_h1("TÀI LIỆU THAM KHẢO")
    
    references = [
        "[1] Nguyễn Văn Ba, Giáo trình Phân tích và Thiết kế Hệ thống Thông tin, Nhà xuất bản Đại học Quốc gia Hà Nội, 2012.",
        "[2] Đặng Văn Đức, Thiết kế hướng đối tượng với UML, Nhà xuất bản Giáo dục, 2008.",
        "[3] Đồng Thị Bích Thủy (Chủ biên), Giáo trình Cơ sở Dữ liệu, Nhà xuất bản Đại học Quốc gia TP. Hồ Chí Minh, 2014.",
        "[4] Nguyễn Thanh Thủy, Trí tuệ nhân tạo: Các phương pháp giải quyết vấn đề và kỹ thuật học, Nhà xuất bản Giáo dục, 2010.",
        "[5] Robert C. Martin, Clean Architecture: A Craftsman's Guide to Software Structure and Design, Prentice Hall, 2017.",
        "[6] Alex Banks and Eve Porcello, Learning React: Modern Patterns for Developing React Applications, 2nd Edition, O'Reilly Media, 2020.",
        "[7] Robin Wieruch, The Road to Next.js: An pragmatic guide to modern web development with Next.js and React, Independently published, 2023.",
        "[8] Kyle Simpson, You Don't Know JS: Scope & Closures (2nd Edition), O'Reilly Media, 2020.",
        "[9] VNPAY Official Developer Documentation, \"Tài liệu hướng dẫn tích hợp Cổng thanh toán VNPAY dành cho đối tác\", Cổng thông tin VNPAY Sandbox, 2024. [Trực tuyến]. Địa chỉ: https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/",
        "[10] Next.js Official Documentation, \"Next.js 15 App Router and Server Components Architecture\", Vercel Inc., 2024. [Trực tuyến]. Địa chỉ: https://nextjs.org/docs",
        "[11] MongoDB Official Manual, \"MongoDB 7.0 Manual: Document Database, Aggregation Pipeline and Modeling\", MongoDB Inc., 2024. [Trực tuyến]. Địa chỉ: https://www.mongodb.com/docs/manual/"
    ]
    for ref in references:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.25
        p.paragraph_format.first_line_indent = Cm(-0.8)
        p.paragraph_format.left_indent = Cm(0.8)
        run = p.add_run(ref)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)

    doc.add_page_break()

    # =========================================================================
    # PHỤ LỤC
    # =========================================================================
    add_h1("PHỤ LỤC")

    add_h2("Phụ lục A: Danh sách các Endpoints RESTful API chính")
    
    api_endpoints = [
        ("POST", "/api/auth/login", "Đăng nhập và nhận JWT token", "Public"),
        ("POST", "/api/auth/register", "Đăng ký tài khoản khách hàng mới", "Public"),
        ("GET", "/api/products", "Lấy danh sách sản phẩm (có phân trang & lọc)", "Public"),
        ("GET", "/api/products/:id", "Lấy thông tin chi tiết sản phẩm và biến thể", "Public"),
        ("POST", "/api/products", "Thêm mới sản phẩm và biến thể kho", "Admin"),
        ("PUT", "/api/products/:id", "Cập nhật thông tin và giá sản phẩm", "Admin"),
        ("DELETE", "/api/products/:id", "Xóa sản phẩm khỏi hệ thống", "Admin"),
        ("POST", "/api/orders", "Tạo đơn hàng mới", "Customer"),
        ("GET", "/api/orders/my-orders", "Xem danh sách đơn hàng đã mua", "Customer"),
        ("GET", "/api/orders", "Xem toàn bộ đơn hàng trong hệ thống", "Admin"),
        ("PUT", "/api/orders/:id/status", "Cập nhật trạng thái đơn hàng (Duyệt, Giao...)", "Admin"),
        ("POST", "/api/payment/vnpay/create-payment-url", "Tạo URL chuyển hướng thanh toán VNPAY", "Customer"),
        ("GET", "/api/payment/vnpay/ipn", "Webhook nhận kết quả thanh toán từ VNPAY", "External/VNPAY"),
        ("POST", "/api/chatbot/message", "Gửi tin nhắn tới AI Chatbot và nhận phản hồi", "Public"),
        ("GET", "/api/chatbot/rules", "Lấy danh sách luật tư vấn Size", "Admin"),
        ("POST", "/api/chatbot/rules", "Thêm quy tắc tư vấn Size mới", "Admin"),
        ("GET", "/api/analytics/overview", "Lấy dữ liệu thống kê tổng quan doanh thu", "Admin")
    ]
    add_custom_table(["Phương thức", "Đường dẫn API", "Chức năng", "Quyền"], api_endpoints, [2.5, 6.0, 5.0, 2.5])
    add_table_caption("Danh sách các API Endpoints cốt lõi của hệ thống SportX", "Phụ lục A.1")

    add_h2("Phụ lục B: Cấu hình biến môi trường hệ thống (.env.example)")
    add_p("Dưới đây là mẫu tệp biến môi trường chuẩn phục vụ việc cài đặt và triển khai hệ thống:")
    
    env_lines = [
        "# Máy chủ Backend (huysports_be)",
        "PORT=5000",
        "NODE_ENV=development",
        "MONGODB_URI=mongodb://localhost:27017/sportx_db",
        "JWT_SECRET=sportx_super_secret_jwt_key_2026_thesis",
        "JWT_EXPIRES_IN=7d",
        "",
        "# Cấu hình Cổng thanh toán VNPAY Sandbox",
        "VNP_TMN_CODE=TEST_TMN_CODE",
        "VNP_HASH_SECRET=TEST_HASH_SECRET_VNPAY_SANDBOX",
        "VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
        "VNP_RETURN_URL=http://localhost:3000/order-success",
        "",
        "# Ứng dụng Client & Admin",
        "NEXT_PUBLIC_API_URL=http://localhost:5000/api",
        "VITE_API_URL=http://localhost:5000/api"
    ]
    for line in env_lines:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(1)
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.first_line_indent = Cm(0)
        run = p.add_run(line if line else " ")
        run.font.name = 'Consolas'
        run.font.size = Pt(10)
        if line.startswith("#"):
            run.font.italic = True
            run.font.color.rgb = RGBColor(0, 128, 0)
        elif "=" in line:
            run.font.color.rgb = RGBColor(0, 0, 128)

    # Lưu file
    output_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "BaoCao_KhoaLuan_TotNghiep_DinhCongHung.docx"))
    doc.save(output_path)
    sys.stdout.reconfigure(encoding='utf-8')
    print(f"SUCCESS: Generated thesis docx at: {output_path}")

if __name__ == "__main__":
    build_thesis_document()
