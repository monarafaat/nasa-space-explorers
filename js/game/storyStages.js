// Picture stages for "Rebuild My Story" — the visual story puzzle.
// Every stage is real mission history for that object, in true chronological
// order. s = illustration scene, g = the picture's symbol, t = tiny label,
// v = the child-friendly line read by the audio button, d = real date.
import { OBJECTS } from './objects.js';
import { CLUES } from './challenges.js';

export const PALETTES = {
  Moon: { sky1: '#070c24', sky2: '#1d2c66', ground: '#a8adba', ground2: '#5f6674', accent: '#9fe9ff', sun: '#e6ecff' },
  Mars: { sky1: '#3d140d', sky2: '#c4693a', ground: '#b1512a', ground2: '#6f2f18', accent: '#ffb36b', sun: '#ffdca8' },
  Earth: { sky1: '#041a33', sky2: '#1e74b8', ground: '#2f7a41', ground2: '#1a4526', accent: '#8ff0c8', sun: '#fff3c4' },
  Jupiter: { sky1: '#2a112e', sky2: '#8a5330', ground: '#d3a271', ground2: '#8b6242', accent: '#ffcf8a', sun: '#ffe9c8' },
  Saturn: { sky1: '#140d34', sky2: '#514074', ground: '#d4c295', ground2: '#8e7c58', accent: '#ffe9a8', sun: '#fff8d8' },
};

