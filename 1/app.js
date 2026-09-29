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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
    closeMenu({ returnFocus: true });
  }
});

const bookingDate = document.querySelector("#clinic-date");
if (bookingDate) {
  const localToday = new Date();
  localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset());
  bookingDate.min = localToday.toISOString().slice(0, 10);
}

function fieldErrorMessage(field) {
  if (field.validity.valueMissing) return "هذا الحقل مطلوب.";
  if (field.validity.patternMismatch) return field.title || "تحققي من صيغة البيانات المدخلة.";
  if (field.validity.tooLong) return "النص أطول من الحد المسموح.";
  if (field.validity.rangeUnderflow) return "اختاري تاريخًا يبدأ من اليوم.";
  return "تحققي من البيانات المدخلة.";
}

document.querySelectorAll("[data-demo-form]").forEach((form) => {
  const status = form.querySelector("[data-form-status]");
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
    field.addEventListener("input", () => clearFieldError(field));
    field.addEventListener("change", () => clearFieldError(field));
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
    form.querySelector('button[type="submit"]')?.focus();
  });
});

document.querySelectorAll(".compare-range").forEach((range) => {
  const comparison = range.closest(".comparison");
  const updatePosition = () => comparison?.style.setProperty("--split", `${range.value}%`);
  range.addEventListener("input", updatePosition);
  updatePosition();
});

const reviews = [...document.querySelectorAll("[data-review]")];
const reviewControls = [...document.querySelectorAll("[data-review-target]")];
reviewControls.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedIndex = Number(button.dataset.reviewTarget);
    reviews.forEach((review, index) => { review.hidden = index !== selectedIndex; });
    reviewControls.forEach((control, index) => {
      if (index === selectedIndex) control.setAttribute("aria-current", "true");
      else control.removeAttribute("aria-current");
    });
  });
});

const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!reducedMotionPreference.matches && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });

  document.querySelectorAll(".trust-strip, .section, .final-cta").forEach((section) => {
    section.classList.add("reveal-on-scroll");
    revealObserver.observe(section);
  });
  document.body.classList.add("motion-ready");
}
