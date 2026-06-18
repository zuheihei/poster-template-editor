(function (global) {
  'use strict';

  var TOPIC_FIGMA = {
    /** 专题推荐 1242×2110 */
    c: {
      frame: { width: 1242, height: 2110 },
      mask: { left: 0, top: 1029, width: 1242, height: 1081 },
      badge: { left: 475.5, top: 1179, width: 290, height: 73, radius: 8, bg: '#5B9BBF', fontSize: 42, paddingX: 19, paddingY: 7 },
      title: { left: 31, top: 1271, width: 1179, height: 140, fontSize: 100, fontWeight: 600 },
      groups: { left: 31, top: 1430, width: 1179, minHeight: 220, gap: 18 },
    },
    /** 专题推荐 1242×1863 */
    d: {
      frame: { width: 1242, height: 1863 },
      mask: { left: 0, top: 1029, width: 1242, height: 834 },
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

  var DEFAULT_GRADIENT = { start: '#708FC1', end: '#354659' };

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

  function buildGradientStyle(start, end, spec) {
    var rowCount = 2;
    var groupsBottom = spec.groups.top
      + CHIP.height * rowCount
      + spec.groups.gap * (rowCount - 1)
      + 28;
    var solidPercent = ((groupsBottom - spec.mask.top) / spec.mask.height) * 100;
    solidPercent = Math.min(88, Math.max(32, solidPercent));
    var fadePercent = Math.max(0, solidPercent - 18).toFixed(1);
    var solidStop = solidPercent.toFixed(1);
    return 'linear-gradient(to bottom, '
      + rgba(start, 0) + ' 0%, '
      + rgba(end, 0.55) + ' ' + fadePercent + '%, '
      + rgba(end, 1) + ' ' + solidStop + '%, '
      + rgba(end, 1) + ' 100%)';
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

  function buildTopicPoster(key, data) {
    var spec = TOPIC_FIGMA[key];
    if (!spec) throw new Error('未知专题模板：' + key);
    var w = spec.frame.width;
    var h = spec.frame.height;
    var gradStart = data.gradientStart || DEFAULT_GRADIENT.start;
    var gradEnd = data.gradientEnd || DEFAULT_GRADIENT.end;

    var card = el('div', 'poster-card topic-poster', {
      width: w + 'px',
      height: h + 'px',
      position: 'relative',
      overflow: 'hidden',
      background: gradEnd,
    });

    var hero = el('div', 'topic-hero', {
      position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', zIndex: '1', overflow: 'hidden',
    });
    var heroImg = el('img', '', {
      position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
      minWidth: '100%', minHeight: '100%', width: 'auto', height: 'auto',
      objectFit: 'cover', display: 'block',
    });
    heroImg.src = data.heroImage || '';
    heroImg.alt = '';
    if (data.heroImage && data.heroImage.indexOf('data:') !== 0) heroImg.crossOrigin = 'anonymous';
    hero.appendChild(heroImg);
    card.appendChild(hero);

    card.appendChild(el('div', 'topic-gradient', {
      position: 'absolute',
      left: spec.mask.left + 'px',
      top: spec.mask.top + 'px',
      width: spec.mask.width + 'px',
      height: spec.mask.height + 'px',
      zIndex: '2',
      pointerEvents: 'none',
      background: buildGradientStyle(gradStart, gradEnd, spec),
    }));

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

  function sampleGradientFromImage(dataUrl) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement('canvas');
        var size = 48;
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(DEFAULT_GRADIENT);
          return;
        }
        ctx.drawImage(img, 0, img.height * 0.55, img.width, img.height * 0.45, 0, 0, size, size);
        var pixels = ctx.getImageData(0, 0, size, size).data;
        var r = 0; var g = 0; var b = 0; var count = 0;
        for (var i = 0; i < pixels.length; i += 4) {
          r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2]; count++;
        }
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        var start = rgbToHex(
          Math.min(255, Math.round(r * 1.15)),
          Math.min(255, Math.round(g * 1.12)),
          Math.min(255, Math.round(b * 1.1)),
        );
        var end = rgbToHex(
          Math.max(0, Math.round(r * 0.45)),
          Math.max(0, Math.round(g * 0.48)),
          Math.max(0, Math.round(b * 0.52)),
        );
        resolve({ start: start, end: end });
      };
      img.onerror = reject;
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
    TOPIC_SIZES: TOPIC_SIZES,
    DEFAULT_GRADIENT: DEFAULT_GRADIENT,
    buildTopicPoster: buildTopicPoster,
    buildGradientStyle: buildGradientStyle,
    sampleGradientFromImage: sampleGradientFromImage,
    MIN_GROUPS: 1,
    MAX_GROUPS: 5,
  };
})(window);
