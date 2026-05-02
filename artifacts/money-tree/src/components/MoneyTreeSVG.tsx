import { motion } from "framer-motion";

interface MoneyTreeSVGProps {
  /** Number of months this year where savings goal was met (0–12) */
  monthsGoalMet: number;
}

// ── Pot & soil ────────────────────────────────────────────────────────────────
function PotSVG() {
  return (
    <g>
      <ellipse cx={180} cy={334} rx={52} ry={7} fill="#7a3c10" opacity={0.12} />
      <path d="M149 272 L157 304 Q180 314 203 304 L211 272 Z" fill="#c07838" />
      <path d="M151 283 L153 292 Q180 298 207 292 L209 283 Z" fill="rgba(0,0,0,0.07)" />
      <rect x={141} y={265} width={78} height={12} rx={5} fill="#9e5e26" />
      <rect x={148} y={266} width={32} height={4} rx={2} fill="rgba(255,210,150,0.3)" />
      <ellipse cx={180} cy={271} rx={34} ry={6} fill="#4a2810" />
      <ellipse cx={172} cy={269} rx={11} ry={2.5} fill="#6a3c1a" opacity={0.6} />
    </g>
  );
}

// ── Trunk (height varies by stage 0–12) ──────────────────────────────────────
const TRUNK_TOP: number[] = [271, 244, 236, 225, 214, 202, 191, 180, 170, 160, 151, 143, 136];

function TrunkSVG({ stage }: { stage: number }) {
  const ty = TRUNK_TOP[stage] ?? 136;
  const hasLargeBranches = stage >= 6;
  const hasMidBranches   = stage >= 4;

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
    </motion.g>
  );
}

// ── Canopy circle clusters — 13 distinct stages (0–12) ───────────────────────
type C = { cx: number; cy: number; r: number; fill: string };

