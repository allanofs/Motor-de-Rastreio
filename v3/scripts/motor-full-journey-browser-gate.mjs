import { execFileSync, spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PREVIEW_ORIGIN = process.env.MOTOR_JOURNEY_ORIGIN ?? "http://127.0.0.1:4176";
const SHELL_URL = `${PREVIEW_ORIGIN}/shell/index.html`;
const DEVTOOLS_PORT = 9231;
const ARTIFACT_DIR = new URL("../journey-browser-artifacts/", import.meta.url);
const EVALUATION_DATE = "2026-10-28";
const BIRTH_DATE = "1960-01-01";

function fail(message, detail) {
  throw new Error(`${message}${detail === undefined ? "" : `\n${JSON.stringify(detail, null, 2)}`}`);
}
function assert(condition, message, detail) { if (!condition) fail(message, detail); }
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
async function waitFor(check, label, timeoutMs = 15_000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try { const value = await check(); if (value) return value; } catch (error) { lastError = error; }
    await sleep(100);
  }
  fail(`Timeout waiting for ${label}`, lastError instanceof Error ? lastError.message : lastError);
}
function chromeExecutable() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  const result = execFileSync("bash", ["-lc", "command -v google-chrome || command -v google-chrome-stable || command -v chromium || command -v chromium-browser"], { encoding: "utf8" }).trim();
  if (!result) fail("No Chromium/Chrome executable found on runner");
  return result;
}

class CdpPage {
  constructor(webSocketUrl) { this.webSocketUrl = webSocketUrl; this.nextId = 1; this.pending = new Map(); this.listeners = new Map(); }
  async connect() {
    this.ws = new WebSocket(this.webSocketUrl);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("WebSocket open timeout")), 5_000);
      this.ws.addEventListener("open", () => { clearTimeout(timer); resolve(); }, { once: true });
      this.ws.addEventListener("error", () => { clearTimeout(timer); reject(new Error("WebSocket error")); }, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id !== undefined) {
        const pending = this.pending.get(message.id); if (pending === undefined) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(JSON.stringify(message.error))); else pending.resolve(message.result ?? {});
        return;
      }
      for (const callback of this.listeners.get(message.method) ?? []) callback(message.params ?? {});
    });
  }
  on(method, callback) { const callbacks = this.listeners.get(method) ?? []; callbacks.push(callback); this.listeners.set(method, callbacks); }
  send(method, params = {}) { const id = this.nextId++; const promise = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject })); this.ws.send(JSON.stringify({ id, method, params })); return promise; }
  async evaluate(expression) { const response = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if (response.exceptionDetails) fail("Browser evaluation failed", response.exceptionDetails); return response.result?.value; }
  close() { this.ws?.close(); }
}

