// @vitest-environment happy-dom
// DOM simulation: does not replace a real browser or assistive-technology audit.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { getMamaProductPolicyOptions } from "../../src/product/mama";

const shell = readFileSync(
  new NodeURL("../../pilot/mama/index.html", import.meta.url),
  "utf8",
);

function el(selector) {
  const node = document.querySelector(selector);
  if (!node) throw new Error(`Missing ${selector}`);
  return node;
}

function set(selector, value) {
  const node = el(selector);
  node.value = value;
  node.dispatchEvent(new Event("input", { bubbles: true }));
  node.dispatchEvent(new Event("change", { bubbles: true }));
}

function choose(id, value) {
  const radio = el(`#${id} input[value="${value}"]`);
  radio.checked = true;
  radio.dispatchEvent(new Event("input", { bubbles: true }));
  radio.dispatchEvent(new Event("change", { bubbles: true }));
}

function policy(family) {
  const item = getMamaProductPolicyOptions().find(
    (candidate) => candidate.family === family,
  );
  if (!item) throw new Error(`Missing policy ${family}`);
  set("#policy", item.policyId);
}

function visible(selector) {
  return !el(selector).classList.contains("hidden");
}

function fillBaseline({ family = "sus_oficial", age = "55" } = {}) {
  policy(family);
  set("#as-of", "2026-10-27");
  set("#age", age);
  choose("context-section #screening-context", "yes");
  choose("context-section #relevant-breast-tissue", "yes");
}

const safetyIds = [
  "suspicious-symptoms",
  "prior-breast-cancer",
  "high-risk-genetic",
  "known-high-risk-familial",
  "high-risk-chest-radiation",
  "high-risk-lesion",
  "specific-care-active",
];

function fillSafety(overrides = {}) {
  for (const id of safetyIds) choose(id, overrides[id] ?? "no");
}

function addMammography(kind, values) {
  el(`#add-${kind}-mammography`).click();
  const card = el("#mammography-list").lastElementChild;
  for (const [field, value] of Object.entries(values))
    set(
      `[data-mammography-id="${card.dataset.mammographyId}"][data-field="${field}"]`,
      value,
    );
  return card;
}

function resultTitle() {
  return el("#result-title").textContent.trim();
}

function resultDetail() {
  return el("#result-detail").textContent.trim();
}

beforeEach(async () => {
  vi.resetModules();
  document.body.innerHTML = shell
    .match(/<body>([\s\S]*)<\/body>/)[1]
    .replace(/<script[\s\S]*?<\/script>/g, "");
  await import("../../pilot/mama/main");
});

describe("Mama Guided Interview progressive disclosure", () => {
  it("starts small and reveals context then safety through governed evaluation", () => {
    expect(visible("#context-section")).toBe(false);
    expect(visible("#safety-section")).toBe(false);
    expect(visible("#history-section")).toBe(false);

    policy("sus_oficial");
    set("#as-of", "2026-10-27");
    set("#age", "55");
    expect(visible("#context-section")).toBe(true);
    expect(visible("#safety-section")).toBe(false);

    choose("context-section #screening-context", "yes");
    choose("context-section #relevant-breast-tissue", "yes");
    expect(visible("#safety-section")).toBe(true);
    expect(visible("#history-section")).toBe(false);
    expect(resultTitle()).toBe("Próxima informação necessária");
  });

  it("stops routine acquisition when a hard exit produces specific attention", () => {
    fillBaseline();
    fillSafety({ "high-risk-genetic": "yes" });

    expect(resultTitle()).toBe("Atenção específica");
    expect(visible("#history-section")).toBe(false);
    expect(visible("#availability-section")).toBe(false);
  });

  it("preserves under-40 hard-exit precedence", () => {
    fillBaseline({ age: "35" });
    fillSafety({ "suspicious-symptoms": "yes" });
    expect(resultTitle()).toBe("Atenção específica");
  });

  it("shows ordinary SUS under-40 routine closure only after safety is cleared", () => {
    fillBaseline({ age: "35" });
    fillSafety();
    choose("history-knowledge", "never_performed");
    expect(resultTitle()).toBe("Rastreamento não indicado");
    expect(visible("#availability-section")).toBe(false);
  });

  it("keeps USPSTF 75+ as evidence-insufficient individual decision", () => {
    fillBaseline({ family: "internacional", age: "76" });
    fillSafety();
    choose("history-knowledge", "never_performed");
    expect(resultTitle()).toBe("Decisão individual");
    expect(resultDetail().toLowerCase()).toContain("insuficiente");
    expect(visible("#availability-section")).toBe(false);
  });

  it("treats never-performed as known history and requests availability only when mammography is due", () => {
    fillBaseline();
    fillSafety();
    choose("history-knowledge", "never_performed");

    expect(resultTitle()).toBe("Rastreamento indicado");
    expect(visible("#availability-section")).toBe(true);
    expect(el("#followup-request").textContent.toLowerCase()).toContain(
      "disponibilidade",
    );

    choose("mammography-availability", "available");
    expect(resultTitle()).toBe("Rastreamento indicado");
    expect(el("#result-actions").textContent).toContain(
      "Disponível no serviço informado",
    );
  });

  it("does not invent a negative answer when a safety answer is unknown", () => {
    fillBaseline();
    fillSafety({ "high-risk-genetic": "unknown" });
    expect(resultTitle()).toBe("Próxima informação necessária");
  });
});

