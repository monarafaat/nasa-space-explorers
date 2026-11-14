// Procedural 3D models of real NASA hardware. Each builder returns a Group whose
// origin sits on the ground; sizes are in world units (the child astronaut is ~0.8 tall).
export function createModels(THREE) {
  const { Group, Mesh, MeshStandardMaterial: MS, BoxGeometry: BG, CylinderGeometry: CG, SphereGeometry: SG, ConeGeometry: KG, TorusGeometry: TG, PlaneGeometry: PG, Vector3: V3, DoubleSide } = THREE;
  const mt = (c, o = {}) => new MS({ color: c, roughness: 0.55, metalness: 0.35, ...o });
  const tex = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return new THREE.CanvasTexture(c); };
  const solarTex = tex(256, 256, (x, w, h) => {
    x.fillStyle = '#071a46'; x.fillRect(0, 0, w, h);
    const cell = w / 8;
    for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
      x.fillStyle = (row + col) % 2 ? '#123c8c' : '#0b2b70';
      x.fillRect(col * cell + 2, row * cell + 2, cell - 4, cell - 4);
    }
    x.strokeStyle = 'rgba(166,205,255,.85)'; x.lineWidth = 2;
    for (let i = 0; i <= 8; i++) {
      x.beginPath(); x.moveTo(i * cell, 0); x.lineTo(i * cell, h);
      x.moveTo(0, i * cell); x.lineTo(w, i * cell); x.stroke();
    }
    x.fillStyle = '#9ec8ff'; x.fillRect(w * 0.49, 0, 3, h);
  });
  const foilTex = tex(128, 128, (x, w, h) => {
    x.fillStyle = '#c4953a'; x.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) {
      x.fillStyle = y % 16 ? 'rgba(255,225,137,.2)' : 'rgba(92,59,15,.16)';
      x.fillRect(0, y, w, 3);
    }
    x.strokeStyle = 'rgba(255,235,170,.28)'; x.lineWidth = 1;
    for (let i = -h; i < w; i += 18) {
      x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.stroke();
    }
  });
  const flagTex = tex(260, 170, (x, w, h) => {
    for (let i = 0; i < 13; i++) { x.fillStyle = i % 2 ? '#fff' : '#b22234'; x.fillRect(0, (i * h) / 13, w, h / 13 + 1); }
    x.fillStyle = '#3c3b6e'; x.fillRect(0, 0, w * 0.4, (h * 7) / 13); x.fillStyle = '#fff';
    for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) x.fillRect(8 + c * 16, 8 + r * 15, 4, 4);
  });
  const P = {
    white: mt(0xf0f1ee, { metalness: 0.24, roughness: 0.42 }), grey: mt(0x9aa0aa), dark: mt(0x2b2f38, { metalness: 0.5 }), black: mt(0x14161b, { roughness: 0.8 }),
    gold: mt(0xffffff, { map: foilTex, metalness: 0.72, roughness: 0.48 }), silver: mt(0xcfd3d9, { metalness: 0.7, roughness: 0.35 }),
    solar: mt(0xffffff, { map: solarTex, metalness: 0.5, roughness: 0.3 }), dish: mt(0xf4f4f0, { metalness: 0.2, roughness: 0.5, side: DoubleSide }),
    glass: mt(0x7fe7ff, { metalness: 0.55, roughness: 0.12, emissive: 0x073348, emissiveIntensity: 0.7 }),
  };
  const add = (p, g, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const o = new Mesh(g, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); p.add(o); return o; };
  const box = (p, w, h, d, m, x, y, z, rx, ry, rz) => add(p, new BG(w, h, d), m, x, y, z, rx, ry, rz);
  const cyl = (p, rt, rb, h, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, seg = 18) => add(p, new CG(rt, rb, h, seg), m, x, y, z, rx, ry, rz);
  const sph = (p, r, m, x, y, z) => add(p, new SG(r, 20, 14), m, x, y, z);
  const strut = (p, a, b, r, m) => {
    const A = new V3(...a), B = new V3(...b), d = B.clone().sub(A), L = d.length();
    const o = new Mesh(new CG(r, r, L, 8), m);
    o.position.copy(A).addScaledVector(d, 0.5);
    o.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize());
    p.add(o); return o;
  };
  // satellite dish opening toward local +y, rim radius r, tilted by tx/tz
  const bowl = (p, r, m, x, y, z, tx = 0, tz = 0) => {
    const R = r / Math.sin(0.55), g = new SG(R, 32, 8, 0, Math.PI * 2, 0, 0.55);
    g.translate(0, -R, 0);
    const w = new Group(); w.position.set(x, y, z); w.rotation.set(tx, 0, tz);
    const o = new Mesh(g, m); o.rotation.x = Math.PI; w.add(o); p.add(w); return w;
  };
  const pedestal = (g, r = 1.4) => cyl(g, r, r * 1.15, 0.3, P.grey, 0, 0.15, 0, 0, 0, 0, 28);
  const B = {};

  B.flag = () => {
    const g = new Group();
    cyl(g, 0.04, 0.04, 2.4, P.silver, 0, 1.2, 0); cyl(g, 0.025, 0.025, 1.3, P.silver, 0.65, 2.25, 0, 0, 0, Math.PI / 2); sph(g, 0.07, P.gold, 0, 2.42, 0);
    add(g, new PG(1.2, 0.8), new MS({ map: flagTex, side: DoubleSide, roughness: 0.9 }), 0.64, 1.85, 0);
    return g;
  };

  B.lm = () => {
    const g = new Group();
    cyl(g, 1.45, 1.45, 1, P.gold, 0, 1.3, 0, 0, Math.PI / 8, 0, 8);
    cyl(g, 1, 1.15, 1.2, P.silver, 0, 2.4, 0, 0, Math.PI / 8, 0, 8);
    box(g, 0.7, 0.5, 0.1, P.dark, 0, 2.55, 1.05); cyl(g, 0.3, 0.3, 0.15, P.grey, 0, 2.3, 1.1, Math.PI / 2);
    cyl(g, 0.4, 0.45, 0.3, P.grey, 0, 3.15, 0);
    strut(g, [0.7, 2.9, -0.5], [0.7, 3.2, -0.5], 0.03, P.grey); bowl(g, 0.5, P.dish, 0.7, 3.2, -0.5, -0.5);
    [[-1.15, 0.5], [1.15, 0.5], [-1.15, -0.5], [1.15, -0.5]].forEach(([x, z]) => box(g, 0.25, 0.25, 0.25, P.dark, x, 2.8, z));
    for (let k = 0; k < 4; k++) {
      const lg = new Group(); lg.rotation.y = (k * Math.PI) / 2 + Math.PI / 4; g.add(lg);
      strut(lg, [1.2, 1.4, 0], [2.4, 0.06, 0], 0.07, P.silver); strut(lg, [1.35, 0.7, 0], [2.0, 0.7, 0.0], 0.04, P.grey);
      cyl(lg, 0.38, 0.38, 0.08, P.gold, 2.4, 0.04, 0);
    }
    box(g, 0.1, 1.2, 0.45, P.silver, 0.0, 0.7, 1.6);
    return g;
  };

  B.lrv = () => {
    const g = new Group();
    box(g, 1.5, 0.14, 2.2, P.silver, 0, 0.7, 0);
    [-1, 1].forEach((sx) => [-0.85, 0.85].forEach((sz) => { cyl(g, 0.38, 0.38, 0.16, P.dark, sx * 0.85, 0.4, sz, 0, 0, Math.PI / 2); cyl(g, 0.2, 0.2, 0.2, P.grey, sx * 0.85, 0.4, sz, 0, 0, Math.PI / 2); box(g, 0.3, 0.05, 0.7, P.white, sx * 0.85, 0.82, sz); }));
    [-0.3, 0.3].forEach((x) => { box(g, 0.4, 0.1, 0.4, P.white, x, 0.82, -0.2); box(g, 0.4, 0.5, 0.08, P.white, x, 1.07, -0.42); });
    box(g, 0.5, 0.35, 0.2, P.dark, 0, 1.0, 0.55); strut(g, [0, 0.8, 0.95], [0, 1.9, 0.95], 0.04, P.grey);
    bowl(g, 0.6, P.dish, 0, 1.9, 0.95, -0.3); box(g, 0.2, 0.15, 0.15, P.dark, 0.5, 1.2, 1.0); box(g, 0.5, 0.2, 0.4, P.gold, 0, 0.9, -0.85);
    return g;
  };

  B.alsep = () => {
    const g = new Group();
    box(g, 1, 0.55, 0.8, P.gold, 0, 0.4, 0); box(g, 1.04, 0.08, 0.84, P.silver, 0, 0.7, 0);
    strut(g, [0, 0.74, 0], [0, 1.5, 0], 0.03, P.grey); bowl(g, 0.35, P.dish, 0, 1.5, 0, -0.6);
    cyl(g, 0.55, 0.55, 0.1, P.grey, -1.6, 0.06, 0.6); add(g, new SG(0.45, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), P.silver, -1.6, 0.1, 0.6);
    strut(g, [1.2, 0, -0.9], [1.2, 0.9, -0.9], 0.03, P.grey); box(g, 0.25, 0.2, 0.25, P.dark, 1.2, 0.95, -0.9);
    cyl(g, 0.18, 0.18, 1, P.grey, 2, 0.5, 0.3);
    for (let i = 0; i < 5; i++) cyl(g, 0.3, 0.3, 0.04, P.dark, 2, 0.15 + i * 0.17, 0.3);
    strut(g, [0.5, 0.15, 0], [1.85, 0.12, 0.3], 0.02, P.black);
    return g;
  };

  B.retro = () => {
    const g = new Group();
    box(g, 1.4, 0.1, 1.4, P.grey, 0, 0.05, 0);
    const p = new Group(); p.position.set(0, 0.6, 0); p.rotation.x = 0.7; g.add(p);
    box(p, 1.3, 0.1, 1.3, P.silver, 0, 0, 0);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) cyl(p, 0.09, 0.09, 0.06, P.glass, -0.5 + i * 0.2, 0.07, -0.5 + j * 0.2, 0, 0, 0, 12);
    strut(g, [-0.5, 0.1, -0.6], [-0.5, 0.55, -0.3], 0.04, P.grey); strut(g, [0.5, 0.1, -0.6], [0.5, 0.55, -0.3], 0.04, P.grey);
    return g;
  };

  B.rover = ({ body = 0xe6e6e9, deck = 0x9aa0aa, curiosity = false } = {}) => {
    const g = new Group(), bm = mt(body, { metalness: 0.3 });
    box(g, 1.3, 0.5, 1.9, bm, 0, 1.05, 0); box(g, 1.1, 0.12, 1.6, mt(deck), 0, 1.37, -0.05);
    [-1, 1].forEach((sx) => {
      [-0.85, 0, 0.85].forEach((z) => {
        cyl(g, 0.38, 0.38, 0.3, mt(0x8f949c), sx, 0.38, z, 0, 0, Math.PI / 2, 20);
        cyl(g, 0.28, 0.28, 0.34, P.dark, sx, 0.38, z, 0, 0, Math.PI / 2);
        [-1, 1].forEach((side) => add(g, new TG(0.32, 0.025, 6, 18), P.black, sx + side * 0.11, 0.38, z, 0, Math.PI / 2));
      });
      strut(g, [sx * 0.65, 1.0, 0], [sx, 0.45, 0], 0.05, P.grey); strut(g, [sx, 0.5, -0.85], [sx, 0.5, 0.85], 0.04, P.grey);
    });
    strut(g, [0.45, 1.4, 0.55], [0.45, 2.55, 0.55], 0.05, P.grey); box(g, 0.55, 0.22, 0.22, P.dark, 0.45, 2.6, 0.55);
    cyl(g, 0.07, 0.07, 0.1, P.black, 0.28, 2.6, 0.68, Math.PI / 2); cyl(g, 0.07, 0.07, 0.1, P.black, 0.62, 2.6, 0.68, Math.PI / 2);
    sph(g, 0.075, P.glass, 0.28, 2.6, 0.74); sph(g, 0.075, P.glass, 0.62, 2.6, 0.74);
    box(g, 0.38, 0.08, 0.22, P.gold, -0.35, 1.47, 0.05);
    strut(g, [-0.3, 1.2, 0.95], [-0.3, 0.95, 1.5], 0.06, P.grey); strut(g, [-0.3, 0.95, 1.5], [-0.1, 0.55, 1.75], 0.05, P.grey);
    cyl(g, 0.18, 0.18, 0.2, P.dark, -0.1, 0.5, 1.8, Math.PI / 2);
    cyl(g, 0.2, 0.2, 0.9, P.dark, 0, 1.35, -1.25, Math.PI / 2);
    for (let i = 0; i < 5; i++) cyl(g, 0.3, 0.3, 0.03, P.grey, 0, 1.35, -1.6 + i * 0.15, Math.PI / 2);
    bowl(g, 0.25, P.dish, -0.35, 1.45, -0.5, -0.4);
    if (curiosity) box(g, 0.3, 0.3, 0.3, P.dark, -0.4, 2.6, 0.55); else cyl(g, 0.12, 0.12, 0.5, P.black, 0.3, 1.5, 0.8, Math.PI / 2);
    return g;
  };

  B.ingenuity = () => {
    const g = new Group();
    [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => { strut(g, [sx * 0.18, 1.0, sz * 0.18], [sx * 0.85, 0.06, sz * 0.85], 0.035, P.dark); cyl(g, 0.08, 0.08, 0.05, P.dark, sx * 0.85, 0.03, sz * 0.85); }));
    box(g, 0.5, 0.5, 0.5, P.gold, 0, 1.05, 0); cyl(g, 0.04, 0.04, 0.8, P.black, 0, 1.55, 0);
    box(g, 2.4, 0.03, 0.18, P.dark, 0, 1.75, 0, 0, 0.5, 0); box(g, 2.4, 0.03, 0.18, P.dark, 0, 1.9, 0, 0, 2.1, 0);
    box(g, 1.1, 0.04, 0.7, P.solar, 0, 2.1, 0);
    return g;
  };

  B.viking = () => {
    const g = new Group();
    cyl(g, 1.2, 1.2, 0.55, mt(0xdadde3), 0, 1.15, 0, 0, 0, 0, 6); cyl(g, 1, 1, 0.1, P.gold, 0, 1.47, 0, 0, 0, 0, 6);
    for (let k = 0; k < 3; k++) { const lg = new Group(); lg.rotation.y = (k * Math.PI * 2) / 3; g.add(lg); strut(lg, [0.9, 1.1, 0], [2, 0.1, 0], 0.07, P.silver); cyl(lg, 0.3, 0.3, 0.05, P.grey, 2, 0.04, 0); }
    cyl(g, 0.22, 0.22, 0.9, P.dark, -0.3, 1.65, -0.9, 0, 0, Math.PI / 2); cyl(g, 0.22, 0.22, 0.9, P.dark, 0.5, 1.65, -0.8, 0, 0, Math.PI / 2);
    strut(g, [0.4, 1.5, 0.2], [0.4, 2.5, 0.2], 0.04, P.grey); bowl(g, 0.65, P.dish, 0.4, 2.55, 0.2, -0.4);
    strut(g, [-0.5, 1.5, 0.5], [-0.5, 2.4, 0.5], 0.04, P.grey); box(g, 0.35, 0.2, 0.2, P.dark, -0.5, 2.45, 0.5);
    strut(g, [0.7, 1.25, 0.9], [1.7, 1.1, 1.7], 0.04, P.grey);
    return g;
  };

  B.pathfinder = () => {
    const g = new Group();
    box(g, 1.1, 0.5, 1.1, P.silver, 0, 0.35, 0);
    for (let k = 0; k < 4; k++) { const pg = new Group(); pg.rotation.y = (k * Math.PI) / 2; g.add(pg); box(pg, 1.4, 0.05, 1.2, P.silver, 1.25, 0.1, 0, 0, 0, 0.05); box(pg, 1.2, 0.03, 1.0, P.solar, 1.25, 0.14, 0, 0, 0, 0.05); }
    strut(g, [0, 0.6, 0], [0, 2.1, 0], 0.04, P.grey); box(g, 0.5, 0.3, 0.25, P.dark, 0, 2.2, 0); bowl(g, 0.3, P.dish, -0.35, 0.9, 0.3, -0.3);
    const s = new Group(); s.position.set(2.8, 0, 0.4); g.add(s);
    box(s, 0.7, 0.2, 0.5, P.white, 0, 0.35, 0); box(s, 0.7, 0.04, 0.5, P.solar, 0, 0.48, 0);
    [-1, 1].forEach((sx) => [-0.2, 0, 0.2].forEach((z) => cyl(s, 0.13, 0.13, 0.1, P.dark, sx * 0.4, 0.14, z * 1.2, 0, 0, Math.PI / 2)));
    return g;
  };

  B.saturnV = () => {
    const g = new Group();
    cyl(g, 1.5, 1.7, 0.3, P.grey, 0, 0.15, 0, 0, 0, 0, 28);
    cyl(g, 0.9, 0.9, 5, P.white, 0, 2.8, 0, 0, 0, 0, 24); cyl(g, 0.92, 0.92, 0.5, P.black, 0, 4.6, 0, 0, 0, 0, 24); cyl(g, 0.92, 0.92, 0.5, P.black, 0, 3.0, 0, 0, 0, 0, 24);
    cyl(g, 0.7, 0.5, 0.4, P.dark, 0, 0.5, 0);
    for (let k = 0; k < 4; k++) { const fg = new Group(); fg.rotation.y = (k * Math.PI) / 2; g.add(fg); box(fg, 0.9, 1.6, 0.08, P.white, 1.1, 1.1, 0); box(fg, 0.12, 0.5, 0.1, P.black, 1.55, 0.5, 0); }
    cyl(g, 0.9, 0.9, 0.3, mt(0x30343c), 0, 5.45, 0, 0, 0, 0, 24);
    cyl(g, 0.9, 0.9, 3, P.white, 0, 7.1, 0, 0, 0, 0, 24); cyl(g, 0.92, 0.92, 0.4, P.black, 0, 8.2, 0, 0, 0, 0, 24);
    cyl(g, 0.7, 0.9, 1.5, P.white, 0, 9.35, 0, 0, 0, 0, 24); cyl(g, 0.7, 0.7, 0.4, P.black, 0, 10.3, 0, 0, 0, 0, 24);
    cyl(g, 0.6, 0.6, 0.8, P.silver, 0, 10.9, 0); add(g, new KG(0.6, 1.1, 20), P.silver, 0, 11.85, 0);
    strut(g, [0, 12.4, 0], [0, 14, 0], 0.03, P.grey); cyl(g, 0.18, 0.18, 0.9, P.white, 0, 13.3, 0); add(g, new KG(0.18, 0.5, 12), P.red || P.grey, 0, 14, 0);
    return g;
  };

  B.capsule = () => {
    const g = new Group();
    pedestal(g, 1.5);
    const c = new Group(); c.position.y = 0.3; g.add(c);
    add(c, new SG(2.4, 28, 6, 0, Math.PI * 2, 0, 0.6), mt(0x3a2f2a, { roughness: 1, metalness: 0.1, side: DoubleSide }), 0, 2.4, 0, Math.PI);
    cyl(c, 0.35, 1.36, 1.7, mt(0xd5d8dc, { metalness: 0.6 }), 0, 1.27, 0, 0, 0, 0, 32); cyl(c, 1.38, 1.38, 0.08, P.dark, 0, 0.47, 0, 0, 0, 0, 32);
    cyl(c, 0.38, 0.4, 0.3, P.grey, 0, 2.27, 0);
    box(c, 0.4, 0.28, 0.04, P.dark, 0, 1.3, 0.86, -0.536); box(c, 0.4, 0.28, 0.04, P.dark, 0.7, 1.3, 0.55, -0.536, 0.9);
    [0, 1.57, 3.14, 4.71].forEach((a) => box(c, 0.15, 0.15, 0.15, P.dark, Math.sin(a) * 0.55, 1.95, Math.cos(a) * 0.55));
    return g;
  };

  B.hubble = () => {
    const g = new Group();
    cyl(g, 0.18, 0.22, 1.4, P.grey, 0, 0.7, 0.7); cyl(g, 0.18, 0.22, 1.4, P.grey, 0, 0.7, -0.9); box(g, 1.4, 0.12, 2.6, P.grey, 0, 0.06, -0.1);
    const h = new Group(); h.position.set(0, 1.95, 0); g.add(h);
    cyl(h, 0.75, 0.75, 2.8, P.silver, 0, 0, 0, Math.PI / 2); cyl(h, 0.8, 0.8, 0.35, P.dark, 0, 0, 1.6, Math.PI / 2); cyl(h, 0.68, 0.68, 0.02, P.black, 0, 0, 1.78, Math.PI / 2);
    cyl(h, 0.95, 0.95, 1, mt(0xb99a45, { metalness: 0.7 }), 0, 0, -1.9, Math.PI / 2);
    [-1, 1].forEach((sx) => { strut(h, [sx * 0.9, 0, -1.4], [sx * 1.6, 0, -1.4], 0.04, P.grey); box(h, 2.4, 0.04, 1.2, P.solar, sx * 2.8, 0, -1.4); });
    strut(h, [0, 0.9, -1.9], [0, 1.6, -2.1], 0.03, P.grey); bowl(h, 0.3, P.dish, 0, 1.65, -2.1, 0.4);
    return g;
  };

  B.dish = () => {
    const g = new Group();
    cyl(g, 1.6, 1.9, 0.5, P.grey, 0, 0.25, 0, 0, 0, 0, 24); cyl(g, 0.9, 1.1, 2.2, P.white, 0, 1.6, 0, 0, 0, 0, 24);
    box(g, 3.2, 0.3, 0.6, P.white, 0, 2.8, 0); [-1.5, 1.5].forEach((x) => box(g, 0.4, 2, 0.6, P.white, x, 3.8, 0));
    const d = new Group(); d.position.set(0, 4.4, 0); d.rotation.x = 0.9; g.add(d);
    bowl(d, 3.2, P.dish, 0, 0, 0); cyl(d, 0.8, 1, 0.8, P.grey, 0, -0.35, 0);
    [0, 1.57, 3.14, 4.71].forEach((a) => strut(d, [Math.cos(a) * 3, 0.85, Math.sin(a) * 3], [0, 2.8, 0], 0.04, P.silver));
    sph(d, 0.35, P.silver, 0, 2.8, 0);
    return g;
  };

  B.landsat = () => {
    const g = new Group();
    box(g, 1.6, 0.15, 1.6, P.grey, 0, 0.08, 0); cyl(g, 0.25, 0.3, 1.1, P.dark, 0, 0.7, 0);
    const s = new Group(); s.position.y = 1.9; g.add(s);
    box(s, 1.2, 1.2, 1.8, P.gold, 0, 0, 0); box(s, 0.8, 0.5, 0.8, P.dark, 0, -0.8, 0.2);
    strut(s, [0.6, 0, 0], [1.3, 0, 0], 0.05, P.grey); box(s, 3.2, 0.04, 1.4, P.solar, 2.9, 0, 0);
    strut(s, [0, 0.6, -0.6], [0, 1.1, -0.6], 0.03, P.grey); bowl(s, 0.35, P.dish, 0, 1.15, -0.6, 0.2);
    return g;
  };

  B.juno = () => {
    const g = new Group();
    pedestal(g, 1.4); cyl(g, 0.25, 0.35, 1.3, P.dark, 0, 0.95, 0);
    const j = new Group(); j.position.y = 1.9; g.add(j);
    cyl(j, 0.8, 0.8, 0.9, P.silver, 0, 0, 0, 0, 0, 0, 6);
    bowl(j, 1.25, P.dish, 0, 0.5, 0); strut(j, [0, 0.5, 0], [0, 1.5, 0], 0.03, P.dark); sph(j, 0.08, P.dark, 0, 1.5, 0);
    for (let k = 0; k < 3; k++) { const ag = new Group(); ag.rotation.y = (k * Math.PI * 2) / 3; j.add(ag); strut(ag, [0.7, 0, 0], [1, 0, 0], 0.05, P.grey); box(ag, 3, 0.05, 1.1, P.solar, 2.5, 0, 0); if (k === 0) box(ag, 0.3, 0.3, 0.3, P.dark, 4.1, 0, 0); }
    return g;
  };

  B.galProbe = () => {
    const g = new Group();
    cyl(g, 1.33, 1.33, 0.12, P.gold, 0, 0.06, 0, 0, 0, 0, 32);
    add(g, new KG(1.3, 1.7, 32), mt(0x4a3a30, { roughness: 1, metalness: 0.1 }), 0, 0.97, 0);
    sph(g, 0.28, mt(0x2a211c, { roughness: 1 }), 0, 1.8, 0);
    add(g, new TG(0.85, 0.05, 6, 28), P.gold, 0, 0.5, 0, Math.PI / 2);
    return g;
  };

  B.voyager = () => {
    const g = new Group();
    for (let k = 0; k < 3; k++) { const a = (k * Math.PI * 2) / 3; strut(g, [0, 1.6, 0], [Math.cos(a), 0, Math.sin(a)], 0.04, P.grey); }
    const v = new Group(); v.position.y = 2; g.add(v);
    cyl(v, 0.55, 0.55, 0.45, P.silver, 0, 0, 0, 0, 0, 0, 10);
    bowl(v, 1.35, P.dish, 0, 0.25, 0); strut(v, [0, 0.25, 0], [0, 1.3, 0], 0.03, P.dark); sph(v, 0.07, P.dark, 0, 1.3, 0);
    cyl(v, 0.28, 0.28, 0.03, P.gold, 0.57, 0, 0, 0, 0, Math.PI / 2);
    strut(v, [-0.5, -0.1, 0], [-2.3, -0.1, 0], 0.04, P.grey);
    for (let i = 0; i < 3; i++) cyl(v, 0.12, 0.12, 0.5, P.dark, -1.2 - i * 0.55, -0.1, 0, 0, 0, Math.PI / 2);
    strut(v, [0.4, -0.2, 0.3], [1.9, -0.9, 0.6], 0.04, P.grey); box(v, 0.45, 0.3, 0.3, P.dark, 1.95, -0.95, 0.6);
    strut(v, [0, -0.25, -0.4], [0, -0.25, -2.6], 0.02, P.grey); box(v, 0.12, 0.12, 0.12, P.dark, 0, -0.25, -2.6);
    return g;
  };

  B.clipper = () => {
    const g = new Group();
    pedestal(g, 1.4); cyl(g, 0.25, 0.35, 1.3, P.dark, 0, 0.95, 0);
    const c = new Group(); c.position.y = 1.9; g.add(c);
    cyl(c, 0.7, 0.7, 1.5, P.silver, 0, 0, 0, 0, 0, 0, 10); cyl(c, 0.72, 0.72, 0.5, P.gold, 0, -0.4, 0, 0, 0, 0, 10);
    bowl(c, 1.35, P.dish, 0, 0.75, 0); strut(c, [0, 0.75, 0], [0, 1.7, 0], 0.03, P.dark); sph(c, 0.07, P.dark, 0, 1.7, 0);
    [-1, 1].forEach((sx) => { strut(c, [sx * 0.7, 0, 0], [sx * 1.3, 0, 0], 0.05, P.grey); for (let i = 0; i < 3; i++) box(c, 1.1, 0.04, 1.8, P.solar, sx * (1.9 + i * 1.2), 0, 0); });
    strut(c, [0, 0, -0.6], [0, 0, -3], 0.03, P.grey);
    return g;
  };

  B.pioneer = () => {
    const g = new Group();
    pedestal(g, 1.4); cyl(g, 0.25, 0.35, 1.3, P.dark, 0, 0.95, 0);
    const c = new Group(); c.position.y = 1.9; g.add(c);
    cyl(c, 0.5, 0.5, 0.45, P.silver, 0, -0.45, 0, 0, 0, 0, 6); bowl(c, 1.5, P.dish, 0, -0.2, 0);
    strut(c, [0, -0.2, 0], [0, 1, 0], 0.03, P.dark); box(c, 0.15, 0.15, 0.15, P.dark, 0, 1.05, 0);
    strut(c, [0.5, -0.5, 0], [2.3, -0.7, 0], 0.05, P.grey); strut(c, [-0.5, -0.5, 0], [-2.3, -0.7, 0], 0.05, P.grey);
    [1.4, 2.0].forEach((x) => { cyl(c, 0.12, 0.12, 0.55, P.dark, x, -0.62, 0, 0, 0, Math.PI / 2); cyl(c, 0.12, 0.12, 0.55, P.dark, -x, -0.62, 0, 0, 0, Math.PI / 2); });
    strut(c, [0, -0.6, 0.3], [0.2, -0.8, 2.6], 0.03, P.grey);
    box(c, 0.55, 0.35, 0.02, P.gold, 0.55, -0.55, 0.55, 0, 0.6, 0);
    return g;
  };

  B.cassini = () => {
    const g = new Group();
    pedestal(g, 1.6);
    cyl(g, 0.4, 0.6, 0.6, P.dark, 0, 0.6, 0); cyl(g, 0.8, 0.8, 1.2, P.gold, 0, 1.5, 0); cyl(g, 0.8, 0.8, 0.9, P.silver, 0, 2.55, 0);
    bowl(g, 2, P.dish, 0, 3, 0); [0, 2.09, 4.19].forEach((a) => strut(g, [Math.cos(a) * 1.9, 3.5, Math.sin(a) * 1.9], [0, 4.4, 0], 0.03, P.silver));
    sph(g, 0.12, P.dark, 0, 4.4, 0);
    [0, 2.09, 4.19].forEach((a) => { cyl(g, 0.18, 0.18, 0.8, P.dark, Math.cos(a) * 0.95, 1.9, Math.sin(a) * 0.95); strut(g, [0, 2.6, 0], [Math.cos(a + 0.5) * 2.8, 2.9, Math.sin(a + 0.5) * 2.8], 0.02, P.grey); });
    strut(g, [0.8, 2.5, 0], [3.4, 3, 0], 0.04, P.grey); box(g, 0.25, 0.25, 0.25, P.dark, 3.4, 3, 0); box(g, 0.5, 0.5, 0.9, P.dark, 0, 2.5, 0.85);
    return g;
  };

  B.huygens = () => {
    const g = new Group();
    cyl(g, 1.9, 1.9, 0.12, P.silver, 0, 0.06, 0, 0, 0, 0, 40);
    add(g, new KG(1.9, 0.8, 40), mt(0xc9852e, { roughness: 1, metalness: 0.05 }), 0, 0.52, 0);
    cyl(g, 0.45, 0.45, 0.2, P.grey, 0, 1, 0); sph(g, 0.15, P.dark, 0, 1.15, 0);
    for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3; cyl(g, 0.06, 0.06, 0.35, P.dark, Math.cos(a) * 1.1, 0.5, Math.sin(a) * 1.1); }
    return g;
  };

  B.dragonfly = () => {
    const g = new Group(), rm = new MS({ color: 0x333844, transparent: true, opacity: 0.35 });
    box(g, 1.5, 0.8, 2.3, P.white, 0, 1.4, 0);
    cyl(g, 0.3, 0.3, 1.2, P.dark, 0, 1.4, -1.5, Math.PI / 2); for (let i = 0; i < 4; i++) cyl(g, 0.4, 0.4, 0.03, P.grey, 0, 1.4, -1.9 + i * 0.25, Math.PI / 2);
    [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => {
      strut(g, [sx * 0.7, 1.6, sz * 0.9], [sx * 2, 1.9, sz * 2.1], 0.06, P.grey); cyl(g, 0.18, 0.18, 0.25, P.dark, sx * 2, 1.85, sz * 2.1);
      cyl(g, 0.95, 0.95, 0.03, rm, sx * 2, 2.02, sz * 2.1, 0, 0, 0, 28); cyl(g, 0.95, 0.95, 0.03, rm, sx * 2, 1.9, sz * 2.1, 0, 0, 0, 28);
      strut(g, [sx * 0.5, 1.0, sz * 0.8], [sx * 0.9, 0.04, sz * 1.3], 0.05, P.silver); cyl(g, 0.12, 0.12, 0.05, P.dark, sx * 0.9, 0.03, sz * 1.3);
    }));
    strut(g, [0, 1.8, 0.9], [0, 2.4, 0.9], 0.03, P.grey); box(g, 0.3, 0.2, 0.2, P.dark, 0, 2.45, 0.9); bowl(g, 0.35, P.dish, 0.4, 1.85, -0.6, -0.3);
    return g;
  };

  B.surveyor = () => {
    const g = new Group();
    for (let k = 0; k < 3; k++) {
      const lg = new Group(); lg.rotation.y = (k * Math.PI * 2) / 3; g.add(lg);
      strut(lg, [0.25, 0.9, 0], [1.15, 0.05, 0], 0.05, P.silver);
      cyl(lg, 0.22, 0.22, 0.06, P.grey, 1.15, 0.03, 0, 0, 0, 0, 16);
    }
    box(g, 1.2, 0.55, 1.2, P.silver, 0, 1.15, 0);
    [[0, 0.72], [0, -0.72]].forEach(([x, z]) => box(g, 0.7, 0.05, 0.6, P.solar, x, 1.45, z));
    box(g, 0.3, 0.28, 0.3, P.dark, 0.5, 1.35, 0.5);
    strut(g, [-0.3, 1.4, 0], [-0.3, 1.9, 0], 0.03, P.grey); box(g, 0.16, 0.16, 0.16, P.grey, -0.3, 1.95, 0);
    return g;
  };

  B.sojourner = () => {
    const g = new Group();
    box(g, 0.7, 0.3, 0.6, P.silver, 0, 0.45, 0); box(g, 0.66, 0.04, 0.56, P.solar, 0, 0.62, 0);
    [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => { strut(g, [sx * 0.3, 0.42, sz * 0.25], [sx * 0.5, 0.13, sz * 0.3], 0.03, P.grey); cyl(g, 0.14, 0.14, 0.09, P.dark, sx * 0.5, 0.14, sz * 0.3, 0, 0, Math.PI / 2, 14); }));
    strut(g, [0, 0.6, 0.3], [0, 0.85, 0.45], 0.02, P.grey); box(g, 0.14, 0.1, 0.1, P.dark, 0, 0.9, 0.45);
    return g;
  };

  return B;
}