"use client";

import { useId } from "react";
import { smoothProgress } from "@/lib/living-matter";
import { basketballShotPosition, BASKETBALL_HOOP, CHESS_BOARD, CHESS_GEOMETRY, chessSquareCenter, DECORATIVE_START_POSITION, JOURNAL_BRANCHES, knightOpeningPosition, quadraticPoint, scenePoint, SIGNAL_BRANCHES, type ChessPieceKind, type ExhibitionKind, type ScenePoint } from "@/lib/exhibition-scenes";
import "../exhibition-scenes.css";

type Props = { kind: ExhibitionKind; progress: number; id?: string };
function point(value: ScenePoint) { return `${value.x.toFixed(2)} ${value.y.toFixed(2)}`; }
function completion(progress: number) { return 1 - smoothProgress((progress - .965) / .035); }

function Signaling({ progress, id }: { progress: number; id: string }) {
  const align = smoothProgress((progress - .67) / .29);
  const signal = smoothProgress((progress - .34) / .3);
  return <g className="exhibition-signaling" opacity={completion(progress)}>
    <defs><radialGradient id={`${id}-node`}><stop stopColor="#D9E4C7" /><stop offset=".42" stopColor="#82B0A1" /><stop offset="1" stopColor="#426662" /></radialGradient></defs>
    {SIGNAL_BRANCHES.map((branch, index) => {
      const built = smoothProgress((progress - branch.delay) / .3);
      const from = scenePoint(branch.from, { x: 285, y: 158 + index * 37 }, align);
      const to = scenePoint(branch.to, { x: 285, y: 195 + index * 37 }, align);
      const control = scenePoint(branch.control, { x: 285, y: 176 + index * 37 }, align);
      const marker = quadraticPoint(from, control, to, Math.max(0, Math.min(1, signal * 1.6 - index * .05)));
      return <g key={index}>
        <path d={`M${point(from)}Q${point(control)} ${point(to)}`} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - built} />
        <circle cx={to.x} cy={to.y} r={6 * built - align * 2} fill={`url(#${id}-node)`} />
        <circle className="exhibition-signal-light" cx={marker.x} cy={marker.y} r="3" opacity={Math.sin(Math.PI * signal) * built * (1 - align)} />
      </g>;
    })}
    <circle className="exhibition-network-core" cx={500 + (285 - 500) * align} cy={325} r={18 - align * 13} fill={`url(#${id}-node)`} opacity={smoothProgress(progress / .18)} />
    {[210, 325, 440].map((y, index) => <g key={y} opacity={align}><path className="exhibition-editorial-line" d={`M285 ${y}H${315 + align * (460 - index * 80)}`} /><circle cx="285" cy={y} r="5" fill="#CFAB7D" /></g>)}
  </g>;
}

function Division({ progress, id }: { progress: number; id: string }) {
  const form = smoothProgress(progress / .23);
  const divide = smoothProgress((progress - .28) / .4);
  const separated = smoothProgress((progress - .64) / .12);
  const align = smoothProgress((progress - .76) / .22);
  const width = 185 + divide * 95;
  const furrow = 159 - divide * 144;
  const outline = `M${500 - width} 325C${500 - width - 20} 218 361 147 446 212C472 233 482 ${325 - furrow} 500 ${325 - furrow}C518 ${325 - furrow} 528 233 554 212C639 147 ${500 + width + 20} 218 ${500 + width} 325C${500 + width + 18} 432 639 502 554 438C528 416 518 ${325 + furrow} 500 ${325 + furrow}C482 ${325 + furrow} 472 416 446 438C361 502 ${500 - width - 18} 432 ${500 - width} 325Z`;
  return <g className="exhibition-division" opacity={completion(progress)}>
    <defs><radialGradient id={`${id}-cell`} cx="35%" cy="30%"><stop stopColor="#D4DEC2" stopOpacity=".85" /><stop offset=".55" stopColor="#8EAF98" stopOpacity=".55" /><stop offset="1" stopColor="#426662" stopOpacity=".85" /></radialGradient><radialGradient id={`${id}-core`}><stop stopColor="#DBC8A0" /><stop offset="1" stopColor="#AF8D61" /></radialGradient></defs>
    <g opacity={form * (1 - separated)}><path className="exhibition-cell" d={outline} fill={`url(#${id}-cell)`} /><path className="exhibition-cell-rim" d={`M${500 - width + 15} 287C${500 - width + 28} 218 370 180 431 222M565 222C650 178 ${500 + width - 26} 222 ${500 + width - 15} 283`} /></g>
    {[-1, 1].map(side => {
      const x = 500 + side * (50 + divide * 100 + align * 55);
      const radius = 103 - align * 94;
      return <g key={side}>
        <path className="exhibition-cell" d={`M${x - radius} 325C${x - radius * 1.07} ${325 - radius * .76} ${x - radius * .38} ${325 - radius * 1.25} ${x + radius * .2} ${325 - radius}C${x + radius * .96} ${325 - radius * .9} ${x + radius * 1.16} ${325 - radius * .1} ${x + radius * .9} ${325 + radius * .5}C${x + radius * .53} ${325 + radius * 1.1} ${x - radius * .87} ${325 + radius * 1.23} ${x - radius} 325Z`} fill={`url(#${id}-cell)`} opacity={separated} />
        <ellipse cx={x} cy={325 + side * 8} rx={(26 - align * 21) * form} ry={(31 - align * 26) * form} fill={`url(#${id}-core)`} opacity={(.5 + divide * .5) * (1 - align)} />
        <path className="exhibition-editorial-line" d={`M${x} ${325 - align * 125}V${325 + align * 125}M${x} ${325 - align * 125}H${x + side * align * 115}M${x} ${325 + align * 125}H${x + side * align * 115}`} opacity={align} />
      </g>;
    })}
    <path className="exhibition-community-link" d="M350 325Q500 250 650 325" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - separated} opacity={separated * (1 - align)} />
  </g>;
}

