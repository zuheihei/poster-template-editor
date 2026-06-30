const POSTER_FONT_FAMILY = 'Source Han Sans SC';

export function ensurePosterFontsReady() {
  if (!document.fonts?.load) return Promise.resolve();
  return Promise.all([
    document.fonts.load(`400 32px "${POSTER_FONT_FAMILY}"`),
    document.fonts.load(`500 32px "${POSTER_FONT_FAMILY}"`),
    document.fonts.load(`600 32px "${POSTER_FONT_FAMILY}"`),
    document.fonts.load(`700 32px "${POSTER_FONT_FAMILY}"`),
    document.fonts.load('400 32px "Source Han Serif SC"'),
    document.fonts.load('500 32px "Source Han Serif SC"'),
    document.fonts.load('400 32px "Pacifico"'),
  ])
    .then(() => document.fonts.ready)
    .catch(() => undefined);
}
