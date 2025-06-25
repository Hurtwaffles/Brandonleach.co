# Semplice 7 • Master AI / LLM Onboarding Guide  
_One source of truth for coding, debugging & animating within the Semplice 7 SPA environment._

---

## 0. How to Use This Guide
1. **Read Section 1 first** – it explains why Semplice behaves differently from a vanilla WordPress theme.  
2. Follow the **Quick‑Start Checklist** before writing a single line of code.  
3. When you finish a session, create **Session‑Log_YYYY‑MM‑DD.md** and record any new findings or contradictions.  
4. If you need deeper internals, open the companion doc **“AI_Onboarding_2.md – Semplice 7 Deep‑Dive”** (kept side‑by‑side).

---

## Quick‑Start Checklist (Non‑negotiable Rules)
- ☑ **Do not enqueue another GSAP core** – Semplice ships **v3.12.5**.  
- ☑ **Lock plugin versions** → CustomEase, SplitText, ScrollTrigger **v3.13.0**.  
- ☑ **Bump version strings** in `functions.php` after _any_ JS/CSS change to defeat cache.  
- ☑ **Init on** `DOMContentLoaded` (first load) **and** `sempliceTransitionInDone` (SPA nav).  
- ☑ Code must be **idempotent** – safe to call repeatedly without duplicates.  
- ☑ **Never override parent CSS/IDs**; extend with wrappers or data‑attributes.  
- ☑ **Prefer class selectors** over IDs (except fixed, site‑wide IDs).  
- ☑ **Track and kill only your own ScrollTriggers** – never `ScrollTrigger.getAll().kill()`.  
- ☑ **Guard CustomEase**: `if (!CustomEase.get(name)) { … }`.  
- ☑ Internal links: full URLs + `target="_self"` to let Semplice handle SPA routing.

---

## 1. Semplice 7 Architecture in Plain English
### 1.1 Single‑Page Application (SPA)
Semplice swaps page content inside `.content-container/.page-wrap` instead of reloading the browser. Standard events like `DOMContentLoaded` won’t fire after the first load.

### 1.2 Custom Lifecycle Events
| Sequence | What Fires | Meaning / When to Hook |
|----------|------------|------------------------|
| 1 | `sempliceTransitionOutStart` | Old page animates out |
| 2 | `sempliceTransitionOutDone`  | Old DOM teardown begins |
| 3 | **`sempliceAppendContent`** | New HTML injected |
| 4 | `sempliceTransitionInStart`  | New page animates in |
| 5 | **`sempliceTransitionInDone`** | New DOM is stable – run custom JS here |

> **Tip:** Listen to both `sempliceAppendContent` **and** `sempliceTransitionInDone` with a debounced wrapper for maximum reliability.

### 1.3 Scroll Behaviour
* Forward nav → always scrolls to top.  
* Browser back nav → restores previous scroll position.

### 1.4 IDs & Selectors
Page‑specific IDs (`content-123`, `section_abc`) stay the same every visit. Classes are safest for JS hooks.

---

## 2. Page Elements & Responsiveness
- **Responsive tweaks** done in the Semplice editor propagate correctly on resize.  
- Dynamically built elements (p5 canvases, reveal buttons) are *not* duplicated when you navigate away and back – provided your init/cleanup logic is correct.

---

## 3. Built‑in Animation Stack
- **GSAP core 3.12.5** loaded by parent.  
- Plugins provided: **CustomEase, SplitText, ScrollTrigger 3.13.0**.  
- Semplice stores timelines under `semplice.animate.gsap` and pins sections via ScrollTrigger.

**Cleanup internals:** `x.animate.reset()` + `x.animate.refreshScrollTrigger()`.

---

## 4. Coding Rules & Best Practices (Expanded)
### 4.1 Timing & Init Pattern
```js
function mainInit() { /* create timelines, add event listeners, etc. */ }

function cleanup() { /* kill own timelines, remove canvases, etc. */ }

function safeInit() {
  cleanup();
  setTimeout(mainInit, 250); // tiny delay guarantees DOM ready
}

const initDebounced = debounce(safeInit, 100);

document.addEventListener('DOMContentLoaded', initDebounced);
window.addEventListener('sempliceTransitionInDone', initDebounced);
window.addEventListener('sempliceAppendContent', initDebounced);
```

### 4.2 Injecting Backgrounds into Pinned Sections
1. Keep a custom class on the **section** via Semplice editor.  
2. In JS, locate `section.closest('smp-section-pin') || section`.  
3. Insert your background div with `position:absolute; z-index:-1; pointer-events:none;`.  
4. Force parent section background to `transparent` so the animation shows.

---

## 5. Debug Lessons (25 Jun 2025)
### 5.1 Surgical ScrollTrigger Cleanup
Track individual triggers instead of killing all:
```js
let heroST = null;
function initHero() {
  const tl = gsap.timeline({ scrollTrigger:{/*…*/} });
  heroST = tl.scrollTrigger;
}
function cleanupHero() {
  heroST?.kill(true);
  heroST = null;
}
```

### 5.2 Multi‑Event Resilience
Combine `sempliceAppendContent` with `sempliceTransitionInDone` and `popstate`, then debounce.

### 5.3 Absolute Scroll Start/End for “Immediate” Feel
```js
scrollTrigger:{
  trigger: el,
  start: 50,     // px from top
  end: '+=500',  // px distance
  scrub: true
}
```

---

## 6. Standing Instructions for Future AI/LLM Sessions
1. Use **this guide** as the canonical rule‑set.  
2. After each working session, create a new file named  
   `Session-Log_<date>.md` summarising:
   * new discoveries  
   * edge‑cases fixed  
   * contradictions with this master doc  
   Commit the log alongside, **do not** modify this master guide except through formal revision.

---

*Document version: 2025‑06‑25 v1.0*
