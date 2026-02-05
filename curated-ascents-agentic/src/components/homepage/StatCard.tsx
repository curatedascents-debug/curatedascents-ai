"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Stat } from "@/lib/constants/stats";
import { fadeInUp } from "@/lib/animations";

interface StatCardProps {
  stat: Stat;
  index: number;
}

export default function StatCard({ stat, index }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepValue = stat.value / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setCount(stat.value);
        clearInterval(timer);
      } else {
        setCount(Math.min(stepValue * currentStep, stat.value));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isInView, stat.value]);

  // Format the count based on whether it's a decimal
  const formattedCount = stat.value % 1 !== 0
    ? count.toFixed(1)
    : Math.floor(count).toLocaleString();

  return (
    <motion.div
      ref={ref}
      variants={fadeInUp}
      custom={index}
      className="text-center"
    >
      <div className="mb-2">
        <span className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
          {formattedCount}
        </span>
        <span className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-emerald-400">
          {stat.suffix}
        </span>
      </div>
      <h3 className="text-lg font-medium text-white mb-1">{stat.label}</h3>
      <p className="text-sm text-slate-400">{stat.description}</p>
    </motion.div>
  );
}
