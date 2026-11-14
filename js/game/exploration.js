import { createModels } from './models.js';
import { OBJECTS, PLANET_NOTES } from './objects.js';
import { createNarration } from './narration.js';
import { markExplored, setPlanet } from './progress.js';

const RANGE = 5; 
const PICK = 11; 

export function createExploration({ THREE, $, W, cam, A, hf, TOUCH, glowTex, getState }) {
  const models = createModels(THREE);
  const voice = createNarration({ $ });
  let narrated = null, heard = new Set();
  const label = $('exlabel'), panel = $('expanel'), ebtn = $('ebtn'), hintEl = $('exhint');
  const HC = new THREE.Color(0x00e5ff), v = new THREE.Vector3();
  const ray = new THREE.Raycaster(), p2 = new THREE.Vector2();
  const Add = THREE.AdditiveBlending;
  let list = [], focus = null, sel = null, talking = null, lastLabel = null, hintTimer = 0, planet = '';

  const dist = (o) => Math.hypot(A.position.x - o.d.x, A.position.z - o.d.z) - o.d.r;

  const PLACE = {}; 
  const MINR = 13, MAXR = 54; 

  function clear(x, z, r, placed, obs) {
    for (const p of placed) if (Math.hypot(x - p.x, z - p.z) < r + p.r + 2.5) return false;
    for (const o of obs) if (Math.hypot(x - o.x, z - o.z) < r + o.r + 1.6) return false;
    return true;
  }
  function flat(x, z, r) {
    let lo = 1e9, hi = -1e9;
    for (let k = 0; k < 8; k++) {
      const h = hf(x + Math.cos(k * 0.785) * r, z + Math.sin(k * 0.785) * r);
      if (h < lo) lo = h;
      if (h > hi) hi = h;
    }
    return hi - lo < 1.5;
  }
  function spot(r, placed, obs, needFlat) {
    for (let t = 0; t < 400; t++) {
      const a = Math.random() * Math.PI * 2, rad = Math.sqrt(Math.random()) * (MAXR - MINR) + MINR;
      const x = Math.cos(a) * rad, z = Math.sin(a) * rad;
      if (!clear(x, z, r, placed, obs)) continue;
      if (needFlat && !flat(x, z, r + 0.6)) continue;
      return { x, z };
    }
    return null;
  }
  function place(defs, obs) {
    const placed = [];
    for (const d of defs) {
      let s = spot(d.r, placed, obs, true) || spot(d.r, placed, obs, false);
      if (!s) {
        const a = Math.random() * Math.PI * 2;
        s = { x: Math.cos(a) * 20, z: Math.sin(a) * 20 };
      }
      placed.push({ ...d, x: s.x, z: s.z });
    }
    return placed;
  }

  const surfaceStyles = {
    Moon: { count: 350, kind: 'stones', color: 0xa2a3ad },
    Mars: { count: 450, kind: 'stones', color: 0xc47a4c },
    Earth: { count: 450, kind: 'grass', color: 0x477b3d },
    Jupiter: { count: 260, kind: 'clouds', color: 0xd9ba90 },
    Saturn: { count: 250, kind: 'ice', color: 0xb9ccdc },
  };
  const surfaceMaterials = new Map();

  function makeRockGeometry(segments = 12, rings = 8, seed = Math.random() * 1000) {
    const geometry = new THREE.SphereGeometry(1, segments, rings);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
      const roughness = 1 + 0.18 * Math.sin(x * 11.3 + z * 7.7 + seed) *
        Math.sin(y * 9.1 + x * 4.3 - seed * 0.7) +
        0.05 * Math.sin(z * 14.2 - y * 8.6 + seed * 0.4);
      positions.setXYZ(i, x * roughness, y * roughness, z * roughness);
    }
    geometry.computeVertexNormals();
    return geometry;
  }

  const environmentMaterials = new Set();

  function softenEnvironment() {
    for (const material of environmentMaterials) material.dispose();
    environmentMaterials.clear();

    const smoothRocks = new Map();
    const discarded = new Set();
    W.traverse((object) => {
      if (!object.isMesh || !object.geometry) return;
      const geometry = object.geometry;
      let softened = false;
      if (geometry.type === 'ConeGeometry' && geometry.parameters) {
        const { radius, height } = geometry.parameters;
        if (radius > 0 && height > 0) {
          const rounded = makeRockGeometry();
          rounded.scale(radius, height / 2, radius);
          rounded.computeVertexNormals();
          object.geometry = rounded;
          if (radius > 10) {
            object.scale.multiplyScalar(0.5);
            object.position.y += height * (0.25 - 0.4);
          } else if (height > radius * 3) {
            const previousScale = object.scale.y;
            object.scale.y *= 0.55;
            object.position.y -= height * previousScale * 0.225;
          }
          discarded.add(geometry);
          softened = true;
        }
      } else if (geometry.type === 'IcosahedronGeometry') {
        if (!smoothRocks.has(geometry)) smoothRocks.set(geometry, makeRockGeometry());
        object.geometry = smoothRocks.get(geometry);
        discarded.add(geometry);
        softened = true;
      }

      if (!softened) return;
      const originals = Array.isArray(object.material) ? object.material : [object.material];
      const materials = originals.map((original) => {
        if (!original) return original;
        const material = original.clone();
        if (material.color) material.color.multiplyScalar(0.82 + Math.random() * 0.32);
        if (material.roughness != null) material.roughness = Math.max(0.82, material.roughness);
        environmentMaterials.add(material);
        return material;
      });
      object.material = Array.isArray(object.material) ? materials : materials[0];
      for (const material of materials) {
        if (material && material.flatShading) {
          material.flatShading = false;
          material.needsUpdate = true;
        }
      }
    });
    for (const geometry of discarded) geometry.dispose();
  }

  function addSurfaceDetails(name, defs, obs) {
    const style = surfaceStyles[name];
    if (!style || !THREE.InstancedMesh) return;

    let geometry;
    if (style.kind === 'grass' || style.kind === 'ice') geometry = new THREE.ConeGeometry(0.18, 1, 5);
    else if (style.kind === 'clouds') geometry = new THREE.SphereGeometry(1, 10, 7);
    else geometry = makeRockGeometry(10, 7);

    let material = surfaceMaterials.get(name);
    if (!material) {
      material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.94,
        flatShading: false,
      });
      surfaceMaterials.set(name, material);
    }

    const mesh = new THREE.InstancedMesh(geometry, material, style.count);
    const dummy = new THREE.Object3D();
    const tint = new THREE.Color(style.color);
    let placed = 0;
    for (let i = 0; i < style.count * 3 && placed < style.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.sqrt(Math.random()) * 59;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      if (defs.some((o) => Math.hypot(x - o.x, z - o.z) < o.r + 1.2)) continue;

      const size = style.kind === 'clouds' ? 0.35 + Math.random() * 0.55 :
        style.kind === 'ice' ? 0.1 + Math.random() * 0.24 :
          style.kind === 'stones' ? 0.28 + Math.random() * 0.5 : 0.12 + Math.random() * 0.28;
      const ground = hf(x, z);
      if (style.kind === 'stones') {
        const scaleX = size * (0.8 + Math.random() * 0.8);
        const scaleZ = size * (0.8 + Math.random() * 0.8);
        dummy.position.set(x, ground + size * 0.48, z);
        dummy.scale.set(scaleX, size * 0.82, scaleZ);
        obs.push({ x, z, r: Math.max(scaleX, scaleZ) * 1.25 });
      } else if (style.kind === 'clouds') {
        dummy.position.set(x, ground + size * 0.4, z);
        dummy.scale.set(size * 1.4, size * 0.55, size * 1.2);
      } else {
        const height = size * (style.kind === 'ice' ? 2.4 : 1.8);
        dummy.position.set(x, ground + height * 0.5, z);
        dummy.scale.set(size, height, size);
      }
      dummy.rotation.set(Math.random() * 0.3, angle, Math.random() * 0.3);
      dummy.updateMatrix();
      mesh.setMatrixAt(placed, dummy.matrix);
      if (mesh.setColorAt) {
        tint.setHex(style.color).multiplyScalar(0.78 + Math.random() * 0.4);
        mesh.setColorAt(placed, tint);
      }
      placed++;
    }
    mesh.count = placed;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.receiveShadow = true;
    W.add(mesh);
  }

  let pv = null, pvraf = 0;
  function previewRenderer() {
    if (pv) return pv;
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.domElement.style.width = '100%';
    r.domElement.style.display = 'block';
    const scene = new THREE.Scene(), group = new THREE.Group();
    scene.add(group);
    scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(3, 5, 4); scene.add(key);
    const fill = new THREE.DirectionalLight(0x88ccff, 1.2);
    fill.position.set(-4, 1, -3); scene.add(fill);
    pv = { r, scene, group, cam: new THREE.PerspectiveCamera(34, 1.7, 0.1, 100) };
    return pv;
  }
  function startPreview(model, opt, box) {
    const p = previewRenderer();
    while (p.group.children.length) p.group.remove(p.group.children[0]);
    const g = models[model](opt || {});
    const bb = new THREE.Box3().setFromObject(g), size = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
    g.position.sub(c);
    g.scale.setScalar(2.1 / (Math.max(size.x, size.y, size.z) || 1));
    p.group.add(g);
    if (!box.contains(p.r.domElement)) box.appendChild(p.r.domElement);
    const w = Math.max(200, box.clientWidth || 300), h = Math.round(w * 0.55);
    p.r.setSize(w, h, true);
    p.cam.aspect = w / h; p.cam.position.set(0, 0.5, 3.3); p.cam.lookAt(0, 0, 0); p.cam.updateProjectionMatrix();
    cancelAnimationFrame(pvraf);
    const spin = () => { pvraf = requestAnimationFrame(spin); p.group.rotation.y += 0.012; p.r.render(p.scene, p.cam); };
    spin();
  }
  function stopPreview() { cancelAnimationFrame(pvraf); pvraf = 0; }

  function setup(name, obs) {
    planet = name; setPlanet(name);
    list = []; focus = null; lastLabel = null; close();
    voice.reset(); narrated = null; heard = new Set();
    if (!PLACE[name]) PLACE[name] = place(OBJECTS[name] || [], obs);
    const defs = PLACE[name];
    softenEnvironment();
    addSurfaceDetails(name, defs, obs);
    for (let i = obs.length - 1; i >= 0; i--) {
      const o = obs[i];
      if (!defs.some((d) => Math.hypot(o.x - d.x, o.z - d.z) < d.r + o.r + 0.4)) continue;
      const c = W.children.find((ch) => ch.position && ch.position.x === o.x && ch.position.z === o.z);
      if (c) W.remove(c);
      obs.splice(i, 1);
    }
    const gtex = glowTex('rgba(0,229,255,.9)');
    list = defs.map((d) => {
      const g = models[d.model](d.opt || {});
      g.rotation.y = d.yaw || 0;
      let y = hf(d.x, d.z);
      for (let k = 0; k < 6; k++) y = Math.min(y, hf(d.x + Math.cos(k * 1.047) * d.r * 0.8, d.z + Math.sin(k * 1.047) * d.r * 0.8));
      g.position.set(d.x, y - 0.03, d.z);
      const mats = [];
      g.traverse((o) => {
        if (!o.isMesh) return;
        o.material = o.material.clone();
        o.castShadow = o.receiveShadow = true;
        o.userData.exId = d.id;
        if (o.material.emissive) mats.push({ m: o.material, e: o.material.emissive.clone() });
      });
      const mk = new THREE.Group();
      mk.position.set(d.x, y, d.z);
      const ring = new THREE.Mesh(new THREE.RingGeometry(d.r + 0.45, d.r + 0.8, 56), new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, blending: Add, polygonOffset: true, polygonOffsetFactor: -2 }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.18;
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 7, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.18, depthWrite: false, blending: Add }));
      beam.position.y = d.h + 1.4 + 3.5;
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.3), new THREE.MeshBasicMaterial({ color: 0x7ff3ff, transparent: true, opacity: 0.9, blending: Add, depthWrite: false }));
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: gtex, blending: Add, transparent: true, depthWrite: false, opacity: 0.6 }));
      glow.scale.setScalar(2.4);
      mk.add(ring, beam, gem, glow);
      W.add(g, mk);
      obs.push({ x: d.x, z: d.z, r: d.r });
      return { d, g, mk, ring, beam, gem, glow, mats, h: 0, lit: false, y, ph: Math.random() * 6.28 };
    });
  }

  function tick(dt, t, active) {
    let best = null, bd = 1e9;
    if (active && !sel) for (const o of list) {
      const d = dist(o), reach = o === focus ? RANGE + 2.5 : RANGE;
      if (d < reach && d < bd) { bd = d; best = o; }
    }
    focus = best;
    
    // تم إلغاء التشغيل التلقائي هنا بناءً على طلبك، وأصبح يعتمد على ضغطة E
    if (focus) {
      if (focus !== narrated) {
        narrated = focus;
      }
    } else if (narrated) {
      narrated = null;
    }

    for (const o of list) {
      const tg = o === sel ? 1 : o === focus ? 0.7 : 0;
      o.h += (tg - o.h) * Math.min(1, dt * 8);
      const s = Math.sin(t * 2.2 + o.ph);
      o.ring.material.opacity = 0.28 + 0.12 * s + o.h * 0.45;
      o.ring.scale.setScalar(1 + o.h * 0.05 + 0.02 * s);
      o.beam.material.opacity = 0.14 + o.h * 0.2;
      o.gem.rotation.y = t * 1.5;
      o.gem.position.y = o.glow.position.y = o.d.h + 1.1 + Math.sin(t * 1.8 + o.ph) * 0.15;
      o.glow.material.opacity = 0.45 + 0.25 * s + o.h * 0.3;
      if (o.h > 0.002 || o.lit) {
        for (const m of o.mats) m.m.emissive.copy(m.e).lerp(HC, o.h * 0.4);
        o.lit = o.h > 0.002;
      }
    }
    if (focus) {
      if (lastLabel !== focus) {
        // تحديث رسالة التوجيه لتظهر زر E بشكل واضح
        label.innerHTML = `<b>${focus.d.name}</b><span>${TOUCH ? 'Tap to Talk' : 'Press E to Talk & View 3D'}</span>`;
        lastLabel = focus;
      }
      v.set(focus.d.x, focus.y + focus.d.h + 0.9, focus.d.z);
      cam.updateMatrixWorld();
      v.project(cam);
      if (v.z < 1) {
        label.style.display = 'block';
        label.style.left = Math.max(80, Math.min(innerWidth - 80, (v.x * 0.5 + 0.5) * innerWidth)) + 'px';
        label.style.top = Math.max(160, Math.min(innerHeight - 130, (-v.y * 0.5 + 0.5) * innerHeight)) + 'px';
      } else label.style.display = 'none';
    } else { label.style.display = 'none'; lastLabel = null; }
    ebtn.style.display = TOUCH && focus && !sel && !talking ? 'block' : 'none';
  }

  function hint(text) {
    hintEl.textContent = text; hintEl.style.display = 'block';
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => (hintEl.style.display = 'none'), 2000);
  }

  function open(o) {
    voice.stop();
    sel = o;
    const d = o.d;
    markExplored(planet, d.id);
    const facts = (d.facts || []).map((f) => `<li>${f}</li>`).join('');
    const note = PLANET_NOTES[planet] ? `<p class="ex-note">${PLANET_NOTES[planet]}</p>` : '';
    panel.innerHTML = `<div class="ex-card" data-object-id="${d.id}">
      <button class="ex-x" data-close aria-label="Close">✕</button>
      <span class="ex-tag">${planet} · ${d.mission}</span>
      <h2>${d.name}</h2>
      <p class="ex-meta">${d.year} · ${d.agency}</p>
      <div class="ex-preview"></div>
      ${note}
      <section class="ex-sec"><h3>What is it?</h3><p>${d.what}</p></section>
      <section class="ex-sec"><h3>What was it used for?</h3><p>${d.used}</p></section>
      <section class="ex-sec"><h3>Why did NASA send it?</h3><p>${d.why}</p></section>
      <section class="ex-sec"><h3>Fun facts</h3><ul class="ex-facts">${facts}</ul></section>
      <section class="ex-sec"><h3>What happened to it?</h3><p>${d.fate}</p></section>
      <button class="cta" data-close><span>Keep exploring</span></button>
    </div>`;
    panel.style.display = 'flex';
    label.style.display = 'none'; ebtn.style.display = 'none';
    if (document.exitPointerLock) document.exitPointerLock();
    startPreview(d.model, d.opt, panel.querySelector('.ex-preview'));
    document.dispatchEvent(new CustomEvent('explorer:object-selected', { detail: { ...d, planet } }));
  }

  function close() { sel = null; panel.style.display = 'none'; stopPreview(); }
  panel.onclick = (e) => { if (e.target.closest('[data-close]')) close(); };

  // عند الضغط على E أو التفاعل، يبدأ الجهاز الكلام وصور ناسا، ومع نهاية الكلام تفتح البانل لوحدها