function Journal({ progress }: { progress: number }) {
  const align = smoothProgress((progress - .64) / .31);
  return <g className="exhibition-growth" opacity={completion(progress)}>
    {JOURNAL_BRANCHES.map((path, index) => <path key={path} d={path} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - smoothProgress((progress - index * .055) / .36)} opacity={1 - align} />)}
    {[[449, 146], [247, 203], [540, 221], [531, 351], [376, 143], [564, 138]].map(([x, y], index) => {
      const grown = smoothProgress((progress - .23 - index * .035) / .22);
      const toY = 184 + index * 49;
      const position = scenePoint({ x, y }, { x: 250, y: toY }, align);
      return <g key={index}>
        <circle className="exhibition-growth-tip" cx={position.x} cy={position.y} r={grown * (4 - align * 2)} />
        <path className="exhibition-editorial-line" d={`M${position.x} ${position.y}H${position.x + align * (index % 3 === 0 ? 500 : 340 + index * 17)}`} opacity={align} />
      </g>;
    })}
    <path className="exhibition-journal-spine" d={`M228 160V${160 + align * 340}`} opacity={align} />
  </g>;
}

function Listening({ progress, id }: { progress: number; id: string }) {
  const curl = smoothProgress((progress - .19) / .38);
  const form = smoothProgress((progress - .31) / .22);
  const settle = smoothProgress((progress - .74) / .23);
  const centerX = 500 - settle * 190;
  const radius = 168 - settle * 62;
  const path = Array.from({ length: 145 }, (_, index) => {
    const t = index / 144;
    const wave = { x: 220 + 560 * t, y: 325 + Math.sin(t * Math.PI * 21) * (12 + Math.sin(t * Math.PI) * 32) };
    const angle = t * Math.PI * 12 - Math.PI / 2;
    const r = (45 + t * 118) * radius / 168;
    const coil = { x: centerX + Math.cos(angle) * r, y: 325 + Math.sin(angle) * r };
    const p = scenePoint(wave, coil, curl);
    return `${index ? "L" : "M"}${point(p)}`;
  }).join(" ");
  return <g className="exhibition-listening" opacity={completion(progress)}>
    <defs><radialGradient id={`${id}-vinyl`} cx="38%" cy="28%"><stop stopColor="#414742" /><stop offset=".28" stopColor="#191E1D" /><stop offset=".8" stopColor="#111614" /><stop offset="1" stopColor="#35413B" /></radialGradient><linearGradient id={`${id}-reflection`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#FFFDF9" stopOpacity="0" /><stop offset=".5" stopColor="#FFFDF9" stopOpacity=".18" /><stop offset="1" stopColor="#FFFDF9" stopOpacity="0" /></linearGradient></defs>
    <ellipse cx={centerX} cy="505" rx={radius * .9} ry="12" fill="#292720" opacity={form * .1 * (1 - settle)} />
    <circle cx={centerX} cy="325" r={radius} fill={`url(#${id}-vinyl)`} opacity={form} />
    <path className="exhibition-waveform" d={path} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - smoothProgress(progress / .25)} opacity={1 - form * .75} />
    <g transform={`rotate(${progress * 290} ${centerX} 325)`} opacity={form}>
      {Array.from({ length: 17 }, (_, index) => <circle className="exhibition-vinyl-groove" key={index} cx={centerX} cy="325" r={radius * (.36 + index * .034)} />)}
      <path d={`M${centerX} 325L${centerX - radius * .9} ${325 - radius * .45}A${radius} ${radius} 0 0 1 ${centerX + radius * .25} ${325 - radius * .97}Z`} fill={`url(#${id}-reflection)`} />
      <circle cx={centerX} cy="325" r={radius * .3} fill="#CFAB7D" />
      <path d={`M${centerX - radius * .17} 316H${centerX + radius * .17}M${centerX - radius * .1} 337H${centerX + radius * .1}`} stroke="#292720" strokeWidth="1" opacity=".45" />
      <circle cx={centerX} cy="325" r="5" fill="#F1EBE0" />
    </g>
    {[265, 325, 385].map((y, index) => <path className="exhibition-editorial-line" key={y} d={`M470 ${y}H${470 + settle * (300 - index * 36)}`} opacity={settle} />)}
  </g>;
}

