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

mobileNav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
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
  form.addEventListener("input", resetContactOptions);
  form.addEventListener("change", resetContactOptions);

  const prepareContactOptions = () => {
    if (nameField && !nameField.value.trim()) {
      nameField.setCustomValidity("اكتب الاسم قبل المتابعة.");
    }
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const name = String(formData.get("name")).trim();
    const email = String(formData.get("email")).trim();
    const plan = String(formData.get("plan") ?? "").trim();
    const team = form.elements.namedItem("team")?.selectedOptions[0]?.textContent.trim() ?? "غير محدد";
    const messageLines = [
      "مرحبًا، أود مناقشة احتياج فريقي إلى تنظيم العملاء ومتابعة المبيعات.",
      `الاسم: ${name}`,
      `البريد الإلكتروني: ${email}`,
      `حجم الفريق: ${team}`,
    ];
    if (plan) messageLines.push(`الباقة محل الاهتمام: ${plan}`);
    const message = messageLines.join("\n");

    if (whatsappLink) {
      whatsappLink.href = `https://wa.me/201067894321?text=${encodeURIComponent(message)}`;
    }
    if (emailLink) {
      const emailParams = new URLSearchParams({
        subject: "مناقشة احتياج الفريق",
        body: message,
      });
      emailLink.href = `mailto:skywaveads@gmail.com?${emailParams.toString()}`;
    }
    if (contactOptions) contactOptions.hidden = false;

    if (status) {
      status.hidden = false;
      status.textContent = "اختر وسيلة التواصل. قد يطّلع مزود التطبيق المختار على بيانات المسودة، ولا تصل الرسالة إلى جهة التواصل إلا بعد ضغط إرسال.";
      status.focus();
    }
  };

  contactSubmit?.addEventListener("click", prepareContactOptions);
  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || !event.target.matches('input:not([type="hidden"])')) return;
    event.preventDefault();
    prepareContactOptions();
  });
  if (contactSubmit) contactSubmit.hidden = false;
});

const periodButtons = [...document.querySelectorAll("[data-period]")];
const exampleMetrics = {
  week: {
    leads: "٦٤",
    meetings: "١٦",
    revenue: "٧٬٨٥٠ ج",
    leadsChange: "+٨٪",
    meetingsChange: "+١١٪",
    revenueChange: "+١٧٪",
    range: "آخر ٧ أيام",
    path: "M0 112 C35 100 53 83 85 92 S135 110 170 76 S220 91 250 63 S300 71 335 49 S385 65 420 37 S466 46 500 15",
    point: [420, 37],
  },
  month: {
    leads: "٢٤٨",
    meetings: "٦٤",
    revenue: "٢٨٬٤٣٠ ج",
    leadsChange: "+١٢٪",
    meetingsChange: "+٢٤٪",
    revenueChange: "+٣٢٪",
    range: "آخر ٣٠ يومًا",
    path: "M0 119 C38 103 55 105 85 91 S135 80 170 94 S218 60 250 72 S300 46 335 63 S385 29 420 43 S465 23 500 13",
    point: [465, 23],
  },
};

periodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const metrics = exampleMetrics[button.dataset.period];
    if (!metrics) return;

    periodButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    document.querySelector('[data-metric="leads"]')?.replaceChildren(metrics.leads);
    document.querySelector('[data-metric="meetings"]')?.replaceChildren(metrics.meetings);
    document.querySelector('[data-metric="revenue"]')?.replaceChildren(metrics.revenue);
    document.querySelector('[data-metric-change="leads"]')?.replaceChildren(metrics.leadsChange);
    document.querySelector('[data-metric-change="meetings"]')?.replaceChildren(metrics.meetingsChange);
    document.querySelector('[data-metric-change="revenue"]')?.replaceChildren(metrics.revenueChange);
    document.querySelector("[data-range-label]")?.replaceChildren(metrics.range);

    const chartLine = document.querySelector("[data-chart-line]");
    const chartArea = document.querySelector("[data-chart-area]");
    const chartPoint = document.querySelector("[data-chart-point]");
    chartLine?.setAttribute("d", metrics.path);
    chartArea?.setAttribute("d", `${metrics.path} V150 H0Z`);
    chartPoint?.setAttribute("cx", String(metrics.point[0]));
    chartPoint?.setAttribute("cy", String(metrics.point[1]));
  });
});

const pricingButtons = [...document.querySelectorAll("[data-pricing-period]")];
const planPrices = [...document.querySelectorAll("[data-plan-price]")];
const priceCaptions = [...document.querySelectorAll("[data-price-caption]")];

pricingButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const period = button.dataset.pricingPeriod;
    if (period !== "monthly" && period !== "yearly") return;

    pricingButtons.forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });

    planPrices.forEach((price, index) => {
      const nextPrice = price.getAttribute(`data-${period}`);
      if (nextPrice) price.textContent = nextPrice;

      const caption = priceCaptions[index];
      if (caption) {
        caption.textContent = index === 0
          ? "دون رسوم"
          : period === "yearly"
            ? "شهريًا عند الدفع سنويًا"
            : "شهريًا";
      }
    });
  });
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
