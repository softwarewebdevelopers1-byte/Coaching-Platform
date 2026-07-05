import React, { useMemo, useState } from "react";

type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
};

const countries: CountryOption[] = [
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
  { code: "UG", name: "Uganda", dialCode: "+256", flag: "🇺🇬" },
  { code: "TZ", name: "Tanzania", dialCode: "+255", flag: "🇹🇿" },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪" },
];

interface CountryPhoneInputProps {
  value: string;
  countryValue?: string;
  countryCodeValue?: string;
  onChange: (value: string, meta: { countryName: string; dialCode: string }) => void;
  onCountryChange?: (dialCode: string, countryName: string) => void;
  placeholder?: string;
}

const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  countryValue,
  countryCodeValue,
  onChange,
  onCountryChange,
  placeholder = "700123456",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCountry = useMemo(() => {
    const match = countries.find((country) => country.dialCode === countryCodeValue);
    return match || countries[0];
  }, [countryCodeValue]);

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "");
    onChange(digits, {
      countryName: countryValue || selectedCountry.name,
      dialCode: selectedCountry.dialCode,
    });
  };

  const handleCountrySelect = (country: CountryOption) => {
    onCountryChange?.(country.dialCode, country.name);
    setIsOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "stretch" }}>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          style={{
            border: "1px solid #d1d5db",
            borderRight: "none",
            borderRadius: "10px 0 0 10px",
            background: "#fff",
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            minWidth: "118px",
            justifyContent: "center",
            fontSize: "0.95rem",
          }}
        >
          <span>{selectedCountry.flag}</span>
          <span>{selectedCountry.dialCode}</span>
        </button>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "1px solid #d1d5db",
            borderLeft: "none",
            borderRadius: "0 10px 10px 0",
            padding: "10px 12px",
            fontSize: "0.95rem",
            outline: "none",
          }}
        />
        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              zIndex: 20,
              width: "100%",
              maxHeight: "220px",
              overflowY: "auto",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
            }}
          >
            {countries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountrySelect(country)}
                style={{
                  width: "100%",
                  border: "none",
                  background: country.dialCode === selectedCountry.dialCode ? "#f3f4f6" : "transparent",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                </span>
                <span style={{ color: "#4b5563" }}>{country.dialCode}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <small style={{ color: "#64748b" }}>
        Use the flag to choose a country code and enter only digits for the phone number.
      </small>
    </div>
  );
};

export default CountryPhoneInput;
