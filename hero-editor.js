(function (global) {
  'use strict';

  var MIN_SCALE = 0.1;
  var MAX_SCALE = 10000;

  function clampScale(scale) {
    var n = Number(scale);
    if (!Number.isFinite(n) || n <= 0) return 100;
    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, n));
  }
  var HANDLE = 12;

  if (!global.__heroEditorDocBound) {
    global.__heroEditorDocBound = true;
    document.addEventListener('pointerdown', function (e) {
      var active = global.__heroEditorActive;
      if (!active || !active.isSelected()) return;
      if (active.isEditingTarget(e.target)) return;
      active.deselect();
    });
  }

  var HERO_BOTTOM_FADE_MASK = 'linear-gradient(to bottom, #000 0%, #000 62%, rgba(0,0,0,0.45) 80%, transparent 100%)';

  function applyHeroImageBottomFade(img) {
    if (!img) return;
    img.style.maskImage = HERO_BOTTOM_FADE_MASK;
    img.style.webkitMaskImage = HERO_BOTTOM_FADE_MASK;
    img.style.maskSize = '100% 100%';
    img.style.webkitMaskSize = '100% 100%';
    img.style.maskRepeat = 'no-repeat';
    img.style.webkitMaskRepeat = 'no-repeat';
  }

  function computeCoverTransform(naturalW, naturalH, frameW, frameH) {
    if (!naturalW || !naturalH) {
      return { xPercent: 50, yPercent: 50, scale: 100 };
    }
    var scale = Math.max(frameW / naturalW, frameH / naturalH) * 100;
    return { xPercent: 50, yPercent: 50, scale: clampScale(scale) };
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function scaledSize(img, scalePercent) {
    var s = clampScale(scalePercent) / 100;
    var w = img.naturalWidth || 0;
    var h = img.naturalHeight || 0;
    return { w: w * s, h: h * s };
  }

  function clearHeroImageBottomFade(img) {
    if (!img) return;
    img.style.maskImage = '';
    img.style.webkitMaskImage = '';
    img.style.maskSize = '';
    img.style.webkitMaskSize = '';
    img.style.maskRepeat = '';
    img.style.webkitMaskRepeat = '';
  }

  /** 按原图像素尺寸 + 中心点百分比 + 缩放比例渲染头图（不裁切） */
  function applyHeroTransform(img, frameWidth, frameHeight, transform, container, options) {
    options = options || {};
    if (!img || !transform) return;

    function apply() {
      if (!img.naturalWidth || !img.naturalHeight) return;
      var scale = clampScale(transform.scale || 100) / 100;
      img.style.width = img.naturalWidth + 'px';
      img.style.height = img.naturalHeight + 'px';
      img.style.objectFit = 'none';
      img.style.maxWidth = 'none';
      img.style.maxHeight = 'none';

      var cx = frameWidth * (transform.xPercent != null ? transform.xPercent : 50) / 100;
      var cy = frameHeight * (transform.yPercent != null ? transform.yPercent : 50) / 100;
      if (container) {
        cx -= container.left;
        cy -= container.top;
      }
      img.style.left = cx + 'px';
      img.style.top = cy + 'px';
      img.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
      img.style.transformOrigin = 'center center';
      if (options.bottomFade) applyHeroImageBottomFade(img);
      else clearHeroImageBottomFade(img);
    }

    if (img.complete && img.naturalWidth) apply();
    else img.addEventListener('load', apply, { once: true });
  }

  function boundsFromTransform(frameWidth, frameHeight, transform, img) {
    var cx = frameWidth * (transform.xPercent != null ? transform.xPercent : 50) / 100;
    var cy = frameHeight * (transform.yPercent != null ? transform.yPercent : 50) / 100;
    var size = scaledSize(img, transform.scale);
    return {
      centerX: cx,
      centerY: cy,
      left: cx - size.w / 2,
      top: cy - size.h / 2,
      width: size.w,
      height: size.h,
    };
  }

  function offsetFromFigmaHero(heroLayout, frameWidth, frameHeight) {
    var cx = heroLayout.left + heroLayout.imgOffsetX + heroLayout.imgWidth / 2;
    var cy = heroLayout.top + heroLayout.imgOffsetY + heroLayout.imgHeight / 2;
    return {
      xPercent: (cx / frameWidth) * 100,
      yPercent: (cy / frameHeight) * 100,
      scale: 100,
    };
  }

  function centerInHeroArea(heroLayout, frameWidth, frameHeight) {
    var cx = heroLayout.left + heroLayout.width / 2;
    var cy = heroLayout.top + heroLayout.height / 2;
    return {
      xPercent: (cx / frameWidth) * 100,
      yPercent: (cy / frameHeight) * 100,
      scale: 100,
    };
  }

  function normalizeTransform(t) {
    return {
      xPercent: t.xPercent != null ? t.xPercent : 50,
      yPercent: t.yPercent != null ? t.yPercent : 50,
      scale: t.scale != null ? t.scale : 100,
    };
  }

  function resolveHeroTransform(data, key) {
    if (data && key && data.heroTransformsBySize && data.heroTransformsBySize[key]) {
      return normalizeTransform(data.heroTransformsBySize[key]);
    }
    return normalizeTransform({
      xPercent: data && data.heroOffsetX,
      yPercent: data && data.heroOffsetY,
      scale: data && data.heroScale,
    });
  }

  function attachHeroEditor(mountEl, img, options) {
    options = options || {};
    var previewScale = options.previewScale || 0.28;
    var frameWidth = options.frameWidth;
    var frameHeight = options.frameHeight;
    var getTransform = options.getTransform;
    var setTransform = options.setTransform;
    var onChange = options.onChange;
    var selected = false;

    var editor = document.createElement('div');
    editor.className = 'hero-editor';
    editor.setAttribute('aria-hidden', 'true');

    var box = document.createElement('div');
    box.className = 'hero-editor-box';

    var handles = {};
    ['nw', 'ne', 'se', 'sw'].forEach(function (corner) {
      var handle = document.createElement('div');
      handle.className = 'hero-editor-handle hero-editor-handle-' + corner;
      handle.dataset.corner = corner;
      box.appendChild(handle);
      handles[corner] = handle;
    });

    editor.appendChild(box);
    mountEl.appendChild(editor);

    function selectEditor() {
      if (global.__heroEditorActive && global.__heroEditorActive !== api) {
        global.__heroEditorActive.deselect();
      }
      selected = true;
      editor.classList.add('is-active');
      global.__heroEditorActive = api;
    }

    function deselectEditor() {
      if (!selected) return;
      selected = false;
      editor.classList.remove('is-active');
      if (global.__heroEditorActive === api) global.__heroEditorActive = null;
    }

    function syncBox() {
      if (!img.naturalWidth) return;
      var t = getTransform();
      var b = boundsFromTransform(frameWidth, frameHeight, t, img);
      box.style.left = b.left + 'px';
      box.style.top = b.top + 'px';
      box.style.width = Math.max(1, b.width) + 'px';
      box.style.height = Math.max(1, b.height) + 'px';
    }

    function clientToPoster(clientX, clientY) {
      var rect = mountEl.getBoundingClientRect();
      return {
        x: (clientX - rect.left) / previewScale,
        y: (clientY - rect.top) / previewScale,
      };
    }

    function emitTransform(next, meta) {
      setTransform(next, meta || {});
      syncBox();
      if (onChange) onChange(next, meta || {});
    }

    var drag = null;

    function beginMoveDrag(e, clientX, clientY) {
      drag = {
        mode: 'move',
        start: normalizeTransform(getTransform()),
        startClientX: clientX,
        startClientY: clientY,
        independent: !!(e && e.shiftKey),
      };
      if (e && e.pointerId != null && e.target && e.target.setPointerCapture) {
        try { e.target.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      }
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerUp);
    }

    function onPointerMove(e) {
      if (!drag) return;
      e.preventDefault();

      if (drag.mode === 'move') {
        var deltaX = (e.clientX - drag.startClientX) / previewScale;
        var deltaY = (e.clientY - drag.startClientY) / previewScale;
        var originCx = frameWidth * drag.start.xPercent / 100;
        var originCy = frameHeight * drag.start.yPercent / 100;
        emitTransform({
          xPercent: clamp(((originCx + deltaX) / frameWidth) * 100, -50, 150),
          yPercent: clamp(((originCy + deltaY) / frameHeight) * 100, -50, 150),
          scale: drag.start.scale,
        }, { independent: drag.independent });
        return;
      }

      if (drag.mode === 'scale') {
        var p = clientToPoster(e.clientX, e.clientY);
        var anchor = drag.anchor;
        var dx = p.x - anchor.x;
        var dy = p.y - anchor.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var base = Math.max(drag.baseDist, 1);
        var nextScale = clampScale(drag.start.scale * (dist / base));
        emitTransform({
          xPercent: drag.start.xPercent,
          yPercent: drag.start.yPercent,
          scale: nextScale,
        }, { independent: drag.independent });
      }
    }

    function onPointerUp(e) {
      if (e && e.pointerId != null && e.target && e.target.releasePointerCapture) {
        try { e.target.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      }
      drag = null;
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
    }

    box.addEventListener('pointerdown', function (e) {
      if (!selected || e.target !== box) return;
      e.preventDefault();
      e.stopPropagation();
      beginMoveDrag(e, e.clientX, e.clientY);
    });

    Object.keys(handles).forEach(function (corner) {
      handles[corner].addEventListener('pointerdown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        handles[corner].setPointerCapture(e.pointerId);
        var t = getTransform();
        var b = boundsFromTransform(frameWidth, frameHeight, t, img);
        var anchorMap = {
          nw: { x: b.left + b.width, y: b.top + b.height },
          ne: { x: b.left, y: b.top + b.height },
          se: { x: b.left, y: b.top },
          sw: { x: b.left + b.width, y: b.top },
        };
        var anchor = anchorMap[corner];
        var p0 = clientToPoster(e.clientX, e.clientY);
        drag = {
          mode: 'scale',
          start: normalizeTransform(t),
          anchor: anchor,
          baseDist: Math.sqrt(Math.pow(p0.x - anchor.x, 2) + Math.pow(p0.y - anchor.y, 2)),
          independent: e.shiftKey,
        };
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);
      });
    });

    img.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      if (!selected) {
        selectEditor();
        return;
      }
      beginMoveDrag(e, e.clientX, e.clientY);
    });

    mountEl.addEventListener('wheel', function (e) {
      if (!selected) return;
      e.preventDefault();
      var t = getTransform();
      var current = clampScale(t.scale || 100);
      var step = Math.max(0.5, current * 0.04);
      var next = e.deltaY > 0 ? current - step : current + step;
      emitTransform({
        xPercent: t.xPercent,
        yPercent: t.yPercent,
        scale: clampScale(next),
      }, { independent: e.shiftKey });
    }, { passive: false });

    img.addEventListener('load', syncBox);
    syncBox();

    var api = {
      select: selectEditor,
      deselect: deselectEditor,
      isSelected: function () { return selected; },
      isEditingTarget: function (node) {
        return node === img || node === box || editor.contains(node);
      },
      syncBox: syncBox,
      destroy: function () {
        deselectEditor();
        editor.remove();
      },
    };
    return api;
  }

  global.HeroEditor = {
    MIN_SCALE: MIN_SCALE,
    MAX_SCALE: MAX_SCALE,
    clampScale: clampScale,
    applyHeroTransform: applyHeroTransform,
    boundsFromTransform: boundsFromTransform,
    offsetFromFigmaHero: offsetFromFigmaHero,
    centerInHeroArea: centerInHeroArea,
    computeCoverTransform: computeCoverTransform,
    applyHeroImageBottomFade: applyHeroImageBottomFade,
    resolveHeroTransform: resolveHeroTransform,
    attachHeroEditor: attachHeroEditor,
  };
})(window);
