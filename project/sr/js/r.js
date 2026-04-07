'use strict';

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const LUT_SAMPLES      = 1000;
const PIT_TIME_MIN     = 3;    // seconds (random 3–6s for all cars)
const PIT_TIME_MAX     = 6;

// ERS / Battery
const BAT_MAX          = 100;
const BAT_MAX_OT       = 150;   // overtake mode battery cap
const BAT_DRAIN_NORM   = 2.5;   // %/s drain on straights, normal
const BAT_DRAIN_BOOST  = 7.8;   // %/s drain on straights, boost mode
const BAT_REGEN_COR    = 5.0;   // %/s regen in corners (natural)
const BAT_REGEN_RCH_S  = 5.4;   // %/s regen on straights, recharge mode
const BAT_REGEN_RCH_C  = 23.2;  // %/s regen in corners, recharge mode
const BOOST_MULT       = 1.15;  // speed in boost mode (with battery)
const RECH_MULT        = 0.90;  // speed in recharge mode
const EMPTY_BAT_MULT   = 0.68;  // speed when battery = 0%
const OT_REGEN_FACTOR  = 1.3;   // overtake mode: 1.3× charge speed

// ── TIRE COMPOUNDS ─────────────────────────────────────────────────────────
const COMPOUNDS = {
  S: { label:'Soft',   ko:'소프트', color:'#FF3333', freshSpd:1.06, wornSpd:0.88, wearPerLap:30, dur:'~3랩' },
  M: { label:'Medium', ko:'미디엄', color:'#FFD700', freshSpd:1.00, wornSpd:0.92, wearPerLap:17, dur:'~6랩' },
  H: { label:'Hard',   ko:'하드',   color:'#D8D8D8', freshSpd:0.96, wornSpd:0.91, wearPerLap:10, dur:'~10랩' },
};

// ── CIRCUIT DATA ───────────────────────────────────────────────────────────
const CIRCUITS = [
  {
    id: 'monaco',
    name: 'Monaco Grand Prix',
    sub: 'Circuit de Monaco',
    flag: '🇲🇨',
    color: '#E8002D',
    targetLap: 20, totalLaps: 19,
    vb: '-10 -5 820 510',
    pts: [
      [72,215],[90,178],[118,148],[172,128],[222,116],[258,92],[290,48],
      [310,18],[338,52],[386,122],[436,212],[428,285],[468,198],[528,130],
      [636,116],[738,115],[768,168],[725,256],[782,260],[692,342],[578,374],
      [462,348],[392,315],[376,334],[314,294],[256,248],[190,238],[165,260],
      [132,318],[98,382],[75,424],[78,473],[28,448],[38,360],[52,290],[60,252],
    ]
  },
  {
    id: 'silverstone',
    name: 'British Grand Prix',
    sub: 'Silverstone Circuit',
    flag: '🇬🇧',
    color: '#27F4D2',
    targetLap: 35, totalLaps: 13,
    vb: '0 0 830 540',
    pts: [
      [556,445],[541,377],[525,314],[500,257],[508,173],[479,135],
      // Maggotts/Becketts/Chapel S-curves
      [462,140],[442,153],[426,172],[414,196],[410,230],
      [408,305],[404,381],[389,430],
      // Stowe
      [320,432],[234,427],
      // Vale/Brooklands/Luffield
      [130,424],[74,409],[55,355],[46,272],[30,228],[20,186],
      // Abbey/Farm
      [55,138],[90,107],[125,72],[168,50],[290,32],
      [369,29],[439,20],
      // Woodcote
      [528,76],[640,130],[684,164],[760,218],[810,274],
      [778,358],[716,445],[677,481],[558,510],
    ]
  },
  {
    id: 'monza',
    name: 'Italian Grand Prix',
    sub: 'Autodromo Nazionale di Monza',
    flag: '🇮🇹',
    color: '#FF8000',
    targetLap: 35, totalLaps: 12,
    vb: '0 0 810 520',
    pts: [
      // Start/finish
      [370,455],
      // Corner 1-2 (Variante del Rettifilo - first chicane)
      [280,452],[262,440],[245,424],[230,404],[215,384],
      // Corner 3 (Curva Grande)
      [122,380],[76,368],
      // Left side going up
      [68,330],[70,294],
      // Corner 4-5 (Lesmo notch)
      [126,276],[88,264],
      // Continue up left
      [70,236],[70,204],
      // Corner 6
      [76,170],
      // Going to top
      [90,110],[116,64],
      // Corner 7 (top)
      [232,38],[294,46],
      // Diagonal going right-down
      [346,90],[374,164],
      // Corner 8-9-10 (Variante Ascari chicane)
      [352,260],[370,238],[394,244],[412,266],
      // Long straight going right
      [444,278],[538,282],[632,284],[728,288],
      // Corner 11 (Parabolica)
      [760,302],[776,350],[768,400],[740,430],
      // Bottom straight back to start
      [632,442],[518,448],[428,452],
    ]
  },
  {
    id: 'suzuka',
    name: 'Japanese Grand Prix',
    sub: 'Suzuka International Racing Course',
    flag: '🇯🇵',
    color: '#DC143C',
    targetLap: 38, totalLaps: 11,
    vb: '0 0 820 520',
    pts: [
      // S/F → C01 (long diagonal straight, top-right → bottom-right)
      [580,153],[615,191],[658,250],[700,314],[734,374],
      // C01 hairpin (bottom-right)
      [763,430],[750,460],[723,489],
      // C02 exit → S-curves C03~C07 (up-left)
      [703,476],[675,448],
      [652,438],[636,418],[638,394],
      [630,383],[612,374],[600,365],
      [590,362],[575,347],[562,314],
      [544,290],[528,261],
      // C07 → C08~C09 (descending center, crosses return path)
      [490,295],[407,315],[362,325],[342,322],
      // C09 → C10 → C11 (ascending inner hairpin)
      [348,285],[350,175],[354,100],
      // C11 → outer loop left: C12 → C13 → C14
      [325,113],[270,110],
      [213,168],[175,131],[122,58],
      [83,64],[41,95],
      // C14 → return right → C15 (figure-8 crossing)
      [50,145],[64,178],[102,212],
      [162,234],[238,249],[312,254],[376,252],
      // C15 → C16 → C17 → C18 → S/F
      [404,228],[466,178],[508,166],[549,153],
    ]
  }
];

