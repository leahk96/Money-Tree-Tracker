import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";

interface MoneyTreeSVGProps {
  /** Number of months this year where savings goal was met (0–12) */
  monthsGoalMet: number;
  /** If true, plays a celebration animation whenever monthsGoalMet increases */
  celebrateOnChange?: boolean;
}

// ── Pot & soil ────────────────────────────────────────────────────────────────
function PotSVG() {
  return (
    <g>
      <ellipse cx={180} cy={334} rx={52} ry={7} fill="#757575" opacity={0.12} />
      <path d="M149 272 L157 304 Q180 314 203 304 L211 272 Z" fill="#9e9e9e" />
      <path d="M151 283 L153 292 Q180 298 207 292 L209 283 Z" fill="rgba(0,0,0,0.07)" />
      <rect x={141} y={265} width={78} height={12} rx={5} fill="#757575" />
      <rect x={148} y={266} width={32} height={4} rx={2} fill="rgba(255,210,150,0.3)" />
      <ellipse cx={180} cy={271} rx={34} ry={6} fill="#546e7a" />
      <ellipse cx={172} cy={269} rx={11} ry={2.5} fill="#6a3c1a" opacity={0.6} />
    </g>
  );
}

// ── Trunk ─────────────────────────────────────────────────────────────────────
const TRUNK_TOP: number[] = [271, 244, 236, 225, 214, 202, 191, 180, 168, 152, 134, 115, 96];

function TrunkSVG({ stage }: { stage: number }) {
  const ty = TRUNK_TOP[stage] ?? 136;
  const hasLargeBranches = stage >= 6;
  const hasMidBranches   = stage >= 4;
  const hasHighBranches  = stage >= 8;

  return (
    <motion.g
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      style={{ transformOrigin: "180px 270px" }}
    >
      <path
        d={`M174 270 C172 248 171 220 172 ${ty+22} C173 ${ty+9} 176 ${ty+1} 180 ${ty-2} C184 ${ty+1} 187 ${ty+9} 188 ${ty+22} C189 220 188 248 186 270 Z`}
        fill="#7a5230"
      />
      <path
        d={`M175.5 260 C174 238 173.5 212 174 ${ty+28}`}
        stroke="rgba(240,190,120,0.22)" strokeWidth={2.5} fill="none" strokeLinecap="round"
      />
      <path
        d={`M183.5 255 C185 234 185 214 184.5 ${ty+32}`}
        stroke="rgba(0,0,0,0.09)" strokeWidth={1.8} fill="none" strokeLinecap="round"
      />

      {hasMidBranches && (
        <>
          <path d="M173 228 Q157 212 140 206" stroke="#7a5230" strokeWidth={5.5} fill="none" strokeLinecap="round" />
          <path d="M187 228 Q203 212 220 206" stroke="#7a5230" strokeWidth={5.5} fill="none" strokeLinecap="round" />
        </>
      )}
      {hasLargeBranches && (
        <>
          <path d="M172 248 Q148 238 128 237" stroke="#7a5230" strokeWidth={4.5} fill="none" strokeLinecap="round" />
          <path d="M188 248 Q212 238 232 237" stroke="#7a5230" strokeWidth={4.5} fill="none" strokeLinecap="round" />
          <path d="M174 210 Q158 192 144 182" stroke="#6a4828" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <path d="M186 210 Q202 192 216 182" stroke="#6a4828" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </>
      )}
      {hasHighBranches && (
        <>
          <path d="M175 190 Q152 172 132 162" stroke="#6a4828" strokeWidth={3}   fill="none" strokeLinecap="round" />
          <path d="M185 190 Q208 172 228 162" stroke="#6a4828" strokeWidth={3}   fill="none" strokeLinecap="round" />
          <path d="M176 170 Q155 148 138 136" stroke="#5e4020" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <path d="M184 170 Q205 148 222 136" stroke="#5e4020" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </>
      )}
    </motion.g>
  );
}

// ── Canopy clusters ───────────────────────────────────────────────────────────
type C = { cx: number; cy: number; r: number; fill: string };

