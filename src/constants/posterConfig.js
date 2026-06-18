/**
 * Figma 设计稿原始数据（1242 基准宽）
 * 单组2-2：1242 × 2110
 * 单组2-1：1242 × 1863
 */

export const FIGMA = {
  /** 单组2-2 — 对应海报 A */
  a: {
    frame: { width: 1242, height: 2110 },
    bg: { color: '#F7F7F7', opacity: 0.8 },
    hero: {
      x: 82,
      y: 162,
      width: 1080,
      height: 1080,
      radius: 25,
      imgWidth: 1141,
      imgHeight: 1128,
      imgOffsetX: -12,
      imgOffsetY: -19,
    },
    gradient: {
      x: 81,
      y: 1052,
      width: 1080,
      height: 190,
      opacity: 0.7,
    },
    avatar: { x: 122, y: 1088, width: 115, height: 117, radius: 10 },
    groupName: {
      x: 271,
      y: 1096,
      width: 274,
      fontSize: 40,
      fontWeight: 600,
      gapFromAvatar: 34,
    },
    members: {
      x: 271,
      y: 1156,
      fontSize: 37,
      fontWeight: 400,
      opacity: 0.6,
      gapFromName: 12,
    },
    tag: {
      x: 458,
      y: 1272,
      width: 326,
      height: 47,
      fontSize: 39,
      color: '#725940',
      lineWidth: 50,
      lineOffsetY: 27,
      textOffsetX: 86,
    },
    quote: {
      x: 535.5,
      y: 1426,
      width: 165,
      height: 114.88,
      opacity: 1,
      color: '#725940',
      image: '/quote-mark.png',
    },
    headline: {
      x: 150,
      y: 1581,
      width: 942,
      height: 100,
      fontSize: 68,
      fontWeight: 400,
      color: '#725940',
      lineHeight: 1.0,
    },
  },

  /** 单组2-1 — 对应海报 B（紧凑版） */
  b: {
    frame: { width: 1242, height: 1863 },
    bg: { color: '#F7F7F7', opacity: 1 },
    hero: {
      x: 121,
      y: 80,
      width: 1000,
      height: 1000,
      radius: 25,
      imgWidth: 1011,
      imgHeight: 1000,
      imgOffsetX: 0,
      imgOffsetY: 0,
    },
    gradient: {
      x: 121,
      y: 890,
      width: 1000,
      height: 190,
      opacity: 0.7,
    },
    avatar: { x: 168, y: 927, width: 115, height: 117, radius: 10 },
    groupName: {
      x: 317,
      y: 935,
      width: 274,
      fontSize: 40,
      fontWeight: 600,
      gapFromAvatar: 34,
    },
    members: {
      x: 317,
      y: 995,
      fontSize: 37,
      fontWeight: 400,
      opacity: 0.6,
      gapFromName: 12,
    },
    tag: {
      x: 458,
      y: 1105,
      width: 326,
      height: 47,
      fontSize: 39,
      color: '#725940',
      lineWidth: 50,
      lineOffsetY: 27,
      textOffsetX: 86,
    },
    quote: {
      x: 539,
      y: 1249,
      width: 165,
      height: 114.88,
      opacity: 1,
      color: '#725940',
      image: '/quote-mark.png',
    },
    headline: {
      x: 150,
      y: 1404,
      width: 942,
      height: 100,
      fontSize: 68,
      fontWeight: 400,
      color: '#725940',
      lineHeight: 1.0,
    },
  },
};

/** 导出尺寸（Figma 原尺寸 1:1） */
export const POSTER_SIZES = {
  a: {
    width: 1242,
    height: 2110,
    exportName: 'poster-a-1242x2110.png',
    label: '海报 A（1242×2110）',
    useNativeFigma: true,
  },
  b: {
    width: 1242,
    height: 1863,
    exportName: 'poster-b-1242x1863.png',
    label: '海报 B（1242×1863）',
    useNativeFigma: true,
  },
};

/**
 * 将 Figma 数值缩放到导出尺寸
 * 水平用 sx，垂直用 sy，字号/圆角等用 sx
 */
