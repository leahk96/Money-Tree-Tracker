import { motion } from "framer-motion";

interface MoneyTreeSVGProps {
  /** Number of months this year where savings goal was met (0–12) */
  monthsGoalMet: number;
}

function getStage(m: number): number {
  if (m === 0) return 0;
  if (m <= 2) return 1;
  if (m <= 4) return 2;
  if (m <= 6) return 3;
  if (m <= 8) return 4;
  if (m <= 10) return 5;
  return 6;
}

// ── Pot & soil ────────────────────────────────────────────────────────────────
function PotSVG() {
  return (
    <g>
      <ellipse cx={180} cy={334} rx={52} ry={7} fill="#7a3c10" opacity={0.12} />
      {/* Pot body */}
      <path d="M149 272 L157 304 Q180 314 203 304 L211 272 Z" fill="#c07838" />
      {/* Pot stripe */}
      <path d="M151 283 L153 292 Q180 298 207 292 L209 283 Z" fill="rgba(0,0,0,0.07)" />
      {/* Pot rim */}
      <rect x={141} y={265} width={78} height={12} rx={5} fill="#9e5e26" />
      {/* Rim highlight */}
      <rect x={148} y={266} width={32} height={4} rx={2} fill="rgba(255,210,150,0.3)" />
      {/* Soil */}
      <ellipse cx={180} cy={271} rx={34} ry={6} fill="#4a2810" />
      <ellipse cx={172} cy={269} rx={11} ry={2.5} fill="#6a3c1a" opacity={0.6} />
    </g>
  );
}

// ── Trunk ─────────────────────────────────────────────────────────────────────
const TRUNK_TOP_Y = [271, 232, 216, 196, 175, 158, 142];

function TrunkSVG({ stage }: { stage: number }) {
  const ty = TRUNK_TOP_Y[stage];
  return (
    <motion.g
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      style={{ transformOrigin: "180px 270px" }}
    >
      {/* Main trunk */}
      <path
        d={`M174 270 C172 248 171 220 172 ${ty + 25} C173 ${ty + 10} 176 ${ty + 2} 180 ${ty - 2} C184 ${ty + 2} 187 ${ty + 10} 188 ${ty + 25} C189 220 188 248 186 270 Z`}
        fill="#7a5230"
      />
      {/* Highlight stripe */}
      <path
        d={`M175.5 260 C174 238 173.5 212 174 ${ty + 30}`}
        stroke="rgba(240,190,120,0.22)" strokeWidth={2.5} fill="none" strokeLinecap="round"
      />
      {/* Bark shadow */}
      <path
        d={`M183.5 255 C185 234 185 214 184.5 ${ty + 35}`}
        stroke="rgba(0,0,0,0.09)" strokeWidth={1.8} fill="none" strokeLinecap="round"
      />
      {/* Branch stubs — stage 3+ */}
      {stage >= 3 && (
        <>
          <path d="M173 228 Q157 212 140 205" stroke="#7a5230" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M187 228 Q203 212 220 205" stroke="#7a5230" strokeWidth={5} fill="none" strokeLinecap="round" />
        </>
      )}
      {stage >= 5 && (
        <>
          <path d="M172 248 Q148 238 126 236" stroke="#7a5230" strokeWidth={4.5} fill="none" strokeLinecap="round" />
          <path d="M188 248 Q212 238 234 236" stroke="#7a5230" strokeWidth={4.5} fill="none" strokeLinecap="round" />
          <path d="M174 210 Q158 190 144 180" stroke="#6a4828" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <path d="M186 210 Q202 190 216 180" stroke="#6a4828" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </>
      )}
    </motion.g>
  );
}

// ── Canopy circle clusters ─────────────────────────────────────────────────────
type C = { cx: number; cy: number; r: number; fill: string };

