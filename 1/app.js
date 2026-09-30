const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");

function closeMenu({ returnFocus = false } = {}) {
  if (!menuButton || !mobileNav) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "فتح قائمة التنقل");
  mobileNav.hidden = true;
  if (returnFocus) menuButton.focus();
}

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "فتح قائمة التنقل" : "إغلاق قائمة التنقل");
  mobileNav.hidden = isOpen;
  if (!isOpen) mobileNav.querySelector("a")?.focus();
});

mobileNav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

window.addEventListener("resize", () => {
  if (window.innerWidth <= 900 || menuButton?.getAttribute("aria-expanded") !== "true") return;

  const shouldRestoreFocus = mobileNav?.contains(document.activeElement) || document.activeElement === menuButton;
  closeMenu();
  if (shouldRestoreFocus) document.querySelector(".desktop-nav a")?.focus();
}, { passive: true });

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
    closeMenu({ returnFocus: true });
  }
});

const siteHeader = document.querySelector(".site-header");
let headerIsCompact = false;
let scrollFrameRequested = false;
function updateHeaderOnScroll() {
  if (scrollFrameRequested) return;
  scrollFrameRequested = true;
  window.requestAnimationFrame(() => {
    scrollFrameRequested = false;
    const shouldCompact = window.scrollY > 24;
    if (shouldCompact !== headerIsCompact) {
      headerIsCompact = shouldCompact;
      siteHeader?.classList.toggle("is-compact", shouldCompact);
    }

    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight)) : 0;
    siteHeader?.style.setProperty("--scroll-progress", String(progress));
  });
}
window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });
window.addEventListener("resize", updateHeaderOnScroll, { passive: true });
updateHeaderOnScroll();

const bookingDate = document.querySelector("#clinic-date");
if (bookingDate) {
  const localToday = new Date();
  localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset());
  bookingDate.min = localToday.toISOString().slice(0, 10);
}

function fieldErrorMessage(field) {
  if (field.validity.valueMissing) {
    const requiredMessages = {
      "clinic-name": "يرجى إدخال الاسم.",
      "clinic-phone": "يرجى إدخال رقم الجوال.",
      "clinic-service": "يرجى اختيار الخدمة المطلوبة.",
      "clinic-date": "يرجى اختيار التاريخ المناسب.",
    };
    return requiredMessages[field.id] || "يرجى إكمال هذا الحقل.";
  }
  if (field.validity.patternMismatch) return field.title || "تحققي من صيغة البيانات المدخلة.";
  if (field.validity.tooLong) return "النص أطول من الحد المسموح.";
  if (field.validity.rangeUnderflow) return "اختاري تاريخًا يبدأ من اليوم.";
  return "تحققي من البيانات المدخلة.";
}

document.querySelectorAll("[data-demo-form]").forEach((form) => {
  const status = form.querySelector("[data-form-status]");
  const submitButton = form.querySelector('button[type="submit"]');
  const fields = [...form.querySelectorAll("input[required], select[required]")];

  const clearFieldError = (field) => {
    const message = form.querySelector(`#${CSS.escape(field.id)}-error`);
    field.removeAttribute("aria-invalid");
    if (message) {
      message.hidden = true;
      message.textContent = "";
    }
  };

  fields.forEach((field) => {
    const clearValidFieldError = () => {
      if (field.checkValidity()) clearFieldError(field);
    };
    field.addEventListener("input", clearValidFieldError);
    field.addEventListener("change", clearValidFieldError);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.hidden = true;
    const invalidField = fields.find((field) => !field.checkValidity());

    if (invalidField) {
      fields.forEach((field) => {
        if (field.checkValidity()) {
          clearFieldError(field);
          return;
        }
        field.setAttribute("aria-invalid", "true");
        const message = form.querySelector(`#${CSS.escape(field.id)}-error`);
        if (message) {
          message.textContent = fieldErrorMessage(field);
          message.hidden = false;
        }
      });
      invalidField.focus();
      return;
    }

    status.dataset.state = "success";
    status.textContent = "شكرًا لك. هذه معاينة فقط؛ لم يُرسل طلبك ولم تُحفظ بياناتك.";
    status.hidden = false;
    submitButton?.focus();
  });

  if (submitButton) submitButton.disabled = false;
});

document.querySelectorAll(".compare-range").forEach((range) => {
  const comparison = range.closest(".comparison");
  const updatePosition = () => comparison?.style.setProperty("--split", `${range.value}%`);
  range.addEventListener("input", updatePosition);
  updatePosition();
});

const reviewCards = [...document.querySelectorAll("[data-review]")];
const reviewControls = [...document.querySelectorAll("[data-review-target]")];
const reviewCount = document.querySelector(".review-count");

function showReview(index) {
  if (index < 0 || index >= reviewCards.length) return;

  reviewCards.forEach((card, cardIndex) => {
    card.hidden = cardIndex !== index;
  });
  reviewControls.forEach((control, controlIndex) => {
    control.setAttribute("aria-pressed", String(controlIndex === index));
  });
  if (reviewCount?.firstChild) {
    reviewCount.firstChild.nodeValue = `${String(index + 1).padStart(2, "0")} `;
  }
}

reviewControls.forEach((button) => {
  button.addEventListener("click", () => showReview(Number(button.dataset.reviewTarget)));
});

const floatingContact = document.querySelector(".floating-contact");
const activeContentSections = new Set();

if (floatingContact && "IntersectionObserver" in window) {
  const syncFloatingContact = () => {
    const shouldHide = activeContentSections.size > 0 && document.activeElement !== floatingContact;
    floatingContact.classList.toggle("is-obscured", shouldHide);
    if (shouldHide) {
      floatingContact.setAttribute("aria-hidden", "true");
      floatingContact.tabIndex = -1;
    } else {
      floatingContact.removeAttribute("aria-hidden");
      floatingContact.removeAttribute("tabindex");
    }
  };

  const contentSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) activeContentSections.add(entry.target);
      else activeContentSections.delete(entry.target);
    });
    syncFloatingContact();
  }, { threshold: 0.05 });

  document.querySelectorAll("#results, #testimonials").forEach((section) => contentSectionObserver.observe(section));
  document.addEventListener("focusin", syncFloatingContact);
  document.addEventListener("focusout", () => queueMicrotask(syncFloatingContact));
}

const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!reducedMotionPreference.matches && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });

  document.querySelectorAll(".trust-strip, .section, .booking-section, .final-cta").forEach((section) => {
    section.classList.add("reveal-on-scroll");
    revealObserver.observe(section);
  });
  document.body.classList.add("motion-ready");
}
