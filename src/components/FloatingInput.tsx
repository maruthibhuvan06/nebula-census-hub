import { useState } from "react";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
}

export default function FloatingInput({ label, value, onChange, type = "text", required, maxLength }: Props) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        maxLength={maxLength}
        className="w-full glass neon-border rounded-lg px-4 py-3 text-foreground transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring bg-transparent"
        placeholder=" "
      />
      <label
        className={`absolute left-4 transition-all pointer-events-none ${
          active
            ? "-top-2.5 text-xs text-primary font-medium bg-card px-1.5"
            : "top-3 text-sm text-muted-foreground"
        }`}
      >
        {label} {required && "*"}
      </label>
    </div>
  );
}
