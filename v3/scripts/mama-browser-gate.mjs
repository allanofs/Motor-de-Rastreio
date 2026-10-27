import { execFileSync, spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PREVIEW_URL = process.env.MAMA_PREVIEW_URL ?? "http://127.0.0.1:4174/";
const DEVTOOLS_PORT = 9222;
const ARTIFACT_DIR = new URL("../browser-artifacts/", import.meta.url);

function fail(message, detail) {
  const suffix = detail === undefined ? "" : `\n${JSON.stringify(detail, null, 2)}`;
  throw new Error(`${message}${suffix}`);
}

function assert(condition, message, detail) {
  if (!condition) fail(message, detail);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(check, label, timeoutMs = 10_000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const value = await check();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await sleep(100);
  }
  fail(`Timeout waiting for ${label}`, lastError instanceof Error ? lastError.message : lastError);
}

function chromeExecutable() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  const command = "command -v google-chrome || command -v google-chrome-stable || command -v chromium || command -v chromium-browser";
  const result = execFileSync("bash", ["-lc", command], { encoding: "utf8" }).trim();
  if (!result) fail("No Chromium/Chrome executable found on runner");
  return result;
}

class CdpPage {
  constructor(webSocketUrl) {
    this.webSocketUrl = webSocketUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.webSocketUrl);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("WebSocket open timeout")), 5_000);
      this.ws.addEventListener("open", () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });
      this.ws.addEventListener("error", (event) => {
        clearTimeout(timer);
        reject(new Error(`WebSocket error: ${String(event)}`));
      }, { once: true });
    });

    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id !== undefined) {
        const pending = this.pending.get(message.id);
        if (pending === undefined) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
        else pending.resolve(message.result ?? {});
        return;
      }
      const callbacks = this.listeners.get(message.method) ?? [];
      for (const callback of callbacks) callback(message.params ?? {});
    });
  }

  on(method, callback) {
    const callbacks = this.listeners.get(method) ?? [];
    callbacks.push(callback);
    this.listeners.set(method, callbacks);
  }

  send(method, params = {}) {
    const id = this.nextId++;
    const promise = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
    this.ws.send(JSON.stringify({ id, method, params }));
    return promise;
  }

  async evaluate(expression) {
    const response = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (response.exceptionDetails) fail("Browser evaluation failed", response.exceptionDetails);
    return response.result?.value;
  }

  close() {
    this.ws?.close();
  }
}

async function setViewport(page, width, height, mobile) {
  await page.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height,
  });
  await sleep(150);
}

async function screenshot(page, filename) {
  const response = await page.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: true,
  });
  await writeFile(new URL(filename, ARTIFACT_DIR), Buffer.from(response.data, "base64"));
}

async function dispatchTab(page) {
  const common = {
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
  };
  await page.send("Input.dispatchKeyEvent", { type: "rawKeyDown", ...common });
  await page.send("Input.dispatchKeyEvent", { type: "keyUp", ...common });
  await sleep(80);
}