const CANOPIES: C[][] = [
  // 0 — no canopy (sprout only)
  [],

  // 1 — first month: tiny seedling
  [
    { cx:180, cy:230, r:16, fill:"#206020" },
    { cx:171, cy:221, r:11, fill:"#2a8030" },
    { cx:189, cy:221, r:11, fill:"#2a8030" },
    { cx:180, cy:214, r:12, fill:"#38a838" },
    { cx:175, cy:216, r:8,  fill:"#46b446" },
    { cx:186, cy:215, r:8,  fill:"#46b446" },
  ],

  // 2 — second month: slightly bigger, 1 note
  [
    { cx:180, cy:223, r:21, fill:"#1c5820" },
    { cx:166, cy:213, r:15, fill:"#226822" },
    { cx:194, cy:213, r:15, fill:"#226822" },
    { cx:180, cy:204, r:17, fill:"#2a8030" },
    { cx:170, cy:207, r:11, fill:"#36a036" },
    { cx:191, cy:207, r:11, fill:"#36a036" },
    { cx:180, cy:196, r:13, fill:"#42ae42" },
  ],

  // 3 — third month
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

  // 4 — fourth month
  [
    { cx:180, cy:205, r:33, fill:"#184818" },
    { cx:155, cy:191, r:22, fill:"#1e6020" },
    { cx:205, cy:191, r:22, fill:"#1e6020" },
    { cx:180, cy:179, r:26, fill:"#247824" },
    { cx:157, cy:185, r:17, fill:"#2e9030" },
    { cx:203, cy:185, r:17, fill:"#2e9030" },
    { cx:180, cy:168, r:20, fill:"#389838" },
    { cx:164, cy:173, r:13, fill:"#42aa42" },
    { cx:196, cy:173, r:13, fill:"#42aa42" },
    { cx:180, cy:160, r:15, fill:"#4cb44c" },
  ],

  // 5 — fifth month
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
    { cx:180, cy:145, r:16, fill:"#46b046" },
    { cx:128, cy:188, r:18, fill:"#163a18" },
    { cx:232, cy:188, r:18, fill:"#163a18" },
  ],

  // 6 — sixth month
  [
    { cx:180, cy:187, r:45, fill:"#143218" },
    { cx:143, cy:169, r:31, fill:"#1a4e20" },
    { cx:217, cy:169, r:31, fill:"#1a4e20" },
    { cx:180, cy:154, r:36, fill:"#206620" },
    { cx:148, cy:162, r:24, fill:"#267e28" },
    { cx:212, cy:162, r:24, fill:"#267e28" },
    { cx:180, cy:141, r:27, fill:"#2e8e2e" },
    { cx:156, cy:148, r:18, fill:"#38a038" },
    { cx:204, cy:148, r:18, fill:"#38a038" },
    { cx:180, cy:130, r:20, fill:"#42ae42" },
    { cx:122, cy:181, r:22, fill:"#143218" },
    { cx:238, cy:181, r:22, fill:"#143218" },
    { cx:126, cy:200, r:15, fill:"#101e12" },
    { cx:234, cy:200, r:15, fill:"#101e12" },
  ],

  // 7 — seventh month
  [
    { cx:180, cy:178, r:52, fill:"#122c14" },
    { cx:136, cy:158, r:36, fill:"#184820" },
    { cx:224, cy:158, r:36, fill:"#184820" },
    { cx:180, cy:143, r:41, fill:"#1e6020" },
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

  // 8 — eighth month
  [
    { cx:180, cy:168, r:58, fill:"#102614" },
    { cx:130, cy:147, r:40, fill:"#164020" },
    { cx:230, cy:147, r:40, fill:"#164020" },
    { cx:180, cy:131, r:47, fill:"#1c5820" },
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
    { cx:152, cy:107, r:18, fill:"#46b046" },
    { cx:208, cy:105, r:18, fill:"#46b046" },
  ],

  // 9 — ninth month
  [
    { cx:180, cy:158, r:64, fill:"#0e2012" },
    { cx:123, cy:135, r:44, fill:"#143a18" },
    { cx:237, cy:135, r:44, fill:"#143a18" },
    { cx:180, cy:118, r:53, fill:"#1a5420" },
    { cx:130, cy:129, r:36, fill:"#206622" },
    { cx:230, cy:129, r:36, fill:"#206622" },
    { cx:180, cy:98, r:42, fill:"#287c28" },
    { cx:143, cy:108, r:29, fill:"#329032" },
    { cx:217, cy:108, r:29, fill:"#329032" },
    { cx:180, cy:85, r:31, fill:"#3ca43c" },
    { cx:100, cy:154, r:32, fill:"#0e2012" },
    { cx:260, cy:154, r:32, fill:"#0e2012" },
    { cx:103, cy:180, r:24, fill:"#0a180c" },
    { cx:257, cy:180, r:24, fill:"#0a180c" },
    { cx:148, cy:90, r:21, fill:"#44b044" },
    { cx:212, cy:88, r:21, fill:"#44b044" },
  ],

  // 10 — tenth month
  [
    { cx:180, cy:148, r:69, fill:"#0c1c10" },
    { cx:117, cy:123, r:48, fill:"#123212" },
    { cx:243, cy:123, r:48, fill:"#123212" },
    { cx:180, cy:105, r:57, fill:"#184e18" },
    { cx:125, cy:117, r:39, fill:"#1e6020" },
    { cx:235, cy:117, r:39, fill:"#1e6020" },
    { cx:180, cy:82, r:46, fill:"#267426" },
    { cx:139, cy:93, r:32, fill:"#2e8a2e" },
    { cx:221, cy:93, r:32, fill:"#2e8a2e" },
    { cx:180, cy:69, r:34, fill:"#38a038" },
    { cx:93,  cy:143, r:34, fill:"#0c1c10" },
    { cx:267, cy:143, r:34, fill:"#0c1c10" },
    { cx:95,  cy:171, r:26, fill:"#08140a" },
    { cx:265, cy:171, r:26, fill:"#08140a" },
    { cx:144, cy:74, r:23, fill:"#42b242" },
    { cx:216, cy:72, r:23, fill:"#42b242" },
  ],

  // 11 — eleventh month
  [
    { cx:180, cy:140, r:74, fill:"#0a180c" },
    { cx:112, cy:113, r:51, fill:"#102a14" },
    { cx:248, cy:113, r:51, fill:"#102a14" },
    { cx:180, cy:93,  r:61, fill:"#164618" },
    { cx:120, cy:106, r:42, fill:"#1c5a1e" },
    { cx:240, cy:106, r:42, fill:"#1c5a1e" },
    { cx:180, cy:68,  r:50, fill:"#246c24" },
    { cx:135, cy:78,  r:35, fill:"#2c8430" },
    { cx:225, cy:78,  r:35, fill:"#2c8430" },
    { cx:180, cy:55,  r:37, fill:"#369636" },
    { cx:87,  cy:135, r:37, fill:"#0a180c" },
    { cx:273, cy:135, r:37, fill:"#0a180c" },
    { cx:89,  cy:163, r:29, fill:"#071009" },
    { cx:271, cy:163, r:29, fill:"#071009" },
    { cx:140, cy:60,  r:26, fill:"#40ae40" },
    { cx:220, cy:58,  r:26, fill:"#40ae40" },
    { cx:180, cy:158, r:30, fill:"#0a180c" },
  ],

  // 12 — full tree (11–12 months)
  [
    { cx:180, cy:132, r:79, fill:"#081408" },
    { cx:106, cy:104, r:55, fill:"#0e2210" },
    { cx:254, cy:104, r:55, fill:"#0e2210" },
    { cx:180, cy:82,  r:65, fill:"#143e16" },
    { cx:114, cy:96,  r:45, fill:"#1a5420" },
    { cx:246, cy:96,  r:45, fill:"#1a5420" },
    { cx:180, cy:57,  r:53, fill:"#226422" },
    { cx:129, cy:67,  r:38, fill:"#2a7c2a" },
    { cx:231, cy:67,  r:38, fill:"#2a7c2a" },
    { cx:180, cy:42,  r:39, fill:"#349434" },
    { cx:81,  cy:128, r:41, fill:"#081408" },
    { cx:279, cy:128, r:41, fill:"#081408" },
    { cx:83,  cy:157, r:31, fill:"#05100a" },
    { cx:277, cy:157, r:31, fill:"#05100a" },
    { cx:135, cy:50,  r:28, fill:"#3eac3e" },
    { cx:225, cy:48,  r:28, fill:"#3eac3e" },
    { cx:180, cy:153, r:31, fill:"#081408" },
  ],
];

