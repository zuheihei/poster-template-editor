(function (global) {
  'use strict';

  var MIN_SCALE = 0.1;
  var MAX_SCALE = 10000;

  function clampScale(scale) {
    var n = Number(scale);
    if (!Number.isFinite(n) || n <= 0) return 100;
    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, n));
  }

  /** Shift 按住时锁定水平或垂直方向（取位移较大轴） */
  function constrainAxisDelta(deltaX, deltaY, shiftKey) {
    if (!shiftKey) return { dx: deltaX, dy: deltaY };
    if (Math.abs(deltaX) >= Math.abs(deltaY)) return { dx: deltaX, dy: 0 };
    return { dx: 0, dy: deltaY };
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
    var useDomBounds = !!options.useDomBounds;
    var getTransform = options.getTransform;
    var setTransform = options.setTransform;
    var onChange = options.onChange;
    var onInteractionStart = options.onInteractionStart;
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

    function boxMetricsFromDom() {
      var mountRect = mountEl.getBoundingClientRect();
      var imgRect = img.getBoundingClientRect();
      var left = (imgRect.left - mountRect.left) / previewScale;
      var top = (imgRect.top - mountRect.top) / previewScale;
      var width = imgRect.width / previewScale;
      var height = imgRect.height / previewScale;
      return { left: left, top: top, width: width, height: height };
    }

    function syncBox() {
      if (!img.naturalWidth) return;
      if (useDomBounds && img.complete) {
        var m = boxMetricsFromDom();
        box.style.left = m.left + 'px';
        box.style.top = m.top + 'px';
        box.style.width = Math.max(1, m.width) + 'px';
        box.style.height = Math.max(1, m.height) + 'px';
        return;
      }
      var t = getTransform();
      var b = boundsFromTransform(frameWidth, frameHeight, t, img);
      box.style.left = b.left + 'px';
      box.style.top = b.top + 'px';
      box.style.width = Math.max(1, b.width) + 'px';
      box.style.height = Math.max(1, b.height) + 'px';
    }

    function boxMetricsForAnchors() {
      if (useDomBounds && img.complete) return boxMetricsFromDom();
      var b = boundsFromTransform(frameWidth, frameHeight, getTransform(), img);
      return { left: b.left, top: b.top, width: b.width, height: b.height };
    }

    function selectEditor() {
      if (global.__heroEditorActive && global.__heroEditorActive !== api) {
        global.__heroEditorActive.deselect();
      }
      selected = true;
      editor.classList.add('is-active');
      global.__heroEditorActive = api;
      syncBox();
    }

    function deselectEditor() {
      if (!selected) return;
      selected = false;
      editor.classList.remove('is-active');
      if (global.__heroEditorActive === api) global.__heroEditorActive = null;
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
      if (useDomBounds) {
        requestAnimationFrame(syncBox);
      } else {
        syncBox();
      }
      if (onChange) onChange(next, meta || {});
    }

    var drag = null;

    function notifyInteractionStart() {
      if (onInteractionStart) onInteractionStart();
    }

    function beginMoveDrag(e, clientX, clientY) {
      notifyInteractionStart();
      drag = {
        mode: 'move',
        start: normalizeTransform(getTransform()),
        startClientX: clientX,
        startClientY: clientY,
        independent: !!(e && e.altKey),
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
        var axis = constrainAxisDelta(deltaX, deltaY, e.shiftKey);
        deltaX = axis.dx;
        deltaY = axis.dy;
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
        if (!selected) selectEditor();
        notifyInteractionStart();
        handles[corner].setPointerCapture(e.pointerId);
        var t = getTransform();
        var b = boxMetricsForAnchors();
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
          independent: e.altKey,
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

    var wheelUndoTimer = null;
    mountEl.addEventListener('wheel', function (e) {
      if (!selected) return;
      e.preventDefault();
      if (!wheelUndoTimer) {
        notifyInteractionStart();
        wheelUndoTimer = setTimeout(function () { wheelUndoTimer = null; }, 400);
      }
      var t = getTransform();
      var current = clampScale(t.scale || 100);
      var step = Math.max(0.5, current * 0.04);
      var next = e.deltaY > 0 ? current - step : current + step;
      emitTransform({
        xPercent: t.xPercent,
        yPercent: t.yPercent,
        scale: clampScale(next),
      }, { independent: e.altKey });
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

  function attachPositionEditor(mountEl, targetEl, options) {
    options = options || {};
    var previewScale = options.previewScale || 0.28;
    var getPosition = options.getPosition;
    var setPosition = options.setPosition;
    var onChange = options.onChange;
    var onInteractionStart = options.onInteractionStart;
    var enableTextEdit = !!options.enableTextEdit;
    var getText = options.getText;
    var setText = options.setText;
    var onTextEditStart = options.onTextEditStart;
    var selected = false;
    var editing = false;

    var editor = document.createElement('div');
    editor.className = 'hero-editor title-position-editor';
    editor.setAttribute('aria-hidden', 'true');

    var box = document.createElement('div');
    box.className = 'hero-editor-box title-position-box';
    ['nw', 'ne', 'se', 'sw'].forEach(function (corner) {
      var handle = document.createElement('div');
      handle.className = 'title-position-handle title-position-handle-' + corner;
      box.appendChild(handle);
    });
    editor.appendChild(box);
    mountEl.appendChild(editor);

    function formatEditableTitleHtml(text) {
      return String(text || '')
        .replace(/\\n/g, '<br>')
        .replace(/\r?\n/g, '<br>');
    }

    function readEditableTitleText(el) {
      return String(el.innerText || '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');
    }

    function selectEditor() {
      if (global.__titleEditorActive && global.__titleEditorActive !== api) {
        if (global.__titleEditorActive.finishEditing) global.__titleEditorActive.finishEditing(true);
        global.__titleEditorActive.deselect();
      }
      selected = true;
      editor.classList.add('is-active');
      targetEl.classList.add('title-is-selected');
      global.__titleEditorActive = api;
      syncBox();
    }

    function deselectEditor() {
      if (editing) finishEditing(true);
      if (!selected) return;
      selected = false;
      editor.classList.remove('is-active');
      targetEl.classList.remove('title-is-selected');
      if (global.__titleEditorActive === api) global.__titleEditorActive = null;
    }

    function enterEditMode() {
      if (!enableTextEdit || !getText || !setText || editing) return;
      if (onTextEditStart) onTextEditStart();
      editing = true;
      editor.classList.add('is-editing');
      targetEl.classList.add('title-is-editing');
      targetEl.setAttribute('contenteditable', 'true');
      targetEl.setAttribute('spellcheck', 'false');
      targetEl.focus();
    }

    function placeCaretAtEnd() {
      try {
        var range = document.createRange();
        range.selectNodeContents(targetEl);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (_) { /* ignore */ }
    }

    function beginEditFromPointer(e) {
      if (!enableTextEdit) return;
      enterEditMode();
      requestAnimationFrame(function () {
        if (!editing) return;
        targetEl.focus();
        if (typeof e === 'undefined') {
          placeCaretAtEnd();
          return;
        }
        if (document.caretRangeFromPoint) {
          var caret = document.caretRangeFromPoint(e.clientX, e.clientY);
          if (caret) {
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(caret);
            return;
          }
        }
        placeCaretAtEnd();
      });
    }

    function finishEditing(save) {
      if (!editing) return;
      editing = false;
      editor.classList.remove('is-editing');
      targetEl.classList.remove('title-is-editing');
      targetEl.removeAttribute('contenteditable');
      targetEl.removeAttribute('spellcheck');
      if (save && getText && setText) {
        var nextText = readEditableTitleText(targetEl);
        var prevText = getText();
        if (nextText !== prevText) {
          setText(nextText);
          return;
        }
        targetEl.innerHTML = formatEditableTitleHtml(prevText);
      } else if (getText) {
        targetEl.innerHTML = formatEditableTitleHtml(getText());
      }
      syncBox();
    }

    function syncBox() {
      if (!targetEl) return;
      var pos = getPosition();
      var rect = targetEl.getBoundingClientRect();
      var mountRect = mountEl.getBoundingClientRect();
      var w = rect.width / previewScale;
      var h = rect.height / previewScale;
      box.style.left = pos.left + 'px';
      box.style.top = pos.top + 'px';
      box.style.width = Math.max(1, w) + 'px';
      box.style.height = Math.max(1, h) + 'px';
    }

    var drag = null;

    function onPointerMove(e) {
      if (!drag) return;
      e.preventDefault();
      var deltaX = (e.clientX - drag.startClientX) / previewScale;
      var deltaY = (e.clientY - drag.startClientY) / previewScale;
      var axis = constrainAxisDelta(deltaX, deltaY, e.shiftKey);
      var next = {
        left: clamp(drag.start.left + axis.dx, -200, 2000),
        top: clamp(drag.start.top + axis.dy, -200, 3000),
      };
      setPosition(next);
      targetEl.style.left = next.left + 'px';
      targetEl.style.top = next.top + 'px';
      syncBox();
      if (onChange) onChange(next);
    }

    function onPointerUp() {
      drag = null;
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
    }

    function beginDrag(e) {
      if (onInteractionStart) onInteractionStart();
      drag = {
        start: getPosition(),
        startClientX: e.clientX,
        startClientY: e.clientY,
      };
      if (e.pointerId != null && e.target.setPointerCapture) {
        try { e.target.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      }
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerUp);
    }

    targetEl.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      if (editing) return;
      selectEditor();
    });

    targetEl.addEventListener('dblclick', function (e) {
      e.stopPropagation();
      if (!selected) selectEditor();
      if (!editing) beginEditFromPointer(e);
    });

    targetEl.addEventListener('blur', function () {
      window.setTimeout(function () {
        if (!editing) return;
        if (global.__titleEditorActive !== api) return;
        var activeEl = document.activeElement;
        if (activeEl && (activeEl === targetEl || editor.contains(activeEl))) return;
        finishEditing(true);
      }, 0);
    });

    targetEl.addEventListener('keydown', function (e) {
      if (!editing) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        finishEditing(false);
        targetEl.blur();
        return;
      }
      e.stopPropagation();
    });

    targetEl.addEventListener('paste', function (e) {
      if (!editing) return;
      e.preventDefault();
      var text = (e.clipboardData || window.clipboardData).getData('text/plain');
      if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, text);
      } else {
        targetEl.innerText = text;
      }
    });

    box.querySelectorAll('.title-position-handle').forEach(function (handle) {
      handle.addEventListener('pointerdown', function (e) {
        if (!selected || editing) return;
        e.preventDefault();
        e.stopPropagation();
        beginDrag(e);
      });
    });

    if (!global.__titleEditorDocBound) {
      global.__titleEditorDocBound = true;
      document.addEventListener('pointerdown', function (e) {
        var active = global.__titleEditorActive;
        if (!active || !active.isSelected()) return;
        if (active.isEditingTarget(e.target)) return;
        if (active.finishEditing) active.finishEditing(true);
        active.deselect();
      });
    }

    syncBox();

    var api = {
      select: selectEditor,
      deselect: deselectEditor,
      finishEditing: finishEditing,
      isSelected: function () { return selected; },
      isEditing: function () { return editing; },
      isEditingTarget: function (node) {
        if (editing && (node === targetEl || targetEl.contains(node))) return true;
        return node === box || editor.contains(node);
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
    attachPositionEditor: attachPositionEditor,
  };
})(window);