export function scaleFigma(figmaDesign, exportWidth, exportHeight) {
  const fw = figmaDesign.frame.width;
  const fh = figmaDesign.frame.height;
  const sx = exportWidth / fw;
  const sy = exportHeight / fh;
  const s = (v) => Math.round(v * sx);
  const syv = (v) => Math.round(v * sy);

  const d = figmaDesign;

  return {
    width: exportWidth,
    height: exportHeight,
    bg: d.bg,
    hero: {
      left: s(d.hero.x),
      top: syv(d.hero.y),
      width: s(d.hero.width),
      height: syv(d.hero.height),
      radius: s(d.hero.radius),
      imgWidth: s(d.hero.imgWidth),
      imgHeight: syv(d.hero.imgHeight),
      imgOffsetX: s(d.hero.imgOffsetX),
      imgOffsetY: syv(d.hero.imgOffsetY),
    },
    gradient: {
      left: s(d.gradient.x),
      top: syv(d.gradient.y),
      width: s(d.gradient.width),
      height: syv(d.gradient.height),
      opacity: d.gradient.opacity,
    },
    avatar: {
      left: s(d.avatar.x),
      top: syv(d.avatar.y),
      width: s(d.avatar.width),
      height: syv(d.avatar.height),
      radius: s(d.avatar.radius),
    },
    groupName: {
      left: s(d.groupName.x),
      top: syv(d.groupName.y),
      width: s(d.groupName.width),
      fontSize: s(d.groupName.fontSize),
      fontWeight: d.groupName.fontWeight,
      minFontSize: s(Math.round(d.groupName.fontSize * 0.65)),
    },
    members: {
      left: s(d.members.x),
      top: syv(d.members.y),
      fontSize: s(d.members.fontSize),
      fontWeight: d.members.fontWeight,
      opacity: d.members.opacity,
    },
    tag: {
      left: s(d.tag.x),
      top: syv(d.tag.y),
      width: s(d.tag.width),
      height: syv(d.tag.height),
      fontSize: s(d.tag.fontSize),
      color: d.tag.color,
      lineWidth: s(d.tag.lineWidth),
      lineOffsetY: syv(d.tag.lineOffsetY),
      textOffsetX: s(d.tag.textOffsetX),
    },
    quote: {
      left: s(d.quote.x),
      top: syv(d.quote.y),
      width: s(d.quote.width),
      height: syv(d.quote.height),
      opacity: d.quote.opacity,
      color: d.quote.color,
      image: d.quote.image,
    },
    headline: {
      left: s(d.headline.x),
      top: syv(d.headline.y),
      width: s(d.headline.width),
      height: syv(d.headline.height),
      fontSize: s(d.headline.fontSize),
      fontWeight: d.headline.fontWeight,
      minFontSize: s(Math.round(d.headline.fontSize * 0.55)),
      color: d.headline.color,
      lineHeight: d.headline.lineHeight,
    },
  };
}

/** 1:1 使用 Figma 原始像素（海报 A） */
export function figmaLayoutNative(figmaDesign) {
  const d = figmaDesign;
  return {
    width: d.frame.width,
    height: d.frame.height,
    bg: d.bg,
    hero: {
      left: d.hero.x,
      top: d.hero.y,
      width: d.hero.width,
      height: d.hero.height,
      radius: d.hero.radius,
      imgWidth: d.hero.imgWidth,
      imgHeight: d.hero.imgHeight,
      imgOffsetX: d.hero.imgOffsetX,
      imgOffsetY: d.hero.imgOffsetY,
    },
    gradient: {
      left: d.gradient.x,
      top: d.gradient.y,
      width: d.gradient.width,
      height: d.gradient.height,
      opacity: d.gradient.opacity,
    },
    avatar: {
      left: d.avatar.x,
      top: d.avatar.y,
      width: d.avatar.width,
      height: d.avatar.height,
      radius: d.avatar.radius,
    },
    groupName: {
      left: d.groupName.x,
      top: d.groupName.y,
      width: d.groupName.width,
      fontSize: d.groupName.fontSize,
      fontWeight: d.groupName.fontWeight,
      minFontSize: Math.round(d.groupName.fontSize * 0.65),
    },
    members: {
      left: d.members.x,
      top: d.members.y,
      fontSize: d.members.fontSize,
      fontWeight: d.members.fontWeight,
      opacity: d.members.opacity,
    },
    tag: {
      left: d.tag.x,
      top: d.tag.y,
      width: d.tag.width,
      height: d.tag.height,
      fontSize: d.tag.fontSize,
      color: d.tag.color,
      lineWidth: d.tag.lineWidth,
      lineOffsetY: d.tag.lineOffsetY,
      textOffsetX: d.tag.textOffsetX,
    },
    quote: {
      left: d.quote.x,
      top: d.quote.y,
      width: d.quote.width,
      height: d.quote.height,
      opacity: d.quote.opacity,
      color: d.quote.color,
      image: d.quote.image,
    },
    headline: {
      left: d.headline.x,
      top: d.headline.y,
      width: d.headline.width,
      height: d.headline.height,
      fontSize: d.headline.fontSize,
      fontWeight: d.headline.fontWeight,
      minFontSize: Math.round(d.headline.fontSize * 0.55),
      color: d.headline.color,
      lineHeight: d.headline.lineHeight,
    },
  };
}

/** 生成两种海报的布局 */
export function getLayouts() {
  return {
    a: figmaLayoutNative(FIGMA.a),
    b: figmaLayoutNative(FIGMA.b),
  };
}

/** 默认文案（Figma 单组2-2） */
export const DEFAULT_DATA = {
  groupName: '9.9r也可以爽买',
  members: '1239个成员',
  headline: '小钱买爽，才是真理财',
  heroImage: 'https://picsum.photos/1141/1128',
  avatar: 'https://picsum.photos/115/117',
};

export const COLORS = {
  white: '#FFFFFF',
  brown: '#725940',
  bg: '#F7F7F7',
};