// ── £ Banknotes — 12 positions, each within the canopy for the stage it appears ─
// notes[i] first appears at stage i+2 (0-indexed, so ALL_NOTES[0] → stage 2)
const ALL_NOTES: Array<{ x: number; y: number; rot: number }> = [
  { x:180, y:207, rot:-4  },  // stage 2 — dead center of small canopy
  { x:170, y:197, rot:-17 },  // stage 3
  { x:193, y:195, rot: 15 },  // stage 4
  { x:157, y:183, rot:-22 },  // stage 5
  { x:204, y:181, rot: 19 },  // stage 6
  { x:151, y:169, rot:-25 },  // stage 7
  { x:209, y:167, rot: 21 },  // stage 8
  { x:178, y:156, rot: -5 },  // stage 9  (centre)
  { x:153, y:148, rot:-20 },  // stage 10
  { x:207, y:145, rot: 17 },  // stage 11
  { x:147, y:133, rot:-23 },  // stage 12 (extra 1)
  { x:213, y:130, rot: 19 },  // stage 12 (extra 2)
];

// How many notes to show for each stage 0–12
const NOTES_SHOWN = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];

// ── £ Banknote component ──────────────────────────────────────────────────────
function BankNote({ x, y, rot, delay }: { x: number; y: number; rot: number; delay: number }) {
  return (
    <motion.g
      style={{ transformOrigin: `${x}px ${y}px` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.38, delay, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <g transform={`translate(${x},${y}) rotate(${rot})`}>
        {/* Drop shadow */}
        <rect x="-20" y="-10" width="40" height="22" rx="3.5" fill="rgba(0,0,0,0.28)" transform="translate(1.5,1.5)" />
        {/* Body */}
        <rect x="-20" y="-10" width="40" height="22" rx="3.5" fill="#1a6e1a" />
        {/* Inner frame */}
        <rect x="-16.5" y="-7"  width="33" height="16" rx="2"   fill="none" stroke="#44c044" strokeWidth="0.9" />
        {/* Oval watermark motifs */}
        <ellipse cx="-10" cy="1" rx="3.5" ry="4.5" fill="none" stroke="#44c044" strokeWidth="0.7" />
        <ellipse cx=" 10" cy="1" rx="3.5" ry="4.5" fill="none" stroke="#44c044" strokeWidth="0.7" />
        {/* £ */}
        <text x="0" y="5" textAnchor="middle" fontSize="10" fill="#8ae88a" fontWeight="bold" fontFamily="Georgia, 'Times New Roman', serif">£</text>
        {/* Sheen */}
        <rect x="-20" y="-10" width="40" height="5" rx="3.5" fill="rgba(255,255,255,0.06)" />
      </g>
    </motion.g>
  );
}

// ── Stage 0: sprout ───────────────────────────────────────────────────────────
function SproutSVG() {
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
      <motion.path
        d="M180 248 Q180 233 180 219"
        stroke="#38a038" strokeWidth={2.5} fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />
      <motion.path
        d="M180 234 Q172 224 165 220 Q172 218 180 226"
        fill="#38a038"
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

// ── Stage 12: sparkles ────────────────────────────────────────────────────────
function SparklesSVG() {
  const pts = [{ x:124, y:92 }, { x:236, y:90 }, { x:180, y:72 }, { x:96, y:145 }, { x:264, y:142 }, { x:180, y:185 }];
  return (
    <>
      {pts.map((p, i) => (
        <motion.text
          key={i} x={p.x} y={p.y} textAnchor="middle" fontSize={10}
          animate={{ opacity: [0, 1, 0], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.38, ease: "easeInOut" }}
          style={{ transformOrigin: `${p.x}px ${p.y}px` }}
        >✨</motion.text>
      ))}
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function MoneyTreeSVG({ monthsGoalMet }: MoneyTreeSVGProps) {
  const stage  = Math.min(Math.max(Math.round(monthsGoalMet), 0), 12);
  const circles = CANOPIES[stage];
  const noteCount = NOTES_SHOWN[stage];
  const notes = ALL_NOTES.slice(0, noteCount);

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

      {/* Canopy circles — rendered back to front */}
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

      {/* £ banknotes */}
      {notes.map((n, i) => (
        <BankNote
          key={`s${stage}-n${i}`}
          x={n.x} y={n.y} rot={n.rot}
          delay={0.35 + i * 0.07}
        />
      ))}

      {stage === 0 && <SproutSVG />}
      {stage === 12 && <SparklesSVG />}
    </motion.svg>
  );
}
