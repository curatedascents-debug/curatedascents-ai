"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { WORLD_AIRPORTS, GATEWAY_CODES, searchAirports, type Airport } from "@/lib/constants/world-airports";

interface AirportSearchProps {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  showGatewayFirst?: boolean;
}

const gatewayAirports = WORLD_AIRPORTS.filter((a) => GATEWAY_CODES.has(a.code));

export default function AirportSearch({ value, onChange, placeholder, showGatewayFirst }: AirportSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync display text when value changes externally
  useEffect(() => {
    if (value) {
      const airport = WORLD_AIRPORTS.find((a) => a.code === value);
      if (airport) {
        setQuery(`${airport.city} (${airport.code})`);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown on click outside
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const results = query.trim()
    ? searchAirports(query, 8)
    : showGatewayFirst
      ? gatewayAirports
      : [];

  const selectAirport = useCallback(
    (airport: Airport) => {
      setQuery(`${airport.city} (${airport.code})`);
      onChange(airport.code);
      setIsOpen(false);
      setHighlightIndex(-1);
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    setHighlightIndex(-1);
    if (!val.trim()) {
      onChange("");
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    // Select all text on focus so user can start fresh
    inputRef.current?.select();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < results.length) {
          selectAirport(results[highlightIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightIndex(-1);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  const showGatewayLabel = showGatewayFirst && !query.trim() && results.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-white/10 border border-luxury-gold/20 rounded-lg px-4 py-2.5 text-white placeholder:text-luxury-cream/30 focus:outline-none focus:border-luxury-gold/50 transition-colors"
        role="combobox"
        aria-expanded={isOpen && results.length > 0}
        aria-autocomplete="list"
        aria-controls="airport-listbox"
      />

      {isOpen && results.length > 0 && (
        <ul
          id="airport-listbox"
          ref={listRef}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-luxury-navy border border-luxury-gold/20 rounded-lg shadow-xl"
        >
          {showGatewayLabel && (
            <li className="px-4 py-1.5 text-[11px] font-medium tracking-wider uppercase text-luxury-gold/60 select-none">
              Recommended Destinations
            </li>
          )}
          {results.map((airport, i) => (
            <li
              key={airport.code}
              role="option"
              aria-selected={highlightIndex === i}
              className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                highlightIndex === i
                  ? "bg-luxury-gold/20 text-white"
                  : "text-luxury-cream/80 hover:bg-luxury-gold/10"
              }`}
              onMouseDown={() => selectAirport(airport)}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              <span className="font-medium text-white">{airport.city}</span>{" "}
              <span className="text-luxury-gold">({airport.code})</span>{" "}
              <span className="text-luxury-cream/50">— {airport.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
