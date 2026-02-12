"use client";

import { useRef, useEffect, type ReactNode } from "react";

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  staggerIndex?: number;
  direction?: "up" | "left";
}

export default function AnimateOnScroll({
  children,
  className,
  threshold = 0.15,
  staggerIndex,
  direction,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-animate", "visible");
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      data-animate=""
      {...(direction === "left" ? { "data-animate-direction": "left" } : {})}
      className={className}
      style={staggerIndex != null ? { "--stagger-index": staggerIndex } as React.CSSProperties : undefined}
    >
      {children}
    </div>
  );
}
