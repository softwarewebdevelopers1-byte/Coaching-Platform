import React, { useRef, useState } from "react";

export interface CountryOption {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const countries: CountryOption[] = [
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "GH", name: "Ghana", dialCode: "+233", flag: "🇬🇭" },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "AE", name: "UAE", dialCode: "+971", flag: "🇦🇪" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
];

interface PhoneInputProps {
  value: string;
  countryCode: string;
  onChange: (phone: string, countryCode: string) => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, countryCode, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCountry = countries.find((c) => c.dialCode === countryCode) || countries[0];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d\s]/g, "");
    onChange(raw, countryCode);
  };

  const selectCountry = (country: CountryOption) => {
    onChange(value, country.dialCode);
    setOpen(false);
  };

  return (
    <div className="uw-phone-input" ref={containerRef}>
      <button
        type="button"
        className="uw-phone-country-select"
        onClick={() => setOpen(!open)}
        aria-label="Select country code"
      >
        <span className="uw-phone-flag" aria-hidden>{selectedCountry.flag}</span>
        <span className="uw-phone-dial">{selectedCountry.dialCode}</span>
        <span className="uw-phone-chevron">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="uw-phone-dropdown">
          {countries.map((country) => (
            <button
              key={country.code}
              type="button"
              className={`uw-phone-option ${country.dialCode === countryCode ? "selected" : ""}`}
              onClick={() => selectCountry(country)}
            >
              <span className="uw-phone-flag" aria-hidden>{country.flag}</span>
              <span className="uw-phone-name">{country.name}</span>
              <span className="uw-phone-dial">{country.dialCode}</span>
            </button>
          ))}
        </div>
      )}
      <input
        type="tel"
        value={value}
        onChange={handlePhoneChange}
        placeholder="700 000 000"
        className="uw-phone-field"
      />
    </div>
  );
};

export default PhoneInput;
