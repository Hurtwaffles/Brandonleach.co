# 🚀 Semplice 7 Technical Onboarding Guide for AI/LLM

This document provides a comprehensive understanding of the Semplice 7 WordPress theme's internal JavaScript-driven lifecycle and front-end environment. Adherence to these guidelines is critical for successful integration of custom code and animations.

## 1. Core Semplice 7 Page Navigation & Lifecycle

Semplice 7 operates as a **Single Page Application (SPA)**. This is the most crucial distinction from traditional WordPress themes.

* **No Full Page Reloads (unless forced):** Semplice 7 does not perform full page reloads when navigating between internal pages. Instead, it uses JavaScript to dynamically swap only the content within specific containers (typically `.content-container` or `.page-wrap`).
* **Custom Transition Events:** Due to its SPA nature, standard browser events like `DOMContentLoaded` or `window.load` are *not reliable* for triggering animations on subsequent page navigations. Semplice utilizes its own set of custom JavaScript events to signal different stages of a page transition.

### 1.1. Semplice's Custom Page Lifecycle Events

The following custom events are triggered by Semplice during a page transition, controlling DOM teardown and insertion:

* `sempliceTransitionOutStart`
* `sempliceTransitionOutDone`
* `sempliceTransitionInStart`
* `sempliceAppendContent`
* `sempliceTransitionInDone`

### 1.2. Observed Rendering Order

The confirmed sequence of events during a page navigation is as follows:

1.  **Page nav clicked** (`Link clicked:`)
2.  **Out transition begins** (`sempliceTransitionOutStart`) - Old page animates out.
3.  **Out transition ends** (`sempliceTransitionOutDone`) - DOM starts teardown.
4.  **DOM cleanup** (`Cleaning up...` - refers to custom script cleanup) - Custom hooks clean flags.
5.  **Content replaced** (`sempliceAppendContent`) - New content injected.
6.  **In transition begins** (`sempliceTransitionInStart`) - New content animates in.
7.  **In transition ends** (`sempliceTransitionInDone`) - **DOM is stable, and custom code should run here.**

## 2. Page State Management & Element Behavior

### 2.1. Scroll Management

* **Forward Navigation:** When navigating forward to a new page via a Semplice navigation link, the new page always scrolls to its very top starting position.
* **Back Navigation:** When navigating back using the browser's back button, Semplice retains the previous scroll position on the page you are returning to.

### 2.2. Dynamic Element Handling & Duplicates

Semplice (and current custom cleanup) effectively manages dynamically generated or modified elements:

* **p5.js Canvases:** Only one p5.js canvas element (`<canvas class="p5Canvas">`) is observed at any given time within its respective container (`.brandon-main-background2`, etc.) after navigation away and back. No duplicates are seen.
* **Custom Reveal Buttons:** The HTML structure of custom "reveal" buttons (`brandon-reveal-link-js`, `brandon-animated-button-reveal`) is correctly rebuilt on each page load during SPA navigation. No duplicated `brandon-button-reveal-mask` or `brandon-button-reveal-text` elements are observed.

### 2.3. Responsive Logic & Device Adaptation

* **Semplice's Built-in Responsiveness:** Semplice includes its own responsive logic for adjusting content across different screen sizes. The Semplice editor allows designers to fine-tune padding, margin, font sizes, colors, and even hide/replace content for specific device widths. Once a screen size is edited in Semplice, it becomes "unlocked" from the desktop version.
* **Observed Behavior:** When resizing the browser, elements configured via the Semplice editor correctly size down, and spacing adapts accordingly.

### 2.4. Consistent IDs & Reliable Selectors

* **Page-Specific IDs:** Each Semplice page is assigned a unique set of IDs for its main content container (`content-XXX`) and its internal sections/columns (`section_XYZ`, `column_ABC`). These IDs are *consistent for that specific page* across visits; they do not change dynamically with every SPA load.
* **Class-Based Selectors:** JavaScript selectors based on class names (e.g., `document.querySelector('.brandon-hero-stagger-exit')`, `document.querySelector('.brandon-animated-button-reveal')`) reliably select the intended element on the newly loaded page. This confirms the robustness of using class-based selectors for targeting elements consistently across SPA transitions.

## 3. Internal Semplice Animation System (GSAP Integration)

Semplice 7 uses GSAP extensively for its own internal animations, which is a critical point for custom animation development.

