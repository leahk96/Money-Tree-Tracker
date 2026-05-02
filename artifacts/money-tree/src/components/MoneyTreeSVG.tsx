import { motion } from "framer-motion";

interface MoneyTreeSVGProps {
  /** Number of months this year where savings goal was met (0–12) */
  monthsGoalMet: number;
}

interface Leaf {
  cx: number; cy: number; rx: number; ry: number;
  rotate?: number; fill: string;
}

// Each stage adds more leaves and grows the canopy
const STAGES: Leaf[][] = [
  // Stage 0 — pot only, tiny sprout rendered separately
  [],

  // Stage 1 — seedling (1–2 months)
  [
    { cx: 180, cy: 192, rx: 16, ry: 12, fill: "#3da03d" },
    { cx: 170, cy: 198, rx: 11, ry: 8, rotate: -25, fill: "#45b045" },
    { cx: 190, cy: 196, rx: 11, ry: 8, rotate: 25, fill: "#45b045" },
  ],

  // Stage 2 — small (3–4 months)
  [
    { cx: 180, cy: 178, rx: 28, ry: 20, fill: "#2d8a2d" },
    { cx: 162, cy: 188, rx: 18, ry: 14, rotate: -15, fill: "#358a35" },
    { cx: 198, cy: 186, rx: 18, ry: 14, rotate: 15, fill: "#358a35" },
    { cx: 180, cy: 165, rx: 22, ry: 17, fill: "#3da03d" },
    { cx: 168, cy: 197, rx: 14, ry: 10, fill: "#44aa44" },
    { cx: 192, cy: 195, rx: 14, ry: 10, fill: "#44aa44" },
  ],

  // Stage 3 — medium (5–6 months)
  [
    { cx: 180, cy: 168, rx: 36, ry: 26, fill: "#267826" },
    { cx: 153, cy: 180, rx: 24, ry: 18, rotate: -10, fill: "#2d8a2d" },
    { cx: 207, cy: 178, rx: 24, ry: 18, rotate: 10, fill: "#2d8a2d" },
    { cx: 180, cy: 150, rx: 28, ry: 22, fill: "#38a038" },
    { cx: 160, cy: 160, rx: 18, ry: 14, fill: "#3da03d" },
    { cx: 200, cy: 158, rx: 18, ry: 14, fill: "#3da03d" },
    { cx: 138, cy: 184, rx: 18, ry: 13, rotate: -18, fill: "#267826" },
    { cx: 222, cy: 182, rx: 18, ry: 13, rotate: 18, fill: "#267826" },
    { cx: 180, cy: 202, rx: 28, ry: 13, fill: "#204a20" },
  ],

  // Stage 4 — large (7–8 months)
  [
    { cx: 180, cy: 153, rx: 46, ry: 34, fill: "#246024" },
    { cx: 144, cy: 167, rx: 30, ry: 23, rotate: -8, fill: "#2a7a2a" },
    { cx: 216, cy: 165, rx: 30, ry: 23, rotate: 8, fill: "#2a7a2a" },
    { cx: 180, cy: 132, rx: 34, ry: 27, fill: "#3aa03a" },
    { cx: 152, cy: 143, rx: 22, ry: 17, fill: "#3da03d" },
    { cx: 208, cy: 141, rx: 22, ry: 17, fill: "#3da03d" },
    { cx: 120, cy: 172, rx: 22, ry: 16, rotate: -20, fill: "#246024" },
    { cx: 240, cy: 170, rx: 22, ry: 16, rotate: 20, fill: "#246024" },
    { cx: 127, cy: 194, rx: 18, ry: 12, rotate: -25, fill: "#204a20" },
    { cx: 233, cy: 192, rx: 18, ry: 12, rotate: 25, fill: "#204a20" },
    { cx: 180, cy: 205, rx: 38, ry: 16, fill: "#1a4a1a" },
    { cx: 155, cy: 200, rx: 22, ry: 12, fill: "#204a20" },
    { cx: 205, cy: 200, rx: 22, ry: 12, fill: "#204a20" },
  ],

  // Stage 5 — very large (9–10 months)
  [
    { cx: 180, cy: 138, rx: 54, ry: 40, fill: "#225822" },
    { cx: 134, cy: 155, rx: 36, ry: 27, rotate: -6, fill: "#266826" },
    { cx: 226, cy: 153, rx: 36, ry: 27, rotate: 6, fill: "#266826" },
    { cx: 180, cy: 113, rx: 40, ry: 32, fill: "#3ea83e" },
    { cx: 144, cy: 126, rx: 28, ry: 21, fill: "#38a038" },
    { cx: 216, cy: 124, rx: 28, ry: 21, fill: "#38a038" },
    { cx: 104, cy: 163, rx: 26, ry: 19, rotate: -22, fill: "#225822" },
    { cx: 256, cy: 161, rx: 26, ry: 19, rotate: 22, fill: "#225822" },
    { cx: 112, cy: 188, rx: 22, ry: 14, rotate: -28, fill: "#1e4a1e" },
    { cx: 248, cy: 186, rx: 22, ry: 14, rotate: 28, fill: "#1e4a1e" },
    { cx: 180, cy: 208, rx: 46, ry: 17, fill: "#183818" },
    { cx: 148, cy: 202, rx: 26, ry: 13, fill: "#1a4a1a" },
    { cx: 212, cy: 202, rx: 26, ry: 13, fill: "#1a4a1a" },
    { cx: 116, cy: 200, rx: 18, ry: 10, fill: "#204a20" },
    { cx: 244, cy: 198, rx: 18, ry: 10, fill: "#204a20" },
  ],

  // Stage 6 — full money tree (11–12 months)
  [
    { cx: 180, cy: 122, rx: 62, ry: 47, fill: "#1e5020" },
    { cx: 124, cy: 142, rx: 42, ry: 32, rotate: -5, fill: "#246024" },
    { cx: 236, cy: 140, rx: 42, ry: 32, rotate: 5, fill: "#246024" },
    { cx: 180, cy: 95, rx: 46, ry: 36, fill: "#44b044" },
    { cx: 136, cy: 110, rx: 32, ry: 25, fill: "#3aa03a" },
    { cx: 224, cy: 108, rx: 32, ry: 25, fill: "#3aa03a" },
    { cx: 90, cy: 152, rx: 28, ry: 21, rotate: -24, fill: "#1e5020" },
    { cx: 270, cy: 150, rx: 28, ry: 21, rotate: 24, fill: "#1e5020" },
    { cx: 98, cy: 180, rx: 24, ry: 15, rotate: -30, fill: "#183818" },
    { cx: 262, cy: 178, rx: 24, ry: 15, rotate: 30, fill: "#183818" },
    { cx: 180, cy: 210, rx: 54, ry: 18, fill: "#142814" },
    { cx: 144, cy: 204, rx: 30, ry: 14, fill: "#183818" },
    { cx: 216, cy: 204, rx: 30, ry: 14, fill: "#183818" },
    { cx: 108, cy: 200, rx: 22, ry: 12, fill: "#1e4a1e" },
    { cx: 252, cy: 198, rx: 22, ry: 12, fill: "#1e4a1e" },
    { cx: 164, cy: 86, rx: 22, ry: 17, fill: "#50c050" },
    { cx: 196, cy: 84, rx: 22, ry: 17, fill: "#50c050" },
  ],
];

