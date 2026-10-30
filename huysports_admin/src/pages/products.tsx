import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "@/layouts/admin-layout";
import { useToastStore } from "@/store/useToastStore";
import { useDebounce, useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Layers,
  Sparkles,
  Package,
  Boxes,
  Download,
  FileSpreadsheet,
  Upload,
  Image as ImageIcon,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { exportToCSV, exportToExcel, ReportSection } from "@/utils/exportUtils";
import { HeroSelect } from "@/components/ui/HeroSelect";
import { HeroDropdown } from "@/components/ui/HeroDropdown";
import { TableSkeletonRows } from "@/components/ui/LoadingSkeletons";
import { uploadService } from "@/services/api";

interface VariantItem {
  id: string;
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  title: string;
  sku: string;
  category: "Football" | "Running" | "Gym" | "Badminton";
  brand: string;
  basePrice: number;
  discountPrice?: number;
  thumbnail: string;
  images?: string[];
  icon: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  totalStock: number;
  status: "Active" | "Draft";
  variants: VariantItem[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

const PRESET_SPORTS_IMAGES: Record<string, { label: string; url: string }[]> = {
  Football: [
    { label: "Giày Mercurial Elite", url: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800" },
    { label: "Quả bóng thi đấu", url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800" },
    { label: "Áo đấu sân nhà", url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800" },
    { label: "Giày cỏ nhân tạo TF", url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800" },
  ],
  Running: [
    { label: "Giày chạy bộ Pro", url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800" },
    { label: "Bộ quần áo thể thao", url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800" },
    { label: "Bình nước & Phụ kiện", url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800" },
    { label: "Giày Marathon", url: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800" },
  ],
  Gym: [
    { label: "Bộ tạ tay cao cấp", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800" },
    { label: "Áo thun tập gym", url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800" },
    { label: "Găng tay & Đai tạ", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800" },
    { label: "Dây nhảy thể lực", url: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800" },
  ],
  Badminton: [
    { label: "Vợt Nanoflare Pro", url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800" },
    { label: "Hộp quả cầu lông", url: "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=800" },
    { label: "Giày cầu lông bám sàn", url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800" },
    { label: "Túi đựng vợt cao cấp", url: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800" },
  ],
};

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL"];
const AVAILABLE_COLORS = [
  { name: "Đen", hex: "#0F172A" },
  { name: "Xanh Navy", hex: "#1E3A8A" },
  { name: "Đỏ", hex: "#DC2626" },
  { name: "Trắng", hex: "#E2E8F0" },
  { name: "Xanh Rêu", hex: "#4D7C0F" },
  { name: "Xanh Dương", hex: "#2563EB" },
];

// Helper to format currency nicely (VND)
const formatCurrency = (val: number) => {
  if (!val || val <= 0) return "0đ";
  let num = val;
  if (num < 1000) num = num * 1000;
  return `${Math.round(num).toLocaleString("vi-VN")}đ`;
};

const removeVietnameseTones = (str: string) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
};

export default function ProductsPage() {
  const toast = useToastStore();
  const [searchParams] = useSearchParams();

  const urlSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(urlSearch);

  useEffect(() => {
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, [urlSearch]);

  const debouncedSearch = useDebounce(searchTerm, 250);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  // React Query Custom Hooks
  const { data: products = [], isLoading } = useProducts({
    category: categoryFilter !== "all" ? categoryFilter : undefined,
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  // Drawer state (Add or Edit)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State inside Drawer
  const [formName, setFormName] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState<"Football" | "Running" | "Gym" | "Badminton">("Football");
  const [formBrand, setFormBrand] = useState("");
  const [formBasePrice, setFormBasePrice] = useState<number>(250000);
  const [formDiscountPrice, setFormDiscountPrice] = useState<number>(0);
  const [formThumbnail, setFormThumbnail] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [customThumbnailInput, setCustomThumbnailInput] = useState("");
  const [formSelectedSizes, setFormSelectedSizes] = useState<string[]>(["M", "L"]);
  const [formSelectedColors, setFormSelectedColors] = useState<{ name: string; hex: string }[]>([
    AVAILABLE_COLORS[0],
    AVAILABLE_COLORS[2],
  ]);
  const [matrixVariants, setMatrixVariants] = useState<VariantItem[]>([]);

  // Form field-level validation errors: "thiếu chỗ nào báo chỗ nấy"
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleGenerateSku = () => {
    const prefixMap: Record<string, string> = {
      Football: "SPX-FB",
      Running: "SPX-RN",
      Gym: "SPX-GYM",
      Badminton: "SPX-BD",
    };
    const prefix = prefixMap[formCategory] || "SPX-PRO";
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newSku = `${prefix}-${randomSuffix}`;
    setFormSku(newSku);
    clearError("sku");
    setMatrixVariants((prev) =>
      generateMatrix(formSelectedSizes, formSelectedColors, newSku, formBasePrice, prev)
    );
    toast.info("Đã tạo mã SKU mới", `Mã SKU: ${newSku}`);
  };

  // Regenerate matrix variants when sizes, colors or base price changes
  const generateMatrix = (
    sizes: string[],
    colors: { name: string; hex: string }[],
    baseSku: string,
    defaultPrice: number,
    existingVariants: VariantItem[] = []
  ) => {
    const list: VariantItem[] = [];
    colors.forEach((color) => {
      sizes.forEach((size) => {
        const generatedSku = `${baseSku || "SPX-NEW"}-${color.name.slice(0, 3).toUpperCase()}-${size}`;
        const existing = existingVariants.find((v) => v.color === color.name && v.size === size);
        list.push({
          id: existing ? existing.id : `var-${color.name}-${size}-${Date.now()}`,
          sku: existing ? existing.sku : generatedSku,
          color: color.name,
          colorHex: color.hex,
          size,
          price: existing ? existing.price : defaultPrice,
          stock: existing ? existing.stock : 25,
        });
      });
    });
    return list;
  };

  const handleOpenAddDrawer = () => {
    setEditingProductId(null);
    setFormName("");
    const generatedInitialSku = `SPX-FB-${Math.floor(100 + Math.random() * 900)}`;
    setFormSku(generatedInitialSku);
    setFormDescription("");
    setFormCategory("Football");
    setFormBrand("SportX Pro");
    setFormBasePrice(250000);
    setFormDiscountPrice(0);
    setFormThumbnail("");
    setFormImages([]);
    setCustomUrlInput("");
    setCustomThumbnailInput("");
    setFormErrors({});
    const initialSizes = ["M", "L"];
    const initialColors = [AVAILABLE_COLORS[0], AVAILABLE_COLORS[2]];
    setFormSelectedSizes(initialSizes);
    setFormSelectedColors(initialColors);
    setMatrixVariants(generateMatrix(initialSizes, initialColors, generatedInitialSku, 250000));
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (product: Product) => {
    setEditingProductId(product.id);
    setFormName(product.title);
    setFormSku(product.sku || `SPX-PRO-${Math.floor(100 + Math.random() * 900)}`);
    setFormDescription(product.description || "");
    setFormCategory(product.category);
    setFormBrand(product.brand);
    setFormBasePrice(product.basePrice);
    setFormDiscountPrice(product.discountPrice || 0);
    setFormSelectedSizes(product.sizes);
    setFormSelectedColors(product.colors);
    const effectivePrice = product.discountPrice || product.basePrice || 250000;
    const initialVariants = (product.variants || []).map((v) => ({
      ...v,
      price: v.price && v.price !== 250000 ? v.price : effectivePrice,
    }));
    setMatrixVariants(initialVariants);
    setFormErrors({});
    const initialThumb = product.thumbnail || "";
    setFormThumbnail(initialThumb);
    const initialImages =
      product.images && product.images.length > 0
        ? product.images
        : initialThumb &&
          (initialThumb.startsWith("http") ||
            initialThumb.startsWith("/") ||
            initialThumb.startsWith("data:"))
        ? [initialThumb]
        : [];
    setFormImages(initialImages);
    setCustomUrlInput("");
    setCustomThumbnailInput("");
    setIsDrawerOpen(true);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.warning("Cảnh báo", "Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP)");
      return;
    }

    setIsUploadingThumbnail(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      try {
        const res = await uploadService.uploadImage({
          image: base64,
          filename: `thumb-${file.name}`,
          type: "thumbnail",
        });
        const finalUrl = res?.url || base64;
        setFormThumbnail(finalUrl);
        setFormImages((prev) => (prev.includes(finalUrl) ? prev : [finalUrl, ...prev]));
        clearError("images");
        toast.success("Thành công", "Đã lưu ảnh Thumbnail vào thư mục images/thumbnails");
      } catch {
        setFormThumbnail(base64);
        setFormImages((prev) => (prev.includes(base64) ? prev : [base64, ...prev]));
        clearError("images");
        toast.success("Đã chọn ảnh", "Đã cập nhật ảnh Thumbnail");
      }
    } catch (err: any) {
      toast.error("Lỗi", err.message || "Không thể tải ảnh Thumbnail");
    } finally {
      setIsUploadingThumbnail(false);
      e.target.value = "";
    }
  };

  const handleProductImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          toast.warning("Cảnh báo", `File ${file.name} không phải là file ảnh hợp lệ`);
          continue;
        }

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        try {
          const res = await uploadService.uploadImage({
            image: base64,
            filename: `prod-${file.name}`,
            type: "product",
          });
          newUrls.push(res?.url || base64);
        } catch {
          newUrls.push(base64);
        }
      }

      if (newUrls.length > 0) {
        setFormImages((prev) => Array.from(new Set([...prev, ...newUrls])));
        if (!formThumbnail) {
          setFormThumbnail(newUrls[0]);
        }
        clearError("images");
        toast.success("Thành công", `Đã lưu ${newUrls.length} ảnh vào thư mục images/products`);
      }
    } catch (err: any) {
      toast.error("Lỗi", err.message || "Không thể tải ảnh sản phẩm");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleAddCustomThumbnailUrl = () => {
    const url = customThumbnailInput.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("data:") && !url.startsWith("/")) {
      toast.warning("Thông báo", "Vui lòng nhập đường link URL ảnh hợp lệ (http://... hoặc https://...)");
      return;
    }
    setFormThumbnail(url);
    setFormImages((prev) => (prev.includes(url) ? prev : [url, ...prev]));
    clearError("images");
    setCustomThumbnailInput("");
    toast.success("Thành công", "Đã cập nhật liên kết ảnh Thumbnail");
  };

  const handleAddCustomProductUrl = () => {
    const url = customUrlInput.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("data:") && !url.startsWith("/")) {
      toast.warning("Thông báo", "Vui lòng nhập đường link URL ảnh hợp lệ (http://... hoặc https://...)");
      return;
    }
    setFormImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
    if (!formThumbnail) {
      setFormThumbnail(url);
    }
    clearError("images");
    setCustomUrlInput("");
    toast.success("Thành công", "Đã thêm ảnh chi tiết từ liên kết");
  };

  const handleSelectPreset = (url: string) => {
    setFormImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
    if (!formThumbnail) {
      setFormThumbnail(url);
    }
    clearError("images");
    toast.success("Đã chọn ảnh", "Đã thêm ảnh mẫu vào bộ sưu tập sản phẩm");
  };

  const handleSetThumbnail = (url: string) => {
    setFormThumbnail(url);
    setFormImages((prev) => [url, ...prev.filter((u) => u !== url)]);
    clearError("images");
    toast.info("Đã chọn ảnh chính", "Ảnh này sẽ được dùng làm Thumbnail hiển thị chính");
  };

  const handleRemoveImage = (url: string) => {
    const remaining = formImages.filter((u) => u !== url);
    setFormImages(remaining);
    if (formThumbnail === url) {
      setFormThumbnail(remaining[0] || "");
    }
  };

  const handleClearThumbnail = () => {
    setFormThumbnail("");
    toast.info("Đã xóa thumbnail", "Bạn có thể chọn ảnh khác làm ảnh đại diện");
  };

  const handleToggleColor = (color: { name: string; hex: string }) => {
    let updated: { name: string; hex: string }[];
    if (formSelectedColors.some((c) => c.name === color.name)) {
      if (formSelectedColors.length <= 1) {
        toast.warning("Thông báo", "Sản phẩm cần có ít nhất 1 màu");
        return;
      }
      updated = formSelectedColors.filter((c) => c.name !== color.name);
    } else {
      updated = [...formSelectedColors, color];
    }
    setFormSelectedColors(updated);
    clearError("colors");
    const baseSku = formSku || (editingProductId
      ? products.find((p: Product) => p.id === editingProductId)?.sku || "SPX-ITEM"
      : "SPX-NEW");
    setMatrixVariants((prev) =>
      generateMatrix(formSelectedSizes, updated, baseSku, formBasePrice, prev)
    );
  };

  const handleToggleSize = (size: string) => {
    let updated: string[];
    if (formSelectedSizes.includes(size)) {
      if (formSelectedSizes.length <= 1) {
        toast.warning("Thông báo", "Sản phẩm cần có ít nhất 1 size");
        return;
      }
      updated = formSelectedSizes.filter((s) => s !== size);
    } else {
      updated = [...formSelectedSizes, size];
    }
    setFormSelectedSizes(updated);
    clearError("sizes");
    const baseSku = formSku || (editingProductId
      ? products.find((p: Product) => p.id === editingProductId)?.sku || "SPX-ITEM"
      : "SPX-NEW");
    setMatrixVariants((prev) =>
      generateMatrix(updated, formSelectedColors, baseSku, formBasePrice, prev)
    );
  };

  const handleUpdateMatrixCell = (id: string, field: "sku" | "price" | "stock", value: any) => {
    setMatrixVariants((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    clearError("variants");
  };

  const validateProductForm = () => {
    const errors: Record<string, string> = {};

    if (!formName.trim()) {
      errors.name = "Vui lòng nhập tên sản phẩm thể thao (bắt buộc)";
    } else if (formName.trim().length < 3) {
      errors.name = "Tên sản phẩm quá ngắn, vui lòng nhập tối thiểu 3 ký tự";
    }

    if (!formSku.trim()) {
      errors.sku = "Vui lòng nhập mã SKU cho sản phẩm (bắt buộc, VD: SPX-FB-01)";
    } else if (!/^[A-Za-z0-9_-]+$/.test(formSku.trim())) {
      errors.sku = "Mã SKU chỉ được chứa ký tự chữ, số, dấu gạch nối (-) hoặc gạch dưới (_)";
    }

    if (!formCategory) {
      errors.category = "Vui lòng chọn môn thể thao cho sản phẩm";
    }

    if (formBasePrice === undefined || formBasePrice === null || isNaN(formBasePrice) || Number(formBasePrice) <= 0) {
      errors.basePrice = "Giá niêm yết gốc phải là số dương lớn hơn 0đ";
    }

    if (formDiscountPrice && Number(formDiscountPrice) > 0) {
      if (Number(formDiscountPrice) >= Number(formBasePrice)) {
        errors.discountPrice = "Giá khuyến mãi phải nhỏ hơn giá niêm yết gốc";
      }
    }

    const hasThumbnail = Boolean(formThumbnail && formThumbnail.trim());
    const hasImages = formImages && formImages.length > 0;
    if (!hasThumbnail && !hasImages) {
      errors.images = "Vui lòng tải lên hoặc chọn ít nhất 1 ảnh đại diện (Thumbnail) hoặc ảnh sản phẩm";
    }

    if (!formSelectedSizes || formSelectedSizes.length === 0) {
      errors.sizes = "Vui lòng chọn ít nhất một kích cỡ (Size) sản phẩm";
    }

    if (!formSelectedColors || formSelectedColors.length === 0) {
      errors.colors = "Vui lòng chọn ít nhất một màu sắc sản phẩm";
    }

    if (!matrixVariants || matrixVariants.length === 0) {
      errors.variants = "Cần có ít nhất 1 biến thể SKU hợp lệ trong ma trận";
    }

    return errors;
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateProductForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error(
        "Thiếu thông tin bắt buộc",
        `Vui lòng kiểm tra lại biểu mẫu: có ${Object.keys(errors).length} trường cần bổ sung.`
      );
      // Auto-scroll to the first invalid field
      const firstErrorField = Object.keys(errors)[0];
      const targetElement = document.getElementById(`field-${firstErrorField}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        const inputElem = targetElement.querySelector("input, select, textarea") as HTMLElement;
        inputElem?.focus?.();
      }
      return;
    }
    setFormErrors({});

    const totalStock = matrixVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    const finalThumbnail = formThumbnail || (formImages.length > 0 ? formImages[0] : "");
    const finalImages = formImages.length > 0 ? formImages : (finalThumbnail ? [finalThumbnail] : []);

    const finalBasePrice = Number(formBasePrice);
    const finalDiscountPrice = formDiscountPrice ? Number(formDiscountPrice) : undefined;
    const finalEffectivePrice = finalDiscountPrice && finalDiscountPrice > 0 ? finalDiscountPrice : finalBasePrice;

    // Synchronize variant prices with the effective product price if not customized
    const finalVariants = matrixVariants.map((v) => ({
      ...v,
      price: v.price && v.price !== 250000 ? v.price : finalEffectivePrice,
    }));

    const payload = {
      title: formName.trim(),
      sku: formSku.trim(),
      description: formDescription.trim(),
      category: formCategory,
      brand: formBrand.trim() || "SportX Pro",
      basePrice: finalBasePrice,
      discountPrice: finalDiscountPrice,
      thumbnail: finalThumbnail || "👟",
      images: finalImages,
      sizes: formSelectedSizes,
      colors: formSelectedColors,
      totalStock,
      variants: finalVariants,
      status: "Active",
    };

    if (editingProductId) {
      updateMutation.mutate(
        { id: editingProductId, data: payload },
        {
          onSuccess: () => {
            toast.success("Thành công", "Đã cập nhật thông tin sản phẩm");
            setIsDrawerOpen(false);
          },
          onError: (err: any) => toast.error("Lỗi cập nhật", err.message || "Không thể cập nhật sản phẩm"),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Thành công", "Đã thêm sản phẩm thể thao mới");
          setIsDrawerOpen(false);
        },
        onError: (err: any) => toast.error("Lỗi tạo mới", err.message || "Không thể tạo sản phẩm"),
      });
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Thành công", "Đã xóa sản phẩm khỏi hệ thống"),
        onError: (err: any) => toast.error("Lỗi", err.message || "Không thể xóa sản phẩm"),
      });
    }
  };

  const handleToggleStatus = (product: Product) => {
    const nextStatus = product.status === "Active" ? "Draft" : "Active";
    updateMutation.mutate(
      {
        id: product.id,
        data: { status: nextStatus },
      },
      {
        onSuccess: () => toast.success("Thành công", "Đã cập nhật trạng thái sản phẩm"),
        onError: (err: any) => toast.error("Lỗi", err.message || "Không thể cập nhật sản phẩm"),
      }
    );
  };

  // Filtering products
  const filteredProducts = useMemo(() => {
    const normSearch = removeVietnameseTones(debouncedSearch);
    const lowerSearch = debouncedSearch.toLowerCase();

    return products.filter((p: Product) => {
      const matchesSearch =
        !normSearch ||
        removeVietnameseTones(p.title).includes(normSearch) ||
        p.title.toLowerCase().includes(lowerSearch) ||
        (p.sku || "").toLowerCase().includes(lowerSearch) ||
        removeVietnameseTones(p.brand).includes(normSearch) ||
        removeVietnameseTones(p.category).includes(normSearch);

      const matchesCategory =
        categoryFilter === "all" || p.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in_stock" && p.totalStock >= 20) ||
        (stockFilter === "low_stock" && p.totalStock > 0 && p.totalStock < 20) ||
        (stockFilter === "out_of_stock" && p.totalStock === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, debouncedSearch, categoryFilter, stockFilter]);

  // Checkbox selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProductIds(filteredProducts.map((p: Product) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds((prev) => [...prev, id]);
    } else {
      setSelectedProductIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleExportProducts = (format: "excel" | "csv") => {
    if (filteredProducts.length === 0) {
      toast.error("Không có sản phẩm", "Không có sản phẩm nào phù hợp để xuất báo cáo.");
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const headers = [
      "Mã SKU",
      "Tên sản phẩm",
      "Môn thể thao",
      "Giá bán (VNĐ)",
      "Giá gốc (VNĐ)",
      "Tổng tồn kho",
      "Số biến thể",
      "Tình trạng kho",
    ];

    const rows = filteredProducts.map((p: any) => {
      let statusStr = "Còn hàng";
      if (p.totalStock === 0) statusStr = "Hết hàng";
      else if (p.totalStock < 20) statusStr = "Sắp hết hàng";

      return [
        p.sku,
        p.title,
        p.category,
        `${p.price?.toLocaleString("vi-VN")}đ`,
        `${p.originalPrice?.toLocaleString("vi-VN")}đ`,
        p.totalStock,
        p.variants?.length || 0,
        statusStr,
      ];
    });

    if (format === "excel") {
      const sections: ReportSection[] = [
        {
          title: `Danh Sách Tồn Kho Sản Phẩm (${filteredProducts.length} sản phẩm)`,
          description: `Bộ lọc môn: ${categoryFilter} | Kho: ${stockFilter}`,
          headers,
          rows,
        },
      ];
      exportToExcel(`TonKho_SanPham_SportX_${todayStr}`, "BÁO CÁO TỒN KHO SẢN PHẨM SPORTX", sections, todayStr);
      toast.success("Xuất file Excel thành công", `File TonKho_SanPham_SportX_${todayStr}.xls đã tải xuống.`);
    } else {
      exportToCSV(`TonKho_SanPham_SportX_${todayStr}`, headers, rows);
      toast.success("Xuất file CSV thành công", `File TonKho_SanPham_SportX_${todayStr}.csv đã tải xuống.`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Sản phẩm & Kho hàng
              </h1>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200/50">
                Tổng cộng {products.length} sản phẩm
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Quản lý danh mục đồ thể thao, phân loại biến thể kích cỡ/màu sắc, giá bán và tồn kho theo thời gian thực.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Export Dropdown (HeroUI) */}
            <HeroDropdown
              title="Chọn định dạng"
              trigger={
                <button
                  type="button"
                  className="h-9 px-3.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition inline-flex items-center justify-center gap-2 shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  Xuất file tồn kho
                </button>
              }
              items={[
                {
                  key: "excel",
                  label: "Bảng tính Excel (.xls)",
                  icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
                },
                {
                  key: "csv",
                  label: "Dữ liệu thô CSV (.csv)",
                  icon: <Download className="w-4 h-4 text-blue-500" />,
                },
              ]}
              onAction={(key) => handleExportProducts(key as "excel" | "csv")}
            />

            <button
              onClick={handleOpenAddDrawer}
              className="h-9 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition inline-flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Thêm sản phẩm mới
            </button>
          </div>
        </div>

        {/* 1. Filter, Search & Bulk Actions Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm tên sản phẩm, mã SKU, thương hiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter (HeroUI) */}
            <HeroSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              size="sm"
              options={[
                { key: "all", label: "Tất cả môn thể thao" },
                { key: "Football", label: "⚽ Bóng đá" },
                { key: "Running", label: "🏃 Chạy bộ" },
                { key: "Gym", label: "💪 Gym & Thể hình" },
                { key: "Badminton", label: "🏸 Cầu lông" },
              ]}
              aria-label="Lọc theo môn thể thao"
            />

            {/* Stock status filter (HeroUI) */}
            <HeroSelect
              value={stockFilter}
              onChange={setStockFilter}
              size="sm"
              options={[
                { key: "all", label: "Tất cả trạng thái kho" },
                { key: "in_stock", label: "Còn hàng (20+)" },
                { key: "low_stock", label: "⚠️ Sắp hết (<20)" },
                { key: "out_of_stock", label: "❌ Hết hàng (0)" },
              ]}
              aria-label="Lọc theo trạng thái kho"
            />
          </div>
        </div>

        {/* Bulk Action Indicator */}
        {selectedProductIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center justify-between animate-in fade-in duration-150">
            <span className="text-xs font-bold text-blue-900">
              Đã chọn {selectedProductIds.length} sản phẩm
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm(`Bạn có chắc chắn muốn xóa ${selectedProductIds.length} sản phẩm đã chọn?`)) {
                    selectedProductIds.forEach((id) => deleteMutation.mutate(id));
                    setSelectedProductIds([]);
                  }
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Xóa các mục đã chọn
              </button>
              <button
                onClick={() => setSelectedProductIds([])}
                className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 transition cursor-pointer"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
        )}

        {/* 2. Data Table (Product List) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredProducts.length > 0 &&
                        selectedProductIds.length === filteredProducts.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[240px]">Thông tin sản phẩm & SKU</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Danh mục</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Giá niêm yết / Giảm</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Biến thể sẵn có</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Tổng tồn kho</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {isLoading ? (
                  <TableSkeletonRows cols={8} rows={6} />
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product: Product) => {
                    const isSelected = selectedProductIds.includes(product.id);
                    return (
                      <tr
                        key={product.id}
                        className={`hover:bg-slate-50/70 transition group ${
                          isSelected ? "bg-blue-50/40" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        {/* Thumbnail + Title + SKU */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                              {product.thumbnail && (product.thumbnail.startsWith("http") || product.thumbnail.startsWith("/") || product.thumbnail.startsWith("data:")) ? (
                                <img
                                  src={product.thumbnail}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <span className="text-2xl">{product.thumbnail || "👟"}</span>
                              )}
                            </div>
                            <div className="min-w-0 max-w-[260px]">
                              <div
                                className="font-bold text-slate-900 text-sm truncate cursor-pointer hover:text-blue-600 transition"
                                title={product.title}
                                onClick={() => setViewProduct(product)}
                              >
                                {product.title}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span
                                  className="font-mono text-[11px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded whitespace-nowrap"
                                  title={`Mã SKU: ${product.sku}`}
                                >
                                  {product.sku}
                                </span>
                                <span
                                  className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]"
                                  title={`Thương hiệu: ${product.brand}`}
                                >
                                  {product.brand}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category & Sport Type */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 whitespace-nowrap"
                            title={`Môn thể thao: ${product.category}`}
                          >
                            {product.category === "Football" && "⚽ Bóng đá"}
                            {product.category === "Running" && "🏃 Chạy bộ"}
                            {product.category === "Gym" && "💪 Gym & Thể hình"}
                            {product.category === "Badminton" && "🏸 Cầu lông"}
                          </span>
                        </td>

                        {/* Price (Base & Discount) */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div
                            className="flex items-baseline gap-1.5"
                            title={`Giá bán: ${formatCurrency(product.discountPrice || product.basePrice)}`}
                          >
                            {product.discountPrice ? (
                              <>
                                <span className="font-extrabold text-sm text-slate-900">
                                  {formatCurrency(product.discountPrice)}
                                </span>
                                <span className="text-xs text-slate-400 line-through">
                                  {formatCurrency(product.basePrice)}
                                </span>
                              </>
                            ) : (
                              <span className="font-extrabold text-sm text-slate-900">
                                {formatCurrency(product.basePrice)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Available Variants (Sizes + Color Dots) */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {/* Size Badges */}
                            <div
                              className="flex items-center gap-1 flex-nowrap"
                              title={`Kích cỡ sẵn có: ${product.sizes.join(", ")}`}
                            >
                              <span className="text-[10px] text-slate-400 font-bold uppercase mr-0.5">
                                Size:
                              </span>
                              {product.sizes.map((s: string) => (
                                <span
                                  key={s}
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                            {/* Color Dots */}
                            <div
                              className="flex items-center gap-1.5 flex-nowrap"
                              title={`Màu sắc: ${product.colors.map((c) => c.name).join(", ")}`}
                            >
                              <span className="text-[10px] text-slate-400 font-bold uppercase mr-0.5">
                                Màu:
                              </span>
                              {product.colors.map((c: { name: string; hex: string }) => (
                                <span
                                  key={c.name}
                                  title={c.name}
                                  className="w-3.5 h-3.5 rounded-full border border-white shadow-xs inline-block ring-1 ring-slate-300"
                                  style={{ backgroundColor: c.hex }}
                                />
                              ))}
                              <span className="text-[10px] text-slate-400 ml-1 font-semibold">
                                ({product.variants.length} SKU)
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Total Stock Quantity */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div
                            className="flex items-center gap-2"
                            title={`Tồn kho thực tế: ${product.totalStock} sản phẩm`}
                          >
                            <span className="font-extrabold text-sm text-slate-900">
                              {product.totalStock}
                            </span>
                            {product.totalStock >= 20 ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 whitespace-nowrap">
                                Còn hàng
                              </span>
                            ) : product.totalStock > 0 ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 whitespace-nowrap animate-pulse">
                                Sắp hết
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60 whitespace-nowrap">
                                Hết hàng
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status (Active / Draft) Toggle */}
                        <td className="py-4 px-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleToggleStatus(product)}
                            title={`Trạng thái: ${
                              product.status === "Active"
                                ? "Đang mở bán trên cửa hàng"
                                : "Lưu dạng bản nháp"
                            } (Bấm để đổi)`}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                              product.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                product.status === "Active" ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            {product.status === "Active" ? "Đang bán" : "Bản nháp"}
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => setViewProduct(product)}
                              title="Xem nhanh"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditDrawer(product)}
                              title="Sửa sản phẩm & Biến thể"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              title="Xóa sản phẩm"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      Không tìm thấy sản phẩm nào phù hợp với tìm kiếm hoặc bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Hiển thị {filteredProducts.length} trên {products.length} sản phẩm
            </span>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold transition disabled:opacity-50 cursor-pointer"
                disabled
              >
                Trước
              </button>
              <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold transition cursor-pointer">
                Sau
              </button>
            </div>
          </div>
        </div>

        {/* 3. Slide-Over Drawer ("Add / Edit Product" + Variant Matrix Generator) */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            />

            {/* Slide-over panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
              <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
                {/* Drawer Header */}
                <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Boxes className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        {editingProductId ? "Chỉnh sửa Sản phẩm & Biến thể" : "Thêm Sản phẩm Mới"}
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">
                        Thiết lập thông tin chung và ma trận tồn kho biến thể SKU
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Form Body */}
                <form id="product-form" onSubmit={handleSaveProduct} noValidate className="p-6 space-y-6 flex-1">
                  {/* Validation Error Summary Alert */}
                  {Object.keys(formErrors).length > 0 && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 shadow-xs animate-in fade-in zoom-in-95 duration-150">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-extrabold text-rose-900">
                            Biểu mẫu còn {Object.keys(formErrors).length} thông tin chưa hợp lệ:
                          </p>
                          <span className="text-[10px] font-bold bg-rose-200/60 text-rose-800 px-2 py-0.5 rounded-full">
                            Thiếu trường nào báo trường nấy
                          </span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700 font-medium">
                          {Object.values(formErrors).map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* General Info Section */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5" /> 1. Thông tin chung
                    </h3>

                    {/* Product Name */}
                    <div id="field-name">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tên sản phẩm <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Áo đấu bóng đá tuyển Việt Nam 2026"
                        value={formName}
                        onChange={(e) => {
                          setFormName(e.target.value);
                          clearError("name");
                        }}
                        className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border transition focus:outline-none focus:ring-2 ${
                          formErrors.name
                            ? "bg-rose-50/40 border-rose-400 text-rose-950 focus:ring-rose-500/20"
                            : "bg-slate-50 border-slate-200 focus:ring-blue-500/20 focus:bg-white"
                        }`}
                      />
                      {formErrors.name && (
                        <p className="mt-1.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in duration-150">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{formErrors.name}</span>
                        </p>
                      )}
                    </div>

                    {/* SKU Code (Dedicated required field) */}
                    <div id="field-sku">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Mã SKU sản phẩm <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateSku}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100/70 px-2 py-0.5 rounded-md transition cursor-pointer"
                          title="Tự động tạo mã SKU ngẫu nhiên theo môn thể thao"
                        >
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          <span>Tự sinh SKU</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="VD: SPX-FB-01"
                        value={formSku}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setFormSku(val);
                          clearError("sku");
                        }}
                        className={`w-full px-3.5 py-2.5 text-xs font-mono font-bold rounded-xl border transition focus:outline-none focus:ring-2 ${
                          formErrors.sku
                            ? "bg-rose-50/40 border-rose-400 text-rose-950 focus:ring-rose-500/20"
                            : "bg-slate-50 border-slate-200 text-blue-700 focus:ring-blue-500/20 focus:bg-white"
                        }`}
                      />
                      {formErrors.sku ? (
                        <p className="mt-1.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in duration-150">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{formErrors.sku}</span>
                        </p>
                      ) : (
                        <p className="mt-1 text-[10px] text-slate-400 font-medium">
                          Mã định danh sản phẩm duy nhất trong kho hàng (Ví dụ: SPX-FB-01)
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Mô tả sản phẩm
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Nhập chi tiết chất liệu, công nghệ thoáng khí, hướng dẫn sử dụng..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                      />
                    </div>

                    {/* Category & Brand */}
                    <div className="grid grid-cols-2 gap-4">
                      <div id="field-category">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Môn thể thao <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <HeroSelect
                          value={formCategory}
                          onChange={(val) => {
                            setFormCategory(val as any);
                            clearError("category");
                          }}
                          options={[
                            { key: "Football", label: "⚽ Bóng đá" },
                            { key: "Running", label: "🏃 Chạy bộ" },
                            { key: "Gym", label: "💪 Gym & Thể hình" },
                            { key: "Badminton", label: "🏸 Cầu lông" },
                          ]}
                          className="w-full"
                          triggerClassName={`w-full py-2.5 ${formErrors.category ? "border-rose-400 bg-rose-50/40 text-rose-900" : "bg-slate-50"}`}
                          aria-label="Chọn môn thể thao"
                        />
                        {formErrors.category && (
                          <p className="mt-1.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in duration-150">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{formErrors.category}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Thương hiệu
                        </label>
                        <input
                          type="text"
                          placeholder="VD: Nike, Adidas, Yonex, SportX Pro"
                          value={formBrand}
                          onChange={(e) => setFormBrand(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-4">
                      <div id="field-basePrice">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Giá niêm yết gốc (đ) <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <input
                          type="number"
                          step="1000"
                          value={formBasePrice}
                          onChange={(e) => {
                            const newBase = Number(e.target.value);
                            setFormBasePrice(newBase);
                            clearError("basePrice");
                            const eff = formDiscountPrice && formDiscountPrice > 0 ? formDiscountPrice : newBase;
                            setMatrixVariants((prev) =>
                              prev.map((v) => ({ ...v, price: eff }))
                            );
                          }}
                          className={`w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border transition focus:outline-none focus:ring-2 ${
                            formErrors.basePrice
                              ? "bg-rose-50/40 border-rose-400 text-rose-950 focus:ring-rose-500/20"
                              : "bg-slate-50 border-slate-200 focus:ring-blue-500/20 focus:bg-white"
                          }`}
                        />
                        {formErrors.basePrice && (
                          <p className="mt-1.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in duration-150">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{formErrors.basePrice}</span>
                          </p>
                        )}
                      </div>

                      <div id="field-discountPrice">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Giá khuyến mãi / Sale (đ)
                        </label>
                        <input
                          type="number"
                          step="1000"
                          placeholder="Không bắt buộc"
                          value={formDiscountPrice || ""}
                          onChange={(e) => {
                            const newDisc = Number(e.target.value);
                            setFormDiscountPrice(newDisc);
                            clearError("discountPrice");
                            const eff = newDisc > 0 ? newDisc : formBasePrice;
                            setMatrixVariants((prev) =>
                              prev.map((v) => ({ ...v, price: eff }))
                            );
                          }}
                          className={`w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border transition focus:outline-none focus:ring-2 ${
                            formErrors.discountPrice
                              ? "bg-rose-50/40 border-rose-400 text-rose-950 focus:ring-rose-500/20"
                              : "bg-slate-50 border-slate-200 focus:ring-blue-500/20 focus:bg-white"
                          }`}
                        />
                        {formErrors.discountPrice && (
                          <p className="mt-1.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in duration-150">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{formErrors.discountPrice}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 my-4" />

                  {/* 2. Product Images & Thumbnail Section */}
                  <div
                    id="field-images"
                    className={`space-y-5 rounded-2xl transition ${
                      formErrors.images ? "p-4 border-2 border-rose-300 bg-rose-50/20 shadow-xs" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> 2. Quản lý Ảnh Thumbnail & Ảnh Sản Phẩm <span className="text-rose-500 font-bold">*</span>
                      </h3>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                        Lưu tại HuyHung/images/
                      </span>
                    </div>

                    {formErrors.images && (
                      <div className="p-3 rounded-xl bg-rose-100/90 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{formErrors.images}</span>
                      </div>
                    )}

                    {/* Block A: THUMBNAIL (Ảnh đại diện chính) */}
                    <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-extrabold text-slate-900 block flex items-center gap-1.5">
                            ★ Ảnh đại diện sản phẩm (Thumbnail)
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Ảnh chính hiển thị ngoài trang chủ, danh sách sản phẩm và thẻ tìm kiếm (Lưu tại <strong>images/thumbnails/</strong>)
                          </span>
                        </div>
                        {formThumbnail && (
                          <button
                            type="button"
                            onClick={handleClearThumbnail}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
                          >
                            Xóa Thumbnail
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Thumbnail Preview Box */}
                        <div className="w-24 h-24 rounded-2xl border-2 border-slate-200 bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-xs relative group">
                          {formThumbnail ? (
                            <>
                              <img
                                src={formThumbnail}
                                alt="Thumbnail"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <span className="text-[10px] text-white font-bold px-2 py-1 rounded bg-black/50">
                                  Thumbnail
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="text-center p-2 text-slate-400">
                              <ImageIcon className="w-7 h-7 mx-auto mb-1 text-slate-300" />
                              <span className="text-[9px] font-bold block">Chưa có ảnh</span>
                            </div>
                          )}
                        </div>

                        {/* Thumbnail Controls */}
                        <div className="flex-1 space-y-2 w-full">
                          <div className="flex flex-wrap gap-2">
                            <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs active:scale-95">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleThumbnailUpload}
                                disabled={isUploadingThumbnail}
                              />
                              {isUploadingThumbnail ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              <span>{isUploadingThumbnail ? "Đang tải lên..." : "Tải ảnh Thumbnail từ máy"}</span>
                            </label>
                            <span className="text-[11px] text-slate-400 self-center">hoặc dán liên kết URL bên dưới</span>
                          </div>

                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Dán link URL Thumbnail (VD: https://images.unsplash.com/...)"
                              value={customThumbnailInput}
                              onChange={(e) => setCustomThumbnailInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddCustomThumbnailUrl();
                                }
                              }}
                              className="flex-1 min-w-0 px-3 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomThumbnailUrl}
                              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shrink-0 cursor-pointer"
                            >
                              Gán Thumbnail
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Block B: PRODUCT GALLERY (Bộ sưu tập ảnh chi tiết sản phẩm) */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-extrabold text-slate-900 block flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-blue-600" /> Bộ sưu tập ảnh sản phẩm chi tiết
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Các góc chụp khác nhau của sản phẩm trong trang chi tiết (Lưu tại <strong>images/products/</strong>)
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                          {formImages.length} ảnh trong album
                        </span>
                      </div>

                      {/* Upload & Link Controls for Product Images */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-3 flex items-center justify-center gap-2.5 bg-white hover:bg-blue-50/50 cursor-pointer transition group">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleProductImagesUpload}
                            disabled={isUploadingImage}
                          />
                          {isUploadingImage ? (
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
                          )}
                          <div className="text-left">
                            <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 block">
                              {isUploadingImage ? "Đang tải ảnh..." : "Thêm ảnh sản phẩm từ máy"}
                            </span>
                            <span className="text-[10px] text-slate-400 block">Chọn 1 hoặc nhiều ảnh</span>
                          </div>
                        </label>

                        <div className="flex items-center gap-1.5 bg-white p-2 border border-slate-200 rounded-xl">
                          <input
                            type="text"
                            placeholder="Dán link ảnh chi tiết..."
                            value={customUrlInput}
                            onChange={(e) => setCustomUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCustomProductUrl();
                              }
                            }}
                            className="flex-1 min-w-0 px-2 py-1 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white font-medium"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomProductUrl}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition shrink-0 cursor-pointer"
                          >
                            Thêm
                          </button>
                        </div>
                      </div>

                      {/* Quick Image Presets based on selected Category */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-600">
                            Kho ảnh mẫu gợi ý theo môn {formCategory}:
                          </span>
                          <span className="text-[10px] text-slate-400">(Nhấp để thêm nhanh vào album)</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {(PRESET_SPORTS_IMAGES[formCategory] || PRESET_SPORTS_IMAGES.Football).map((preset) => {
                            const isAdded = formImages.includes(preset.url);
                            return (
                              <button
                                key={preset.url}
                                type="button"
                                onClick={() => handleSelectPreset(preset.url)}
                                className={`group relative aspect-video rounded-lg overflow-hidden border transition text-left cursor-pointer ${
                                  isAdded ? "ring-2 ring-blue-600 border-blue-600" : "border-slate-200 hover:border-blue-400"
                                }`}
                              >
                                <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1">
                                  <span className="text-[9px] font-bold text-white block truncate">{preset.label}</span>
                                </div>
                                {isAdded && (
                                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                                    <Check className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selected Images Gallery */}
                      {formImages.length > 0 ? (
                        <div className="space-y-2 pt-1">
                          <label className="block text-xs font-bold text-slate-700">
                            Danh sách ảnh chi tiết ({formImages.length} ảnh):
                          </label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {formImages.map((imgUrl) => {
                              const isMain = formThumbnail === imgUrl;
                              return (
                                <div
                                  key={imgUrl}
                                  className={`relative group aspect-square rounded-xl overflow-hidden border bg-white transition ${
                                    isMain ? "ring-2 ring-blue-600 border-transparent shadow-sm" : "border-slate-200 hover:border-slate-300"
                                  }`}
                                >
                                  <img src={imgUrl} alt="Product" className="w-full h-full object-cover" />
                                  {isMain && (
                                    <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs z-10">
                                      ★ Thumbnail
                                    </span>
                                  )}
                                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-1">
                                    {!isMain && (
                                      <button
                                        type="button"
                                        onClick={() => handleSetThumbnail(imgUrl)}
                                        title="Đặt ảnh này làm Thumbnail"
                                        className="p-1 rounded-lg bg-white text-blue-600 hover:bg-blue-50 text-[10px] font-bold transition shadow-xs cursor-pointer"
                                      >
                                        Làm Thumbnail
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveImage(imgUrl)}
                                      title="Xóa ảnh này khỏi album"
                                      className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                          Chưa có ảnh chi tiết nào. Hãy tải ảnh từ máy tính hoặc nhấp chọn ảnh mẫu ở trên.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 my-4" />

                  {/* Variant Generator Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" /> 3. Bộ sinh biến thể (Size & Màu sắc)
                      </h3>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {matrixVariants.length} Biến thể phối
                      </span>
                    </div>

                    {/* Color Multi-select */}
                    <div id="field-colors">
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Chọn các màu sẵn có: <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_COLORS.map((c) => {
                          const isSelected = formSelectedColors.some((sc) => sc.name === c.name);
                          return (
                            <button
                              type="button"
                              key={c.name}
                              onClick={() => handleToggleColor(c)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                                isSelected
                                  ? "bg-blue-50 border-blue-400 text-blue-900 shadow-xs"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span
                                className="w-3 h-3 rounded-full border border-white shadow-xs"
                                style={{ backgroundColor: c.hex }}
                              />
                              {c.name}
                            </button>
                          );
                        })}
                      </div>
                      {formErrors.colors && (
                        <p className="mt-1.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in duration-150">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{formErrors.colors}</span>
                        </p>
                      )}
                    </div>

                    {/* Size Multi-select */}
                    <div id="field-sizes">
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Chọn các size sẵn có: <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_SIZES.map((size) => {
                          const isSelected = formSelectedSizes.includes(size);
                          return (
                            <button
                              type="button"
                              key={size}
                              onClick={() => handleToggleSize(size)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                      {formErrors.sizes && (
                        <p className="mt-1.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in duration-150">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{formErrors.sizes}</span>
                        </p>
                      )}
                    </div>

                    {/* Variant Matrix Table */}
                    <div id="field-variants" className="mt-4">
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Ma trận SKU, Giá bán & Tồn kho từng biến thể:
                      </label>
                      {formErrors.variants && (
                        <p className="mb-2 text-[11px] font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in duration-150">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{formErrors.variants}</span>
                        </p>
                      )}
                      <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200">
                              <th className="py-2.5 px-3 whitespace-nowrap">Biến thể (Màu × Size)</th>
                              <th className="py-2.5 px-3 whitespace-nowrap">Mã SKU</th>
                              <th className="py-2.5 px-3 w-32 whitespace-nowrap">Giá bán (đ)</th>
                              <th className="py-2.5 px-3 w-28 whitespace-nowrap">Tồn kho</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {matrixVariants.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/70">
                                <td className="py-2.5 px-3 flex items-center gap-2 whitespace-nowrap">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-white shadow-xs inline-block shrink-0"
                                    style={{ backgroundColor: item.colorHex }}
                                  />
                                  <span className="font-bold text-slate-900 truncate max-w-[100px]" title={item.color}>{item.color}</span>
                                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
                                    {item.size}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="text"
                                    value={item.sku}
                                    onChange={(e) =>
                                      handleUpdateMatrixCell(item.id, "sku", e.target.value)
                                    }
                                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] font-bold text-blue-600 focus:outline-none focus:bg-white"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="number"
                                    step="1000"
                                    value={item.price}
                                    onChange={(e) =>
                                      handleUpdateMatrixCell(item.id, "price", Number(e.target.value))
                                    }
                                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-slate-900 focus:outline-none focus:bg-white"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="number"
                                    value={item.stock}
                                    onChange={(e) =>
                                      handleUpdateMatrixCell(item.id, "stock", Number(e.target.value))
                                    }
                                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-slate-900 focus:outline-none focus:bg-white"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Drawer Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 sticky bottom-0">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    form="product-form"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
                  >
                    {editingProductId ? "Cập nhật sản phẩm & Ma trận" : "Lưu sản phẩm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick View Modal */}
        {viewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {viewProduct.thumbnail && (viewProduct.thumbnail.startsWith("http") || viewProduct.thumbnail.startsWith("/") || viewProduct.thumbnail.startsWith("data:")) ? (
                      <img src={viewProduct.thumbnail} alt={viewProduct.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">{viewProduct.thumbnail || "👟"}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{viewProduct.title}</h3>
                    <span className="font-mono text-xs font-bold text-blue-600">{viewProduct.sku}</span>
                  </div>
                </div>
                <button
                  onClick={() => setViewProduct(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <p className="text-slate-600">{viewProduct.description}</p>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 font-medium">Danh mục:</span>
                    <p className="font-bold text-slate-900">{viewProduct.category}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Thương hiệu:</span>
                    <p className="font-bold text-slate-900">{viewProduct.brand}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Tổng tồn kho:</span>
                    <p className="font-bold text-slate-900">{viewProduct.totalStock} sản phẩm</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Giá bán:</span>
                    <p className="font-bold text-emerald-600">
                      {formatCurrency(viewProduct.discountPrice || viewProduct.basePrice)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Chi tiết tồn kho từng biến thể:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {viewProduct.variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: v.colorHex }}
                          />
                          <span className="font-bold text-slate-800">{v.color}</span>
                          <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                            {v.size}
                          </span>
                          <span className="font-mono text-slate-400">{v.sku}</span>
                        </div>
                        <span className="font-bold text-slate-900">{v.stock} trong kho</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setViewProduct(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