// ── DRIVER DATA ────────────────────────────────────────────────────────────
const DRIVERS = [
  { n:4,  name:'Lando Norris',      sh:'NOR', team:'McLaren',          tc:'#FF8000', rating:80 },
  { n:81, name:'Oscar Piastri',     sh:'PIA', team:'McLaren',          tc:'#FF8000', rating:80 },
  { n:16, name:'Charles Leclerc',   sh:'LEC', team:'Ferrari',          tc:'#E8002D', rating:80 },
  { n:44, name:'Lewis Hamilton',    sh:'HAM', team:'Ferrari',          tc:'#E8002D', rating:80 },
  { n:1,  name:'Max Verstappen',    sh:'VER', team:'Red Bull Racing',  tc:'#3671C6', rating:80 },
  { n:6,  name:'Isack Hadjar',      sh:'HAD', team:'Red Bull Racing',  tc:'#3671C6', rating:80 },
  { n:63, name:'George Russell',    sh:'RUS', team:'Mercedes',         tc:'#27F4D2', rating:80 },
  { n:12, name:'Kimi Antonelli',    sh:'ANT', team:'Mercedes',         tc:'#27F4D2', rating:80 },
  { n:14, name:'Fernando Alonso',   sh:'ALO', team:'Aston Martin',     tc:'#006847', rating:80 },
  { n:18, name:'Lance Stroll',      sh:'STR', team:'Aston Martin',     tc:'#006847', rating:80 },
  { n:10, name:'Pierre Gasly',      sh:'GAS', team:'Alpine',           tc:'#00A1E8', rating:80 },
  { n:43, name:'Franco Colapinto',  sh:'COL', team:'Alpine',           tc:'#00A1E8', rating:80 },
  { n:87, name:'Oliver Bearman',    sh:'BEA', team:'Haas',             tc:'#B8B8B8', rating:80 },
  { n:31, name:'Esteban Ocon',      sh:'OCO', team:'Haas',             tc:'#B8B8B8', rating:80 },
  { n:30, name:'Liam Lawson',       sh:'LAW', team:'Racing Bulls',     tc:'#6692FF', rating:80 },
  { n:40, name:'Arvid Lindblad',    sh:'LIN', team:'Racing Bulls',     tc:'#6692FF', rating:80 },
  { n:23, name:'Alexander Albon',   sh:'ALB', team:'Williams',         tc:'#005AFF', rating:80 },
  { n:55, name:'Carlos Sainz',      sh:'SAI', team:'Williams',         tc:'#005AFF', rating:80 },
  { n:27, name:'Nico Hülkenberg',   sh:'HUL', team:'Audi',             tc:'#B0B3B8', rating:80 },
  { n:5,  name:'Gabriel Bortoleto', sh:'BOR', team:'Audi',             tc:'#B0B3B8', rating:80 },
  { n:77, name:'Valtteri Bottas',   sh:'BOT', team:'Cadillac',         tc:'#C8A400', rating:80 },
  { n:11, name:'Sergio Perez',      sh:'PER', team:'Cadillac',         tc:'#C8A400', rating:80 },
];

// ── STATE ──────────────────────────────────────────────────────────────────
let G = {};