// Money leaf vein lines — decorative lines on leaves to make them look like currency notes
function LeafVeins({ leaves }: { leaves: Leaf[] }) {
  // Only draw on larger leaves
  return (
    <>
      {leaves.filter(l => l.rx > 25).slice(0, 5).map((leaf, i) => (
        <g key={i} transform={`translate(${leaf.cx},${leaf.cy}) rotate(${leaf.rotate ?? 0})`}>
          <line x1={0} y1={-leaf.ry * 0.5} x2={0} y2={leaf.ry * 0.5} stroke="rgba(0,0,0,0.07)" strokeWidth={0.8} />
          <line x1={-leaf.rx * 0.3} y1={0} x2={leaf.rx * 0.3} y2={0} stroke="rgba(0,0,0,0.07)" strokeWidth={0.6} />
        </g>
      ))}
    </>
  );
}

export function MoneyTreeSVG({ monthsGoalMet }: MoneyTreeSVGProps) {
  const stage = monthsGoalMet === 0 ? 0
    : monthsGoalMet <= 2 ? 1
    : monthsGoalMet <= 4 ? 2
    : monthsGoalMet <= 6 ? 3
    : monthsGoalMet <= 8 ? 4
    : monthsGoalMet <= 10 ? 5
    : 6;

  const leaves = STAGES[stage];

  return (
    <svg viewBox="0 0 360 310" className="w-full max-w-xs mx-auto select-none">
      {/* Ground shadow */}
      <ellipse cx={180} cy={299} rx={52} ry={8} fill="#b06830" opacity={0.18} />

      {/* Pot */}
      <path d="M148 268 L158 296 Q180 304 202 296 L212 268 Z" fill="#c17d3c" />
      <rect x={142} y={263} width={76} height={11} rx={4} fill="#a0602a" />
      {/* Pot highlight */}
      <rect x={148} y={264} width={28} height={4} rx={2} fill="rgba(255,255,255,0.2)" />
      {/* Soil */}
      <ellipse cx={180} cy={269} rx={34} ry={5} fill="#6b4423" />

      {/* Trunk */}
      <motion.g
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ transformOrigin: "180px 268px" }}
      >
        <path d="M170 267 Q167 246 165 212 Q163 182 166 160 Q170 140 180 130 Q190 140 194 160 Q197 182 195 212 Q193 246 190 267 Z" fill="#8B5E3C" />
        {/* Trunk highlight */}
        <path d="M172 240 Q170 220 171 200 Q171 180 173 163" stroke="rgba(255,200,140,0.3)" strokeWidth={3} fill="none" strokeLinecap="round" />
        {/* Trunk shading */}
        <path d="M186 240 Q188 220 187 200" stroke="rgba(0,0,0,0.1)" strokeWidth={1.5} fill="none" />
      </motion.g>

      {/* Leaves */}
      {leaves.map((leaf, i) => (
        <motion.ellipse
          key={`s${stage}-l${i}`}
          cx={leaf.cx} cy={leaf.cy} rx={leaf.rx} ry={leaf.ry}
          fill={leaf.fill}
          transform={leaf.rotate ? `rotate(${leaf.rotate} ${leaf.cx} ${leaf.cy})` : undefined}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05 + i * 0.04, ease: "easeOut" }}
          style={{ transformOrigin: `${leaf.cx}px ${leaf.cy}px` }}
        />
      ))}

      {/* Leaf veins for texture */}
      {stage >= 2 && <LeafVeins leaves={leaves} />}

      {/* Gentle sway animation on leaves */}
      {stage >= 1 && (
        <motion.g
          animate={{ rotate: [0, 0.8, 0, -0.8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "180px 265px" }}
        >
          {/* invisible — sway is applied to the overall tree via parent transform */}
        </motion.g>
      )}

      {/* Stage 0 — small sprout */}
      {stage === 0 && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
          <motion.path
            d="M180 246 Q180 232 180 220"
            stroke="#3a9a3a" strokeWidth={2.5} fill="none" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />
          <motion.ellipse cx={174} cy={216} rx={9} ry={6} fill="#3a9a3a"
            transform="rotate(-35 174 216)"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            style={{ transformOrigin: "174px 216px" }}
          />
          <motion.ellipse cx={186} cy={213} rx={9} ry={6} fill="#44aa44"
            transform="rotate(35 186 213)"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 1.0 }}
            style={{ transformOrigin: "186px 213px" }}
          />
        </motion.g>
      )}

      {/* "Full tree" sparkles */}
      {stage === 6 && (
        <>
          {[{ x: 124, y: 100 }, { x: 236, y: 98 }, { x: 180, y: 78 }, { x: 100, y: 148 }, { x: 260, y: 146 }].map((s, i) => (
            <motion.text
              key={i} x={s.x} y={s.y}
              textAnchor="middle" fontSize={11}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
              style={{ transformOrigin: `${s.x}px ${s.y}px` }}
            >
              ✨
            </motion.text>
          ))}
        </>
      )}
    </svg>
  );
}