const CANOPIES: C[][] = [
  [],
  [
    { cx:180, cy:230, r:16, fill:"#035c37" },
    { cx:171, cy:221, r:11, fill:"#035c37" },
    { cx:189, cy:221, r:11, fill:"#035c37" },
    { cx:180, cy:214, r:12, fill:"#38a838" },
    { cx:175, cy:216, r:8,  fill:"#46b446" },
    { cx:186, cy:215, r:8,  fill:"#46b446" },
  ],
  [
    { cx:180, cy:223, r:21, fill:"#035c37" },
    { cx:166, cy:213, r:15, fill:"#226822" },
    { cx:194, cy:213, r:15, fill:"#226822" },
    { cx:180, cy:204, r:17, fill:"#035c37" },
    { cx:170, cy:207, r:11, fill:"#36a036" },
    { cx:191, cy:207, r:11, fill:"#36a036" },
    { cx:180, cy:196, r:13, fill:"#42ae42" },
  ],
  [
    { cx:180, cy:214, r:27, fill:"#1a5020" },
    { cx:160, cy:202, r:18, fill:"#206820" },
    { cx:200, cy:202, r:18, fill:"#206820" },
    { cx:180, cy:192, r:21, fill:"#277027" },
    { cx:163, cy:197, r:14, fill:"#309830" },
    { cx:197, cy:197, r:14, fill:"#309830" },
    { cx:180, cy:183, r:16, fill:"#3ca43c" },
    { cx:169, cy:187, r:10, fill:"#48b248" },
    { cx:192, cy:186, r:10, fill:"#48b248" },
  ],
  [
    { cx:180, cy:205, r:33, fill:"#184818" },
    { cx:155, cy:191, r:22, fill:"#035c37" },
    { cx:205, cy:191, r:22, fill:"#035c37" },
    { cx:180, cy:179, r:26, fill:"#247824" },
    { cx:157, cy:185, r:17, fill:"#2e9030" },
    { cx:203, cy:185, r:17, fill:"#2e9030" },
    { cx:180, cy:168, r:20, fill:"#389838" },
    { cx:164, cy:173, r:13, fill:"#42aa42" },
    { cx:196, cy:173, r:13, fill:"#42aa42" },
    { cx:180, cy:160, r:15, fill:"#4cb44c" },
  ],
  [
    { cx:180, cy:196, r:39, fill:"#163a18" },
    { cx:149, cy:181, r:27, fill:"#1c5620" },
    { cx:211, cy:181, r:27, fill:"#1c5620" },
    { cx:180, cy:167, r:30, fill:"#226c24" },
    { cx:153, cy:174, r:21, fill:"#298630" },
    { cx:207, cy:174, r:21, fill:"#298630" },
    { cx:180, cy:155, r:22, fill:"#329432" },
    { cx:161, cy:161, r:15, fill:"#3ea43e" },
    { cx:199, cy:161, r:15, fill:"#3ea43e" },
    { cx:180, cy:145, r:16, fill:"#0ead69" },
    { cx:128, cy:188, r:18, fill:"#163a18" },
    { cx:232, cy:188, r:18, fill:"#163a18" },
  ],
  [
    { cx:180, cy:187, r:45, fill:"#143218" },
    { cx:143, cy:169, r:31, fill:"#035c37" },
    { cx:217, cy:169, r:31, fill:"#035c37" },
    { cx:180, cy:154, r:36, fill:"#035c37" },
    { cx:148, cy:162, r:24, fill:"#267e28" },
    { cx:212, cy:162, r:24, fill:"#267e28" },
    { cx:180, cy:141, r:27, fill:"#2e8e2e" },
    { cx:156, cy:148, r:18, fill:"#0ead69" },
    { cx:204, cy:148, r:18, fill:"#0ead69" },
    { cx:180, cy:130, r:20, fill:"#42ae42" },
    { cx:122, cy:181, r:22, fill:"#143218" },
    { cx:238, cy:181, r:22, fill:"#143218" },
    { cx:126, cy:200, r:15, fill:"#101e12" },
    { cx:234, cy:200, r:15, fill:"#101e12" },
  ],
  [
    { cx:180, cy:178, r:52, fill:"#122c14" },
    { cx:136, cy:158, r:36, fill:"#184820" },
    { cx:224, cy:158, r:36, fill:"#184820" },
    { cx:180, cy:143, r:41, fill:"#035c37" },
    { cx:143, cy:152, r:28, fill:"#247828" },
    { cx:217, cy:152, r:28, fill:"#247828" },
    { cx:180, cy:128, r:32, fill:"#2c8c2c" },
    { cx:152, cy:136, r:22, fill:"#369836" },
    { cx:208, cy:136, r:22, fill:"#369836" },
    { cx:180, cy:116, r:23, fill:"#40ac40" },
    { cx:114, cy:174, r:26, fill:"#122c14" },
    { cx:246, cy:174, r:26, fill:"#122c14" },
    { cx:118, cy:197, r:18, fill:"#0e1e10" },
    { cx:242, cy:197, r:18, fill:"#0e1e10" },
  ],
  [
    { cx:180, cy:168, r:58, fill:"#102614" },
    { cx:130, cy:147, r:40, fill:"#164020" },
    { cx:230, cy:147, r:40, fill:"#164020" },
    { cx:180, cy:131, r:47, fill:"#035c37" },
    { cx:136, cy:141, r:32, fill:"#226e28" },
    { cx:224, cy:141, r:32, fill:"#226e28" },
    { cx:180, cy:114, r:37, fill:"#2a8428" },
    { cx:148, cy:123, r:25, fill:"#349234" },
    { cx:212, cy:123, r:25, fill:"#349234" },
    { cx:180, cy:101, r:27, fill:"#3ea83e" },
    { cx:107, cy:163, r:28, fill:"#102614" },
    { cx:253, cy:163, r:28, fill:"#102614" },
    { cx:110, cy:188, r:21, fill:"#0c1c0e" },
    { cx:250, cy:188, r:21, fill:"#0c1c0e" },
    { cx:152, cy:107, r:18, fill:"#0ead69" },
    { cx:208, cy:105, r:18, fill:"#0ead69" },
  ],
  [
    { cx:180, cy:150, r:75, fill:"#0e2012" },
    { cx:118, cy:126, r:53, fill:"#143a18" },
    { cx:242, cy:126, r:53, fill:"#143a18" },
    { cx:180, cy:108, r:63, fill:"#035c37" },
    { cx:124, cy:120, r:43, fill:"#206622" },
    { cx:236, cy:120, r:43, fill:"#206622" },
    { cx:180, cy:84,  r:50, fill:"#287c28" },
    { cx:138, cy:96,  r:35, fill:"#329032" },
    { cx:222, cy:96,  r:35, fill:"#329032" },
    { cx:180, cy:68,  r:38, fill:"#3ca43c" },
    { cx:92,  cy:146, r:38, fill:"#0e2012" },
    { cx:268, cy:146, r:38, fill:"#0e2012" },
    { cx:95,  cy:175, r:28, fill:"#0a180c" },
    { cx:265, cy:175, r:28, fill:"#0a180c" },
    { cx:144, cy:73,  r:26, fill:"#44b044" },
    { cx:216, cy:71,  r:26, fill:"#44b044" },
  ],
  [
    { cx:180, cy:138, r:88, fill:"#0c1c10" },
    { cx:107, cy:111, r:63, fill:"#123212" },
    { cx:253, cy:111, r:63, fill:"#123212" },
    { cx:180, cy:90,  r:74, fill:"#184e18" },
    { cx:114, cy:104, r:52, fill:"#035c37" },
    { cx:246, cy:104, r:52, fill:"#035c37" },
    { cx:180, cy:62,  r:58, fill:"#267426" },
    { cx:128, cy:75,  r:42, fill:"#2e8a2e" },
    { cx:232, cy:75,  r:42, fill:"#2e8a2e" },
    { cx:180, cy:44,  r:42, fill:"#0ead69" },
    { cx:78,  cy:132, r:44, fill:"#0c1c10" },
    { cx:282, cy:132, r:44, fill:"#0c1c10" },
    { cx:80,  cy:163, r:33, fill:"#08140a" },
    { cx:280, cy:163, r:33, fill:"#08140a" },
    { cx:136, cy:50,  r:30, fill:"#42b242" },
    { cx:224, cy:48,  r:30, fill:"#42b242" },
  ],
  [
    { cx:180, cy:126, r:100, fill:"#0a180c" },
    { cx:97,  cy:98,  r:72,  fill:"#102a14" },
    { cx:263, cy:98,  r:72,  fill:"#102a14" },
    { cx:180, cy:74,  r:86,  fill:"#164618" },
    { cx:105, cy:88,  r:62,  fill:"#035c37" },
    { cx:255, cy:88,  r:62,  fill:"#035c37" },
    { cx:180, cy:46,  r:68,  fill:"#246c24" },
    { cx:120, cy:58,  r:50,  fill:"#2c8430" },
    { cx:240, cy:58,  r:50,  fill:"#2c8430" },
    { cx:180, cy:24,  r:50,  fill:"#369636" },
    { cx:65,  cy:118, r:52,  fill:"#0a180c" },
    { cx:295, cy:118, r:52,  fill:"#0a180c" },
    { cx:67,  cy:151, r:40,  fill:"#071009" },
    { cx:293, cy:151, r:40,  fill:"#071009" },
    { cx:130, cy:30,  r:36,  fill:"#40ae40" },
    { cx:230, cy:28,  r:36,  fill:"#40ae40" },
    { cx:180, cy:148, r:40,  fill:"#0a180c" },
  ],
  [
    { cx:180, cy:114, r:115, fill:"#081408" },
    { cx:86,  cy:86,  r:84,  fill:"#0e2210" },
    { cx:274, cy:86,  r:84,  fill:"#0e2210" },
    { cx:180, cy:60,  r:98,  fill:"#143e16" },
    { cx:94,  cy:74,  r:72,  fill:"#035c37" },
    { cx:266, cy:74,  r:72,  fill:"#035c37" },
    { cx:180, cy:28,  r:80,  fill:"#226422" },
    { cx:112, cy:40,  r:60,  fill:"#2a7c2a" },
    { cx:248, cy:40,  r:60,  fill:"#2a7c2a" },
    { cx:180, cy:5,   r:62,  fill:"#349434" },
    { cx:50,  cy:106, r:62,  fill:"#081408" },
    { cx:310, cy:106, r:62,  fill:"#081408" },
    { cx:52,  cy:142, r:48,  fill:"#05100a" },
    { cx:308, cy:142, r:48,  fill:"#05100a" },
    { cx:124, cy:12,  r:46,  fill:"#3eac3e" },
    { cx:236, cy:10,  r:46,  fill:"#3eac3e" },
    { cx:180, cy:138, r:48,  fill:"#081408" },
  ],
];

