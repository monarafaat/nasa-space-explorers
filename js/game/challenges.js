// Content for the Planet Knowledge Challenge.
// CLUES: one unique, kid-sized statement per object (used by "Match My Story").
// TIMELINES: four real mission events per object, oldest first, "date|event".
// BADGES: the achievement a planet awards when its challenge is completed.

export const CLUES = {
  'moon-flag': { emoji: '🚩', clue: 'A cloth flag held open by a metal rod, planted as a symbol of the first Moon landing.' },
  'moon-lm': { emoji: '🛬', clue: 'The spacecraft that carried two astronauts down from orbit and lifted them back up.' },
  'moon-lrv': { emoji: '🚙', clue: 'A little electric car that let astronauts drive far away from their lander.' },
  'moon-alsep': { emoji: '📡', clue: 'A set of instruments left behind to keep measuring Moonquakes for years.' },
  'moon-retro': { emoji: '🪞', clue: 'A panel of mirrors that bounces laser light straight back to Earth.' },
  'moon-surveyor': { emoji: '🤖', clue: 'A robot that landed softly on the Moon before astronauts ever did.' },

  'mars-perseverance': { emoji: '🤖', clue: 'A car-sized robot that packs rock samples in tubes for a future mission.' },
  'mars-ingenuity': { emoji: '🚁', clue: 'A tiny helicopter that proved flying through Martian air is possible.' },
  'mars-curiosity': { emoji: '🛻', clue: 'A big rover that drills into rocks and found an ancient lake in Gale Crater.' },
  'mars-viking': { emoji: '🛬', clue: 'The first American lander on Mars, which tested the soil for life.' },
  'mars-spirit': { emoji: '🚙', clue: 'A twin rover that climbed Husband Hill before getting stuck in soft sand.' },
  'mars-opportunity': { emoji: '🚙', clue: 'A twin rover that drove about 45 km and proved water once flowed on Mars.' },
  'mars-sojourner': { emoji: '🛒', clue: 'The first wheeled robot on another planet, about the size of a microwave.' },

  'earth-capsule': { emoji: '🪂', clue: 'A cone-shaped spacecraft that brought astronauts home by parachute into the ocean.' },
  'earth-saturn': { emoji: '🚀', clue: 'The most powerful rocket ever flown, tall enough to launch crews to the Moon.' },
  'earth-hubble': { emoji: '🔭', clue: 'A telescope the size of a bus that takes pictures from above Earth’s blurry air.' },
  'earth-dish': { emoji: '📡', clue: 'A giant antenna that sends commands to spacecraft across the solar system.' },
  'earth-landsat': { emoji: '🛰️', clue: 'A satellite that photographs Earth’s land to track forests, crops and cities.' },

  'jup-galileo': { emoji: '🌡️', clue: 'A cone-shaped probe that dived into Jupiter’s clouds and measured them.' },
  'jup-juno': { emoji: '🛰️', clue: 'A spacecraft with three giant solar panels studying Jupiter’s storms and poles.' },
  'jup-voyager1': { emoji: '💿', clue: 'A spacecraft carrying Earth’s golden record — now the most distant object we built.' },
  'jup-clipper': { emoji: '🧊', clue: 'A spacecraft on its way to study the hidden ocean under the ice of Europa.' },
  'jup-pioneer10': { emoji: '📻', clue: 'The first spacecraft to cross the asteroid belt and reach Jupiter.' },

  'sat-cassini': { emoji: '🪐', clue: 'A spacecraft that circled Saturn for 13 years before diving into its clouds.' },
  'sat-huygens': { emoji: '🪂', clue: 'A saucer-shaped probe that parachuted down to Titan and sent pictures from its ground.' },
  'sat-dragonfly': { emoji: '🚁', clue: 'A flying robot being built to hop across Titan’s frozen ground.' },
  'sat-voyager2': { emoji: '🛰️', clue: 'The only spacecraft ever to visit Uranus and Neptune.' },
  'sat-pioneer11': { emoji: '📻', clue: 'The first spacecraft to fly past Saturn, where it found a new ring.' },
};

