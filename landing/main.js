/**
 * Nakraku Stash — Landing Page Interactive Controller
 */

/**
 * Initializes smooth scrolling navigation handlers for anchor links.
 */
function initSmoothScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (targetId && targetId !== "#") {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });
}

/**
 * Binds click-to-copy utility on code and checksum elements.
 */
function initCopyHandlers() {
  const codes = document.querySelectorAll("code");
  codes.forEach((codeEl) => {
    codeEl.addEventListener("click", async () => {
      const text = codeEl.textContent || "";
      if (text && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(text);
          const original = codeEl.textContent;
          codeEl.textContent = "Copied!";
          setTimeout(() => {
            codeEl.textContent = original;
          }, 1500);
        } catch {
          // Clipboard write fallback
        }
      }
    });
  });
}

/**
 * Validates privacy preferences and telemetry consent.
 * @returns {boolean} True if privacy mode or DNT is active.
 */
export function isDoNotTrackEnabled() {
  if (typeof navigator === "undefined") return false;
  return navigator.doNotTrack === "1" || window.doNotTrack === "1";
}

document.addEventListener("DOMContentLoaded", () => {
  initSmoothScroll();
  initCopyHandlers();
});
