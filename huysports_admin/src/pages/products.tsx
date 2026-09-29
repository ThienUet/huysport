import { useState, useMemo } from "react";
import AdminLayout from "@/layouts/admin-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/api";
import { useToastStore } from "@/store/useToastStore";
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
} from "lucide-react";

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
  icon: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  totalStock: number;
  status: "Active" | "Draft";
  variants: VariantItem[];
  description?: string;
}

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL"];
const AVAILABLE_COLORS = [
  { name: "Black", hex: "#0F172A" },
  { name: "Navy", hex: "#1E3A8A" },
  { name: "Red", hex: "#DC2626" },
  { name: "White", hex: "#E2E8F0" },
  { name: "Olive", hex: "#4D7C0F" },
  { name: "Royal Blue", hex: "#2563EB" },
];

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const toast = useToastStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  // React Query Fetch Products
  const { data: products = [] } = useQuery({
    queryKey: ["products", categoryFilter],
    queryFn: () => productService.getAll({ category: categoryFilter !== "all" ? categoryFilter : undefined }),
  });

  // Create Product Mutation
  const createMutation = useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Thành công", "Đã thêm sản phẩm thể thao mới");
      setIsDrawerOpen(false);
    },
    onError: (err: any) => {
      toast.error("Lỗi", err.message || "Không thể tạo sản phẩm");
    },
  });

  // Update Product Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Thành công", "Đã cập nhật thông tin sản phẩm");
      setIsDrawerOpen(false);
    },
    onError: (err: any) => {
      toast.error("Lỗi", err.message || "Không thể cập nhật sản phẩm");
    },
  });

  // Delete Product Mutation
  const deleteMutation = useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Thành công", "Đã xóa sản phẩm khỏi hệ thống");
    },
    onError: (err: any) => {
      toast.error("Lỗi", err.message || "Không thể xóa sản phẩm");
    },
  });

  // Drawer state (Add or Edit)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State inside Drawer
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState<"Football" | "Running" | "Gym" | "Badminton">("Football");
  const [formBrand, setFormBrand] = useState("");
  const [formBasePrice, setFormBasePrice] = useState<number>(100);
  const [formDiscountPrice, setFormDiscountPrice] = useState<number>(0);
  const [formSelectedSizes, setFormSelectedSizes] = useState<string[]>(["M", "L"]);
  const [formSelectedColors, setFormSelectedColors] = useState<{ name: string; hex: string }[]>([
    AVAILABLE_COLORS[0],
    AVAILABLE_COLORS[2],
  ]);
  const [matrixVariants, setMatrixVariants] = useState<VariantItem[]>([]);

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

  // Open Drawer for Add New
  const handleOpenAddDrawer = () => {
    setEditingProductId(null);
    setFormName("");
    setFormDescription("");
    setFormCategory("Football");
    setFormBrand("Nike");
    setFormBasePrice(120);
    setFormDiscountPrice(99);
    const initialSizes = ["S", "M", "L"];
    const initialColors = [AVAILABLE_COLORS[0], AVAILABLE_COLORS[2]];
    setFormSelectedSizes(initialSizes);
    setFormSelectedColors(initialColors);
    setMatrixVariants(generateMatrix(initialSizes, initialColors, "SPX-NEW", 99));
    setIsDrawerOpen(true);
  };

  // Open Drawer for Edit
  const handleOpenEditDrawer = (product: Product) => {
    setEditingProductId(product.id);
    setFormName(product.title);
    setFormDescription(product.description || "");
    setFormCategory(product.category);
    setFormBrand(product.brand);
    setFormBasePrice(product.basePrice);
    setFormDiscountPrice(product.discountPrice || 0);
    setFormSelectedSizes(product.sizes);
    setFormSelectedColors(product.colors);
    setMatrixVariants(product.variants);
    setIsDrawerOpen(true);
  };

  // Update matrix variant cell
  const handleUpdateMatrixCell = (id: string, field: keyof VariantItem, value: any) => {
    setMatrixVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  // Toggle size selection in variant generator
  const handleToggleSize = (size: string) => {
    const updated = formSelectedSizes.includes(size)
      ? formSelectedSizes.filter((s) => s !== size)
      : [...formSelectedSizes, size];
    setFormSelectedSizes(updated);
    setMatrixVariants(
      generateMatrix(
        updated,
        formSelectedColors,
        formName ? `SPX-${formName.slice(0, 3).toUpperCase()}` : "SPX-PRD",
        formDiscountPrice || formBasePrice,
        matrixVariants
      )
    );
  };

  // Toggle color selection in variant generator
  const handleToggleColor = (color: { name: string; hex: string }) => {
    const exists = formSelectedColors.some((c) => c.name === color.name);
    const updated = exists
      ? formSelectedColors.filter((c) => c.name !== color.name)
      : [...formSelectedColors, color];
    setFormSelectedColors(updated);
    setMatrixVariants(
      generateMatrix(
        formSelectedSizes,
        updated,
        formName ? `SPX-${formName.slice(0, 3).toUpperCase()}` : "SPX-PRD",
        formDiscountPrice || formBasePrice,
        matrixVariants
      )
    );
  };

  // Save product from Drawer
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const totalStock = matrixVariants.reduce((sum, v) => sum + Number(v.stock || 0), 0);

    if (editingProductId) {
      // Update existing product
      updateMutation.mutate({
        id: editingProductId,
        data: {
          title: formName,
          description: formDescription,
          category: formCategory,
          brand: formBrand,
          basePrice: Number(formBasePrice),
          discountPrice: formDiscountPrice ? Number(formDiscountPrice) : undefined,
          sizes: formSelectedSizes,
          colors: formSelectedColors,
          variants: matrixVariants,
          totalStock,
        },
      });
    } else {
      // Add new product
      createMutation.mutate({
        title: formName,
        sku: `SPX-${formCategory.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
        category: formCategory,
        brand: formBrand,
        basePrice: Number(formBasePrice),
        discountPrice: formDiscountPrice ? Number(formDiscountPrice) : undefined,
        thumbnail:
          formCategory === "Football"
            ? "⚽"
            : formCategory === "Running"
            ? "🏃"
            : formCategory === "Gym"
            ? "🏋️"
            : "🏸",
        icon: "⚡",
        sizes: formSelectedSizes,
        colors: formSelectedColors,
        totalStock,
        status: "Active",
        variants: matrixVariants,
        description: formDescription,
      });
    }
  };

  // Delete product
  const handleDeleteProduct = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      deleteMutation.mutate(id);
      setSelectedProductIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Toggle product status (Active / Draft)
  const handleToggleStatus = (product: Product) => {
    const newStatus = product.status === "Active" ? "Draft" : "Active";
    updateMutation.mutate({
      id: product.id,
      data: { status: newStatus },
    });
  };

  // Filtering products
  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || p.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in_stock" && p.totalStock >= 20) ||
        (stockFilter === "low_stock" && p.totalStock > 0 && p.totalStock < 20) ||
        (stockFilter === "out_of_stock" && p.totalStock === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Products & Inventory
              </h1>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200/50">
                {products.length} Items Total
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Manage your athletic catalog, multi-attribute variants, pricing, and live warehouse inventory.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenAddDrawer}
              className="px-4 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add New Product
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
              placeholder="Search product name, SKU code, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="all">All Sports Categories</option>
              <option value="Football">⚽ Football</option>
              <option value="Running">🏃 Running</option>
              <option value="Gym">💪 Gym & Fitness</option>
              <option value="Badminton">🏸 Badminton</option>
            </select>

            {/* Stock status filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock (20+)</option>
              <option value="low_stock">⚠️ Low Stock (&lt;20)</option>
              <option value="out_of_stock">❌ Out of Stock (0)</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Indicator */}
        {selectedProductIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center justify-between animate-in fade-in duration-150">
            <span className="text-xs font-bold text-blue-900">
              Selected {selectedProductIds.length} products
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm(`Bạn có chắc chắn muốn xóa ${selectedProductIds.length} sản phẩm đã chọn?`)) {
                    selectedProductIds.forEach((id) => deleteMutation.mutate(id));
                    setSelectedProductIds([]);
                  }
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedProductIds([])}
                className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 transition"
              >
                Clear Selection
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
                  <th className="py-3.5 px-4">Product Info & SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price (Base / Discount)</th>
                  <th className="py-3.5 px-4">Available Variants</th>
                  <th className="py-3.5 px-4">Total Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredProducts.length > 0 ? (
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
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-2xl shadow-xs">
                              {product.thumbnail}
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <div className="font-bold text-slate-900 text-sm truncate">
                                {product.title}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[11px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                                  {product.sku}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium">
                                  {product.brand}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category & Sport Type */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                            {product.category === "Football" && "⚽ Football"}
                            {product.category === "Running" && "🏃 Running"}
                            {product.category === "Gym" && "💪 Gym & Fitness"}
                            {product.category === "Badminton" && "🏸 Badminton"}
                          </span>
                        </td>

                        {/* Price (Base & Discount) */}
                        <td className="py-4 px-4">
                          <div className="flex items-baseline gap-2">
                            {product.discountPrice ? (
                              <>
                                <span className="font-extrabold text-sm text-slate-900">
                                  ${product.discountPrice.toFixed(2)}
                                </span>
                                <span className="text-xs text-slate-400 line-through">
                                  ${product.basePrice.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="font-extrabold text-sm text-slate-900">
                                ${product.basePrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Available Variants (Sizes + Color Dots) */}
                        <td className="py-4 px-4">
                          <div className="space-y-1.5">
                            {/* Size Badges */}
                            <div className="flex items-center gap-1 flex-wrap">
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
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-slate-400 font-bold uppercase mr-0.5">
                                Color:
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
                                ({product.variants.length} SKU vars)
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Total Stock Quantity */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">
                              {product.totalStock}
                            </span>
                            {product.totalStock >= 20 ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                                In Stock
                              </span>
                            ) : product.totalStock > 0 ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 animate-pulse">
                                Low Stock
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status (Active / Draft) Toggle */}
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleToggleStatus(product)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition ${
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
                            {product.status}
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => setViewProduct(product)}
                              title="Quick View"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditDrawer(product)}
                              title="Edit Product & Variants"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              title="Delete Product"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
                      No products match your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing {filteredProducts.length} of {products.length} products
            </span>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold transition disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold transition">
                Next
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
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
                {/* Drawer Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Boxes className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        {editingProductId ? "Edit Product & Variants" : "Add New Product"}
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">
                        Configure general info and multi-SKU variant stock matrix
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Form Body */}
                <form id="product-form" onSubmit={handleSaveProduct} className="p-6 space-y-6 flex-1">
                  {/* General Info Section */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5" /> 1. General Information
                    </h3>

                    {/* Product Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Nike Mercurial Superfly 9 Elite FG"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Enter sports gear technical details and specifications..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                      />
                    </div>

                    {/* Category & Brand */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Category *
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e: any) => setFormCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                        >
                          <option value="Football">⚽ Football</option>
                          <option value="Running">🏃 Running</option>
                          <option value="Gym">💪 Gym & Fitness</option>
                          <option value="Badminton">🏸 Badminton</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Brand
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Nike, Adidas, Yonex"
                          value={formBrand}
                          onChange={(e) => setFormBrand(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Base Price ($) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formBasePrice}
                          onChange={(e) => setFormBasePrice(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Discount / Sale Price ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Optional"
                          value={formDiscountPrice || ""}
                          onChange={(e) => setFormDiscountPrice(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 my-4"></div>

                  {/* Variant Generator Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" /> 2. Variant Generator
                      </h3>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {matrixVariants.length} Combinations
                      </span>
                    </div>

                    {/* Color Multi-select */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Select Available Colors:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_COLORS.map((c) => {
                          const isSelected = formSelectedColors.some((sc) => sc.name === c.name);
                          return (
                            <button
                              type="button"
                              key={c.name}
                              onClick={() => handleToggleColor(c)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
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
                    </div>

                    {/* Size Multi-select */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Select Available Sizes:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_SIZES.map((size) => {
                          const isSelected = formSelectedSizes.includes(size);
                          return (
                            <button
                              type="button"
                              key={size}
                              onClick={() => handleToggleSize(size)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
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
                    </div>

                    {/* Variant Matrix Table */}
                    <div className="mt-4">
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        SKU, Price & Stock Matrix:
                      </label>
                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200">
                              <th className="py-2.5 px-3">Variant (Color × Size)</th>
                              <th className="py-2.5 px-3">SKU</th>
                              <th className="py-2.5 px-3 w-24">Price ($)</th>
                              <th className="py-2.5 px-3 w-24">Stock Qty</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {matrixVariants.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/70">
                                <td className="py-2.5 px-3 flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-white shadow-xs inline-block"
                                    style={{ backgroundColor: item.colorHex }}
                                  />
                                  <span className="font-bold text-slate-900">{item.color}</span>
                                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
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
                    className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="product-form"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-500/20 active:scale-95"
                  >
                    {editingProductId ? "Update Product & Matrix" : "Save Product"}
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
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl">
                    {viewProduct.thumbnail}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{viewProduct.title}</h3>
                    <span className="font-mono text-xs font-bold text-blue-600">{viewProduct.sku}</span>
                  </div>
                </div>
                <button
                  onClick={() => setViewProduct(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <p className="text-slate-600">{viewProduct.description}</p>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 font-medium">Category:</span>
                    <p className="font-bold text-slate-900">{viewProduct.category}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Brand:</span>
                    <p className="font-bold text-slate-900">{viewProduct.brand}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Total Stock:</span>
                    <p className="font-bold text-slate-900">{viewProduct.totalStock} units</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Price:</span>
                    <p className="font-bold text-emerald-600">
                      ${(viewProduct.discountPrice || viewProduct.basePrice).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Variant Stock Breakdown:</h4>
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
                        <span className="font-bold text-slate-900">{v.stock} in stock</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setViewProduct(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
