import { useState } from "react";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
  error?: string;
  numericOnly?: boolean;
  onEnter?: () => void;
  id?: string;
}

export default function FloatingInput({ label, value, onChange, type = "text", required, maxLength, error, numericOnly, onEnter, id }: Props) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (numericOnly) {
      val = val.replace(/\D/g, "");
    }
    onChange(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter?.();
    }
    // Block non-numeric keys for numeric fields
    if (numericOnly && e.key.length === 1 && !/\d/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        required={required}
        maxLength={maxLength}
        className={`w-full glass rounded-lg px-4 py-3 text-foreground transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring bg-transparent ${
          error ? "border-destructive ring-destructive/30 neon-border-error" : "neon-border"
        }`}
        placeholder=" "
        style={error ? { borderColor: "hsl(var(--destructive))", boxShadow: "0 0 10px hsl(var(--destructive) / 0.2)" } : undefined}
      />
      <label
        className={`absolute left-4 transition-all pointer-events-none ${
          active
            ? "-top-2.5 text-xs font-medium bg-card px-1.5 " + (error ? "text-destructive" : "text-primary")
            : "top-3 text-sm text-muted-foreground"
        }`}
      >
        {label} {required && "*"}
      </label>
      {error && (
        <p className="text-xs text-destructive mt-1 ml-1">{error}</p>
      )}
    </div>
  );
}
