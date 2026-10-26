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

function submit() {
  el("#screening-form").dispatchEvent(
    new Event("submit", { cancelable: true }),
  );
  expect(el("#error-state").classList.contains("hidden")).toBe(true);
}

function addPositiveFit() {
  el("#add-fit").click();
  const card = el("#exam-list").lastElementChild;
  const id = card.dataset.examId;
  set(`[data-exam-id="${id}"][data-field="date"]`, "2026-01-10");
  set(`[data-exam-id="${id}"][data-field="result"]`, "positive");
}

beforeEach(async () => {
  vi.resetModules();
  document.body.innerHTML = shell
    .match(/<body>([\s\S]*)<\/body>/)[1]
    .replace(/<script[\s\S]*?<\/script>/g, "");
  await import("../../pilot/ccr/main");

  set(
    "#policy",
    getCcrProductPolicyOptions().find((p) => p.family === "sus_oficial").policyId,
  );
  set("#as-of", "2026-10-24");
  set("#age", "60");
  set("#screening-context", "yes");
  for (const id of [
    "prior-crc",
    "prior-polyp-surveillance",
    "colonic-ibd",
    "hereditary-syndrome",
  ]) set(`#${id}`, "no");
  set("#family-history", "no");
  set("#history-knowledge", "known");
  set("#history-sufficient", "yes");
  addPositiveFit();
});

describe("CCR Phase B specific-attention UI boundary", () => {
  it("keeps deep FIT+ management out of the final primary surface while preserving it in technical details", () => {
    submit();
    expect(el("#clinical-overview h2").textContent).toBe(
      "Disponibilidade de recurso necessária",
    );
    expect(el("#clinical-overview").textContent).toMatch(/colonoscopia/i);

    el('#availability-colonoscopy input[value="available"]').click();
    submit();

    expect(el("#clinical-overview h2").textContent).toBe("Atenção específica");
    expect(el("#clinical-overview").textContent).toContain(
      "rastreamento de rotina fica suspenso",
    );
    expect(el("#clinical-overview").querySelector(".primary-guidance")).toBeNull();

    const technicalText = el("#result-sections").textContent;
    expect(technicalText).toMatch(/colonoscopia/i);
    expect(document.querySelector('[data-status="InFollowUp"]')).not.toBeNull();
  });
});