const piecePaths: Record<ChessPieceKind, string> = {
  pawn: "M17 14A7 7 0 1 1 31 14A7 7 0 1 1 17 14ZM20 22L17 34H31L28 22M14 35H34V40H14Z",
  rook: "M13 9H19V14H22V9H27V14H30V9H36V21L32 24L31 34H17L16 24L13 21ZM14 35H34V40H14Z",
  knight: "M15 34L20 26L14 23L10 24L11 18L20 8L26 7L27 11C36 15 36 25 33 34ZM22 13L20 18M14 35H35V40H14Z",
  bishop: "M24 6C13 14 14 20 20 24L17 34H31L28 24C34 20 35 14 24 6ZM24 9L20 17M14 35H34V40H14Z",
  queen: "M12 16L17 33H32L37 16L29 22L24 12L19 22ZM14 35H35V40H14ZM9 13A3 3 0 1 0 15 13A3 3 0 1 0 9 13ZM21 9A3 3 0 1 0 27 9A3 3 0 1 0 21 9ZM34 13A3 3 0 1 0 40 13A3 3 0 1 0 34 13Z",
  king: "M24 5V17M19 10H29M18 19C11 17 10 26 17 30L18 34H31L32 30C39 25 36 17 30 19C28 21 26 22 24 24C22 21 20 20 18 19ZM14 35H35V40H14Z",
};

function Chess({ progress, id }: { progress: number; id: string }) {
  const settle = smoothProgress((progress - .81) / .17);
  const knight = knightOpeningPosition(progress);
  return <g className="exhibition-chess" opacity={completion(progress)} transform={`translate(${-settle * 100} 0) scale(${1 - settle * .14})`}>
    <defs><linearGradient id={`${id}-piece`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#FFFDF9" /><stop offset="1" stopColor="#D7CDBB" /></linearGradient></defs>
    <path d="M295 132H705V536H295Z" fill="#292720" opacity=".13" />
    {CHESS_BOARD.map(tile => {
      const form = smoothProgress((progress - ((tile.file + 8 - tile.rank) / 14) * .22) / .24);
      return <rect key={tile.square} className={tile.dark ? "exhibition-square-dark" : "exhibition-square-light"} x={CHESS_GEOMETRY.x + tile.file * 50} y={CHESS_GEOMETRY.y + (8 - tile.rank) * 50 + (1 - form) * 35} width="50" height="50" opacity={form} data-decorative-square={tile.square} data-dark={tile.dark} />;
    })}
    {DECORATIVE_START_POSITION.map(piece => {
      const form = smoothProgress((progress - .22 - (piece.file % 3) * .025) / .26);
      const center = piece.square === "g1" ? knight : chessSquareCenter(piece.file, piece.rank);
      return <g key={piece.square} data-decorative-piece={`${piece.color}-${piece.kind}`} data-start-square={piece.square} transform={`translate(${center.x - 24} ${center.y - 24 - (1 - form) * 18})`} opacity={form}>
        <ellipse cx="25" cy={43 + knight.lift * (piece.square === "g1" ? 5 : 0)} rx="15" ry="3" fill="#292720" opacity=".15" />
        <path className={`exhibition-chess-piece exhibition-chess-piece--${piece.color}`} d={piecePaths[piece.kind]} fill={piece.color === "white" ? `url(#${id}-piece)` : "#344A43"} />
      </g>;
    })}
    <path className="exhibition-knight-trace" d="M625 500V400H575" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - smoothProgress((progress - .55) / .24)} opacity={(1 - settle) * .5} />
    <path className="exhibition-editorial-line" d={`M750 180V${180 + settle * 320}`} opacity={settle} />
  </g>;
}

