(function (global) {
  'use strict';

  var USER_SPLASH_FIGMA = {
    /** 用户开屏 1242×2110 — Figma node 6:5 */
    u: {
      frame: { width: 1242, height: 2110 },
      bg: { color: '#FFFFFF', opacity: 1 },
      hero: { left: 151, top: 367, width: 940, height: 940 },
      title: { top: 1378, height: 90, fontSize: 60, fontWeight: 300, color: '#000000', lineHeight: 60 },
      meta: { top: 1504, height: 60, fontSize: 60, fontWeight: 300, color: '#000000', lineHeight: 60, gap: 4 },
    },
    /** 用户开屏 1242×1863 — Figma node 6:10 */
    v: {
      frame: { width: 1242, height: 1863 },
      bg: { color: '#FFFFFF', opacity: 1 },
      hero: { left: 152, top: 249, width: 938, height: 938 },
      title: { top: 1254, height: 90, fontSize: 60, fontWeight: 300, color: '#000000', lineHeight: 60 },
      meta: { top: 1380, height: 60, fontSize: 60, fontWeight: 300, color: '#000000', lineHeight: 60, gap: 4 },
    },
    /** 用户开屏 1536×1680 — Figma node 6:16 */
    w: {
      frame: { width: 1536, height: 1680 },
      bg: { color: '#FFFFFF', opacity: 1 },
      hero: { left: 347, top: 224, width: 843, height: 843 },
      title: { top: 1132, height: 83, fontSize: 60, fontWeight: 300, color: '#000000', lineHeight: 60 },
      meta: { top: 1245, height: 60, fontSize: 60, fontWeight: 300, color: '#000000', lineHeight: 60, gap: 19 },
    },
  };

  var USER_SPLASH_SIZES = {
    u: {
      width: 1242,
      height: 2110,
      exportName: 'user-splash-1242x2110',
      label: '用户开屏（1242×2110）',
      scale: 0.28,
    },
    v: {
      width: 1242,
      height: 1863,
      exportName: 'user-splash-1242x1863',
      label: '用户开屏（1242×1863）',
      scale: 0.28,
    },
    w: {
      width: 1536,
      height: 1680,
      exportName: 'user-splash-1536x1680',
      label: '用户开屏（1536×1680）',
      scale: 0.24,
    },
  };

  var EXPORT_KEYS = ['u', 'v', 'w'];
  var PREVIEW_KEYS = ['u', 'v', 'w'];

  var CATEGORY_LABELS = {
    photography: '摄影：',
    painting: '绘画：',
  };

  function el(tag, cls, styles, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (styles) Object.keys(styles).forEach(function (k) { node.style[k] = styles[k]; });
    if (html != null) node.innerHTML = html;
    return node;
  }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function resolveCategoryLabel(type) {
    return CATEGORY_LABELS[type] || CATEGORY_LABELS.painting;
  }

  function applyUserSplashHeroTransform(img, data, spec, key) {
    if (!global.HeroEditor) return;
    var hero = spec.hero;
    var transform = global.HeroEditor.resolveHeroTransform(data, key);
    global.HeroEditor.applyHeroTransform(img, hero.width, hero.height, transform, null, { bottomFade: false });
  }

  function buildUserSplashPoster(key, data) {
    var spec = USER_SPLASH_FIGMA[key];
    if (!spec) throw new Error('未知用户开屏模板：' + key);
    var w = spec.frame.width;
    var h = spec.frame.height;
    var hero = spec.hero;
    var titleSpec = spec.title;
    var metaSpec = spec.meta;

    var bg = spec.bg || { color: '#FFFFFF', opacity: 1 };
    var card = el('div', 'poster-card user-splash-poster poster-font', {
      width: w + 'px',
      height: h + 'px',
      position: 'relative',
      overflow: 'hidden',
      background: bg.color || '#FFFFFF',
    });
    card.appendChild(el('div', 'user-splash-bg', {
      position: 'absolute',
      inset: '0',
      background: bg.color || '#FFFFFF',
      opacity: String(bg.opacity != null ? bg.opacity : 1),
      zIndex: '0',
    }));

    var heroWrap = el('div', 'user-splash-hero', {
      position: 'absolute',
      left: hero.left + 'px',
      top: hero.top + 'px',
      width: hero.width + 'px',
      height: hero.height + 'px',
      borderRadius: '50%',
      overflow: 'hidden',
      zIndex: '1',
    });
    var heroImg = el('img', 'user-splash-hero-img', {
      position: 'absolute',
      display: 'block',
      objectFit: 'cover',
    });
    applyUserSplashHeroTransform(heroImg, data, spec, key);
    heroImg.src = data.heroImage || '';
    heroImg.alt = '';
    if (data.heroImage && data.heroImage.indexOf('data:') !== 0) heroImg.crossOrigin = 'anonymous';
    heroWrap.appendChild(heroImg);
    card.appendChild(heroWrap);

    card.appendChild(el('div', 'user-splash-title', {
      position: 'absolute',
      left: '0',
      right: '0',
      top: titleSpec.top + 'px',
      height: titleSpec.height + 'px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontSize: titleSpec.fontSize + 'px',
      fontWeight: String(titleSpec.fontWeight),
      color: titleSpec.color,
      lineHeight: titleSpec.lineHeight + 'px',
      zIndex: '2',
      padding: '0 40px',
      boxSizing: 'border-box',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    }, escHtml(data.title || '')));

    var metaRow = el('div', 'user-splash-meta', {
      position: 'absolute',
      left: '0',
      right: '0',
      top: metaSpec.top + 'px',
      height: metaSpec.height + 'px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: metaSpec.gap + 'px',
      zIndex: '2',
      pointerEvents: 'none',
      boxSizing: 'border-box',
    });
    var textStyle = {
      fontSize: metaSpec.fontSize + 'px',
      fontWeight: String(metaSpec.fontWeight),
      color: metaSpec.color,
      lineHeight: metaSpec.lineHeight + 'px',
      whiteSpace: 'nowrap',
    };
    metaRow.appendChild(el('span', 'user-splash-category', textStyle, escHtml(resolveCategoryLabel(data.categoryType))));
    metaRow.appendChild(el('span', 'user-splash-username', textStyle, escHtml(data.username || '')));
    card.appendChild(metaRow);

    return card;
  }

  global.UserSplashPoster = {
    USER_SPLASH_FIGMA: USER_SPLASH_FIGMA,
    USER_SPLASH_SIZES: USER_SPLASH_SIZES,
    EXPORT_KEYS: EXPORT_KEYS,
    PREVIEW_KEYS: PREVIEW_KEYS,
    CATEGORY_LABELS: CATEGORY_LABELS,
    buildUserSplashPoster: buildUserSplashPoster,
    applyUserSplashHeroTransform: applyUserSplashHeroTransform,
  };
})(window);