// ── £ Banknotes — spread wide throughout the canopy ──────────────────────────
// Each note object has optional `scale` for size variety
type NotePos = { x: number; y: number; rot: number; s?: number };

const ALL_NOTES: NotePos[] = [
  // Stage 2 — 1 note, centre of seedling
  { x:180, y:207, rot: -4  },

  // Stage 3 — spread slightly left
  { x:167, y:198, rot:-18  },

  // Stage 4 — right side
  { x:195, y:192, rot: 16  },

  // Stage 5 — outer left + outer right
  { x:151, y:182, rot:-26  },
  { x:209, y:178, rot: 22  },

  // Stage 6 — reaching side clusters
  { x:136, y:172, rot:-32, s:1.1 },
  { x:224, y:167, rot: 28, s:1.1 },

  // Stage 7 — into the outer arms
  { x:122, y:178, rot:-15  },
  { x:238, y:173, rot: 12  },

  // Stage 8 — higher and wide
  { x:154, y:149, rot: 34  },
  { x:206, y:144, rot:-28  },

  // Stage 9 — far side circles + top
  { x:100, y:160, rot:-13  },
  { x:260, y:155, rot: 10  },

  // Stage 10 — extreme width + near apex
  { x:115, y:125, rot: 24, s:1.15 },
  { x:245, y:119, rot:-26, s:1.15 },
  { x:180, y: 94, rot: -7  },

  // Stage 11 — outer low arms + upper spread
  { x: 80, y:145, rot:-16, s:1.2 },
  { x:280, y:139, rot: 18, s:1.2 },
  { x:145, y: 72, rot: 30  },
  { x:215, y: 68, rot:-22  },

  // Stage 12 — full outer canopy blowout
  { x: 60, y:118, rot: 32, s:1.25 },
  { x:300, y:112, rot:-27, s:1.25 },
  { x:110, y: 52, rot:-10, s:1.1  },
  { x:250, y: 48, rot: 14, s:1.1  },
  { x:180, y: 30, rot: -3, s:1.2  },
  { x: 78, y:172, rot: 20  },
  { x:282, y:166, rot:-17  },
];

