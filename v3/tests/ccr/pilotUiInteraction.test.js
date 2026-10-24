// @vitest-environment happy-dom
// DOM simulation: does not replace a real browser or assistive technology audit.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { getCcrProductPolicyOptions } from "../../src/product/ccr";
const shell = readFileSync(new NodeURL("../../pilot/ccr/index.html", import.meta.url), "utf8");
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
function policy(f) {
	set("#policy", getCcrProductPolicyOptions().find((p) => p.family === f).policyId);
}
function submit() {
	el("#screening-form").dispatchEvent(new Event("submit", { cancelable: true }));
	expect(el("#error-state").classList.contains("hidden"), el("#error-state").textContent).toBe(true);
}
function actions() {
	return [...document.querySelectorAll(".action-box")].map((n) => n.textContent).join("\n");
}
function exam(kind, values) {
	el(`#add-${kind}`).click();
	const id = el("#exam-list").lastElementChild.dataset.examId;
	for (const [f, v] of Object.entries(values)) set(`[data-exam-id="${id}"][data-field="${f}"]`, v);
	return id;
}
const positive = {
	date: "2025-01-10",
	result: "positive"
};
const normal = {
	date: "2025-02-10",
	role: "post_fit_positive",
	result: "normal",
	preparation: "adequate",
	completeness: "complete",
	resolutionInformation: "sufficient"
};
beforeEach(async () => {
	vi.resetModules();
	document.body.innerHTML = shell.match(/<body>([\s\S]*)<\/body>/)[1].replace(/<script[\s\S]*?<\/script>/g, "");
	await import("../../pilot/ccr/main");
	policy("sus_oficial");
	set("#as-of", "2026-10-24");
	set("#age", "60");
	set("#screening-context", "yes");
	for (const id of [
		"prior-crc",
		"prior-polyp-surveillance",
		"colonic-ibd",
		"hereditary-syndrome",
		"specialist-care",
		"family-history"
	]) set(`#${id}`, "no");
	set("#history-knowledge", "never_performed");
});
describe("Phase 7.5 DOM interactions, not browser validation", () => {
	it("A: SUS FIT is visible; input immediately invalidates the old result", () => {
		submit();
		expect(el("#result-sections").textContent).toContain("Fazer hoje");
		expect(actions()).toContain("FIT");
		set("#age", "76");
		expect(el("#result-state").classList.contains("hidden")).toBe(true);
		expect(el("#result-notice").textContent).toContain("Dados alterados");
	});
	it("B: SUS age 76 has no routine screening action", () => {
		set("#age", "76");
		submit();
		expect(actions()).toBe("");
	});
	it.each([false, true])("C/D: FIT+ remains open with subsequent FIT-negative=%s", (negative) => {
		set("#history-knowledge", "known");
		exam("fit", positive);
		if (negative) exam("fit", {
			date: "2026-01-10",
			result: "negative"
		});
		submit();
		expect(actions()).toMatch(/colonoscopia/i);
	});
	it("E: later adequate normal diagnostic colonoscopy closes the diagnostic action", () => {
		set("#history-knowledge", "known");
		set("#history-sufficient", "yes");
		exam("fit", positive);
		exam("colonoscopy", normal);
		submit();
		expect(actions()).toBe("");
	});
	it("F: BA-A 47 preserves SharedDecision with no automatic strategy", () => {
		policy("br_ampliado");
		set("#age", "47");
		submit();
		expect(document.querySelector("[data-status=\"SharedDecision\"]")).not.toBeNull();
		expect(el("#strategy").value).toBe("unselected");
	});
	it("G: selected BA-A colonoscopy is dropped when switching to SUS", () => {
		policy("br_ampliado");
		set("#strategy", "colonoscopy");
		submit();
		expect(actions()).toMatch(/colonoscopia/i);
		policy("sus_oficial");
		submit();
		expect(el("#strategy").value).toBe("unselected");
		expect(actions()).toContain("FIT");
	});
	it("H: explicit International FIT has no concurrent colonoscopy action", () => {
		policy("internacional");
		set("#strategy", "fit");
		submit();
		expect(actions()).toContain("FIT");
		expect(actions()).not.toMatch(/colonoscopia/i);
	});
	it("I: unknown family history retains uncertainty and no definitive modality", () => {
		policy("internacional");
		set("#age", "62");
		set("#family-history", "unknown");
		set("#strategy", "fit");
		submit();
		expect(document.querySelector("[data-status=\"Due\"]")).not.toBeNull();
		expect(document.querySelector("[data-status=\"Indeterminate\"]")).not.toBeNull();
		expect(actions()).toBe("");
	});
	it("J: family route selects colonoscopy; changing to No drops old details", () => {
		policy("internacional");
		set("#family-history", "yes");
		set("#family-fdr", "1");
		set("#family-sdr", "0");
		set("#family-age-band", "under-60");
		set("#family-age-years", "42");
		set("#family-finding", "crc");
		submit();
		expect(actions()).toMatch(/colonoscopia/i);
		set("#family-history", "no");
		set("#strategy", "fit");
		submit();
		expect(actions()).toContain("FIT");
		expect(el("#family-details").classList.contains("hidden")).toBe(true);
	});
	it("K: prior CRC requires review without average-risk action", () => {
		set("#prior-crc", "yes");
		submit();
		expect(document.querySelector("[data-status=\"ClinicalReviewRequired\"]")).not.toBeNull();
		expect(actions()).toBe("");
	});
	it("L: same-day exams preserve Indeterminate", () => {
		set("#history-knowledge", "known");
		exam("fit", positive);
		exam("colonoscopy", {
			...normal,
			date: positive.date
		});
		submit();
		expect(document.querySelector("[data-status=\"Indeterminate\"]")).not.toBeNull();
	});
	it("FIT not_performed hides performed fields and ignores the former positive result", () => {
		const id = exam("fit", positive);
		set(`[data-exam-id="${id}"][data-field="status"]`, "not_performed");
		expect(el(`[data-exam-id="${id}"][data-field="result"]`).closest("label").classList.contains("hidden")).toBe(true);
		submit();
		expect(actions()).toContain("FIT");
	});
	it("unknown-status colonoscopy does not resolve FIT+", () => {
		set("#history-knowledge", "known");
		exam("fit", positive);
		const id = exam("colonoscopy", normal);
		set(`[data-exam-id="${id}"][data-field="status"]`, "unknown");
		submit();
		expect(actions()).toMatch(/colonoscopia/i);
	});
	it("never_performed drops stale sufficiency from known history", () => {
		set("#history-knowledge", "known");
		set("#history-sufficient", "yes");
		set("#history-knowledge", "never_performed");
		submit();
		expect(el("#history-sufficient-wrap").classList.contains("hidden")).toBe(true);
		expect(actions()).toContain("FIT");
	});
	it("focus follows results/errors and add/remove; removing invalidates output", () => {
		submit();
		expect(document.activeElement).toBe(el("#result-panel"));
		const id = exam("fit", {});
		expect(document.activeElement).toBe(el(`[data-exam-id="${id}"][data-field="status"]`));
		submit();
		el(`[data-remove="${id}"]`).click();
		expect(document.activeElement).toBe(el("#add-fit"));
		expect(el("#result-state").classList.contains("hidden")).toBe(true);
		set("#as-of", "");
		el("#screening-form").dispatchEvent(new Event("submit", { cancelable: true }));
		expect(document.activeElement).toBe(el("#result-panel"));
		expect(el("#error-state").classList.contains("hidden")).toBe(false);
	});
	it("date HTML remains literal on rebuild; reset clears patient and events", () => {
		const payload = "\"><img id=\"injected-date\" src=\"bad\">";
		const id = exam("fit", { date: payload });
		exam("fit", {});
		expect(document.querySelector("#injected-date")).toBeNull();
		expect(el(`input[data-exam-id="${id}"]`).value).toBe(payload);
		el("#clear-form").click();
		expect(el("#exam-list").children).toHaveLength(0);
		expect(el("#age").value).toBe("");
	});
});
