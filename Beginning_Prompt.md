# Onboarding.md (Version 4)

## Purpose
This document outlines our general AI/LLM collaboration workflow.  
For all detailed Semplice 7 mechanics and integration rules, refer to **AI_Onboarding_2.md** as your technical manual.

---

## Context
- I’m a designer using **Semplice 7** (a design‑to‑code WordPress theme).  
- I **don’t know code**; I use AI/LLM to add custom animations and elements via **child-theme** files.  
- Custom code must work **with** Semplice’s editor and parent theme—**never** against it.  
- **Simple language only:** Avoid heavy technical jargon.  
- **Copy-paste ready:** Provide full code blocks I can drop into my child theme.  
- **Portfolio focus:** Modern, responsive animations using Semplice’s built‑in system; accessibility is not required.  
- **No guessing:** If you need details about Semplice internals, ask me how to gather them.  
- **Thorough debugging:** Guide me to use DevTools before suggesting new code.  
- **Flexible problem-solving:** If an initial solution fails, suggest alternative approaches.

---

## Core Guidelines

1. **Child Theme Etiquette**  
   - Never edit parent theme files; put all custom code in the child theme.

2. **Script Injection & Hooks**  
   - On first page load, hook into `DOMContentLoaded`.  
   - On each internal navigation, hook into Semplice’s SPA events (see AI_Onboarding_2.md).  

3. **Animation & Styling**  
   - Follow the GSAP and styling rules in AI_Onboarding_2.md.  
   - Use Semplice variables and avoid hard‑coding theme values.  

4. **Debugging Workflow**  
   - Check DevTools Console for errors.  
   - Inspect elements to verify HTML/CSS structure.  
   - Ensure code runs after the target exists (adjust hooks or add delays).  

5. **Solution Flexibility**  
   - If code following these guidelines doesn’t work, explore alternative methods or patterns.  
   - Explain why an alternative is needed and how it deviates from the standard rules.

---

## Session Workflow

1. **Onboard**  
   - Share this `Onboarding.md`, **AI_Onboarding_2.md**, and the latest child theme files.

2. **Confirm Understanding**  
   - Restate key points and ask clarifying questions before starting.

3. **Execute Task**  
   - Write or debug code following the guidelines and refer to AI_Onboarding_2.md for specifics.

4. **Addendum to AI_Onboarding_2.md**  
   - At the end of the session, create or update **Lessons-Learned.md** capturing:
     - New tips or techniques discovered.
     - Edge cases or contradictions not covered in AI_Onboarding_2.md.
     - Suggestions for improving AI_Onboarding_2.md.

5. **Wrap Up**  
   - Confirm all tasks are complete and that you’re ready for the next assignment.

---

*End of Onboarding.md*  
