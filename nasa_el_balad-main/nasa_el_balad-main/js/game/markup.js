export const MARKUP = `
<div id="fallback"><p>Your device can’t show 3D space, so pick a planet here!</p><div class="row"></div></div>
<div id="ui">
  <section class="hero" id="hero">
    <h1 class="brand">ATHAR</h1>
    <p class="tagline">Every Mission Leaves a Mark</p>
    
  </section>
  <div class="actions" id="actions">
    <button class="cta" id="start"><span>START YOUR JOURNEY 🚀</span></button>
  </div>
  <div id="picker"><p class="lead">Pick a planet to fly to!</p></div>
  <div id="hud"></div>
  <button class="chip" id="abort">↩ Back to space</button>
</div>
<div id="tip"></div><div id="flash"></div><div id="ctrl">W A S D / Arrows: move · Shift: run · Space: jump · Mouse: look · Wheel: zoom · E: explore · K: quiz · R: story puzzle</div><div id="stick"><i></i></div><button class="chip" id="jbtn">Jump</button>
<div id="exlabel"></div><div id="exhint"></div><button class="chip" id="ebtn">Explore</button><div id="expanel"></div>
<div id="narr">
  <div id="nimg-box" class="narr-img-box">
    <img id="nimg" alt="NASA Mission Visual" />
    <span id="ncap">NASA ARCHIVE</span>
  </div>
  <div class="narr-main">
    <div class="narr-wave" id="nw"><i></i><i></i><i></i><i></i><i></i></div>
    <div class="narr-body">
      <div class="narr-top"><b id="nname"></b><span id="ntag"></span></div>
      <p id="nsub"></p>
    </div>
    <div class="narr-btns">
      <button id="nreplay" title="Hear it again" aria-label="Hear this story again">🔊</button>
      <button id="nmute" title="Mute the voice" aria-label="Mute the narration">🔈</button>
      <input id="nvol" type="range" min="0" max="1" step="0.05" value="0.9" aria-label="Narration volume" />
    </div>
  </div>
</div>
<div id="land"><div class="card"><h2 id="lt"></h2><p id="ld"></p><button class="cta" id="back"><span>Choose another planet</span></button></div></div>
`;