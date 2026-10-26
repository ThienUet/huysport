"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Slider,
} from "@heroui/react";
import { FaCircleCheck, FaRuler, FaUser, FaArrowRight } from "react-icons/fa6";
import { Product, SizeRecommendationResult } from "@/types";
import { useRecommendSize } from "@/hooks";

interface AISizeAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSelectSize?: (size: string) => void;
}

export default function AISizeAdvisorModal({
  isOpen,
  onClose,
  product,
  onSelectSize,
}: AISizeAdvisorModalProps) {
  const [heightCm, setHeightCm] = useState<number>(172);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [gender, setGender] = useState<"Nam" | "Nữ" | "Unisex">("Nam");
  const [bodyFitPreference, setBodyFitPreference] = useState<"Slim Fit" | "Regular Fit" | "Loose Fit / Thoải mái">("Regular Fit");
  const [result, setResult] = useState<SizeRecommendationResult | null>(null);
  const recommendSizeMutation = useRecommendSize();
  const isLoading = recommendSizeMutation.isPending;

  const handleCalculate = async () => {
    try {
      const res = await recommendSizeMutation.mutateAsync({
        heightCm,
        weightKg,
        gender,
        category: product?.category || "Bóng đá",
        bodyFitPreference,
      });

      if (res.success && res.data) {
        setResult(res.data);
      } else {
        fallbackCalculate();
      }
    } catch {
      fallbackCalculate();
    }
  };

  const fallbackCalculate = () => {
    let size = "L";
    let altSize = "XL";
    let reason = "Phù hợp với thể trạng cân đối";

    if (heightCm < 165) {
      if (weightKg < 55) { size = "S"; altSize = "M"; }
      else { size = "M"; altSize = "L"; }
    } else if (heightCm <= 175) {
      if (weightKg < 65) { size = "M"; altSize = "L"; }
      else if (weightKg <= 75) { size = "L"; altSize = "XL"; }
      else { size = "XL"; altSize = "2XL"; }
    } else {
      if (weightKg < 75) { size = "L"; altSize = "XL"; }
      else if (weightKg <= 85) { size = "XL"; altSize = "2XL"; }
      else { size = "2XL"; altSize = "3XL"; }
    }

    if (bodyFitPreference === "Loose Fit / Thoải mái") {
      size = altSize;
      reason = "Đã tăng 1 size theo sở thích mặc rộng rãi, thoáng mát.";
    }

    setResult({
      recommendedSize: size,
      alternativeSize: altSize,
      confidenceScore: 95,
      reason,
      fitAnalysis: `Với chiều cao ${heightCm}cm và cân nặng ${weightKg}kg, cỡ ${size} là lựa chọn lý tưởng mang lại độ ôm vừa vặn và tối ưu cho cử động thể thao.`,
    });
  };

  const handleApplySize = () => {
    if (result && onSelectSize) {
      onSelectSize(result.recommendedSize);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="lg" placement="center">
      <ModalContent className="bg-white text-gray-900 rounded-xl p-2">
        {() => (
          <>
            <ModalHeader className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FaRuler className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Bảng Tính Chọn Size Quần Áo</h3>
                <p className="text-[11px] text-gray-500 font-normal">
                  Gợi ý kích cỡ chuẩn xác dựa trên chiều cao, cân nặng và form dáng
                </p>
              </div>
            </ModalHeader>

            <ModalBody className="py-4 space-y-4">
              {product && (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                    <img
                      src={product.images?.[0] || "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {product.sport || product.category}
                    </span>
                    <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
                  </div>
                </div>
              )}

              {/* Input Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Height */}
                <div className="space-y-1.5 bg-gray-50 p-3 rounded-xl border border-gray-200 focus-within:border-emerald-500 transition-colors">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-700 flex items-center gap-1">
                      <FaRuler className="w-3.5 h-3.5 text-gray-500" /> Chiều cao
                    </span>
                    <span className="font-bold text-gray-900 text-xs">{heightCm} cm</span>
                  </div>
                  <Slider
                    size="sm"
                    step={1}
                    minValue={140}
                    maxValue={205}
                    value={heightCm}
                    onChange={(val) => setHeightCm(val as number)}
                    className="max-w-md"
                    classNames={{
                      filler: "bg-emerald-600",
                      thumb: "bg-emerald-600",
                    }}
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1.5 bg-gray-50 p-3 rounded-xl border border-gray-200 focus-within:border-emerald-500 transition-colors">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-700 flex items-center gap-1">
                      <FaUser className="w-3.5 h-3.5 text-gray-500" /> Cân nặng
                    </span>
                    <span className="font-bold text-gray-900 text-xs">{weightKg} kg</span>
                  </div>
                  <Slider
                    size="sm"
                    step={1}
                    minValue={35}
                    maxValue={130}
                    value={weightKg}
                    onChange={(val) => setWeightKg(val as number)}
                    className="max-w-md"
                    classNames={{
                      filler: "bg-emerald-600",
                      thumb: "bg-emerald-600",
                    }}
                  />
                </div>
              </div>

              {/* Fit Preference & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Giới tính:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["Nam", "Nữ", "Unisex"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                          gender === g
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Form dáng mong muốn:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["Slim Fit", "Regular Fit", "Loose Fit / Thoải mái"] as const).map((fit) => (
                      <button
                        key={fit}
                        type="button"
                        onClick={() => setBodyFitPreference(fit)}
                        className={`py-2 px-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer truncate ${
                          bodyFitPreference === fit
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {fit.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <Button
                className="w-full font-bold text-xs h-10 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                startContent={<FaRuler className="w-4 h-4" />}
                isLoading={isLoading}
                onPress={handleCalculate}
              >
                Tính Toán Cỡ Size Phù Hợp
              </Button>

              {/* Recommendation Result Card */}
              {result && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-600">Size đề xuất:</span>
                      <span className="text-xl font-bold text-emerald-600 bg-white px-3 py-0.5 rounded-lg border border-emerald-200 shadow-sm">
                        {result.recommendedSize}
                      </span>
                    </div>
                    {result.confidenceScore && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <FaCircleCheck className="w-3.5 h-3.5" /> Phù hợp {result.confidenceScore}%
                      </span>
                    )}
                  </div>

                  {result.alternativeSize && (
                    <div className="text-[11px] text-gray-600">
                      Size dự phòng (nếu thích mặc rộng hơn): <strong className="font-bold">{result.alternativeSize}</strong>
                    </div>
                  )}

                  <p className="text-xs text-gray-700 leading-relaxed bg-white p-2.5 rounded-lg border border-gray-200">
                    {result.fitAnalysis}
                  </p>
                </div>
              )}
            </ModalBody>

            <ModalFooter className="border-t border-gray-100 pt-3">
              <Button variant="flat" size="sm" className="font-bold text-xs rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200" onPress={onClose}>
                Đóng
              </Button>
              {result && onSelectSize && (
                <Button
                  size="sm"
                  className="font-bold text-xs rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                  endContent={<FaArrowRight className="w-3.5 h-3.5" />}
                  onPress={handleApplySize}
                >
                  Chọn Size {result.recommendedSize}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