// ── PATH UTILS ─────────────────────────────────────────────────────────────
function crPath(pts) {
  const n = pts.length;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i-1+n)%n], p1 = pts[i];
    const p2 = pts[(i+1)%n],   p3 = pts[(i+2)%n];
    const c1x = p1[0]+(p2[0]-p0[0])/6, c1y = p1[1]+(p2[1]-p0[1])/6;
    const c2x = p2[0]-(p3[0]-p1[0])/6, c2y = p2[1]-(p3[1]-p1[1])/6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d + ' Z';
}

function buildLUT(pathEl, samples) {
  const total = pathEl.getTotalLength();
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const pt = pathEl.getPointAtLength((i/samples)*total);
    pts.push([pt.x, pt.y]);
  }
  return { total, pts, samples };
}

function lutPoint(lut, dist) {
  const norm = ((dist%lut.total)+lut.total)%lut.total;
  const exact = (norm/lut.total)*lut.samples;
  const i0 = Math.floor(exact)%lut.samples;
  const i1 = (i0+1)%lut.samples;
  const t = exact-Math.floor(exact);
  const [x0,y0]=lut.pts[i0], [x1,y1]=lut.pts[i1];
  return [x0+(x1-x0)*t, y0+(y1-y0)*t];
}

function fmtTime(ms) {
  const m=Math.floor(ms/60000), s=Math.floor((ms%60000)/1000), cs=Math.floor((ms%1000)/10);
  return `${m}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
}
function svgEl(tag) { return document.createElementNS('http://www.w3.org/2000/svg',tag); }
function showScn(id) {
  document.querySelectorAll('.scn').forEach(s=>s.classList.remove('active'));
  document.getElementById('scn-'+id).classList.add('active');
}

// ── SPEED PROFILE (corner detection) ──────────────────────────────────────
function buildSpeedProfile(lut) {
  const n = lut.samples;
  const raw = new Float32Array(n);
  const W = 15;
  for (let i = 0; i < n; i++) {
    const [x0,y0] = lut.pts[(i-W+n)%n];
    const [x1,y1] = lut.pts[i];
    const [x2,y2] = lut.pts[(i+W)%n];
    const ax=x1-x0, ay=y1-y0, bx=x2-x1, by=y2-y1;
    const la=Math.hypot(ax,ay), lb=Math.hypot(bx,by);
    if (la<0.01||lb<0.01) { raw[i]=1; continue; }
    const cos = Math.max(-1,Math.min(1,(ax*bx+ay*by)/(la*lb)));
    raw[i] = 0.28 + 0.72*((cos+1)/2);
  }
  const profile = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let v = raw[i];
    for (let j = 1; j <= 50; j++)
      v = Math.min(v, raw[(i+j)%n] + j*0.014);
    profile[i] = Math.max(0.28, v);
  }
  return profile;
}

function getCornerFactor(dist) {
  if (!G.speedProfile) return 1;
  const frac = ((dist%G.lut.total)+G.lut.total)%G.lut.total / G.lut.total;
  return G.speedProfile[Math.floor(frac*G.lut.samples) % G.lut.samples];
}

function getTireFactor(car) {
  const c = COMPOUNDS[car.compound];
  return c.freshSpd - (car.tireWear/100)*(c.freshSpd-c.wornSpd);
}

function calcSpeed(driver, pLen, targetLap) {
  const scale = targetLap / 16;
  const base  = (20 - (driver.rating/100)*5) * scale;
  const rand  = (Math.random()*0.8 - 0.4) * scale;
  return pLen / (base + rand);
}

// ── CIRCUIT SELECT ─────────────────────────────────────────────────────────
function renderCircuits() {
  const grid = document.getElementById('circuit-grid');
  grid.innerHTML = '';
  CIRCUITS.forEach(c => {
    const d = crPath(c.pts);
    const card = document.createElement('div');
    card.className = 'circuit-card';
    card.innerHTML = `
      <div class="circuit-flag">${c.flag}</div>
      <div class="circuit-svg-wrap">
        <svg class="circuit-preview-svg" viewBox="${c.vb}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
          <path d="${d}" fill="none" stroke="#1e1e1e" stroke-width="22" stroke-linecap="round"/>
          <path d="${d}" fill="none" stroke="${c.color}" stroke-width="13" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="circuit-gp">${c.name}</div>
      <div class="circuit-sub">${c.sub}</div>`;
    card.addEventListener('click', () => pickCircuit(c));
    grid.appendChild(card);
  });
}
function pickCircuit(c) { requestFullscreen(); G.circuit=c; renderDrivers(); showScn('driver'); }

// ── DRIVER SELECT ──────────────────────────────────────────────────────────
function renderDrivers() {
  document.getElementById('breadcrumb').textContent = `${G.circuit.flag}  ${G.circuit.name}`;
  const grid = document.getElementById('driver-grid');
  grid.innerHTML = '';
  DRIVERS.forEach(d => {
    const card = document.createElement('div');
    card.className = 'driver-card';
    card.style.setProperty('--tc', d.tc);
    card.innerHTML = `
      <div class="dc-num">${d.n}</div>
      <div class="dc-name">${d.name}</div>
      <div class="dc-sh">${d.sh}</div>
      <div class="dc-team">${d.team}</div>`;
    card.addEventListener('click', () => pickDriver(d));
    grid.appendChild(card);
  });
}
function pickDriver(d) { G.playerDriver=d; renderTireSelect(); showScn('tire'); }

// ── TIRE SELECT ────────────────────────────────────────────────────────────
function renderTireSelect() {
  document.getElementById('breadcrumb-tire').textContent =
    `${G.circuit.flag}  ${G.circuit.name}  ·  ${G.playerDriver.sh}`;
  const grid = document.getElementById('compound-grid');
  grid.innerHTML = '';
  Object.entries(COMPOUNDS).forEach(([key, c]) => {
    const textColor = key==='H' ? '#222' : '#fff';
    const card = document.createElement('div');
    card.className = 'compound-card';
    card.innerHTML = `
      <div class="compound-badge" style="background:${c.color};color:${textColor}">${key}</div>
      <div class="compound-name">${c.ko}</div>
      <div class="compound-stats">
        <div class="cstat"><span>속도증가율</span><span>${c.freshSpd>=1?'+':''}${Math.round((c.freshSpd-1)*100)}%</span></div>
        <div class="cstat"><span>마모 속도</span><span>${Math.round((c.wornSpd-1)*100)}%</span></div>
        <div class="cstat"><span>지속력</span><span>${c.dur}</span></div>
      </div>`;
    card.addEventListener('click', () => pickTire(key));
    grid.appendChild(card);
  });
}
function pickTire(compound) { G.playerCompound=compound; showScn('race'); requestAnimationFrame(initRace); }

// ── RACE INIT ──────────────────────────────────────────────────────────────
function initRace() {
  const c = G.circuit;
  const svg = document.getElementById('track-svg');
  svg.setAttribute('viewBox', c.vb);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.innerHTML = '';

  const pathD = crPath(c.pts);
  const mkPath = (sw, stroke, dash) => {
    const el=svgEl('path'); el.setAttribute('d',pathD); el.setAttribute('fill','none');
    el.setAttribute('stroke',stroke); el.setAttribute('stroke-width',String(sw));
    el.setAttribute('stroke-linecap','round');
    if (dash) el.setAttribute('stroke-dasharray',dash);
    svg.appendChild(el); return el;
  };
  mkPath(24,'#1a1a1a'); mkPath(18,'#3d3d3d'); mkPath(1,'#4a4a4a','8,8');

  const p0=c.pts[0], pN=c.pts[c.pts.length-1], p1=c.pts[1];
  const tx=p1[0]-pN[0], ty=p1[1]-pN[1], tl=Math.sqrt(tx*tx+ty*ty);
  const nx=-ty/tl, ny=tx/tl, HL=13;
  const sf=svgEl('line');
  sf.setAttribute('x1',(p0[0]+nx*HL).toFixed(1)); sf.setAttribute('y1',(p0[1]+ny*HL).toFixed(1));
  sf.setAttribute('x2',(p0[0]-nx*HL).toFixed(1)); sf.setAttribute('y2',(p0[1]-ny*HL).toFixed(1));
  sf.setAttribute('stroke','#fff'); sf.setAttribute('stroke-width','3.5');
  svg.appendChild(sf);

  const measPath=svgEl('path'); measPath.setAttribute('d',pathD);
  measPath.setAttribute('fill','none'); measPath.setAttribute('stroke','none');
  svg.appendChild(measPath);

  G.lut = buildLUT(measPath, LUT_SAMPLES);
  G.speedProfile = buildSpeedProfile(G.lut);
  const pLen = G.lut.total;
  const gridOrder = [...DRIVERS].sort(() => Math.random()-0.5);

  G.cars = gridOrder.map((d, i) => {
    const isPlayer = d.sh === G.playerDriver.sh;
    const speed = calcSpeed(d, pLen, c.targetLap);
    const GRID_GAP = speed * 0.05; // 0.05s between each car
    const startDist = -(i+1)*GRID_GAP;
    const aiCompound = ['S','M','M','H','M'][Math.floor(Math.random()*5)];
    const compound = isPlayer ? G.playerCompound : aiCompound;

    const dot = svgEl('circle');
    dot.setAttribute('r', isPlayer ? '9' : '5.5');
    dot.setAttribute('fill', d.tc);
    if (isPlayer) { dot.setAttribute('stroke','#fff'); dot.setAttribute('stroke-width','2.5'); }
    svg.appendChild(dot);

    return {
      d, isPlayer,
      dist: startDist,
      laps: 0, speed,
      lapTimes: [], lapStart: null,
      finishTime: null,
      compound, tireWear: 0,
      inPit: false, pitTimer: 0, pitDuration: 0, pitNotifyTimer: 0,
      pitRequested: false, pitNewCompound: null,
      battery: BAT_MAX,
      batMode: 'N',         // 'N' normal | 'B' boost | 'R' recharge
      batMax: BAT_MAX,
      overtakeModeActive: false,
      dot,
    };
  });

  G.cars.forEach(car => {
    const [x,y] = lutPoint(G.lut, car.dist);
    car.dot.setAttribute('cx', x.toFixed(2));
    car.dot.setAttribute('cy', y.toFixed(2));
  });

  document.getElementById('race-circuit-lbl').textContent = c.name;
  document.getElementById('my-last-lap').textContent = '—';
  document.getElementById('standings').innerHTML = '';

  // Reset HUD
  document.getElementById('hud-bat-bar').style.width = '100%';
  document.getElementById('hud-bat-pct').textContent = '100%';
  document.getElementById('hud-ot-badge').style.display = 'none';
  document.getElementById('hud-bat-ot-ext').style.width = '0%';
  document.getElementById('hud-bat-ot-track').style.opacity = '0.35';
  document.getElementById('btn-boost').classList.remove('mode-active');
  document.getElementById('btn-recharge').classList.remove('mode-active');

  G.raceEnd = false;
  G.lastT = null;

  const trackWrap = document.querySelector('.track-svg-wrap');
  let cd = 3;
  const showCD = num => {
    const old = trackWrap.querySelector('.countdown-overlay');
    if (old) old.remove();
    const ov = document.createElement('div'); ov.className='countdown-overlay';
    const sp = document.createElement('div'); sp.className='countdown-num';
    sp.textContent = num===0 ? 'GO' : String(num);
    sp.style.color = num===0 ? '#27F4D2' : '#E8002D';
    ov.appendChild(sp); trackWrap.appendChild(ov);
    if (num===0) setTimeout(() => { ov.remove(); startRace(); }, 600);
  };
  document.getElementById('race-lap-ctr').textContent = `LAP 1 / ${G.circuit.totalLaps}`;
  showCD(cd);
  const cdInt = setInterval(() => { cd--; showCD(cd); if(cd===0) clearInterval(cdInt); }, 900);
}

function startRace() {
  const now = performance.now();
  G.cars.forEach(car => { car.lapStart = now; });
  G.lastT = now;
  requestAnimationFrame(raceLoop);
}

// ── RACE LOOP ──────────────────────────────────────────────────────────────
function raceLoop(t) {
  if (G.raceEnd) return;

  const dt = Math.min((t - G.lastT)/1000, 0.05);
  G.lastT = t;
  const pLen = G.lut.total;
  const sorted = sortedCars();

  G.cars.forEach(car => {
    // Pit stop
    if (car.inPit) {
      car.pitTimer -= dt;
      if (car.pitTimer <= 0) {
        car.inPit = false;
        if (car.isPlayer) car.pitNotifyTimer = 3.5;
        car.tireWear = 0;
        if (car.pitNewCompound) { car.compound = car.pitNewCompound; car.pitNewCompound = null; }
        car.dot.style.opacity = '1';
      }
      return;
    }
    if (car.pitNotifyTimer > 0) car.pitNotifyTimer -= dt;
    if (car.finishTime !== null) return;

    const corner = getCornerFactor(car.dist);
    const isCorner = corner < 0.90;

    // ── AI BATTERY MANAGEMENT ────────────────────
    if (!car.isPlayer) {
      if (car.batMode === 'R' && car.battery >= 65) {
        car.batMode = 'N';
      } else if (car.batMode !== 'R' && car.battery < 20) {
        car.batMode = 'R';
      } else if (car.batMode === 'B' && (car.battery < 35 || isCorner)) {
        car.batMode = 'N';
      } else if (car.batMode === 'N' && car.battery > 55 && !isCorner) {
        const pos = sorted.findIndex(c => c === car);
        if (pos > 0) {
          const ahead = sorted[pos-1];
          const gap = (ahead.dist - car.dist) / Math.max(car.speed, 1);
          if (!ahead.inPit && gap > 0 && gap < 0.7 && Math.random() < 0.025 * dt * 60) {
            car.batMode = 'B';
          }
        }
      }
    }

    // ── ERS BATTERY ──────────────────────────────
    const otMult = car.overtakeModeActive ? OT_REGEN_FACTOR : 1.0;

    if (isCorner) {
      if (car.batMode !== 'B') {
        const rate = car.batMode === 'R' ? BAT_REGEN_RCH_C : BAT_REGEN_COR;
        car.battery = Math.min(car.batMax, car.battery + rate * otMult * dt);
      }
      // boost mode in corners: no regen, no drain
    } else {
      if (car.batMode === 'R') {
        car.battery = Math.min(car.batMax, car.battery + BAT_REGEN_RCH_S * otMult * dt);
      } else if (car.battery > 0) {
        const drain = car.batMode === 'B' ? BAT_DRAIN_BOOST : BAT_DRAIN_NORM;
        car.battery = Math.max(0, car.battery - drain * dt);
        // Boost auto-off when battery depleted
        if (car.battery <= 0 && car.batMode === 'B') car.batMode = 'N';
      }
    }

    // ── SPEED ─────────────────────────────────────
    let batFactor;
    if (car.battery <= 0) {
      batFactor = EMPTY_BAT_MULT;
    } else if (car.batMode === 'B') {
      batFactor = BOOST_MULT;
    } else if (car.batMode === 'R') {
      batFactor = RECH_MULT;
    } else {
      batFactor = 1.0;
    }

    const tire = getTireFactor(car);
    const moved = car.speed * corner * tire * batFactor * dt;
    car.dist += moved;
    car.tireWear = Math.min(100, car.tireWear + (moved/pLen)*COMPOUNDS[car.compound].wearPerLap);

    // AI pit request (will execute at start/finish line)
    if (!car.isPlayer && !car.pitRequested && car.tireWear > 88 && car.laps < G.circuit.totalLaps-1) {
      car.pitRequested = true;
      car.pitNewCompound = ['S','M','M','H','M'][Math.floor(Math.random()*5)];
    }
  });

  // ── LAP DETECTION ───────────────────────────────
  G.cars.forEach(car => {
    if (car.inPit || car.finishTime !== null) return;
    const newLaps = Math.floor(car.dist/pLen);
    if (newLaps > car.laps) {
      const lt = t - car.lapStart;
      car.lapTimes.push(lt);
      car.lapStart = t;
      car.laps = newLaps;
      car.speed = calcSpeed(car.d, pLen, G.circuit.targetLap);
      if (car.isPlayer) document.getElementById('my-last-lap').textContent = fmtTime(lt);
      if (car.laps >= G.circuit.totalLaps) { car.finishTime = t; return; }

      // Pit: trigger at start/finish line (player and AI)
      if (car.pitRequested) {
        car.pitRequested = false;
        car.inPit = true;
        car.pitTimer = PIT_TIME_MIN + Math.random() * (PIT_TIME_MAX - PIT_TIME_MIN);
        car.pitDuration = car.pitTimer;
        car.dot.style.opacity = '0.3';
        return;
      }

      // Overtake mode: activate next lap if within 1s of car ahead at S/F line
      const srt = sortedCars();
      const pos = srt.findIndex(c => c === car);
      if (pos > 0) {
        const ahead = srt[pos-1];
        const gap = (ahead.dist - car.dist) / Math.max(car.speed, 1);
        car.overtakeModeActive = !ahead.inPit && gap > 0 && gap < 0.1;
      } else {
        car.overtakeModeActive = false;
      }
      car.batMax = car.overtakeModeActive ? BAT_MAX_OT : BAT_MAX;
      if (!car.overtakeModeActive) car.battery = Math.min(car.battery, BAT_MAX);
    }
  });

  // ── SVG UPDATE ──────────────────────────────────
  G.cars.forEach(car => {
    if (car.inPit) return;
    const [x,y] = lutPoint(G.lut, car.dist);
    car.dot.setAttribute('cx', x.toFixed(2));
    car.dot.setAttribute('cy', y.toFixed(2));
  });

  G.currentT = t;
  updateStandings();

  if (G.cars.every(c => c.finishTime !== null)) {
    G.raceEnd = true;
    setTimeout(showResults, 1800);
    return;
  }
  requestAnimationFrame(raceLoop);
}

// ── PLAYER CONTROLS ───────────────────────────────────────────────────────
function setMode(m) {
  const car = G.cars?.find(c => c.isPlayer);
  if (!car || car.inPit || car.finishTime !== null) return;
  car.batMode = (car.batMode === m) ? 'N' : m;  // toggle: press again to return to normal
}

function playerPit() {
  const car = G.cars?.find(c => c.isPlayer);
  if (!car || car.inPit || car.finishTime !== null) return;

  // Render tire buttons with estimated laps
  const remaining = G.circuit.totalLaps - car.laps;
  document.querySelector('.pit-tire-btns').innerHTML = Object.entries(COMPOUNDS).map(([key, c]) => {
    const estLaps = Math.floor(100 / c.wearPerLap);
    const isCur   = key === car.compound;
    return `<button class="pit-tire-btn${isCur ? ' pit-tire-current' : ''}"
      data-compound="${key}" style="--tc:${c.color}"
      onclick="selectPitTire('${key}')">
      <span class="ptb-label" style="color:${c.color}">${key} ${c.ko}</span>
      <span class="ptb-laps">약 ${estLaps}랩</span>
    </button>`;
  }).join('');

  document.getElementById('pit-select-overlay').style.display = 'flex';
}

function selectPitTire(compound) {
  const car = G.cars?.find(c => c.isPlayer);
  document.getElementById('pit-select-overlay').style.display = 'none';
  if (!car) return;
  car.pitRequested = true;
  car.pitNewCompound = compound;
}

function cancelPit() {
  const car = G.cars?.find(c => c.isPlayer);
  document.getElementById('pit-select-overlay').style.display = 'none';
  if (car) { car.pitRequested = false; car.pitNewCompound = null; }
}

// ── STANDINGS + HUD ───────────────────────────────────────────────────────
function getFastestLap() {
  let best = null;
  G.cars.forEach(car => car.lapTimes.forEach(t => {
    if (!best || t < best.time) best = { car, time: t };
  }));
  return best;
}

function sortedCars() {
  return [...G.cars].sort((a,b) => {
    if (a.finishTime!==null && b.finishTime!==null) return a.finishTime-b.finishTime;
    if (a.finishTime!==null) return -1;
    if (b.finishTime!==null) return 1;
    return b.dist-a.dist;
  });
}

function updateStandings() {
  const sorted = sortedCars();
  const player = G.cars.find(c => c.isPlayer);
  const fl = getFastestLap();

  const displayLap = player.finishTime
    ? 'FINISHED'
    : `LAP ${Math.min(player.laps+1, G.circuit.totalLaps)} / ${G.circuit.totalLaps}`;
  document.getElementById('race-lap-ctr').textContent = displayLap;

  if (fl) {
    document.getElementById('fl-driver').textContent = fl.car.d.sh;
    document.getElementById('fl-driver').style.color  = fl.car.d.tc;
    document.getElementById('fl-time').textContent    = fmtTime(fl.time);
  }

  // Live lap timer (top-right)
  const timerEl = document.getElementById('lap-timer-live');
  if (player.inPit) {
    timerEl.style.color = '#FFD700';
    timerEl.textContent = `PIT ${(player.pitDuration - player.pitTimer).toFixed(1)}s`;
  } else if (player.pitNotifyTimer > 0) {
    timerEl.style.color = '#FFD700';
    timerEl.textContent = `PIT ${player.pitDuration.toFixed(1)}s`;
  } else if (player.finishTime !== null) {
    timerEl.style.color = '#27F4D2';
    timerEl.textContent = 'FIN';
  } else {
    timerEl.style.color = '#27F4D2';
    if (player.lapStart !== null && G.currentT) {
      timerEl.textContent = fmtTime(G.currentT - player.lapStart);
    }
  }

  document.getElementById('standings').innerHTML = sorted.map((car, i) => {
    const isFL = fl && car === fl.car;
    const otBadge = car.overtakeModeActive ? '<span class="s-ot">OT</span>' : '';
    const tc = COMPOUNDS[car.compound];
    const tireBadge = `<span class="s-tire" style="background:${tc.color};color:${car.compound==='H'?'#222':'#fff'}">${car.compound}</span>`;
    let gapStr = '';
    if (i === 0) {
      gapStr = '<span class="s-gap s-gap-leader">LEADER</span>';
    } else if (car.finishTime !== null) {
      gapStr = '<span class="s-gap s-fin">FIN</span>';
    } else {
      const gap = (sorted[i-1].dist - car.dist) / Math.max(car.speed, 1);
      gapStr = `<span class="s-gap">+${gap.toFixed(3)}s</span>`;
    }
    return `
    <div class="standing-row ${car.isPlayer?'is-player':''}">
      <span class="s-pos">${i+1}</span>
      <span class="s-dot" style="background:${car.d.tc}"></span>
      <span class="s-name"${isFL ? ' style="color:#c77dff"' : ''}>${car.d.sh}</span>
      ${tireBadge}
      ${otBadge}
      ${gapStr}
    </div>`;
  }).join('');

  updatePlayerHUD(player);
}

function updatePlayerHUD(player) {
  if (!player) return;

  const bat = player.battery;

  // Main battery bar (0–100%)
  const normPct = Math.min(100, (bat / BAT_MAX) * 100);
  const fill = document.getElementById('hud-bat-bar');
  fill.style.width = `${normPct}%`;
  fill.style.background = bat >= player.batMax ? '#00d4ff' : bat > 50 ? '#00ff87' : bat > 20 ? '#FFD700' : '#E8002D';

  // OT extension bar (100–150%)
  const otTrack = document.getElementById('hud-bat-ot-track');
  const otFill  = document.getElementById('hud-bat-ot-ext');
  if (player.overtakeModeActive) {
    otTrack.style.opacity = '1';
    const extraPct = (Math.max(0, bat - BAT_MAX) / (BAT_MAX_OT - BAT_MAX)) * 100;
    otFill.style.width = `${extraPct}%`;
  } else {
    otTrack.style.opacity = '0.3';
    otFill.style.width = '0%';
  }

  document.getElementById('hud-bat-pct').textContent = `${Math.round(bat)}%`;

  // OT badge
  document.getElementById('hud-ot-badge').style.display =
    player.overtakeModeActive ? 'inline-flex' : 'none';

  // Mode buttons highlight
  document.getElementById('btn-boost').classList.toggle('mode-active', player.batMode === 'B');
  document.getElementById('btn-recharge').classList.toggle('mode-active', player.batMode === 'R');

  // Tire
  const cp = COMPOUNDS[player.compound];
  const badge = document.getElementById('hud-compound');
  badge.textContent = player.compound;
  badge.style.background = cp.color;
  badge.style.color = player.compound === 'H' ? '#222' : '#fff';

  const wear = Math.round(player.tireWear);
  const wearBar = document.getElementById('hud-wear-bar');
  wearBar.style.width = `${100 - wear}%`;
  wearBar.style.background = wear < 50 ? '#27F4D2' : wear < 80 ? '#FFD700' : '#E8002D';
  wearBar.classList.toggle('wear-critical', wear > 70);
  document.getElementById('hud-wear-pct').textContent = `${wear}%`;

  // Pit button
  const pitBtn = document.getElementById('btn-pit');
  if (player.inPit) {
    pitBtn.disabled = true;
    pitBtn.textContent = `PITTING ${Math.ceil(player.pitTimer)}s`;
    pitBtn.style.color = ''; pitBtn.style.borderColor = '';
  } else if (player.pitRequested) {
    pitBtn.disabled = false;
    const pc = COMPOUNDS[player.pitNewCompound];
    pitBtn.textContent = `PIT: ${player.pitNewCompound} QUEUED`;
    pitBtn.style.color = pc.color;
    pitBtn.style.borderColor = pc.color;
  } else {
    pitBtn.disabled = false;
    pitBtn.textContent = 'PIT IN';
    pitBtn.style.color = ''; pitBtn.style.borderColor = '';
  }
}


// ── RESULTS ────────────────────────────────────────────────────────────────
function showResults() {
  showScn('results');
  const sorted = sortedCars();

  const top3 = sorted.slice(0,3);
  const podOrder = [top3[1],top3[0],top3[2]];
  const blocks = ['pb-2','pb-1','pb-3'];
  const nums   = ['2','1','3'];

  document.getElementById('podium-area').innerHTML = `
    <div class="podium-wrap">
      ${podOrder.map((car,i) => car ? `
        <div class="podium-slot">
          <div class="podium-name">${car.d.name}</div>
          <div class="podium-team" style="color:${car.d.tc}">${car.d.team}</div>
          <div class="podium-block ${blocks[i]}">${nums[i]}</div>
        </div>` : `<div class="podium-slot"></div>`).join('')}
    </div>`;

  const lapHeaders = Array.from({length:G.circuit.totalLaps},(_,i)=>`<th>LAP ${i+1}</th>`).join('');
  const rows = sorted.map((car,i) => {
    const lapCells = Array.from({length:G.circuit.totalLaps},(_,j)=>
      `<td class="td-time">${car.lapTimes[j]?fmtTime(car.lapTimes[j]):'—'}</td>`).join('');
    return `
      <tr class="${car.isPlayer?'player-row':''}">
        <td class="td-pos">${i+1}</td>
        <td class="td-driver"><span class="team-pip" style="background:${car.d.tc}"></span>${car.d.name}</td>
        <td>${car.d.team}</td>
        ${lapCells}
      </tr>`;
  }).join('');

  document.getElementById('results-table').innerHTML = `
    <div class="results-tbl-wrap">
      <table class="results-tbl">
        <thead><tr><th>POS</th><th>드라이버</th><th>팀</th>${lapHeaders}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ── RESTART ────────────────────────────────────────────────────────────────
function restartGame() {
  G = {};
  renderCircuits();
  showScn('circuit');
}

// ── FULLSCREEN + ORIENTATION ───────────────────────────────────────────────
function requestFullscreen() {
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen;
  if (!req) return;
  req.call(el).then(() => {
    // After fullscreen, try to lock landscape (Android Chrome supports this)
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {});
    }
  }).catch(() => {
    // Fullscreen denied — still try orientation lock alone
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {});
    }
  });
}

// ── BOOT ───────────────────────────────────────────────────────────────────
renderCircuits();