const CANOPIES: C[][] = [
  // Stage 0 — nothing
  [],
  // Stage 1 — seedling (1–2 months)
  [
    { cx:180, cy:218, r:20, fill:"#236823" },
    { cx:170, cy:210, r:14, fill:"#2e882e" },
    { cx:190, cy:210, r:14, fill:"#2e882e" },
    { cx:180, cy:201, r:16, fill:"#3ea83e" },
    { cx:173, cy:202, r:10, fill:"#46b446" },
    { cx:188, cy:200, r:10, fill:"#46b446" },
  ],
  // Stage 2 — small tree (3–4 months)
  [
    { cx:180, cy:196, r:34, fill:"#1c5020" },
    { cx:156, cy:185, r:22, fill:"#226822" },
    { cx:204, cy:185, r:22, fill:"#226822" },
    { cx:180, cy:173, r:26, fill:"#2a8030" },
    { cx:162, cy:179, r:17, fill:"#36a036" },
    { cx:198, cy:179, r:17, fill:"#36a036" },
    { cx:180, cy:164, r:19, fill:"#44b044" },
    { cx:168, cy:167, r:12, fill:"#50be50" },
    { cx:193, cy:165, r:12, fill:"#50be50" },
  ],
  // Stage 3 — medium (5–6 months)
  [
    { cx:180, cy:179, r:46, fill:"#183c1a" },
    { cx:143, cy:165, r:31, fill:"#1e5220" },
    { cx:217, cy:165, r:31, fill:"#1e5220" },
    { cx:180, cy:151, r:37, fill:"#246824" },
    { cx:151, cy:160, r:25, fill:"#2a7e2a" },
    { cx:209, cy:160, r:25, fill:"#2a7e2a" },
    { cx:180, cy:137, r:28, fill:"#339833" },
    { cx:160, cy:143, r:19, fill:"#3eaa3e" },
    { cx:200, cy:143, r:19, fill:"#3eaa3e" },
    { cx:180, cy:127, r:21, fill:"#4ab84a" },
  ],
  // Stage 4 — large (7–8 months)
  [
    { cx:180, cy:163, r:56, fill:"#152e16" },
    { cx:132, cy:148, r:38, fill:"#1a4420" },
    { cx:228, cy:148, r:38, fill:"#1a4420" },
    { cx:180, cy:130, r:45, fill:"#206020" },
    { cx:143, cy:140, r:30, fill:"#267826" },
    { cx:217, cy:140, r:30, fill:"#267826" },
    { cx:180, cy:109, r:35, fill:"#308a30" },
    { cx:153, cy:117, r:24, fill:"#3aa03a" },
    { cx:207, cy:117, r:24, fill:"#3aa03a" },
    { cx:180, cy:97, r:26, fill:"#44b044" },
    { cx:115, cy:160, r:26, fill:"#152e16" },
    { cx:245, cy:160, r:26, fill:"#152e16" },
    { cx:120, cy:182, r:18, fill:"#102210" },
    { cx:240, cy:182, r:18, fill:"#102210" },
  ],
  // Stage 5 — very large (9–10 months)
  [
    { cx:180, cy:148, r:66, fill:"#112212" },
    { cx:120, cy:130, r:45, fill:"#163418" },
    { cx:240, cy:130, r:45, fill:"#163418" },
    { cx:180, cy:110, r:54, fill:"#1c5a1e" },
    { cx:136, cy:121, r:36, fill:"#227222" },
    { cx:224, cy:121, r:36, fill:"#227222" },
    { cx:180, cy:87, r:41, fill:"#2c8a2c" },
    { cx:148, cy:94, r:28, fill:"#389e38" },
    { cx:212, cy:94, r:28, fill:"#389e38" },
    { cx:180, cy:73, r:30, fill:"#42b042" },
    { cx:98, cy:146, r:30, fill:"#112212" },
    { cx:262, cy:146, r:30, fill:"#112212" },
    { cx:103, cy:170, r:22, fill:"#0d1a0e" },
    { cx:257, cy:170, r:22, fill:"#0d1a0e" },
    { cx:154, cy:76, r:21, fill:"#50c050" },
    { cx:206, cy:74, r:21, fill:"#50c050" },
  ],
  // Stage 6 — full money tree (11–12 months)
  [
    { cx:180, cy:134, r:76, fill:"#0e1c0e" },
    { cx:107, cy:114, r:52, fill:"#122618" },
    { cx:253, cy:114, r:52, fill:"#122618" },
    { cx:180, cy:92, r:62, fill:"#185018" },
    { cx:125, cy:104, r:42, fill:"#1e681e" },
    { cx:235, cy:104, r:42, fill:"#1e681e" },
    { cx:180, cy:68, r:48, fill:"#267e26" },
    { cx:143, cy:76, r:33, fill:"#2e9230" },
    { cx:217, cy:76, r:33, fill:"#2e9230" },
    { cx:180, cy:54, r:34, fill:"#38aa38" },
    { cx:88, cy:130, r:34, fill:"#0e1c0e" },
    { cx:272, cy:130, r:34, fill:"#0e1c0e" },
    { cx:92, cy:158, r:25, fill:"#0a150b" },
    { cx:268, cy:158, r:25, fill:"#0a150b" },
    { cx:148, cy:60, r:25, fill:"#44be44" },
    { cx:212, cy:58, r:25, fill:"#44be44" },
    { cx:180, cy:168, r:30, fill:"#0e1c0e" },
  ],
];