// How many notes to show per stage (0–12)
const NOTES_SHOWN = [0, 0, 1, 2, 3, 5, 7, 9, 11, 13, 16, 20, 27];

// ── Banknote ──────────────────────────────────────────────────────────────────
function BankNote({ x, y, rot, scale = 1, delay }: { x: number; y: number; rot: number; scale?: number; delay: number }) {
  const w = 40 * scale;
  const h = 22 * scale;
  return (
    <motion.g
      style={{ transformOrigin: `${x}px ${y}px` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.38, delay, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <g transform={`translate(${x},${y}) rotate(${rot})`}>
        {/* Drop shadow */}
        <rect x={-w/2} y={-h/2} width={w} height={h} rx={3.5 * scale} fill="rgba(0,0,0,0.15)" transform="translate(1.5,1.5)" />
        {/* Note body */}
        <rect x={-w/2} y={-h/2} width={w} height={h} rx={3.5 * scale} fill="#85bb65" />
        {/* Fine background line pattern */}
        {[-3,-1,1,3].map((i) => (
          <line key={i} x1={-w/2+4} x2={w/2-4} y1={i*scale} y2={i*scale} stroke="#6aa84f" strokeWidth={0.4*scale} opacity={0.5} />
        ))}
        {/* Border */}
        <rect x={-w/2+3.5} y={-h/2+3} width={w-7} height={h-6} rx={2*scale} fill="none" stroke="#0ead69" strokeWidth={0.9*scale} />
        {/* Centre oval portrait placeholder */}
        <ellipse cx={0} cy={0} rx={4*scale} ry={5.5*scale} fill="#6aaa48" opacity={0.5} />
        <ellipse cx={0} cy={0} rx={4*scale} ry={5.5*scale} fill="none" stroke="#0ead69" strokeWidth={0.6*scale} />
        {/* Corner numerals */}
        <text x={-w/2+5.5} y={-h/2+6.5} fontSize={4.5*scale} fill="#0ead69" fontFamily="serif" fontWeight="bold" opacity={0.85}>10</text>
        <text x={ w/2-5.5} y={ h/2-2}   fontSize={4.5*scale} fill="#0ead69" fontFamily="serif" fontWeight="bold" opacity={0.85} textAnchor="end">10</text>
        {/* Serial number strip */}
        <text x={-w/2+5} y={h/2-2.5} fontSize={2.6*scale} fill="#0ead69" fontFamily="monospace" letterSpacing={0.8*scale} opacity={0.7}>AA 2847619 B</text>
        {/* Highlight sheen */}
        <rect x={-w/2} y={-h/2} width={w} height={h*0.28} rx={3.5*scale} fill="rgba(255,255,255,0.18)" />
      </g>
    </motion.g>
  );
}

// ── Sprout ────────────────────────────────────────────────────────────────────
function SproutSVG() {
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
      <motion.path
        d="M180 248 Q180 233 180 219"
        stroke="#0ead69" strokeWidth={2.5} fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />
      <motion.path
        d="M180 234 Q172 224 165 220 Q172 218 180 226"
        fill="#0ead69"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        style={{ transformOrigin: "172px 228px" }}
      />
      <motion.path
        d="M180 228 Q188 218 195 214 Q188 212 180 220"
        fill="#46aa46"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 1.0 }}
        style={{ transformOrigin: "188px 222px" }}
      />
    </motion.g>
  );
}

