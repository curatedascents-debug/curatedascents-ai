"use client";

import type { ReactNode } from "react";

interface ScrollLinkProps {
  targetId: string;
  className?: string;
  children: ReactNode;
}

export default function ScrollLink({ targetId, className, children }: ScrollLinkProps) {
  return (
    <button
      onClick={() => {
        const el = document.querySelector(`#${targetId}`);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }}
      className={className}
    >
      {children}
    </button>
  );
}