async function main() {
  await mkdir(ARTIFACT_DIR, { recursive: true });

  const profile = join(tmpdir(), `mama-browser-gate-${process.pid}`);
  const chrome = spawn(chromeExecutable(), [
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-default-apps",
    "--disable-sync",
    "--metrics-recording-only",
    "--no-first-run",
    `--remote-debugging-port=${DEVTOOLS_PORT}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ], { stdio: "ignore" });

  try {
    await waitFor(async () => {
      const response = await fetch(`http://127.0.0.1:${DEVTOOLS_PORT}/json/version`);
      return response.ok;
    }, "Chrome DevTools endpoint");

    const targetResponse = await fetch(
      `http://127.0.0.1:${DEVTOOLS_PORT}/json/new?${encodeURIComponent("about:blank")}`,
      { method: "PUT" },
    );
    assert(targetResponse.ok, "Could not create Chrome page target", targetResponse.status);
    const target = await targetResponse.json();
    const page = new CdpPage(target.webSocketDebuggerUrl);
    await page.connect();

    const networkRequests = [];
    const runtimeErrors = [];
    const consoleErrors = [];
    page.on("Network.requestWillBeSent", ({ request }) => networkRequests.push(request.url));
    page.on("Runtime.exceptionThrown", ({ exceptionDetails }) => runtimeErrors.push(exceptionDetails));
    page.on("Runtime.consoleAPICalled", ({ type, args }) => {
      if (type === "error") consoleErrors.push(args.map((arg) => arg.value ?? arg.description ?? "").join(" "));
    });

    await page.send("Page.enable");
    await page.send("Runtime.enable");
    await page.send("Network.enable");

    await setViewport(page, 1440, 900, false);
    await page.send("Page.navigate", { url: PREVIEW_URL });
    await waitFor(
      async () => (await page.evaluate("document.readyState")) === "complete",
      "Mama pilot document load",
    );
    await waitFor(
      async () => (await page.evaluate("document.querySelector('#policy')?.options.length ?? 0")) > 1,
      "Mama policy options",
    );

    const desktop = await page.evaluate(`(() => {
      const journey = document.querySelector('.journey-panel').getBoundingClientRect();
      const workspace = document.querySelector('.workspace').getBoundingClientRect();
      return {
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        sideBySide: journey.right <= workspace.left + 2,
        journeyWidth: journey.width,
        workspaceWidth: workspace.width,
      };
    })()`);
    assert(desktop.scrollWidth <= desktop.width + 1, "Desktop viewport has horizontal overflow", desktop);
    assert(desktop.sideBySide, "Desktop layout is not two-column", desktop);
    assert(desktop.journeyWidth > 200 && desktop.workspaceWidth > 500, "Desktop columns collapsed unexpectedly", desktop);

    await page.evaluate("document.querySelector('#policy').focus(); true");
    await dispatchTab(page);
    const tab1 = await page.evaluate("document.activeElement?.id");
    assert(tab1 === "as-of", "Keyboard Tab from policy did not reach as-of", { activeElement: tab1 });

    const dateTabSequence = [];
    let reachedAge = false;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await dispatchTab(page);
      const active = await page.evaluate("document.activeElement?.id");
      dateTabSequence.push(active ?? "");
      if (active === "age") {
        reachedAge = true;
        break;
      }
      assert(
        active === "as-of",
        "Keyboard traversal left the native date control in an unexpected direction",
        { activeElement: active, dateTabSequence },
      );
    }
    assert(
      reachedAge,
      "Keyboard traversal through native date subcontrols did not eventually reach age",
      { dateTabSequence },
    );

    await page.evaluate(`(() => {
      window.__mamaGate = {
        setValue(selector, value) {
          const node = document.querySelector(selector);
          if (!node) throw new Error('Missing ' + selector);
          node.value = value;
          node.dispatchEvent(new Event('input', { bubbles: true }));
          node.dispatchEvent(new Event('change', { bubbles: true }));
        },
        choose(groupId, value) {
          const node = document.querySelector('#' + groupId + ' input[value="' + value + '"]');
          if (!node) throw new Error('Missing choice ' + groupId + ':' + value);
          node.click();
        },
      };
      return true;
    })()`);

    const susPolicy = await page.evaluate(`(() => {
      const options = [...document.querySelector('#policy').options];
      return (options.find((item) => /sus/i.test(item.textContent ?? '')) ?? options[1])?.value ?? '';
    })()`);
    assert(Boolean(susPolicy), "No usable Mama policy in real browser");

    await page.evaluate(`window.__mamaGate.setValue('#policy', ${JSON.stringify(susPolicy)}); true`);
    await page.evaluate("window.__mamaGate.setValue('#as-of', '2026-10-27'); true");
    await page.evaluate("window.__mamaGate.setValue('#age', '55'); true");
    await waitFor(async () => await page.evaluate("!document.querySelector('#context-section').classList.contains('hidden')"), "context disclosure");

    await page.evaluate("window.__mamaGate.choose('screening-context', 'yes'); true");
    await page.evaluate("window.__mamaGate.choose('relevant-breast-tissue', 'yes'); true");
    await waitFor(async () => await page.evaluate("!document.querySelector('#safety-section').classList.contains('hidden')"), "safety disclosure");

    for (const id of [
      "suspicious-symptoms",
      "prior-breast-cancer",
      "high-risk-genetic",
      "known-high-risk-familial",
      "high-risk-chest-radiation",
      "high-risk-lesion",
      "specific-care-active",
    ]) {
      await page.evaluate(`window.__mamaGate.choose(${JSON.stringify(id)}, 'no'); true`);
    }
    await waitFor(async () => await page.evaluate("!document.querySelector('#history-section').classList.contains('hidden')"), "history disclosure");

    await page.evaluate("window.__mamaGate.choose('history-knowledge', 'never_performed'); true");
    await waitFor(async () => (await page.evaluate("document.querySelector('#result-title')?.textContent?.trim()")) === "Rastreamento indicado", "governed due result");
    await waitFor(async () => await page.evaluate("!document.querySelector('#availability-section').classList.contains('hidden')"), "availability disclosure");

    const finalDesktop = await page.evaluate(`(() => ({
      title: document.querySelector('#result-title')?.textContent?.trim(),
      availabilityVisible: !document.querySelector('#availability-section').classList.contains('hidden'),
      errorVisible: !document.querySelector('#error-state').classList.contains('hidden'),
      scrollWidth: document.documentElement.scrollWidth,
      width: innerWidth,
    }))()`);
    assert(finalDesktop.title === "Rastreamento indicado", "Unexpected governed result in Chrome", finalDesktop);
    assert(finalDesktop.availabilityVisible, "Due flow did not reveal operational availability", finalDesktop);
    assert(!finalDesktop.errorVisible, "Real-browser flow surfaced an error", finalDesktop);
    assert(finalDesktop.scrollWidth <= finalDesktop.width + 1, "Completed desktop flow overflowed horizontally", finalDesktop);
    await screenshot(page, "mama-desktop.png");

    await setViewport(page, 390, 844, true);
    const mobile = await page.evaluate(`(() => {
      const journey = document.querySelector('.journey-panel').getBoundingClientRect();
      const workspace = document.querySelector('.workspace').getBoundingClientRect();
      const buttons = [...document.querySelectorAll('.form-actions button, .button-row button')]
        .filter((node) => getComputedStyle(node).display !== 'none')
        .map((node) => node.getBoundingClientRect().width);
      return {
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        stacked: journey.bottom <= workspace.top + 2,
        journeyWidth: journey.width,
        workspaceWidth: workspace.width,
        buttonWidths: buttons,
      };
    })()`);
    assert(mobile.scrollWidth <= mobile.width + 1, "Mobile viewport has horizontal overflow", mobile);
    assert(mobile.stacked, "Mobile layout did not stack journey and workspace", mobile);
    assert(mobile.journeyWidth <= mobile.width && mobile.workspaceWidth <= mobile.width, "Mobile panels exceed viewport", mobile);
    assert(mobile.buttonWidths.every((width) => width <= mobile.width), "Mobile button exceeds viewport", mobile);
    await screenshot(page, "mama-mobile.png");

    const externalRequests = networkRequests.filter((url) => {
      try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) return false;
        return !["127.0.0.1", "localhost"].includes(parsed.hostname);
      } catch {
        return false;
      }
    });

    assert(externalRequests.length === 0, "Pilot made external network requests", externalRequests);
    assert(runtimeErrors.length === 0, "Runtime exceptions occurred in real Chrome", runtimeErrors);
    assert(consoleErrors.length === 0, "console.error occurred in real Chrome", consoleErrors);

    const report = {
      previewUrl: PREVIEW_URL,
      browser: "Chrome/Chromium via DevTools Protocol",
      desktop,
      keyboard: { policyTo: tab1, dateTabSequence, reachedAge },
      governedFlow: finalDesktop,
      mobile,
      networkRequestCount: networkRequests.length,
      externalRequests,
      runtimeErrorCount: runtimeErrors.length,
      consoleErrorCount: consoleErrors.length,
      status: "PASS",
    };
    await writeFile(new URL("report.json", ARTIFACT_DIR), `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify(report, null, 2));
    page.close();
  } finally {
    chrome.kill("SIGTERM");
  }
}

main().catch(async (error) => {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(
    new URL("failure.txt", ARTIFACT_DIR),
    `${error instanceof Error ? error.stack ?? error.message : String(error)}\n`,
  );
  console.error(error);
  process.exitCode = 1;
});
