export interface Country {
  name: string;
  isoCode: string;
  dialCode: string;
}

export const COUNTRIES: Country[] = [
  { name: "Nigeria", isoCode: "NG", dialCode: "+234" },
  { name: "United Kingdom", isoCode: "GB", dialCode: "+44" },
  { name: "United States", isoCode: "US", dialCode: "+1" },
  { name: "Canada", isoCode: "CA", dialCode: "+1" },
  { name: "Ghana", isoCode: "GH", dialCode: "+233" },
  { name: "Kenya", isoCode: "KE", dialCode: "+254" },
  { name: "South Africa", isoCode: "ZA", dialCode: "+27" },
  { name: "Ethiopia", isoCode: "ET", dialCode: "+251" },
  { name: "Tanzania", isoCode: "TZ", dialCode: "+255" },
  { name: "Uganda", isoCode: "UG", dialCode: "+256" },
  { name: "Cameroon", isoCode: "CM", dialCode: "+237" },
  { name: "Côte d'Ivoire", isoCode: "CI", dialCode: "+225" },
  { name: "Senegal", isoCode: "SN", dialCode: "+221" },
  { name: "Zambia", isoCode: "ZM", dialCode: "+260" },
  { name: "Zimbabwe", isoCode: "ZW", dialCode: "+263" },
  { name: "Rwanda", isoCode: "RW", dialCode: "+250" },
  { name: "Mozambique", isoCode: "MZ", dialCode: "+258" },
  { name: "Angola", isoCode: "AO", dialCode: "+244" },
  { name: "Botswana", isoCode: "BW", dialCode: "+267" },
  { name: "Namibia", isoCode: "NA", dialCode: "+264" },
  { name: "Malawi", isoCode: "MW", dialCode: "+265" },
  { name: "Sierra Leone", isoCode: "SL", dialCode: "+232" },
  { name: "Liberia", isoCode: "LR", dialCode: "+231" },
  { name: "Gambia", isoCode: "GM", dialCode: "+220" },
  { name: "Guinea", isoCode: "GN", dialCode: "+224" },
  { name: "Niger", isoCode: "NE", dialCode: "+227" },
  { name: "Mali", isoCode: "ML", dialCode: "+223" },
  { name: "Burkina Faso", isoCode: "BF", dialCode: "+226" },
  { name: "Togo", isoCode: "TG", dialCode: "+228" },
  { name: "Benin", isoCode: "BJ", dialCode: "+229" },
  { name: "Chad", isoCode: "TD", dialCode: "+235" },
  { name: "Sudan", isoCode: "SD", dialCode: "+249" },
  { name: "Somalia", isoCode: "SO", dialCode: "+252" },
  { name: "Madagascar", isoCode: "MG", dialCode: "+261" },
  { name: "Mauritius", isoCode: "MU", dialCode: "+230" },
  { name: "Germany", isoCode: "DE", dialCode: "+49" },
  { name: "France", isoCode: "FR", dialCode: "+33" },
  { name: "Italy", isoCode: "IT", dialCode: "+39" },
  { name: "Spain", isoCode: "ES", dialCode: "+34" },
  { name: "Portugal", isoCode: "PT", dialCode: "+351" },
  { name: "Netherlands", isoCode: "NL", dialCode: "+31" },
  { name: "Belgium", isoCode: "BE", dialCode: "+32" },
  { name: "Switzerland", isoCode: "CH", dialCode: "+41" },
  { name: "Sweden", isoCode: "SE", dialCode: "+46" },
  { name: "Norway", isoCode: "NO", dialCode: "+47" },
  { name: "Denmark", isoCode: "DK", dialCode: "+45" },
  { name: "Finland", isoCode: "FI", dialCode: "+358" },
  { name: "Poland", isoCode: "PL", dialCode: "+48" },
  { name: "Ireland", isoCode: "IE", dialCode: "+353" },
  { name: "Austria", isoCode: "AT", dialCode: "+43" },
  { name: "Greece", isoCode: "GR", dialCode: "+30" },
  { name: "Turkey", isoCode: "TR", dialCode: "+90" },
  { name: "Russia", isoCode: "RU", dialCode: "+7" },
  { name: "Ukraine", isoCode: "UA", dialCode: "+380" },
  { name: "Australia", isoCode: "AU", dialCode: "+61" },
  { name: "New Zealand", isoCode: "NZ", dialCode: "+64" },
  { name: "India", isoCode: "IN", dialCode: "+91" },
  { name: "Pakistan", isoCode: "PK", dialCode: "+92" },
  { name: "Bangladesh", isoCode: "BD", dialCode: "+880" },
  { name: "China", isoCode: "CN", dialCode: "+86" },
  { name: "Japan", isoCode: "JP", dialCode: "+81" },
  { name: "South Korea", isoCode: "KR", dialCode: "+82" },
  { name: "Indonesia", isoCode: "ID", dialCode: "+62" },
  { name: "Malaysia", isoCode: "MY", dialCode: "+60" },
  { name: "Philippines", isoCode: "PH", dialCode: "+63" },
  { name: "Singapore", isoCode: "SG", dialCode: "+65" },
  { name: "Thailand", isoCode: "TH", dialCode: "+66" },
  { name: "Vietnam", isoCode: "VN", dialCode: "+84" },
  { name: "Saudi Arabia", isoCode: "SA", dialCode: "+966" },
  { name: "United Arab Emirates", isoCode: "AE", dialCode: "+971" },
  { name: "Qatar", isoCode: "QA", dialCode: "+974" },
  { name: "Kuwait", isoCode: "KW", dialCode: "+965" },
  { name: "Bahrain", isoCode: "BH", dialCode: "+973" },
  { name: "Oman", isoCode: "OM", dialCode: "+968" },
  { name: "Egypt", isoCode: "EG", dialCode: "+20" },
  { name: "Morocco", isoCode: "MA", dialCode: "+212" },
  { name: "Algeria", isoCode: "DZ", dialCode: "+213" },
  { name: "Tunisia", isoCode: "TN", dialCode: "+216" },
  { name: "Libya", isoCode: "LY", dialCode: "+218" },
  { name: "Brazil", isoCode: "BR", dialCode: "+55" },
  { name: "Mexico", isoCode: "MX", dialCode: "+52" },
  { name: "Argentina", isoCode: "AR", dialCode: "+54" },
  { name: "Colombia", isoCode: "CO", dialCode: "+57" },
  { name: "Chile", isoCode: "CL", dialCode: "+56" },
  { name: "Peru", isoCode: "PE", dialCode: "+51" },
  { name: "Venezuela", isoCode: "VE", dialCode: "+58" },
  { name: "Jamaica", isoCode: "JM", dialCode: "+1876" },
  { name: "Trinidad & Tobago", isoCode: "TT", dialCode: "+1868" },
];

export function flagEmoji(isoCode: string): string {
  return [...isoCode.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e0 - 65 + c.charCodeAt(0)))
    .join("");
}

export function parseDialed(value: string): { country: Country; local: string } {
  const defaultCountry = COUNTRIES.find((c) => c.isoCode === "NG") ?? COUNTRIES[0];
  if (!value) return { country: defaultCountry, local: "" };

  // Match longest dial code first to avoid +1 swallowing +1876 etc.
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sorted) {
    if (value.startsWith(c.dialCode)) {
      return { country: c, local: value.slice(c.dialCode.length) };
    }
  }
  return { country: defaultCountry, local: value.startsWith("+") ? value.slice(1) : value };
}