function toggle() { 
    if (talking) return;
    if (getState() !== 'surface') return; 
    if (sel) {
      close(); 
    } else if (focus) {
      if (dist(focus) > PICK) { 
        hint(`Walk closer to explore the ${focus.d.name}!`); 
        return; 
      }
      if (!voice.isSupported()) {
        open(focus);
        return;
      }
      markExplored(planet, focus.d.id);
      
      // الخروج من وضع التحكم الحر في اللعبة
      if (document.exitPointerLock) document.exitPointerLock();

      // إخفاء واجهة اللعبة (العالم من حولك) والتركيز على الجهاز في الفضاء
      const gameWorldContainer = document.getElementById('game-container') || document.body;
      // يمكنك إضافة كลาส لإخفاء الأزرار وعالم اللعبة المؤقت هنا لو حابة

      // بدء السرد السينمائي للجهاز في الفضاء مع صوره، وعند النهاية تفتح البانل
      const target = focus;
      voice.speak(target.d, planet, () => {
        talking = null;
        A.visible = true;
        open(target); // فتح البانل بعد انتهاء القصة
      }, null, () => {
        talking = target;
        A.visible = false;
      });
    } 
  }

  function click(e) {
    if (!list.length) return false;
    const locked = !!document.pointerLockElement;
    p2.set(locked ? 0 : (e.clientX / innerWidth) * 2 - 1, locked ? 0 : -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(p2, cam);
    const h = ray.intersectObjects(list.map((o) => o.g), true)[0];
    let o = h && list.find((x) => x.d.id === h.object.userData.exId);
    if (!o && locked) o = focus;
    if (!o) return false;
    
    // الضغط بالماوس ينفذ نفس فكرة زر E (يبدأ الكلام أولاً)
    if (dist(o) > PICK) { hint(`Walk closer to explore the ${o.d.name}!`); return true; }
    if (!voice.isSupported()) {
      open(o);
      return true;
    }
    markExplored(planet, o.d.id);
    voice.speak(o.d, planet, () => {
      talking = null;
      A.visible = true;
      open(o);
    }, null, () => {
      talking = o;
      A.visible = false;
    });
    return true;
  }

  function reset() {
    setPlanet(null);
    close(); focus = null; lastLabel = null; list = [];
    talking = null;
    A.visible = true;
    voice.stop(); narrated = null;
    label.style.display = 'none'; ebtn.style.display = 'none'; hintEl.style.display = 'none';
  }

  

  return {
    setup,
    tick,
    toggle,
    click,
    close,
    reset,
    unlock: voice.unlock,
    isOpen: () => !!sel || !!talking,
    cameraTarget: () => talking ? {
      x: talking.d.x,
      y: talking.y + talking.d.h + 0.9,
      z: talking.d.z,
    } : null,
  };
}