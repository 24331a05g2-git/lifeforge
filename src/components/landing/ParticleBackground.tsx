"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedY: number;
  speedX: number;
  alpha: number;
  maxAlpha: number;
  pulseSpeed: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Color palette: Warm forge embers and soft ethereal star dust
    const colors = [
      "245, 158, 11",  // Amber
      "251, 191, 36",  // Golden
      "217, 119, 6",   // Deep forge orange
      "129, 140, 248", // Arcane indigo
      "255, 255, 255", // Celestial starlight
    ];

    // Keep particle count subtle and lightweight
    const particleCount = Math.min(Math.floor(width / 28), 55);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: -(Math.random() * 0.35 + 0.1),
        speedX: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.3 + 0.1,
        maxAlpha: Math.random() * 0.45 + 0.2,
        pulseSpeed: Math.random() * 0.01 + 0.003,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Move particle gently upwards
        p.y += p.speedY;
        p.x += p.speedX;

        // Subtle alpha pulsing
        p.alpha += p.pulseSpeed;
        if (p.alpha > p.maxAlpha || p.alpha < 0.05) {
          p.pulseSpeed = -p.pulseSpeed;
        }

        // Wrap around boundaries
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw soft glowing particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0, p.alpha)})`;
        ctx.shadowBlur = p.radius * 6;
        ctx.shadowColor = `rgba(${p.color}, 0.8)`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Deep atmospheric radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(20,24,38,0.7)_0%,rgba(7,8,11,1)_80%)]" />

      {/* Subtle bottom forge amber ambient light */}
      <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-amber-600/10 rounded-full blur-[140px]" />

      {/* Subtle top mystical arcane horizon */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-indigo-900/15 rounded-full blur-[160px]" />

      {/* Interactive canvas particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-70"
      />

      {/* Film grain / subtle mesh overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.02]" />
    </div>
  );
}
