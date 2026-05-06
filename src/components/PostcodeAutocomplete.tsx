"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
  placeholder?: string;
}

export default function PostcodeAutocomplete({
  value,
  onChange,
  hasError,
  placeholder = "Postcode or city, e.g. M1 1AE or Manchester",
}: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef    = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }

    if (q.length < 2) {
      setSuggestions([]); setOpen(false); setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const res = await fetch(`/api/postcode-lookup?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("lookup failed");
      const data = await res.json();
      const raw: unknown = data?.results;
      const list = Array.isArray(raw)
        ? raw.filter((s): s is string => typeof s === "string" && s.length > 0)
        : [];
      setSuggestions(list);
      setOpen(list.length > 0);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setSuggestions([]); setOpen(false);
    } finally {
      if (abortRef.current === controller) { setLoading(false); abortRef.current = null; }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    setActiveIdx(-1);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(v), 300);
  };

  const selectSuggestion = (s: string) => {
    onChange(s); setSuggestions([]); setOpen(false); setActiveIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      case "ArrowUp":
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, -1));
        return;
      case "Enter":
        e.preventDefault();
        if (activeIdx >= 0 && suggestions[activeIdx]) selectSuggestion(suggestions[activeIdx]);
        return;
      case "Escape":
        e.preventDefault();
        setOpen(false); setActiveIdx(-1);
        return;
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const inputCls = `w-full px-4 py-3 rounded-xl border-2 text-navy-700 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
    hasError ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-orange-500"
  }`;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          autoComplete="off"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={inputCls}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="animate-spin w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={`${i}-${s}`}
              onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
              className={`px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2.5 transition-colors ${
                i === activeIdx ? "bg-orange-50 text-orange-700 font-medium" : "text-navy-700 hover:bg-gray-50"
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
