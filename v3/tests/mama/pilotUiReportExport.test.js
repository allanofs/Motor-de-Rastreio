// @vitest-environment happy-dom
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
  const found = getMamaProductPolicyOptions().find(
    (candidate) => candidate.family === family,
  );
  if (!found) throw new Error(`Missing policy ${family}`);
  set("#policy", found.policyId);
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

function baseline({ family = "sus_oficial", age = "55" } = {}) {
  policy(family);
  set("#as-of", "2026-10-27");
  set("#age", age);
  choose("screening-context", "yes");
  choose("relevant-breast-tissue", "yes");
  fillSafety();
}

function submit() {
  el("#screening-form").dispatchEvent(
    new Event("submit", { cancelable: true, bubbles: true }),
  );
}

function exportVisible() {
  return !el("#report-export").classList.contains("hidden");
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
}

beforeEach(async () => {
  vi.restoreAllMocks();
  vi.resetModules();
  document.body.innerHTML = shell
    .match(/<body>([\s\S]*)<\/body>/)[1]
    .replace(/<script[\s\S]*?<\/script>/g, "");
  await import("../../pilot/mama/main");
  await import("../../pilot/mama/reportUi");
  await settle();
});

describe("Mama local report export UI", () => {
  it("keeps export hidden while a due mammography still needs availability", async () => {
    baseline();
    choose("history-knowledge", "never_performed");
    expect(el("#result-title").textContent).toBe("Rastreamento indicado");

    submit();
    await settle();
    expect(exportVisible()).toBe(false);
  });

  it("shows export for the exact current due evaluation and invalidates it immediately after an edit", async () => {
    baseline();
    choose("history-knowledge", "never_performed");
    choose("mammography-availability", "available");
    submit();
    await settle();

    expect(el("#result-title").textContent).toBe("Rastreamento indicado");
    expect(exportVisible()).toBe(true);

    set("#age", "56");
    expect(exportVisible()).toBe(false);

    submit();
    await settle();
    expect(exportVisible()).toBe(true);
  });

  it("exports an under-40 DecisionContext report without inventing a track carrier", async () => {
    baseline({ age: "35" });
    choose("history-knowledge", "never_performed");
    submit();
    await settle();

    expect(el("#result-title").textContent).toBe("Rastreamento não indicado");
    expect(exportVisible()).toBe(true);

    let written = "";
    const fakeReportWindow = {
      opener: window,
      document: {
        open: vi.fn(),
        write: vi.fn((html) => {
          written = html;
        }),
        close: vi.fn(),
        getElementById: vi.fn(() => ({ addEventListener: vi.fn() })),
      },
      print: vi.fn(),
      focus: vi.fn(),
    };
    vi.spyOn(window, "open").mockReturnValue(fakeReportWindow);

    el("#export-report").click();
    expect(written).toContain("Rastreamento não indicado");
    expect(written).toContain("decision_context");
    expect(written).toContain("Referências utilizadas nesta conclusão");
    expect(fakeReportWindow.opener).toBeNull();
    expect(el("#report-export-status").textContent).toMatch(/nova aba/i);
  });

  it("keeps export hidden for MORE_INFORMATION_NEEDED", async () => {
    policy("sus_oficial");
    set("#as-of", "2026-10-27");
    set("#age", "55");
    choose("screening-context", "yes");
    choose("relevant-breast-tissue", "yes");
    fillSafety({ "high-risk-genetic": "unknown" });

    expect(el("#result-title").textContent).toBe(
      "Próxima informação necessária",
    );
    submit();
    await settle();
    expect(exportVisible()).toBe(false);
  });

  it("allows an exportable specific-attention conclusion without adding deep management", async () => {
    baseline();
    choose("high-risk-genetic", "yes");
    expect(el("#result-title").textContent).toBe("Atenção específica");

    submit();
    await settle();
    expect(exportVisible()).toBe(true);
    expect(el("#result-actions").textContent).not.toMatch(
      /biópsia|ressonância|ultrassom|tratamento/i,
    );
  });

  it("reports a blocked popup without persisting or transmitting the report", async () => {
    baseline({ age: "35" });
    choose("history-knowledge", "never_performed");
    submit();
    await settle();
    expect(exportVisible()).toBe(true);

    vi.spyOn(window, "open").mockReturnValue(null);
    el("#export-report").click();
    expect(el("#report-export-status").textContent).toMatch(/pop-ups/i);
  });
});
