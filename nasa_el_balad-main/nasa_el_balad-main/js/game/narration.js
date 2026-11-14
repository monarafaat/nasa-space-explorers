import { SCRIPTS } from './narrationScripts.js';

const YOUNG = /child|kid|junior|little|girl|young|tiny/;
const FEMALE =
  /female|woman|samantha|karen|moira|tessa|fiona|serena|aria|jenny|michelle|zira|susan|hazel|natasha|libby|sonia|maisie|amelie|ava|allison|joanna|kendra|salli|kimberly|ivy|emma|nicky|martha|alice|google uk english female|google us english/;
const MALE =
  /\bmale\b|\bman\b|david|daniel|fred|george|james|\bmark\b|\btom\b|guy|ryan|oliver|arthur|nathan|aaron|gordon|rishi|diego|jorge|lee\b/;

const PITCH = 1.38;
const RATE = 1.03;

const NASA_QUERIES = {
  'moon-flag': 'Apollo 11 flag moon surface',
  'moon-lm': 'Apollo 11 Lunar Module Eagle',
  'moon-lrv': 'Apollo Lunar Roving Vehicle moon',
  'moon-alsep': 'Apollo ALSEP moon surface',
  'moon-retro': 'Apollo laser reflector moon',
  'moon-surveyor': 'Surveyor 3 moon Apollo 12',
  'mars-perseverance': 'Perseverance rover Mars Jezero',
  'mars-ingenuity': 'Ingenuity helicopter Mars flight',
  'mars-curiosity': 'Curiosity rover Mars Gale Crater',
  'mars-viking': 'Viking 1 lander Mars surface',
  'mars-spirit': 'Spirit rover Mars',
  'mars-opportunity': 'Opportunity rover Mars',
  'mars-sojourner': 'Sojourner rover Mars Pathfinder',
  'earth-capsule': 'Apollo Command Module splashdown',
  'earth-saturn': 'Saturn V rocket launch Apollo',
  'earth-hubble': 'Hubble Space Telescope orbit',
  'earth-dish': 'NASA Deep Space Network antenna',
  'earth-landsat': 'Landsat Earth from space',
  'jup-galileo': 'Galileo spacecraft Jupiter',
  'jup-juno': 'Juno spacecraft Jupiter poles',
  'jup-voyager1': 'Voyager 1 Jupiter Io',
  'jup-clipper': 'Europa Clipper Jupiter moon',
  'jup-pioneer10': 'Pioneer 10 Jupiter',
  'sat-cassini': 'Cassini Saturn rings',
  'sat-huygens': 'Huygens Titan surface',
  'sat-dragonfly': 'Dragonfly Titan NASA',
  'sat-voyager2': 'Voyager 2 Uranus Neptune',
  'sat-pioneer11': 'Pioneer 11 Saturn',
};
const imageCache = new Map();