// ── £ Banknotes per stage ──────────────────────────────────────────────────────
const STAGE_NOTES: Array<Array<{ x: number; y: number; rot: number }>> = [
  [],
  // Stage 1 — 1 note
  [
    { x:180, y:200, rot:-4 },
  ],
  // Stage 2 — 3 notes
  [
    { x:180, y:175, rot:-6 },
    { x:165, y:187, rot:-20 },
    { x:196, y:185, rot:17 },
  ],
  // Stage 3 — 5 notes
  [
    { x:180, y:148, rot:-5 },
    { x:162, y:158, rot:-17 },
    { x:200, y:155, rot:15 },
    { x:149, y:172, rot:-24 },
    { x:211, y:169, rot:21 },
  ],
  // Stage 4 — 7 notes
  [
    { x:180, y:118, rot:-4 },
    { x:156, y:128, rot:-17 },
    { x:204, y:126, rot:15 },
    { x:133, y:151, rot:-22 },
    { x:227, y:149, rot:20 },
    { x:160, y:166, rot:-27 },
    { x:200, y:163, rot:24 },
  ],
  // Stage 5 — 9 notes
  [
    { x:180, y:95, rot:-3 },
    { x:151, y:104, rot:-16 },
    { x:209, y:102, rot:14 },
    { x:122, y:131, rot:-21 },
    { x:238, y:129, rot:19 },
    { x:148, y:157, rot:-25 },
    { x:214, y:154, rot:22 },
    { x:168, y:170, rot:-12 },
    { x:194, y:168, rot:10 },
  ],
  // Stage 6 — 12 notes
  [
    { x:180, y:68, rot:-4 },
    { x:149, y:77, rot:-15 },
    { x:211, y:75, rot:13 },
    { x:115, y:106, rot:-21 },
    { x:245, y:104, rot:19 },
    { x:258, y:143, rot:28 },
    { x:102, y:141, rot:-25 },
    { x:148, y:157, rot:-25 },
    { x:214, y:154, rot:22 },
    { x:168, y:176, rot:-12 },
    { x:194, y:173, rot:10 },
    { x:180, y:187, rot:3 },
  ],
];

