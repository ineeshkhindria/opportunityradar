import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  searchable?: boolean;
}

export function CustomSelect({ value, onChange, options, placeholder = 'Select...', searchable = false }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlighted, setHighlighted] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = searchable
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) setHighlighted(-1);
  }, [open]);

  useEffect(() => {
    if (open && searchable) {
      const input = ref.current?.querySelector('input');
      input?.focus();
    }
  }, [open, searchable]);

  const select = (opt: string) => {
    onChange(opt);
    setOpen(false);
    setSearch('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      select(filtered[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="custom-select" ref={ref} onKeyDown={handleKey}>
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className={value ? 'text-gray-100' : 'text-gray-500'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="custom-select-dropdown animate-fade-in" ref={listRef}>
          {searchable && (
            <div className="flex items-center gap-2 px-3 bg-white/[0.04] border-b border-white/[0.06]">
              <Search className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                type="text"
                className="custom-select-search !border-0 !bg-transparent !pl-0"
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setHighlighted(-1); }}
              />
            </div>
          )}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No options found</div>
            ) : (
              filtered.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  className="custom-select-option"
                  data-selected={opt === value}
                  data-highlighted={i === highlighted}
                  onClick={() => select(opt)}
                  onMouseEnter={() => setHighlighted(i)}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