export const STORY = {
  'moon-flag': [
    { s: 'launch', g: '🚀', t: 'Rocket blasts off', d: '16 Jul 1969', v: 'First, the giant Saturn V rocket lifted off from Earth carrying three astronauts.' },
    { s: 'descend', g: '🌙', t: 'Eagle touches down', d: '20 Jul 1969', v: 'Then the Eagle lander came down slowly and touched the Moon.' },
    { s: 'surface', g: '🚩', t: 'Flag is planted', d: '20 Jul 1969', v: 'Next, the astronauts pushed a flag into the grey dust for the whole world to see.' },
    { s: 'pad', g: '🚩', t: 'Five more flags', d: '1969–1972', v: 'Finally, five more Apollo crews flew to the Moon and planted five more flags.' },
  ],
  'moon-lm': [
    { s: 'launch', g: '🚀', t: 'Saturn V launches', d: '16 Jul 1969', v: 'First, a giant rocket pushed Apollo 11 off the Earth and toward the Moon.' },
    { s: 'orbit', g: '🌕', t: 'Circles the Moon', d: '19 Jul 1969', v: 'Then the spacecraft swung into orbit and circled the Moon again and again.' },
    { s: 'descend', g: '🛬', t: 'Eagle flies down', d: '20 Jul 1969', v: 'Next, the Eagle lander separated and floated down to the surface.' },
    { s: 'surface', g: '👨🚀', t: 'Astronauts walk', d: '21 Jul 1969', v: 'Finally, two astronauts climbed out and walked on the Moon.' },
  ],
  'moon-lrv': [
    { s: 'launch', g: '🚀', t: 'Flies to the Moon', d: '1971', v: 'First, the Apollo 15 rocket carried the folded-up rover all the way to the Moon.' },
    { s: 'descend', g: '🛬', t: 'Lands with the crew', d: 'Jul 1971', v: 'Then the rover came down inside the lander with the astronauts.' },
    { s: 'surface', g: '🚙', t: 'Unfolds like a case', d: '31 Jul 1971', v: 'Next, the crew unfolded the little car and it stood up on its wheels.' },
    { s: 'drive', g: '🚙', t: 'First lunar drive', d: '1971–1972', v: 'Finally, they drove across the Moon, far away from their lander.' },
  ],
  'moon-alsep': [
    { s: 'launch', g: '🚀', t: 'Carried by Apollo', d: 'Nov 1969', v: 'First, a rocket carried the science station all the way to the Moon.' },
    { s: 'descend', g: '📦', t: 'Brought to the ground', d: 'Nov 1969', v: 'Then the astronauts carried the boxes down to the flat ground.' },
    { s: 'surface', g: '📡', t: 'Set up on the Moon', d: 'Nov 1969', v: 'Next, they set the station up and switched it on.' },
    { s: 'sky', g: '📈', t: 'Eight years of data', d: '1969–1977', v: 'Finally, the station sent measurements home to Earth for up to eight years.' },
  ],
  'moon-retro': [
    { s: 'launch', g: '🚀', t: 'Flies with Apollo', d: 'Jul 1969', v: 'First, the little mirror panel flew to the Moon inside the Apollo spacecraft.' },
    { s: 'descend', g: '🪞', t: 'Comes down gently', d: 'Jul 1969', v: 'Then the lander brought it safely down to the surface.' },
    { s: 'surface', g: '🪞', t: 'Placed on the ground', d: 'Jul 1969', v: 'Next, the astronauts set the mirror on the ground and aimed it at Earth.' },
    { s: 'sky', g: '🔦', t: 'Laser bounces back', d: 'Today', v: 'Finally, scientists still fire lasers at it and the light bounces straight back.' },
  ],
  'moon-surveyor': [
    { s: 'launch', g: '🚀', t: 'Surveyor launches', d: 'Apr 1967', v: 'First, the Surveyor 3 robot blasted off toward the Moon.' },
    { s: 'descend', g: '🛬', t: 'Bounces, then stops', d: 'Apr 1967', v: 'Then it landed softly, bounced three times and came to rest.' },
    { s: 'surface', g: '📷', t: 'Pictures from the Moon', d: '1967', v: 'Next, it took more than six thousand pictures of the ground.' },
    { s: 'sample', g: '📦', t: 'Visited by Apollo 12', d: 'Nov 1969', v: 'Finally, two astronauts walked over and carried its camera home.' },
  ],

  'mars-perseverance': [
    { s: 'launch', g: '🚀', t: 'Launches in 2020', d: '30 Jul 2020', v: 'First, Perseverance launched on a rocket from Florida.' },
    { s: 'descend', g: '🪂', t: 'Sky-crane landing', d: '18 Feb 2021', v: 'Then a rocket lowered it on cables into Jezero Crater.' },
    { s: 'surface', g: '🧪', t: 'Makes oxygen', d: 'Apr 2021', v: 'Next, it turned the Martian air into oxygen for the first time.' },
    { s: 'sample', g: '🧫', t: 'Drops sample tubes', d: 'Dec 2022', v: 'Finally, it left rock samples on the ground for a future mission.' },
  ],
  'mars-ingenuity': [
    { s: 'cruise', g: '🚁', t: 'Folded under the rover', d: '30 Jul 2020', v: 'First, the tiny helicopter flew to Mars folded up under the rover.' },
    { s: 'descend', g: '🪂', t: 'Arrives on Mars', d: '18 Feb 2021', v: 'Then it landed inside the rover and waited for the dust to settle.' },
    { s: 'surface', g: '🚁', t: 'First flight', d: '19 Apr 2021', v: 'Next, it spun its blades fast and lifted into the Martian sky.' },
    { s: 'sky', g: '🗺️', t: 'Scouts from above', d: '2021–2024', v: 'Finally, it flew 72 times and showed the rover where to drive.' },
  ],
  'mars-curiosity': [
    { s: 'launch', g: '🚀', t: 'Launches in 2011', d: '26 Nov 2011', v: 'First, Curiosity left Earth on a rocket.' },
    { s: 'descend', g: '🪂', t: 'Lands by sky crane', d: '6 Aug 2012', v: 'Then a rocket lowered it into Gale Crater on cables.' },
    { s: 'surface', g: '⛏️', t: 'Drills a rock', d: 'Feb 2013', v: 'Next, it drilled into a rock and found clay that formed in water.' },
    { s: 'drive', g: '🚙', t: 'Climbs the mountain', d: '2014', v: 'Finally, it drove to Mount Sharp and began to climb.' },
  ],
  'mars-viking': [
    { s: 'launch', g: '🚀', t: 'Viking launches', d: '20 Aug 1975', v: 'First, the Viking spacecraft flew from Earth toward Mars.' },
    { s: 'descend', g: '🪂', t: 'Lands on Mars', d: '20 Jul 1976', v: 'Then its lander dropped through the sky and touched down.' },
    { s: 'surface', g: '📷', t: 'First Mars picture', d: 'Jul 1976', v: 'Next, it sent the very first photograph ever taken from the surface of Mars.' },
    { s: 'sky', g: '📡', t: 'Six years of news', d: '1976–1982', v: 'Finally, it kept radioing home to Earth for six years.' },
  ],
  'mars-spirit': [
    { s: 'launch', g: '🚀', t: 'Spirit launches', d: '10 Jun 2003', v: 'First, Spirit blasted off toward Mars.' },
    { s: 'descend', g: '🪂', t: 'Bounces in airbags', d: '4 Jan 2004', v: 'Then it hit the ground wrapped in airbags and bounced to a stop.' },
    { s: 'drive', g: '🚙', t: 'Climbs Husband Hill', d: 'Aug 2005', v: 'Next, it drove all the way up Husband Hill.' },
    { s: 'surface', g: '🕳️', t: 'Stuck in the sand', d: '2009–2010', v: 'Finally, it sank into soft sand and sent its last signal.' },
  ],
  'mars-opportunity': [
    { s: 'launch', g: '🚀', t: 'Launches in 2003', d: '7 Jul 2003', v: 'First, Opportunity flew away from Earth on a rocket.' },
    { s: 'descend', g: '🪂', t: 'Airbag landing', d: '25 Jan 2004', v: 'Then it bounced to a stop inside its airbags.' },
    { s: 'sample', g: '🪨', t: 'Finds salty water', d: '2004', v: 'Next, it studied rocks and found minerals that only form in salty water.' },
    { s: 'sky', g: '🌪️', t: 'Dust storm ends it', d: 'Jun 2018', v: 'Finally, a giant dust storm covered the Sun and the rover fell silent.' },
  ],
  'mars-sojourner': [
    { s: 'launch', g: '🚀', t: 'Pathfinder launches', d: '4 Dec 1996', v: 'First, the Pathfinder spacecraft carried Sojourner to Mars.' },
    { s: 'descend', g: '🪂', t: 'Bounces on airbags', d: '4 Jul 1997', v: 'Then it landed on Mars with a big bounce.' },
    { s: 'surface', g: '🛒', t: 'Rolls off the ramp', d: '6 Jul 1997', v: 'Next, the little rover rolled down its ramp onto the red ground.' },
    { s: 'sample', g: '🪨', t: 'Studies the rocks', d: '1997', v: 'Finally, it drove up to nearby rocks and measured them.' },
  ],

  'earth-capsule': [
    { s: 'launch', g: '🚀', t: 'Launches on Saturn V', d: '1968', v: 'First, the capsule rode the Saturn V rocket into space.' },
    { s: 'orbit', g: '🌕', t: 'Flies around the Moon', d: 'Dec 1968', v: 'Then Apollo 8 carried three astronauts all the way around the Moon.' },
    { s: 'descend', g: '🪂', t: 'Falls toward Earth', d: 'Jul 1969', v: 'Next, the capsule fell back through the air under three parachutes.' },
    { s: 'splash', g: '🚢', t: 'Splashes into the sea', d: 'Jul 1969', v: 'Finally, it splashed into the ocean and a ship picked up the crew.' },
  ],
  'earth-saturn': [
    { s: 'pad', g: '🏗️', t: 'Built on the pad', d: '1967', v: 'First, the towering rocket stood on the launch pad with its tower beside it.' },
    { s: 'launch', g: '🚀', t: 'Lifts off', d: '9 Nov 1967', v: 'Then its engines fired and it climbed into the sky.' },
    { s: 'orbit', g: '🌕', t: 'Carries crews to the Moon', d: '16 Jul 1969', v: 'Next, it pushed Apollo 11 all the way to the Moon.' },
    { s: 'pad', g: '🛰️', t: 'Last flight to Skylab', d: '14 May 1973', v: 'Finally, its very last flight carried the Skylab station into orbit.' },
  ],
  'earth-hubble': [
    { s: 'launch', g: '🛰️', t: 'Shuttle carries it up', d: '24 Apr 1990', v: 'First, a space shuttle carried the telescope up above Earth’s air.' },
    { s: 'orbit', g: '🌍', t: 'Circles the Earth', d: '1990', v: 'Then it began circling our planet every 95 minutes.' },
    { s: 'cruise', g: '👨🚀', t: 'Fixed by astronauts', d: 'Dec 1993', v: 'Next, astronauts flew out to it and repaired its blurry mirror.' },
    { s: 'sky', g: '🌌', t: 'Sees distant galaxies', d: '1995', v: 'Finally, it stared at an empty patch of sky and found thousands of galaxies.' },
  ],
  'earth-dish': [
    { s: 'surface', g: '📡', t: 'First big dish', d: '1958', v: 'First, NASA built a huge dish out in the California desert.' },
    { s: 'orbit', g: '🌍', t: 'Stations around Earth', d: '1960s', v: 'Then more dishes opened in Spain and Australia, so no spacecraft is ever out of sight.' },
    { s: 'orbit', g: '🛰️', t: 'Talks to Voyager', d: '1977', v: 'Next, the dishes began listening to the Voyager spacecraft.' },
    { s: 'sky', g: '📻', t: 'Still listening today', d: 'Today', v: 'Finally, they still hear Voyager 1 far beyond the planets.' },
  ],
  'earth-landsat': [
    { s: 'launch', g: '🛰️', t: 'Landsat 1 launches', d: '23 Jul 1972', v: 'First, the Landsat satellite launched into orbit.' },
    { s: 'orbit', g: '🌍', t: 'Circles the planet', d: '1972', v: 'Then it began circling Earth and photographing the land below.' },
    { s: 'sky', g: '🗺️', t: 'Sees the land change', d: '1980s–2013', v: 'Next, newer Landsat satellites took sharper pictures of forests, farms and cities.' },
    { s: 'surface', g: '🌾', t: 'Helps farms and fires', d: 'Today', v: 'Finally, its pictures help farmers grow food and firefighters fight fires.' },
  ],

  'jup-galileo': [
    { s: 'launch', g: '🚀', t: 'Launches from a shuttle', d: 'Oct 1989', v: 'First, a space shuttle carried the Galileo spacecraft into space.' },
    { s: 'cruise', g: '🛰️', t: 'Six years to Jupiter', d: '1989–1995', v: 'Then the spacecraft travelled for six years to reach Jupiter.' },
    { s: 'impact', g: '☄️', t: 'Probe dives in', d: '7 Dec 1995', v: 'Next, its cone-shaped probe dived into Jupiter’s clouds.' },
    { s: 'sky', g: '🌡️', t: '58 minutes of data', d: 'Dec 1995', v: 'Finally, it measured the air and sent data home for 58 minutes.' },
  ],
  'jup-juno': [
    { s: 'launch', g: '🚀', t: 'Launches in 2011', d: 'Aug 2011', v: 'First, Juno blasted off from Florida with its solar panels folded up.' },
    { s: 'cruise', g: '☀️', t: 'Five years in space', d: '2011–2016', v: 'Then it opened its three giant panels and flew for five years.' },
    { s: 'orbit', g: '🪐', t: 'Slips into orbit', d: '4 Jul 2016', v: 'Next, it fired its engine and became a helper of Jupiter.' },
    { s: 'sky', g: '🌀', t: 'Storms and poles', d: '2016–2025', v: 'Finally, it swept low over the clouds and photographed the poles.' },
  ],
  'jup-voyager1': [
    { s: 'launch', g: '🚀', t: 'Launches in 1977', d: '5 Sep 1977', v: 'First, Voyager 1 launched from Cape Canaveral carrying a golden record.' },
    { s: 'cruise', g: '💿', t: 'Sails through space', d: '1977–1979', v: 'Then it travelled across space toward the giant planets.' },
    { s: 'orbit', g: '🌋', t: 'Volcanoes on Io', d: 'Mar 1979', v: 'Next, it flew past Jupiter and found volcanoes erupting on its moon Io.' },
    { s: 'sky', g: '🌌', t: 'Into interstellar space', d: 'Aug 2012', v: 'Finally, it left the Sun’s bubble and became the most distant thing people have built.' },
  ],
  'jup-clipper': [
    { s: 'pad', g: '🏗️', t: 'Built on Earth', d: '2015–2024', v: 'First, engineers built the spacecraft and tested its giant solar panels.' },
    { s: 'launch', g: '🚀', t: 'Launches in 2024', d: '14 Oct 2024', v: 'Then it launched from Kennedy Space Center in Florida.' },
    { s: 'cruise', g: '🌍', t: 'Swings past Earth', d: '2025–2030', v: 'Next, it will swing past Mars and Earth to pick up speed.' },
    { s: 'orbit', g: '🧊', t: 'Reaches Europa', d: '2030', v: 'Finally, it will arrive at Jupiter and study the ocean under Europa’s ice.' },
  ],
  'jup-pioneer10': [
    { s: 'launch', g: '🚀', t: 'Launches in 1972', d: '2 Mar 1972', v: 'First, Pioneer 10 left Earth faster than anything had before.' },
    { s: 'cruise', g: '🪨', t: 'Crosses the asteroid belt', d: 'Jul 1972', v: 'Then it flew safely through the wide belt of space rocks.' },
    { s: 'orbit', g: '🪐', t: 'First Jupiter close-ups', d: 'Dec 1973', v: 'Next, it sent home the first close-up pictures of Jupiter.' },
    { s: 'sky', g: '📻', t: 'Last signal in 2003', d: 'Jan 2003', v: 'Finally, its faint signal faded away after thirty years.' },
  ],

  'sat-cassini': [
    { s: 'launch', g: '🚀', t: 'Launches in 1997', d: '15 Oct 1997', v: 'First, Cassini launched toward Saturn with the Huygens probe on board.' },
    { s: 'cruise', g: '🛰️', t: 'Seven years of travel', d: '1997–2004', v: 'Then it travelled for seven years to reach the ringed planet.' },
    { s: 'orbit', g: '🪐', t: 'Circles Saturn for 13 years', d: '2004–2017', v: 'Next, it circled Saturn for thirteen years and took 450,000 pictures.' },
    { s: 'impact', g: '🔥', t: 'Grand Finale dive', d: '15 Sep 2017', v: 'Finally, it dived between the rings and burned up in Saturn’s clouds on purpose.' },
  ],
  'sat-huygens': [
    { s: 'cruise', g: '🪂', t: 'Rides inside Cassini', d: '1997–2004', v: 'First, the little probe travelled tucked inside the Cassini spacecraft.' },
    { s: 'descend', g: '🪂', t: 'Drops toward Titan', d: '25 Dec 2004', v: 'Then it separated and fell toward Titan’s orange sky.' },
    { s: 'surface', g: '🪨', t: 'Lands on Titan', d: '14 Jan 2005', v: 'Next, it parachuted down and landed on a moon other than our own.' },
    { s: 'sky', g: '📷', t: '72 minutes of pictures', d: 'Jan 2005', v: 'Finally, it sent the only pictures ever taken from Titan’s ground.' },
  ],
  'sat-dragonfly': [
    { s: 'pad', g: '🏗️', t: 'Built and tested', d: '2019–2020s', v: 'First, engineers designed and tested the flying robot here on Earth.' },
    { s: 'launch', g: '🚀', t: 'Launching in 2028', d: '2028', v: 'Then a rocket will carry it off toward Saturn’s moon Titan.' },
    { s: 'cruise', g: '🚁', t: 'Flies to Titan', d: '2028–2030s', v: 'Next, it will travel through space folded inside its spacecraft.' },
    { s: 'surface', g: '🚁', t: 'Hops across Titan', d: '2030s', v: 'Finally, it will land on Titan and hop from place to place.' },
  ],
  'sat-voyager2': [
    { s: 'launch', g: '🚀', t: 'Launches in 1977', d: '20 Aug 1977', v: 'First, Voyager 2 blasted off from Cape Canaveral.' },
    { s: 'orbit', g: '🪐', t: 'Flies past Saturn', d: 'Aug 1981', v: 'Then it flew past Saturn and photographed its rings.' },
    { s: 'cruise', g: '🔵', t: 'Uranus and Neptune', d: '1986–1989', v: 'Next, it visited Uranus and Neptune — the only spacecraft ever to do so.' },
    { s: 'sky', g: '🌌', t: 'Into interstellar space', d: 'Nov 2018', v: 'Finally, it left the solar system and still sends us signals.' },
  ],
  'sat-pioneer11': [
    { s: 'launch', g: '🚀', t: 'Launches in 1973', d: '5 Apr 1973', v: 'First, Pioneer 11 launched toward Jupiter.' },
    { s: 'orbit', g: '🪐', t: 'Jupiter slingshot', d: 'Dec 1974', v: 'Then Jupiter’s gravity bent its path and sped it up toward Saturn.' },
    { s: 'orbit', g: '💫', t: 'First past Saturn', d: '1 Sep 1979', v: 'Next, it became the first spacecraft to fly past Saturn and it found a new ring.' },
    { s: 'sky', g: '📻', t: 'Last signal in 1995', d: '1995', v: 'Finally, its signal faded away as it drifted into deep space.' },
  ],
};

// Picks a story the child has actually explored on this planet.
export function pickStory(planet, ids, avoidId) {
  const set = new Set(ids);
  const found = (OBJECTS[planet] || []).filter((o) => set.has(o.id) && STORY[o.id]);
  if (!found.length) return null;
  const pool = found.length > 1 && avoidId ? found.filter((o) => o.id !== avoidId) : found;
  const object = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: object.id,
    name: object.name,
    emoji: (CLUES[object.id] && CLUES[object.id].emoji) || '🚀',
    stages: STORY[object.id],
  };
}