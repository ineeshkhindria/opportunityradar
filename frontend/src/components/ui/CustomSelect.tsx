import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = searchable
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const updateCoords = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, []);

  useEffect(() => {
    if (open) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
      return () => {
        window.removeEventListener('scroll', updateCoords, true);
        window.removeEventListener('resize', updateCoords);
      };
    }
  }, [open, updateCoords]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        listRef.current && !listRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) setHighlighted(-1);
  }, [open]);

  useEffect(() => {
    if (open && searchable) {
      requestAnimationFrame(() => {
        const input = document.querySelector<HTMLInputElement>('[data-custom-select-search]');
        input?.focus();
      });
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
    <>
      <button
        ref={triggerRef}
        type="button"
        className="custom-select-trigger"
        onClick={() => { updateCoords(); setOpen(!open); }}
        aria-expanded={open}
      >
        <span className={value ? 'text-gray-100' : 'text-gray-500'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <div
          ref={listRef}
          className="fixed z-[9999] rounded-xl overflow-hidden
                     bg-[#0c0c1a] border border-brand-500/30
                     shadow-2xl shadow-black/60 backdrop-blur-2xl
                     ring-1 ring-brand-500/10 animate-fade-in"
          style={{ top: coords.top, left: coords.left, width: coords.width }}
        >
          {searchable && (
            <div className="flex items-center gap-2 px-3 bg-white/[0.04] border-b border-white/[0.06]">
              <Search className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                data-custom-select-search
                type="text"
                className="!border-0 !bg-transparent !pl-0 w-full px-4 py-3 text-gray-100 placeholder-gray-500 text-sm focus:outline-none"
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setHighlighted(-1); }}
                onKeyDown={handleKey}
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
                  className="w-full px-4 py-3 text-left text-sm text-gray-200
                             hover:bg-brand-500/10 hover:text-white hover:pl-5
                             transition-all duration-150 cursor-pointer
                             border-b border-white/[0.03] last:border-b-0"
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
        </div>,
        document.body
      )}
    </>
  );
}
