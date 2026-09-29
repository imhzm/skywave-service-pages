const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");

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
  const showLocalPreview = () => {
    if (!form.reportValidity() || !status) return;
    status.hidden = false;
    status.textContent = "اكتملت معاينة النموذج. لم يُرسل الطلب أو تُحفظ أي معلومات.";
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });
  form.querySelector("[data-inquiry-preview]")?.addEventListener("click", showLocalPreview);
  ["input", "change"].forEach((eventName) => {
    form.addEventListener(eventName, () => {
      if (status) status.hidden = true;
    });
  });
  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.target.tagName !== "INPUT") return;
    event.preventDefault();
    showLocalPreview();
  });
});

const filterButtons = [...document.querySelectorAll("[data-gallery-filter]")];
const galleryItems = [...document.querySelectorAll("[data-gallery-item]")];
const galleryGrid = document.querySelector("#gallery-grid");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.galleryFilter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    galleryItems.forEach((item) => {
      item.hidden = filter !== "all" && item.dataset.galleryItem !== filter;
      item.classList.toggle("gallery-card-large", filter === "all" && item === galleryItems[0]);
    });
    galleryGrid?.classList.toggle("is-filtered", filter !== "all");
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
  if (dialogImage) dialogImage.src = "";
  lastGalleryTrigger?.focus();
});

const unitTabs = [...document.querySelectorAll("[data-unit-tab]")];
const unitPanels = [...document.querySelectorAll("[data-unit-panel]")];
const unitPlans = [...document.querySelectorAll("[data-unit-plan]")];

function activateUnitTab(tab) {
  unitTabs.forEach((item) => {
    const active = item === tab;
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
  });
  unitPanels.forEach((panel) => {
    panel.hidden = panel.dataset.unitPanel !== tab.dataset.unitTab;
  });
  unitPlans.forEach((plan) => {
    plan.hidden = plan.dataset.unitPlan !== tab.dataset.unitTab;
  });
}

unitTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateUnitTab(tab));
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