async function screenshot(page, filename) { const response = await page.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: true }); await writeFile(new URL(filename, ARTIFACT_DIR), Buffer.from(response.data, "base64")); }
async function setViewport(page, width, height, mobile = false) { await page.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height }); await sleep(100); }
async function waitForPath(page, path) { return waitFor(async () => { const href = await page.evaluate("location.href"); return href.includes(path) ? href : false; }, `navigation to ${path}`); }
async function click(page, selector) { const ok = await page.evaluate(`(() => { const node = document.querySelector(${JSON.stringify(selector)}); if (!(node instanceof HTMLElement)) return false; node.click(); return true; })()`); assert(ok, `Could not click ${selector}`); }
async function setValue(page, selector, value) {
  const ok = await page.evaluate(`(() => { const node = document.querySelector(${JSON.stringify(selector)}); if (!(node instanceof HTMLInputElement || node instanceof HTMLSelectElement)) return false; node.value = ${JSON.stringify(value)}; node.dispatchEvent(new Event('input', { bubbles: true })); node.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  assert(ok, `Could not set ${selector}`);
}
async function selectFirstPolicy(page) {
  const value = await page.evaluate(`(() => { const select = document.querySelector('#policy'); if (!(select instanceof HTMLSelectElement)) return ''; return Array.from(select.options).find((o) => o.value !== '')?.value ?? ''; })()`);
  assert(value !== "", "No policy option available"); await setValue(page, "#policy", value); return value;
}

async function submitSharedContext(page, expectReuse) {
  await waitFor(async () => await page.evaluate("document.querySelector('#shared-context-dialog')?.open === true"), "shared context dialog");
  const before = await page.evaluate(`(() => ({ reused: document.querySelector('#shared-context-dialog')?.dataset.reusedContext, evaluationDate: document.querySelector('#shared-evaluation-date')?.value, birthDate: document.querySelector('#shared-birth-date')?.value, copy: document.querySelector('#shared-context-copy')?.textContent ?? '' }))()`);
  if (expectReuse) {
    assert(before.reused === "true", "Second module did not disclose shared-context reuse", before);
    assert(before.evaluationDate === EVALUATION_DATE, "Evaluation date was not reused", before);
    assert(before.birthDate === BIRTH_DATE, "Birth date was not reused", before);
    assert(before.copy.includes("Contexto já informado"), "Reuse disclosure copy missing", before);
  } else {
    await setValue(page, "#shared-evaluation-date", EVALUATION_DATE);
    await setValue(page, "#shared-birth-date", BIRTH_DATE);
  }
  const ok = await page.evaluate(`(() => { const form = document.querySelector('#shared-context-form'); if (!(form instanceof HTMLFormElement)) return false; form.requestSubmit(); return true; })()`);
  assert(ok, "Could not submit shared context dialog"); return before;
}

async function waitForSharedProjection(page, label) {
  return waitFor(async () => {
    const state = await page.evaluate(`(() => ({ asOf: document.querySelector('#as-of')?.value ?? '', age: document.querySelector('#age')?.value ?? '', source: document.querySelector('#as-of')?.dataset.sharedSource ?? '', carrier: window.name }))()`);
    return state.asOf === EVALUATION_DATE && state.age === "66" ? state : false;
  }, `${label} shared-context projection`, 8_000);
}

async function completeCcrOutsideRoutine(page) {
  await waitFor(async () => (await page.evaluate("document.querySelector('#policy')?.options.length ?? 0")) > 1, "CCR policies");
  const shared = await waitForSharedProjection(page, "CCR"); assert(shared.source !== "", "CCR shared evaluation-date provenance missing", shared);
  await selectFirstPolicy(page);
  await waitFor(async () => !(await page.evaluate("document.querySelector('#context-section')?.classList.contains('hidden')")), "CCR context step");
  await setValue(page, "#screening-context", "no");
  await waitFor(async () => !(await page.evaluate("document.querySelector('#form-actions')?.classList.contains('hidden')")), "CCR evaluate action");
  await click(page, "#evaluate-button");
  await waitFor(async () => !(await page.evaluate("document.querySelector('#result-state')?.classList.contains('hidden')")), "CCR result");
  await click(page, '[data-motor-return="ccr"] button');
}
async function completeMamaOutsideRoutine(page) {
  await waitFor(async () => (await page.evaluate("document.querySelector('#policy')?.options.length ?? 0")) > 1, "Mama policies");
  const shared = await waitForSharedProjection(page, "Mama"); assert(shared.source !== "", "Mama shared evaluation-date provenance missing", shared);
  await selectFirstPolicy(page);
  await waitFor(async () => !(await page.evaluate("document.querySelector('#context-section')?.classList.contains('hidden')")), "Mama context step");
  await setValue(page, "#screening-context", "no");
  await setValue(page, "#relevant-breast-tissue", "yes");
  await waitFor(async () => !(await page.evaluate("document.querySelector('#result-region')?.classList.contains('hidden')")), "Mama result");
  await click(page, '[data-motor-return="mama"] button');
}

async function main() {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const profile = join(tmpdir(), `motor-full-journey-${process.pid}`);
  const chrome = spawn(chromeExecutable(), ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--disable-background-networking", "--disable-component-update", "--disable-default-apps", "--disable-sync", "--metrics-recording-only", "--no-first-run", `--remote-debugging-port=${DEVTOOLS_PORT}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
  let page;
  const evidence = { evaluationDate: EVALUATION_DATE, birthDate: BIRTH_DATE };
  try {
    await waitFor(async () => { try { return (await fetch(`http://127.0.0.1:${DEVTOOLS_PORT}/json/version`)).ok; } catch { return false; } }, "Chrome DevTools endpoint", 20_000);
    const targetResponse = await fetch(`http://127.0.0.1:${DEVTOOLS_PORT}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
    assert(targetResponse.ok, "Could not create Chrome page target", targetResponse.status);
    const target = await targetResponse.json(); page = new CdpPage(target.webSocketDebuggerUrl); await page.connect();
    const networkRequests = [], runtimeErrors = [], consoleErrors = [];
    page.on("Network.requestWillBeSent", ({ request }) => networkRequests.push(request.url));
    page.on("Runtime.exceptionThrown", ({ exceptionDetails }) => runtimeErrors.push(exceptionDetails));
    page.on("Runtime.consoleAPICalled", ({ type, args }) => { if (type === "error") consoleErrors.push(args.map((arg) => arg.value ?? arg.description ?? "").join(" ")); });
    await page.send("Page.enable"); await page.send("Runtime.enable"); await page.send("Network.enable"); await setViewport(page, 1440, 1000);
    await page.send("Page.navigate", { url: SHELL_URL }); await waitForPath(page, "/shell/index.html"); await waitFor(async () => (await page.evaluate("document.readyState")) === "complete", "Shell document load");

    await click(page, '[data-module-link="ccr"]'); await submitSharedContext(page, false); await waitForPath(page, "/ccr/index.html"); await completeCcrOutsideRoutine(page);
    await waitForPath(page, "/shell/index.html");
    await waitFor(async () => await page.evaluate("document.querySelector('[data-returned-module-status=\"ccr\"]')?.hidden === false"), "CCR summary on Shell");
    const afterCcr = await page.evaluate(`(() => ({ ccrVisible: document.querySelector('[data-returned-module-status="ccr"]')?.hidden === false, mamaVisible: document.querySelector('[data-returned-module-status="mama"]')?.hidden === false, carrierCleared: window.name === '' }))()`);
    assert(afterCcr.ccrVisible && !afterCcr.mamaVisible && afterCcr.carrierCleared, "Invalid Shell state after CCR", afterCcr); evidence.afterCcr = afterCcr; await screenshot(page, "after-ccr-return.png");

    await click(page, '[data-module-link="mama"]'); evidence.reusedDialog = await submitSharedContext(page, true); await waitForPath(page, "/mama/index.html"); await completeMamaOutsideRoutine(page);
    await waitForPath(page, "/shell/index.html");
    await waitFor(async () => await page.evaluate(`document.querySelector('[data-returned-module-status="ccr"]')?.hidden === false && document.querySelector('[data-returned-module-status="mama"]')?.hidden === false`), "both independent module summaries on Shell");
    const finalState = await page.evaluate(`(() => { const text = document.body.innerText; return { ccr: document.querySelector('[data-returned-module-status="ccr"]')?.textContent?.trim() ?? '', mama: document.querySelector('[data-returned-module-status="mama"]')?.textContent?.trim() ?? '', ccrAction: document.querySelector('[data-module-id="ccr"] [data-module-link="ccr"]')?.textContent?.trim() ?? '', mamaAction: document.querySelector('[data-module-id="mama"] [data-module-link="mama"]')?.textContent?.trim() ?? '', carrierCleared: window.name === '', localStorageLength: localStorage.length, sessionStorageLength: sessionStorage.length, href: location.href, forbiddenCombinedCopy: /todos.*em dia|prevenção.*em dia|status preventivo global|risco global|prioridade global/i.test(text) }; })()`);
    assert(finalState.ccr && finalState.mama, "Independent final summaries missing", finalState);
    assert(finalState.ccrAction.includes("Revisar avaliação") && finalState.mamaAction.includes("Revisar avaliação"), "Final cards are not independently revisable", finalState);
    assert(finalState.carrierCleared, "Final return carrier was not consumed", finalState);
    assert(finalState.localStorageLength === 0 && finalState.sessionStorageLength === 0, "Browser storage was used", finalState);
    assert(!finalState.href.includes("?") && !finalState.href.includes("#"), "Session state leaked into URL", finalState);
    assert(!finalState.forbiddenCombinedCopy, "Forbidden combined preventive conclusion rendered", finalState);
    assert(runtimeErrors.length === 0, "Runtime errors occurred", runtimeErrors); assert(consoleErrors.length === 0, "Console errors occurred", consoleErrors);
    const externalRequests = networkRequests.filter((url) => /^https?:/i.test(url) && !url.startsWith(PREVIEW_ORIGIN)); assert(externalRequests.length === 0, "Unexpected external network request", externalRequests);
    Object.assign(evidence, { finalState, externalRequests, runtimeErrors, consoleErrors });
    await screenshot(page, "final-two-module-desktop.png"); await setViewport(page, 390, 844, true); await screenshot(page, "final-two-module-mobile.png");
    await writeFile(new URL("journey-evidence.json", ARTIFACT_DIR), JSON.stringify(evidence, null, 2));
  } catch (error) {
    if (page !== undefined) {
      try { await screenshot(page, "failure-state.png"); } catch {}
      try { evidence.failureState = await page.evaluate(`(() => ({ href: location.href, name: window.name, body: document.body?.innerText?.slice(0, 4000) ?? '' }))()`); } catch {}
    }
    evidence.error = error instanceof Error ? error.stack ?? error.message : String(error);
    await writeFile(new URL("journey-failure.json", ARTIFACT_DIR), JSON.stringify(evidence, null, 2)); throw error;
  } finally { page?.close(); chrome.kill("SIGTERM"); }
}

main().catch((error) => { console.error(error instanceof Error ? error.stack ?? error.message : error); process.exitCode = 1; });
