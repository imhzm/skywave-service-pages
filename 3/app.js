const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");

function closeMenu({ restoreFocus = false } = {}) {
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

function focusHashTarget(link) {
  if (!link?.hash || link.hash.length < 2) return;
  const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
  if (!target) return;
  const labelledHeadingId = target.getAttribute("aria-labelledby")?.split(/\s+/)[0];
  const focusTarget = (labelledHeadingId && document.getElementById(labelledHeadingId))
    || (target.id === "main" && target.querySelector("h1"))
    || (target.id === "top" && target.querySelector(".brand"))
    || target;

  window.requestAnimationFrame(() => {
    const naturallyFocusable = focusTarget.matches("a[href], button, input, select, textarea, summary, [tabindex]");
    if (!naturallyFocusable) focusTarget.setAttribute("tabindex", "-1");
    focusTarget.focus({ preventScroll: true });
    if (!naturallyFocusable) {
      focusTarget.addEventListener("blur", () => focusTarget.removeAttribute("tabindex"), { once: true });
    }
  });
}

mobileNav?.addEventListener("click", (event) => {
  if (event.target.closest?.('a[href^="#"]')) closeMenu();
});

document.addEventListener("click", (event) => {
  if (menuButton?.getAttribute("aria-expanded") !== "true") return;
  if (menuButton.contains(event.target) || mobileNav?.contains(event.target)) return;
  closeMenu();
});

document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (event.button != null && event.button !== 0) return;

  const link = event.target?.closest?.('a[href^="#"]');
  if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
  focusHashTarget(link);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
    closeMenu({ restoreFocus: true });
  }
});

document.querySelectorAll("[data-demo-form]").forEach((form) => {
  const status = form.querySelector("[data-form-status]");
  const contactOptions = form.querySelector("[data-contact-options]");
  const whatsappLink = form.querySelector("[data-whatsapp-link]");
  const emailLink = form.querySelector("[data-email-link]");
  const contactSubmit = form.querySelector("[data-contact-submit]");
  const nameField = form.elements.namedItem("name");
  const emailField = form.elements.namedItem("email");
  const phoneField = form.elements.namedItem("phone");
  const planField = form.elements.namedItem("plan");
  const resetContactOptions = () => {
    if (contactOptions) contactOptions.hidden = true;
    if (status) status.hidden = true;
  };

  document.querySelectorAll("[data-plan-choice]").forEach((link) => {
    link.addEventListener("click", () => {
      if (planField) planField.value = link.dataset.planChoice ?? "";
      resetContactOptions();
    });
  });

  nameField?.addEventListener("input", () => nameField.setCustomValidity(""));
  emailField?.addEventListener("input", () => phoneField?.setCustomValidity(""));
  phoneField?.addEventListener("input", () => phoneField.setCustomValidity(""));
  form.addEventListener("input", resetContactOptions);
  form.addEventListener("change", resetContactOptions);

  const prepareContactOptions = () => {
    if (nameField && !nameField.value.trim()) {
      nameField.setCustomValidity("اكتب الاسم قبل المتابعة.");
    }
    if (emailField && phoneField && !emailField.value.trim() && !phoneField.value.trim()) {
      phoneField.setCustomValidity("أدخل بريدك الإلكتروني أو رقم هاتفك على الأقل.");
    }
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const plan = String(formData.get("plan") ?? "").trim();
    const team = form.elements.namedItem("team")?.selectedOptions[0]?.textContent.trim() ?? "";
    const need = form.elements.namedItem("need")?.selectedOptions[0]?.textContent.trim() ?? "";
    const message = [
      "مرحبًا، أرغب في مناقشة تصميم منصة لإدارة العملاء ومتابعة المبيعات مع سكاي ويف.",
      `الاسم: ${name}`,
      ...(email ? [`البريد الإلكتروني: ${email}`] : []),
      ...(phone ? [`رقم الهاتف: ${phone}`] : []),
      `حجم الفريق: ${team}`,
      `الاحتياج الأساسي: ${need}`,
      ...(plan ? [`الباقة محل الاهتمام: ${plan}`] : []),
    ].join("\n");

    if (whatsappLink) {
      whatsappLink.href = `https://wa.me/201067894321?text=${encodeURIComponent(message)}`;
      whatsappLink.target = "_blank";
      whatsappLink.rel = "noopener noreferrer";
    }
    if (emailLink) {
      const emailParams = new URLSearchParams({
        subject: "مناقشة تصميم منصة لإدارة المبيعات",
        body: message,
      });
      emailLink.href = `mailto:admin@skywaveads.com?${emailParams.toString()}`;
    }

    if (contactOptions) contactOptions.hidden = false;
    if (status) {
      status.hidden = false;
      status.textContent = "راجع البيانات واختر وسيلة التواصل. ستُفتح مسودة إلى سكاي ويف، ولن تُرسل حتى تؤكد الإرسال داخل التطبيق.";
      status.focus();
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    prepareContactOptions();
  });
  if (contactSubmit) contactSubmit.hidden = false;
});

