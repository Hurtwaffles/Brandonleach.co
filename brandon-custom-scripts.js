// ==== BRANDON: GLOBAL SPA JS (Fully Optimized & Documented) ====
// Version: 3.1.4 (Hero ScrollTrigger Precise Start/End)
// Date: 2025-06-25
// Author: Brandon Leach
// Description: Optimized custom animations and interactions for Semplice WordPress theme

(function() {
  'use strict';

  const BRANDON_DEBUG_MODE = true; // Set to true for more console logs

  function logDebug(...args) {
    if (BRANDON_DEBUG_MODE && console && console.log) {
      console.log('[DEBUG]', ...args);
    }
  }

  // ========== CONFIGURATION OBJECTS ==========
  const BRANDON_CONFIG = {
    debug: true,
    grid: { subdivisions: 12, gapFactor: 8, baseDotSize: 1.5 },
    wave: { dotColor: [42, 42, 46], alphaReveal: 77, thickness: 145, speed: 247, frontRatio: 0.44, backRatio: 2.6 },
    timing: { buttonPress: 180, dotAnimation: 0.5, waveExpansion: 247 }
  };

  // ========== STATE MANAGEMENT VARIABLES ==========
  let activeP5Instances = [];
  let brandonHeroScrollTrigger = null; // Variable to hold our specific ScrollTrigger instance

  function brandonLog(...args) {
    if (BRANDON_CONFIG.debug && window && window.console) {
      console.log('[BRANDON CUSTOM]', ...args);
    }
  }

  function initializeGSAP() {
    if (window.gsap && window.CustomEase) {
      if (!CustomEase.get("circleEase")) {
        CustomEase.create("circleEase", "0.68, -0.55, 0.265, 1.55");
      }
      if (!CustomEase.get("rebrandEase")) {
        CustomEase.create("rebrandEase", "M0,0 C0.266,0.112 0.24,1.422 0.496,1.52 0.752,1.618 0.734,0.002 1,0");
      }
      return true;
    }
    brandonLog("GSAP or CustomEase missing!");
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

  const gridCache = new Map();
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
          setTimeout(() => btn.classList.remove('pressed'), BRANDON_CONFIG.timing.buttonPress);
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

  function initializeDotsGridMenu() {
    if (!initializeGSAP()) {
      brandonLog("DOTS: GSAP not ready, skipping.");
      return;
    }
    const menuBtn = document.getElementById('brandonDotsGridMenu');
    if (!menuBtn || menuBtn.dataset.brandonDotsInitialized === 'true') {
      return;
    }
    menuBtn.dataset.brandonDotsInitialized = 'true';
    const dots = Array.from(menuBtn.querySelectorAll('.brandon-dot'));
    if (dots.length !== 9) {
      return;
    }

    const SPACING = 8;
    const CORNER_OUTWARD_MULTIPLIER = 1.25;
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

  function createSafeP5Instance(factory, element, label) {
    if (typeof p5 === 'undefined') {
      brandonLog(`P5: Library not loaded. Cannot create sketch "${label}".`);
      return null;
    }
    const existingCanvas = element.querySelector('canvas');
    if (existingCanvas) {
      existingCanvas.remove();
    }
    try {
      const sketch = new p5(factory(element), element);
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
    const sectionConfigs = [
      { sectionClass: 'brandon-bg-load-wave',  bgClass: 'brandon-load-wave',       factory: createLoadWaveSketch,        label: 'load-wave' },
      { sectionClass: 'brandon-bg-main-bg',    bgClass: 'brandon-main-background', factory: createHazeBackgroundSketch,   label: 'main-background' },
      { sectionClass: 'brandon-bg-main-bg2',   bgClass: 'brandon-main-background2',factory: createWhiteHazeBackgroundSketch, label: 'main-background2' }
    ];
    sectionConfigs.forEach(config => {
      document.querySelectorAll(`smp-section.${config.sectionClass}`).forEach(section => {
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
  }

  function getResponsiveGridSettings(canvasWidth) {
    if (canvasWidth < 600)  return { DOT_GAP: 16, BASE_DOT_SIZE: 2 };
    if (canvasWidth < 1440) return { DOT_GAP: 12, BASE_DOT_SIZE: 1.5 };
    return { DOT_GAP: 16, BASE_DOT_SIZE: 2 };
  }

  function createHazeBackgroundSketch(containerElement) {
    return (p) => {
      const DOT_COLOR = [42, 42, 46];
      const BG_COLOR  = [14, 14, 16];
      const BLOB_SCALE = 0.005, THRESHOLD = 0.64, FADE_RANGE = 0.17, ANIM_SPEED = 0.0002;
      let DOT_GAP, BASE_DOT_SIZE, dotsArr = [];
      function alphaRamp(x) { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); }

      p.setup = function() {
        p.createCanvas(containerElement.offsetWidth, containerElement.offsetHeight).style('pointer-events', 'none');
        p.noStroke();
        ({ DOT_GAP, BASE_DOT_SIZE } = getResponsiveGridSettings(p.width));
        dotsArr = computeGrid(p.width, p.height, DOT_GAP);
        p.loop();
      };

      p.draw = function() {
        p.background(BG_COLOR);
        const t = p.millis() * ANIM_SPEED;
        dotsArr.forEach(({ x, y }) => {
          const nx = x * BLOB_SCALE, ny = y * BLOB_SCALE;
          const field = 0.7 * p.noise(nx, ny, t)
                      + 0.25 * p.noise(nx * 0.6, ny * 0.6, t * 1.7 + 99)
                      + 0.13 * p.noise(nx * 2.0, ny * 2.0, t * 0.8 - 7);
          const rawAlpha = (field - (THRESHOLD - FADE_RANGE)) / (2 * FADE_RANGE);
          const alpha = alphaRamp(rawAlpha);
          if (alpha > 0.02) {
            p.fill(...DOT_COLOR, alpha * 255);
            p.ellipse(x, y, BASE_DOT_SIZE * 2, BASE_DOT_SIZE * 2);
          }
        });
      };

      p.windowResized = debounce(function() {
        if (!containerElement.isConnected || !containerElement.offsetWidth || !containerElement.offsetHeight) return;
        p.resizeCanvas(containerElement.offsetWidth, containerElement.offsetHeight);
        ({ DOT_GAP, BASE_DOT_SIZE } = getResponsiveGridSettings(p.width));
        dotsArr = computeGrid(p.width, p.height, DOT_GAP);
        if (p.isLooping()) p.redraw();
      }, 150);
    };
  }

  function createWhiteHazeBackgroundSketch(containerElement) {
    return (p) => {
      const DOT_COLOR = [158, 158, 167];
      const BG_COLOR  = [242, 242, 243];
      const BLOB_SCALE = 0.005, THRESHOLD = 0.64, FADE_RANGE = 0.17, ANIM_SPEED = 0.0002;
      let DOT_GAP, BASE_DOT_SIZE, dotsArr = [];
      function alphaRamp(x) { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); }

      p.setup = function() {
        p.createCanvas(containerElement.offsetWidth, containerElement.offsetHeight).style('pointer-events', 'none');
        p.noStroke();
        ({ DOT_GAP, BASE_DOT_SIZE } = getResponsiveGridSettings(p.width));
        dotsArr = computeGrid(p.width, p.height, DOT_GAP);
        p.loop();
      };

      p.draw = function() {
        p.background(BG_COLOR);
        const t = p.millis() * ANIM_SPEED;
        dotsArr.forEach(({ x, y }) => {
          const nx = x * BLOB_SCALE, ny = y * BLOB_SCALE;
          const field = 0.7 * p.noise(nx, ny, t)
                      + 0.25 * p.noise(nx * 0.6, ny * 0.6, t * 1.7 + 99)
                      + 0.13 * p.noise(nx * 2.0, ny * 2.0, t * 0.8 - 7);
          const rawAlpha = (field - (THRESHOLD - FADE_RANGE)) / (2 * FADE_RANGE);
          const alpha = alphaRamp(rawAlpha);
          if (alpha > 0.02) {
            p.fill(...DOT_COLOR, alpha * 255);
            p.ellipse(x, y, BASE_DOT_SIZE * 2, BASE_DOT_SIZE * 2);
          }
        });
      };

      p.windowResized = debounce(function() {
        if (!containerElement.isConnected || !containerElement.offsetWidth || !containerElement.offsetHeight) return;
        p.resizeCanvas(containerElement.offsetWidth, containerElement.offsetHeight);
        ({ DOT_GAP, BASE_DOT_SIZE } = getResponsiveGridSettings(p.width));
        dotsArr = computeGrid(p.width, p.height, DOT_GAP);
        if (p.isLooping()) p.redraw();
      }, 150);
    };
  }

  function createLoadWaveSketch(containerElement) {
    return (p) => {
      const { dotColor, alphaReveal, thickness, speed, frontRatio, backRatio } = BRANDON_CONFIG.wave;
      const BG_COLOR = [14, 14, 16];
      let dotsArr = [], centerX, centerY, maxDist, startTime;
      let DOT_GAP, BASE_DOT_SIZE;

      p.setup = function() {
        p.createCanvas(containerElement.offsetWidth, containerElement.offsetHeight).style('pointer-events', 'none');
        p.noStroke();
        ({ DOT_GAP, BASE_DOT_SIZE } = getResponsiveGridSettings(p.width));
        dotsArr = computeGrid(p.width, p.height, DOT_GAP);
        centerX = p.width / 2;
        centerY = p.height / 2;
        maxDist = Math.sqrt(centerX * centerX + centerY * centerY) + thickness;
        startTime = p.millis();
        p.loop();
      };

      p.draw = function() {
        p.background(BG_COLOR);
        const elapsedSec = (p.millis() - startTime) * 0.001;
        const fullDist   = elapsedSec * speed;
        const revealDist = Math.min(fullDist, maxDist);
        const cycleLen   = maxDist + thickness;
        const pulseDist  = (fullDist % cycleLen);

        dotsArr.forEach(dot => {
          const d = p.dist(dot.x, dot.y, centerX, centerY);
          if (d <= revealDist) {
            p.fill(...dotColor, alphaReveal);
            p.ellipse(dot.x, dot.y, BASE_DOT_SIZE * 2, BASE_DOT_SIZE * 2);
          }
        });

        const frontRange = thickness * frontRatio;
        const backRange  = thickness * backRatio;
        dotsArr.forEach(dot => {
          const dx = dot.x - centerX, dy = dot.y - centerY;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d <= revealDist) {
            const delta = d - pulseDist;
            let pulse = 0;
            if (delta >= -backRange && delta <= frontRange) {
              pulse = delta > 0
                ? 1 - delta / frontRange
                : 1 - Math.abs(delta) / backRange;
              pulse = Math.pow(pulse, 0.6);
              pulse = Math.sin(pulse * Math.PI / 2);
            }
            if (pulse > 0.01) {
              let mag = delta >= 0
                ? 1 - (delta / frontRange)
                : 1 - (Math.abs(delta) / backRange) * 0.5;
              mag = Math.max(0, Math.min(1, mag)) * pulse;
              let warp = delta >= 0 ? mag * BASE_DOT_SIZE : 0;
              const ux = dx / (d || 1), uy = dy / (d || 1);
              const wx = ux * warp, wy = uy * warp;
              const size = BASE_DOT_SIZE + BASE_DOT_SIZE * mag;
              const alpha = 0.3 + 0.7 * pulse;
              p.fill(...dotColor, alpha * 255);
              p.ellipse(dot.x + wx, dot.y + wy, size * 2, size * 2);
            }
          }
        });
      };

      p.windowResized = debounce(function() {
        if (!containerElement.isConnected || !containerElement.offsetWidth || !containerElement.offsetHeight) return;
        p.resizeCanvas(containerElement.offsetWidth, containerElement.offsetHeight);
        ({ DOT_GAP, BASE_DOT_SIZE } = getResponsiveGridSettings(p.width));
        dotsArr   = computeGrid(p.width, p.height, DOT_GAP);
        centerX   = p.width / 2;
        centerY   = p.height / 2;
        maxDist   = Math.sqrt(centerX * centerX + centerY * centerY) + thickness;
        if (p.isLooping()) p.redraw();
      }, 150);
    };
  }

  function initializeBrandonAnimations() {
    const animatedModules = document.querySelectorAll('[class*="animate-"]');
    animatedModules.forEach(module => {
      const link = module.querySelector('a');
      if (!link || link.dataset.brandonAnimated === 'true') {
        return;
      }
      link.dataset.brandonAnimated = 'true';
      const originalColor = window.getComputedStyle(link).color;
      const originalInnerHtml = link.innerHTML;
      if (!originalInnerHtml.trim()) {
        return;
      }
      link.innerHTML = '';
      link.classList.add('brandon-reveal-link-js');
      const mask = document.createElement('span');
      mask.className = 'brandon-button-reveal-mask';
      const topText = document.createElement('span');
      topText.className = 'brandon-button-reveal-text top';
      topText.innerHTML = originalInnerHtml;
      topText.style.color = originalColor;
      const bottomText = document.createElement('span');
      bottomText.className = 'brandon-button-reveal-text bottom';
      bottomText.innerHTML = originalInnerHtml;
      bottomText.style.color = originalColor;
      const calibrator = document.createElement('span');
      calibrator.className = 'brandon-button-reveal-width-calibrator';
      calibrator.innerHTML = originalInnerHtml;
      mask.append(calibrator, topText, bottomText);
      link.append(mask);
      const hasArrow = Array.from(module.classList).some(cls => cls.startsWith('with-arrow-'));
      if (hasArrow) {
        const arrowClass = Array.from(module.classList).find(cls => cls.startsWith('with-arrow-'));
        const arrowDirection = arrowClass.replace('with-arrow-', '');
        const arrowMask = document.createElement('span');
        arrowMask.className = 'brandon-arrow-mask';
        arrowMask.style.color = originalColor;

//<<<<<<< 2nn6zu-codex/fix-arrow-animation-misalignment
        const createArrowSVG = (strokeWidth) => {
          const ns = 'http://www.w3.org/2000/svg';
          const svg = document.createElementNS(ns, 'svg');
          svg.setAttribute('viewBox', '0 0 24 24');
          const path = document.createElementNS(ns, 'path');
          path.setAttribute('d', 'M4 12h12m0 0l-6-6m6 6l-6 6');
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', 'currentColor');
//<<<<<<< 2nn6zu-codex/fix-arrow-animation-misalignment
          path.setAttribute('stroke-width', strokeWidth);
          path.setAttribute('stroke-linecap', 'square');
          path.setAttribute('stroke-linejoin', 'miter');
          svg.appendChild(path);
          return svg;
        };

//<<<<<<< 2nn6zu-codex/fix-arrow-animation-misalignment
        const computedWeight = parseInt(window.getComputedStyle(link).fontWeight, 10);
        const numericWeight = isNaN(computedWeight) ? 400 : computedWeight;
        const strokeWidth = Math.max(1, (numericWeight / 700) * 2).toFixed(2);

        const arrowOne = document.createElement('span');
        arrowOne.className = 'brandon-arrow brandon-arrow-one';
        arrowOne.appendChild(createArrowSVG(strokeWidth));
        const arrowTwo = document.createElement('span');
        arrowTwo.className = 'brandon-arrow brandon-arrow-two';
        arrowTwo.appendChild(createArrowSVG(strokeWidth));
        arrowMask.append(arrowOne, arrowTwo);
        link.append(arrowMask);
        link.classList.add(`brandon-arrow-${arrowDirection}`);
      }
    });
  }

  function initializeHeroScrollAnimation() {
    if (typeof gsap === 'undefined' || typeof SplitText === 'undefined' || typeof ScrollTrigger === 'undefined') {
      brandonLog("HERO SCROLL: GSAP or plugins not available.");
      return;
    }

    const triggerElement = document.querySelector('.brandon-hero-stagger-exit');
    if (!triggerElement) {
      brandonLog("HERO SCROLL: Trigger element '.brandon-hero-stagger-exit' not found.");
      return;
    }

    gsap.delayedCall(0.1, () => {
      brandonLog("HERO SCROLL: Initializing robust scroll-out animation.");

      const masterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          // ---- START: SCROLLTRIGGER FIX ----
          // Start after scrolling 50px from the top of the page.
          start: 10,
          // End when the bottom of the element hits the bottom of the viewport.
          end: "+=300", 
          // ---- END: SCROLLTRIGGER FIX ----
          scrub: true,
        }
      });
      
      brandonHeroScrollTrigger = masterTimeline.scrollTrigger;

      gsap.set(triggerElement, {autoAlpha: 1});

      const lines = triggerElement.querySelectorAll('.stagger-line');
      lines.forEach(line => {
      
      const textElement = line.querySelector(
        '.is-content h1, .is-content h2, .is-content h3, .is-content h4, .is-content h5, .is-content h6, .is-content p');
      if (!textElement) return;
 
          const split = new SplitText(textElement, { type: "words" });

        split.words.forEach(word => {
          const mask = document.createElement('span');
          mask.classList.add('brandon-word-mask');
          mask.style.height = word.offsetHeight + 'px';
          word.parentNode.insertBefore(mask, word);
          mask.appendChild(word);
        });

        if (split.words.length > 0) {
          masterTimeline.fromTo(
            split.words,
            { y: 0 },
            {
              y: (i, target) => -target.offsetHeight,
              duration: 0.6,
              ease: "power2.in",
              stagger: { each: 0.03, from: "start" }
            },
            "<0.2"
          );
        }
      });
    });
  }

  function initializeBrandonComponents() {
    brandonLog("Initializing Brandon Components (v3.1.4)");
    if (!initializeGSAP()) return;

    initializeButtonHandlers();
    initializeDotsGridMenu();
    initializeSmoothScrollHandlers();
    initializeBrandonAnimations();
    initializeHeroScrollAnimation();

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

    document.querySelectorAll('.brandon-load-wave, .brandon-main-background, .brandon-main-background2').forEach(el => {
      if (el.querySelector('canvas')) {
        el.querySelector('canvas').remove();
      }
    });
    
    const menuBtn = document.getElementById('brandonDotsGridMenu');
    if (menuBtn) menuBtn.removeAttribute('data-brandon-dots-initialized');

    window._brandonNavBtnHandlersInitialized = false;
    window._brandonSmoothScrollInitialized = false;
    
    if (brandonHeroScrollTrigger) {
        logDebug("Killing custom hero ScrollTrigger instance.");
        brandonHeroScrollTrigger.kill();
        brandonHeroScrollTrigger = null;
    }
    
    if (window.ScrollTrigger) {
        ScrollTrigger.refresh();
    }
    
    brandonLog("Cleanup: Complete.");
  }

  function safeInitialize() {
    brandonLog("SPA Event triggered: Re-initializing components.");
    cleanupBeforeInit();
    setTimeout(initializeBrandonComponents, 500); 
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
