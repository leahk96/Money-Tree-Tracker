import { motion } from "framer-motion";

interface MoneyTreeSVGProps {
  goalsMetThisYear: number;
}

interface LeafGroup {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill: string;
}

interface Coin {
  x: number;
  y: number;
}

const STAGES: { leaves: LeafGroup[]; coins: Coin[] }[] = [
  // Stage 0 — just a pot, no foliage
  { leaves: [], coins: [] },

  // Stage 1 — tiny seedling
  {
    leaves: [
      { cx: 180, cy: 188, rx: 18, ry: 14, fill: "#3a9a3a" },
      { cx: 168, cy: 196, rx: 12, ry: 10, fill: "#44aa44" },
      { cx: 192, cy: 194, rx: 12, ry: 10, fill: "#44aa44" },
    ],
    coins: [{ x: 180, y: 178 }, { x: 170, y: 188 }],
  },

  // Stage 2 — small bush
  {
    leaves: [
      { cx: 180, cy: 175, rx: 28, ry: 22, fill: "#2d7a2d" },
      { cx: 160, cy: 185, rx: 20, ry: 16, fill: "#358a35" },
      { cx: 200, cy: 183, rx: 20, ry: 16, fill: "#358a35" },
      { cx: 180, cy: 162, rx: 22, ry: 18, fill: "#3da03d" },
      { cx: 165, cy: 195, rx: 16, ry: 12, fill: "#45b045" },
      { cx: 195, cy: 193, rx: 16, ry: 12, fill: "#45b045" },
    ],
    coins: [
      { x: 162, y: 170 }, { x: 198, y: 173 },
      { x: 180, y: 157 }, { x: 172, y: 182 }, { x: 188, y: 181 },
    ],
  },

  // Stage 3 — medium tree
  {
    leaves: [
      { cx: 180, cy: 165, rx: 36, ry: 28, fill: "#267026" },
      { cx: 152, cy: 175, rx: 26, ry: 20, fill: "#2d7a2d" },
      { cx: 208, cy: 173, rx: 26, ry: 20, fill: "#2d7a2d" },
      { cx: 180, cy: 148, rx: 30, ry: 24, fill: "#38983a" },
      { cx: 158, cy: 157, rx: 20, ry: 16, fill: "#3da03d" },
      { cx: 202, cy: 155, rx: 20, ry: 16, fill: "#3da03d" },
      { cx: 138, cy: 178, rx: 20, ry: 15, fill: "#2a722a" },
      { cx: 222, cy: 176, rx: 20, ry: 15, fill: "#2a722a" },
      { cx: 180, cy: 200, rx: 28, ry: 14, fill: "#235a23" },
    ],
    coins: [
      { x: 155, y: 162 }, { x: 205, y: 160 }, { x: 180, y: 140 },
      { x: 168, y: 153 }, { x: 192, y: 152 }, { x: 142, y: 172 },
      { x: 218, y: 170 }, { x: 170, y: 195 }, { x: 190, y: 194 },
    ],
  },

  // Stage 4 — large tree
  {
    leaves: [
      { cx: 180, cy: 150, rx: 44, ry: 34, fill: "#246024" },
      { cx: 144, cy: 162, rx: 30, ry: 24, fill: "#2a722a" },
      { cx: 216, cy: 160, rx: 30, ry: 24, fill: "#2a722a" },
      { cx: 180, cy: 130, rx: 36, ry: 28, fill: "#3aa03a" },
      { cx: 152, cy: 140, rx: 24, ry: 19, fill: "#3da03d" },
      { cx: 208, cy: 138, rx: 24, ry: 19, fill: "#3da03d" },
      { cx: 122, cy: 168, rx: 24, ry: 18, fill: "#267026" },
      { cx: 238, cy: 166, rx: 24, ry: 18, fill: "#267026" },
      { cx: 130, cy: 190, rx: 22, ry: 14, fill: "#246024" },
      { cx: 230, cy: 188, rx: 22, ry: 14, fill: "#246024" },
      { cx: 180, cy: 200, rx: 36, ry: 16, fill: "#204a20" },
    ],
    coins: [
      { x: 148, y: 147 }, { x: 212, y: 145 }, { x: 180, y: 122 },
      { x: 158, y: 133 }, { x: 202, y: 131 }, { x: 126, y: 162 },
      { x: 234, y: 160 }, { x: 133, y: 185 }, { x: 227, y: 183 },
      { x: 165, y: 195 }, { x: 195, y: 195 }, { x: 180, y: 202 }, { x: 170, y: 138 },
    ],
  },

  // Stage 5 — very large
  {
    leaves: [
      { cx: 180, cy: 135, rx: 52, ry: 40, fill: "#225822" },
      { cx: 136, cy: 150, rx: 35, ry: 27, fill: "#267026" },
      { cx: 224, cy: 148, rx: 35, ry: 27, fill: "#267026" },
      { cx: 180, cy: 112, rx: 40, ry: 32, fill: "#3da03d" },
      { cx: 146, cy: 124, rx: 28, ry: 22, fill: "#38983a" },
      { cx: 214, cy: 122, rx: 28, ry: 22, fill: "#38983a" },
      { cx: 108, cy: 158, rx: 26, ry: 20, fill: "#246024" },
      { cx: 252, cy: 156, rx: 26, ry: 20, fill: "#246024" },
      { cx: 116, cy: 182, rx: 24, ry: 16, fill: "#225822" },
      { cx: 244, cy: 180, rx: 24, ry: 16, fill: "#225822" },
      { cx: 180, cy: 205, rx: 44, ry: 18, fill: "#1a4a1a" },
      { cx: 155, cy: 200, rx: 24, ry: 13, fill: "#204a20" },
      { cx: 205, cy: 200, rx: 24, ry: 13, fill: "#204a20" },
    ],
    coins: [
      { x: 140, y: 135 }, { x: 220, y: 133 }, { x: 180, y: 105 },
      { x: 152, y: 117 }, { x: 208, y: 115 }, { x: 112, y: 152 },
      { x: 248, y: 150 }, { x: 120, y: 176 }, { x: 240, y: 174 },
      { x: 162, y: 196 }, { x: 198, y: 196 }, { x: 180, y: 140 },
      { x: 166, y: 125 }, { x: 194, y: 124 }, { x: 180, y: 112 },
      { x: 128, y: 165 }, { x: 232, y: 163 }, { x: 180, y: 200 },
    ],
  },

  // Stage 6 — full money tree
  {
    leaves: [
      { cx: 180, cy: 120, rx: 60, ry: 46, fill: "#204a20" },
      { cx: 128, cy: 138, rx: 40, ry: 30, fill: "#246024" },
      { cx: 232, cy: 136, rx: 40, ry: 30, fill: "#246024" },
      { cx: 180, cy: 96, rx: 44, ry: 35, fill: "#42a842" },
      { cx: 136, cy: 110, rx: 32, ry: 25, fill: "#3da03d" },
      { cx: 224, cy: 108, rx: 32, ry: 25, fill: "#3da03d" },
      { cx: 96, cy: 148, rx: 28, ry: 21, fill: "#225822" },
      { cx: 264, cy: 146, rx: 28, ry: 21, fill: "#225822" },
      { cx: 104, cy: 174, rx: 26, ry: 17, fill: "#204a20" },
      { cx: 256, cy: 172, rx: 26, ry: 17, fill: "#204a20" },
      { cx: 180, cy: 208, rx: 50, ry: 18, fill: "#183818" },
      { cx: 150, cy: 202, rx: 28, ry: 14, fill: "#1a4a1a" },
      { cx: 210, cy: 202, rx: 28, ry: 14, fill: "#1a4a1a" },
      { cx: 112, cy: 196, rx: 20, ry: 12, fill: "#204a20" },
      { cx: 248, cy: 194, rx: 20, ry: 12, fill: "#204a20" },
    ],
    coins: [
      { x: 133, y: 122 }, { x: 227, y: 120 }, { x: 180, y: 88 },
      { x: 144, y: 103 }, { x: 216, y: 101 }, { x: 100, y: 142 },
      { x: 260, y: 140 }, { x: 108, y: 168 }, { x: 252, y: 166 },
      { x: 156, y: 196 }, { x: 204, y: 196 }, { x: 180, y: 125 },
      { x: 162, y: 108 }, { x: 198, y: 107 }, { x: 116, y: 186 },
      { x: 244, y: 184 }, { x: 180, y: 100 }, { x: 148, y: 130 },
      { x: 212, y: 128 }, { x: 164, y: 88 }, { x: 196, y: 87 }, { x: 180, y: 205 },
    ],
  },
];

