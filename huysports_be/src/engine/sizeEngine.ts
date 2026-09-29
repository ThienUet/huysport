import { SizeRule } from "../types/index.js";
import { db } from "../db/store.js";

export interface SizeRecommendationInput {
  height: number; // in cm, e.g. 175
  weight: number; // in kg, e.g. 70
  gender?: "Male" | "Female" | "Unisex";
  category?: "Apparel" | "Shoes" | "Training Gear";
  fitPreference?: "Slim Fit" | "Regular Fit" | "Loose Fit";
}

export interface SizeRecommendationResult {
  suggestedSize: string;
  fitType: string;
  confidence: number;
  matchedRule: SizeRule | null;
  bmi: number;
  bmiCategory: string;
  advice: string;
  alternateSizes?: { size: string; reason: string }[];
}

export class SizeEngine {
  public static calculateBMI(heightCm: number, weightKg: number): { bmi: number; category: string } {
    const heightM = heightCm / 100;
    const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
    let category = "Bình thường";
    if (bmi < 18.5) category = "Gầy / Thon gọn";
    else if (bmi >= 23 && bmi < 25) category = "Hơi đầy đặn";
    else if (bmi >= 25 && bmi < 30) category = "Thừa cân / Đô con";
    else if (bmi >= 30) category = "Béo phì / Cần size lớn";
    return { bmi, category };
  }

  public static recommendSize(input: SizeRecommendationInput): SizeRecommendationResult {
    const { height, weight, gender = "Unisex", category = "Apparel", fitPreference } = input;
    const { bmi, category: bmiCategory } = this.calculateBMI(height, weight);
    const activeRules = db.getSizeRules().filter((r) => r.status === "Active" && r.category === category);

    // Filter rules by gender compatibility
    const genderRules = activeRules.filter(
      (r) => r.gender === gender || r.gender === "Unisex" || gender === "Unisex"
    );

    // Score rules based on distance to height/weight range
    let bestRule: SizeRule | null = null;
    let highestScore = -1;

    for (const rule of genderRules) {
      let score = 0;

      const inHeight = height >= rule.heightMin && height <= rule.heightMax;
      const inWeight = weight >= rule.weightMin && weight <= rule.weightMax;

      if (inHeight && inWeight) {
        score += 100;
        // bonus if fit preference matches
        if (fitPreference && rule.fitType === fitPreference) {
          score += 20;
        }
        if (rule.gender === gender) {
          score += 10;
        }
      } else if (inHeight || inWeight) {
        score += 40;
        const heightDist = inHeight
          ? 0
          : Math.min(Math.abs(height - rule.heightMin), Math.abs(height - rule.heightMax));
        const weightDist = inWeight
          ? 0
          : Math.min(Math.abs(weight - rule.weightMin), Math.abs(weight - rule.weightMax));
        score -= heightDist * 2 + weightDist * 3;
      }

      if (score > highestScore) {
        highestScore = score;
        bestRule = rule;
      }
    }

    // Default heuristic fallback if no exact rule found
    let suggestedSize = "Size L";
    let fitType = fitPreference || "Regular Fit";
    let confidence = 0.85;

    if (bestRule && highestScore >= 80) {
      suggestedSize = bestRule.suggestedSize;
      fitType = fitPreference || bestRule.fitType;
      confidence = 0.95;
    } else {
      // Rule-based fallback calculation
      if (height < 165 && weight < 58) suggestedSize = "Size S";
      else if (height < 172 && weight < 68) suggestedSize = "Size M";
      else if (height < 180 && weight < 78) suggestedSize = "Size L";
      else if (height < 188 && weight < 88) suggestedSize = "Size XL";
      else suggestedSize = "Size XXL";
      confidence = 0.80;
    }

    const advice = `Dựa trên chiều cao ${height}cm, cân nặng ${weight}kg (Chỉ số BMI: ${bmi} - ${bmiCategory}), SportX AI khuyên bạn nên mặc **${suggestedSize}** (${fitType}) để đạt độ thoải mái tối đa khi vận động và tập luyện thể thao.`;

    const alternateSizes = [];
    if (suggestedSize === "Size M") {
      alternateSizes.push({ size: "Size L", reason: "Nếu bạn thích mặc form rộng rãi (Oversize) hoặc có bắp tay to" });
      alternateSizes.push({ size: "Size S", reason: "Nếu bạn muốn mặc ôm sát cơ thể (Slim Body Fit)" });
    } else if (suggestedSize === "Size L") {
      alternateSizes.push({ size: "Size XL", reason: "Nếu bạn có bờ vai rộng hoặc thích mặc thoải mái khi chạy bộ" });
      alternateSizes.push({ size: "Size M", reason: "Nếu bạn muốn ôm cơ bắp gọn gàng" });
    }

    return {
      suggestedSize,
      fitType,
      confidence,
      matchedRule: bestRule,
      bmi,
      bmiCategory,
      advice,
      alternateSizes,
    };
  }
}
