(() => {
  function be(s) {
    return s !== null && typeof s == 'object' && 'constructor' in s && s.constructor === Object;
  }
  function re(s, e) {
    s === void 0 && (s = {}),
      e === void 0 && (e = {}),
      Object.keys(e).forEach((t) => {
        typeof s[t] > 'u'
          ? (s[t] = e[t])
          : be(e[t]) && be(s[t]) && Object.keys(e[t]).length > 0 && re(s[t], e[t]);
      });
  }
  var Se = {
    body: {},
    addEventListener() {},
    removeEventListener() {},
    activeElement: { blur() {}, nodeName: '' },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    getElementById() {
      return null;
    },
    createEvent() {
      return { initEvent() {} };
    },
    createElement() {
      return {
        children: [],
        childNodes: [],
        style: {},
        setAttribute() {},
        getElementsByTagName() {
          return [];
        },
      };
    },
    createElementNS() {
      return {};
    },
    importNode() {
      return null;
    },
    location: {
      hash: '',
      host: '',
      hostname: '',
      href: '',
      origin: '',
      pathname: '',
      protocol: '',
      search: '',
    },
  };
  function O() {
    let s = typeof document < 'u' ? document : {};
    return re(s, Se), s;
  }
  var Xe = {
    document: Se,
    navigator: { userAgent: '' },
    location: {
      hash: '',
      host: '',
      hostname: '',
      href: '',
      origin: '',
      pathname: '',
      protocol: '',
      search: '',
    },
    history: { replaceState() {}, pushState() {}, go() {}, back() {} },
    CustomEvent: function () {
      return this;
    },
    addEventListener() {},
    removeEventListener() {},
    getComputedStyle() {
      return {
        getPropertyValue() {
          return '';
        },
      };
    },
    Image() {},
    Date() {},
    screen: {},
    setTimeout() {},
    clearTimeout() {},
    matchMedia() {
      return {};
    },
    requestAnimationFrame(s) {
      return typeof setTimeout > 'u' ? (s(), null) : setTimeout(s, 0);
    },
    cancelAnimationFrame(s) {
      typeof setTimeout > 'u' || clearTimeout(s);
    },
  };
  function A() {
    let s = typeof window < 'u' ? window : {};
    return re(s, Xe), s;
  }
  function xe(s) {
    return (
      s === void 0 && (s = ''),
      s
        .trim()
        .split(' ')
        .filter((e) => !!e.trim())
    );
  }
  function Ee(s) {
    let e = s;
    Object.keys(e).forEach((t) => {
      try {
        e[t] = null;
      } catch {}
      try {
        delete e[t];
      } catch {}
    });
  }
  function X(s, e) {
    return e === void 0 && (e = 0), setTimeout(s, e);
  }
  function H() {
    return Date.now();
  }
  function Ve(s) {
    let e = A(),
      t;
    return (
      e.getComputedStyle && (t = e.getComputedStyle(s, null)),
      !t && s.currentStyle && (t = s.currentStyle),
      t || (t = s.style),
      t
    );
  }
  function ae(s, e) {
    e === void 0 && (e = 'x');
    let t = A(),
      i,
      a,
      r,
      o = Ve(s);
    return (
      t.WebKitCSSMatrix
        ? ((a = o.transform || o.webkitTransform),
          a.split(',').length > 6 &&
            (a = a
              .split(', ')
              .map((l) => l.replace(',', '.'))
              .join(', ')),
          (r = new t.WebKitCSSMatrix(a === 'none' ? '' : a)))
        : ((r =
            o.MozTransform ||
            o.OTransform ||
            o.MsTransform ||
            o.msTransform ||
            o.transform ||
            o.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,')),
          (i = r.toString().split(','))),
      e === 'x' &&
        (t.WebKitCSSMatrix
          ? (a = r.m41)
          : i.length === 16
            ? (a = parseFloat(i[12]))
            : (a = parseFloat(i[4]))),
      e === 'y' &&
        (t.WebKitCSSMatrix
          ? (a = r.m42)
          : i.length === 16
            ? (a = parseFloat(i[13]))
            : (a = parseFloat(i[5]))),
      a || 0
    );
  }
  function U(s) {
    return (
      typeof s == 'object' &&
      s !== null &&
      s.constructor &&
      Object.prototype.toString.call(s).slice(8, -1) === 'Object'
    );
  }
  function Ne(s) {
    return typeof window < 'u' && typeof window.HTMLElement < 'u'
      ? s instanceof HTMLElement
      : s && (s.nodeType === 1 || s.nodeType === 11);
  }
  function G() {
    let s = Object(arguments.length <= 0 ? void 0 : arguments[0]),
      e = ['__proto__', 'constructor', 'prototype'];
    for (let t = 1; t < arguments.length; t += 1) {
      let i = t < 0 || arguments.length <= t ? void 0 : arguments[t];
      if (i != null && !Ne(i)) {
        let a = Object.keys(Object(i)).filter((r) => e.indexOf(r) < 0);
        for (let r = 0, o = a.length; r < o; r += 1) {
          let l = a[r],
            n = Object.getOwnPropertyDescriptor(i, l);
          n !== void 0 &&
            n.enumerable &&
            (U(s[l]) && U(i[l])
              ? i[l].__swiper__
                ? (s[l] = i[l])
                : G(s[l], i[l])
              : !U(s[l]) && U(i[l])
                ? ((s[l] = {}), i[l].__swiper__ ? (s[l] = i[l]) : G(s[l], i[l]))
                : (s[l] = i[l]));
        }
      }
    }
    return s;
  }
  function W(s, e, t) {
    s.style.setProperty(e, t);
  }
  function ne(s) {
    let { swiper: e, targetPosition: t, side: i } = s,
      a = A(),
      r = -e.translate,
      o = null,
      l,
      n = e.params.speed;
    (e.wrapperEl.style.scrollSnapType = 'none'), a.cancelAnimationFrame(e.cssModeFrameID);
    let d = t > r ? 'next' : 'prev',
      c = (u, p) => (d === 'next' && u >= p) || (d === 'prev' && u <= p),
      f = () => {
        (l = new Date().getTime()), o === null && (o = l);
        let u = Math.max(Math.min((l - o) / n, 1), 0),
          p = 0.5 - Math.cos(u * Math.PI) / 2,
          h = r + p * (t - r);
        if ((c(h, t) && (h = t), e.wrapperEl.scrollTo({ [i]: h }), c(h, t))) {
          (e.wrapperEl.style.overflow = 'hidden'),
            (e.wrapperEl.style.scrollSnapType = ''),
            setTimeout(() => {
              (e.wrapperEl.style.overflow = ''), e.wrapperEl.scrollTo({ [i]: h });
            }),
            a.cancelAnimationFrame(e.cssModeFrameID);
          return;
        }
        e.cssModeFrameID = a.requestAnimationFrame(f);
      };
    f();
  }
  function k(s, e) {
    return e === void 0 && (e = ''), [...s.children].filter((t) => t.matches(e));
  }
  function K(s) {
    try {
      console.warn(s);
      return;
    } catch {}
  }
  function R(s, e) {
    e === void 0 && (e = []);
    let t = document.createElement(s);
    return t.classList.add(...(Array.isArray(e) ? e : xe(e))), t;
  }
  function J(s) {
    let e = A(),
      t = O(),
      i = s.getBoundingClientRect(),
      a = t.body,
      r = s.clientTop || a.clientTop || 0,
      o = s.clientLeft || a.clientLeft || 0,
      l = s === e ? e.scrollY : s.scrollTop,
      n = s === e ? e.scrollX : s.scrollLeft;
    return { top: i.top + l - r, left: i.left + n - o };
  }
  function Te(s, e) {
    let t = [];
    for (; s.previousElementSibling; ) {
      let i = s.previousElementSibling;
      e ? i.matches(e) && t.push(i) : t.push(i), (s = i);
    }
    return t;
  }
  function Me(s, e) {
    let t = [];
    for (; s.nextElementSibling; ) {
      let i = s.nextElementSibling;
      e ? i.matches(e) && t.push(i) : t.push(i), (s = i);
    }
    return t;
  }
  function V(s, e) {
    return A().getComputedStyle(s, null).getPropertyValue(e);
  }
  function Z(s) {
    let e = s,
      t;
    if (e) {
      for (t = 0; (e = e.previousSibling) !== null; ) e.nodeType === 1 && (t += 1);
      return t;
    }
  }
  function Y(s, e) {
    let t = [],
      i = s.parentElement;
    for (; i; ) e ? i.matches(e) && t.push(i) : t.push(i), (i = i.parentElement);
    return t;
  }
  function ee(s, e, t) {
    let i = A();
    return t
      ? s[e === 'width' ? 'offsetWidth' : 'offsetHeight'] +
          parseFloat(
            i
              .getComputedStyle(s, null)
              .getPropertyValue(e === 'width' ? 'margin-right' : 'margin-top')
          ) +
          parseFloat(
            i
              .getComputedStyle(s, null)
              .getPropertyValue(e === 'width' ? 'margin-left' : 'margin-bottom')
          )
      : s.offsetWidth;
  }
  var le;
  function Ye() {
    let s = A(),
      e = O();
    return {
      smoothScroll:
        e.documentElement && e.documentElement.style && 'scrollBehavior' in e.documentElement.style,
      touch: !!('ontouchstart' in s || (s.DocumentTouch && e instanceof s.DocumentTouch)),
    };
  }
  function ze() {
    return le || (le = Ye()), le;
  }
  var oe;
  function Fe(s) {
    let { userAgent: e } = s === void 0 ? {} : s,
      t = ze(),
      i = A(),
      a = i.navigator.platform,
      r = e || i.navigator.userAgent,
      o = { ios: !1, android: !1 },
      l = i.screen.width,
      n = i.screen.height,
      d = r.match(/(Android);?[\s\/]+([\d.]+)?/),
      c = r.match(/(iPad).*OS\s([\d_]+)/),
      f = r.match(/(iPod)(.*OS\s([\d_]+))?/),
      u = !c && r.match(/(iPhone\sOS|iOS)\s([\d_]+)/),
      p = a === 'Win32',
      h = a === 'MacIntel',
      v = [
        '1024x1366',
        '1366x1024',
        '834x1194',
        '1194x834',
        '834x1112',
        '1112x834',
        '768x1024',
        '1024x768',
        '820x1180',
        '1180x820',
        '810x1080',
        '1080x810',
      ];
    return (
      !c &&
        h &&
        t.touch &&
        v.indexOf(`${l}x${n}`) >= 0 &&
        ((c = r.match(/(Version)\/([\d.]+)/)), c || (c = [0, 1, '13_0_0']), (h = !1)),
      d && !p && ((o.os = 'android'), (o.android = !0)),
      (c || u || f) && ((o.os = 'ios'), (o.ios = !0)),
      o
    );
  }
  function De(s) {
    return s === void 0 && (s = {}), oe || (oe = Fe(s)), oe;
  }
  var de;
  function We() {
    let s = A(),
      e = De(),
      t = !1;
    function i() {
      let l = s.navigator.userAgent.toLowerCase();
      return l.indexOf('safari') >= 0 && l.indexOf('chrome') < 0 && l.indexOf('android') < 0;
    }
    if (i()) {
      let l = String(s.navigator.userAgent);
      if (l.includes('Version/')) {
        let [n, d] = l
          .split('Version/')[1]
          .split(' ')[0]
          .split('.')
          .map((c) => Number(c));
        t = n < 16 || (n === 16 && d < 2);
      }
    }
    let a = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(s.navigator.userAgent),
      r = i(),
      o = r || (a && e.ios);
    return { isSafari: t || r, needPerspectiveFix: t, need3dFix: o, isWebView: a };
  }
  function _e() {
    return de || (de = We()), de;
  }
  function qe(s) {
    let { swiper: e, on: t, emit: i } = s,
      a = A(),
      r = null,
      o = null,
      l = () => {
        !e || e.destroyed || !e.initialized || (i('beforeResize'), i('resize'));
      },
      n = () => {
        !e ||
          e.destroyed ||
          !e.initialized ||
          ((r = new ResizeObserver((f) => {
            o = a.requestAnimationFrame(() => {
              let { width: u, height: p } = e,
                h = u,
                v = p;
              f.forEach((E) => {
                let { contentBoxSize: y, contentRect: T, target: m } = E;
                (m && m !== e.el) ||
                  ((h = T ? T.width : (y[0] || y).inlineSize),
                  (v = T ? T.height : (y[0] || y).blockSize));
              }),
                (h !== u || v !== p) && l();
            });
          })),
          r.observe(e.el));
      },
      d = () => {
        o && a.cancelAnimationFrame(o), r && r.unobserve && e.el && (r.unobserve(e.el), (r = null));
      },
      c = () => {
        !e || e.destroyed || !e.initialized || i('orientationchange');
      };
    t('init', () => {
      if (e.params.resizeObserver && typeof a.ResizeObserver < 'u') {
        n();
        return;
      }
      a.addEventListener('resize', l), a.addEventListener('orientationchange', c);
    }),
      t('destroy', () => {
        d(), a.removeEventListener('resize', l), a.removeEventListener('orientationchange', c);
      });
  }
  function je(s) {
    let { swiper: e, extendParams: t, on: i, emit: a } = s,
      r = [],
      o = A(),
      l = function (c, f) {
        f === void 0 && (f = {});
        let u = o.MutationObserver || o.WebkitMutationObserver,
          p = new u((h) => {
            if (e.__preventObserver__) return;
            if (h.length === 1) {
              a('observerUpdate', h[0]);
              return;
            }
            let v = function () {
              a('observerUpdate', h[0]);
            };
            o.requestAnimationFrame ? o.requestAnimationFrame(v) : o.setTimeout(v, 0);
          });
        p.observe(c, {
          attributes: typeof f.attributes > 'u' ? !0 : f.attributes,
          childList: typeof f.childList > 'u' ? !0 : f.childList,
          characterData: typeof f.characterData > 'u' ? !0 : f.characterData,
        }),
          r.push(p);
      },
      n = () => {
        if (e.params.observer) {
          if (e.params.observeParents) {
            let c = Y(e.hostEl);
            for (let f = 0; f < c.length; f += 1) l(c[f]);
          }
          l(e.hostEl, { childList: e.params.observeSlideChildren }),
            l(e.wrapperEl, { attributes: !1 });
        }
      },
      d = () => {
        r.forEach((c) => {
          c.disconnect();
        }),
          r.splice(0, r.length);
      };
    t({ observer: !1, observeParents: !1, observeSlideChildren: !1 }),
      i('init', n),
      i('destroy', d);
  }
  var Ue = {
    on(s, e, t) {
      let i = this;
      if (!i.eventsListeners || i.destroyed || typeof e != 'function') return i;
      let a = t ? 'unshift' : 'push';
      return (
        s.split(' ').forEach((r) => {
          i.eventsListeners[r] || (i.eventsListeners[r] = []), i.eventsListeners[r][a](e);
        }),
        i
      );
    },
    once(s, e, t) {
      let i = this;
      if (!i.eventsListeners || i.destroyed || typeof e != 'function') return i;
      function a() {
        i.off(s, a), a.__emitterProxy && delete a.__emitterProxy;
        for (var r = arguments.length, o = new Array(r), l = 0; l < r; l++) o[l] = arguments[l];
        e.apply(i, o);
      }
      return (a.__emitterProxy = e), i.on(s, a, t);
    },
    onAny(s, e) {
      let t = this;
      if (!t.eventsListeners || t.destroyed || typeof s != 'function') return t;
      let i = e ? 'unshift' : 'push';
      return t.eventsAnyListeners.indexOf(s) < 0 && t.eventsAnyListeners[i](s), t;
    },
    offAny(s) {
      let e = this;
      if (!e.eventsListeners || e.destroyed || !e.eventsAnyListeners) return e;
      let t = e.eventsAnyListeners.indexOf(s);
      return t >= 0 && e.eventsAnyListeners.splice(t, 1), e;
    },
    off(s, e) {
      let t = this;
      return (
        !t.eventsListeners ||
          t.destroyed ||
          !t.eventsListeners ||
          s.split(' ').forEach((i) => {
            typeof e > 'u'
              ? (t.eventsListeners[i] = [])
              : t.eventsListeners[i] &&
                t.eventsListeners[i].forEach((a, r) => {
                  (a === e || (a.__emitterProxy && a.__emitterProxy === e)) &&
                    t.eventsListeners[i].splice(r, 1);
                });
          }),
        t
      );
    },
    emit() {
      let s = this;
      if (!s.eventsListeners || s.destroyed || !s.eventsListeners) return s;
      let e, t, i;
      for (var a = arguments.length, r = new Array(a), o = 0; o < a; o++) r[o] = arguments[o];
      return (
        typeof r[0] == 'string' || Array.isArray(r[0])
          ? ((e = r[0]), (t = r.slice(1, r.length)), (i = s))
          : ((e = r[0].events), (t = r[0].data), (i = r[0].context || s)),
        t.unshift(i),
        (Array.isArray(e) ? e : e.split(' ')).forEach((n) => {
          s.eventsAnyListeners &&
            s.eventsAnyListeners.length &&
            s.eventsAnyListeners.forEach((d) => {
              d.apply(i, [n, ...t]);
            }),
            s.eventsListeners &&
              s.eventsListeners[n] &&
              s.eventsListeners[n].forEach((d) => {
                d.apply(i, t);
              });
        }),
        s
      );
    },
  };
  function Ke() {
    let s = this,
      e,
      t,
      i = s.el;
    typeof s.params.width < 'u' && s.params.width !== null
      ? (e = s.params.width)
      : (e = i.clientWidth),
      typeof s.params.height < 'u' && s.params.height !== null
        ? (t = s.params.height)
        : (t = i.clientHeight),
      !((e === 0 && s.isHorizontal()) || (t === 0 && s.isVertical())) &&
        ((e =
          e - parseInt(V(i, 'padding-left') || 0, 10) - parseInt(V(i, 'padding-right') || 0, 10)),
        (t =
          t - parseInt(V(i, 'padding-top') || 0, 10) - parseInt(V(i, 'padding-bottom') || 0, 10)),
        Number.isNaN(e) && (e = 0),
        Number.isNaN(t) && (t = 0),
        Object.assign(s, { width: e, height: t, size: s.isHorizontal() ? e : t }));
  }
  function Ze() {
    let s = this;
    function e(w, S) {
      return parseFloat(w.getPropertyValue(s.getDirectionLabel(S)) || 0);
    }
    let t = s.params,
      { wrapperEl: i, slidesEl: a, size: r, rtlTranslate: o, wrongRTL: l } = s,
      n = s.virtual && t.virtual.enabled,
      d = n ? s.virtual.slides.length : s.slides.length,
      c = k(a, `.${s.params.slideClass}, swiper-slide`),
      f = n ? s.virtual.slides.length : c.length,
      u = [],
      p = [],
      h = [],
      v = t.slidesOffsetBefore;
    typeof v == 'function' && (v = t.slidesOffsetBefore.call(s));
    let E = t.slidesOffsetAfter;
    typeof E == 'function' && (E = t.slidesOffsetAfter.call(s));
    let y = s.snapGrid.length,
      T = s.slidesGrid.length,
      m = t.spaceBetween,
      g = -v,
      x = 0,
      C = 0;
    if (typeof r > 'u') return;
    typeof m == 'string' && m.indexOf('%') >= 0
      ? (m = (parseFloat(m.replace('%', '')) / 100) * r)
      : typeof m == 'string' && (m = parseFloat(m)),
      (s.virtualSize = -m),
      c.forEach((w) => {
        o ? (w.style.marginLeft = '') : (w.style.marginRight = ''),
          (w.style.marginBottom = ''),
          (w.style.marginTop = '');
      }),
      t.centeredSlides &&
        t.cssMode &&
        (W(i, '--swiper-centered-offset-before', ''), W(i, '--swiper-centered-offset-after', ''));
    let D = t.grid && t.grid.rows > 1 && s.grid;
    D ? s.grid.initSlides(c) : s.grid && s.grid.unsetSlides();
    let L,
      I =
        t.slidesPerView === 'auto' &&
        t.breakpoints &&
        Object.keys(t.breakpoints).filter((w) => typeof t.breakpoints[w].slidesPerView < 'u')
          .length > 0;
    for (let w = 0; w < f; w += 1) {
      L = 0;
      let S;
      if (
        (c[w] && (S = c[w]),
        D && s.grid.updateSlide(w, S, c),
        !(c[w] && V(S, 'display') === 'none'))
      ) {
        if (t.slidesPerView === 'auto') {
          I && (c[w].style[s.getDirectionLabel('width')] = '');
          let M = getComputedStyle(S),
            b = S.style.transform,
            P = S.style.webkitTransform;
          if (
            (b && (S.style.transform = 'none'),
            P && (S.style.webkitTransform = 'none'),
            t.roundLengths)
          )
            L = s.isHorizontal() ? ee(S, 'width', !0) : ee(S, 'height', !0);
          else {
            let z = e(M, 'width'),
              B = e(M, 'padding-left'),
              ie = e(M, 'padding-right'),
              F = e(M, 'margin-left'),
              q = e(M, 'margin-right'),
              j = M.getPropertyValue('box-sizing');
            if (j && j === 'border-box') L = z + F + q;
            else {
              let { clientWidth: Be, offsetWidth: Re } = S;
              L = z + B + ie + F + q + (Re - Be);
            }
          }
          b && (S.style.transform = b),
            P && (S.style.webkitTransform = P),
            t.roundLengths && (L = Math.floor(L));
        } else
          (L = (r - (t.slidesPerView - 1) * m) / t.slidesPerView),
            t.roundLengths && (L = Math.floor(L)),
            c[w] && (c[w].style[s.getDirectionLabel('width')] = `${L}px`);
        c[w] && (c[w].swiperSlideSize = L),
          h.push(L),
          t.centeredSlides
            ? ((g = g + L / 2 + x / 2 + m),
              x === 0 && w !== 0 && (g = g - r / 2 - m),
              w === 0 && (g = g - r / 2 - m),
              Math.abs(g) < 1 / 1e3 && (g = 0),
              t.roundLengths && (g = Math.floor(g)),
              C % t.slidesPerGroup === 0 && u.push(g),
              p.push(g))
            : (t.roundLengths && (g = Math.floor(g)),
              (C - Math.min(s.params.slidesPerGroupSkip, C)) % s.params.slidesPerGroup === 0 &&
                u.push(g),
              p.push(g),
              (g = g + L + m)),
          (s.virtualSize += L + m),
          (x = L),
          (C += 1);
      }
    }
    if (
      ((s.virtualSize = Math.max(s.virtualSize, r) + E),
      o &&
        l &&
        (t.effect === 'slide' || t.effect === 'coverflow') &&
        (i.style.width = `${s.virtualSize + m}px`),
      t.setWrapperSize && (i.style[s.getDirectionLabel('width')] = `${s.virtualSize + m}px`),
      D && s.grid.updateWrapperSize(L, u),
      !t.centeredSlides)
    ) {
      let w = [];
      for (let S = 0; S < u.length; S += 1) {
        let M = u[S];
        t.roundLengths && (M = Math.floor(M)), u[S] <= s.virtualSize - r && w.push(M);
      }
      (u = w),
        Math.floor(s.virtualSize - r) - Math.floor(u[u.length - 1]) > 1 &&
          u.push(s.virtualSize - r);
    }
    if (n && t.loop) {
      let w = h[0] + m;
      if (t.slidesPerGroup > 1) {
        let S = Math.ceil((s.virtual.slidesBefore + s.virtual.slidesAfter) / t.slidesPerGroup),
          M = w * t.slidesPerGroup;
        for (let b = 0; b < S; b += 1) u.push(u[u.length - 1] + M);
      }
      for (let S = 0; S < s.virtual.slidesBefore + s.virtual.slidesAfter; S += 1)
        t.slidesPerGroup === 1 && u.push(u[u.length - 1] + w),
          p.push(p[p.length - 1] + w),
          (s.virtualSize += w);
    }
    if ((u.length === 0 && (u = [0]), m !== 0)) {
      let w = s.isHorizontal() && o ? 'marginLeft' : s.getDirectionLabel('marginRight');
      c.filter((S, M) => (!t.cssMode || t.loop ? !0 : M !== c.length - 1)).forEach((S) => {
        S.style[w] = `${m}px`;
      });
    }
    if (t.centeredSlides && t.centeredSlidesBounds) {
      let w = 0;
      h.forEach((M) => {
        w += M + (m || 0);
      }),
        (w -= m);
      let S = w - r;
      u = u.map((M) => (M <= 0 ? -v : M > S ? S + E : M));
    }
    if (t.centerInsufficientSlides) {
      let w = 0;
      h.forEach((M) => {
        w += M + (m || 0);
      }),
        (w -= m);
      let S = (t.slidesOffsetBefore || 0) + (t.slidesOffsetAfter || 0);
      if (w + S < r) {
        let M = (r - w - S) / 2;
        u.forEach((b, P) => {
          u[P] = b - M;
        }),
          p.forEach((b, P) => {
            p[P] = b + M;
          });
      }
    }
    if (
      (Object.assign(s, { slides: c, snapGrid: u, slidesGrid: p, slidesSizesGrid: h }),
      t.centeredSlides && t.cssMode && !t.centeredSlidesBounds)
    ) {
      W(i, '--swiper-centered-offset-before', `${-u[0]}px`),
        W(i, '--swiper-centered-offset-after', `${s.size / 2 - h[h.length - 1] / 2}px`);
      let w = -s.snapGrid[0],
        S = -s.slidesGrid[0];
      (s.snapGrid = s.snapGrid.map((M) => M + w)), (s.slidesGrid = s.slidesGrid.map((M) => M + S));
    }
    if (
      (f !== d && s.emit('slidesLengthChange'),
      u.length !== y &&
        (s.params.watchOverflow && s.checkOverflow(), s.emit('snapGridLengthChange')),
      p.length !== T && s.emit('slidesGridLengthChange'),
      t.watchSlidesProgress && s.updateSlidesOffset(),
      s.emit('slidesUpdated'),
      !n && !t.cssMode && (t.effect === 'slide' || t.effect === 'fade'))
    ) {
      let w = `${t.containerModifierClass}backface-hidden`,
        S = s.el.classList.contains(w);
      f <= t.maxBackfaceHiddenSlides ? S || s.el.classList.add(w) : S && s.el.classList.remove(w);
    }
  }
  function Qe(s) {
    let e = this,
      t = [],
      i = e.virtual && e.params.virtual.enabled,
      a = 0,
      r;
    typeof s == 'number' ? e.setTransition(s) : s === !0 && e.setTransition(e.params.speed);
    let o = (l) => (i ? e.slides[e.getSlideIndexByData(l)] : e.slides[l]);
    if (e.params.slidesPerView !== 'auto' && e.params.slidesPerView > 1)
      if (e.params.centeredSlides)
        (e.visibleSlides || []).forEach((l) => {
          t.push(l);
        });
      else
        for (r = 0; r < Math.ceil(e.params.slidesPerView); r += 1) {
          let l = e.activeIndex + r;
          if (l > e.slides.length && !i) break;
          t.push(o(l));
        }
    else t.push(o(e.activeIndex));
    for (r = 0; r < t.length; r += 1)
      if (typeof t[r] < 'u') {
        let l = t[r].offsetHeight;
        a = l > a ? l : a;
      }
    (a || a === 0) && (e.wrapperEl.style.height = `${a}px`);
  }
  function Je() {
    let s = this,
      e = s.slides,
      t = s.isElement ? (s.isHorizontal() ? s.wrapperEl.offsetLeft : s.wrapperEl.offsetTop) : 0;
    for (let i = 0; i < e.length; i += 1)
      e[i].swiperSlideOffset =
        (s.isHorizontal() ? e[i].offsetLeft : e[i].offsetTop) - t - s.cssOverflowAdjustment();
  }
  var Ce = (s, e, t) => {
    e && !s.classList.contains(t)
      ? s.classList.add(t)
      : !e && s.classList.contains(t) && s.classList.remove(t);
  };
  function et(s) {
    s === void 0 && (s = (this && this.translate) || 0);
    let e = this,
      t = e.params,
      { slides: i, rtlTranslate: a, snapGrid: r } = e;
    if (i.length === 0) return;
    typeof i[0].swiperSlideOffset > 'u' && e.updateSlidesOffset();
    let o = -s;
    a && (o = s), (e.visibleSlidesIndexes = []), (e.visibleSlides = []);
    let l = t.spaceBetween;
    typeof l == 'string' && l.indexOf('%') >= 0
      ? (l = (parseFloat(l.replace('%', '')) / 100) * e.size)
      : typeof l == 'string' && (l = parseFloat(l));
    for (let n = 0; n < i.length; n += 1) {
      let d = i[n],
        c = d.swiperSlideOffset;
      t.cssMode && t.centeredSlides && (c -= i[0].swiperSlideOffset);
      let f = (o + (t.centeredSlides ? e.minTranslate() : 0) - c) / (d.swiperSlideSize + l),
        u = (o - r[0] + (t.centeredSlides ? e.minTranslate() : 0) - c) / (d.swiperSlideSize + l),
        p = -(o - c),
        h = p + e.slidesSizesGrid[n],
        v = p >= 0 && p <= e.size - e.slidesSizesGrid[n],
        E = (p >= 0 && p < e.size - 1) || (h > 1 && h <= e.size) || (p <= 0 && h >= e.size);
      E && (e.visibleSlides.push(d), e.visibleSlidesIndexes.push(n)),
        Ce(d, E, t.slideVisibleClass),
        Ce(d, v, t.slideFullyVisibleClass),
        (d.progress = a ? -f : f),
        (d.originalProgress = a ? -u : u);
    }
  }
  function tt(s) {
    let e = this;
    if (typeof s > 'u') {
      let c = e.rtlTranslate ? -1 : 1;
      s = (e && e.translate && e.translate * c) || 0;
    }
    let t = e.params,
      i = e.maxTranslate() - e.minTranslate(),
      { progress: a, isBeginning: r, isEnd: o, progressLoop: l } = e,
      n = r,
      d = o;
    if (i === 0) (a = 0), (r = !0), (o = !0);
    else {
      a = (s - e.minTranslate()) / i;
      let c = Math.abs(s - e.minTranslate()) < 1,
        f = Math.abs(s - e.maxTranslate()) < 1;
      (r = c || a <= 0), (o = f || a >= 1), c && (a = 0), f && (a = 1);
    }
    if (t.loop) {
      let c = e.getSlideIndexByData(0),
        f = e.getSlideIndexByData(e.slides.length - 1),
        u = e.slidesGrid[c],
        p = e.slidesGrid[f],
        h = e.slidesGrid[e.slidesGrid.length - 1],
        v = Math.abs(s);
      v >= u ? (l = (v - u) / h) : (l = (v + h - p) / h), l > 1 && (l -= 1);
    }
    Object.assign(e, { progress: a, progressLoop: l, isBeginning: r, isEnd: o }),
      (t.watchSlidesProgress || (t.centeredSlides && t.autoHeight)) && e.updateSlidesProgress(s),
      r && !n && e.emit('reachBeginning toEdge'),
      o && !d && e.emit('reachEnd toEdge'),
      ((n && !r) || (d && !o)) && e.emit('fromEdge'),
      e.emit('progress', a);
  }
  var ce = (s, e, t) => {
    e && !s.classList.contains(t)
      ? s.classList.add(t)
      : !e && s.classList.contains(t) && s.classList.remove(t);
  };
  function st() {
    let s = this,
      { slides: e, params: t, slidesEl: i, activeIndex: a } = s,
      r = s.virtual && t.virtual.enabled,
      o = s.grid && t.grid && t.grid.rows > 1,
      l = (f) => k(i, `.${t.slideClass}${f}, swiper-slide${f}`)[0],
      n,
      d,
      c;
    if (r)
      if (t.loop) {
        let f = a - s.virtual.slidesBefore;
        f < 0 && (f = s.virtual.slides.length + f),
          f >= s.virtual.slides.length && (f -= s.virtual.slides.length),
          (n = l(`[data-swiper-slide-index="${f}"]`));
      } else n = l(`[data-swiper-slide-index="${a}"]`);
    else
      o
        ? ((n = e.filter((f) => f.column === a)[0]),
          (c = e.filter((f) => f.column === a + 1)[0]),
          (d = e.filter((f) => f.column === a - 1)[0]))
        : (n = e[a]);
    n &&
      (o ||
        ((c = Me(n, `.${t.slideClass}, swiper-slide`)[0]),
        t.loop && !c && (c = e[0]),
        (d = Te(n, `.${t.slideClass}, swiper-slide`)[0]),
        t.loop && !d === 0 && (d = e[e.length - 1]))),
      e.forEach((f) => {
        ce(f, f === n, t.slideActiveClass),
          ce(f, f === c, t.slideNextClass),
          ce(f, f === d, t.slidePrevClass);
      }),
      s.emitSlidesClasses();
  }
  var te = (s, e) => {
      if (!s || s.destroyed || !s.params) return;
      let t = () => (s.isElement ? 'swiper-slide' : `.${s.params.slideClass}`),
        i = e.closest(t());
      if (i) {
        let a = i.querySelector(`.${s.params.lazyPreloaderClass}`);
        !a &&
          s.isElement &&
          (i.shadowRoot
            ? (a = i.shadowRoot.querySelector(`.${s.params.lazyPreloaderClass}`))
            : requestAnimationFrame(() => {
                i.shadowRoot &&
                  ((a = i.shadowRoot.querySelector(`.${s.params.lazyPreloaderClass}`)),
                  a && a.remove());
              })),
          a && a.remove();
      }
    },
    fe = (s, e) => {
      if (!s.slides[e]) return;
      let t = s.slides[e].querySelector('[loading="lazy"]');
      t && t.removeAttribute('loading');
    },
    me = (s) => {
      if (!s || s.destroyed || !s.params) return;
      let e = s.params.lazyPreloadPrevNext,
        t = s.slides.length;
      if (!t || !e || e < 0) return;
      e = Math.min(e, t);
      let i =
          s.params.slidesPerView === 'auto'
            ? s.slidesPerViewDynamic()
            : Math.ceil(s.params.slidesPerView),
        a = s.activeIndex;
      if (s.params.grid && s.params.grid.rows > 1) {
        let o = a,
          l = [o - e];
        l.push(...Array.from({ length: e }).map((n, d) => o + i + d)),
          s.slides.forEach((n, d) => {
            l.includes(n.column) && fe(s, d);
          });
        return;
      }
      let r = a + i - 1;
      if (s.params.rewind || s.params.loop)
        for (let o = a - e; o <= r + e; o += 1) {
          let l = ((o % t) + t) % t;
          (l < a || l > r) && fe(s, l);
        }
      else
        for (let o = Math.max(a - e, 0); o <= Math.min(r + e, t - 1); o += 1)
          o !== a && (o > r || o < a) && fe(s, o);
    };
  function it(s) {
    let { slidesGrid: e, params: t } = s,
      i = s.rtlTranslate ? s.translate : -s.translate,
      a;
    for (let r = 0; r < e.length; r += 1)
      typeof e[r + 1] < 'u'
        ? i >= e[r] && i < e[r + 1] - (e[r + 1] - e[r]) / 2
          ? (a = r)
          : i >= e[r] && i < e[r + 1] && (a = r + 1)
        : i >= e[r] && (a = r);
    return t.normalizeSlideIndex && (a < 0 || typeof a > 'u') && (a = 0), a;
  }
  function rt(s) {
    let e = this,
      t = e.rtlTranslate ? e.translate : -e.translate,
      { snapGrid: i, params: a, activeIndex: r, realIndex: o, snapIndex: l } = e,
      n = s,
      d,
      c = (p) => {
        let h = p - e.virtual.slidesBefore;
        return (
          h < 0 && (h = e.virtual.slides.length + h),
          h >= e.virtual.slides.length && (h -= e.virtual.slides.length),
          h
        );
      };
    if ((typeof n > 'u' && (n = it(e)), i.indexOf(t) >= 0)) d = i.indexOf(t);
    else {
      let p = Math.min(a.slidesPerGroupSkip, n);
      d = p + Math.floor((n - p) / a.slidesPerGroup);
    }
    if ((d >= i.length && (d = i.length - 1), n === r && !e.params.loop)) {
      d !== l && ((e.snapIndex = d), e.emit('snapIndexChange'));
      return;
    }
    if (n === r && e.params.loop && e.virtual && e.params.virtual.enabled) {
      e.realIndex = c(n);
      return;
    }
    let f = e.grid && a.grid && a.grid.rows > 1,
      u;
    if (e.virtual && a.virtual.enabled && a.loop) u = c(n);
    else if (f) {
      let p = e.slides.filter((v) => v.column === n)[0],
        h = parseInt(p.getAttribute('data-swiper-slide-index'), 10);
      Number.isNaN(h) && (h = Math.max(e.slides.indexOf(p), 0)), (u = Math.floor(h / a.grid.rows));
    } else if (e.slides[n]) {
      let p = e.slides[n].getAttribute('data-swiper-slide-index');
      p ? (u = parseInt(p, 10)) : (u = n);
    } else u = n;
    Object.assign(e, {
      previousSnapIndex: l,
      snapIndex: d,
      previousRealIndex: o,
      realIndex: u,
      previousIndex: r,
      activeIndex: n,
    }),
      e.initialized && me(e),
      e.emit('activeIndexChange'),
      e.emit('snapIndexChange'),
      (e.initialized || e.params.runCallbacksOnInit) &&
        (o !== u && e.emit('realIndexChange'), e.emit('slideChange'));
  }
  function at(s, e) {
    let t = this,
      i = t.params,
      a = s.closest(`.${i.slideClass}, swiper-slide`);
    !a &&
      t.isElement &&
      e &&
      e.length > 1 &&
      e.includes(s) &&
      [...e.slice(e.indexOf(s) + 1, e.length)].forEach((l) => {
        !a && l.matches && l.matches(`.${i.slideClass}, swiper-slide`) && (a = l);
      });
    let r = !1,
      o;
    if (a) {
      for (let l = 0; l < t.slides.length; l += 1)
        if (t.slides[l] === a) {
          (r = !0), (o = l);
          break;
        }
    }
    if (a && r)
      (t.clickedSlide = a),
        t.virtual && t.params.virtual.enabled
          ? (t.clickedIndex = parseInt(a.getAttribute('data-swiper-slide-index'), 10))
          : (t.clickedIndex = o);
    else {
      (t.clickedSlide = void 0), (t.clickedIndex = void 0);
      return;
    }
    i.slideToClickedSlide &&
      t.clickedIndex !== void 0 &&
      t.clickedIndex !== t.activeIndex &&
      t.slideToClickedSlide();
  }
  var nt = {
    updateSize: Ke,
    updateSlides: Ze,
    updateAutoHeight: Qe,
    updateSlidesOffset: Je,
    updateSlidesProgress: et,
    updateProgress: tt,
    updateSlidesClasses: st,
    updateActiveIndex: rt,
    updateClickedSlide: at,
  };
  function lt(s) {
    s === void 0 && (s = this.isHorizontal() ? 'x' : 'y');
    let e = this,
      { params: t, rtlTranslate: i, translate: a, wrapperEl: r } = e;
    if (t.virtualTranslate) return i ? -a : a;
    if (t.cssMode) return a;
    let o = ae(r, s);
    return (o += e.cssOverflowAdjustment()), i && (o = -o), o || 0;
  }
  function ot(s, e) {
    let t = this,
      { rtlTranslate: i, params: a, wrapperEl: r, progress: o } = t,
      l = 0,
      n = 0,
      d = 0;
    t.isHorizontal() ? (l = i ? -s : s) : (n = s),
      a.roundLengths && ((l = Math.floor(l)), (n = Math.floor(n))),
      (t.previousTranslate = t.translate),
      (t.translate = t.isHorizontal() ? l : n),
      a.cssMode
        ? (r[t.isHorizontal() ? 'scrollLeft' : 'scrollTop'] = t.isHorizontal() ? -l : -n)
        : a.virtualTranslate ||
          (t.isHorizontal() ? (l -= t.cssOverflowAdjustment()) : (n -= t.cssOverflowAdjustment()),
          (r.style.transform = `translate3d(${l}px, ${n}px, ${d}px)`));
    let c,
      f = t.maxTranslate() - t.minTranslate();
    f === 0 ? (c = 0) : (c = (s - t.minTranslate()) / f),
      c !== o && t.updateProgress(s),
      t.emit('setTranslate', t.translate, e);
  }
  function dt() {
    return -this.snapGrid[0];
  }
  function ct() {
    return -this.snapGrid[this.snapGrid.length - 1];
  }
  function ft(s, e, t, i, a) {
    s === void 0 && (s = 0),
      e === void 0 && (e = this.params.speed),
      t === void 0 && (t = !0),
      i === void 0 && (i = !0);
    let r = this,
      { params: o, wrapperEl: l } = r;
    if (r.animating && o.preventInteractionOnTransition) return !1;
    let n = r.minTranslate(),
      d = r.maxTranslate(),
      c;
    if ((i && s > n ? (c = n) : i && s < d ? (c = d) : (c = s), r.updateProgress(c), o.cssMode)) {
      let f = r.isHorizontal();
      if (e === 0) l[f ? 'scrollLeft' : 'scrollTop'] = -c;
      else {
        if (!r.support.smoothScroll)
          return ne({ swiper: r, targetPosition: -c, side: f ? 'left' : 'top' }), !0;
        l.scrollTo({ [f ? 'left' : 'top']: -c, behavior: 'smooth' });
      }
      return !0;
    }
    return (
      e === 0
        ? (r.setTransition(0),
          r.setTranslate(c),
          t && (r.emit('beforeTransitionStart', e, a), r.emit('transitionEnd')))
        : (r.setTransition(e),
          r.setTranslate(c),
          t && (r.emit('beforeTransitionStart', e, a), r.emit('transitionStart')),
          r.animating ||
            ((r.animating = !0),
            r.onTranslateToWrapperTransitionEnd ||
              (r.onTranslateToWrapperTransitionEnd = function (u) {
                !r ||
                  r.destroyed ||
                  (u.target === this &&
                    (r.wrapperEl.removeEventListener(
                      'transitionend',
                      r.onTranslateToWrapperTransitionEnd
                    ),
                    (r.onTranslateToWrapperTransitionEnd = null),
                    delete r.onTranslateToWrapperTransitionEnd,
                    (r.animating = !1),
                    t && r.emit('transitionEnd')));
              }),
            r.wrapperEl.addEventListener('transitionend', r.onTranslateToWrapperTransitionEnd))),
      !0
    );
  }
  var ut = {
    getTranslate: lt,
    setTranslate: ot,
    minTranslate: dt,
    maxTranslate: ct,
    translateTo: ft,
  };
  function pt(s, e) {
    let t = this;
    t.params.cssMode ||
      ((t.wrapperEl.style.transitionDuration = `${s}ms`),
      (t.wrapperEl.style.transitionDelay = s === 0 ? '0ms' : '')),
      t.emit('setTransition', s, e);
  }
  function $e(s) {
    let { swiper: e, runCallbacks: t, direction: i, step: a } = s,
      { activeIndex: r, previousIndex: o } = e,
      l = i;
    if (
      (l || (r > o ? (l = 'next') : r < o ? (l = 'prev') : (l = 'reset')),
      e.emit(`transition${a}`),
      t && r !== o)
    ) {
      if (l === 'reset') {
        e.emit(`slideResetTransition${a}`);
        return;
      }
      e.emit(`slideChangeTransition${a}`),
        l === 'next' ? e.emit(`slideNextTransition${a}`) : e.emit(`slidePrevTransition${a}`);
    }
  }
  function mt(s, e) {
    s === void 0 && (s = !0);
    let t = this,
      { params: i } = t;
    i.cssMode ||
      (i.autoHeight && t.updateAutoHeight(),
      $e({ swiper: t, runCallbacks: s, direction: e, step: 'Start' }));
  }
  function ht(s, e) {
    s === void 0 && (s = !0);
    let t = this,
      { params: i } = t;
    (t.animating = !1),
      !i.cssMode &&
        (t.setTransition(0), $e({ swiper: t, runCallbacks: s, direction: e, step: 'End' }));
  }
  var gt = { setTransition: pt, transitionStart: mt, transitionEnd: ht };
  function vt(s, e, t, i, a) {
    s === void 0 && (s = 0),
      t === void 0 && (t = !0),
      typeof s == 'string' && (s = parseInt(s, 10));
    let r = this,
      o = s;
    o < 0 && (o = 0);
    let {
      params: l,
      snapGrid: n,
      slidesGrid: d,
      previousIndex: c,
      activeIndex: f,
      rtlTranslate: u,
      wrapperEl: p,
      enabled: h,
    } = r;
    if ((!h && !i && !a) || r.destroyed || (r.animating && l.preventInteractionOnTransition))
      return !1;
    typeof e > 'u' && (e = r.params.speed);
    let v = Math.min(r.params.slidesPerGroupSkip, o),
      E = v + Math.floor((o - v) / r.params.slidesPerGroup);
    E >= n.length && (E = n.length - 1);
    let y = -n[E];
    if (l.normalizeSlideIndex)
      for (let m = 0; m < d.length; m += 1) {
        let g = -Math.floor(y * 100),
          x = Math.floor(d[m] * 100),
          C = Math.floor(d[m + 1] * 100);
        typeof d[m + 1] < 'u'
          ? g >= x && g < C - (C - x) / 2
            ? (o = m)
            : g >= x && g < C && (o = m + 1)
          : g >= x && (o = m);
      }
    if (
      r.initialized &&
      o !== f &&
      ((!r.allowSlideNext &&
        (u ? y > r.translate && y > r.minTranslate() : y < r.translate && y < r.minTranslate())) ||
        (!r.allowSlidePrev && y > r.translate && y > r.maxTranslate() && (f || 0) !== o))
    )
      return !1;
    o !== (c || 0) && t && r.emit('beforeSlideChangeStart'), r.updateProgress(y);
    let T;
    if (
      (o > f ? (T = 'next') : o < f ? (T = 'prev') : (T = 'reset'),
      (u && -y === r.translate) || (!u && y === r.translate))
    )
      return (
        r.updateActiveIndex(o),
        l.autoHeight && r.updateAutoHeight(),
        r.updateSlidesClasses(),
        l.effect !== 'slide' && r.setTranslate(y),
        T !== 'reset' && (r.transitionStart(t, T), r.transitionEnd(t, T)),
        !1
      );
    if (l.cssMode) {
      let m = r.isHorizontal(),
        g = u ? y : -y;
      if (e === 0) {
        let x = r.virtual && r.params.virtual.enabled;
        x && ((r.wrapperEl.style.scrollSnapType = 'none'), (r._immediateVirtual = !0)),
          x && !r._cssModeVirtualInitialSet && r.params.initialSlide > 0
            ? ((r._cssModeVirtualInitialSet = !0),
              requestAnimationFrame(() => {
                p[m ? 'scrollLeft' : 'scrollTop'] = g;
              }))
            : (p[m ? 'scrollLeft' : 'scrollTop'] = g),
          x &&
            requestAnimationFrame(() => {
              (r.wrapperEl.style.scrollSnapType = ''), (r._immediateVirtual = !1);
            });
      } else {
        if (!r.support.smoothScroll)
          return ne({ swiper: r, targetPosition: g, side: m ? 'left' : 'top' }), !0;
        p.scrollTo({ [m ? 'left' : 'top']: g, behavior: 'smooth' });
      }
      return !0;
    }
    return (
      r.setTransition(e),
      r.setTranslate(y),
      r.updateActiveIndex(o),
      r.updateSlidesClasses(),
      r.emit('beforeTransitionStart', e, i),
      r.transitionStart(t, T),
      e === 0
        ? r.transitionEnd(t, T)
        : r.animating ||
          ((r.animating = !0),
          r.onSlideToWrapperTransitionEnd ||
            (r.onSlideToWrapperTransitionEnd = function (g) {
              !r ||
                r.destroyed ||
                (g.target === this &&
                  (r.wrapperEl.removeEventListener(
                    'transitionend',
                    r.onSlideToWrapperTransitionEnd
                  ),
                  (r.onSlideToWrapperTransitionEnd = null),
                  delete r.onSlideToWrapperTransitionEnd,
                  r.transitionEnd(t, T)));
            }),
          r.wrapperEl.addEventListener('transitionend', r.onSlideToWrapperTransitionEnd)),
      !0
    );
  }
  function wt(s, e, t, i) {
    s === void 0 && (s = 0),
      t === void 0 && (t = !0),
      typeof s == 'string' && (s = parseInt(s, 10));
    let a = this;
    if (a.destroyed) return;
    typeof e > 'u' && (e = a.params.speed);
    let r = a.grid && a.params.grid && a.params.grid.rows > 1,
      o = s;
    if (a.params.loop)
      if (a.virtual && a.params.virtual.enabled) o = o + a.virtual.slidesBefore;
      else {
        let l;
        if (r) {
          let u = o * a.params.grid.rows;
          l = a.slides.filter((p) => p.getAttribute('data-swiper-slide-index') * 1 === u)[0].column;
        } else l = a.getSlideIndexByData(o);
        let n = r ? Math.ceil(a.slides.length / a.params.grid.rows) : a.slides.length,
          { centeredSlides: d } = a.params,
          c = a.params.slidesPerView;
        c === 'auto'
          ? (c = a.slidesPerViewDynamic())
          : ((c = Math.ceil(parseFloat(a.params.slidesPerView, 10))),
            d && c % 2 === 0 && (c = c + 1));
        let f = n - l < c;
        if (
          (d && (f = f || l < Math.ceil(c / 2)),
          i && d && a.params.slidesPerView !== 'auto' && !r && (f = !1),
          f)
        ) {
          let u = d
            ? l < a.activeIndex
              ? 'prev'
              : 'next'
            : l - a.activeIndex - 1 < a.params.slidesPerView
              ? 'next'
              : 'prev';
          a.loopFix({
            direction: u,
            slideTo: !0,
            activeSlideIndex: u === 'next' ? l + 1 : l - n + 1,
            slideRealIndex: u === 'next' ? a.realIndex : void 0,
          });
        }
        if (r) {
          let u = o * a.params.grid.rows;
          o = a.slides.filter((p) => p.getAttribute('data-swiper-slide-index') * 1 === u)[0].column;
        } else o = a.getSlideIndexByData(o);
      }
    return (
      requestAnimationFrame(() => {
        a.slideTo(o, e, t, i);
      }),
      a
    );
  }
  function yt(s, e, t) {
    e === void 0 && (e = !0);
    let i = this,
      { enabled: a, params: r, animating: o } = i;
    if (!a || i.destroyed) return i;
    typeof s > 'u' && (s = i.params.speed);
    let l = r.slidesPerGroup;
    r.slidesPerView === 'auto' &&
      r.slidesPerGroup === 1 &&
      r.slidesPerGroupAuto &&
      (l = Math.max(i.slidesPerViewDynamic('current', !0), 1));
    let n = i.activeIndex < r.slidesPerGroupSkip ? 1 : l,
      d = i.virtual && r.virtual.enabled;
    if (r.loop) {
      if (o && !d && r.loopPreventsSliding) return !1;
      if (
        (i.loopFix({ direction: 'next' }),
        (i._clientLeft = i.wrapperEl.clientLeft),
        i.activeIndex === i.slides.length - 1 && r.cssMode)
      )
        return (
          requestAnimationFrame(() => {
            i.slideTo(i.activeIndex + n, s, e, t);
          }),
          !0
        );
    }
    return r.rewind && i.isEnd ? i.slideTo(0, s, e, t) : i.slideTo(i.activeIndex + n, s, e, t);
  }
  function bt(s, e, t) {
    e === void 0 && (e = !0);
    let i = this,
      { params: a, snapGrid: r, slidesGrid: o, rtlTranslate: l, enabled: n, animating: d } = i;
    if (!n || i.destroyed) return i;
    typeof s > 'u' && (s = i.params.speed);
    let c = i.virtual && a.virtual.enabled;
    if (a.loop) {
      if (d && !c && a.loopPreventsSliding) return !1;
      i.loopFix({ direction: 'prev' }), (i._clientLeft = i.wrapperEl.clientLeft);
    }
    let f = l ? i.translate : -i.translate;
    function u(y) {
      return y < 0 ? -Math.floor(Math.abs(y)) : Math.floor(y);
    }
    let p = u(f),
      h = r.map((y) => u(y)),
      v = r[h.indexOf(p) - 1];
    if (typeof v > 'u' && a.cssMode) {
      let y;
      r.forEach((T, m) => {
        p >= T && (y = m);
      }),
        typeof y < 'u' && (v = r[y > 0 ? y - 1 : y]);
    }
    let E = 0;
    if (
      (typeof v < 'u' &&
        ((E = o.indexOf(v)),
        E < 0 && (E = i.activeIndex - 1),
        a.slidesPerView === 'auto' &&
          a.slidesPerGroup === 1 &&
          a.slidesPerGroupAuto &&
          ((E = E - i.slidesPerViewDynamic('previous', !0) + 1), (E = Math.max(E, 0)))),
      a.rewind && i.isBeginning)
    ) {
      let y =
        i.params.virtual && i.params.virtual.enabled && i.virtual
          ? i.virtual.slides.length - 1
          : i.slides.length - 1;
      return i.slideTo(y, s, e, t);
    } else if (a.loop && i.activeIndex === 0 && a.cssMode)
      return (
        requestAnimationFrame(() => {
          i.slideTo(E, s, e, t);
        }),
        !0
      );
    return i.slideTo(E, s, e, t);
  }
  function St(s, e, t) {
    e === void 0 && (e = !0);
    let i = this;
    if (!i.destroyed)
      return typeof s > 'u' && (s = i.params.speed), i.slideTo(i.activeIndex, s, e, t);
  }
  function xt(s, e, t, i) {
    e === void 0 && (e = !0), i === void 0 && (i = 0.5);
    let a = this;
    if (a.destroyed) return;
    typeof s > 'u' && (s = a.params.speed);
    let r = a.activeIndex,
      o = Math.min(a.params.slidesPerGroupSkip, r),
      l = o + Math.floor((r - o) / a.params.slidesPerGroup),
      n = a.rtlTranslate ? a.translate : -a.translate;
    if (n >= a.snapGrid[l]) {
      let d = a.snapGrid[l],
        c = a.snapGrid[l + 1];
      n - d > (c - d) * i && (r += a.params.slidesPerGroup);
    } else {
      let d = a.snapGrid[l - 1],
        c = a.snapGrid[l];
      n - d <= (c - d) * i && (r -= a.params.slidesPerGroup);
    }
    return (r = Math.max(r, 0)), (r = Math.min(r, a.slidesGrid.length - 1)), a.slideTo(r, s, e, t);
  }
  function Et() {
    let s = this;
    if (s.destroyed) return;
    let { params: e, slidesEl: t } = s,
      i = e.slidesPerView === 'auto' ? s.slidesPerViewDynamic() : e.slidesPerView,
      a = s.clickedIndex,
      r,
      o = s.isElement ? 'swiper-slide' : `.${e.slideClass}`;
    if (e.loop) {
      if (s.animating) return;
      (r = parseInt(s.clickedSlide.getAttribute('data-swiper-slide-index'), 10)),
        e.centeredSlides
          ? a < s.loopedSlides - i / 2 || a > s.slides.length - s.loopedSlides + i / 2
            ? (s.loopFix(),
              (a = s.getSlideIndex(k(t, `${o}[data-swiper-slide-index="${r}"]`)[0])),
              X(() => {
                s.slideTo(a);
              }))
            : s.slideTo(a)
          : a > s.slides.length - i
            ? (s.loopFix(),
              (a = s.getSlideIndex(k(t, `${o}[data-swiper-slide-index="${r}"]`)[0])),
              X(() => {
                s.slideTo(a);
              }))
            : s.slideTo(a);
    } else s.slideTo(a);
  }
  var Tt = {
    slideTo: vt,
    slideToLoop: wt,
    slideNext: yt,
    slidePrev: bt,
    slideReset: St,
    slideToClosest: xt,
    slideToClickedSlide: Et,
  };
  function Mt(s) {
    let e = this,
      { params: t, slidesEl: i } = e;
    if (!t.loop || (e.virtual && e.params.virtual.enabled)) return;
    let a = () => {
        k(i, `.${t.slideClass}, swiper-slide`).forEach((f, u) => {
          f.setAttribute('data-swiper-slide-index', u);
        });
      },
      r = e.grid && t.grid && t.grid.rows > 1,
      o = t.slidesPerGroup * (r ? t.grid.rows : 1),
      l = e.slides.length % o !== 0,
      n = r && e.slides.length % t.grid.rows !== 0,
      d = (c) => {
        for (let f = 0; f < c; f += 1) {
          let u = e.isElement
            ? R('swiper-slide', [t.slideBlankClass])
            : R('div', [t.slideClass, t.slideBlankClass]);
          e.slidesEl.append(u);
        }
      };
    if (l) {
      if (t.loopAddBlankSlides) {
        let c = o - (e.slides.length % o);
        d(c), e.recalcSlides(), e.updateSlides();
      } else
        K(
          'Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)'
        );
      a();
    } else if (n) {
      if (t.loopAddBlankSlides) {
        let c = t.grid.rows - (e.slides.length % t.grid.rows);
        d(c), e.recalcSlides(), e.updateSlides();
      } else
        K(
          'Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)'
        );
      a();
    } else a();
    e.loopFix({ slideRealIndex: s, direction: t.centeredSlides ? void 0 : 'next' });
  }
  function Ct(s) {
    let {
        slideRealIndex: e,
        slideTo: t = !0,
        direction: i,
        setTranslate: a,
        activeSlideIndex: r,
        byController: o,
        byMousewheel: l,
      } = s === void 0 ? {} : s,
      n = this;
    if (!n.params.loop) return;
    n.emit('beforeLoopFix');
    let { slides: d, allowSlidePrev: c, allowSlideNext: f, slidesEl: u, params: p } = n,
      { centeredSlides: h } = p;
    if (((n.allowSlidePrev = !0), (n.allowSlideNext = !0), n.virtual && p.virtual.enabled)) {
      t &&
        (!p.centeredSlides && n.snapIndex === 0
          ? n.slideTo(n.virtual.slides.length, 0, !1, !0)
          : p.centeredSlides && n.snapIndex < p.slidesPerView
            ? n.slideTo(n.virtual.slides.length + n.snapIndex, 0, !1, !0)
            : n.snapIndex === n.snapGrid.length - 1 &&
              n.slideTo(n.virtual.slidesBefore, 0, !1, !0)),
        (n.allowSlidePrev = c),
        (n.allowSlideNext = f),
        n.emit('loopFix');
      return;
    }
    let v = p.slidesPerView;
    v === 'auto'
      ? (v = n.slidesPerViewDynamic())
      : ((v = Math.ceil(parseFloat(p.slidesPerView, 10))), h && v % 2 === 0 && (v = v + 1));
    let E = p.slidesPerGroupAuto ? v : p.slidesPerGroup,
      y = E;
    y % E !== 0 && (y += E - (y % E)), (y += p.loopAdditionalSlides), (n.loopedSlides = y);
    let T = n.grid && p.grid && p.grid.rows > 1;
    d.length < v + y
      ? K(
          'Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled and not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters'
        )
      : T &&
        p.grid.fill === 'row' &&
        K('Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`');
    let m = [],
      g = [],
      x = n.activeIndex;
    typeof r > 'u'
      ? (r = n.getSlideIndex(d.filter((b) => b.classList.contains(p.slideActiveClass))[0]))
      : (x = r);
    let C = i === 'next' || !i,
      D = i === 'prev' || !i,
      L = 0,
      I = 0,
      w = T ? Math.ceil(d.length / p.grid.rows) : d.length,
      M = (T ? d[r].column : r) + (h && typeof a > 'u' ? -v / 2 + 0.5 : 0);
    if (M < y) {
      L = Math.max(y - M, E);
      for (let b = 0; b < y - M; b += 1) {
        let P = b - Math.floor(b / w) * w;
        if (T) {
          let z = w - P - 1;
          for (let B = d.length - 1; B >= 0; B -= 1) d[B].column === z && m.push(B);
        } else m.push(w - P - 1);
      }
    } else if (M + v > w - y) {
      I = Math.max(M - (w - y * 2), E);
      for (let b = 0; b < I; b += 1) {
        let P = b - Math.floor(b / w) * w;
        T
          ? d.forEach((z, B) => {
              z.column === P && g.push(B);
            })
          : g.push(P);
      }
    }
    if (
      ((n.__preventObserver__ = !0),
      requestAnimationFrame(() => {
        n.__preventObserver__ = !1;
      }),
      D &&
        m.forEach((b) => {
          (d[b].swiperLoopMoveDOM = !0), u.prepend(d[b]), (d[b].swiperLoopMoveDOM = !1);
        }),
      C &&
        g.forEach((b) => {
          (d[b].swiperLoopMoveDOM = !0), u.append(d[b]), (d[b].swiperLoopMoveDOM = !1);
        }),
      n.recalcSlides(),
      p.slidesPerView === 'auto'
        ? n.updateSlides()
        : T &&
          ((m.length > 0 && D) || (g.length > 0 && C)) &&
          n.slides.forEach((b, P) => {
            n.grid.updateSlide(P, b, n.slides);
          }),
      p.watchSlidesProgress && n.updateSlidesOffset(),
      t)
    ) {
      if (m.length > 0 && D) {
        if (typeof e > 'u') {
          let b = n.slidesGrid[x],
            z = n.slidesGrid[x + L] - b;
          l
            ? n.setTranslate(n.translate - z)
            : (n.slideTo(x + Math.ceil(L), 0, !1, !0),
              a &&
                ((n.touchEventsData.startTranslate = n.touchEventsData.startTranslate - z),
                (n.touchEventsData.currentTranslate = n.touchEventsData.currentTranslate - z)));
        } else if (a) {
          let b = T ? m.length / p.grid.rows : m.length;
          n.slideTo(n.activeIndex + b, 0, !1, !0),
            (n.touchEventsData.currentTranslate = n.translate);
        }
      } else if (g.length > 0 && C)
        if (typeof e > 'u') {
          let b = n.slidesGrid[x],
            z = n.slidesGrid[x - I] - b;
          l
            ? n.setTranslate(n.translate - z)
            : (n.slideTo(x - I, 0, !1, !0),
              a &&
                ((n.touchEventsData.startTranslate = n.touchEventsData.startTranslate - z),
                (n.touchEventsData.currentTranslate = n.touchEventsData.currentTranslate - z)));
        } else {
          let b = T ? g.length / p.grid.rows : g.length;
          n.slideTo(n.activeIndex - b, 0, !1, !0);
        }
    }
    if (
      ((n.allowSlidePrev = c), (n.allowSlideNext = f), n.controller && n.controller.control && !o)
    ) {
      let b = {
        slideRealIndex: e,
        direction: i,
        setTranslate: a,
        activeSlideIndex: r,
        byController: !0,
      };
      Array.isArray(n.controller.control)
        ? n.controller.control.forEach((P) => {
            !P.destroyed &&
              P.params.loop &&
              P.loopFix({ ...b, slideTo: P.params.slidesPerView === p.slidesPerView ? t : !1 });
          })
        : n.controller.control instanceof n.constructor &&
          n.controller.control.params.loop &&
          n.controller.control.loopFix({
            ...b,
            slideTo: n.controller.control.params.slidesPerView === p.slidesPerView ? t : !1,
          });
    }
    n.emit('loopFix');
  }
  function Pt() {
    let s = this,
      { params: e, slidesEl: t } = s;
    if (!e.loop || (s.virtual && s.params.virtual.enabled)) return;
    s.recalcSlides();
    let i = [];
    s.slides.forEach((a) => {
      let r =
        typeof a.swiperSlideIndex > 'u'
          ? a.getAttribute('data-swiper-slide-index') * 1
          : a.swiperSlideIndex;
      i[r] = a;
    }),
      s.slides.forEach((a) => {
        a.removeAttribute('data-swiper-slide-index');
      }),
      i.forEach((a) => {
        t.append(a);
      }),
      s.recalcSlides(),
      s.slideTo(s.realIndex, 0);
  }
  var Lt = { loopCreate: Mt, loopFix: Ct, loopDestroy: Pt };
  function It(s) {
    let e = this;
    if (!e.params.simulateTouch || (e.params.watchOverflow && e.isLocked) || e.params.cssMode)
      return;
    let t = e.params.touchEventsTarget === 'container' ? e.el : e.wrapperEl;
    e.isElement && (e.__preventObserver__ = !0),
      (t.style.cursor = 'move'),
      (t.style.cursor = s ? 'grabbing' : 'grab'),
      e.isElement &&
        requestAnimationFrame(() => {
          e.__preventObserver__ = !1;
        });
  }
  function At() {
    let s = this;
    (s.params.watchOverflow && s.isLocked) ||
      s.params.cssMode ||
      (s.isElement && (s.__preventObserver__ = !0),
      (s[s.params.touchEventsTarget === 'container' ? 'el' : 'wrapperEl'].style.cursor = ''),
      s.isElement &&
        requestAnimationFrame(() => {
          s.__preventObserver__ = !1;
        }));
  }
  var zt = { setGrabCursor: It, unsetGrabCursor: At };
  function Dt(s, e) {
    e === void 0 && (e = this);
    function t(i) {
      if (!i || i === O() || i === A()) return null;
      i.assignedSlot && (i = i.assignedSlot);
      let a = i.closest(s);
      return !a && !i.getRootNode ? null : a || t(i.getRootNode().host);
    }
    return t(e);
  }
  function Pe(s, e, t) {
    let i = A(),
      { params: a } = s,
      r = a.edgeSwipeDetection,
      o = a.edgeSwipeThreshold;
    return r && (t <= o || t >= i.innerWidth - o)
      ? r === 'prevent'
        ? (e.preventDefault(), !0)
        : !1
      : !0;
  }
  function $t(s) {
    let e = this,
      t = O(),
      i = s;
    i.originalEvent && (i = i.originalEvent);
    let a = e.touchEventsData;
    if (i.type === 'pointerdown') {
      if (a.pointerId !== null && a.pointerId !== i.pointerId) return;
      a.pointerId = i.pointerId;
    } else
      i.type === 'touchstart' &&
        i.targetTouches.length === 1 &&
        (a.touchId = i.targetTouches[0].identifier);
    if (i.type === 'touchstart') {
      Pe(e, i, i.targetTouches[0].pageX);
      return;
    }
    let { params: r, touches: o, enabled: l } = e;
    if (
      !l ||
      (!r.simulateTouch && i.pointerType === 'mouse') ||
      (e.animating && r.preventInteractionOnTransition)
    )
      return;
    !e.animating && r.cssMode && r.loop && e.loopFix();
    let n = i.target;
    if (
      (r.touchEventsTarget === 'wrapper' && !e.wrapperEl.contains(n)) ||
      ('which' in i && i.which === 3) ||
      ('button' in i && i.button > 0) ||
      (a.isTouched && a.isMoved)
    )
      return;
    let d = !!r.noSwipingClass && r.noSwipingClass !== '',
      c = i.composedPath ? i.composedPath() : i.path;
    d && i.target && i.target.shadowRoot && c && (n = c[0]);
    let f = r.noSwipingSelector ? r.noSwipingSelector : `.${r.noSwipingClass}`,
      u = !!(i.target && i.target.shadowRoot);
    if (r.noSwiping && (u ? Dt(f, n) : n.closest(f))) {
      e.allowClick = !0;
      return;
    }
    if (r.swipeHandler && !n.closest(r.swipeHandler)) return;
    (o.currentX = i.pageX), (o.currentY = i.pageY);
    let p = o.currentX,
      h = o.currentY;
    if (!Pe(e, i, p)) return;
    Object.assign(a, {
      isTouched: !0,
      isMoved: !1,
      allowTouchCallbacks: !0,
      isScrolling: void 0,
      startMoving: void 0,
    }),
      (o.startX = p),
      (o.startY = h),
      (a.touchStartTime = H()),
      (e.allowClick = !0),
      e.updateSize(),
      (e.swipeDirection = void 0),
      r.threshold > 0 && (a.allowThresholdMove = !1);
    let v = !0;
    n.matches(a.focusableElements) && ((v = !1), n.nodeName === 'SELECT' && (a.isTouched = !1)),
      t.activeElement &&
        t.activeElement.matches(a.focusableElements) &&
        t.activeElement !== n &&
        t.activeElement.blur();
    let E = v && e.allowTouchMove && r.touchStartPreventDefault;
    (r.touchStartForcePreventDefault || E) && !n.isContentEditable && i.preventDefault(),
      r.freeMode &&
        r.freeMode.enabled &&
        e.freeMode &&
        e.animating &&
        !r.cssMode &&
        e.freeMode.onTouchStart(),
      e.emit('touchStart', i);
  }
  function Ot(s) {
    let e = O(),
      t = this,
      i = t.touchEventsData,
      { params: a, touches: r, rtlTranslate: o, enabled: l } = t;
    if (!l || (!a.simulateTouch && s.pointerType === 'mouse')) return;
    let n = s;
    if (
      (n.originalEvent && (n = n.originalEvent),
      n.type === 'pointermove' && (i.touchId !== null || n.pointerId !== i.pointerId))
    )
      return;
    let d;
    if (n.type === 'touchmove') {
      if (
        ((d = [...n.changedTouches].filter((C) => C.identifier === i.touchId)[0]),
        !d || d.identifier !== i.touchId)
      )
        return;
    } else d = n;
    if (!i.isTouched) {
      i.startMoving && i.isScrolling && t.emit('touchMoveOpposite', n);
      return;
    }
    let c = d.pageX,
      f = d.pageY;
    if (n.preventedByNestedSwiper) {
      (r.startX = c), (r.startY = f);
      return;
    }
    if (!t.allowTouchMove) {
      n.target.matches(i.focusableElements) || (t.allowClick = !1),
        i.isTouched &&
          (Object.assign(r, { startX: c, startY: f, currentX: c, currentY: f }),
          (i.touchStartTime = H()));
      return;
    }
    if (a.touchReleaseOnEdges && !a.loop) {
      if (t.isVertical()) {
        if (
          (f < r.startY && t.translate <= t.maxTranslate()) ||
          (f > r.startY && t.translate >= t.minTranslate())
        ) {
          (i.isTouched = !1), (i.isMoved = !1);
          return;
        }
      } else if (
        (c < r.startX && t.translate <= t.maxTranslate()) ||
        (c > r.startX && t.translate >= t.minTranslate())
      )
        return;
    }
    if (e.activeElement && n.target === e.activeElement && n.target.matches(i.focusableElements)) {
      (i.isMoved = !0), (t.allowClick = !1);
      return;
    }
    i.allowTouchCallbacks && t.emit('touchMove', n),
      (r.previousX = r.currentX),
      (r.previousY = r.currentY),
      (r.currentX = c),
      (r.currentY = f);
    let u = r.currentX - r.startX,
      p = r.currentY - r.startY;
    if (t.params.threshold && Math.sqrt(u ** 2 + p ** 2) < t.params.threshold) return;
    if (typeof i.isScrolling > 'u') {
      let C;
      (t.isHorizontal() && r.currentY === r.startY) || (t.isVertical() && r.currentX === r.startX)
        ? (i.isScrolling = !1)
        : u * u + p * p >= 25 &&
          ((C = (Math.atan2(Math.abs(p), Math.abs(u)) * 180) / Math.PI),
          (i.isScrolling = t.isHorizontal() ? C > a.touchAngle : 90 - C > a.touchAngle));
    }
    if (
      (i.isScrolling && t.emit('touchMoveOpposite', n),
      typeof i.startMoving > 'u' &&
        (r.currentX !== r.startX || r.currentY !== r.startY) &&
        (i.startMoving = !0),
      i.isScrolling || (n.type === 'touchmove' && i.preventTouchMoveFromPointerMove))
    ) {
      i.isTouched = !1;
      return;
    }
    if (!i.startMoving) return;
    (t.allowClick = !1),
      !a.cssMode && n.cancelable && n.preventDefault(),
      a.touchMoveStopPropagation && !a.nested && n.stopPropagation();
    let h = t.isHorizontal() ? u : p,
      v = t.isHorizontal() ? r.currentX - r.previousX : r.currentY - r.previousY;
    a.oneWayMovement && ((h = Math.abs(h) * (o ? 1 : -1)), (v = Math.abs(v) * (o ? 1 : -1))),
      (r.diff = h),
      (h *= a.touchRatio),
      o && ((h = -h), (v = -v));
    let E = t.touchesDirection;
    (t.swipeDirection = h > 0 ? 'prev' : 'next'), (t.touchesDirection = v > 0 ? 'prev' : 'next');
    let y = t.params.loop && !a.cssMode,
      T =
        (t.touchesDirection === 'next' && t.allowSlideNext) ||
        (t.touchesDirection === 'prev' && t.allowSlidePrev);
    if (!i.isMoved) {
      if (
        (y && T && t.loopFix({ direction: t.swipeDirection }),
        (i.startTranslate = t.getTranslate()),
        t.setTransition(0),
        t.animating)
      ) {
        let C = new window.CustomEvent('transitionend', {
          bubbles: !0,
          cancelable: !0,
          detail: { bySwiperTouchMove: !0 },
        });
        t.wrapperEl.dispatchEvent(C);
      }
      (i.allowMomentumBounce = !1),
        a.grabCursor && (t.allowSlideNext === !0 || t.allowSlidePrev === !0) && t.setGrabCursor(!0),
        t.emit('sliderFirstMove', n);
    }
    let m;
    if (
      (new Date().getTime(),
      i.isMoved && i.allowThresholdMove && E !== t.touchesDirection && y && T && Math.abs(h) >= 1)
    ) {
      Object.assign(r, {
        startX: c,
        startY: f,
        currentX: c,
        currentY: f,
        startTranslate: i.currentTranslate,
      }),
        (i.loopSwapReset = !0),
        (i.startTranslate = i.currentTranslate);
      return;
    }
    t.emit('sliderMove', n), (i.isMoved = !0), (i.currentTranslate = h + i.startTranslate);
    let g = !0,
      x = a.resistanceRatio;
    if (
      (a.touchReleaseOnEdges && (x = 0),
      h > 0
        ? (y &&
            T &&
            !m &&
            i.allowThresholdMove &&
            i.currentTranslate >
              (a.centeredSlides
                ? t.minTranslate() - t.slidesSizesGrid[t.activeIndex + 1]
                : t.minTranslate()) &&
            t.loopFix({ direction: 'prev', setTranslate: !0, activeSlideIndex: 0 }),
          i.currentTranslate > t.minTranslate() &&
            ((g = !1),
            a.resistance &&
              (i.currentTranslate =
                t.minTranslate() - 1 + (-t.minTranslate() + i.startTranslate + h) ** x)))
        : h < 0 &&
          (y &&
            T &&
            !m &&
            i.allowThresholdMove &&
            i.currentTranslate <
              (a.centeredSlides
                ? t.maxTranslate() + t.slidesSizesGrid[t.slidesSizesGrid.length - 1]
                : t.maxTranslate()) &&
            t.loopFix({
              direction: 'next',
              setTranslate: !0,
              activeSlideIndex:
                t.slides.length -
                (a.slidesPerView === 'auto'
                  ? t.slidesPerViewDynamic()
                  : Math.ceil(parseFloat(a.slidesPerView, 10))),
            }),
          i.currentTranslate < t.maxTranslate() &&
            ((g = !1),
            a.resistance &&
              (i.currentTranslate =
                t.maxTranslate() + 1 - (t.maxTranslate() - i.startTranslate - h) ** x))),
      g && (n.preventedByNestedSwiper = !0),
      !t.allowSlideNext &&
        t.swipeDirection === 'next' &&
        i.currentTranslate < i.startTranslate &&
        (i.currentTranslate = i.startTranslate),
      !t.allowSlidePrev &&
        t.swipeDirection === 'prev' &&
        i.currentTranslate > i.startTranslate &&
        (i.currentTranslate = i.startTranslate),
      !t.allowSlidePrev && !t.allowSlideNext && (i.currentTranslate = i.startTranslate),
      a.threshold > 0)
    )
      if (Math.abs(h) > a.threshold || i.allowThresholdMove) {
        if (!i.allowThresholdMove) {
          (i.allowThresholdMove = !0),
            (r.startX = r.currentX),
            (r.startY = r.currentY),
            (i.currentTranslate = i.startTranslate),
            (r.diff = t.isHorizontal() ? r.currentX - r.startX : r.currentY - r.startY);
          return;
        }
      } else {
        i.currentTranslate = i.startTranslate;
        return;
      }
    !a.followFinger ||
      a.cssMode ||
      (((a.freeMode && a.freeMode.enabled && t.freeMode) || a.watchSlidesProgress) &&
        (t.updateActiveIndex(), t.updateSlidesClasses()),
      a.freeMode && a.freeMode.enabled && t.freeMode && t.freeMode.onTouchMove(),
      t.updateProgress(i.currentTranslate),
      t.setTranslate(i.currentTranslate));
  }
  function kt(s) {
    let e = this,
      t = e.touchEventsData,
      i = s;
    i.originalEvent && (i = i.originalEvent);
    let a;
    if (i.type === 'touchend' || i.type === 'touchcancel') {
      if (
        ((a = [...i.changedTouches].filter((x) => x.identifier === t.touchId)[0]),
        !a || a.identifier !== t.touchId)
      )
        return;
    } else {
      if (t.touchId !== null || i.pointerId !== t.pointerId) return;
      a = i;
    }
    if (
      ['pointercancel', 'pointerout', 'pointerleave', 'contextmenu'].includes(i.type) &&
      !(
        ['pointercancel', 'contextmenu'].includes(i.type) &&
        (e.browser.isSafari || e.browser.isWebView)
      )
    )
      return;
    (t.pointerId = null), (t.touchId = null);
    let { params: o, touches: l, rtlTranslate: n, slidesGrid: d, enabled: c } = e;
    if (!c || (!o.simulateTouch && i.pointerType === 'mouse')) return;
    if (
      (t.allowTouchCallbacks && e.emit('touchEnd', i), (t.allowTouchCallbacks = !1), !t.isTouched)
    ) {
      t.isMoved && o.grabCursor && e.setGrabCursor(!1), (t.isMoved = !1), (t.startMoving = !1);
      return;
    }
    o.grabCursor &&
      t.isMoved &&
      t.isTouched &&
      (e.allowSlideNext === !0 || e.allowSlidePrev === !0) &&
      e.setGrabCursor(!1);
    let f = H(),
      u = f - t.touchStartTime;
    if (e.allowClick) {
      let x = i.path || (i.composedPath && i.composedPath());
      e.updateClickedSlide((x && x[0]) || i.target, x),
        e.emit('tap click', i),
        u < 300 && f - t.lastClickTime < 300 && e.emit('doubleTap doubleClick', i);
    }
    if (
      ((t.lastClickTime = H()),
      X(() => {
        e.destroyed || (e.allowClick = !0);
      }),
      !t.isTouched ||
        !t.isMoved ||
        !e.swipeDirection ||
        (l.diff === 0 && !t.loopSwapReset) ||
        (t.currentTranslate === t.startTranslate && !t.loopSwapReset))
    ) {
      (t.isTouched = !1), (t.isMoved = !1), (t.startMoving = !1);
      return;
    }
    (t.isTouched = !1), (t.isMoved = !1), (t.startMoving = !1);
    let p;
    if (
      (o.followFinger ? (p = n ? e.translate : -e.translate) : (p = -t.currentTranslate), o.cssMode)
    )
      return;
    if (o.freeMode && o.freeMode.enabled) {
      e.freeMode.onTouchEnd({ currentPos: p });
      return;
    }
    let h = p >= -e.maxTranslate() && !e.params.loop,
      v = 0,
      E = e.slidesSizesGrid[0];
    for (let x = 0; x < d.length; x += x < o.slidesPerGroupSkip ? 1 : o.slidesPerGroup) {
      let C = x < o.slidesPerGroupSkip - 1 ? 1 : o.slidesPerGroup;
      typeof d[x + C] < 'u'
        ? (h || (p >= d[x] && p < d[x + C])) && ((v = x), (E = d[x + C] - d[x]))
        : (h || p >= d[x]) && ((v = x), (E = d[d.length - 1] - d[d.length - 2]));
    }
    let y = null,
      T = null;
    o.rewind &&
      (e.isBeginning
        ? (T =
            o.virtual && o.virtual.enabled && e.virtual
              ? e.virtual.slides.length - 1
              : e.slides.length - 1)
        : e.isEnd && (y = 0));
    let m = (p - d[v]) / E,
      g = v < o.slidesPerGroupSkip - 1 ? 1 : o.slidesPerGroup;
    if (u > o.longSwipesMs) {
      if (!o.longSwipes) {
        e.slideTo(e.activeIndex);
        return;
      }
      e.swipeDirection === 'next' &&
        (m >= o.longSwipesRatio ? e.slideTo(o.rewind && e.isEnd ? y : v + g) : e.slideTo(v)),
        e.swipeDirection === 'prev' &&
          (m > 1 - o.longSwipesRatio
            ? e.slideTo(v + g)
            : T !== null && m < 0 && Math.abs(m) > o.longSwipesRatio
              ? e.slideTo(T)
              : e.slideTo(v));
    } else {
      if (!o.shortSwipes) {
        e.slideTo(e.activeIndex);
        return;
      }
      e.navigation && (i.target === e.navigation.nextEl || i.target === e.navigation.prevEl)
        ? i.target === e.navigation.nextEl
          ? e.slideTo(v + g)
          : e.slideTo(v)
        : (e.swipeDirection === 'next' && e.slideTo(y !== null ? y : v + g),
          e.swipeDirection === 'prev' && e.slideTo(T !== null ? T : v));
    }
  }
  function Le() {
    let s = this,
      { params: e, el: t } = s;
    if (t && t.offsetWidth === 0) return;
    e.breakpoints && s.setBreakpoint();
    let { allowSlideNext: i, allowSlidePrev: a, snapGrid: r } = s,
      o = s.virtual && s.params.virtual.enabled;
    (s.allowSlideNext = !0),
      (s.allowSlidePrev = !0),
      s.updateSize(),
      s.updateSlides(),
      s.updateSlidesClasses();
    let l = o && e.loop;
    (e.slidesPerView === 'auto' || e.slidesPerView > 1) &&
    s.isEnd &&
    !s.isBeginning &&
    !s.params.centeredSlides &&
    !l
      ? s.slideTo(s.slides.length - 1, 0, !1, !0)
      : s.params.loop && !o
        ? s.slideToLoop(s.realIndex, 0, !1, !0)
        : s.slideTo(s.activeIndex, 0, !1, !0),
      s.autoplay &&
        s.autoplay.running &&
        s.autoplay.paused &&
        (clearTimeout(s.autoplay.resizeTimeout),
        (s.autoplay.resizeTimeout = setTimeout(() => {
          s.autoplay && s.autoplay.running && s.autoplay.paused && s.autoplay.resume();
        }, 500))),
      (s.allowSlidePrev = a),
      (s.allowSlideNext = i),
      s.params.watchOverflow && r !== s.snapGrid && s.checkOverflow();
  }
  function Gt(s) {
    let e = this;
    e.enabled &&
      (e.allowClick ||
        (e.params.preventClicks && s.preventDefault(),
        e.params.preventClicksPropagation &&
          e.animating &&
          (s.stopPropagation(), s.stopImmediatePropagation())));
  }
  function Ht() {
    let s = this,
      { wrapperEl: e, rtlTranslate: t, enabled: i } = s;
    if (!i) return;
    (s.previousTranslate = s.translate),
      s.isHorizontal() ? (s.translate = -e.scrollLeft) : (s.translate = -e.scrollTop),
      s.translate === 0 && (s.translate = 0),
      s.updateActiveIndex(),
      s.updateSlidesClasses();
    let a,
      r = s.maxTranslate() - s.minTranslate();
    r === 0 ? (a = 0) : (a = (s.translate - s.minTranslate()) / r),
      a !== s.progress && s.updateProgress(t ? -s.translate : s.translate),
      s.emit('setTranslate', s.translate, !1);
  }
  function Bt(s) {
    let e = this;
    te(e, s.target),
      !(e.params.cssMode || (e.params.slidesPerView !== 'auto' && !e.params.autoHeight)) &&
        e.update();
  }
  function Rt() {
    let s = this;
    s.documentTouchHandlerProceeded ||
      ((s.documentTouchHandlerProceeded = !0),
      s.params.touchReleaseOnEdges && (s.el.style.touchAction = 'auto'));
  }
  var Oe = (s, e) => {
    let t = O(),
      { params: i, el: a, wrapperEl: r, device: o } = s,
      l = !!i.nested,
      n = e === 'on' ? 'addEventListener' : 'removeEventListener',
      d = e;
    !a ||
      typeof a == 'string' ||
      (t[n]('touchstart', s.onDocumentTouchStart, { passive: !1, capture: l }),
      a[n]('touchstart', s.onTouchStart, { passive: !1 }),
      a[n]('pointerdown', s.onTouchStart, { passive: !1 }),
      t[n]('touchmove', s.onTouchMove, { passive: !1, capture: l }),
      t[n]('pointermove', s.onTouchMove, { passive: !1, capture: l }),
      t[n]('touchend', s.onTouchEnd, { passive: !0 }),
      t[n]('pointerup', s.onTouchEnd, { passive: !0 }),
      t[n]('pointercancel', s.onTouchEnd, { passive: !0 }),
      t[n]('touchcancel', s.onTouchEnd, { passive: !0 }),
      t[n]('pointerout', s.onTouchEnd, { passive: !0 }),
      t[n]('pointerleave', s.onTouchEnd, { passive: !0 }),
      t[n]('contextmenu', s.onTouchEnd, { passive: !0 }),
      (i.preventClicks || i.preventClicksPropagation) && a[n]('click', s.onClick, !0),
      i.cssMode && r[n]('scroll', s.onScroll),
      i.updateOnWindowResize
        ? s[d](
            o.ios || o.android
              ? 'resize orientationchange observerUpdate'
              : 'resize observerUpdate',
            Le,
            !0
          )
        : s[d]('observerUpdate', Le, !0),
      a[n]('load', s.onLoad, { capture: !0 }));
  };
  function Xt() {
    let s = this,
      { params: e } = s;
    (s.onTouchStart = $t.bind(s)),
      (s.onTouchMove = Ot.bind(s)),
      (s.onTouchEnd = kt.bind(s)),
      (s.onDocumentTouchStart = Rt.bind(s)),
      e.cssMode && (s.onScroll = Ht.bind(s)),
      (s.onClick = Gt.bind(s)),
      (s.onLoad = Bt.bind(s)),
      Oe(s, 'on');
  }
  function Vt() {
    Oe(this, 'off');
  }
  var Nt = { attachEvents: Xt, detachEvents: Vt },
    Ie = (s, e) => s.grid && e.grid && e.grid.rows > 1;
  function Yt() {
    let s = this,
      { realIndex: e, initialized: t, params: i, el: a } = s,
      r = i.breakpoints;
    if (!r || (r && Object.keys(r).length === 0)) return;
    let o = s.getBreakpoint(r, s.params.breakpointsBase, s.el);
    if (!o || s.currentBreakpoint === o) return;
    let n = (o in r ? r[o] : void 0) || s.originalParams,
      d = Ie(s, i),
      c = Ie(s, n),
      f = s.params.grabCursor,
      u = n.grabCursor,
      p = i.enabled;
    d && !c
      ? (a.classList.remove(
          `${i.containerModifierClass}grid`,
          `${i.containerModifierClass}grid-column`
        ),
        s.emitContainerClasses())
      : !d &&
        c &&
        (a.classList.add(`${i.containerModifierClass}grid`),
        ((n.grid.fill && n.grid.fill === 'column') || (!n.grid.fill && i.grid.fill === 'column')) &&
          a.classList.add(`${i.containerModifierClass}grid-column`),
        s.emitContainerClasses()),
      f && !u ? s.unsetGrabCursor() : !f && u && s.setGrabCursor(),
      ['navigation', 'pagination', 'scrollbar'].forEach((m) => {
        if (typeof n[m] > 'u') return;
        let g = i[m] && i[m].enabled,
          x = n[m] && n[m].enabled;
        g && !x && s[m].disable(), !g && x && s[m].enable();
      });
    let h = n.direction && n.direction !== i.direction,
      v = i.loop && (n.slidesPerView !== i.slidesPerView || h),
      E = i.loop;
    h && t && s.changeDirection(), G(s.params, n);
    let y = s.params.enabled,
      T = s.params.loop;
    Object.assign(s, {
      allowTouchMove: s.params.allowTouchMove,
      allowSlideNext: s.params.allowSlideNext,
      allowSlidePrev: s.params.allowSlidePrev,
    }),
      p && !y ? s.disable() : !p && y && s.enable(),
      (s.currentBreakpoint = o),
      s.emit('_beforeBreakpoint', n),
      t &&
        (v
          ? (s.loopDestroy(), s.loopCreate(e), s.updateSlides())
          : !E && T
            ? (s.loopCreate(e), s.updateSlides())
            : E && !T && s.loopDestroy()),
      s.emit('breakpoint', n);
  }
  function Ft(s, e, t) {
    if ((e === void 0 && (e = 'window'), !s || (e === 'container' && !t))) return;
    let i = !1,
      a = A(),
      r = e === 'window' ? a.innerHeight : t.clientHeight,
      o = Object.keys(s).map((l) => {
        if (typeof l == 'string' && l.indexOf('@') === 0) {
          let n = parseFloat(l.substr(1));
          return { value: r * n, point: l };
        }
        return { value: l, point: l };
      });
    o.sort((l, n) => parseInt(l.value, 10) - parseInt(n.value, 10));
    for (let l = 0; l < o.length; l += 1) {
      let { point: n, value: d } = o[l];
      e === 'window'
        ? a.matchMedia(`(min-width: ${d}px)`).matches && (i = n)
        : d <= t.clientWidth && (i = n);
    }
    return i || 'max';
  }
  var Wt = { setBreakpoint: Yt, getBreakpoint: Ft };
  function _t(s, e) {
    let t = [];
    return (
      s.forEach((i) => {
        typeof i == 'object'
          ? Object.keys(i).forEach((a) => {
              i[a] && t.push(e + a);
            })
          : typeof i == 'string' && t.push(e + i);
      }),
      t
    );
  }
  function qt() {
    let s = this,
      { classNames: e, params: t, rtl: i, el: a, device: r } = s,
      o = _t(
        [
          'initialized',
          t.direction,
          { 'free-mode': s.params.freeMode && t.freeMode.enabled },
          { autoheight: t.autoHeight },
          { rtl: i },
          { grid: t.grid && t.grid.rows > 1 },
          { 'grid-column': t.grid && t.grid.rows > 1 && t.grid.fill === 'column' },
          { android: r.android },
          { ios: r.ios },
          { 'css-mode': t.cssMode },
          { centered: t.cssMode && t.centeredSlides },
          { 'watch-progress': t.watchSlidesProgress },
        ],
        t.containerModifierClass
      );
    e.push(...o), a.classList.add(...e), s.emitContainerClasses();
  }
  function jt() {
    let s = this,
      { el: e, classNames: t } = s;
    !e || typeof e == 'string' || (e.classList.remove(...t), s.emitContainerClasses());
  }
  var Ut = { addClasses: qt, removeClasses: jt };
  function Kt() {
    let s = this,
      { isLocked: e, params: t } = s,
      { slidesOffsetBefore: i } = t;
    if (i) {
      let a = s.slides.length - 1,
        r = s.slidesGrid[a] + s.slidesSizesGrid[a] + i * 2;
      s.isLocked = s.size > r;
    } else s.isLocked = s.snapGrid.length === 1;
    t.allowSlideNext === !0 && (s.allowSlideNext = !s.isLocked),
      t.allowSlidePrev === !0 && (s.allowSlidePrev = !s.isLocked),
      e && e !== s.isLocked && (s.isEnd = !1),
      e !== s.isLocked && s.emit(s.isLocked ? 'lock' : 'unlock');
  }
  var Zt = { checkOverflow: Kt },
    Ae = {
      init: !0,
      direction: 'horizontal',
      oneWayMovement: !1,
      swiperElementNodeName: 'SWIPER-CONTAINER',
      touchEventsTarget: 'wrapper',
      initialSlide: 0,
      speed: 300,
      cssMode: !1,
      updateOnWindowResize: !0,
      resizeObserver: !0,
      nested: !1,
      createElements: !1,
      eventsPrefix: 'swiper',
      enabled: !0,
      focusableElements: 'input, select, option, textarea, button, video, label',
      width: null,
      height: null,
      preventInteractionOnTransition: !1,
      userAgent: null,
      url: null,
      edgeSwipeDetection: !1,
      edgeSwipeThreshold: 20,
      autoHeight: !1,
      setWrapperSize: !1,
      virtualTranslate: !1,
      effect: 'slide',
      breakpoints: void 0,
      breakpointsBase: 'window',
      spaceBetween: 0,
      slidesPerView: 1,
      slidesPerGroup: 1,
      slidesPerGroupSkip: 0,
      slidesPerGroupAuto: !1,
      centeredSlides: !1,
      centeredSlidesBounds: !1,
      slidesOffsetBefore: 0,
      slidesOffsetAfter: 0,
      normalizeSlideIndex: !0,
      centerInsufficientSlides: !1,
      watchOverflow: !0,
      roundLengths: !1,
      touchRatio: 1,
      touchAngle: 45,
      simulateTouch: !0,
      shortSwipes: !0,
      longSwipes: !0,
      longSwipesRatio: 0.5,
      longSwipesMs: 300,
      followFinger: !0,
      allowTouchMove: !0,
      threshold: 5,
      touchMoveStopPropagation: !1,
      touchStartPreventDefault: !0,
      touchStartForcePreventDefault: !1,
      touchReleaseOnEdges: !1,
      uniqueNavElements: !0,
      resistance: !0,
      resistanceRatio: 0.85,
      watchSlidesProgress: !1,
      grabCursor: !1,
      preventClicks: !0,
      preventClicksPropagation: !0,
      slideToClickedSlide: !1,
      loop: !1,
      loopAddBlankSlides: !0,
      loopAdditionalSlides: 0,
      loopPreventsSliding: !0,
      rewind: !1,
      allowSlidePrev: !0,
      allowSlideNext: !0,
      swipeHandler: null,
      noSwiping: !0,
      noSwipingClass: 'swiper-no-swiping',
      noSwipingSelector: null,
      passiveListeners: !0,
      maxBackfaceHiddenSlides: 10,
      containerModifierClass: 'swiper-',
      slideClass: 'swiper-slide',
      slideBlankClass: 'swiper-slide-blank',
      slideActiveClass: 'swiper-slide-active',
      slideVisibleClass: 'swiper-slide-visible',
      slideFullyVisibleClass: 'swiper-slide-fully-visible',
      slideNextClass: 'swiper-slide-next',
      slidePrevClass: 'swiper-slide-prev',
      wrapperClass: 'swiper-wrapper',
      lazyPreloaderClass: 'swiper-lazy-preloader',
      lazyPreloadPrevNext: 0,
      runCallbacksOnInit: !0,
      _emitClasses: !1,
    };
  function Qt(s, e) {
    return function (i) {
      i === void 0 && (i = {});
      let a = Object.keys(i)[0],
        r = i[a];
      if (typeof r != 'object' || r === null) {
        G(e, i);
        return;
      }
      if (
        (s[a] === !0 && (s[a] = { enabled: !0 }),
        a === 'navigation' &&
          s[a] &&
          s[a].enabled &&
          !s[a].prevEl &&
          !s[a].nextEl &&
          (s[a].auto = !0),
        ['pagination', 'scrollbar'].indexOf(a) >= 0 &&
          s[a] &&
          s[a].enabled &&
          !s[a].el &&
          (s[a].auto = !0),
        !(a in s && 'enabled' in r))
      ) {
        G(e, i);
        return;
      }
      typeof s[a] == 'object' && !('enabled' in s[a]) && (s[a].enabled = !0),
        s[a] || (s[a] = { enabled: !1 }),
        G(e, i);
    };
  }
  var ue = {
      eventsEmitter: Ue,
      update: nt,
      translate: ut,
      transition: gt,
      slide: Tt,
      loop: Lt,
      grabCursor: zt,
      events: Nt,
      breakpoints: Wt,
      checkOverflow: Zt,
      classes: Ut,
    },
    pe = {},
    N = class s {
      constructor() {
        let e, t;
        for (var i = arguments.length, a = new Array(i), r = 0; r < i; r++) a[r] = arguments[r];
        a.length === 1 &&
        a[0].constructor &&
        Object.prototype.toString.call(a[0]).slice(8, -1) === 'Object'
          ? (t = a[0])
          : ([e, t] = a),
          t || (t = {}),
          (t = G({}, t)),
          e && !t.el && (t.el = e);
        let o = O();
        if (t.el && typeof t.el == 'string' && o.querySelectorAll(t.el).length > 1) {
          let c = [];
          return (
            o.querySelectorAll(t.el).forEach((f) => {
              let u = G({}, t, { el: f });
              c.push(new s(u));
            }),
            c
          );
        }
        let l = this;
        (l.__swiper__ = !0),
          (l.support = ze()),
          (l.device = De({ userAgent: t.userAgent })),
          (l.browser = _e()),
          (l.eventsListeners = {}),
          (l.eventsAnyListeners = []),
          (l.modules = [...l.__modules__]),
          t.modules && Array.isArray(t.modules) && l.modules.push(...t.modules);
        let n = {};
        l.modules.forEach((c) => {
          c({
            params: t,
            swiper: l,
            extendParams: Qt(t, n),
            on: l.on.bind(l),
            once: l.once.bind(l),
            off: l.off.bind(l),
            emit: l.emit.bind(l),
          });
        });
        let d = G({}, Ae, n);
        return (
          (l.params = G({}, d, pe, t)),
          (l.originalParams = G({}, l.params)),
          (l.passedParams = G({}, t)),
          l.params &&
            l.params.on &&
            Object.keys(l.params.on).forEach((c) => {
              l.on(c, l.params.on[c]);
            }),
          l.params && l.params.onAny && l.onAny(l.params.onAny),
          Object.assign(l, {
            enabled: l.params.enabled,
            el: e,
            classNames: [],
            slides: [],
            slidesGrid: [],
            snapGrid: [],
            slidesSizesGrid: [],
            isHorizontal() {
              return l.params.direction === 'horizontal';
            },
            isVertical() {
              return l.params.direction === 'vertical';
            },
            activeIndex: 0,
            realIndex: 0,
            isBeginning: !0,
            isEnd: !1,
            translate: 0,
            previousTranslate: 0,
            progress: 0,
            velocity: 0,
            animating: !1,
            cssOverflowAdjustment() {
              return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
            },
            allowSlideNext: l.params.allowSlideNext,
            allowSlidePrev: l.params.allowSlidePrev,
            touchEventsData: {
              isTouched: void 0,
              isMoved: void 0,
              allowTouchCallbacks: void 0,
              touchStartTime: void 0,
              isScrolling: void 0,
              currentTranslate: void 0,
              startTranslate: void 0,
              allowThresholdMove: void 0,
              focusableElements: l.params.focusableElements,
              lastClickTime: 0,
              clickTimeout: void 0,
              velocities: [],
              allowMomentumBounce: void 0,
              startMoving: void 0,
              pointerId: null,
              touchId: null,
            },
            allowClick: !0,
            allowTouchMove: l.params.allowTouchMove,
            touches: { startX: 0, startY: 0, currentX: 0, currentY: 0, diff: 0 },
            imagesToLoad: [],
            imagesLoaded: 0,
          }),
          l.emit('_swiper'),
          l.params.init && l.init(),
          l
        );
      }
      getDirectionLabel(e) {
        return this.isHorizontal()
          ? e
          : {
              width: 'height',
              'margin-top': 'margin-left',
              'margin-bottom ': 'margin-right',
              'margin-left': 'margin-top',
              'margin-right': 'margin-bottom',
              'padding-left': 'padding-top',
              'padding-right': 'padding-bottom',
              marginRight: 'marginBottom',
            }[e];
      }
      getSlideIndex(e) {
        let { slidesEl: t, params: i } = this,
          a = k(t, `.${i.slideClass}, swiper-slide`),
          r = Z(a[0]);
        return Z(e) - r;
      }
      getSlideIndexByData(e) {
        return this.getSlideIndex(
          this.slides.filter((t) => t.getAttribute('data-swiper-slide-index') * 1 === e)[0]
        );
      }
      recalcSlides() {
        let e = this,
          { slidesEl: t, params: i } = e;
        e.slides = k(t, `.${i.slideClass}, swiper-slide`);
      }
      enable() {
        let e = this;
        e.enabled || ((e.enabled = !0), e.params.grabCursor && e.setGrabCursor(), e.emit('enable'));
      }
      disable() {
        let e = this;
        e.enabled &&
          ((e.enabled = !1), e.params.grabCursor && e.unsetGrabCursor(), e.emit('disable'));
      }
      setProgress(e, t) {
        let i = this;
        e = Math.min(Math.max(e, 0), 1);
        let a = i.minTranslate(),
          o = (i.maxTranslate() - a) * e + a;
        i.translateTo(o, typeof t > 'u' ? 0 : t), i.updateActiveIndex(), i.updateSlidesClasses();
      }
      emitContainerClasses() {
        let e = this;
        if (!e.params._emitClasses || !e.el) return;
        let t = e.el.className
          .split(' ')
          .filter(
            (i) => i.indexOf('swiper') === 0 || i.indexOf(e.params.containerModifierClass) === 0
          );
        e.emit('_containerClasses', t.join(' '));
      }
      getSlideClasses(e) {
        let t = this;
        return t.destroyed
          ? ''
          : e.className
              .split(' ')
              .filter(
                (i) => i.indexOf('swiper-slide') === 0 || i.indexOf(t.params.slideClass) === 0
              )
              .join(' ');
      }
      emitSlidesClasses() {
        let e = this;
        if (!e.params._emitClasses || !e.el) return;
        let t = [];
        e.slides.forEach((i) => {
          let a = e.getSlideClasses(i);
          t.push({ slideEl: i, classNames: a }), e.emit('_slideClass', i, a);
        }),
          e.emit('_slideClasses', t);
      }
      slidesPerViewDynamic(e, t) {
        e === void 0 && (e = 'current'), t === void 0 && (t = !1);
        let i = this,
          { params: a, slides: r, slidesGrid: o, slidesSizesGrid: l, size: n, activeIndex: d } = i,
          c = 1;
        if (typeof a.slidesPerView == 'number') return a.slidesPerView;
        if (a.centeredSlides) {
          let f = r[d] ? Math.ceil(r[d].swiperSlideSize) : 0,
            u;
          for (let p = d + 1; p < r.length; p += 1)
            r[p] && !u && ((f += Math.ceil(r[p].swiperSlideSize)), (c += 1), f > n && (u = !0));
          for (let p = d - 1; p >= 0; p -= 1)
            r[p] && !u && ((f += r[p].swiperSlideSize), (c += 1), f > n && (u = !0));
        } else if (e === 'current')
          for (let f = d + 1; f < r.length; f += 1)
            (t ? o[f] + l[f] - o[d] < n : o[f] - o[d] < n) && (c += 1);
        else for (let f = d - 1; f >= 0; f -= 1) o[d] - o[f] < n && (c += 1);
        return c;
      }
      update() {
        let e = this;
        if (!e || e.destroyed) return;
        let { snapGrid: t, params: i } = e;
        i.breakpoints && e.setBreakpoint(),
          [...e.el.querySelectorAll('[loading="lazy"]')].forEach((o) => {
            o.complete && te(e, o);
          }),
          e.updateSize(),
          e.updateSlides(),
          e.updateProgress(),
          e.updateSlidesClasses();
        function a() {
          let o = e.rtlTranslate ? e.translate * -1 : e.translate,
            l = Math.min(Math.max(o, e.maxTranslate()), e.minTranslate());
          e.setTranslate(l), e.updateActiveIndex(), e.updateSlidesClasses();
        }
        let r;
        if (i.freeMode && i.freeMode.enabled && !i.cssMode)
          a(), i.autoHeight && e.updateAutoHeight();
        else {
          if ((i.slidesPerView === 'auto' || i.slidesPerView > 1) && e.isEnd && !i.centeredSlides) {
            let o = e.virtual && i.virtual.enabled ? e.virtual.slides : e.slides;
            r = e.slideTo(o.length - 1, 0, !1, !0);
          } else r = e.slideTo(e.activeIndex, 0, !1, !0);
          r || a();
        }
        i.watchOverflow && t !== e.snapGrid && e.checkOverflow(), e.emit('update');
      }
      changeDirection(e, t) {
        t === void 0 && (t = !0);
        let i = this,
          a = i.params.direction;
        return (
          e || (e = a === 'horizontal' ? 'vertical' : 'horizontal'),
          e === a ||
            (e !== 'horizontal' && e !== 'vertical') ||
            (i.el.classList.remove(`${i.params.containerModifierClass}${a}`),
            i.el.classList.add(`${i.params.containerModifierClass}${e}`),
            i.emitContainerClasses(),
            (i.params.direction = e),
            i.slides.forEach((r) => {
              e === 'vertical' ? (r.style.width = '') : (r.style.height = '');
            }),
            i.emit('changeDirection'),
            t && i.update()),
          i
        );
      }
      changeLanguageDirection(e) {
        let t = this;
        (t.rtl && e === 'rtl') ||
          (!t.rtl && e === 'ltr') ||
          ((t.rtl = e === 'rtl'),
          (t.rtlTranslate = t.params.direction === 'horizontal' && t.rtl),
          t.rtl
            ? (t.el.classList.add(`${t.params.containerModifierClass}rtl`), (t.el.dir = 'rtl'))
            : (t.el.classList.remove(`${t.params.containerModifierClass}rtl`), (t.el.dir = 'ltr')),
          t.update());
      }
      mount(e) {
        let t = this;
        if (t.mounted) return !0;
        let i = e || t.params.el;
        if ((typeof i == 'string' && (i = document.querySelector(i)), !i)) return !1;
        (i.swiper = t),
          i.parentNode &&
            i.parentNode.host &&
            i.parentNode.host.nodeName === t.params.swiperElementNodeName.toUpperCase() &&
            (t.isElement = !0);
        let a = () => `.${(t.params.wrapperClass || '').trim().split(' ').join('.')}`,
          o =
            i && i.shadowRoot && i.shadowRoot.querySelector
              ? i.shadowRoot.querySelector(a())
              : k(i, a())[0];
        return (
          !o &&
            t.params.createElements &&
            ((o = R('div', t.params.wrapperClass)),
            i.append(o),
            k(i, `.${t.params.slideClass}`).forEach((l) => {
              o.append(l);
            })),
          Object.assign(t, {
            el: i,
            wrapperEl: o,
            slidesEl: t.isElement && !i.parentNode.host.slideSlots ? i.parentNode.host : o,
            hostEl: t.isElement ? i.parentNode.host : i,
            mounted: !0,
            rtl: i.dir.toLowerCase() === 'rtl' || V(i, 'direction') === 'rtl',
            rtlTranslate:
              t.params.direction === 'horizontal' &&
              (i.dir.toLowerCase() === 'rtl' || V(i, 'direction') === 'rtl'),
            wrongRTL: V(o, 'display') === '-webkit-box',
          }),
          !0
        );
      }
      init(e) {
        let t = this;
        if (t.initialized || t.mount(e) === !1) return t;
        t.emit('beforeInit'),
          t.params.breakpoints && t.setBreakpoint(),
          t.addClasses(),
          t.updateSize(),
          t.updateSlides(),
          t.params.watchOverflow && t.checkOverflow(),
          t.params.grabCursor && t.enabled && t.setGrabCursor(),
          t.params.loop && t.virtual && t.params.virtual.enabled
            ? t.slideTo(
                t.params.initialSlide + t.virtual.slidesBefore,
                0,
                t.params.runCallbacksOnInit,
                !1,
                !0
              )
            : t.slideTo(t.params.initialSlide, 0, t.params.runCallbacksOnInit, !1, !0),
          t.params.loop && t.loopCreate(),
          t.attachEvents();
        let a = [...t.el.querySelectorAll('[loading="lazy"]')];
        return (
          t.isElement && a.push(...t.hostEl.querySelectorAll('[loading="lazy"]')),
          a.forEach((r) => {
            r.complete
              ? te(t, r)
              : r.addEventListener('load', (o) => {
                  te(t, o.target);
                });
          }),
          me(t),
          (t.initialized = !0),
          me(t),
          t.emit('init'),
          t.emit('afterInit'),
          t
        );
      }
      destroy(e, t) {
        e === void 0 && (e = !0), t === void 0 && (t = !0);
        let i = this,
          { params: a, el: r, wrapperEl: o, slides: l } = i;
        return (
          typeof i.params > 'u' ||
            i.destroyed ||
            (i.emit('beforeDestroy'),
            (i.initialized = !1),
            i.detachEvents(),
            a.loop && i.loopDestroy(),
            t &&
              (i.removeClasses(),
              r && typeof r != 'string' && r.removeAttribute('style'),
              o && o.removeAttribute('style'),
              l &&
                l.length &&
                l.forEach((n) => {
                  n.classList.remove(
                    a.slideVisibleClass,
                    a.slideFullyVisibleClass,
                    a.slideActiveClass,
                    a.slideNextClass,
                    a.slidePrevClass
                  ),
                    n.removeAttribute('style'),
                    n.removeAttribute('data-swiper-slide-index');
                })),
            i.emit('destroy'),
            Object.keys(i.eventsListeners).forEach((n) => {
              i.off(n);
            }),
            e !== !1 && (i.el && typeof i.el != 'string' && (i.el.swiper = null), Ee(i)),
            (i.destroyed = !0)),
          null
        );
      }
      static extendDefaults(e) {
        G(pe, e);
      }
      static get extendedDefaults() {
        return pe;
      }
      static get defaults() {
        return Ae;
      }
      static installModule(e) {
        s.prototype.__modules__ || (s.prototype.__modules__ = []);
        let t = s.prototype.__modules__;
        typeof e == 'function' && t.indexOf(e) < 0 && t.push(e);
      }
      static use(e) {
        return Array.isArray(e)
          ? (e.forEach((t) => s.installModule(t)), s)
          : (s.installModule(e), s);
      }
    };
  Object.keys(ue).forEach((s) => {
    Object.keys(ue[s]).forEach((e) => {
      N.prototype[e] = ue[s][e];
    });
  });
  N.use([qe, je]);
  function he(s) {
    let { swiper: e, extendParams: t, on: i, emit: a } = s,
      r = O(),
      o = A();
    (e.keyboard = { enabled: !1 }),
      t({ keyboard: { enabled: !1, onlyInViewport: !0, pageUpDown: !0 } });
    function l(c) {
      if (!e.enabled) return;
      let { rtlTranslate: f } = e,
        u = c;
      u.originalEvent && (u = u.originalEvent);
      let p = u.keyCode || u.charCode,
        h = e.params.keyboard.pageUpDown,
        v = h && p === 33,
        E = h && p === 34,
        y = p === 37,
        T = p === 39,
        m = p === 38,
        g = p === 40;
      if (
        (!e.allowSlideNext && ((e.isHorizontal() && T) || (e.isVertical() && g) || E)) ||
        (!e.allowSlidePrev && ((e.isHorizontal() && y) || (e.isVertical() && m) || v))
      )
        return !1;
      if (
        !(u.shiftKey || u.altKey || u.ctrlKey || u.metaKey) &&
        !(
          r.activeElement &&
          r.activeElement.nodeName &&
          (r.activeElement.nodeName.toLowerCase() === 'input' ||
            r.activeElement.nodeName.toLowerCase() === 'textarea')
        )
      ) {
        if (e.params.keyboard.onlyInViewport && (v || E || y || T || m || g)) {
          let x = !1;
          if (
            Y(e.el, `.${e.params.slideClass}, swiper-slide`).length > 0 &&
            Y(e.el, `.${e.params.slideActiveClass}`).length === 0
          )
            return;
          let C = e.el,
            D = C.clientWidth,
            L = C.clientHeight,
            I = o.innerWidth,
            w = o.innerHeight,
            S = J(C);
          f && (S.left -= C.scrollLeft);
          let M = [
            [S.left, S.top],
            [S.left + D, S.top],
            [S.left, S.top + L],
            [S.left + D, S.top + L],
          ];
          for (let b = 0; b < M.length; b += 1) {
            let P = M[b];
            if (P[0] >= 0 && P[0] <= I && P[1] >= 0 && P[1] <= w) {
              if (P[0] === 0 && P[1] === 0) continue;
              x = !0;
            }
          }
          if (!x) return;
        }
        e.isHorizontal()
          ? ((v || E || y || T) && (u.preventDefault ? u.preventDefault() : (u.returnValue = !1)),
            (((E || T) && !f) || ((v || y) && f)) && e.slideNext(),
            (((v || y) && !f) || ((E || T) && f)) && e.slidePrev())
          : ((v || E || m || g) && (u.preventDefault ? u.preventDefault() : (u.returnValue = !1)),
            (E || g) && e.slideNext(),
            (v || m) && e.slidePrev()),
          a('keyPress', p);
      }
    }
    function n() {
      e.keyboard.enabled || (r.addEventListener('keydown', l), (e.keyboard.enabled = !0));
    }
    function d() {
      e.keyboard.enabled && (r.removeEventListener('keydown', l), (e.keyboard.enabled = !1));
    }
    i('init', () => {
      e.params.keyboard.enabled && n();
    }),
      i('destroy', () => {
        e.keyboard.enabled && d();
      }),
      Object.assign(e.keyboard, { enable: n, disable: d });
  }
  function ge(s) {
    let { swiper: e, extendParams: t, on: i, emit: a } = s,
      r = A();
    t({
      mousewheel: {
        enabled: !1,
        releaseOnEdges: !1,
        invert: !1,
        forceToAxis: !1,
        sensitivity: 1,
        eventsTarget: 'container',
        thresholdDelta: null,
        thresholdTime: null,
        noMousewheelClass: 'swiper-no-mousewheel',
      },
    }),
      (e.mousewheel = { enabled: !1 });
    let o,
      l = H(),
      n,
      d = [];
    function c(m) {
      let D = 0,
        L = 0,
        I = 0,
        w = 0;
      return (
        'detail' in m && (L = m.detail),
        'wheelDelta' in m && (L = -m.wheelDelta / 120),
        'wheelDeltaY' in m && (L = -m.wheelDeltaY / 120),
        'wheelDeltaX' in m && (D = -m.wheelDeltaX / 120),
        'axis' in m && m.axis === m.HORIZONTAL_AXIS && ((D = L), (L = 0)),
        (I = D * 10),
        (w = L * 10),
        'deltaY' in m && (w = m.deltaY),
        'deltaX' in m && (I = m.deltaX),
        m.shiftKey && !I && ((I = w), (w = 0)),
        (I || w) &&
          m.deltaMode &&
          (m.deltaMode === 1 ? ((I *= 40), (w *= 40)) : ((I *= 800), (w *= 800))),
        I && !D && (D = I < 1 ? -1 : 1),
        w && !L && (L = w < 1 ? -1 : 1),
        { spinX: D, spinY: L, pixelX: I, pixelY: w }
      );
    }
    function f() {
      e.enabled && (e.mouseEntered = !0);
    }
    function u() {
      e.enabled && (e.mouseEntered = !1);
    }
    function p(m) {
      return (e.params.mousewheel.thresholdDelta && m.delta < e.params.mousewheel.thresholdDelta) ||
        (e.params.mousewheel.thresholdTime && H() - l < e.params.mousewheel.thresholdTime)
        ? !1
        : m.delta >= 6 && H() - l < 60
          ? !0
          : (m.direction < 0
              ? (!e.isEnd || e.params.loop) && !e.animating && (e.slideNext(), a('scroll', m.raw))
              : (!e.isBeginning || e.params.loop) &&
                !e.animating &&
                (e.slidePrev(), a('scroll', m.raw)),
            (l = new r.Date().getTime()),
            !1);
    }
    function h(m) {
      let g = e.params.mousewheel;
      if (m.direction < 0) {
        if (e.isEnd && !e.params.loop && g.releaseOnEdges) return !0;
      } else if (e.isBeginning && !e.params.loop && g.releaseOnEdges) return !0;
      return !1;
    }
    function v(m) {
      let g = m,
        x = !0;
      if (!e.enabled || m.target.closest(`.${e.params.mousewheel.noMousewheelClass}`)) return;
      let C = e.params.mousewheel;
      e.params.cssMode && g.preventDefault();
      let D = e.el;
      e.params.mousewheel.eventsTarget !== 'container' &&
        (D = document.querySelector(e.params.mousewheel.eventsTarget));
      let L = D && D.contains(g.target);
      if (!e.mouseEntered && !L && !C.releaseOnEdges) return !0;
      g.originalEvent && (g = g.originalEvent);
      let I = 0,
        w = e.rtlTranslate ? -1 : 1,
        S = c(g);
      if (C.forceToAxis)
        if (e.isHorizontal())
          if (Math.abs(S.pixelX) > Math.abs(S.pixelY)) I = -S.pixelX * w;
          else return !0;
        else if (Math.abs(S.pixelY) > Math.abs(S.pixelX)) I = -S.pixelY;
        else return !0;
      else I = Math.abs(S.pixelX) > Math.abs(S.pixelY) ? -S.pixelX * w : -S.pixelY;
      if (I === 0) return !0;
      C.invert && (I = -I);
      let M = e.getTranslate() + I * C.sensitivity;
      if (
        (M >= e.minTranslate() && (M = e.minTranslate()),
        M <= e.maxTranslate() && (M = e.maxTranslate()),
        (x = e.params.loop ? !0 : !(M === e.minTranslate() || M === e.maxTranslate())),
        x && e.params.nested && g.stopPropagation(),
        !e.params.freeMode || !e.params.freeMode.enabled)
      ) {
        let b = { time: H(), delta: Math.abs(I), direction: Math.sign(I), raw: m };
        d.length >= 2 && d.shift();
        let P = d.length ? d[d.length - 1] : void 0;
        if (
          (d.push(b),
          P
            ? (b.direction !== P.direction || b.delta > P.delta || b.time > P.time + 150) && p(b)
            : p(b),
          h(b))
        )
          return !0;
      } else {
        let b = { time: H(), delta: Math.abs(I), direction: Math.sign(I) },
          P = n && b.time < n.time + 500 && b.delta <= n.delta && b.direction === n.direction;
        if (!P) {
          n = void 0;
          let z = e.getTranslate() + I * C.sensitivity,
            B = e.isBeginning,
            ie = e.isEnd;
          if (
            (z >= e.minTranslate() && (z = e.minTranslate()),
            z <= e.maxTranslate() && (z = e.maxTranslate()),
            e.setTransition(0),
            e.setTranslate(z),
            e.updateProgress(),
            e.updateActiveIndex(),
            e.updateSlidesClasses(),
            ((!B && e.isBeginning) || (!ie && e.isEnd)) && e.updateSlidesClasses(),
            e.params.loop &&
              e.loopFix({ direction: b.direction < 0 ? 'next' : 'prev', byMousewheel: !0 }),
            e.params.freeMode.sticky)
          ) {
            clearTimeout(o), (o = void 0), d.length >= 15 && d.shift();
            let F = d.length ? d[d.length - 1] : void 0,
              q = d[0];
            if ((d.push(b), F && (b.delta > F.delta || b.direction !== F.direction))) d.splice(0);
            else if (
              d.length >= 15 &&
              b.time - q.time < 500 &&
              q.delta - b.delta >= 1 &&
              b.delta <= 6
            ) {
              let j = I > 0 ? 0.8 : 0.2;
              (n = b),
                d.splice(0),
                (o = X(() => {
                  e.slideToClosest(e.params.speed, !0, void 0, j);
                }, 0));
            }
            o ||
              (o = X(() => {
                (n = b), d.splice(0), e.slideToClosest(e.params.speed, !0, void 0, 0.5);
              }, 500));
          }
          if (
            (P || a('scroll', g),
            e.params.autoplay && e.params.autoplayDisableOnInteraction && e.autoplay.stop(),
            C.releaseOnEdges && (z === e.minTranslate() || z === e.maxTranslate()))
          )
            return !0;
        }
      }
      return g.preventDefault ? g.preventDefault() : (g.returnValue = !1), !1;
    }
    function E(m) {
      let g = e.el;
      e.params.mousewheel.eventsTarget !== 'container' &&
        (g = document.querySelector(e.params.mousewheel.eventsTarget)),
        g[m]('mouseenter', f),
        g[m]('mouseleave', u),
        g[m]('wheel', v);
    }
    function y() {
      return e.params.cssMode
        ? (e.wrapperEl.removeEventListener('wheel', v), !0)
        : e.mousewheel.enabled
          ? !1
          : (E('addEventListener'), (e.mousewheel.enabled = !0), !0);
    }
    function T() {
      return e.params.cssMode
        ? (e.wrapperEl.addEventListener(event, v), !0)
        : e.mousewheel.enabled
          ? (E('removeEventListener'), (e.mousewheel.enabled = !1), !0)
          : !1;
    }
    i('init', () => {
      !e.params.mousewheel.enabled && e.params.cssMode && T(), e.params.mousewheel.enabled && y();
    }),
      i('destroy', () => {
        e.params.cssMode && y(), e.mousewheel.enabled && T();
      }),
      Object.assign(e.mousewheel, { enable: y, disable: T });
  }
  window.Webflow || (window.Webflow = []);
  window.Webflow.push(() => {
    console.log('hello'),
      (testimonialsCarousel = new N('.testimonials_swiper-wrapper', {
        modules: [he, ge],
        wrapperClass: 'testimonials_swiper-list',
        slideClass: 'testimonials_swiper-item',
        direction: 'horizontal',
        spaceBetween: 24,
        slidesPerView: 'auto',
        grabCursor: !0,
        speed: 400,
        keyboard: { enabled: !0, onlyInViewport: !0 },
        mousewheel: { enabled: !0, forceToAxis: !0, releaseOnEdges: !0 },
        on: {
          beforeInit: function () {
            $(this.wrapperEl).css('grid-column-gap', 'unset');
          },
        },
      }));
  });
})();
