// Brand SVG defs, verbatim from the brand board v2 (Brand Board.dc.html). Everything is drawn in a 100-unit box.
// Rank insignia: nq-b0..nq-b4 (use viewBox "-4 -4 108 108"). Avatar frames: nq-fr0..nq-fr4 (+ nq-fr4-static) drawn
// around a 0..100 disc and overflowing to -30..130 (use viewBox "-30 -30 160 160" in a 160% box).

const SPROUT =
  '<path d="M50 65 C31 68 18 58 18 40 C36 38 48 46 50 65 Z"/><path d="M50 63 C47 42 58 29 81 27 C83 50 71 63 50 63 Z"/>';
const SPROUT_CUT = `<g mask="url(#nq-m-check)">${SPROUT}<rect x="47" y="55" width="6" height="25" rx="3"/></g>`;
const STAR_POINTS = '0,-7 1.65,-2.27 6.66,-2.16 2.66,0.87 4.11,5.66 0,2.8 -4.11,5.66 -2.66,0.87 -6.66,-2.16 -1.65,-2.27';
const CHECK = 'M-13 -3 L-3 7 L14 -12';
const SEAL =
  '50,8 59.19,15.71 71,13.63 75.1,24.9 86.37,29 84.29,40.81 92,50 84.29,59.19 86.37,71 75.1,75.1 71,86.37 59.19,84.29 50,92 40.81,84.29 29,86.37 24.9,75.1 13.63,71 15.71,59.19 8,50 15.71,40.81 13.63,29 24.9,24.9 29,13.63 40.81,15.71';
const SHIELD = 'M50 12 L80 22 C80 55 69 76 50 89 C31 76 20 55 20 22 Z';
const HEX = '50,11 84,30.5 84,69.5 50,89 16,69.5 16,30.5';

const fr4Glow = (animated: boolean) =>
  `<circle cx="50" cy="50" r="76" fill="url(#nq-g-glow)"${animated ? '' : ' opacity=".8"'}>${
    animated ? '<animate attributeName="opacity" values=".45;1;.45" dur="3.2s" repeatCount="indefinite"/>' : ''
  }</circle>`;
const fr4Ring = (animated: boolean) =>
  '<g fill="none" stroke-width="6" stroke-linecap="round" stroke="#F2B705"><path d="M-1 30 L-27 16"/><path d="M-4 42 L-27 34"/><path d="M-4 54 L-23 50"/><path d="M101 30 L127 16"/><path d="M104 42 L127 34"/><path d="M104 54 L123 50"/></g>' +
  '<path d="M-7.32 70.86 A61 61 0 0 0 107.32 70.86" fill="none" stroke="#F2B705" stroke-width="3.5" stroke-linecap="round"/>' +
  '<circle cx="-7.32" cy="70.86" r="4" fill="#F2B705"/><circle cx="107.32" cy="70.86" r="4" fill="#F2B705"/>' +
  '<circle cx="50" cy="50" r="53.5" fill="none" stroke="url(#nq-g-gold)" stroke-width="7.5"/>' +
  `<circle cx="50" cy="50" r="53.5" fill="none" stroke="#FFF6C8" stroke-width="7.5" stroke-dasharray="20 316" stroke-linecap="round"${
    animated ? '' : ' transform="rotate(-60 50 50)"'
  }>${
    animated
      ? '<animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="4s" repeatCount="indefinite"/>'
      : ''
  }</circle>` +
  `<polygon points="${STAR_POINTS}" fill="#D21034" stroke="#fff" stroke-width="1.5" stroke-linejoin="round" transform="translate(50 -4) scale(1.3)"/>`;

