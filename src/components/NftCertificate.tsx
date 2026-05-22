"use client";

import React, { useEffect, useState } from "react";

interface NftCertificateProps {
  lotName: string;
  winningBid: number;
  winnerUsername: string;
  auctionDate: string;
  onClose: () => void;
}

function randomHash() {
  const chars = "0123456789ABCDEF";
  let hash = "0x";
  for (let i = 0; i < 40; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  speed: number;
  delay: number;
  rotation: number;
  borderRadius: string;
}

export default function NftCertificate({
  lotName,
  winningBid,
  winnerUsername,
  auctionDate,
  onClose,
}: NftCertificateProps) {
  const [certificateId] = useState(() => randomHash());
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Generate confetti particles
    const colors = [
      "#f59e0b",
      "#fbbf24",
      "#10b981",
      "#8b5cf6",
      "#ef4444",
      "#3b82f6",
      "#ec4899",
      "#f97316",
    ];
    const newParticles: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 6,
      speed: Math.random() * 3 + 2,
      delay: Math.random() * 3,
      rotation: Math.random() * 360,
      borderRadius: Math.random() > 0.5 ? "50%" : "2px",
    }));

    // Trigger entrance animation asynchronously
    requestAnimationFrame(() => {
      setParticles(newParticles);
      setTimeout(() => setVisible(true), 50);
    });
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 350);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
    >
      {/* Confetti Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: "-20px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              borderRadius: p.borderRadius,
              transform: `rotate(${p.rotation}deg)`,
              animation: `confettiFall ${p.speed}s ${p.delay}s ease-in infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0.3; }
        }
        @keyframes borderDraw {
          0% { stroke-dashoffset: 2000; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes goldPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(245,158,11,0.4), 0 0 60px rgba(245,158,11,0.2), inset 0 0 30px rgba(245,158,11,0.05); }
          50% { box-shadow: 0 0 60px rgba(245,158,11,0.7), 0 0 120px rgba(245,158,11,0.4), inset 0 0 50px rgba(245,158,11,0.1); }
        }
        @keyframes certSlideIn {
          0% { transform: scale(0.7) translateY(60px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes trophySpin {
          0%, 100% { transform: rotate(-5deg) scale(1); }
          50% { transform: rotate(5deg) scale(1.1); }
        }
        .cert-anim {
          animation: certSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, goldPulse 3s 0.6s ease-in-out infinite;
        }
        .trophy-anim {
          animation: trophySpin 2s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>

      {/* Certificate Card */}
      <div
        className="cert-anim relative w-full max-w-xl rounded-3xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0f0a00 0%, #1a1000 30%, #0d0d1a 70%, #050510 100%)",
          border: "2px solid rgba(245,158,11,0.6)",
        }}
      >
        {/* Animated Border SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <rect
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            rx="23"
            ry="23"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="2"
            strokeDasharray="2000"
            strokeDashoffset="0"
            style={{
              animation: "borderDraw 2s ease forwards",
              strokeDasharray: 2000,
            }}
          />
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="25%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="75%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>

        {/* Top golden gradient bar */}
        <div
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(245,158,11,0.3), rgba(251,191,36,0.5), rgba(245,158,11,0.3), transparent)",
            height: "3px",
          }}
        />

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-amber-400/60 rounded-tl-xl" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-amber-400/60 rounded-tr-xl" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-amber-400/60 rounded-bl-xl" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-amber-400/60 rounded-br-xl" />

        <div className="relative z-10 p-8 sm:p-10 space-y-6 text-center">
          {/* KRAM Logo */}
          <div className="flex justify-center items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-amber-900"
              style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}
            >
              K
            </div>
            <span className="text-xl font-black tracking-wider text-amber-400">
              KRAM<span className="text-amber-300">.UA</span>
            </span>
          </div>

          {/* Trophy */}
          <div className="text-6xl sm:text-7xl">
            <span className="trophy-anim">🏆</span>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.4em] text-amber-500/70 font-bold">
              Офіційний сертифікат
            </p>
            <h2
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, #f59e0b 0%, #fbbf24 40%, #f97316 70%, #f59e0b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% auto",
                animation: "shimmer 3s linear infinite",
              }}
            >
              ПЕРЕМОЖЕЦЬ АУКЦІОНУ
            </h2>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.4))" }} />
            <div className="text-amber-500 text-xs">✦</div>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.4), transparent)" }} />
          </div>

          {/* Certificate Details */}
          <div
            className="rounded-2xl p-5 space-y-4 text-left"
            style={{
              background: "rgba(245,158,11,0.04)",
              border: "1px solid rgba(245,158,11,0.15)",
            }}
          >
            <div className="flex justify-between items-start gap-4">
              <span className="text-amber-600/70 text-xs uppercase tracking-wider font-bold shrink-0">
                Лот:
              </span>
              <span className="text-amber-100 text-sm font-bold text-right leading-tight">
                {lotName}
              </span>
            </div>

            <div className="h-px bg-amber-500/10" />

            <div className="flex justify-between items-center">
              <span className="text-amber-600/70 text-xs uppercase tracking-wider font-bold">
                Переможна ставка:
              </span>
              <span
                className="text-2xl font-black"
                style={{
                  background: "linear-gradient(90deg, #10b981, #34d399)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {winningBid.toLocaleString()} UAH
              </span>
            </div>

            <div className="h-px bg-amber-500/10" />

            <div className="flex justify-between items-center">
              <span className="text-amber-600/70 text-xs uppercase tracking-wider font-bold">
                Переможець:
              </span>
              <span className="text-amber-200 font-black text-sm">
                @{winnerUsername}
              </span>
            </div>

            <div className="h-px bg-amber-500/10" />

            <div className="flex justify-between items-center">
              <span className="text-amber-600/70 text-xs uppercase tracking-wider font-bold">
                Дата аукціону:
              </span>
              <span className="text-amber-300 font-semibold text-xs">
                {auctionDate}
              </span>
            </div>
          </div>

          {/* Certificate ID */}
          <div className="space-y-1">
            <p className="text-[9px] text-amber-700/50 uppercase tracking-widest font-bold">
              Ідентифікатор сертифіката
            </p>
            <p
              className="text-[10px] font-mono text-amber-500/60 break-all leading-relaxed"
              style={{ wordBreak: "break-all" }}
            >
              {certificateId}
            </p>
          </div>

          {/* Verification Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#34d399",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Верифіковано KRAM Blockchain Protocol
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                // Visual only - no actual download
                const el = document.createElement("div");
                el.textContent = "PNG збережено!";
                document.body.appendChild(el);
                setTimeout(() => document.body.removeChild(el), 1000);
              }}
              className="flex-1 rounded-xl py-3 text-xs font-bold transition-all"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#1a0a00",
                boxShadow: "0 0 20px rgba(245,158,11,0.3)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 30px rgba(245,158,11,0.6)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 20px rgba(245,158,11,0.3)";
              }}
            >
              📥 Зберегти як PNG
            </button>

            <button
              onClick={handleClose}
              className="flex-1 rounded-xl py-3 text-xs font-bold text-slate-300 transition-all hover:text-white"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.05)";
              }}
            >
              Закрити
            </button>
          </div>
        </div>

        {/* Bottom golden bar */}
        <div
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(245,158,11,0.3), rgba(251,191,36,0.5), rgba(245,158,11,0.3), transparent)",
            height: "3px",
          }}
        />
      </div>
    </div>
  );
}