describe("Mama Guided Interview mammography history", () => {
  function openKnownHistory() {
    fillBaseline();
    fillSafety();
    choose("history-knowledge", "known");
    choose("history-sufficient", "yes");
    choose("prior-mammography-allows-routine", "yes");
    choose("prior-mammography-needs-attention", "no");
    expect(visible("#exam-section")).toBe(true);
  }

  it("does not let a diagnostic mammogram become a routine interval anchor", () => {
    openKnownHistory();
    addMammography("diagnostic", {
      date: "2025-11-10",
      disposition: "routine_return",
      quality: "adequate",
      completeness: "complete",
      resolutionInformation: "sufficient",
    });
    el("#finish-mammographies").click();
    expect(resultTitle()).not.toBe("Em dia");
    expect(resultTitle()).toBe("Próxima informação necessária");
  });

  it("uses a recent qualifying screening mammogram to show current status", () => {
    openKnownHistory();
    addMammography("screening", {
      date: "2025-11-10",
      disposition: "routine_return",
      quality: "adequate",
      completeness: "complete",
      resolutionInformation: "sufficient",
    });
    el("#finish-mammographies").click();
    expect(resultTitle()).toBe("Em dia");
    expect(visible("#availability-section")).toBe(false);
  });

  it("surfaces contradictory history through the normalization error instead of guessing", () => {
    openKnownHistory();
    choose("prior-mammography-needs-attention", "yes");
    expect(visible("#error-state")).toBe(true);
    expect(el("#error-state").textContent).toMatch(/não podem|cannot|ambos/i);
  });

  it("removes stale resource questions when an edited safety answer changes the boundary", () => {
    fillBaseline();
    fillSafety();
    choose("history-knowledge", "never_performed");
    expect(visible("#availability-section")).toBe(true);

    choose("suspicious-symptoms", "yes");
    expect(resultTitle()).toBe("Atenção específica");
    expect(visible("#availability-section")).toBe(false);
  });
});

describe("Mama Guided Interview scope protections", () => {
  it("contains no generic family-history or risk-score controls", () => {
    expect(document.querySelector("#family-history")).toBeNull();
    expect(document.querySelector("#gail-score")).toBeNull();
    expect(document.querySelector("#tyrer-cuzick")).toBeNull();
    expect(document.querySelector("#boadicea")).toBeNull();
    expect(el("#known-high-risk-familial").textContent.toLowerCase()).toContain(
      "classificação formal",
    );
  });

  it("never exposes raw BI-RADS acquisition controls", () => {
    fillBaseline();
    fillSafety();
    choose("history-knowledge", "known");
    choose("history-sufficient", "yes");
    choose("prior-mammography-allows-routine", "no");
    choose("prior-mammography-needs-attention", "no");
    expect(document.body.textContent.toLowerCase()).not.toMatch(/bi-rads\s*[0-6]/);
  });
});