function selectNasaImage(item) {
  const links = Array.isArray(item?.links) ? item.links : [];
  const preferred = links.find((link) => {
    if (!link || typeof link.href !== 'string') return false;
    const href = link.href.toLowerCase();
    const isImage = link.render === 'image' || /\.(png|jpe?g|gif|webp|bmp|tiff?|avif)(?:$|[?#])/i.test(href);
    return isImage;
  }) || links.find((link) => link && typeof link.href === 'string' && link.render === 'image');

  if (preferred?.href) return preferred.href;

  const nasaId = item?.data?.[0]?.nasa_id;
  if (nasaId) return `https://images-assets.nasa.gov/image/${nasaId}/${nasaId}~medium.jpg`;

  return null;
}



async function fetchNasaSlides(obj) {
  if (imageCache.has(obj.id)) return imageCache.get(obj.id);
  const query = NASA_QUERIES[obj.id] || `${obj.name} ${obj.mission} NASA`;
  try {
    const res = await fetch(
      `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`
    );
    const data = await res.json();
    const items = (data?.collection?.items || []).slice(0, 8);
    const slides = items
      .map((item) => ({
        url: selectNasaImage(item),
        title: item.data?.[0]?.title || obj.mission,
      }))
      .filter((s) => s.url);
    imageCache.set(obj.id, slides);
    return slides;
  } catch (e) {
    return [];
  }
}

export function createNarration({ $ }) {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const Utt = typeof window !== 'undefined' ? window.SpeechSynthesisUtterance : null;
  const supported = !!(synth && Utt);
  const box = $('narr');
  if (!supported || !box) {
    return { speak() {}, stop() {}, reset() {}, unlock() {}, isMuted: () => true, isSupported: () => false };
  }

  const nameEl = $('nname'), tagEl = $('ntag'), subEl = $('nsub'), wave = $('nw');
  const replayBtn = $('nreplay'), muteBtn = $('nmute'), volEl = $('nvol');
  const imgBox = $('nimg-box'), imgEl = $('nimg'), capEl = $('ncap');

  let voice = null, lines = [], slides = [], at = 0, tok = 0, cur = null, curPlanet = '';
  let muted = false, vol = 0.9, speaking = false, unlocked = false, hideT = 0;
  let onFinishCallback = null;

  try {
    const s = JSON.parse(localStorage.getItem('athar-voice') || '{}');
    if (typeof s.vol === 'number') vol = Math.max(0, Math.min(1, s.vol));
    muted = !!s.muted;
  } catch (e) {}

  const save = () => {
    try {
      localStorage.setItem('athar-voice', JSON.stringify({ vol, muted }));
    } catch (e) {}
  };

  function rank() {
    const all = synth.getVoices() || [];
    let best = -1e9;
    for (const v of all) {
      const n = `${v.name} ${v.voiceURI}`.toLowerCase();
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      let s = l.startsWith('en') ? 20 : -60;
      if (YOUNG.test(n)) s += 70;
      if (FEMALE.test(n)) s += 40;
      if (MALE.test(n)) s -= 45;
      if (v.localService) s += 10;
      if (l === 'en-gb' || l === 'en-us') s += 8;
      if (/google|natural|neural|premium|enhanced/.test(n)) s += 14;
      if (s > best) {
        best = s;
        voice = v;
      }
    }
  }
  rank();
  try {
    synth.addEventListener('voiceschanged', rank);
  } catch (e) {
    synth.onvoiceschanged = rank;
  }

  function show(on) {
    if (on) {
      box.style.display = 'flex';
      // خلفية شفافة تظهر كوكب اللعبة من خلفها من غير فضاء أسود
      box.style.background = 'rgba(5, 8, 15, 0.55)';
      box.style.backdropFilter = 'blur(4px)';
    } else {
      box.style.display = 'none';
    }
  }
  function schedule(ms) {
    clearTimeout(hideT);
    hideT = setTimeout(() => {
      if (!speaking) show(false);
    }, ms);
  }
  function paint() {
    muteBtn.textContent = muted ? '🔇' : '🔈';
    muteBtn.classList.toggle('off', muted);
    muteBtn.title = muted ? 'Unmute the voice' : 'Mute the voice';
    muteBtn.setAttribute('aria-label', muteBtn.title);
    volEl.value = String(vol);
  }
  paint();

  function updateSlide(index) {
    if (!imgBox || !imgEl) return;
    if (!slides.length) {
      imgBox.classList.remove('active');
      if (capEl) capEl.textContent = 'NASA ARCHIVE';
      return;
    }

    const slide = slides[index % slides.length];
    imgBox.classList.add('active');
    imgEl.classList.remove('show');

    const tryLoad = (candidate, nextIndex) => {
      const loader = new Image();
      loader.onload = () => {
        imgEl.src = candidate.url;
        if (capEl) capEl.textContent = `NASA · ${candidate.title.slice(0, 48)}`;
        requestAnimationFrame(() => imgEl.classList.add('show'));
      };
      loader.onerror = () => {
        const fallback = slides[nextIndex % slides.length];
        if (fallback && fallback.url !== candidate.url) {
          tryLoad(fallback, nextIndex + 1);
          return;
        }
        imgBox.classList.remove('active');
        if (capEl) capEl.textContent = 'NASA ARCHIVE';
      };
      loader.src = candidate.url;
    };

    tryLoad(slide, index + 1);
  }

  function scriptFor(o) {
    if (SCRIPTS[o.id]) return SCRIPTS[o.id];
    const bits = [`Hi! I’m ${o.name}.`];
    if (o.what) bits.push(o.what);
    if (o.used) bits.push(o.used);
    if (o.why) bits.push(o.why);
    const f = (o.facts || []).slice(0, 2);
    if (f.length) bits.push(`Here’s the cool part: ${f.join(' And ')}`);
    return bits.join(' ');
  }

  function sentences(text) {
    const out = [];
    let s = '';
    for (const w of text.trim().split(/\s+/)) {
      s += (s ? ' ' : '') + w;
      if (/[.!?…]["'’]?$/.test(w) && s.length > 26) {
        out.push(s);
        s = '';
      }
    }
    if (s) out.push(s);
    return out;
  }

  function finish() {
    const cb = onFinishCallback;
    onFinishCallback = null;
    if (typeof cb === 'function') cb();
  }

  function next() {
    if (!lines.length) return;
    if (at >= lines.length) {
      speaking = false;
      wave.classList.remove('on');
      at = 0;
      schedule(500);
      finish();
      return;
    }
    const my = tok;
    const currentIdx = at;
    const u = new Utt(lines[currentIdx]);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    }
    u.pitch = PITCH;
    u.rate = RATE;
    u.volume = muted ? 0 : vol;
    subEl.textContent = lines[currentIdx];
    
    updateSlide(currentIdx);
    
    at++;
    u.onstart = () => {
      if (my !== tok) return;
      speaking = true;
      wave.classList.add('on');
    };
    u.onend = () => {
      if (my !== tok) return;
      next();
    };
    u.onerror = () => {
      if (my !== tok) return;
      speaking = false;
      wave.classList.remove('on');
      finish();
    };
    try {
      if (synth.paused) synth.resume();
      synth.speak(u);
    } catch (e) {
      speaking = false;
      finish();
    }
  }

  function stop() {
    tok++;
    lines = [];
    slides = [];
    at = 0;
    speaking = false;
    onFinishCallback = null;
    try {
      synth.cancel();
    } catch (e) {}
    wave.classList.remove('on');
    if (imgBox) imgBox.classList.remove('active');
    clearTimeout(hideT);
    show(false);
  }

  function speak(obj, planetName, onComplete, startPreviewCallback, onStart) {
    if (!obj) return;
    stop();
    cur = obj;
    curPlanet = planetName || '';
    onFinishCallback = onComplete;
    
    const text = scriptFor(obj);
    if (!text) return;
    lines = sentences(text);
    at = 0;
    nameEl.textContent = obj.name;
    tagEl.textContent = curPlanet ? `${curPlanet} · ${obj.mission}` : obj.mission || '';
    paint();
    show(true);

    // التأكد من تشغيل عرض الـ 3D الحقيقي للجهاز أثناء التحدث مع الحفاظ على كوكب الخلفية
    if (typeof startPreviewCallback === 'function') {
      // بنشوف لو فيه مكان مخصص للـ 3D أو بنستخدم imgBox كحاضن
      const targetContainer = box.querySelector('.ex-preview') || imgBox;
      if (targetContainer) {
        startPreviewCallback(obj.model, obj.opt, targetContainer);
      }
    }

    if (typeof onStart === 'function') onStart();
    const my = tok;
    fetchNasaSlides(obj).then((fetchedSlides) => {
      if (my !== tok) return;
      slides = fetchedSlides;
      if (slides.length) updateSlide(Math.max(0, at - 1));
    });
    if (my === tok) next();
  }

  replayBtn.onclick = () => {
    if (muted) {
      muted = false;
      paint();
      save();
    }
    // ملاحظة: الـ replay سيعيد تشغيل السرد
  };
  muteBtn.onclick = () => {
    const wasMuted = muted;
    const current = cur;
    const completion = onFinishCallback;
    muted = !muted;
    paint();
    save();
    if (muted) {
      finish();
      stop();
    } else if (wasMuted && current) {
      speak(current, curPlanet, completion);
    }
  };
  volEl.oninput = () => {
    vol = Math.max(0, Math.min(1, Number(volEl.value)));
    save();
  };

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    try {
      const u = new Utt(' ');
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      }
      u.volume = 0;
      synth.speak(u);
    } catch (e) {}
  }

  return {
    speak,
    stop,
    unlock,
    reset: () => {
      stop();
      cur = null;
      curPlanet = '';
    },
    isMuted: () => muted,
    isSupported: () => true,
  };
}