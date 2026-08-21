"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

const COLORS = ["#F97316", "#FB923C", "#18181B", "#FDBA74", "#EA580C"];
const PARTICLE_COUNT = 28;

function makeParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.4;
    const distance = 60 + Math.random() * 90;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 20,
      rotate: Math.random() * 360,
      color: COLORS[i % COLORS.length],
      size: 5 + Math.random() * 5,
    };
  });
}

export function ConfettiBurst() {
  const particles = useMemo(makeParticles, []);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}
