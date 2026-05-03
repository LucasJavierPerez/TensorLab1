import { useMemo } from "react";

type Props = {
  data: number[];
  height?: number;
  stroke?: string;
  fill?: string;
  className?: string;
  showGrid?: boolean;
};

export function AreaSpark({ data, height = 80, stroke = "var(--glow)", fill = "var(--glow)", className = "", showGrid = true }: Props) {
  const w = 300;
  const h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 8) - 4] as const);
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`w-full ${className}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`area-${stroke}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.35" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showGrid && (
        <g stroke="var(--border)" strokeWidth="0.5" opacity="0.7">
          {[0.25, 0.5, 0.75].map((p) => (
            <line key={p} x1="0" x2={w} y1={h * p} y2={h * p} strokeDasharray="2 3" />
          ))}
        </g>
      )}
      <path d={area} fill={`url(#area-${stroke})`} />
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" className="draw-line" />
      {pts.filter((_, i) => i === pts.length - 1).map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill={stroke} />
      ))}
    </svg>
  );
}

export function BarMatrix({ rows = 6, cols = 24, className = "" }: { rows?: number; cols?: number; className?: string }) {
  // deterministic pseudo random
  const cells = Array.from({ length: rows * cols }, (_, i) => {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    return Math.abs(x - Math.floor(x));
  });
  return (
    <div className={`grid gap-[3px] ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
      {cells.map((v, i) => (
        <div
          key={i}
          className="aspect-square rounded-[2px]"
          style={{
            background:
              v > 0.85
                ? "var(--glow)"
                : v > 0.6
                ? "color-mix(in oklab, var(--glow) 55%, transparent)"
                : v > 0.35
                ? "color-mix(in oklab, var(--glow) 22%, transparent)"
                : "color-mix(in oklab, var(--border) 80%, transparent)",
            boxShadow: v > 0.85 ? "0 0 6px var(--glow)" : "none",
          }}
        />
      ))}
    </div>
  );
}

export function RadialGauge({ value, label, size = 96 }: { value: number; label: string; size?: number }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--border)" strokeWidth="4" fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="var(--glow)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={off}
            style={{ transition: "stroke-dashoffset 1.2s ease-out", filter: "drop-shadow(0 0 6px var(--glow))" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="font-display text-lg font-semibold">{value}<span className="text-[10px] text-muted-foreground ml-0.5">%</span></div>
        </div>
      </div>
      <div className="label-tag">{label}</div>
    </div>
  );
}

export function BarSpark({ data, height = 64, className = "" }: { data: number[]; height?: number; className?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  
  return (
    <div className={`flex items-end gap-[2px] w-full ${className}`} style={{ height }}>
      {data.map((v, i) => {
        const h = ((v - min) / range) * 100;
        return (
          <div 
            key={i} 
            className="flex-1 bg-glow/30 rounded-t-[1px] transition-all hover:bg-glow"
            style={{ height: `${Math.max(10, h)}%` }}
          />
        );
      })}
    </div>
  );
}

export function PointMap({ className = "" }: { className?: string }) {
  const points = Array.from({ length: 48 }, (_, i) => {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    return Math.abs(x - Math.floor(x));
  });

  return (
    <div className={`grid grid-cols-8 gap-2 ${className}`}>
      {points.map((v, i) => (
        <div 
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ 
            background: v > 0.7 ? "var(--glow)" : "var(--border)",
            opacity: v > 0.3 ? 0.8 : 0.3,
            boxShadow: v > 0.7 ? "0 0 4px var(--glow)" : "none"
          }}
        />
      ))}
    </div>
  );
}

export function RegressionChart({ height = 64, className = "" }: { height?: number; className?: string }) {
  const data = useMemo(() => Array.from({ length: 24 }, (_, i) => 
    15 + i * 1.5 + Math.sin(i * 0.5) * 4 + (Math.random() - 0.5) * 3
  ), []);

  const w = 300;
  const h = height;
  const max = Math.max(...data) + 10;
  const min = Math.min(...data) - 10;
  const range = max - min;
  const step = w / (data.length - 1);
  
  const points = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 8) - 4]);
  const linePath = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  
  const confidenceUpper = points.map(p => [p[0], p[1] - 10]);
  const confidenceLower = points.map(p => [p[0], p[1] + 10]);
  
  const areaPath = `
    ${confidenceUpper.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ")}
    ${confidenceLower.reverse().map((p) => `L${p[0]},${p[1]}`).join(" ")}
    Z
  `;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex justify-between items-center px-1">
        <span className="text-[9px] font-mono-data text-muted-foreground uppercase">Regresión Lineal</span>
        <span className="text-[9px] font-mono-data text-glow">CI 95%</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
        <path d={areaPath} fill="var(--glow)" fillOpacity="0.12" />
        <path d={linePath} fill="none" stroke="var(--glow)" strokeWidth="1.5" strokeLinecap="round" />
        {points.filter((_, i) => i % 6 === 0).map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="2" fill="var(--background)" stroke="var(--glow)" strokeWidth="1" />
        ))}
      </svg>
    </div>
  );
}

export function ScatterClusteringChart({ height = 64, className = "" }: { height?: number; className?: string }) {
  const points = useMemo(() => {
    const centers = [
      { x: 60, y: 20 },
      { x: 150, y: 45 },
      { x: 240, y: 25 }
    ];
    return Array.from({ length: 40 }, (_, i) => {
      const cluster = i % 3;
      return {
        x: centers[cluster].x + (Math.random() - 0.5) * 50,
        y: centers[cluster].y + (Math.random() - 0.5) * 30,
        cluster
      };
    });
  }, []);
  
  const colors = ["var(--glow)", "#3b82f6", "#a855f7"];

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex justify-between items-center px-1">
        <span className="text-[9px] font-mono-data text-muted-foreground uppercase">Clustering K-Means</span>
        <span className="text-[9px] font-mono-data text-muted-foreground">k=3</span>
      </div>
      <svg viewBox="0 0 300 64" className="w-full h-full" preserveAspectRatio="none">
        <g opacity="0.1">
          <line x1="0" y1="32" x2="300" y2="32" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1="150" y1="0" x2="150" y2="64" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 2" />
        </g>
        {points.map((p, i) => (
          <circle 
            key={i} 
            cx={p.x} 
            cy={p.y} 
            r="2.5" 
            fill={colors[p.cluster]} 
            fillOpacity="0.7"
          />
        ))}
      </svg>
    </div>
  );
}