function BankNote({ x, y, rot, delay }: { x: number; y: number; rot: number; delay: number }) {
  return (
    <motion.g
      style={{ transformOrigin: `${x}px ${y}px` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.38, delay, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <g transform={`translate(${x},${y}) rotate(${rot})`}>
        {/* Note shadow */}
        <rect x="-20" y="-10" width="40" height="22" rx="3.5" fill="rgba(0,0,0,0.25)" transform="translate(1.5,1.5)" />
        {/* Note body */}
        <rect x="-20" y="-10" width="40" height="22" rx="3.5" fill="#1a6e1a" />
        {/* Inner frame */}
        <rect x="-16.5" y="-7" width="33" height="16" rx="2" fill="none" stroke="#44c044" strokeWidth="0.9" />
        {/* Side ovals — like a real note */}
        <ellipse cx="-10" cy="1" rx="3.5" ry="4.5" fill="none" stroke="#44c044" strokeWidth="0.7" />
        <ellipse cx="10" cy="1" rx="3.5" ry="4.5" fill="none" stroke="#44c044" strokeWidth="0.7" />
        {/* £ symbol */}
        <text x="0" y="5" textAnchor="middle" fontSize="10" fill="#8ae88a" fontWeight="bold" fontFamily="Georgia, 'Times New Roman', serif">£</text>
        {/* Subtle sheen */}
        <rect x="-20" y="-10" width="40" height="5" rx="3.5" fill="rgba(255,255,255,0.06)" />
      </g>
    </motion.g>
  );
}

// ── Sprout (stage 0) ──────────────────────────────────────────────────────────
function SproutSVG() {
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
      <motion.path
        d="M180 248 Q180 232 180 218"
        stroke="#38a038" strokeWidth={2.5} fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />
      <motion.path
        d="M180 234 Q172 224 165 220 Q172 218 180 226"
        fill="#38a038" stroke="none"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        style={{ transformOrigin: "172px 228px" }}
      />
      <motion.path
        d="M180 228 Q188 218 195 214 Q188 212 180 220"
        fill="#46aa46" stroke="none"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 1.0 }}
        style={{ transformOrigin: "188px 222px" }}
      />
    </motion.g>
  );
}

// ── Full-tree sparkles ─────────────────────────────────────────────────────────
function SparklesSVG() {
  const pts = [
    { x:124, y:96 }, { x:236, y:94 }, { x:180, y:75 },
    { x:100, y:148 }, { x:260, y:145 }, { x:180, y:188 },
  ];
  return (
    <>
      {pts.map((p, i) => (
        <motion.text
          key={i} x={p.x} y={p.y}
          textAnchor="middle" fontSize={10}
          animate={{ opacity: [0, 1, 0], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.38, ease: "easeInOut" }}
          style={{ transformOrigin: `${p.x}px ${p.y}px` }}
        >✨</motion.text>
      ))}
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function MoneyTreeSVG({ monthsGoalMet }: MoneyTreeSVGProps) {
  const stage = getStage(monthsGoalMet);
  const circles = CANOPIES[stage];
  const notes = STAGE_NOTES[stage];

  return (
    <motion.svg
      viewBox="0 0 360 348"
      className="w-full max-w-xs mx-auto select-none"
      animate={stage >= 1 ? { rotate: [0, 0.6, 0, -0.6, 0] } : {}}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "180px 270px" }}
    >
      <PotSVG />
      {stage > 0 && <TrunkSVG stage={stage} />}

      {/* Canopy circles — back to front */}
      {circles.map((c, i) => (
        <motion.circle
          key={`s${stage}-c${i}`}
          cx={c.cx} cy={c.cy} r={c.r} fill={c.fill}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.08 + i * 0.035, ease: "easeOut" }}
          style={{ transformOrigin: `${c.cx}px ${c.cy}px` }}
        />
      ))}

      {/* £ banknotes scattered in foliage */}
      {notes.map((n, i) => (
        <BankNote
          key={`s${stage}-n${i}`}
          x={n.x} y={n.y} rot={n.rot}
          delay={0.35 + i * 0.07}
        />
      ))}

      {stage === 0 && <SproutSVG />}
      {stage === 6 && <SparklesSVG />}
    </motion.svg>
  );
}