// ── Stage 12: sparkles spread across whole canopy ────────────────────────────
function SparklesSVG() {
  const pts = [
    { x:124, y: 78 }, { x:236, y: 74 }, { x:180, y: 52 },
    { x: 74, y:122 }, { x:286, y:116 }, { x: 96, y:162 },
    { x:264, y:156 }, { x:155, y: 44 }, { x:205, y: 40 },
    { x:180, y:178 },
  ];
  return (
    <>
      {pts.map((p, i) => (
        <motion.text
          key={i} x={p.x} y={p.y} textAnchor="middle" fontSize={i < 3 ? 13 : 10}
          animate={{ opacity: [0, 1, 0], scale: [0.7, 1.4, 0.7] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.32, ease: "easeInOut" }}
          style={{ transformOrigin: `${p.x}px ${p.y}px` }}
        >✨</motion.text>
      ))}
    </>
  );
}

// ── Floating coins (stage 8+) ─────────────────────────────────────────────────
function FloatingCoins({ stage }: { stage: number }) {
  if (stage < 8) return null;
  const coins = [
    { x:164, y:185, delay:0.0 }, { x:196, y:183, delay:0.5 },
    { x:148, y:168, delay:1.1 }, { x:212, y:165, delay:0.8 },
    { x:138, y:148, delay:1.6 }, { x:222, y:144, delay:0.3 },
    { x:122, y:138, delay:1.3 }, { x:238, y:133, delay:0.9 },
    { x:175, y:132, delay:0.6 }, { x:185, y:118, delay:1.8 },
    { x:105, y:152, delay:0.4 }, { x:255, y:146, delay:1.2 },
  ].slice(0, (stage - 7) * 2);

  return (
    <>
      {coins.map((c, i) => (
        <motion.g key={i}
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 2.8 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: c.delay }}
        >
          <circle cx={c.x} cy={c.y} r={5} fill="#d4a800" opacity={0.85} />
          <circle cx={c.x} cy={c.y} r={3.5} fill="none" stroke="#f0c800" strokeWidth={0.8} />
        </motion.g>
      ))}
    </>
  );
}

