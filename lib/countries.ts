/** ISO 3166-1 alpha-2 → 繁體中文顯示名(純資料,無伺服器依賴,客戶端也能用)。 */
const COUNTRY_NAMES: Record<string, string> = {
  TW: "台灣", HK: "香港", MO: "澳門",
  CN: "中國", JP: "日本", KR: "韓國", SG: "新加坡", MY: "馬來西亞",
  US: "美國", CA: "加拿大", GB: "英國", DE: "德國", FR: "法國", NL: "荷蘭",
  AU: "澳洲", NZ: "紐西蘭", IN: "印度", TH: "泰國", VN: "越南", PH: "菲律賓",
  ID: "印尼", BR: "巴西", IT: "義大利", ES: "西班牙", SE: "瑞典", CH: "瑞士",
  RU: "俄羅斯", TR: "土耳其", AE: "阿聯", ZA: "南非", MX: "墨西哥", UNKNOWN: "未知",
  LOCAL: "本機",
};

export function countryName(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}