function Basketball({ progress, id }: { progress: number; id: string }) {
  const court = smoothProgress(progress / .34);
  const shot = smoothProgress((progress - .22) / .65);
  const ball = basketballShotPosition(shot);
  const settle = smoothProgress((progress - .83) / .15);
  const net = ball.net * 18;
  return <g className="exhibition-basketball" opacity={completion(progress)}>
    <defs><radialGradient id={`${id}-ball`} cx="30%" cy="25%"><stop stopColor="#D8AE73" /><stop offset=".52" stopColor="#B7804D" /><stop offset="1" stopColor="#704727" /></radialGradient></defs>
    <g className="exhibition-court-lines" strokeDasharray="1" strokeDashoffset={1 - court}>
      <path d="M125 525L325 370H785L905 525ZM360 525L430 370M760 525L714 370M245 525Q530 260 819 525M450 525Q550 430 650 525" pathLength="1" />
      <path d="M730 207V155H834V289M730 207H782V245H730" pathLength="1" />
    </g>
    <g opacity={court}>
      <path className="exhibition-backboard" d="M684 159H816V249H684ZM720 206H779V243H720Z" />
      <g className="exhibition-net" transform={`translate(${ball.net * 4} ${net})`}>
        <path d="M696 251L711 304H750L765 251M703 264H760M708 284H755M710 252L730 305L752 252M698 252L746 304M763 252L714 304" />
      </g>
      <ellipse className="exhibition-rim" cx={BASKETBALL_HOOP.x} cy={BASKETBALL_HOOP.y} rx="35" ry="8" />
    </g>
    <path className="exhibition-shot-trail" d="M235 475Q482 -25 730 250" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - Math.min(1, shot / .78)} opacity={(1 - settle) * .3} />
    <g transform={`translate(${ball.x} ${ball.y}) rotate(${ball.rotation})`} opacity={smoothProgress((progress - .16) / .12) * (1 - settle)}>
      <circle r="17" fill={`url(#${id}-ball)`} stroke="#704727" strokeWidth="1" />
      <path className="exhibition-ball-seams" d="M-17 0H17M0-17V17M-10-13C-2-6-2 6-10 13M10-13C2-6 2 6 10 13" />
    </g>
    <path className="exhibition-editorial-line" d={`M140 525H${140 + settle * 720}`} opacity={settle} />
  </g>;
}

function Pulse({ progress }: { progress: number }) {
  const draw = smoothProgress(progress / .45);
  const settle = smoothProgress((progress - .6) / .36);
  return <g className="exhibition-pulse" opacity={completion(progress)}>
    <path d="M145 325H312Q332 309 350 325H401L424 341L451 259L477 367L496 325H565Q590 293 614 325H855" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - draw} opacity={1 - settle} />
    <path className="exhibition-editorial-line" d={`M145 325H${145 + settle * 710}`} opacity={settle} />
    <circle cx={145 + 710 * draw} cy="325" r={3.5 * (1 - settle)} opacity={Math.sin(Math.PI * draw)} />
  </g>;
}

/** Seven finite, independent decorative scenes. The parent owns timing/lifecycle. */
export default function ExhibitionScenes({ kind, progress, id }: Props) {
  const generated = useId();
  const sceneId = `exhibition-${(id ?? generated).replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  return <svg className={`living-scene exhibition-scene exhibition-scene--${kind}`} viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" data-exhibition-kind={kind}>
    {kind === "experience" && <Signaling progress={p} id={sceneId} />}
    {kind === "leadership" && <Division progress={p} id={sceneId} />}
    {kind === "journal" && <Journal progress={p} />}
    {kind === "listening" && <Listening progress={p} id={sceneId} />}
    {kind === "chess" && <Chess progress={p} id={sceneId} />}
    {kind === "basketball" && <Basketball progress={p} id={sceneId} />}
    {kind === "extras" && <Pulse progress={p} />}
  </svg>;
}
