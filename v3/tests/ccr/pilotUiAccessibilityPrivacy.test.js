// @vitest-environment happy-dom
// Structural accessibility/privacy gate. Real browser + assistive-technology checks remain mandatory.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { getCcrProductPolicyOptions } from "../../src/product/ccr";

const shell = readFileSync(
  new NodeURL("../../pilot/ccr/index.html", import.meta.url),
  "utf8",
);
const mainSource = readFileSync(
  new NodeURL("../../pilot/ccr/main.ts", import.meta.url),
  "utf8",
);
const polishSource = readFileSync(
  new NodeURL("../../pilot/ccr/polish.ts", import.meta.url),
  "utf8",
);
const styles = readFileSync(
  new NodeURL("../../pilot/ccr/styles.css", import.meta.url),
  "utf8",
);
const polishStyles = readFileSync(
  new NodeURL("../../pilot/ccr/polish.css", import.meta.url),
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

beforeEach(async () => {
  vi.resetModules();
  document.body.innerHTML = shell
    .match(/<body>([\s\S]*)<\/body>/)[1]
    .replace(/<script[\s\S]*?<\/script>/g, "");
  await import("../../pilot/ccr/main");
  await import("../../pilot/ccr/polish");
  await Promise.resolve();
  await Promise.resolve();
});

describe("Phase 7.5 accessibility structure", () => {
  it("uses native radio groups with fieldset/legend and stable names", () => {
    const groups = [...document.querySelectorAll(".choice-group")];
    expect(groups.length).toBeGreaterThan(0);
    for (const group of groups) {
      expect(group.tagName).toBe("FIELDSET");
      expect(group.querySelector("legend")?.textContent?.trim().length).toBeGreaterThan(0);
      const radios = [...group.querySelectorAll('input[type="radio"]')];
      expect(radios.length).toBeGreaterThan(0);
      const names = new Set(radios.map(radio => radio.name));
      expect(names.size).toBe(1);
      expect([...names][0]).toBe(group.id);
      expect(radios.every(radio => radio.closest("label") !== null)).toBe(true);
    }
    expect(mainSource).not.toMatch(/addEventListener\(["']keydown["']/);
  });

  it("keeps native disclosure controls and accessible result announcements", () => {
    expect(el("#result-panel").getAttribute("tabindex")).toBe("-1");
    expect(el("#result-panel").getAttribute("aria-label")).toBe("Resultado da avaliação");
    expect(el("#result-notice").getAttribute("role")).toBe("status");
    expect(el("#result-notice").getAttribute("aria-live")).toBe("polite");
    expect(el("#technical-details").tagName).toBe("DETAILS");
    expect(el("#technical-details > summary").tagName).toBe("SUMMARY");
  });

  it("moves focus deliberately on edit, finish, evaluation and requested follow-up", () => {
    completeAverageRisk("br_ampliado");
    el("#screening-form").dispatchEvent(new Event("submit", { cancelable: true }));
    expect(document.activeElement).toBe(el("#result-panel"));

    const responder = [...document.querySelectorAll("#followup-request button")]
      .find(button => /Responder agora/i.test(button.textContent ?? ""));
    expect(responder).toBeTruthy();
    responder.click();
    expect(document.activeElement?.closest("#strategy")).not.toBeNull();

    set("#strategy", "fit");
    el("#screening-form").dispatchEvent(new Event("submit", { cancelable: true }));
    expect(document.activeElement).toBe(el("#result-panel"));

    const edit = el("#strategy-section .edit-step");
    expect(edit.getAttribute("aria-controls")).toBe("strategy-section-body");
    edit.click();
    expect(document.activeElement?.closest("#strategy-section-body")).not.toBeNull();

    el("#strategy-section .finish-edit").click();
    expect(document.activeElement).not.toBe(document.body);
  });

  it("exposes visible focus and responsive touch-size contracts in CSS", () => {
    expect(styles).toMatch(/:focus-visible\s*\{/);
    expect(styles).toMatch(/label:focus-within/);
    expect(styles).toMatch(/@media\s*\(max-width:\s*980px\)/);
    expect(styles).toMatch(/@media\s*\(max-width:\s*640px\)/);
    expect(styles).toMatch(/font-size:\s*16px/);
    expect(styles).toMatch(/min-height:\s*44px/);
    expect(`${styles}\n${polishStyles}`).not.toMatch(/overflow\s*:\s*(auto|scroll)/);
  });
});

describe("Phase 7.5 pilot privacy/static network gate", () => {
  it("does not introduce browser persistence, analytics or patient-data transport APIs", () => {
    const source = `${mainSource}\n${polishSource}`;
    expect(source).not.toMatch(/\b(localStorage|sessionStorage|indexedDB)\b/);
    expect(source).not.toMatch(/\b(XMLHttpRequest|WebSocket|EventSource)\b/);
    expect(source).not.toMatch(/navigator\.sendBeacon/);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/analytics|gtag\s*\(|mixpanel|segment\./i);
  });

  it("states session-only exam handling in the visible pilot copy", () => {
    expect(shell).toContain("eles ficam apenas em memória nesta sessão");
    expect(shell).toContain('autocomplete="off"');
    expect(shell).toContain('meta name="robots" content="noindex,nofollow"');
  });
});