// ── Per-stage viewBox — camera zooms out as tree grows ────────────────────────
const STAGE_VIEWBOXES = [
  "82 198 196 157",
  "76 186 208 164",
  "68 165 224 181",
  "56 143 248 203",
  "40 120 280 226",
  "22 98  316 248",
  "5  76  350 270",
  "-8 55  376 292",
  "-12 40 384 308",
  "-18 0  396 350",
  "-20 -25 400 375",
  "-20 -52 400 402",
  "-20 -70 400 420",
];

// ── Celebration particles (deterministic so no hydration issues) ──────────────
type Particle = { emoji: string; angle: number; dist: number; rise: number; delay: number; size: number };
const PARTICLES: Particle[] = [
  { emoji: "🍃", angle:   0, dist:110, rise: 20, delay:0.00, size:20 },
  { emoji: "🍃", angle:  45, dist: 95, rise: 30, delay:0.04, size:17 },
  { emoji: "🍃", angle:  90, dist:105, rise: 15, delay:0.08, size:21 },
  { emoji: "🍃", angle: 135, dist: 90, rise: 10, delay:0.02, size:16 },
  { emoji: "🍃", angle: 180, dist:115, rise: 25, delay:0.06, size:20 },
  { emoji: "🍃", angle: 225, dist: 95, rise: 20, delay:0.03, size:17 },
  { emoji: "🍃", angle: 270, dist:100, rise: 18, delay:0.07, size:21 },
  { emoji: "🍃", angle: 315, dist: 88, rise: 28, delay:0.05, size:16 },
  { emoji: "💚",  angle:  22, dist: 70, rise: 55, delay:0.10, size:18 },
  { emoji: "💚",  angle: 112, dist: 65, rise: 50, delay:0.14, size:18 },
  { emoji: "💚",  angle: 202, dist: 72, rise: 60, delay:0.12, size:18 },
  { emoji: "💚",  angle: 292, dist: 68, rise: 52, delay:0.16, size:18 },
  { emoji: "✨", angle:  60, dist: 50, rise: 65, delay:0.00, size:22 },
  { emoji: "✨", angle: 150, dist: 55, rise: 60, delay:0.18, size:20 },
  { emoji: "✨", angle: 240, dist: 48, rise: 68, delay:0.09, size:22 },
  { emoji: "✨", angle: 330, dist: 52, rise: 62, delay:0.06, size:20 },
];