* **GSAP Core & Plugin Availability:** GSAP core (v3.12.5) is provided by the parent theme (`semplice-frontend-js`). Custom GSAP plugins (CustomEase, SplitText, ScrollTrigger v3.13.0) are correctly enqueued and depend on `semplice-frontend-js`.
* **Semplice's Direct GSAP Usage:**
    * Semplice's internal `frontend.js` and dynamically injected page-specific motion scripts (like `584-motion-js`) heavily utilize `gsap.to()`, `gsap.set()`, and `gsap.timeline()`.
    * Semplice's own animations are stored under `semplice.animate.gsap`.
    * It controls properties like `opacity`, `x`, `y`, `height`, `width`, `scale`, and `borderRadius`.
    * Semplice frequently applies `gsap.set()` with `opacity: 0` or other transforms as initial states.
    * Semplice creates its own `ScrollTrigger` instances, often with `pin: true`, targeting sections and columns (e.g., `#section_a085cf1cf`, `#column_590420334`).
* **Cleanup & Refresh:**
    * Semplice has an internal `x.animate.reset()` function that uses `gsap.killTweensOf` and `ScrollTrigger.getById(id).kill(true)` to clean up its own animations.
    * It also calls `x.animate.refreshScrollTrigger()` after appending content and after page transitions are done.

## 4. Key Directives for AI/LLM (Non-Negotiable Rules & Best Practices)

To ensure seamless integration and avoid conflicts, strictly adhere to the following:

* **DO NOT enqueue a second GSAP core.** The parent theme already provides GSAP 3.12.5 via the `semplice-frontend-js` handle.
* **GSAP Plugin Versions are Locked:** GSAP plugin URLs (CustomEase, SplitText, ScrollTrigger) are locked to 3.13.0 and depend on `semplice-frontend-js`. Maintain this dependency and version.
* **Timing is EVERYTHING:** All custom JavaScript code for animations and interactions **MUST** be initialized or re-initialized exclusively after the `sempliceTransitionInDone` event fires. This is the only reliable hook for DOM stability during SPA navigation.
    * *Example pattern:*
        ```javascript
        window.addEventListener('sempliceTransitionInDone', () => {
            // A slight delay (e.g., 100-250ms) can further ensure DOM readiness.
            setTimeout(() => {
                initializeBrandonComponents(); // Your main initialization function
            }, 100);
        });
        ```
* **Idempotent Code:** Custom JavaScript functions (like `initializeBrandonComponents()`) must be **idempotent**. This means they can be called multiple times without creating duplicates, errors, or unexpected side effects. Implement robust cleanup *before* re-initialization (e.g., removing old canvases, resetting flags, killing old GSAP timelines/ScrollTriggers associated with your custom animations).
* **No Reduced Motion (Current Directive):** Do not implement or rely on `prefers-reduced-motion` logic in custom code. This feature is not desired.
* **Element Selection:** Prioritize class-based selectors (e.g., `.my-element-class`) over ID-based selectors when targeting elements for custom animations, unless the ID is guaranteed to be consistent across *all* pages where the element might appear (which is rare for dynamically loaded content).
* **Avoid Parent Theme Overrides:** Never override or directly edit Semplice's parent theme CSS classes or IDs. Extend functionality only via extra wrappers, data-attributes, or CSS custom properties.
* **JavaScript-Driven Visuals:** All custom visual effects and animations must be implemented using JavaScript (primarily GSAP). Avoid standalone CSS keyframes unless they are already existing Semplice editor effects.
* **Full File Rewrites:** Any code output for changes must be a full-file rewrite or include the entire edited code block. No isolated patches.
* **GSAP `CustomEase` Guard:** Always guard `CustomEase` registrations with `if (!CustomEase.get(name))` to prevent re-registration errors.
* **Scroll-Based Libraries:** Any scroll-based animation libraries (e.g., ScrollTrigger) *must* be re-initialized on every SPA page transition. Be aware that Semplice may have its own `ScrollTrigger` instances, so careful targeting and cleanup are essential.
* **URL Handling:** Use full URLs with `target="_self"` for internal links that should trigger Semplice's SPA navigation, unless otherwise specified.
* **`sempliceWp` and `semplice` Objects:** These global JavaScript objects provide access to Semplice's internal configuration and functions. Explore them (e.g., `semplice.PageManager`, `semplice.animate.gsap`, `semplice.events`) for deeper integration points if needed for complex tasks.
* **Performance Fallbacks/Shims:** Performance fallbacks, reduced-motion flags (beyond the current directive), or old-browser shims are out of scope unless explicitly requested.

---
