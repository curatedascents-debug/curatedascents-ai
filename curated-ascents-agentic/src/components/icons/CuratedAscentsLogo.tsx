"use client";

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Custom CuratedAscents logo — twin Himalayan peaks with a compass rose accent.
 * Unique hand-crafted SVG; not sourced from any icon library.
 */
export default function CuratedAscentsLogo({ className = "", size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CuratedAscents logo"
    >
      {/* Background circle — subtle glow */}
      <circle cx="32" cy="32" r="31" stroke="currentColor" strokeWidth="1" opacity="0.15" />

      {/* Left peak (taller) */}
      <path
        d="M8 50 L22 16 L36 50"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Right peak (shorter, overlapping) */}
      <path
        d="M28 50 L40 24 L52 50"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Snow caps — left peak */}
      <path
        d="M18 24 L22 16 L26 24"
        fill="currentColor"
        opacity="0.25"
      />

      {/* Snow caps — right peak */}
      <path
        d="M36.5 30 L40 24 L43.5 30"
        fill="currentColor"
        opacity="0.25"
      />

      {/* Compass rose — north pointer at summit */}
      <path
        d="M31 8 L32 4 L33 8"
        fill="currentColor"
        opacity="0.7"
      />
      <line x1="32" y1="4" x2="32" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.4" />

      {/* Winding trail/path between peaks */}
      <path
        d="M14 46 C20 42, 26 44, 32 40 C38 36, 44 38, 50 42"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
        strokeDasharray="3 2"
      />

      {/* Horizon base line */}
      <line x1="6" y1="50" x2="58" y2="50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />

      {/* Star/diamond accent — representing luxury */}
      <path
        d="M54 14 L56 12 L58 14 L56 16 Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}
