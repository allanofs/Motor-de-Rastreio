// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { getCcrProductPolicyOptions } from "../../src/product/ccr";

const shell = readFileSync(
  new NodeURL("../../pilot/ccr/index.html", import.meta.url),
  "utf8",
);

function el(selector) {
  const node = document.querySelector(selector);
  if (!node) throw new Error(`Missing ${selector}`);
  return node;
}

function set(selector, value) {
  el(selector).value = value;
  el(selector).dispatchEvent(new Event("input", { bubbles: true }));
  el(selector).dispatchEvent(new Event("change", { bubbles: true }));
}

function policy(family) {
  const found = getCcrProductPolicyOptions().find(p => p.family === family);
  if (!found) throw new Error(`Missing policy family ${family}`);
  set("#policy", found.policyId);
}

function completeAverageRisk(family = "sus_oficial") {
  policy(family);
  set("#as-of", "2026-10-26");
  set("#age", "57");
  set("#screening-context", "yes");
  for (const id of ["prior-crc", "prior-polyp-surveillance", "colonic-ibd", "hereditary-syndrome"])
    set(`#${id}`, "no");
  set("#family-history", "no");
  set("#history-knowledge", "never_performed");
}

function submit() {
  el("#screening-form").dispatchEvent(new Event("submit", { cancelable: true }));
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
}

beforeEach(async () => {
  vi.resetModules();
  document.body.innerHTML = shell
    .match(/<body>([\s\S]*)<\/body>/)[1]
    .replace(/<script[\s\S]*?<\/script>/g, "");
  await import("../../pilot/ccr/main");
  await import("../../pilot/ccr/reportUi");
  await settle();
});

describe("CCR report export UI R2", () => {
  it("shows export only after a final routine result and hides it immediately after an edit", async () => {
    completeAverageRisk("sus_oficial");
    submit();
    await settle();
    expect(el("#report-export").classList.contains("hidden")).toBe(true);

    set("#availability-fit", "available");
    submit();
    await settle();
    expect(el("#clinical-overview h2").textContent).toBe("Rastreamento indicado");
    expect(el("#report-export").classList.contains("hidden")).toBe(false);

    set("#age", "58");
    await settle();
    expect(el("#report-export").classList.contains("hidden")).toBe(true);
  });

  it("does not expose export while strategy/resource input is still pending", async () => {
    completeAverageRisk("br_ampliado");
    submit();
    await settle();
    expect(el("#clinical-overview h2").textContent).toBe("Escolha necessária");
    expect(el("#report-export").classList.contains("hidden")).toBe(true);

    set("#strategy", "fit");
    submit();
    await settle();
    expect(el("#clinical-overview h2").textContent).toBe("Disponibilidade de recurso necessária");
    expect(el("#report-export").classList.contains("hidden")).toBe(true);
  });

  it("does not expose export for MORE_INFORMATION_NEEDED", async () => {
    policy("sus_oficial");
    set("#as-of", "2026-10-26");
    set("#age", "57");
    set("#screening-context", "yes");
    for (const id of ["prior-crc", "prior-polyp-surveillance", "colonic-ibd", "hereditary-syndrome"])
      set(`#${id}`, "no");
    set("#family-history", "unknown");
    set("#history-knowledge", "unknown");
    submit();
    await settle();

    expect(el("#clinical-overview h2").textContent).toBe("Próxima informação necessária");
    expect(el("#report-export").classList.contains("hidden")).toBe(true);
  });

  it("allows an exportable specific-attention result without promoting deep management", async () => {
    completeAverageRisk("sus_oficial");
    set("#history-knowledge", "known");
    set("#history-sufficient", "yes");
    el("#add-fit").click();
    const card = el("#exam-list .exam-card");
    set(`[data-exam-id="${card.dataset.examId}"][data-field="date"]`, "2026-01-10");
    set(`[data-exam-id="${card.dataset.examId}"][data-field="result"]`, "positive");
    submit();
    await settle();
    set("#availability-colonoscopy", "available");
    submit();
    await settle();

    expect(el("#clinical-overview h2").textContent).toBe("Atenção específica");
    expect(el("#report-export").classList.contains("hidden")).toBe(false);
  });
});
