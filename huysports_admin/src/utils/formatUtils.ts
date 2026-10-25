/**
 * Format date and time strictly to "DD-MM-YYYY HH:mm"
 * E.g. 26-10-2026 01:39
 */
export function formatDateTime(input: string | number | Date | null | undefined): string {
  if (!input) return "";

  // If already in DD-MM-YYYY HH:mm format, return directly
  const ddmmyyyyRegex = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/;
  if (typeof input === "string" && ddmmyyyyRegex.test(input.trim())) {
    return input.trim();
  }

  // Handle YYYY-MM-DD cleanly without timezone offset shift
  const ymdMatch = typeof input === "string" && input.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    return `${ymdMatch[3]}-${ymdMatch[2]}-${ymdMatch[1]} 00:00`;
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY without time
  const dmyMatch = typeof input === "string" && input.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${day}-${month}-${year} 00:00`;
  }

  let d = new Date(input);
  if (isNaN(d.getTime())) {
    // Clean legacy strings like "26 Oct 2026 • 01:39" or "22 Sep 2026   14:30"
    const cleaned = String(input).replace(/[•·]/g, "").replace(/\s+/g, " ").trim();
    d = new Date(cleaned);
  }

  if (isNaN(d.getTime())) {
    const parts = String(input).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?/);
    if (parts) {
      const day = parts[1].padStart(2, "0");
      const month = parts[2].padStart(2, "0");
      const year = parts[3];
      const hours = (parts[4] || "00").padStart(2, "0");
      const minutes = (parts[5] || "00").padStart(2, "0");
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    }
    return String(input);
  }

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

/**
 * Format currency to VNĐ
 */
export function formatCurrency(num: number | string | undefined | null): string {
  if (num === undefined || num === null || isNaN(Number(num))) return "0đ";
  return `${Math.round(Number(num)).toLocaleString("vi-VN")}đ`;
}