export function MoneyTreeSVG({ goalsMetThisYear }: MoneyTreeSVGProps) {
  const stage = Math.min(6,
    goalsMetThisYear === 0 ? 0
    : goalsMetThisYear <= 2 ? 1
    : goalsMetThisYear <= 4 ? 2
    : goalsMetThisYear <= 6 ? 3
    : goalsMetThisYear <= 8 ? 4
    : goalsMetThisYear <= 10 ? 5
    : 6
  );

  const { leaves, coins } = STAGES[stage];

  return (
    <svg viewBox="0 0 360 310" className="w-full max-w-xs mx-auto">
      {/* Ground shadow */}
      <ellipse cx={180} cy={298} rx={50} ry={8} fill="#c17d3c" opacity={0.2} />

      {/* Pot */}
      <path d="M148 268 L158 296 Q180 304 202 296 L212 268 Z" fill="#c17d3c" />
      <rect x={142} y={263} width={76} height={11} rx={4} fill="#a0602a" />
      {/* Soil */}
      <ellipse cx={180} cy={269} rx={34} ry={5} fill="#6b4423" />

      {/* Trunk */}
      <motion.path
        d="M170 267 Q166 245 164 210 Q162 180 166 158 Q170 138 180 128 Q190 138 194 158 Q198 180 196 210 Q194 245 190 267 Z"
        fill="#8B5E3C"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ transformOrigin: "180px 267px" }}
      />
      {/* Trunk shading */}
      {stage >= 1 && (
        <>
          <path d="M174 245 Q172 228 173 208" stroke="#6b4a2e" strokeWidth={1.5} fill="none" opacity={0.4} />
          <path d="M186 245 Q188 228 187 208" stroke="#6b4a2e" strokeWidth={1.5} fill="none" opacity={0.4} />
        </>
      )}

      {/* Leaves — render all at once, fade in */}
      {leaves.map((leaf, i) => (
        <motion.ellipse
          key={`${stage}-leaf-${i}`}
          cx={leaf.cx} cy={leaf.cy} rx={leaf.rx} ry={leaf.ry}
          fill={leaf.fill}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.04 }}
        />
      ))}

      {/* Gentle sway overlay for top leaves using a subtle rotate */}
      {stage >= 1 && (
        <motion.g
          animate={{ rotate: [0, 1.2, 0, -1.2, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "180px 265px" }}
        >
          {/* This group is invisible — sway is purely cosmetic, applied via transform */}
        </motion.g>
      )}

      {/* Gold coins */}
      {coins.map((coin, i) => (
        <motion.g
          key={`${stage}-coin-${i}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 + i * 0.06, type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformOrigin: `${coin.x}px ${coin.y}px` }}
        >
          <circle cx={coin.x} cy={coin.y} r={9} fill="#FFD700" />
          <circle cx={coin.x} cy={coin.y} r={7} fill="#FFA500" opacity={0.4} />
          <text
            x={coin.x} y={coin.y + 4}
            textAnchor="middle"
            fontSize={9}
            fontWeight="bold"
            fill="#7a4e00"
            style={{ fontFamily: "serif" }}
          >
            £
          </text>
        </motion.g>
      ))}

      {/* Stage 0 sprout */}
      {stage === 0 && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <motion.path
            d="M180 240 Q180 228 180 218"
            stroke="#3a9a3a" strokeWidth={3} fill="none" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
          <motion.ellipse
            cx={175} cy={215} rx={9} ry={6} fill="#3a9a3a"
            transform="rotate(-30 175 215)"
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            style={{ transformOrigin: "175px 215px" }}
          />
          <motion.ellipse
            cx={185} cy={212} rx={9} ry={6} fill="#44aa44"
            transform="rotate(30 185 212)"
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            style={{ transformOrigin: "185px 212px" }}
          />
        </motion.g>
      )}
    </svg>
  );
}