export const TIMELINES = {
  'moon-flag': [
    '16 Jul 1969|Apollo 11 lifts off from Florida with three astronauts aboard.',
    '20 Jul 1969|Eagle lands in the Sea of Tranquility and the crew steps onto the Moon.',
    '19 Nov 1969|Apollo 12 plants the second flag on the Moon.',
    'Dec 1972|Apollo 17 leaves the sixth and last flag behind.',
  ],
  'moon-lm': [
    '16 Jul 1969|Saturn V launches Apollo 11 toward the Moon.',
    '20 Jul 1969|Eagle lands in the Sea of Tranquility.',
    '21 Jul 1969|Armstrong and Aldrin walk on the Moon.',
    '24 Jul 1969|The crew splashes down safely in the Pacific Ocean.',
  ],
  'moon-lrv': [
    '1971|Apollo 15 carries the first rover to the Moon, folded like a suitcase.',
    '31 Jul 1971|David Scott and James Irwin take the first lunar drive.',
    '1972|Apollo 16 and 17 drive their rovers even further across the Moon.',
    'Dec 1972|Apollo 17 leaves the third rover parked in the Taurus-Littrow valley.',
  ],
  'moon-alsep': [
    'Nov 1969|Apollo 12 sets up the first complete science station on the Moon.',
    '1971|Apollo 15 adds a camera and more instruments to its station.',
    '1972|Apollo 16 and 17 set up stations of their own.',
    'Sep 1977|The last working station falls silent after eight years.',
  ],
  'moon-retro': [
    'Jul 1969|Apollo 11 leaves a small panel of mirrors on the Moon.',
    'Aug 1969|Scientists bounce a laser off it and measure the distance to the Moon.',
    '1971|Apollo 14 and 15 leave two more reflector panels.',
    'Today|Observatories still fire lasers at the reflectors every year.',
  ],
  'moon-surveyor': [
    'Apr 1967|Surveyor 3 lands softly on the Moon and bounces three times.',
    '1967|It sends more than 6,000 pictures back to Earth.',
    '1969|NASA aims Apollo 12 at the same area so the crew can visit it.',
    'Nov 1969|Conrad and Bean walk over and carry its camera home.',
  ],

  'mars-perseverance': [
    '30 Jul 2020|Perseverance launches from Cape Canaveral.',
    '18 Feb 2021|It lands in Jezero Crater, lowered by a rocket-powered sky crane.',
    'Apr 2021|It turns carbon dioxide from the Martian air into oxygen for the first time.',
    'Dec 2022|It drops the first rock sample tube on the ground for a future mission.',
  ],
  'mars-ingenuity': [
    '30 Jul 2020|Ingenuity rides to Mars folded under the Perseverance rover.',
    '19 Apr 2021|It makes the first powered flight on another planet.',
    '2021–2023|It flies 72 times, scouting ahead for the rover.',
    'Jan 2024|A damaged rotor blade ends its final flight.',
  ],
  'mars-curiosity': [
    '26 Nov 2011|Curiosity launches from Florida.',
    '6 Aug 2012|It lands in Gale Crater, lowered on cables by a sky crane.',
    'Feb 2013|It drills its first rock sample and finds clay that formed in water.',
    '2014|It reaches the base of Mount Sharp and starts to climb.',
  ],
  'mars-viking': [
    '20 Aug 1975|Viking 1 launches toward Mars.',
    '20 Jul 1976|Its lander touches down in Chryse Planitia.',
    'Jul 1976|It sends the first picture ever taken from the surface of Mars.',
    'Nov 1982|Its last signal reaches Earth after six years of work.',
  ],
  'mars-spirit': [
    '10 Jun 2003|Spirit launches toward Mars.',
    '4 Jan 2004|It bounces to a stop inside Gusev Crater, wrapped in airbags.',
    'Aug 2005|It climbs to the top of Husband Hill.',
    'Mar 2010|After getting stuck in soft sand, it sends its last signal.',
  ],
  'mars-opportunity': [
    '7 Jul 2003|Opportunity launches toward Mars.',
    '25 Jan 2004|It lands in Meridiani Planum, wrapped in airbags.',
    '2004|It finds minerals that only form in salty water.',
    'Jun 2018|A giant dust storm blocks the Sun and ends its mission.',
  ],
  'mars-sojourner': [
    '4 Dec 1996|The Pathfinder spacecraft launches carrying Sojourner.',
    '4 Jul 1997|Pathfinder bounces to a stop in Ares Vallis.',
    '6 Jul 1997|Sojourner rolls onto the surface — the first rover on another planet.',
    'Sep 1997|Its last signal arrives after 83 days of exploring.',
  ],

  'earth-capsule': [
    'Oct 1968|Apollo 7 flies the command module with a crew for the first time.',
    'Dec 1968|Apollo 8 carries three astronauts around the Moon and back.',
    'Jul 1969|Apollo 11 splashes down in the Pacific under three parachutes.',
    'Apr 1970|Apollo 13 brings its crew home safely after an explosion.',
  ],
  'earth-saturn': [
    '9 Nov 1967|The first Saturn V test flight launches Apollo 4.',
    'Dec 1968|A Saturn V sends Apollo 8 to the Moon.',
    '16 Jul 1969|A Saturn V launches Apollo 11.',
    '14 May 1973|The last Saturn V carries the Skylab space station into orbit.',
  ],
  'earth-hubble': [
    '24 Apr 1990|Space Shuttle Discovery carries Hubble into orbit.',
    '1990|Its first pictures are blurry — the mirror has a tiny flaw.',
    'Dec 1993|Astronauts install corrective optics on a spacewalk.',
    '1995|It stares at an empty patch of sky and finds thousands of galaxies.',
  ],
  'earth-dish': [
    '1958|NASA builds its first big tracking dish at Goldstone, California.',
    '1960s|Stations in Spain and Australia join, so spacecraft are never out of sight.',
    '1977|The giant dishes begin listening to Voyager 1 and 2.',
    'Today|The network still talks to Voyager 1 beyond the solar system.',
  ],
  'earth-landsat': [
    '23 Jul 1972|Landsat 1 launches and starts photographing Earth.',
    '1980s|New Landsat satellites add sharper cameras.',
    '2013|Landsat 8 begins its mission with better sensors.',
    'Today|More than 50 years of pictures show how the land has changed.',
  ],

  'jup-galileo': [
    'Oct 1989|The Galileo spacecraft launches from a space shuttle.',
    'Jul 1995|Its cone-shaped probe separates and dives toward Jupiter.',
    '7 Dec 1995|The probe sends data for 58 minutes before the pressure crushes it.',
    '1995–2003|The orbiter studies Jupiter’s moons until it is sent into the planet.',
  ],
  'jup-juno': [
    'Aug 2011|Juno launches toward Jupiter.',
    '4 Jul 2016|It fires its engine and slips into orbit around Jupiter.',
    '2016–2021|It makes 35 close passes over Jupiter’s stormy clouds.',
    '2021–2025|Its extended mission studies the poles and the big moons.',
  ],
  'jup-voyager1': [
    '5 Sep 1977|Voyager 1 launches from Cape Canaveral.',
    'Mar 1979|It flies past Jupiter and discovers volcanoes on the moon Io.',
    'Nov 1980|It passes Saturn and swings close to the moon Titan.',
    'Aug 2012|It crosses into interstellar space.',
  ],
  'jup-clipper': [
    '2015|NASA chooses Europa Clipper as its next big planetary mission.',
    '14 Oct 2024|It launches from Kennedy Space Center.',
    '2025–2030|It swings past Mars and Earth to pick up speed.',
    '2030|It arrives at Jupiter to study Europa’s hidden ocean.',
  ],
  'jup-pioneer10': [
    '2 Mar 1972|Pioneer 10 launches from Cape Canaveral.',
    'Jul 1972|It crosses the asteroid belt safely.',
    'Dec 1973|It sends the first close-up pictures of Jupiter.',
    'Jan 2003|Its last faint signal reaches Earth.',
  ],

  'sat-cassini': [
    '15 Oct 1997|Cassini launches toward Saturn.',
    '1 Jul 2004|It enters orbit around Saturn.',
    'Jan 2005|It drops the Huygens probe onto Titan.',
    '15 Sep 2017|Its Grand Finale dive ends in Saturn’s atmosphere.',
  ],
  'sat-huygens': [
    '1997|Huygens travels to Saturn tucked inside Cassini.',
    '25 Dec 2004|It separates and coasts toward Titan.',
    '14 Jan 2005|It parachutes through Titan’s orange haze and lands.',
    'Jan 2005|After 72 minutes on the surface, its signal fades away.',
  ],
  'sat-dragonfly': [
    '2019|NASA selects Dragonfly as a new mission to Titan.',
    '2020s|Engineers build and test the rotorcraft on Earth.',
    '2028|It is planned to launch toward Titan.',
    '2030s|It is planned to land on Titan and begin hopping across it.',
  ],
  'sat-voyager2': [
    '20 Aug 1977|Voyager 2 launches from Cape Canaveral.',
    'Aug 1981|It flies past Saturn and photographs its rings.',
    '1986–1989|It visits Uranus and Neptune — the only spacecraft ever to do so.',
    'Nov 2018|It crosses into interstellar space.',
  ],
  'sat-pioneer11': [
    '5 Apr 1973|Pioneer 11 launches toward Jupiter.',
    'Dec 1974|It flies past Jupiter and uses its gravity to bend toward Saturn.',
    '1 Sep 1979|It becomes the first spacecraft to fly past Saturn.',
    '1995|Its last signal reaches Earth.',
  ],
};

export const BADGES = {
  Moon: { emoji: '🌙', title: 'Lunar Legacy', color: '#cfe0ff' },
  Mars: { emoji: '🔴', title: 'Red Planet Ranger', color: '#ffa07a' },
  Earth: { emoji: '🌍', title: 'Home World Guardian', color: '#9fe9ff' },
  Jupiter: { emoji: '🪐', title: 'Gas Giant Voyager', color: '#ffd08a' },
  Saturn: { emoji: '💫', title: 'Ring Runner', color: '#ffe9a8' },
};