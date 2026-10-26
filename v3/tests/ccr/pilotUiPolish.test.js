// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { getCcrProductPolicyOptions } from "../../src/product/ccr";

const shell = readFileSync(
  new NodeURL("../../pilot/ccr/index.html", import.meta.url),
  "utf8",
);

function el(s) {
  const n = document.querySelector(s);
  if (!n) throw Error(`Missing ${s}`);
  return n;
}

function set(s, v) {
  el(s).value = v;
  el(s).dispatchEvent(new Event("input", { bubbles: true }));
  el(s).dispatchEvent(new Event("change", { bubbles: true }));
}

function policy(family) {
  set(
    "#policy",
    getCcrProductPolicyOptions().find(p => p.family === family).policyId,
  );
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
  await import("../../pilot/ccr/polish");
  await settle();
});

describe("Phase 7.4.3 guided interview polish", () => {
  it("hides an empty Até aqui area and compacts the hero only after the journey starts", async () => {
    el("#clear-form").click();
    await settle();
    expect(el("#journey-summary").children).toHaveLength(0);
    expect(el("#journey-summary").previousElementSibling.hidden).toBe(true);
    expect(document.body.classList.contains("journey-started")).toBe(false);

    policy("sus_oficial");
    set("#as-of", "2026-10-24");
    set("#age", "60");
    await settle();
    expect(document.body.classList.contains("journey-started")).toBe(true);
  });

  it("uses human summaries instead of mirroring raw answers", async () => {
    policy("sus_oficial");
    set("#as-of", "2026-10-24");
    set("#age", "60");
    set("#screening-context", "yes");
    for (const id of ["prior-crc", "prior-polyp-surveillance", "colonic-ibd", "hereditary-syndrome"])
      set(`#${id}`, "no");
    await settle();

    expect(el("#context-section .step-summary").textContent).toBe("Rastreamento preventivo confirmado");
    expect(el("#risk-section .step-summary").textContent).toBe("Nenhuma condição que mude a rota identificada");
    expect(el("#journey-summary").textContent).toContain("Referencial e pessoa definidos");
    expect(el("#journey-summary").textContent).not.toContain("Câncer prévio: Não");
  });

  it("standardizes user uncertainty labels without changing semantic values", async () => {
    el("#clear-form").click();
    await settle();
    const unknown = el('#screening-context input[value="unknown"]');
    expect(unknown.closest("label").textContent.trim()).toBe("Não sei");
    unknown.click();
    expect(el("#screening-context").value).toBe("unknown");
  });

  it("presents a genuine route-changing condition as specific attention while preserving the technical clinical-review state", async () => {
    policy("sus_oficial");
    set("#as-of", "2026-10-24");
    set("#age", "60");
    set("#screening-context", "yes");
    set("#prior-crc", "yes");
    for (const id of ["prior-polyp-surveillance", "colonic-ibd", "hereditary-syndrome"])
      set(`#${id}`, "no");
    el("#screening-form").dispatchEvent(new Event("submit", { cancelable: true }));
    await settle();

    expect(el("#clinical-overview h2").textContent).toBe("Atenção específica");
    expect(el("#clinical-overview").textContent).toContain("rastreamento de rotina fica suspenso");
    expect(document.querySelector('[data-status="ClinicalReviewRequired"]')).not.toBeNull();
    expect(el("#clinical-overview details > summary").textContent).toBe("Ver orientações disponíveis");
  });

  it("compacts existing exam cards when the exam step is reopened", async () => {
    policy("sus_oficial");
    set("#as-of", "2026-10-24");
    set("#age", "60");
    set("#screening-context", "yes");
    for (const id of ["prior-crc", "prior-polyp-surveillance", "colonic-ibd", "hereditary-syndrome"])
      set(`#${id}`, "no");
    set("#family-history", "no");
    set("#history-knowledge", "known");
    set("#history-sufficient", "yes");
    el("#add-fit").click();
    el("#finish-exams").click();
    await settle();

    el("#exam-section .edit-step").click();
    await settle();
    const card = el("#exam-list .exam-card");
    expect(card.classList.contains("exam-card-collapsed")).toBe(true);
    expect(card.querySelector(".exam-compact").hidden).toBe(false);
    card.querySelector(".exam-edit").click();
    expect(card.classList.contains("exam-card-collapsed")).toBe(false);
  });
});
