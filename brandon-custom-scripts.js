// ==== BRANDON: GLOBAL SPA JS (Native Overlay Support) ====
// Version: 3.8.1 (FIX: Bypassed color extraction for overlay menu to prevent style override)
// Date: 2025-07-01
// Author: Brandon Leach
// Description: Custom animations for Semplice, P5.js backgrounds, and native overlay menu links.

(function() {
  'use strict';

  const BRANDON_DEBUG_MODE = true;

  function logDebug(...args) {
    if (BRANDON_DEBUG_MODE && console && console.log) {
      console.log('[DEBUG]', ...args);
    }
  }

  // ========== CONFIGURATION OBJECTS ==========
  const BRANDON_CONFIG = {
    debug: true,
    grid: {
        subdivisions: 12,
        gapFactor: 8,
        baseDotSize: 1.5,
        dotSpacing: 8,
        cornerOutwardMultiplier: 1.25
    },
    wave: {
        dotColor: [42, 42, 46],
        alphaReveal: 77,
        thickness: 145,
        speed: 247,
        frontRatio: 0.44,
        backRatio: 2.6
    },
    timing: {
        buttonPress: 180,
        dotAnimation: 0.5,
        waveExpansion: 247
    }
  };

  // Cache for grid computations
  const gridCache = new Map();

  function brandonLog(...args) {
    if (BRANDON_CONFIG.debug && window && window.console) {
      console.log('[BRANDON CUSTOM]', ...args);
    }
  }

  function initializeGSAP() {
    if (window.gsap && window.CustomEase && window.SplitText && window.ScrollTrigger) {
      if (!CustomEase.get("circleEase")) {
        CustomEase.create("circleEase", "0.68, -0.55, 0.265, 1.55");
      }
      gsap.registerPlugin(ScrollTrigger);
      return true;
    }
    brandonLog("GSAP or its plugins missing!");
    return false;
  }

  function isElement(el) { return el && el.closest && typeof el.closest === 'function'; }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => { clearTimeout(timeout); func(...args); };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function computeGrid(width, height, gap) {
    const key = `${width}x${height}x${gap}`;
    if (gridCache.has(key)) return gridCache.get(key);
    const cols = Math.ceil(width / gap);
    const rows = Math.ceil(height / gap);
    const dots = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        dots.push({ x: i * gap + gap / 2, y: j * gap + gap / 2 });
      }
    }
    gridCache.set(key, dots);
    return dots;
  }

  // ========== EXISTING BUTTON HANDLERS ==========
  function initializeButtonHandlers() {
    if (window._brandonNavBtnHandlersInitialized) {
        logDebug('Button handlers already initialized. Skipping.');
        return;
    }
    window._brandonNavBtnHandlersInitialized = true;
    logDebug('Initializing button handlers.');

    const buttonSelector = '.brandon-animated-button-reveal, .brandon-logo-reveal-link';
    const workMenuSelector = '.brandon-work-menu-trigger';
    const pressEvents = ['mousedown', 'touchstart', 'keydown'];
    const releaseEvents = ['mouseup', 'mouseleave', 'touchend', 'touchcancel', 'keyup', 'blur'];

    pressEvents.forEach(evt => {
      document.addEventListener(evt, e => {
        const btn = isElement(e.target) ? e.target.closest(buttonSelector) : null;
        if (btn) {
          if (evt === 'keydown' && !['Enter', ' '].includes(e.key)) return;
          btn.classList.add('pressed');
        }
      }, { passive: true, capture: true });
    });

    releaseEvents.forEach(evt => {
      document.addEventListener(evt, e => {
        const btn = isElement(e.target) ? e.target.closest(buttonSelector) : null;
        if (btn) btn.classList.remove('pressed');
      }, { passive: true, capture: true });
    });

    document.addEventListener('click', e => {
      const clickedElement = isElement(e.target) ? e.target : null;
      if (!clickedElement) return;

      const workMenuTriggerElement = clickedElement.closest(workMenuSelector);
      if (workMenuTriggerElement) {
        logDebug('Work menu trigger clicked!');
        e.preventDefault();

        const hamburger = document.querySelector('.open-menu.menu-icon') ||
                          document.querySelector('.hamburger') ||
                          document.querySelector('[data-menu-trigger="open"]');

        if (hamburger) {
          logDebug('Hamburger found, attempting click.');
          hamburger.click();
        } else {
          logDebug('Hamburger not found with common selectors.');
        }
      }
    }, { capture: true });
  }

  let _brandonDotsGridMenuInitialized = false;

  function initializeDotsGridMenu() {
    if (!initializeGSAP()) {
      brandonLog("DOTS: GSAP not ready, skipping.");
      return;
    }
    const menuBtn = document.getElementById('brandonDotsGridMenu');
    if (!menuBtn || _brandonDotsGridMenuInitialized) {
      return;
    }
    _brandonDotsGridMenuInitialized = true;

    const dots = Array.from(menuBtn.querySelectorAll('.brandon-dot'));
    if (dots.length !== 9) {
      return;
    }

    const SPACING = BRANDON_CONFIG.grid.dotSpacing;
    const CORNER_OUTWARD_MULTIPLIER = BRANDON_CONFIG.grid.cornerOutwardMultiplier;
    const CORNER_TARGET_ABS_POS = SPACING * CORNER_OUTWARD_MULTIPLIER;
    const DURATION = BRANDON_CONFIG.timing.dotAnimation;
    let isOpen = false;

    dots.forEach((dot, i) => {
      gsap.set(dot, {
        x: (i % 3) * SPACING - SPACING,
        y: Math.floor(i / 3) * SPACING - SPACING,
        transformOrigin: 'center center'
      });
    });

    const xStateProperties = dots.map((dot, i) => {
      switch (i) {
        case 0: return { x: -CORNER_TARGET_ABS_POS, y: -CORNER_TARGET_ABS_POS };
        case 2: return { x:  CORNER_TARGET_ABS_POS, y: -CORNER_TARGET_ABS_POS };
        case 6: return { x: -CORNER_TARGET_ABS_POS, y:  CORNER_TARGET_ABS_POS };
        case 8: return { x:  CORNER_TARGET_ABS_POS, y:  CORNER_TARGET_ABS_POS };
        default: return { x: 0, y: 0 };
      }
    });

    const masterTimeline = gsap.timeline({ paused: true });
    dots.forEach((dot, i) => {
      masterTimeline.to(dot, { ...xStateProperties[i], duration: DURATION, ease: "circleEase" }, 0);
    });

    menuBtn.addEventListener('click', () => {
      isOpen = !isOpen;
      isOpen ? masterTimeline.play() : masterTimeline.reverse();
    });
  }

  function initializeSmoothScrollHandlers() {
    if (window._brandonSmoothScrollInitialized) {
      return;
    }
    window._brandonSmoothScrollInitialized = true;

    document.querySelectorAll('a.brandon-animated-button-reveal[href^="#"], a.brandon-logo-reveal-link[href^="#"]').forEach(link => {
      link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function getResponsiveGridSettings(canvasWidth) {
    if (canvasWidth < 600)  return { DOT_GAP: 16, BASE_DOT_SIZE: 2 };
    if (canvasWidth < 1440) return { DOT_GAP: 12, BASE_DOT_SIZE: 1.5 };
    return { DOT_GAP: 16, BASE_DOT_SIZE: 2 };
  }

  // ========== OPTIMIZED P5.js BACKGROUND FUNCTIONS ==========
  function createHazeBackgroundSketchFactory(dotColor, bgColor) {
    return (p) => {
        const BLOB_SCALE = 0.005, THRESHOLD = 0.64, FADE_RANGE = 0.17, ANIM_SPEED = 0.0002;
        let DOT_GAP, BASE_DOT_SIZE, dotsArr = [];
        let lastNoiseUpdate = 0;
        const NOISE_UPDATE_INTERVAL = 50;
        function alphaRamp(x) {
            const t = Math.max(0, Math.min(1, x));
            return t * t * (3 - 2 * t);
        }
        function updateNoiseField() {
            const now = p.millis();
            if (now - lastNoiseUpdate < NOISE_UPDATE_INTERVAL) return;
            lastNoiseUpdate = now;
            const t = now * ANIM_SPEED;
            dotsArr.forEach(dot => {
                const nx = dot.x * BLOB_SCALE, ny = dot.y * BLOB_SCALE;
                dot.field = 0.7 * p.noise(nx, ny, t)
                          + 0.25 * p.noise(nx * 0.6, ny * 0.6, t * 1.7 + 99)
                          + 0.13 * p.noise(nx * 2.0, ny * 2.0, t * 0.8 - 7);
            });
        }
        p.setup = function() {
            const container = p.canvas.parentElement;
            p.createCanvas(container.offsetWidth, container.offsetHeight).style('pointer-events', 'none');
            p.noStroke();
            ({ DOT_GAP, BASE_DOT_SIZE } = getResponsiveGridSettings(p.width));
            dotsArr = computeGrid(p.width, p.height, DOT_GAP).map(dot => ({ ...dot, field: 0 }));
            p.loop();
        };
        p.draw = function() {
            p.background(bgColor);
            updateNoiseField();
            const batches = new Map();
            dotsArr.forEach(dot => {
                const rawAlpha = (dot.field - (THRESHOLD - FADE_RANGE)) / (2 * FADE_RANGE);
                const alpha = alphaRamp(rawAlpha);
                if (alpha > 0.02) {
                    const alphaKey = Math.round(alpha * 10) / 10;
                    if (!batches.has(alphaKey)) batches.set(alphaKey, []);
                    batches.get(alphaKey).push(dot);
                }
            });
            batches.forEach((dots, alpha) => {
                p.fill(...dotColor, alpha * 255);
                dots.forEach(dot => {
                    p.ellipse(dot.x, dot.y, BASE_DOT_SIZE * 1.5, BASE_DOT_SIZE * 1.5);
                });
            });
        };
        p.windowResized = debounce(function() {
            const container = p.canvas.parentElement;
            if (!container || !container.offsetWidth || !container.offsetHeight) return;
            p.resizeCanvas(container.offsetWidth, container.offsetHeight);
            ({ DOT_GAP, BASE_DOT_SIZE } = getResponsiveGridSettings(p.width));
            dotsArr = computeGrid(p.width, p.height, DOT_GAP).map(dot => ({ ...dot, field: 0 }));
            if (p.isLooping()) p.redraw();
        }, 150);
    };
  }
  const createHazeBackgroundSketch = createHazeBackgroundSketchFactory([77, 77, 84], [14, 14, 16]);
  const createWhiteHazeBackgroundSketch = createHazeBackgroundSketchFactory([158, 158, 167], [242, 242, 243]);
  function createLoadWaveSketch() {
      return (p) => {
          const { dotColor, alphaReveal, thickness, speed, frontRatio, backRatio } = BRANDON_CONFIG.wave;
          const BG_COLOR = [14, 14, 16];
          let dotsArr = [], centerX, centerY, maxDist, startTime;
          let DOT_GAP, BASE_DOT_SIZE;
          p.setup = function() {
              const container = p.canvas.parentElement;
              p.createCanvas(container.offsetWidth, container.offsetHeight).style('pointer-events', 'none');
              p.noStroke();
              ({ DOT_GAP, BASE_DOT_SIZE } = getResponsiveGridSettings(p.width));
              dotsArr = computeGrid(p.width, p.height, DOT_GAP).map(dot => {
                  centerX = p.width / 2;
                  centerY = p.height / 2;
                  return {
                      ...dot,
                      distFromCenter: Math.sqrt((dot.x - centerX) * (dot.x - centerX) + (dot.y - centerY) * (dot.y - centerY)),
                      dx: dot.x - centerX,
                      dy: dot.y - centerY
                  };
              });
              maxDist = Math.sqrt(centerX * centerX + centerY * centerY) + thickness;
              startTime = p.millis();
              p.loop();
          };
          p.draw = function() {
              p.background(BG_COLOR);
              const elapsedSec = (p.millis() - startTime) * 0.001;
              const fullDist = elapsedSec * speed;
              const revealDist = Math.min(fullDist, maxDist);
              const cycleLen = maxDist + thickness;
              const pulseDist = (fullDist % cycleLen);
              const revealedDots = [];
              const pulseDots = new Map();
              const frontRange = thickness * frontRatio;
              const backRange = thickness * backRatio;
              dotsArr.forEach(dot => {
                  if (dot.distFromCenter <= revealDist) {
                      revealedDots.push(dot);
                      const delta = dot.distFromCenter - pulseDist;
                      if (delta >= -backRange && delta <= frontRange) {
                          let pulse = delta > 0 ? 1 - delta / frontRange : 1 - Math.abs(delta) / backRange;
                          pulse = Math.pow(pulse, 0.6);
                          pulse = Math.sin(pulse * Math.PI / 2);
                          if (pulse > 0.01) {
                              let mag = delta >= 0 ? 1 - (delta / frontRange) : 1 - (Math.abs(delta) / backRange) * 0.5;
                              mag = Math.max(0, Math.min(1, mag)) * pulse;
                              const alpha = 0.3 + 0.7 * pulse;
                              const alphaKey = Math.round(alpha * 10) / 10;
                              if (!pulseDots.has(alphaKey)) pulseDots.set(alphaKey, []);
                              let warp = delta >= 0 ? mag * BASE_DOT_SIZE : 0;
                              const ux = dot.dx / (dot.distFromCenter || 1), uy = dot.dy / (dot.distFromCenter || 1);
                              const wx = ux * warp, wy = uy * warp;
                              const size = BASE_DOT_SIZE + BASE_DOT_SIZE * mag;
                              pulseDots.get(alphaKey).push({ x: dot.x + wx, y: dot.y + wy, size: size * 2 });
                          }
                      }
                  }
              });
              if (revealedDots.length > 0) {
                  p.fill(...dotColor, alphaReveal);
                  revealedDots.forEach(dot => {
                      p.ellipse(dot.x, dot.y, BASE_DOT_SIZE * 2, BASE_DOT_SIZE * 2);
                  });
              }
              pulseDots.forEach((dots, alpha) => {
                  p.fill(...dotColor, alpha * 255);
                  dots.forEach(dot => {
                      p.ellipse(dot.x, dot.y, dot.size, dot.size);
                  });
              });
          };
          p.windowResized = debounce(function() {
              const container = p.canvas.parentElement;
              if (!container || !container.offsetWidth || !container.offsetHeight) return;
              p.resizeCanvas(container.offsetWidth, container.offsetHeight);
              ({ DOT_GAP, BASE_DOT_SIZE } = getResponsiveGridSettings(p.width));
              centerX = p.width / 2;
              centerY = p.height / 2;
              dotsArr = computeGrid(p.width, p.height, DOT_GAP).map(dot => ({
                  ...dot,
                  distFromCenter: Math.sqrt((dot.x - centerX) * (dot.x - centerX) + (dot.y - centerY) * (dot.y - centerY)),
                  dx: dot.x - centerX,
                  dy: dot.y - centerY
              }));
              maxDist = Math.sqrt(centerX * centerX + centerY * centerY) + thickness;
              if (p.isLooping()) p.redraw();
          }, 150);
      };
  }
  function createSafeP5Instance(factory, element, label) {
    if (typeof p5 === 'undefined') {
      brandonLog(`P5: Library not loaded. Cannot create sketch "${label}".`);
      return null;
    }
    const existingCanvas = element.querySelector('canvas');
    if (existingCanvas) {
      logDebug(`P5 BG: Removing existing canvas for ${label}.`);
      existingCanvas.remove();
    }
    try {
      const sketch = new p5(factory, element);
      activeP5Instances.push(sketch);
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (sketch && !sketch.isLooping()) sketch.loop();
          } else {
            if (sketch && sketch.isLooping()) sketch.noLoop();
          }
        });
      }, { threshold: 0.01 });
      observer.observe(element);
      return sketch;
    } catch (error) {
      console.error(`P5 error in ${label}:`, error);
      return null;
    }
  }
  function waitForElementSizeAndInit(element, p5Factory, label, maxWaitTime = 3000) {
    const startTime = Date.now();
    function attemptInit() {
      if (!element.isConnected) {
        logDebug(`P5 BG: Element for ${label} not connected to DOM. Skipping init.`);
        return;
      }
      const rect = element.getBoundingClientRect();
      const hasSize = rect.width > 10 && rect.height > 10;
      const hasCanvas = element.querySelector('canvas');
      const timeElapsed = Date.now() - startTime;
      if (hasSize && !hasCanvas) {
        logDebug(`P5 BG: Initializing P5 for ${label} in element size: ${rect.width}x${rect.height}`);
        createSafeP5Instance(p5Factory, element, label);
      } else if (hasCanvas) {
        logDebug(`P5 BG: Canvas for ${label} already exists. Skipping init.`);
        return;
      } else if (timeElapsed < maxWaitTime) {
        setTimeout(attemptInit, 250);
      } else {
        logDebug(`P5 BG: Max wait time for ${label} reached.`);
      }
    }
    attemptInit();
  }
  function injectBackgroundContainers() {
    brandonLog("Starting P5.js background container injection...");
    const sectionConfigs = [
      { sectionClass: 'brandon-bg-load-wave',  bgClass: 'brandon-load-wave',       factory: createLoadWaveSketch(),        label: 'load-wave' },
      { sectionClass: 'brandon-bg-main-bg',    bgClass: 'brandon-main-background', factory: createHazeBackgroundSketch,   label: 'main-background' },
      { sectionClass: 'brandon-bg-main-bg2',   bgClass: 'brandon-main-background2',factory: createWhiteHazeBackgroundSketch, label: 'main-background2' }
    ];
    sectionConfigs.forEach(config => {
      const sections = document.querySelectorAll(`smp-section.${config.sectionClass}`);
      brandonLog(`Found ${sections.length} sections with class ${config.sectionClass}`);
      sections.forEach(section => {
        const smpSectionPin = section.closest('smp-section-pin');
        const targetParent = smpSectionPin || section;
        let backgroundDiv = targetParent.querySelector(`div.${config.bgClass}`);
        if (!backgroundDiv) {
          backgroundDiv = document.createElement('div');
          backgroundDiv.className = config.bgClass;
          if (window.getComputedStyle(targetParent).position === 'static') {
            targetParent.style.position = 'relative';
          }
          targetParent.prepend(backgroundDiv);
        }
        waitForElementSizeAndInit(backgroundDiv, config.factory, config.label);
      });
    });
    brandonLog("P5.js background container injection complete.");
  }

  // ========== FIXED: PROPER SEMPLICE COLOR EXTRACTION ==========
  function extractSempliceColor(link, originalInnerHtml) {
    const linkColor = window.getComputedStyle(link).color;
    if (linkColor !== 'rgb(242, 242, 243)') {
      logDebug(`Using link color: ${linkColor}`);
      return linkColor;
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalInnerHtml;
    const styledSpan = tempDiv.querySelector('[style*="color"]');
    if (styledSpan) {
      const styleColor = styledSpan.style.color;
      if (styleColor && styleColor.includes('rgb')) {
        logDebug(`Extracted color from original content: ${styleColor}`);
        return styleColor;
      }
    }
    logDebug(`Using computed fallback color: ${linkColor}`);
    return linkColor;
  }
  
  // ========== NEW: REUSABLE ANIMATION SETUP HELPER ==========
  /**
   * Takes a single link element and rebuilds its HTML for the reveal animation.
   * @param {HTMLElement} link - The <a> tag to be animated.
   * @param {String} arrowDirection - Optional. e.g., 'diag-up', 'diag-down'.
   * @param {Boolean} forceThemeColor - If true, skips color extraction and lets CSS handle it.
   */
  function setupAnimatedLink(link, arrowDirection = null, forceThemeColor = false) {
      if (!link || link.dataset.brandonAnimated === 'true') {
        return;
      }
      link.dataset.brandonAnimated = 'true';
      
      const originalInnerHtml = link.innerHTML;
      if (!originalInnerHtml.trim()) return;

      // THE FIX: Only extract color if we are NOT forcing a theme.
      const Ctor = (forceThemeColor) ? null : extractSempliceColor(link, originalInnerHtml);
      
      link.innerHTML = '';
      link.classList.add('brandon-reveal-link-js');
      
      const mask = document.createElement('span');
      mask.className = 'brandon-button-reveal-mask';
      
      const topText = document.createElement('span');
      topText.className = 'brandon-button-reveal-text top';
      topText.innerHTML = originalInnerHtml;
      
      const bottomText = document.createElement('span');
      bottomText.className = 'brandon-button-reveal-text bottom';
      bottomText.innerHTML = originalInnerHtml;
      
      // THE FIX: Only apply inline style if a color was extracted.
      if (Ctor) {
        topText.style.color = Ctor;
        bottomText.style.color = Ctor;
      }
      
      const calibrator = document.createElement('span');
      calibrator.className = 'brandon-button-reveal-width-calibrator';
      calibrator.innerHTML = originalInnerHtml;
      
      mask.append(calibrator, topText, bottomText);
      link.append(mask);

      if (arrowDirection) {
        const arrowMask = document.createElement('span');
        arrowMask.className = 'brandon-arrow-mask';

        // THE FIX: Only apply inline style if a color was extracted.
        if (Ctor) {
            arrowMask.style.color = Ctor;
        }

        const createArrowSVG = () => {
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 24 24');
          svg.setAttribute('fill', 'none');
          svg.setAttribute('stroke', 'currentColor');
          svg.innerHTML = `<path d="M5 12 L18 12 M13 6 L19 12 L13 18" stroke-width="2.5" stroke-linecap="butt" stroke-linejoin="miter" />`;
          return svg;
        };

        const arrowOne = document.createElement('span');
        arrowOne.className = 'brandon-arrow brandon-arrow-one';
        arrowOne.appendChild(createArrowSVG());

        const arrowTwo = document.createElement('span');
        arrowTwo.className = 'brandon-arrow brandon-arrow-two';
        arrowTwo.appendChild(createArrowSVG());

        arrowMask.append(arrowOne, arrowTwo);
        link.append(arrowMask);
        link.classList.add(`brandon-arrow-${arrowDirection}`);
        logDebug(`Arrow created for button:`, link);
      }
  }

  // ========== UPDATED: GENERAL BUTTON ANIMATIONS ==========
  function initializeBrandonAnimations() {
    const animatedModules = document.querySelectorAll('[class*="animate-"]');

    animatedModules.forEach(module => {
      const link = module.querySelector('a');
      if (!link) return;

      const hasArrow = Array.from(module.classList).some(cls => cls.startsWith('with-arrow-'));
      let arrowDirection = null;
      if (hasArrow) {
          arrowDirection = Array.from(module.classList).find(cls => cls.startsWith('with-arrow-')).replace('with-arrow-', '');
      }
      // Use the helper, but allow color extraction for these general buttons.
      setupAnimatedLink(link, arrowDirection, false);
    });
  }
  
  // ========== NEW: NATIVE OVERLAY MENU LINK ANIMATIONS ==========
  function initializeOverlayMenuAnimations() {
    const menuContainer = document.getElementById('brandon-overlay-menu-links');
    if (!menuContainer) {
      logDebug("Overlay menu container '#brandon-overlay-menu-links' not found on this page.");
      return;
    }
    
    const links = menuContainer.querySelectorAll('a');
    logDebug(`Found ${links.length} links in the overlay menu to animate.`);
    
    links.forEach(link => {
      // THE FIX: Call the helper with forceThemeColor = true
      setupAnimatedLink(link, undefined, true);
    });
  }

  // ========== HERO SCROLL ANIMATION (Unchanged) ==========
  let brandonHeroScrollTrigger = null;
  let heroSplitInstances = [];
  function cleanupHeroAnimation() {
    const heroElements = document.querySelectorAll('.brandon-hero-stagger-exit .stagger-line h1, .brandon-hero-stagger-exit .stagger-line h2, .brandon-hero-stagger-exit .stagger-line h3, .brandon-hero-stagger-exit .stagger-line h4, .brandon-hero-stagger-exit .stagger-line h5, .brandon-hero-stagger-exit .stagger-line h6, .brandon-hero-stagger-exit .stagger-line p');
    if (heroElements.length > 0) {
      heroElements.forEach(el => { 
        el.style.opacity = '0'; 
        el.style.visibility = 'hidden'; 
      });
      brandonLog("Hero text hidden during SPA transition cleanup");
    }
    if (brandonHeroScrollTrigger) {
      logDebug("HERO SCROLL: Killing specific hero ScrollTrigger.");
      brandonHeroScrollTrigger.kill(true);
      brandonHeroScrollTrigger = null;
    }
    heroSplitInstances.forEach(instance => {
      if (instance && typeof instance.revert === 'function') {
        instance.revert();
      }
    });
    heroSplitInstances = [];
    logDebug("HERO SCROLL: Reverted SplitText instances.");
  }
  function initializeHeroScrollAnimation() {
    if (typeof gsap === 'undefined' || typeof SplitText === 'undefined' || typeof ScrollTrigger === 'undefined') {
      brandonLog("HERO SCROLL: GSAP or plugins not available. Skipping animation initialization.");
      return;
    }
    const triggerElement = document.querySelector('.brandon-hero-stagger-exit');
    if (!triggerElement) {
      brandonLog("HERO SCROLL: Trigger element '.brandon-hero-stagger-exit' not found. Skipping.");
      return;
    }
    function startHeroAnimation() {
      gsap.delayedCall(0.1, () => {
        brandonLog("HERO SCROLL: Initializing trigger-point hero scroll-out animation.");
        cleanupHeroAnimation();
        const heroElements = document.querySelectorAll('.brandon-hero-stagger-exit .stagger-line h1, .brandon-hero-stagger-exit .stagger-line h2, .brandon-hero-stagger-exit .stagger-line h3, .brandon-hero-stagger-exit .stagger-line h4, .brandon-hero-stagger-exit .stagger-line h5, .brandon-hero-stagger-exit .stagger-line h6, .brandon-hero-stagger-exit .stagger-line p');
        if (heroElements.length > 0) {
          heroElements.forEach(el => { 
            el.style.opacity = ''; 
            el.style.visibility = ''; 
          });
          brandonLog("Hero inline styles cleared - GSAP can now control visibility");
        }
        const lines = triggerElement.querySelectorAll('.stagger-line');
        let mainHeroTimeline = gsap.timeline({ paused: true });
        lines.forEach(line => {
          const textElement = line.querySelector(
            '.is-content h1, .is-content h2, .is-content h3, .is-content h4, .is-content h5, .is-content h6, .is-content p');
          if (!textElement) return;
          const split = new SplitText(textElement, { type: "words" });
          heroSplitInstances.push(split);
          if (split.words.length > 0) {
            mainHeroTimeline.fromTo(
              split.words,
              { autoAlpha: 1 },
              {
                autoAlpha: 0,
                duration: 0.6,
                ease: "Expo.easeOut",
                stagger: { each: 0.04, from: "start" }
              },
              "<0.1"
            );
          }
        });
        brandonHeroScrollTrigger = ScrollTrigger.create({
          trigger: "body",
          start: 1,
          end: 99999,
          toggleActions: "play none reverse reset",
          animation: mainHeroTimeline,
        });
        brandonLog("Hero ScrollTrigger created successfully");
      });
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(startHeroAnimation);
    } else {
      startHeroAnimation();
    }
  }

  // ========== MAIN INITIALIZATION & SPA HANDLING ==========
  let activeP5Instances = [];

  function initializeBrandonComponents() {
    brandonLog("Initializing Brandon Components (v3.8.1 - Overlay Color Fix)");
    if (!initializeGSAP()) return;
    
    // Initialize all components
    initializeButtonHandlers();
    initializeDotsGridMenu();
    initializeSmoothScrollHandlers();
    initializeBrandonAnimations();
    initializeHeroScrollAnimation();
    initializeOverlayMenuAnimations();
    
    try {
      injectBackgroundContainers();
    } catch (e) {
      console.error("P5: Error during injectBackgroundContainers call:", e);
    }
  }

  function cleanupBeforeInit() {
    brandonLog("Cleaning up before re-initialization (SPA transition).");
    activeP5Instances.forEach(sketch => {
        if (sketch && typeof sketch.remove === 'function') {
            logDebug(`P5 BG Cleanup: Removing sketch for ${sketch.canvas.parentElement?.className || 'N/A'}`);
            sketch.remove();
        }
    });
    activeP5Instances = [];
    document.querySelectorAll('.brandon-load-wave canvas, .brandon-main-background canvas, .brandon-main-background2 canvas').forEach(canvas => {
      canvas.remove();
    });
    _brandonDotsGridMenuInitialized = false;
    window._brandonNavBtnHandlersInitialized = false;
    window._brandonSmoothScrollInitialized = false;
    cleanupHeroAnimation();
    if (window.ScrollTrigger) {
        ScrollTrigger.refresh();
    }
    brandonLog("Cleanup: Complete.");
  }

  function safeInitialize() {
    brandonLog("SPA Event triggered: Re-initializing components.");
    cleanupBeforeInit();
    setTimeout(initializeBrandonComponents, 250);
  }

  const debouncedSafeInitialize = debounce(safeInitialize, 100);

  document.addEventListener('DOMContentLoaded', () => {
    logDebug('DOMContentLoaded event detected. Initializing components for first page load.');
    initializeBrandonComponents();
  });

  window.addEventListener('sempliceTransitionInDone', debouncedSafeInitialize);
  window.addEventListener('sempliceAppendContent', debouncedSafeInitialize);
  window.addEventListener('popstate', debouncedSafeInitialize);

})();
