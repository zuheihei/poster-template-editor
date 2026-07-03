(function (global) {
  'use strict';

  var FONT_SANS = '"Source Han Sans SC", sans-serif';
  var FONT_SERIF = '"Source Han Serif SC", serif';
  var FONT_PACIFICO = '"Pacifico", cursive';

  var ISSUE_NUM_OPTICAL_X = -1;
  var ISSUE_NUM_OPTICAL_Y = -3;
  var TITLE_CENTER_KEYS = { g: true, h: true };
  var _titleMeasureCanvas = null;

  var ASSETS = {
    douWatermark: '/xiaobao/dou-watermark.png',
    logoBlack: '/xiaobao/logo-black.png',
    logoWhite: '/xiaobao/logo-white.png',
    logoSmall: '/xiaobao/logo-small.png',
    logoHorizontal: '/xiaobao/logo-horizontal.png',
    doumao: '/xiaobao/doumao.png',
    creditIcon: '/xiaobao/credit-icon.png',
    defaultSplash: '/xiaobao/banner-doumao.png',
    headTitleLogo: '/xiaobao/head-title-logo.svg?v=5',
    headDoubanLogo: '/xiaobao/head-douban-logo.png?v=3',
  };

  var DEFAULT_BG = '#cff3ff';
  var DEFAULT_DOU = '#C2E4FF';
  var DEFAULT_ACCENT = '#47abdf';
  var FIXED_DATE_SUBTITLE = '每周五更新';

  var XIAOBAO_FIGMA = {
    /** 1125×811 头图（透明底导出） */
    p: {
      frame: { width: 1125, height: 811 },
      transparentBg: true,
      dou: { left: -183, top: -61, width: 1492, height: 896, opacity: 1 },
      titleLogo: { left: 45, top: 341, width: 683, height: 281, src: ASSETS.headTitleLogo, zIndex: 2 },
      badgeLogo: { left: 51, top: 251, width: 137, height: 59, src: ASSETS.headDoubanLogo, zIndex: 3 },
      issue: {
        left: 938, top: 338, width: 142, height: 175,
        circle: 140, circleWidth: 142, circleHeight: 140,
        number: {
          left: 23, top: 1, width: 95, height: 124,
          fontSize: 88, lineHeight: 123.2, letterSpacing: -3,
          fontFamily: FONT_SERIF, fontWeight: 500,
        },
        vol: {
          left: 37, top: 144, width: 68, height: 32,
          fontSize: 33, lineHeight: 32, letterSpacing: 0,
          fontFamily: FONT_SANS, fontWeight: 500,
        },
      },
      date: {
        left: 892, top: 549, width: 188, height: 80,
        dateSize: 36, subSize: 36, lineHeight: 40,
        letterSpacing: 0, subLetterSpacing: 0, subGap: 0,
        textAlign: 'right',
      },
    },
    /** 开屏 1242×2688 */
    e: {
      frame: { width: 1242, height: 2688 },
      bg: { top: -44, height: 2808 },
      dou: { left: -124, top: 41, width: 1449, height: 870, opacity: 0.6 },
      splash: { left: 0, top: 941, width: 1242, height: 1771 },
      logo: { left: 42, top: 221, width: 238, height: 168 },
      issue: {
        left: 1039, top: 221, width: 142, height: 175,
        circle: 140, circleWidth: 142, circleHeight: 140,
        number: {
          left: 23, top: 0, width: 95, height: 124,
          fontSize: 88, lineHeight: 123.2, letterSpacing: -2,
          fontFamily: FONT_SERIF, fontWeight: 500,
        },
        vol: {
          left: 38, top: 144, width: 68, height: 32,
          fontSize: 33, lineHeight: 32, fontWeight: 500,
          fontFamily: FONT_SANS,
        },
      },
      title: {
        left: 260, top: 453, width: 925, height: 339,
        fontSize: 112.74, fontWeight: 700, lineHeight: 133, letterSpacing: 0,
        textAlign: 'right', color: '#000000',
      },
      date: { left: 42, top: 792, width: 215, height: 83, dateSize: 42.64, subSize: 36, lineHeight: 40 },
      credit: {
        left: 43, top: 1015, width: 365, height: 38, fontSize: 36, lineHeight: 30,
        fontWeight: 400, fontFamily: FONT_SANS,
        shadow: '0 0 13.5px rgba(0,0,0,0.6)',
        iconLeft: 154, iconTop: 1015, iconW: 24, iconH: 8,
      },
    },
    /** 开屏 1242×2588 */
    f: {
      frame: { width: 1242, height: 2588 },
      bg: { top: -20, height: 2510 },
      dou: { left: -71, top: 76, width: 1384, height: 831, opacity: 0.6 },
      splash: { left: 0, top: 941, width: 1242, height: 1676 },
      logo: { left: 41, top: 222, width: 238, height: 168 },
      issue: {
        left: 1039, top: 222, width: 142, height: 175,
        circle: 140, circleWidth: 142, circleHeight: 140,
        number: {
          left: 25, top: 1, width: 95, height: 124,
          fontSize: 88, lineHeight: 123.2, letterSpacing: -3,
          fontFamily: FONT_SERIF, fontWeight: 500,
        },
        vol: {
          left: 38, top: 144, width: 68, height: 32,
          fontSize: 33, lineHeight: 32, fontWeight: 500,
          fontFamily: FONT_SANS,
        },
      },
      title: {
        left: 264, top: 459, width: 925, height: 370,
        fontSize: 112.74, fontWeight: 700, lineHeight: 133, letterSpacing: 0,
        textAlign: 'right', color: '#000000',
      },
      date: { left: 41, top: 792, width: 215, height: 83, dateSize: 42.64, subSize: 36, lineHeight: 40 },
      credit: {
        left: 41, top: 1011, width: 365, height: 42, fontSize: 36, lineHeight: 30,
        fontWeight: 400, fontFamily: FONT_SANS,
        shadow: '0 0 14.4px rgba(0,0,0,0.6)',
        iconLeft: 148, iconTop: 1011, iconW: 24, iconH: 8,
      },
    },
    /** 开屏 1242×2208 */
    n: {
      frame: { width: 1242, height: 2208 },
      bg: { top: -20, height: 2510 },
      dou: { left: -71, top: 76, width: 1384, height: 831, opacity: 0.6 },
      splash: { left: 0, top: 947, width: 1242, height: 1669 },
      logo: { left: 41, top: 223, width: 238, height: 168 },
      issue: {
        left: 1041, top: 223, width: 142, height: 175,
        circle: 140, circleWidth: 142, circleHeight: 140,
        number: {
          left: 23, top: 0, width: 95, height: 124,
          fontSize: 88, lineHeight: 123.2, letterSpacing: -2,
          fontFamily: FONT_SERIF, fontWeight: 500,
        },
        vol: {
          left: 38, top: 144, width: 68, height: 32,
          fontSize: 33, lineHeight: 32, fontWeight: 500,
          fontFamily: FONT_SANS,
        },
      },
      title: {
        left: 265, top: 489, width: 925, height: 315,
        fontSize: 112.74, fontWeight: 700, lineHeight: 133, letterSpacing: 0,
        textAlign: 'right', color: '#000000',
      },
      date: { left: 41, top: 811, width: 215, height: 88, dateSize: 42.64, subSize: 36, lineHeight: 44 },
      credit: {
        left: 41, top: 1007, width: 365, height: 36, fontSize: 36, lineHeight: 30,
        fontWeight: 400, fontFamily: FONT_SANS,
        shadow: '0 0 14.4px rgba(0,0,0,0.6)',
        iconLeft: 144, iconTop: 1007, iconW: 24, iconH: 8,
      },
    },
    /** 690×390 信息流卡片 */
    g: {
      frame: { width: 690, height: 390 },
      bg: { top: 0, height: 390 },
      dou: { left: -119, top: 1, width: 586, height: 352, opacity: 0.6 },
      splash: { left: 350, top: 0, width: 340, height: 390 },
      logo: { left: 16, top: 26, width: 96, height: 69 },
      volInline: {
        left: 121, top: 41, width: 126, height: 48,
        volSize: 38, numSize: 48, lineHeight: 48, fontWeight: 400,
      },
      title: {
        left: 17, top: 138, width: 336, height: 96,
        fontSize: 42, fontWeight: 700, lineHeight: 48, letterSpacing: 0,
        textAlign: 'left', color: '#000000',
      },
      button: {
        left: 17, top: 304, width: 292, height: 57, radius: 9,
        fontSize: 24, fontWeight: 700, lineHeight: 54.52,
        paddingTop: 1, paddingRight: 100, paddingBottom: 1, paddingLeft: 100,
      },
      credit: {
        left: 600, top: 11, width: 75, height: 30, fontSize: 18, lineHeight: 30,
        fontWeight: 400, fontFamily: FONT_SANS,
        shadow: '0 0 2.6px rgba(0,0,0,0.4)',
        iconLeft: 651, iconTop: 18, iconW: 24, iconH: 8, align: 'right',
      },
    },
    /** 1280×720 */
    h: {
      frame: { width: 1280, height: 720 },
      bg: { top: 0, height: 720 },
      dou: { left: -237, top: 0, width: 1102, height: 662, opacity: 0.6 },
      splash: { left: 640, top: 0, width: 640, height: 720 },
      logo: { left: 31, top: 40, width: 189, height: 136 },
      volInline: {
        left: 31, top: 631, width: 189, height: 48,
        volSize: 48, numSize: 48, lineHeight: 48, fontWeight: 400,
      },
      hotLabel: { left: 31, top: 236, width: 185, height: 55, fontSize: 42, lineHeight: 55 },
      hotTitleGap: 12,
      title: {
        left: 28, top: 303, width: 624, height: 184,
        fontSize: 78, fontWeight: 700, lineHeight: 92, letterSpacing: 0,
        textAlign: 'left', color: '#000000',
      },
      doumao: { left: 1049, top: 489, width: 249, height: 303 },
      credit: {
        left: 1155, top: 25, width: 84, height: 30, fontSize: 24, lineHeight: 30,
        fontWeight: 400, fontFamily: FONT_SANS,
        shadow: '0 0 2.6px rgba(0,0,0,0.4)',
        iconLeft: 1227, iconTop: 30, iconW: 24, iconH: 8, align: 'right',
      },
    },
    /** 1080×317 横版 banner */
    i: {
      frame: { width: 1080, height: 317 },
      bg: { top: 0, height: 317 },
      dou: { left: -63, top: -288, width: 1143, height: 686, opacity: 0.6 },
      logoSmall: { left: 32, top: 21, width: 104, height: 45 },
      hotLabel: { left: 462, top: 43, width: 156, height: 52, fontSize: 36, lineHeight: 52 },
      title: {
        left: 31, top: 113, width: 1019, height: 92,
        fontSize: 66, fontWeight: 700, lineHeight: 92, letterSpacing: 0,
        textAlign: 'center', color: '#000000',
      },
      volBar: {
        left: 421, top: 229, width: 239, height: 48,
        logo: { left: 0, top: 0, width: 134, height: 45 },
        vol: { left: 140, top: -11, width: 84, height: 42, volSize: 30, numSize: 42, lineHeight: 48, numLineHeight: 40 },
        weekly: { top: 34, height: 14, fontSize: 12.5, fontUnit: 'pt', lineHeight: 12, fontWeight: 500, text: 'Douer Weekly', widthExtra: 10, widthExtraUnit: 'pt' },
      },
    },
    /** 1125×1500 开屏封面 */
    j: {
      frame: { width: 1125, height: 1500 },
      splash: { left: 0, top: 0, width: 1125, height: 1500 },
      logoWhite: {
        left: 435, top: 65, width: 254, height: 134,
        shadow: '0 4px 22.4px rgba(0,0,0,0.5)',
      },
      volOverlay: {
        left: 296, top: 701, width: 532, height: 199,
        vol: {
          left: 0, top: 0, width: 532, height: 98,
          fontSize: 198, lineHeight: 30, letterSpacing: 0,
          textShadow: '0 4px 17.5px rgba(0,0,0,0.25)',
        },
        year: {
          left: 116, top: 129, width: 301, height: 70,
          fontSize: 128, lineHeight: 30, letterSpacing: 0,
          textShadow: '0 4px 17.3px rgba(0,0,0,0.25)',
        },
      },
      credit: {
        left: 377, top: 1402, width: 371, height: 55,
        fontSize: 39, lineHeight: 54.52, letterSpacing: 0,
        fontWeight: 400, fontFamily: FONT_SANS,
        shadow: '0 4px 8.3px rgba(0,0,0,0.25)',
        iconLeft: 726, iconTop: 1414, iconW: 30, iconH: 10,
        align: 'center',
      },
    },
    /** 690×228 首页 banner */
    k: {
      frame: { width: 690, height: 228 },
      accentBg: true,
      doumao: { left: 24, top: 20, width: 150, height: 180, mirror: true },
      shadow: { left: 24, top: 179, width: 144, height: 31 },
    },
    /** 150×150 图标 */
    l: {
      frame: { width: 150, height: 150 },
      bg: { top: 0, height: 150 },
      dou: { left: -53, top: 0, width: 234, height: 140, opacity: 0.6 },
      logo: { left: 15, top: 34, width: 121, height: 83 },
    },
    /** 225×150 图标 */
    m: {
      frame: { width: 225, height: 150 },
      bg: { top: 0, height: 150, left: -4, width: 241 },
      dou: { left: -4, top: -2, width: 234, height: 140, opacity: 0.6 },
      logo: { left: 36, top: 27, width: 154, height: 96 },
    },
  };

  var XIAOBAO_SIZES = {
    e: { width: 1242, height: 2688, exportName: 'xiaobao-1242x2688', label: '1242×2688', scale: 0.38 },
    f: { width: 1242, height: 2588, exportName: 'xiaobao-1242x2588', label: '1242×2588', scale: 0.38 },
    n: { width: 1242, height: 2208, exportName: 'xiaobao-1242x2208', label: '1242×2208', scale: 0.38 },
    g: { width: 690, height: 390, exportName: 'xiaobao-690x390', label: '690×390', scale: 0.42 },
    h: { width: 1280, height: 720, exportName: 'xiaobao-1280x720', label: '1280×720', scale: 0.38 },
    i: { width: 1080, height: 317, exportName: 'xiaobao-1080x317', label: '1080×317', scale: 0.38 },
    p: { width: 1125, height: 811, exportName: 'xiaobao-1125x811', label: '1125×811', scale: 0.38 },
    j: { width: 1125, height: 1500, exportName: 'xiaobao-1125x1500', label: '1125×1500', scale: 0.38 },
    k: { width: 690, height: 228, exportName: 'xiaobao-690x228', label: '690×228', scale: 0.38 },
    l: { width: 150, height: 150, exportName: 'xiaobao-150x150', label: '150×150', scale: 0.42 },
    m: { width: 225, height: 150, exportName: 'xiaobao-225x150', label: '225×150', scale: 0.42 },
  };

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function el(tag, cls, styles, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (styles) Object.keys(styles).forEach(function (k) { node.style[k] = styles[k]; });
    if (html != null) {
      if (typeof html === 'string' && html.indexOf('<') >= 0) node.innerHTML = html;
      else node.textContent = html;
    }
    return node;
  }

  function resolveTitleBasePosition(data, key, spec) {
    if (data.titleTransformsBySize && data.titleTransformsBySize[key]) {
      return data.titleTransformsBySize[key];
    }
    if (data.titleLeft != null && data.titleTop != null && key === 'e') {
      return { left: data.titleLeft, top: data.titleTop };
    }
    if (!spec.title) return null;
    return { left: spec.title.left, top: spec.title.top };
  }

  function getTitleMeasureContext(fontSize, fontWeight, fontUnit) {
    if (!_titleMeasureCanvas) _titleMeasureCanvas = document.createElement('canvas');
    var ctx = _titleMeasureCanvas.getContext('2d');
    ctx.font = (fontWeight || 700) + ' ' + fontSize + (fontUnit || 'px') + ' ' + FONT_SANS;
    return ctx;
  }

  function measureSansTextWidth(text, fontSize, fontWeight, fontUnit) {
    return getTitleMeasureContext(fontSize, fontWeight, fontUnit).measureText(String(text || '')).width;
  }

  function countRenderedTitleLines(text, titleSpec) {
    if (!titleSpec) return 1;
    var fontSize = titleSpec.fontSize;
    var fontWeight = titleSpec.fontWeight || 700;
    var maxWidth = titleSpec.width;
    var ctx = getTitleMeasureContext(fontSize, fontWeight);
    var paragraphs = String(text || '').replace(/\\n/g, '\n').split(/\r?\n/);
    var total = 0;
    paragraphs.forEach(function (para) {
      if (!para) {
        total += 1;
        return;
      }
      var line = '';
      for (var i = 0; i < para.length; i++) {
        var ch = para.charAt(i);
        var next = line + ch;
        if (line && ctx.measureText(next).width > maxWidth) {
          total += 1;
          line = ch;
        } else {
          line = next;
        }
      }
      if (line) total += 1;
    });
    return Math.max(1, total);
  }

  function getHeaderBottom(spec, key) {
    if (!spec.logo) return 0;
    var bottom = spec.logo.top + spec.logo.height;
    if (spec.issue) {
      bottom = Math.max(bottom, spec.issue.top + spec.issue.height);
    }
    if (spec.volInline && key !== 'h') {
      bottom = Math.max(bottom, spec.volInline.top + spec.volInline.height);
    }
    return bottom;
  }

  function getContentBandBottom(spec, key) {
    var headerBottom = getHeaderBottom(spec, key);
    if (spec.volInline && spec.volInline.top >= headerBottom) {
      return spec.volInline.top;
    }
    if (key === 'g' && spec.button) return spec.button.top;
    return null;
  }

  function resolveCenteredContentLayout(data, key, spec) {
    if (!TITLE_CENTER_KEYS[key] || !spec || !spec.title) return null;
    var bandTop = getHeaderBottom(spec, key);
    var bandBottom = getContentBandBottom(spec, key);
    if (bandBottom == null || bandBottom <= bandTop) return null;

    var titleText = resolveTitleText(data, key);
    var titleLines = countRenderedTitleLines(titleText, spec.title);
    var titleLineHeight = spec.title.lineHeight || spec.title.fontSize;
    var titleHeight = titleLines * titleLineHeight;
    var bandHeight = bandBottom - bandTop;

    if (key === 'h' && spec.hotLabel) {
      var hotHeight = spec.hotLabel.lineHeight || spec.hotLabel.height || 55;
      var gap = spec.hotTitleGap != null ? spec.hotTitleGap : 12;
      var stackHeight = hotHeight + gap + titleHeight;
      var stackTop = bandTop + (bandHeight - stackHeight) / 2;
      return { hotTop: stackTop, titleTop: stackTop + hotHeight + gap, titleHeight: titleHeight };
    }

    return { hotTop: null, titleTop: bandTop + (bandHeight - titleHeight) / 2, titleHeight: titleHeight };
  }

  function hasCustomTitlePosition(data, key) {
    return !!(data.titleTransformsBySize && data.titleTransformsBySize[key]);
  }

  function measureTitleContentHeight(data, key, spec) {
    if (!spec || !spec.title) return 0;
    var t = spec.title;
    var titleLines = countRenderedTitleLines(resolveTitleText(data, key), t);
    return titleLines * (t.lineHeight || t.fontSize);
  }

  function resolveTitleLayout(data, key, spec) {
    if (!spec || !spec.title) return null;
    var pos = resolveTitlePosition(data, key, spec);
    if (!pos) return null;
    var t = spec.title;
    var contentHeight = measureTitleContentHeight(data, key, spec);
    return {
      left: pos.left,
      top: pos.top,
      height: hasCustomTitlePosition(data, key) ? t.height : contentHeight,
      hotTop: resolveHotLabelTop(data, key, spec),
    };
  }

  function resolveTitlePosition(data, key, spec) {
    var base = resolveTitleBasePosition(data, key, spec);
    if (!base) return null;
    var hasCustomPos = !!(data.titleTransformsBySize && data.titleTransformsBySize[key]);
    if (hasCustomPos) return base;
    var centered = resolveCenteredContentLayout(data, key, spec);
    if (centered) return { left: base.left, top: centered.titleTop };
    return { left: base.left, top: base.top };
  }

  function resolveHotLabelTop(data, key, spec) {
    if (!spec || !spec.hotLabel) return null;
    if (data.titleTransformsBySize && data.titleTransformsBySize[key]) {
      return spec.hotLabel.top;
    }
    var centered = resolveCenteredContentLayout(data, key, spec);
    if (centered && centered.hotTop != null) return centered.hotTop;
    return spec.hotLabel.top;
  }

  function resolveBg(data) {
    return data.bgColor || DEFAULT_BG;
  }

  function resolveAccent(data) {
    return data.accentColor || DEFAULT_ACCENT;
  }

  function buildImgAsset(src, cls, styles) {
    var img = el('img', cls, styles);
    img.src = src;
    img.alt = '';
    img.draggable = false;
    return img;
  }

  function applySplashTransform(img, data, key, frameW, frameH, splashSpec) {
    if (!global.HeroEditor) return;
    var transform = global.HeroEditor.resolveHeroTransform(data, key);
    global.HeroEditor.applyHeroTransform(
      img,
      splashSpec ? splashSpec.width : frameW,
      splashSpec ? splashSpec.height : frameH,
      transform,
      null,
      { bottomFade: false }
    );
  }

  function buildSplashLayer(spec, data, key, w, h) {
    var splash = spec.splash;
    if (!splash) return null;
    var wrap = el('div', 'xiaobao-splash', {
      position: 'absolute',
      left: splash.left + 'px',
      top: splash.top + 'px',
      width: splash.width + 'px',
      height: splash.height + 'px',
      overflow: 'hidden',
      zIndex: '2',
    });
    var img = el('img', 'xiaobao-splash-img', {
      position: 'absolute',
      display: 'block',
      pointerEvents: 'auto',
    });
    img.src = data.splashImage || ASSETS.defaultSplash;
    applySplashTransform(img, data, key, w, h, splash);
    wrap.appendChild(img);
    return wrap;
  }

  function resolveDouColor(data) {
    return data.douColor || data.bgColor || DEFAULT_BG;
  }

  function resolveDouOpacity(data, key, douSpec) {
    if (data && data.colorPreset === 'yellow') {
      return 0.8;
    }
    if (key === 'p') {
      return douSpec.opacity != null ? douSpec.opacity : 1;
    }
    if (data && data.colorPreset === 'blue') {
      return 0.6;
    }
    return douSpec.opacity != null ? douSpec.opacity : 0.6;
  }

  function buildBgAndDou(spec, bgColor, douColor, data, key) {
    var parts = [];
    if (spec.bg) {
      var bg = spec.bg;
      parts.push(el('div', 'xiaobao-bg', {
        position: 'absolute',
        left: (bg.left != null ? bg.left : 0) + 'px',
        top: bg.top + 'px',
        width: bg.width != null ? bg.width + 'px' : '100%',
        height: bg.height + 'px',
        background: bgColor,
        zIndex: '0',
      }));
    }
    if (spec.dou) {
      var d = spec.dou;
      var tint = douColor || bgColor || DEFAULT_BG;
      parts.push(el('div', 'xiaobao-dou', {
        position: 'absolute',
        left: d.left + 'px',
        top: d.top + 'px',
        width: d.width + 'px',
        height: d.height + 'px',
        opacity: String(resolveDouOpacity(data, key, d)),
        zIndex: '1',
        overflow: 'hidden',
        pointerEvents: 'none',
        backgroundColor: tint,
        WebkitMaskImage: 'url(' + ASSETS.douWatermark + ')',
        maskImage: 'url(' + ASSETS.douWatermark + ')',
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }));
    }
    return parts;
  }

  function formatTitleHtml(text) {
    return String(text || '')
      .replace(/\\n/g, '<br>')
      .replace(/\r?\n/g, '<br>');
  }

  function resolveTitleText(data, key) {
    if (data.titleTextBySize && data.titleTextBySize[key] != null) {
      return data.titleTextBySize[key];
    }
    if (key === 'i') return data.title2 != null ? data.title2 : '';
    return data.title || '';
  }

  function buildTitle(spec, data, key) {
    if (!spec.title) return null;
    var t = spec.title;
    var layout = resolveTitleLayout(data, key, spec);
    if (!layout) return null;
    var titleText = formatTitleHtml(resolveTitleText(data, key));
    var styles = {
      position: 'absolute',
      left: layout.left + 'px',
      top: layout.top + 'px',
      width: t.width + 'px',
      height: layout.height + 'px',
      fontSize: t.fontSize + 'px',
      fontWeight: String(t.fontWeight || 700),
      fontFamily: FONT_SANS,
      lineHeight: (t.lineHeight || t.fontSize) + 'px',
      textAlign: t.textAlign || 'left',
      color: t.color || '#000',
      zIndex: '4',
      wordBreak: 'break-word',
      boxSizing: 'border-box',
    };
    if (t.letterSpacing != null) styles.letterSpacing = t.letterSpacing + 'px';
    return el('div', 'xiaobao-title xiaobao-draggable-title', styles, titleText);
  }

  function buildIssueBadge(spec, data, accent) {
    if (!spec.issue) return null;
    var iss = spec.issue;
    var wrap = el('div', 'xiaobao-issue', {
      position: 'absolute',
      left: iss.left + 'px',
      top: iss.top + 'px',
      width: iss.width + 'px',
      height: iss.height + 'px',
      zIndex: '4',
    });
    var circleW = iss.circleWidth != null ? iss.circleWidth : iss.circle;
    var circleH = iss.circleHeight != null ? iss.circleHeight : iss.circle;
    wrap.appendChild(el('div', 'xiaobao-issue-circle', {
      position: 'absolute',
      left: '0',
      top: '0',
      width: circleW + 'px',
      height: circleH + 'px',
      border: '3px solid #000',
      borderRadius: '303px',
      boxSizing: 'border-box',
      pointerEvents: 'none',
    }));
    if (iss.number && iss.number.left != null) {
      var num = iss.number;
      wrap.appendChild(el('div', 'xiaobao-issue-num', {
        position: 'absolute',
        left: (num.left + ISSUE_NUM_OPTICAL_X) + 'px',
        top: ((num.top != null ? num.top : 0) + ISSUE_NUM_OPTICAL_Y) + 'px',
        width: num.width + 'px',
        height: circleH + 'px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: num.fontFamily || FONT_SERIF,
        fontSize: num.fontSize + 'px',
        fontWeight: String(num.fontWeight || 500),
        lineHeight: num.lineHeight != null ? num.lineHeight + 'px' : '1',
        letterSpacing: (num.letterSpacing != null ? num.letterSpacing : -2) + 'px',
        color: '#000',
      }, data.issueNumber || '18'));
    } else {
      wrap.appendChild(el('div', 'xiaobao-issue-num', {
        position: 'absolute',
        left: (23 + ISSUE_NUM_OPTICAL_X) + 'px',
        top: ISSUE_NUM_OPTICAL_Y + 'px',
        width: '95px',
        height: circleH + 'px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: FONT_SERIF,
        fontSize: (iss.numberSize || 88) + 'px',
        fontWeight: '500',
        lineHeight: '1',
        color: '#000',
        letterSpacing: '-2px',
      }, data.issueNumber || '18'));
    }
    if (iss.vol && iss.vol.left != null) {
      var vol = iss.vol;
      wrap.appendChild(el('div', 'xiaobao-issue-vol', {
        position: 'absolute',
        left: vol.left + 'px',
        top: vol.top + 'px',
        width: vol.width + 'px',
        height: vol.height + 'px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: vol.fontFamily || FONT_SANS,
        fontSize: vol.fontSize + 'px',
        fontWeight: String(vol.fontWeight || 500),
        lineHeight: vol.lineHeight + 'px',
        letterSpacing: (vol.letterSpacing != null ? vol.letterSpacing : 0) + 'px',
        color: '#000',
        whiteSpace: 'nowrap',
      }, data.volLabel || 'VoL.'));
    } else {
      wrap.appendChild(el('div', 'xiaobao-issue-vol', {
        position: 'absolute',
        left: '38px',
        top: '144px',
        width: '68px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: FONT_SANS,
        fontSize: (iss.volSize || 33) + 'px',
        fontWeight: '500',
        lineHeight: '32px',
        color: '#000',
        whiteSpace: 'nowrap',
      }, data.volLabel || 'VoL.'));
    }
    return wrap;
  }

  function buildVolInline(spec, data, accent) {
    if (!spec.volInline) return null;
    var v = spec.volInline;
    var lh = v.lineHeight != null ? v.lineHeight : 48;
    var fw = v.fontWeight != null ? v.fontWeight : 400;
    return el('div', 'xiaobao-vol-inline', {
      position: 'absolute',
      left: v.left + 'px',
      top: v.top + 'px',
      width: v.width + 'px',
      height: v.height + 'px',
      zIndex: '4',
      fontFamily: FONT_PACIFICO,
      fontWeight: String(fw),
      color: accent,
      whiteSpace: 'nowrap',
      lineHeight: lh + 'px',
    }, '<span style="font-size:' + v.volSize + 'px;line-height:' + lh + 'px">Vol.</span><span style="font-size:' + v.numSize + 'px;line-height:' + lh + 'px">' + escHtml(data.issueNumber || '18') + '</span>');
  }

  function buildDateBlock(spec, data) {
    if (!spec.date) return null;
    var d = spec.date;
    var wrap = el('div', 'xiaobao-date', {
      position: 'absolute',
      left: d.left + 'px',
      top: d.top + 'px',
      width: d.width + 'px',
      zIndex: '4',
      color: '#000',
    });
    if (d.height) wrap.style.height = d.height + 'px';
    if (d.textAlign) wrap.style.textAlign = d.textAlign;
    wrap.appendChild(el('div', '', {
      fontSize: d.dateSize + 'px',
      lineHeight: d.lineHeight + 'px',
      letterSpacing: (d.letterSpacing != null ? d.letterSpacing : -0.85) + 'px',
      fontWeight: '400',
      fontFamily: FONT_SANS,
    }, data.date || '2026/06/12'));
    if (d.subSize != null) {
      wrap.appendChild(el('div', '', {
        fontSize: d.subSize + 'px',
        lineHeight: d.lineHeight + 'px',
        letterSpacing: (d.subLetterSpacing != null ? d.subLetterSpacing : (d.letterSpacing != null ? d.letterSpacing : -0.72)) + 'px',
        fontWeight: '400',
        fontFamily: FONT_SANS,
        marginTop: (d.subGap != null ? d.subGap : 3) + 'px',
      }, FIXED_DATE_SUBTITLE));
    }
    return wrap;
  }

  function buildLogo(spec) {
    if (!spec.logo) return null;
    var l = spec.logo;
    var wrap = el('div', 'xiaobao-logo', {
      position: 'absolute',
      left: l.left + 'px',
      top: l.top + 'px',
      width: l.width + 'px',
      height: l.height + 'px',
      zIndex: '4',
      overflow: 'hidden',
    });
    wrap.appendChild(buildImgAsset(ASSETS.logoBlack, '', {
      position: 'absolute',
      left: '0',
      top: '0',
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    }));
    return wrap;
  }

  function buildCredit(spec, data) {
    if (!spec.credit) return null;
    var c = spec.credit;
    var creditText = c.align === 'center'
      ? '图片来自豆友@' + escHtml(data.photoCredit || 'Shah ོ')
      : '@' + escHtml(data.photoCredit || 'Shah ོ');
    var styles = {
      position: 'absolute',
      fontSize: c.fontSize + 'px',
      color: '#fff',
      zIndex: '5',
      whiteSpace: 'nowrap',
      lineHeight: (c.lineHeight || 30) + 'px',
      fontWeight: String(c.fontWeight != null ? c.fontWeight : 400),
      boxSizing: 'border-box',
    };
    if (c.fontFamily) styles.fontFamily = c.fontFamily;
    if (c.width) styles.width = c.width + 'px';
    if (c.height) styles.height = c.height + 'px';
    if (c.shadow) styles.textShadow = c.shadow;
    if (c.letterSpacing != null) styles.letterSpacing = c.letterSpacing + 'px';
    if (c.align === 'center') {
      if (c.left != null) styles.left = c.left + 'px';
      else {
        styles.left = '50%';
        styles.transform = 'translateX(-50%)';
      }
      styles.top = c.top + 'px';
      styles.textAlign = 'center';
      if (!c.shadow) styles.textShadow = '0 4px 8.3px rgba(0,0,0,0.25)';
    } else {
      styles.left = c.left + 'px';
      styles.top = c.top + 'px';
      if (!c.shadow) styles.textShadow = '0 0 14.4px rgba(0,0,0,0.6)';
      if (c.align === 'right') styles.textAlign = 'right';
    }
    var wrap = el('div', 'xiaobao-credit', styles, creditText);
    if (c.iconLeft != null && c.align !== 'center') {
      wrap.appendChild(buildImgAsset(ASSETS.creditIcon, 'xiaobao-credit-icon', {
        position: 'absolute',
        left: (c.iconLeft - c.left) + 'px',
        top: (c.iconTop - c.top) + 'px',
        width: c.iconW + 'px',
        height: c.iconH + 'px',
      }));
    }
    if (c.iconLeft != null && c.align === 'center') {
      var creditLeft = c.left != null ? c.left : 0;
      wrap.appendChild(buildImgAsset(ASSETS.creditIcon, 'xiaobao-credit-icon', {
        position: 'absolute',
        left: (c.iconLeft - creditLeft) + 'px',
        top: (c.iconTop - c.top) + 'px',
        width: c.iconW + 'px',
        height: c.iconH + 'px',
      }));
    }
    return wrap;
  }

  function buildButton(spec, accent) {
    if (!spec.button) return null;
    var b = spec.button;
    var btn = el('div', 'xiaobao-btn', {
      position: 'absolute',
      left: b.left + 'px',
      top: b.top + 'px',
      width: b.width + 'px',
      height: b.height + 'px',
      borderRadius: b.radius + 'px',
      background: accent,
      zIndex: '4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      padding: (b.paddingTop != null ? b.paddingTop : 0) + 'px '
        + (b.paddingRight != null ? b.paddingRight : 0) + 'px '
        + (b.paddingBottom != null ? b.paddingBottom : 0) + 'px '
        + (b.paddingLeft != null ? b.paddingLeft : 0) + 'px',
    });
    btn.appendChild(el('span', 'xiaobao-btn-text', {
      fontSize: b.fontSize + 'px',
      fontWeight: String(b.fontWeight || 700),
      lineHeight: (b.lineHeight || 54.52) + 'px',
      color: '#ffffff',
      whiteSpace: 'nowrap',
    }, '去看看 >'));
    return btn;
  }

  function buildHotLabel(spec, data, key) {
    if (!spec.hotLabel) return null;
    var h = spec.hotLabel;
    var top = resolveHotLabelTop(data, key, spec);
    var styles = {
      position: 'absolute',
      left: h.left + 'px',
      top: top + 'px',
      fontSize: h.fontSize + 'px',
      fontWeight: '700',
      lineHeight: h.lineHeight + 'px',
      color: '#000',
      zIndex: '4',
      boxSizing: 'border-box',
    };
    if (h.width) styles.width = h.width + 'px';
    if (h.height) styles.height = h.height + 'px';
    return el('div', 'xiaobao-hot-label', styles, '本期热议:');
  }

  function buildDoumao(spec) {
    if (!spec.doumao) return null;
    var d = spec.doumao;
    var wrap = el('div', 'xiaobao-doumao', {
      position: 'absolute',
      left: d.left + 'px',
      top: d.top + 'px',
      width: d.width + 'px',
      height: d.height + 'px',
      zIndex: '3',
      overflow: 'hidden',
      pointerEvents: 'none',
    });
    wrap.appendChild(buildImgAsset(ASSETS.doumao, '', {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      transform: d.mirror ? 'scaleX(-1)' : '',
    }));
    return wrap;
  }

  function buildVolBar(spec, data) {
    if (!spec.volBar) return null;
    var v = spec.volBar;
    var logo = v.logo || { left: 0, top: 0, width: 134, height: 45 };
    var vol = v.vol || { left: 140, top: -11, width: 84, height: 42, volSize: 30, numSize: 42, lineHeight: 48, numLineHeight: 40 };
    var weekly = v.weekly || { top: 34, height: 14, fontSize: 12.5, fontUnit: 'pt', lineHeight: 12, fontWeight: 500, text: 'Douer Weekly' };
    var volSize = vol.volSize != null ? vol.volSize : 30;
    var numSize = vol.numSize != null ? vol.numSize : 42;
    var volLh = vol.lineHeight != null ? vol.lineHeight : 48;
    var numLh = vol.numLineHeight != null ? vol.numLineHeight : 40;
    var weeklyLeft = weekly.left != null ? weekly.left : vol.left;
    var weeklyExtra = weekly.widthExtra != null ? weekly.widthExtra : 0;
    var weeklyExtraPx = (weekly.widthExtraUnit || 'px') === 'pt' ? weeklyExtra * 96 / 72 : weeklyExtra;
    var weeklyWidth = weekly.width != null ? weekly.width : vol.width + weeklyExtraPx;
    var weeklyText = weekly.text != null ? weekly.text : FIXED_DATE_SUBTITLE;
    var weeklyFontSize = weekly.fontSize != null ? weekly.fontSize : 12.5;
    var weeklyFontUnit = weekly.fontUnit || 'pt';
    var weeklyFontWeight = weekly.fontWeight != null ? weekly.fontWeight : 500;
    var weeklyNaturalWidth = measureSansTextWidth(weeklyText, weeklyFontSize, weeklyFontWeight, weeklyFontUnit);
    var weeklyScaleX = weeklyNaturalWidth > 0 ? weeklyWidth / weeklyNaturalWidth : 1;
    var weeklyStyles = {
      position: 'absolute',
      left: weeklyLeft + 'px',
      top: weekly.top + 'px',
      height: weekly.height + 'px',
      fontFamily: FONT_SANS,
      fontWeight: String(weeklyFontWeight),
      fontSize: weeklyFontSize + weeklyFontUnit,
      lineHeight: weekly.lineHeight + 'px',
      color: '#000000',
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
    };
    if (weekly.stretch !== false && weeklyWidth > 0 && weeklyScaleX !== 1) {
      weeklyStyles.transform = 'scaleX(' + weeklyScaleX + ')';
      weeklyStyles.transformOrigin = 'left top';
    } else {
      weeklyStyles.width = weeklyWidth + 'px';
    }
    var wrap = el('div', 'xiaobao-vol-bar', {
      position: 'absolute',
      left: v.left + 'px',
      top: v.top + 'px',
      width: v.width + 'px',
      height: v.height + 'px',
      zIndex: '4',
      overflow: 'visible',
    });
    wrap.appendChild(buildImgAsset(ASSETS.logoHorizontal, '', {
      position: 'absolute',
      left: logo.left + 'px',
      top: logo.top + 'px',
      width: logo.width + 'px',
      height: logo.height + 'px',
      objectFit: 'contain',
    }));
    wrap.appendChild(el('div', 'xiaobao-vol-bar-vol', {
      position: 'absolute',
      left: vol.left + 'px',
      top: vol.top + 'px',
      width: vol.width + 'px',
      height: vol.height + 'px',
      fontFamily: FONT_PACIFICO,
      fontWeight: '400',
      lineHeight: volLh + 'px',
      color: '#000000',
      whiteSpace: 'nowrap',
    }, '<span style="font-size:' + volSize + 'px;line-height:' + volLh + 'px">Vol.</span><span style="font-size:' + numSize + 'px;line-height:' + numLh + 'px">' + escHtml(data.issueNumber || '20') + '</span>'));
    wrap.appendChild(el('div', 'xiaobao-vol-bar-weekly', weeklyStyles, weeklyText));
    return wrap;
  }

  function buildVolOverlayText(spec, text) {
    return el('div', spec.cls || '', {
      position: 'absolute',
      left: spec.left + 'px',
      top: spec.top + 'px',
      width: spec.width + 'px',
      height: spec.height + 'px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      textAlign: 'center',
      fontFamily: FONT_PACIFICO,
      fontWeight: '400',
      fontSize: spec.fontSize + 'px',
      lineHeight: spec.lineHeight + 'px',
      letterSpacing: (spec.letterSpacing != null ? spec.letterSpacing : 0) + 'px',
      color: '#fff',
      textShadow: spec.textShadow || '0 4px 17.5px rgba(0,0,0,0.25)',
      whiteSpace: 'nowrap',
      overflow: 'visible',
      boxSizing: 'border-box',
    }, text);
  }

  function buildSplashCover(spec, data, key) {
    if (!spec.splash || key !== 'j') return [];
    var parts = [];
    var splash = buildSplashLayer(spec, data, key, spec.frame.width, spec.frame.height);
    if (splash) parts.push(splash);

    if (spec.logoWhite) {
      var lw = spec.logoWhite;
      var logoDropShadow = lw.dropShadow || lw.shadow || '0 4px 22.4px rgba(0,0,0,0.5)';
      var logoWrap = el('div', 'xiaobao-logo-white', {
        position: 'absolute',
        left: lw.left + 'px',
        top: lw.top + 'px',
        width: lw.width + 'px',
        height: lw.height + 'px',
        zIndex: '3',
      });
      logoWrap.appendChild(buildImgAsset(ASSETS.logoWhite, '', {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        filter: 'drop-shadow(' + logoDropShadow + ')',
      }));
      parts.push(logoWrap);
    }

    if (spec.volOverlay) {
      var vo = spec.volOverlay;
      var issueNum = escHtml(data.issueNumber || '18');
      var yearText = data.year || (data.date && data.date.split('/')[0]) || '2026';
      if (vo.vol && vo.left != null) {
        var group = el('div', 'xiaobao-vol-overlay-group', {
          position: 'absolute',
          left: vo.left + 'px',
          top: vo.top + 'px',
          width: (vo.width || 532) + 'px',
          height: (vo.height || 199) + 'px',
          zIndex: '3',
          pointerEvents: 'none',
          overflow: 'visible',
        });
        var volEl = vo.vol;
        group.appendChild(buildVolOverlayText({
          cls: 'xiaobao-vol-overlay-vol',
          left: volEl.left != null ? volEl.left : 0,
          top: volEl.top != null ? volEl.top : 0,
          width: volEl.width,
          height: volEl.height,
          fontSize: volEl.fontSize,
          lineHeight: volEl.lineHeight,
          letterSpacing: volEl.letterSpacing,
          textShadow: volEl.textShadow,
        }, 'vol.' + issueNum));
        var yearEl = vo.year;
        if (yearEl) {
          group.appendChild(buildVolOverlayText({
            cls: 'xiaobao-vol-overlay-year',
            left: yearEl.left != null ? yearEl.left : 116,
            top: yearEl.top != null ? yearEl.top : 129,
            width: yearEl.width,
            height: yearEl.height,
            fontSize: yearEl.fontSize,
            lineHeight: yearEl.lineHeight,
            letterSpacing: yearEl.letterSpacing,
            textShadow: yearEl.textShadow,
          }, yearText));
        }
        parts.push(group);
      } else if (vo.vol && vo.vol.left != null) {
        var volElAbs = vo.vol;
        parts.push(buildVolOverlayText({
          cls: 'xiaobao-vol-overlay-vol',
          left: volElAbs.left,
          top: volElAbs.top,
          width: volElAbs.width,
          height: volElAbs.height,
          fontSize: volElAbs.fontSize,
          lineHeight: volElAbs.lineHeight,
          letterSpacing: volElAbs.letterSpacing,
          textShadow: volElAbs.textShadow,
        }, 'vol.' + issueNum));
        var yearElAbs = vo.year;
        if (yearElAbs) {
          parts.push(buildVolOverlayText({
            cls: 'xiaobao-vol-overlay-year',
            left: yearElAbs.left,
            top: yearElAbs.top,
            width: yearElAbs.width,
            height: yearElAbs.height,
            fontSize: yearElAbs.fontSize,
            lineHeight: yearElAbs.lineHeight,
            letterSpacing: yearElAbs.letterSpacing,
            textShadow: yearElAbs.textShadow,
          }, yearText));
        }
      }
    }

    parts.push(buildCredit(spec, data));
    return parts.filter(Boolean);
  }

  function buildHeadPoster(spec, data) {
    var transparent = spec.transparentBg === true;
    var bgColor = transparent ? null : resolveBg(data);
    var card = el('div', 'poster-card xiaobao-poster xiaobao-head poster-font', {
      width: spec.frame.width + 'px',
      height: spec.frame.height + 'px',
      position: 'relative',
      overflow: 'hidden',
      background: transparent ? 'transparent' : resolveBg(data),
    });
    buildBgAndDou(spec, bgColor, resolveDouColor(data), data, 'p').forEach(function (node) {
      card.appendChild(node);
    });
    if (spec.titleLogo) {
      var tl = spec.titleLogo;
      card.appendChild(buildImgAsset(tl.src || ASSETS.headTitleLogo, 'xiaobao-head-title-logo', {
        position: 'absolute',
        left: tl.left + 'px',
        top: tl.top + 'px',
        width: tl.width + 'px',
        height: tl.height + 'px',
        objectFit: 'contain',
        display: 'block',
        zIndex: String(tl.zIndex != null ? tl.zIndex : 2),
      }));
    }
    if (spec.badgeLogo) {
      var bl = spec.badgeLogo;
      card.appendChild(buildImgAsset(bl.src || ASSETS.headDoubanLogo, 'xiaobao-head-badge-logo', {
        position: 'absolute',
        left: bl.left + 'px',
        top: bl.top + 'px',
        width: bl.width + 'px',
        height: bl.height + 'px',
        objectFit: 'contain',
        display: 'block',
        zIndex: String(bl.zIndex != null ? bl.zIndex : 3),
      }));
    }
    var issueEl = buildIssueBadge(spec, data, resolveAccent(data));
    if (issueEl) card.appendChild(issueEl);
    var dateEl = buildDateBlock(spec, data);
    if (dateEl) card.appendChild(dateEl);
    return card;
  }

  function buildHomeBanner(spec, accent) {
    var card = el('div', 'xiaobao-home-banner', {
      width: spec.frame.width + 'px',
      height: spec.frame.height + 'px',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: accent,
    });
    if (spec.shadow) {
      var s = spec.shadow;
      card.appendChild(el('div', 'xiaobao-banner-shadow', {
        position: 'absolute',
        left: s.left + 'px',
        top: s.top + 'px',
        width: s.width + 'px',
        height: s.height + 'px',
        borderRadius: '50%',
        background: '#d8d8d8',
        mixBlendMode: 'multiply',
        zIndex: '1',
      }));
    }
    if (spec.doumao) {
      card.appendChild(buildDoumao(spec));
    }
    return card;
  }

  function buildIconPoster(spec, bgColor, douColor, data, key) {
    var w = spec.frame.width;
    var h = spec.frame.height;
    var card = el('div', 'poster-card xiaobao-poster xiaobao-icon poster-font', {
      width: w + 'px',
      height: h + 'px',
      position: 'relative',
      overflow: 'hidden',
    });
    buildBgAndDou(spec, bgColor, douColor, data, key).forEach(function (node) { card.appendChild(node); });
    var logo = buildLogo(spec);
    if (logo) card.appendChild(logo);
    if (spec.logoSmall) {
      var ls = spec.logoSmall;
      var lw = el('div', '', {
        position: 'absolute',
        left: ls.left + 'px',
        top: ls.top + 'px',
        width: ls.width + 'px',
        height: ls.height + 'px',
        zIndex: '4',
      });
      lw.appendChild(buildImgAsset(ASSETS.logoSmall, '', { width: '100%', height: '100%', objectFit: 'contain' }));
      card.appendChild(lw);
    }
    return card;
  }

  function buildXiaobaoPoster(key, data) {
    var spec = XIAOBAO_FIGMA[key];
    if (!spec) throw new Error('未知小报模板：' + key);

    if (key === 'k') return buildHomeBanner(spec, resolveAccent(data));
    if (key === 'p') return buildHeadPoster(spec, data);
    if (key === 'l' || key === 'm') return buildIconPoster(spec, resolveBg(data), resolveDouColor(data), data, key);

    if (key === 'j') {
      var cover = el('div', 'poster-card xiaobao-poster xiaobao-cover poster-font', {
        width: spec.frame.width + 'px',
        height: spec.frame.height + 'px',
        position: 'relative',
        overflow: 'hidden',
      });
      buildSplashCover(spec, data, key).forEach(function (node) { cover.appendChild(node); });
      return cover;
    }

    var w = spec.frame.width;
    var h = spec.frame.height;
    var bgColor = resolveBg(data);
    var douColor = resolveDouColor(data);
    var accent = resolveAccent(data);

    var card = el('div', 'poster-card xiaobao-poster poster-font', {
      width: w + 'px',
      height: h + 'px',
      position: 'relative',
      overflow: 'hidden',
      background: bgColor,
    });

    buildBgAndDou(spec, bgColor, douColor, data, key).forEach(function (node) { card.appendChild(node); });

    [
      buildSplashLayer(spec, data, key, w, h),
      buildLogo(spec),
      buildIssueBadge(spec, data, accent),
      buildVolInline(spec, data, accent),
      buildDateBlock(spec, data),
      buildHotLabel(spec, data, key),
      buildTitle(spec, data, key),
      buildButton(spec, accent),
      buildVolBar(spec, data),
      buildDoumao(spec),
      buildCredit(spec, data),
    ].forEach(function (node) {
      if (node) card.appendChild(node);
    });

    if (spec.logoSmall) {
      var ls = spec.logoSmall;
      var lw = el('div', 'xiaobao-logo-small', {
        position: 'absolute',
        left: ls.left + 'px',
        top: ls.top + 'px',
        width: ls.width + 'px',
        height: ls.height + 'px',
        zIndex: '4',
      });
      lw.appendChild(buildImgAsset(ASSETS.logoSmall, '', { width: '100%', height: '100%', objectFit: 'contain' }));
      card.appendChild(lw);
    }

    return card;
  }

  function getSplashSpec(key) {
    var spec = XIAOBAO_FIGMA[key];
    if (!spec) return null;
    if (spec.splash) return spec.splash;
    if (spec.photo) return spec.photo;
    return null;
  }

  global.XiaobaoPoster = {
    ASSETS: ASSETS,
    XIAOBAO_FIGMA: XIAOBAO_FIGMA,
    XIAOBAO_SIZES: XIAOBAO_SIZES,
    DEFAULT_BG: DEFAULT_BG,
    DEFAULT_DOU: DEFAULT_DOU,
    DEFAULT_ACCENT: DEFAULT_ACCENT,
    resolveDouColor: resolveDouColor,
    buildXiaobaoPoster: buildXiaobaoPoster,
    getSplashSpec: getSplashSpec,
    resolveTitlePosition: resolveTitlePosition,
    resolveTitleLayout: resolveTitleLayout,
    resolveHotLabelTop: resolveHotLabelTop,
    resolveTitleText: resolveTitleText,
    formatTitleHtml: formatTitleHtml,
    applySplashTransform: applySplashTransform,
    EXPORT_KEYS: ['e', 'f', 'n', 'g', 'h', 'i', 'p', 'j', 'k', 'l', 'm'],
    PREVIEW_KEYS: ['g', 'h', 'e', 'f', 'n', 'j', 'l', 'm', 'k', 'i', 'p'],
    PREVIEW_STACK_GH: { gap: 50 },
    PREVIEW_ROW_GL: { gap: 70 },
    PREVIEW_ROW_HK: { gap: 70 },
    PREVIEW_ROW_IP: { gap: 70 },
    PREVIEW_STACK_KI: { gap: 100 },
    PREVIEW_STACK_HE: { gap: 300 },
    PREVIEW_ROW_EF: { gap: 108 },
    PREVIEW_ROW_NJ: { gap: 108 },
    PREVIEW_ROW_IJ: { gap: 70 },
    PREVIEW_STACK_LM: { gap: 50 },
  };
})(window);
