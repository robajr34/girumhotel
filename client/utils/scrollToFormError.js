/**
 * Unified Form Error Scrolling & Focus Utility
 *
 * Automatically locates the first invalid input element corresponding to validation errors,
 * smoothly scrolls the viewport or parent scrollable container (e.g. modals) to center the field,
 * and shifts keyboard focus to it with full accessibility.
 */

/**
 * Normalizes various error formats (client state object, server array, Zod issues, Axios error)
 * into a list of field name strings in order.
 */
export function extractErrorFieldKeys(errors) {
  if (!errors) return [];

  // Case 1: String field name
  if (typeof errors === "string") {
    const trimmed = errors.trim();
    return trimmed ? [trimmed] : [];
  }

  // Case 2: Array of field names or error objects [{ field: "roomNumber", message: "..." }]
  if (Array.isArray(errors)) {
    return errors
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          return (item.field || item.path || item.name || "").toString().trim();
        }
        return "";
      })
      .filter(Boolean);
  }

  // Case 3: Axios error object with response.data.errors
  if (errors.response?.data) {
    const data = errors.response.data;
    if (Array.isArray(data.errors)) {
      return extractErrorFieldKeys(data.errors);
    }
    if (data.errors && typeof data.errors === "object") {
      return Object.keys(data.errors);
    }
  }

  // Case 4: Plain key-value error object: { email: "Required", password: "Too short" }
  if (typeof errors === "object") {
    return Object.keys(errors).filter((key) => {
      const val = errors[key];
      // Keep keys that have a truthy error message/boolean
      return val !== null && val !== undefined && val !== false && val !== "";
    });
  }

  return [];
}

/**
 * Finds the DOM element associated with a field key.
 */
function findElementForFieldKey(fieldKey, root = document) {
  if (!fieldKey || typeof fieldKey !== "string") return null;

  const sanitizedKey = fieldKey.trim();
  if (!sanitizedKey) return null;

  // Convert key variants (e.g. "checkInDate" -> "check-in-date", "checkin_date")
  const kebabKey = sanitizedKey.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
  const snakeKey = sanitizedKey.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1_$2").toLowerCase();

  const candidateSelectors = [
    `#${CSS.escape(sanitizedKey)}`,
    `[name="${CSS.escape(sanitizedKey)}"]`,
    `[data-field="${CSS.escape(sanitizedKey)}"]`,
    `#${CSS.escape(kebabKey)}`,
    `[name="${CSS.escape(kebabKey)}"]`,
    `#${CSS.escape(snakeKey)}`,
    `[name="${CSS.escape(snakeKey)}"]`,
    `input[name*="${CSS.escape(sanitizedKey)}"]`,
    `select[name*="${CSS.escape(sanitizedKey)}"]`,
    `textarea[name*="${CSS.escape(sanitizedKey)}"]`,
  ];

  for (const selector of candidateSelectors) {
    try {
      const el = root.querySelector(selector);
      if (el && isElementVisible(el)) {
        return el;
      }
    } catch {
      // Ignore invalid selector errors
    }
  }

  return null;
}

/**
 * Checks if an element is visible in the DOM.
 */
function isElementVisible(el) {
  if (!el || !(el instanceof HTMLElement)) return false;
  return Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

/**
 * Scrolls to the first invalid field and focuses it.
 *
 * @param {Object|Array|string} errors - Validation error object, array, or Axios error
 * @param {Object} [options] - Configuration options
 * @param {HTMLElement} [options.container] - Scope search within a container (e.g., a modal ref)
 * @param {boolean} [options.focus=true] - Whether to shift focus to the invalid field
 * @param {string} [options.behavior="smooth"] - Scroll behavior ("smooth" | "auto")
 * @param {string} [options.block="center"] - Vertical scroll alignment ("center" | "start" | "nearest")
 * @param {number} [options.delay=50] - Delay in milliseconds to allow React DOM re-renders
 * @returns {HTMLElement|null} The focused invalid element, if found
 */
export function scrollToFirstError(errors, options = {}) {
  if (typeof window === "undefined") return null;

  const fieldKeys = extractErrorFieldKeys(errors);
  if (fieldKeys.length === 0) return null;

  const {
    container = document,
    focus = true,
    behavior = "smooth",
    block = "center",
    delay = 60,
  } = options;

  // Execute after React has finished DOM rendering
  const executeScroll = () => {
    const root = container instanceof HTMLElement ? container : document;

    // Find all valid DOM elements matching the error keys
    const foundElements = [];

    fieldKeys.forEach((key) => {
      const el = findElementForFieldKey(key, root);
      if (el) {
        foundElements.push(el);
      }
    });

    if (foundElements.length === 0) {
      // Fallback: check for any element with aria-invalid="true" within root
      const invalidAriaEl = root.querySelector('[aria-invalid="true"]');
      if (invalidAriaEl && isElementVisible(invalidAriaEl)) {
        foundElements.push(invalidAriaEl);
      }
    }

    if (foundElements.length === 0) return null;

    // Sort matching elements by their appearance order in the DOM tree
    foundElements.sort((a, b) => {
      if (a === b) return 0;
      const position = a.compareDocumentPosition(b);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1; // 'a' precedes 'b'
      }
      if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1; // 'b' precedes 'a'
      }
      return 0;
    });

    const targetElement = foundElements[0];

    // Check user preference for reduced motion
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scrollBehavior = prefersReducedMotion ? "auto" : behavior;

    // Scroll into view (native scrollIntoView automatically scrolls parent overflow containers & window)
    try {
      targetElement.scrollIntoView({
        behavior: scrollBehavior,
        block,
        inline: "nearest",
      });
    } catch {
      targetElement.scrollIntoView();
    }

    // Focus target element or its inner focusable input
    if (focus) {
      setTimeout(() => {
        let focusTarget = targetElement;

        const isFocusable =
          ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(targetElement.tagName) ||
          targetElement.hasAttribute("tabindex");

        if (!isFocusable) {
          const innerFocusable = targetElement.querySelector(
            "input, select, textarea, button, [tabindex]:not([tabindex='-1'])"
          );
          if (innerFocusable) {
            focusTarget = innerFocusable;
          }
        }

        try {
          focusTarget.focus({ preventScroll: true });
        } catch {
          // Ignore focus errors on non-focusable elements
        }
      }, 100);
    }

    return targetElement;
  };

  if (delay > 0) {
    setTimeout(executeScroll, delay);
  } else {
    requestAnimationFrame(executeScroll);
  }
}

export default scrollToFirstError;
