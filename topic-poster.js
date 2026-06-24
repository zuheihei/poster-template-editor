(function (global) {
  'use strict';

  var TOPIC_GRADIENT = {
    start: '#708FC1',
    startAlpha: 0,
    end: '#354659',
    endAlpha: 1,
    /** Figma gradientTransform 主轴纵向缩放 ≈ 2.233 */
    transformScale: 2.233,
    transform: { a: 0, b: -2.233, c: 2.233, d: 0, e: -0.337, f: 1.616 },
  };

  var TOPIC_FIGMA = {
    /** 专题推荐 1242×2110 */
    c: {
      frame: { width: 1242, height: 2110 },
      mask: { left: 0, top: 923, width: 1242, height: 1187 },
      gradient: TOPIC_GRADIENT,
      badge: { left: 475.5, top: 1179, width: 290, height: 73, radius: 8, bg: '#5B9BBF', fontSize: 42, paddingX: 19, paddingY: 7 },
      title: { left: 31, top: 1271, width: 1179, height: 140, fontSize: 100, fontWeight: 600 },
      groups: { left: 31, top: 1430, width: 1179, minHeight: 220, gap: 18 },
    },
    /** 专题推荐 1242×1863 */
    d: {
      frame: { width: 1242, height: 1863 },
      mask: { left: 0, top: 676, width: 1242, height: 1187 },
      gradient: TOPIC_GRADIENT,
      badge: { left: 475.5, top: 998, width: 290, height: 73, radius: 8, bg: '#5B9BBF', fontSize: 42, paddingX: 19, paddingY: 7 },
      title: { left: 31, top: 1090, width: 1179, height: 140, fontSize: 100, fontWeight: 600 },
      groups: { left: 31, top: 1249, width: 1179, minHeight: 220, gap: 18 },
    },
  };

  var TOPIC_SIZES = {
    c: { width: 1242, height: 2110, exportName: 'topic-1242x2110', label: '专题（1242×2110）', scale: 0.28 },
    d: { width: 1242, height: 1863, exportName: 'topic-1242x1863', label: '专题（1242×1863）', scale: 0.28 },
  };

  var CHIP = {
    height: 101,
    radius: 20,
    bg: 'rgba(0,0,0,0.3)',
    paddingTop: 13,
    paddingRight: 26,
    paddingBottom: 13,
    paddingLeft: 17,
    gap: 14,
    avatarSize: 75,
    avatarRadius: 12,
    fontSize: 32,
    color: '#E2E2E2',
  };

  var DEFAULT_GRADIENT_COLOR = '#354659';

  function hexToRgb(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    if (Number.isNaN(n)) return { r: 112, g: 143, b: 193 };
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgba(hex, alpha) {
    var c = hexToRgb(hex);
    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha + ')';
  }

  function buildGradientStyle(endColorOverride, spec) {
    var gradient = spec.gradient || TOPIC_GRADIENT;
    var start = gradient.start || '#708FC1';
    var startAlpha = gradient.startAlpha != null ? gradient.startAlpha : 0;
    var end = endColorOverride || gradient.end || DEFAULT_GRADIENT_COLOR;
    var endAlpha = gradient.endAlpha != null ? gradient.endAlpha : 1;
    var scale = gradient.transformScale || 1;
    var transform = gradient.transform || {};
    var image = 'linear-gradient(180deg, '
      + rgba(start, startAlpha) + ' 0%, '
      + rgba(end, endAlpha) + ' 100%)';
    return {
      backgroundImage: image,
      backgroundSize: '100% ' + (scale * 100).toFixed(1) + '%',
      backgroundPosition: ((transform.e || 0) * 100).toFixed(1) + '% 0',
      backgroundRepeat: 'no-repeat',
    };
  }

  function buildBadge(badgeSpec) {
    var badge = el('div', 'topic-badge', {
      position: 'absolute',
      left: badgeSpec.left + 'px',
      top: badgeSpec.top + 'px',
      width: badgeSpec.width + 'px',
      height: badgeSpec.height + 'px',
      borderRadius: badgeSpec.radius + 'px',
      background: badgeSpec.bg,
      zIndex: '3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: badgeSpec.paddingY + 'px ' + badgeSpec.paddingX + 'px',
      boxSizing: 'border-box',
    });
    badge.appendChild(el('span', '', {
      fontSize: badgeSpec.fontSize + 'px',
      color: '#FFFFFF',
      fontWeight: '400',
      whiteSpace: 'nowrap',
      lineHeight: '58.8px',
      textAlign: 'center',
    }, '豆瓣专题推荐'));
    return badge;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h = 0;
    var s = 0;
    var l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        default: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    var r;
    var g;
    var b;
    if (s === 0) {
      r = g = b = l;
    } else {
      var hue2rgb = function (p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  function dominantColorFromPixels(data, options) {
    options = options || {};
    var filterExtremes = options.filterExtremes !== false;
    var buckets = {};
    var sums = {};
    for (var i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 20) continue;
      var r = data[i];
      var g = data[i + 1];
      var b = data[i + 2];
      if (filterExtremes) {
        var hsl = rgbToHsl(r, g, b);
        if (hsl.l < 8 || hsl.l > 92 || hsl.s < 6) continue;
      }
      var key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
      if (!buckets[key]) {
        buckets[key] = 0;
        sums[key] = { r: 0, g: 0, b: 0 };
      }
      buckets[key]++;
      sums[key].r += r;
      sums[key].g += g;
      sums[key].b += b;
    }
    var bestKey = null;
    var bestCount = 0;
    Object.keys(buckets).forEach(function (key) {
      if (buckets[key] > bestCount) {
        bestCount = buckets[key];
        bestKey = key;
      }
    });
    if (!bestKey) return null;
    var count = buckets[bestKey];
    return {
      r: Math.round(sums[bestKey].r / count),
      g: Math.round(sums[bestKey].g / count),
      b: Math.round(sums[bestKey].b / count),
    };
  }

  function toHarmoniousGradientColor(r, g, b) {
    var hsl = rgbToHsl(r, g, b);
    hsl.s = clamp(hsl.s * 0.85, 25, 75);
    hsl.l = clamp(hsl.l * 0.42, 18, 40);
    var rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(
      Math.max(0, Math.min(255, rgb.r)),
      Math.max(0, Math.min(255, rgb.g)),
      Math.max(0, Math.min(255, rgb.b))
    );
  }

  function harmoniousGradientColorFromPixels(data) {
    var dominant = dominantColorFromPixels(data, { filterExtremes: true });
    if (!dominant) {
      dominant = dominantColorFromPixels(data, { filterExtremes: false });
    }
    if (!dominant) return null;
    return toHarmoniousGradientColor(dominant.r, dominant.g, dominant.b);
  }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function el(tag, cls, styles, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (styles) Object.keys(styles).forEach(function (k) { node.style[k] = styles[k]; });
    if (html != null) node.textContent = html;
    return node;
  }

  function buildGroupChip(group) {
    var chip = el('div', 'topic-group-chip', {
      display: 'inline-flex',
      alignItems: 'center',
      height: CHIP.height + 'px',
      borderRadius: CHIP.radius + 'px',
      background: CHIP.bg,
      padding: CHIP.paddingTop + 'px ' + CHIP.paddingRight + 'px ' + CHIP.paddingBottom + 'px ' + CHIP.paddingLeft + 'px',
      gap: CHIP.gap + 'px',
      boxSizing: 'border-box',
      maxWidth: '100%',
    });
    var img = el('img', 'topic-group-avatar', {
      width: CHIP.avatarSize + 'px',
      height: CHIP.avatarSize + 'px',
      borderRadius: CHIP.avatarRadius + 'px',
      objectFit: 'cover',
      flexShrink: '0',
      display: 'block',
    });
    img.src = group.avatar || '';
    img.alt = '';
    if (group.avatar && group.avatar.indexOf('data:') !== 0) img.crossOrigin = 'anonymous';
    chip.appendChild(img);
    chip.appendChild(el('span', 'topic-group-name', {
      fontSize: CHIP.fontSize + 'px',
      color: CHIP.color,
      whiteSpace: 'nowrap',
      lineHeight: '1.2',
      fontWeight: '400',
    }, group.name || ''));
    return chip;
  }

  function applyTopicHeroTransform(img, data, frameWidth, frameHeight, key) {
    if (!global.HeroEditor) return;
    var transform = global.HeroEditor.resolveHeroTransform(data, key);
    global.HeroEditor.applyHeroTransform(img, frameWidth, frameHeight, transform, null, { bottomFade: true });
  }

  function buildTopicPoster(key, data) {
    var spec = TOPIC_FIGMA[key];
    if (!spec) throw new Error('未知专题模板：' + key);
    var w = spec.frame.width;
    var h = spec.frame.height;
    var gradColor = data.gradientColor || data.gradientEnd || data.gradientStart || DEFAULT_GRADIENT_COLOR;

    var card = el('div', 'poster-card topic-poster', {
      width: w + 'px',
      height: h + 'px',
      position: 'relative',
      overflow: 'hidden',
      background: gradColor,
    });

    var hero = el('div', 'topic-hero', {
      position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', zIndex: '1', overflow: 'hidden',
    });
    var heroImg = el('img', 'topic-hero-img', {
      position: 'absolute', display: 'block', objectFit: 'cover',
    });
    applyTopicHeroTransform(heroImg, data, w, h, key);
    heroImg.src = data.heroImage || '';
    heroImg.alt = '';
    if (data.heroImage && data.heroImage.indexOf('data:') !== 0) heroImg.crossOrigin = 'anonymous';
    hero.appendChild(heroImg);
    card.appendChild(hero);

    card.appendChild(el('div', 'topic-gradient', Object.assign({
      position: 'absolute',
      left: spec.mask.left + 'px',
      top: spec.mask.top + 'px',
      width: spec.mask.width + 'px',
      height: spec.mask.height + 'px',
      zIndex: '2',
      pointerEvents: 'none',
    }, buildGradientStyle(gradColor, spec))));

    card.appendChild(buildBadge(spec.badge));

    var titleSpec = spec.title;
    card.appendChild(el('div', 'topic-title', {
      position: 'absolute',
      left: titleSpec.left + 'px',
      top: titleSpec.top + 'px',
      width: titleSpec.width + 'px',
      height: titleSpec.height + 'px',
      zIndex: '3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontSize: titleSpec.fontSize + 'px',
      fontWeight: String(titleSpec.fontWeight),
      color: '#FFFFFF',
      lineHeight: '1.1',
      overflow: 'hidden',
      wordBreak: 'break-all',
    }, data.title || ''));

    var groupsSpec = spec.groups;
    var groupsWrap = el('div', 'topic-groups', {
      position: 'absolute',
      left: groupsSpec.left + 'px',
      top: groupsSpec.top + 'px',
      width: groupsSpec.width + 'px',
      minHeight: groupsSpec.minHeight + 'px',
      zIndex: '3',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignContent: 'flex-start',
      gap: groupsSpec.gap + 'px',
      boxSizing: 'border-box',
    });
    (data.groups || []).forEach(function (group) {
      groupsWrap.appendChild(buildGroupChip(group));
    });
    card.appendChild(groupsWrap);

    return card;
  }

  function sampleGradientFromImage(dataUrl, spec, heroTransform) {
    spec = spec || TOPIC_FIGMA.c;
    heroTransform = heroTransform || { xPercent: 50, yPercent: 50, scale: 100 };
    return new Promise(function (resolve, reject) {
      if (!dataUrl) {
        reject(new Error('没有头图'));
        return;
      }
      var img = new Image();
      var src = String(dataUrl);
      if (src.indexOf('data:') !== 0 && src.indexOf('blob:') !== 0) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = function () {
        try {
          var w = spec.frame.width;
          var h = spec.frame.height;
          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ color: DEFAULT_GRADIENT_COLOR });
            return;
          }

          var scale = Math.max(0.001, (heroTransform.scale || 100) / 100);
          var nw = img.naturalWidth || img.width;
          var nh = img.naturalHeight || img.height;
          var cx = w * (heroTransform.xPercent != null ? heroTransform.xPercent : 50) / 100;
          var cy = h * (heroTransform.yPercent != null ? heroTransform.yPercent : 50) / 100;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.scale(scale, scale);
          ctx.drawImage(img, -nw / 2, -nh / 2, nw, nh);
          ctx.restore();

          var maskTop = Math.max(0, Math.floor(spec.mask.top || 0));
          var maskHeight = Math.min(
            Math.max(0, spec.mask.height || h - maskTop),
            h - maskTop
          );
          var maskData = ctx.getImageData(0, maskTop, w, maskHeight);
          var color = harmoniousGradientColorFromPixels(maskData.data);

          if (!color) {
            resolve({ color: DEFAULT_GRADIENT_COLOR });
            return;
          }

          resolve({ color: color });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = function () { reject(new Error('图片加载失败')); };
      img.src = dataUrl;
    });
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function (v) {
      return v.toString(16).padStart(2, '0');
    }).join('');
  }

  global.TopicPoster = {
    TOPIC_FIGMA: TOPIC_FIGMA,
    TOPIC_GRADIENT: TOPIC_GRADIENT,
    TOPIC_SIZES: TOPIC_SIZES,
    DEFAULT_GRADIENT_COLOR: DEFAULT_GRADIENT_COLOR,
    buildTopicPoster: buildTopicPoster,
    buildGradientStyle: buildGradientStyle,
    sampleGradientFromImage: sampleGradientFromImage,
    MIN_GROUPS: 1,
    MAX_GROUPS: 5,
  };
})(window);
