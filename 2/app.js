const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");
const siteHeader = document.querySelector(".site-header");
const scrollProgress = document.querySelector(".scroll-progress");
const floatingCta = document.querySelector(".floating-cta");
const floatingCtaObstacles = document.querySelectorAll(
  ".fact-strip, .inquiry-card, .final-cta, .site-footer, .project-copy, .project-photo, .section-heading, .image-rail, .gallery-grid, .plan-visual, .plan-info, .location-copy, .map-visual, .payment-grid, .payment-cta, .why-grid",
);
const navigationLinks = [...document.querySelectorAll(
  '.desktop-nav a[href^="#"], .mobile-nav a[href^="#"], .footer-nav a[href^="#"]',
)];
const navigationSections = new Map();

navigationLinks.forEach((link) => {
  const id = link.getAttribute("href")?.slice(1);
  const section = id ? document.getElementById(id) : null;
  if (section) navigationSections.set(id, section);
});

let headerIsScrolled = false;
function updateHeaderSurface() {
  if (!siteHeader) return;
  const isScrolled = window.scrollY > 16;
  if (isScrolled === headerIsScrolled) return;
  headerIsScrolled = isScrolled;
  siteHeader.classList.toggle("is-scrolled", isScrolled);
}

function updateScrollDecorations() {
  updateHeaderSurface();
  if (floatingCta) {
    const ctaBounds = floatingCta.getBoundingClientRect();
    const overlapsImportantContent = [...floatingCtaObstacles].some((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.right > ctaBounds.left
        && bounds.left < ctaBounds.right
        && bounds.bottom > ctaBounds.top
        && bounds.top < ctaBounds.bottom;
    });
    floatingCta.classList.toggle("is-obscured", overlapsImportantContent);
  }

  if (scrollProgress) {
    const scrollRoot = document.scrollingElement || document.documentElement;
    const scrollRange = scrollRoot.scrollHeight - window.innerHeight;
    const progress = scrollRange > 0 ? Math.min(1, Math.max(0, scrollRoot.scrollTop / scrollRange)) : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
  }

  if (navigationLinks.length > 0) {
    const marker = Math.max(window.innerHeight * 0.34, (siteHeader?.offsetHeight || 0) + 24);
    let currentId = "";
    navigationSections.forEach((section, id) => {
      if (section.getBoundingClientRect().top <= marker) currentId = id;
    });

    navigationLinks.forEach((link) => {
      if (currentId && link.getAttribute("href") === `#${currentId}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }
}

let scrollUpdatePending = false;
function scheduleScrollDecorations() {
  if (scrollUpdatePending) return;
  scrollUpdatePending = true;
  window.requestAnimationFrame(() => {
    scrollUpdatePending = false;
    updateScrollDecorations();
  });
}

updateScrollDecorations();
window.addEventListener("scroll", scheduleScrollDecorations, { passive: true });
window.addEventListener("resize", scheduleScrollDecorations, { passive: true });

const motionPreference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
const galleryFilterAnimations = new Map();
const revealTargets = [...document.querySelectorAll(
  ".section-heading, .project-copy, .project-photo, .amenity-feature-grid, .location-copy, .map-visual, .payment-grid > article, .why-heading, .why-card, .final-cta-inner",
)];
let revealObserver = null;

if (!motionPreference?.matches && "IntersectionObserver" in window && revealTargets.length > 0) {
  const revealIndexes = new Map();
  revealTargets.forEach((element) => {
    const parent = element.parentElement;
    const index = revealIndexes.get(parent) || 0;
    revealIndexes.set(parent, index + 1);
    element.dataset.scrollReveal = "";
    element.style.setProperty("--reveal-delay", `${Math.min(index * 70, 350)}ms`);
  });

  document.documentElement.classList.add("scroll-reveal-ready");
  revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

  revealTargets.forEach((element) => revealObserver.observe(element));
}

function revealPassedTargets() {
  const revealLine = window.innerHeight * 1.08;
  revealTargets.forEach((element) => {
    if (element.classList.contains("is-revealed") || element.getBoundingClientRect().top > revealLine) return;
    element.classList.add("is-revealed");
    revealObserver?.unobserve(element);
  });
}

let revealUpdatePending = false;
function schedulePassedTargetReveal() {
  if (revealUpdatePending) return;
  revealUpdatePending = true;
  window.requestAnimationFrame(() => {
    revealUpdatePending = false;
    revealPassedTargets();
  });
}

window.addEventListener("scroll", schedulePassedTargetReveal, { passive: true });
window.addEventListener("hashchange", schedulePassedTargetReveal);
schedulePassedTargetReveal();

const handleMotionPreferenceChange = (event) => {
  if (!event.matches) return;
  galleryFilterAnimations.forEach((animation) => animation.cancel());
  galleryFilterAnimations.clear();
  revealObserver?.disconnect();
  document.documentElement.classList.remove("scroll-reveal-ready");
  revealTargets.forEach((element) => element.classList.add("is-revealed"));
};

if (motionPreference?.addEventListener) {
  motionPreference.addEventListener("change", handleMotionPreferenceChange);
} else {
  motionPreference?.addListener?.(handleMotionPreferenceChange);
}

function closeMenu(restoreFocus = false) {
  if (!menuButton || !mobileNav) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "فتح قائمة التنقل");
  mobileNav.hidden = true;
  if (restoreFocus) menuButton.focus();
}

menuButton?.addEventListener("click", () => {
  const opening = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(opening));
  menuButton.setAttribute("aria-label", opening ? "إغلاق قائمة التنقل" : "فتح قائمة التنقل");
  mobileNav.hidden = !opening;
  if (opening) mobileNav.querySelector("a")?.focus();
});

mobileNav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") closeMenu(true);
});

document.querySelectorAll("[data-inquiry-form]").forEach((form) => {
  const status = form.querySelector("[data-form-status]");
  const fields = [...form.querySelectorAll("input, select, textarea")];
  const reviewButton = form.querySelector("[data-inquiry-review]");
  const reviewInquiry = () => {
    const invalidField = fields.find((field) => !field.checkValidity());
    if (invalidField) {
      invalidField.reportValidity();
      invalidField.focus();
      return;
    }
    if (!status) return;
    status.hidden = false;
    status.textContent = "اكتملت مراجعة البيانات. لم يُرسل الطلب أو تُحفظ أي معلومات.";
  };

  reviewButton?.addEventListener("click", reviewInquiry);
  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || !event.target.matches("input")) return;
    event.preventDefault();
    reviewInquiry();
  });
  ["input", "change"].forEach((eventName) => {
    form.addEventListener(eventName, () => {
      if (status) status.hidden = true;
    });
  });
});

const filterButtons = [...document.querySelectorAll("[data-gallery-filter]")];
const galleryItems = [...document.querySelectorAll("[data-gallery-item]")];
const galleryGrid = document.querySelector("#gallery-grid");
const galleryImageSizes = new Map(
  galleryItems
    .map((item) => item.querySelector("img"))
    .filter(Boolean)
    .map((image) => [image, image.sizes]),
);
let gallerySizeUpdatePending = false;

function syncGalleryImageSizes() {
  if (gallerySizeUpdatePending) return;
  gallerySizeUpdatePending = true;

  window.requestAnimationFrame(() => {
    gallerySizeUpdatePending = false;
    const isFiltered = galleryGrid?.classList.contains("is-filtered");

    galleryImageSizes.forEach((defaultSizes, image) => {
      if (!isFiltered) {
        image.sizes = defaultSizes;
        return;
      }

      const item = image.closest("[data-gallery-item]");
      if (!item || item.hidden) return;

      const renderedWidth = image.getBoundingClientRect().width;
      if (renderedWidth > 0) image.sizes = `${Math.ceil(renderedWidth)}px`;
    });
  });
}

window.addEventListener("resize", () => {
  if (galleryGrid?.classList.contains("is-filtered")) syncGalleryImageSizes();
}, { passive: true });

function animateGalleryItem(item, delay) {
  if (motionPreference?.matches || typeof item.animate !== "function") return;

  galleryFilterAnimations.get(item)?.cancel();
  const animation = item.animate(
    [
      { opacity: 0, translate: "0 10px" },
      { opacity: 1, translate: "0 0" },
    ],
    { duration: 360, delay, easing: "cubic-bezier(.23, 1, .32, 1)" },
  );
  galleryFilterAnimations.set(item, animation);
  animation.onfinish = () => {
    if (galleryFilterAnimations.get(item) === animation) galleryFilterAnimations.delete(item);
  };
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.galleryFilter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    let visibleIndex = 0;
    galleryItems.forEach((item) => {
      const categories = item.dataset.galleryItem.split(/\s+/);
      item.hidden = filter !== "all" && !categories.includes(filter);
      item.classList.toggle("gallery-card-large", filter === "all" && item === galleryItems[0]);
      if (!item.hidden) {
        animateGalleryItem(item, Math.min(visibleIndex * 48, 192));
        visibleIndex += 1;
      } else {
        galleryFilterAnimations.get(item)?.cancel();
        galleryFilterAnimations.delete(item);
      }
    });
    galleryGrid?.classList.toggle("is-filtered", filter !== "all");
    syncGalleryImageSizes();
    syncRailControls();
  });
});

const galleryDialog = document.querySelector(".gallery-dialog");
const dialogImage = galleryDialog?.querySelector("img");
const dialogCaption = galleryDialog?.querySelector(".dialog-caption");
const closeDialogButton = galleryDialog?.querySelector(".dialog-close");
const previousImageButton = galleryDialog?.querySelector(".dialog-prev");
const nextImageButton = galleryDialog?.querySelector(".dialog-next");
const galleryButtons = [...document.querySelectorAll("[data-gallery-open]")];
let lastGalleryTrigger = null;
let activeGalleryIndex = 0;

function visibleGalleryButtons() {
  return galleryButtons.filter((button) => !button.hidden);
}

function showGalleryImage(index) {
  const visibleButtons = visibleGalleryButtons();
  if (!dialogImage || visibleButtons.length === 0) return;

  activeGalleryIndex = (index + visibleButtons.length) % visibleButtons.length;
  const button = visibleButtons[activeGalleryIndex];
  dialogImage.src = button.dataset.src;
  dialogImage.alt = button.dataset.alt || "صورة توضيحية للمشروع";
  if (dialogCaption) {
    const title = button.querySelector("span")?.childNodes[0]?.textContent.trim() || "صورة";
    dialogCaption.textContent = `${title} — تصور بصري لمشروع افتراضي`;
  }
  const navigationIsUseful = visibleButtons.length > 1;
  if (previousImageButton) previousImageButton.hidden = !navigationIsUseful;
  if (nextImageButton) nextImageButton.hidden = !navigationIsUseful;
}

galleryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!galleryDialog?.showModal || !dialogImage) return;
    lastGalleryTrigger = button;
    showGalleryImage(visibleGalleryButtons().indexOf(button));
    galleryDialog.showModal();
    closeDialogButton?.focus();
  });
});

previousImageButton?.addEventListener("click", () => showGalleryImage(activeGalleryIndex - 1));
nextImageButton?.addEventListener("click", () => showGalleryImage(activeGalleryIndex + 1));
closeDialogButton?.addEventListener("click", () => galleryDialog?.close());
galleryDialog?.addEventListener("click", (event) => {
  if (event.target === galleryDialog) galleryDialog.close();
});
galleryDialog?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showGalleryImage(activeGalleryIndex + 1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    showGalleryImage(activeGalleryIndex - 1);
  }
});
galleryDialog?.addEventListener("close", () => {
  dialogImage?.removeAttribute("src");
  lastGalleryTrigger?.focus();
});

const unitTabs = [...document.querySelectorAll("[data-unit-tab]")];
const unitPanels = [...document.querySelectorAll("[data-unit-panel]")];
const unitPlans = [...document.querySelectorAll("[data-unit-plan]")];

function activateUnitTab(tab, animate = false) {
  const selectionChanged = tab.getAttribute("aria-selected") !== "true";
  unitTabs.forEach((item) => {
    const active = item === tab;
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
  });
  unitPanels.forEach((panel) => {
    panel.hidden = panel.dataset.unitPanel !== tab.dataset.unitTab;
  });
  unitPlans.forEach((plan) => {
    plan.toggleAttribute("hidden", plan.dataset.unitPlan !== tab.dataset.unitTab);
  });

  if (animate && selectionChanged && !motionPreference?.matches) {
    const activePanel = unitPanels.find((panel) => !panel.hidden);
    const activePlan = unitPlans.find((plan) => !plan.hidden);
    [activePanel, activePlan].forEach((element) => {
      if (typeof element?.animate !== "function") return;
      element.getAnimations?.().forEach((animation) => animation.cancel());
      element.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 220, easing: "cubic-bezier(.23, 1, .32, 1)" },
      );
    });
  }
}

unitTabs.forEach((tab, index) => {
  tab.addEventListener("click", (event) => activateUnitTab(tab, event.detail > 0));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const rtl = document.documentElement.dir === "rtl";
    const step = event.key === "ArrowLeft" ? (rtl ? 1 : -1) : (rtl ? -1 : 1);
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? unitTabs.length - 1 : (index + step + unitTabs.length) % unitTabs.length;
    unitTabs[nextIndex].focus();
    activateUnitTab(unitTabs[nextIndex]);
  });
});

const railControlButtons = [...document.querySelectorAll("[data-rail-control]")];

function syncRailControls() {
  const controlsByRail = new Map();
  railControlButtons.forEach((button) => {
    const railName = button.dataset.railControl;
    if (!railName) return;
    const controls = controlsByRail.get(railName) || button.parentElement;
    controlsByRail.set(railName, controls);
  });

  controlsByRail.forEach((controls, railName) => {
    const rail = document.querySelector(`[data-horizontal-rail="${railName}"]`);
    controls.hidden = !rail || rail.scrollWidth <= rail.clientWidth + 1;
  });
}

railControlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const rail = document.querySelector(`[data-horizontal-rail="${button.dataset.railControl}"]`);
    if (!rail) return;
    const direction = button.dataset.direction === "next" ? -1 : 1;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.82, behavior: motionPreference?.matches ? "auto" : "smooth" });
  });
});

syncRailControls();
window.addEventListener("resize", syncRailControls, { passive: true });

document.querySelectorAll("[data-unit-step]").forEach((button) => {
  button.addEventListener("click", () => {
    if (unitTabs.length === 0) return;
    const activeIndex = Math.max(0, unitTabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"));
    const step = button.dataset.unitStep === "next" ? 1 : -1;
    const nextTab = unitTabs[(activeIndex + step + unitTabs.length) % unitTabs.length];
    activateUnitTab(nextTab, !motionPreference?.matches);
  });
});
