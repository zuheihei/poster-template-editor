const POSTER_FONT_FAMILY = 'Source Han Sans SC';

const EXPORT_FONT_SPECS = [
  `400 32px "${POSTER_FONT_FAMILY}"`,
  `500 32px "${POSTER_FONT_FAMILY}"`,
  `600 32px "${POSTER_FONT_FAMILY}"`,
  `700 32px "${POSTER_FONT_FAMILY}"`,
  `400 36px "${POSTER_FONT_FAMILY}"`,
  `400 42px "${POSTER_FONT_FAMILY}"`,
  `700 42px "${POSTER_FONT_FAMILY}"`,
  `700 66px "${POSTER_FONT_FAMILY}"`,
  `700 78px "${POSTER_FONT_FAMILY}"`,
  `700 113px "${POSTER_FONT_FAMILY}"`,
  `400 68px "${POSTER_FONT_FAMILY}"`,
  '400 88px "Source Han Serif SC"',
  '500 88px "Source Han Serif SC"',
  '400 38px "Pacifico"',
  '400 48px "Pacifico"',
  '400 128px "Pacifico"',
  '400 198px "Pacifico"',
];

export function ensurePosterFontsReady() {
  if (!document.fonts?.load) return Promise.resolve();
  return Promise.all(EXPORT_FONT_SPECS.map((spec) => document.fonts.load(spec)))
    .then(() => document.fonts.ready)
    .catch(() => undefined);
}