function LevelUpCelebration({ stage, onDone }: { stage: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  const isMax = stage === 12;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* Full-screen flash */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(34,139,34,0.22) 0%, transparent 70%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />

      {/* Expanding ring */}
      <motion.div
        className="absolute rounded-full border-[3px] border-[#0ead69]"
        initial={{ width: 60, height: 60, opacity: 0.9 }}
        animate={{ width: 320, height: 320, opacity: 0 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
      />
      <motion.div
        className="absolute rounded-full border-[2px] border-[#44c044]"
        initial={{ width: 60, height: 60, opacity: 0.7 }}
        animate={{ width: 200, height: 200, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
      />

      {/* Particles */}
      {PARTICLES.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx  = Math.cos(rad) * p.dist;
        const ty  = Math.sin(rad) * p.dist - p.rise;
        return (
          <motion.span
            key={i}
            className="absolute select-none"
            style={{ fontSize: p.size }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
            animate={{ x: tx, y: ty, opacity: 0, scale: 1.4, rotate: p.angle }}
            transition={{ duration: 1.3, delay: p.delay, ease: [0.15, 0.85, 0.35, 1] }}
          >
            {p.emoji}
          </motion.span>
        );
      })}

      {/* Extra coin burst for stage 12 */}
      {isMax && [0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.span
            key={`gold-${i}`}
            className="absolute select-none text-2xl"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ x: Math.cos(rad) * 130, y: Math.sin(rad) * 130 - 40, opacity: 0, scale: 1.6 }}
            transition={{ duration: 1.5, delay: 0.2 + i * 0.07, ease: [0.1, 0.9, 0.3, 1] }}
          >
            💰
          </motion.span>
        );
      })}

      {/* Rising badge */}
      <motion.div
        className="absolute flex items-center gap-2 bg-[#035c37] text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg shadow-green-900/30"
        initial={{ y: 30, opacity: 0, scale: 0.6 }}
        animate={{ y: [30, -10, -80], opacity: [0, 1, 1, 0], scale: [0.6, 1.1, 1, 0.9] }}
        transition={{ duration: 2.0, ease: "easeOut", times: [0, 0.25, 0.7, 1] }}
      >
        {isMax ? "🏆 Perfect year!" : "🌱 +1 month!"}
        <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
          {stage}/12
        </span>
      </motion.div>

      {/* Stage-12 extra trophy burst */}
      {isMax && (
        <motion.div
          className="absolute text-6xl select-none"
          initial={{ scale: 0, opacity: 0, rotate: -20 }}
          animate={{ scale: [0, 1.4, 1.1], opacity: [0, 1, 1, 0], rotate: [-20, 15, 0] }}
          transition={{ duration: 2.2, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        >
          🏆
        </motion.div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function MoneyTreeSVG({ monthsGoalMet, celebrateOnChange = false }: MoneyTreeSVGProps) {
  const stage      = Math.min(Math.max(Math.round(monthsGoalMet), 0), 12);
  const circles    = CANOPIES[stage];
  const noteCount  = NOTES_SHOWN[stage];
  const notes      = ALL_NOTES.slice(0, noteCount);

  const prevStageRef  = useRef(stage);
  const [celebrating, setCelebrating] = useState(false);
  const svgControls   = useAnimationControls();

  useEffect(() => {
    if (celebrateOnChange && stage > prevStageRef.current) {
      setCelebrating(true);
      // Brief spring-bounce on the tree itself
      svgControls.start({
        scale: [1, 1.08, 0.96, 1.04, 1],
        transition: { duration: 0.7, ease: "easeInOut" },
      });
    }
    prevStageRef.current = stage;
  }, [stage, celebrateOnChange, svgControls]);

  const handleDone = useCallback(() => setCelebrating(false), []);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <motion.svg
        viewBox={STAGE_VIEWBOXES[stage]}
        animate={stage >= 1
          ? { rotate: [0, 0.7, 0, -0.7, 0] }
          : {}
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="w-full select-none"
        style={{ transformOrigin: "180px 270px" }}
        // layered controls: celebration bounce plays over the sway loop
      >
        <motion.g animate={svgControls} style={{ transformOrigin: "180px 270px" }}>
          <PotSVG />

          {stage > 0 && <TrunkSVG stage={stage} />}

          {circles.map((c, i) => (
            <motion.circle
              key={`s${stage}-c${i}`}
              cx={c.cx} cy={c.cy} r={c.r} fill={c.fill}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.08 + i * 0.03, ease: "easeOut" }}
              style={{ transformOrigin: `${c.cx}px ${c.cy}px` }}
            />
          ))}

          <FloatingCoins stage={stage} />

          {notes.map((n, i) => (
            <BankNote
              key={`s${stage}-n${i}`}
              x={n.x} y={n.y} rot={n.rot} scale={n.s ?? 1}
              delay={0.35 + i * 0.06}
            />
          ))}

          {stage === 0 && <SproutSVG />}
          {stage === 12 && <SparklesSVG />}
        </motion.g>
      </motion.svg>

      {celebrating && <LevelUpCelebration stage={stage} onDone={handleDone} />}
    </div>
  );
}