export const BRAND_DEFS = [
  // gradients & masks
  '<radialGradient id="nq-g-disc" cx="30%" cy="22%" r="90%"><stop offset="0" stop-color="#9BDB4E"/><stop offset=".38" stop-color="#2FA54C"/><stop offset="1" stop-color="#006233"/></radialGradient>',
  '<linearGradient id="nq-g-gold" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100"><stop offset="0" stop-color="#FFD84A"/><stop offset=".55" stop-color="#F2B705"/><stop offset="1" stop-color="#C08A00"/></linearGradient>',
  '<linearGradient id="nq-g-deep" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100"><stop offset="0" stop-color="#17744C"/><stop offset="1" stop-color="#0B3D2E"/></linearGradient>',
  '<radialGradient id="nq-g-glow"><stop offset=".6" stop-color="#F2B705" stop-opacity=".5"/><stop offset="1" stop-color="#F2B705" stop-opacity="0"/></radialGradient>',
  '<mask id="nq-m-check" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#fff"/><path d="M39 48 L50 57 L67 37" fill="none" stroke="#000" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></mask>',
  `<mask id="nq-m-knock" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#fff"/><g fill="#000" transform="translate(50 50) scale(.76) translate(-50.5 -53.5)">${SPROUT_CUT}</g></mask>`,

  // logo
  `<g id="nq-mark"><circle cx="50" cy="50" r="50" fill="url(#nq-g-disc)"/><g fill="#F4FBF2" transform="translate(50 50) scale(.76) translate(-50.5 -53.5)">${SPROUT_CUT}</g></g>`,
  `<g id="nq-fav"><circle cx="50" cy="50" r="50" fill="#006233"/><g fill="#fff" transform="translate(50 50) scale(.86) translate(-50.5 -53.5)">${SPROUT}<rect x="46.5" y="55" width="7" height="25" rx="3.5"/></g></g>`,
  `<g id="nq-dirA"><path d="M50 97 C50 97 15 63 15 40 C15 20.7 30.7 5 50 5 C69.3 5 85 20.7 85 40 C85 63 50 97 50 97 Z" fill="url(#nq-g-disc)"/><g fill="#F4FBF2" transform="translate(50 40) scale(.6) translate(-50.5 -53.5)">${SPROUT_CUT}</g></g>`,
  `<g id="nq-sprout">${SPROUT_CUT}</g>`,

  // rank insignia
  `<g id="nq-b0"><circle cx="50" cy="53" r="41" fill="#04140D" opacity=".14"/><circle cx="50" cy="50" r="41" fill="#fff"/><circle cx="50" cy="50" r="35" fill="#E6EEE9" stroke="#C3D2CA" stroke-width="1.5"/><g fill="#62786D" transform="translate(50 51) scale(.6) translate(-50.5 -53.5)">${SPROUT}<rect x="46.5" y="55" width="7" height="25" rx="3.5"/></g></g>`,
  `<g id="nq-b1"><circle cx="50" cy="53" r="41" fill="#04140D" opacity=".14"/><circle cx="50" cy="50" r="41" fill="#fff"/><circle cx="50" cy="50" r="35" fill="#2E9E4F"/><path d="${CHECK}" fill="none" stroke="#fff" stroke-width="6.2" stroke-linecap="round" stroke-linejoin="round" transform="translate(50 53) scale(1.3)"/></g>`,
  `<g id="nq-b2"><polygon points="${HEX}" transform="translate(0 3)" fill="#04140D" stroke="#04140D" stroke-width="10" stroke-linejoin="round" opacity=".14"/><polygon points="${HEX}" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/><polygon points="50,17 78.6,33.5 78.6,66.5 50,83 21.4,66.5 21.4,33.5" fill="#006233" stroke="#006233" stroke-width="5" stroke-linejoin="round"/><g fill="none" stroke="#fff" stroke-width="5.6" stroke-linecap="round" stroke-linejoin="round"><path d="${CHECK}" transform="translate(50 45) scale(1.1)"/><path d="${CHECK}" transform="translate(50 63) scale(1.1)"/></g></g>`,
  `<g id="nq-b3"><path d="${SHIELD}" transform="translate(0 3)" fill="#04140D" stroke="#04140D" stroke-width="9" stroke-linejoin="round" opacity=".14"/><path d="${SHIELD}" fill="#fff" stroke="#fff" stroke-width="9" stroke-linejoin="round"/><path d="${SHIELD}" fill="url(#nq-g-deep)"/><g fill="none" stroke="#fff" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"><path d="${CHECK}" transform="translate(50 44) scale(.95)"/><path d="${CHECK}" transform="translate(50 57) scale(.95)"/><path d="${CHECK}" transform="translate(50 70) scale(.95)"/></g><polygon points="${STAR_POINTS}" fill="#D21034" stroke="#fff" stroke-width="1.2" stroke-linejoin="round" transform="translate(50 26) scale(1.05)"/></g>`,
  `<g id="nq-b4"><polygon points="${SEAL}" transform="translate(0 3)" fill="#04140D" stroke="#04140D" stroke-width="10" stroke-linejoin="round" opacity=".16"/><polygon points="${SEAL}" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/><polygon points="${SEAL}" fill="url(#nq-g-gold)" stroke="url(#nq-g-gold)" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="50" r="29" fill="url(#nq-g-deep)" stroke="#FFE27A" stroke-width="1.5"/><g fill="#F2B705" transform="translate(50 50) scale(.56) translate(-50.5 -53.5)">${SPROUT_CUT}</g><polygon points="${STAR_POINTS}" fill="#D21034" stroke="#fff" stroke-width="1.4" stroke-linejoin="round" transform="translate(50 9) scale(1.1)"/></g>`,

  // avatar frames
  '<g id="nq-fr0"><circle cx="50" cy="50" r="52" fill="none" stroke="#B8C6BE" stroke-width="3.5"/></g>',
  '<g id="nq-fr1"><circle cx="50" cy="50" r="53.5" fill="none" stroke="#2E9E4F" stroke-width="7"/></g>',
  '<g id="nq-fr2"><circle cx="50" cy="50" r="53.5" fill="none" stroke="#006233" stroke-width="7"/><path d="M-7.32 29.14 A61 61 0 1 0 107.32 29.14" fill="none" stroke="#006233" stroke-width="3.5" stroke-linecap="round"/><circle cx="-7.32" cy="29.14" r="4" fill="#006233"/><circle cx="107.32" cy="29.14" r="4" fill="#006233"/></g>',
  `<g id="nq-fr3"><g fill="none" stroke-width="6" stroke-linecap="round"><path d="M-1 36 L-25 24" stroke="#006233"/><path d="M-4 49 L-24 43" stroke="#2E9E4F"/><path d="M-2 62 L-17 60" stroke="#2E9E4F"/><path d="M101 36 L125 24" stroke="#006233"/><path d="M104 49 L124 43" stroke="#2E9E4F"/><path d="M102 62 L117 60" stroke="#2E9E4F"/></g><circle cx="50" cy="50" r="53.5" fill="none" stroke="#006233" stroke-width="7"/><polygon points="${STAR_POINTS}" fill="#D21034" stroke="#fff" stroke-width="1.5" stroke-linejoin="round" transform="translate(50 -4) scale(1.3)"/></g>`,
  `<g id="nq-fr4">${fr4Glow(true)}${fr4Ring(true)}</g>`,
  `<g id="nq-fr4-static">${fr4Glow(false)}${fr4Ring(false)}</g>`,
  // Khadra split so Avatar can put the glow behind the disc
  `<g id="nq-fr4-glow">${fr4Glow(true)}</g>`,
  `<g id="nq-fr4-glow-static">${fr4Glow(false)}</g>`,
  `<g id="nq-fr4-ring">${fr4Ring(true)}</g>`,
  `<g id="nq-fr4-ring-static">${fr4Ring(false)}</g>`,
  '<g id="nq-crown"><path d="M34 -3 L34 -21 L42 -12 L50 -25 L58 -12 L66 -21 L66 -3 Z" fill="#F2B705" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></g>',
].join('');
