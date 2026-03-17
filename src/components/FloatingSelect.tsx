import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

interface Props {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  searchable?: boolean;
  required?: boolean;
  error?: string;
  onEnter?: () => void;
}

export default function FloatingSelect({ label, options, value, onChange, searchable = false, required, error, onEnter }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = searchable
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (open) {
        // If dropdown is open and there's a single match, select it
        if (filtered.length === 1) {
          onChange(filtered[0]);
          setOpen(false);
          setSearch("");
          onEnter?.();
        }
      } else {
        setOpen(true);
      }
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        className={`w-full glass rounded-lg px-4 py-3 text-left text-foreground flex items-center justify-between transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring ${
          error ? "border-destructive" : "neon-border"
        }`}
        style={error ? { borderColor: "hsl(var(--destructive))", boxShadow: "0 0 10px hsl(var(--destructive) / 0.2)" } : undefined}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || label}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {/* Floating label */}
      {value && (
        <span className={`absolute -top-2.5 left-3 bg-card px-1.5 text-xs font-medium ${error ? "text-destructive" : "text-primary"}`}>
          {label} {required && "*"}
        </span>
      )}
      {error && (
        <p className="text-xs text-destructive mt-1 ml-1">{error}</p>
      )}
      {open && (
        <div className="absolute z-50 mt-1 w-full glass-strong neon-border rounded-lg shadow-xl max-h-60 overflow-auto">
          {searchable && (
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
          )}
          {filtered.map(opt => (
            <button
              type="button"
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); setSearch(""); onEnter?.(); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 ${
                opt === value ? "text-primary font-medium bg-primary/5" : "text-foreground"
              }`}
            >
              {opt}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
