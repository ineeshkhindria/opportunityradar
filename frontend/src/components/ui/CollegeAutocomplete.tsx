import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import { INDIAN_COLLEGES } from '../../data/colleges';

interface CollegeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CollegeAutocomplete({ value, onChange, placeholder = 'Search your college...' }: CollegeAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [highlighted, setHighlighted] = useState(-1);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? INDIAN_COLLEGES
        .filter((c) => c.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 20)
    : [];

  const updateCoords = useCallback(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
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
        wrapperRef.current && !wrapperRef.current.contains(target) &&
        listRef.current && !listRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setOpen(filtered.length > 0);
    setHighlighted(-1);
  }, [query]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const select = (college: string) => {
    onChange(college);
    setQuery(college);
    setOpen(false);
  };

  const clear = () => {
    onChange('');
    setQuery('');
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
      <div ref={wrapperRef} className="relative" onKeyDown={handleKey}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          className="input-field pl-10 pr-10"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); updateCoords(); }}
          onFocus={() => { updateCoords(); filtered.length > 0 && setOpen(true); }}
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && createPortal(
        <div
          ref={listRef}
          className="fixed z-[9999] rounded-xl overflow-hidden
                     bg-[#0c0c1a] border border-brand-500/30
                     shadow-2xl shadow-black/60 backdrop-blur-2xl
                     ring-1 ring-brand-500/10 animate-fade-in"
          style={{ top: coords.top, left: coords.left, width: coords.width }}
        >
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No colleges found</div>
            ) : (
              filtered.map((college, i) => (
                <button
                  key={college}
                  type="button"
                  className="w-full px-4 py-3 text-left text-sm text-gray-200
                           hover:bg-brand-500/10 hover:text-white hover:pl-5
                           transition-all duration-150 cursor-pointer
                           border-b border-white/[0.03] last:border-b-0"
                  data-highlighted={i === highlighted}
                  onClick={() => select(college)}
                  onMouseEnter={() => setHighlighted(i)}
                >
                  {college}
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