const workflowTabs = [...document.querySelectorAll("[data-workflow-tab]")];
const workflowPanels = [...document.querySelectorAll("[data-workflow-panel]")];
const workflowTabList = document.querySelector(".workflow-tabs");
const horizontalWorkflowTabs = window.matchMedia("(min-width: 601px) and (max-width: 820px)");

function updateWorkflowOrientation() {
  workflowTabList?.setAttribute("aria-orientation", horizontalWorkflowTabs.matches ? "horizontal" : "vertical");
}

updateWorkflowOrientation();
horizontalWorkflowTabs.addEventListener("change", updateWorkflowOrientation);

function activateWorkflowTab(tab, { moveFocus = false } = {}) {
  workflowTabs.forEach((item) => {
    const active = item === tab;
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
  });

  workflowPanels.forEach((panel) => {
    panel.hidden = panel.dataset.workflowPanel !== tab.dataset.workflowTab;
  });

  if (moveFocus) tab.focus();
}

workflowTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateWorkflowTab(tab));
  tab.addEventListener("keydown", (event) => {
    const orientation = workflowTabList?.getAttribute("aria-orientation") ?? "vertical";
    const arrowKeys = orientation === "horizontal" ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"];
    if (![...arrowKeys, "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    const isRtl = document.documentElement.dir === "rtl";
    const direction = event.key === "ArrowUp"
      ? -1
      : event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft"
          ? (isRtl ? 1 : -1)
          : (isRtl ? -1 : 1);
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? workflowTabs.length - 1
        : (index + direction + workflowTabs.length) % workflowTabs.length;

    activateWorkflowTab(workflowTabs[nextIndex], { moveFocus: true });
  });
});

const scrollProgress = document.querySelector(".scroll-progress > span");
const siteHeader = document.querySelector(".site-header");
let scrollUpdatePending = false;

function updateScrollProgress() {
  if ((!scrollProgress && !siteHeader) || scrollUpdatePending) return;
  scrollUpdatePending = true;

  window.requestAnimationFrame(() => {
    const scrollY = window.scrollY;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0
      ? Math.max(0, Math.min(scrollY / scrollableHeight, 1))
      : 0;
    siteHeader?.classList.toggle("is-scrolled", scrollY > 24);
    if (scrollProgress) scrollProgress.style.transform = `scaleX(${progress})`;
    scrollUpdatePending = false;
  });
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

const floatingCta = document.querySelector(".floating-cta");
if (floatingCta && "IntersectionObserver" in window) {
  let overlapObserver;
  let resizeTimer;
  const overlappingTargets = new Set();
  const overlapTargets = [...document.querySelectorAll(
    'a, button, input:not([type="hidden"]), select, textarea, summary, [tabindex="0"], h1, h2, h3, h4, p, li, label, span, strong, small',
  )].filter((target) => target !== floatingCta && target.textContent.trim());

  function observeFloatingCtaOverlap() {
    overlapObserver?.disconnect();
    overlappingTargets.clear();
    floatingCta.classList.remove("is-obscured");
    floatingCta.inert = false;
    floatingCta.removeAttribute("aria-hidden");
    floatingCta.removeAttribute("tabindex");

    const bounds = floatingCta.getBoundingClientRect();
    const rootMargin = [
      -bounds.top,
      -(window.innerWidth - bounds.right),
      -(window.innerHeight - bounds.bottom),
      -bounds.left,
    ].map((value) => `${Math.ceil(value)}px`).join(" ");
    overlapObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) overlappingTargets.add(entry.target);
        else overlappingTargets.delete(entry.target);
      });
      const isObscured = overlappingTargets.size > 0;
      floatingCta.classList.toggle("is-obscured", isObscured);
      floatingCta.inert = isObscured;
      if (isObscured) {
        floatingCta.setAttribute("aria-hidden", "true");
        floatingCta.tabIndex = -1;
      } else {
        floatingCta.removeAttribute("aria-hidden");
        floatingCta.removeAttribute("tabindex");
      }
    }, { rootMargin, threshold: 0 });

    overlapTargets.forEach((target) => overlapObserver.observe(target));
  }

  observeFloatingCtaOverlap();
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(observeFloatingCtaOverlap, 120);
  }, { passive: true });
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });

  document.querySelectorAll(
    ".feature-card, .workflow-layout, .integration-layout, .measurement-panel, .result-card, .role-card, .plan-card, .faq-intro, .faq-list details, .demo-shell",
  ).forEach((element) => {
    element.classList.add("scroll-reveal");
    revealObserver.observe(element);
  });

  let revealFallbackPending = false;
  window.addEventListener("scroll", () => {
    if (revealFallbackPending) return;
    revealFallbackPending = true;

    window.requestAnimationFrame(() => {
      revealFallbackPending = false;
      document.querySelectorAll(".scroll-reveal:not(.is-visible)").forEach((element) => {
        if (element.getBoundingClientRect().bottom < 0) {
          element.classList.add("is-visible");
          revealObserver.unobserve(element);
        }
      });
    });
  }, { passive: true });
}
