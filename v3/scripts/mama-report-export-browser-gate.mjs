import { execFileSync, spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PREVIEW_URL = process.env.MAMA_PREVIEW_URL ?? "http://127.0.0.1:4174/";
const DEVTOOLS_PORT = 9223;
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

async function waitFor(check, label, timeoutMs = 12_000) {
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
  fail(
    `Timeout waiting for ${label}`,
    lastError instanceof Error ? lastError.message : lastError,
  );
}

function chromeExecutable() {
  const command =
    "command -v google-chrome || command -v google-chrome-stable || command -v chromium || command -v chromium-browser";
  const result = execFileSync("bash", ["-lc", command], {
    encoding: "utf8",
  }).trim();
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
      const timer = setTimeout(
        () => reject(new Error("WebSocket open timeout")),
        5_000,
      );
      this.ws.addEventListener(
        "open",
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true },
      );
      this.ws.addEventListener(
        "error",
        (event) => {
          clearTimeout(timer);
          reject(new Error(`WebSocket error: ${String(event)}`));
        },
        { once: true },
      );
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
    if (response.exceptionDetails)
      fail("Browser evaluation failed", response.exceptionDetails);
    return response.result?.value;
  }

  close() {
    this.ws?.close();
  }
}

async function pageTargets() {
  const response = await fetch(`http://127.0.0.1:${DEVTOOLS_PORT}/json/list`);
  if (!response.ok) return [];
  const targets = await response.json();
  return targets.filter((target) => target.type === "page");
}

async function trustedClick(page, selector) {
  await page.evaluate(`(() => {
    const node = document.querySelector(${JSON.stringify(selector)});
    if (!node) return false;
    node.scrollIntoView({ block: 'center', inline: 'center' });
    return true;
  })()`);
  await sleep(120);
  const point = await page.evaluate(`(() => {
    const node = document.querySelector(${JSON.stringify(selector)});
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);
  assert(point !== null, `Missing click target ${selector}`);
  await page.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: point.x,
    y: point.y,
    button: "left",
    clickCount: 1,
  });
  await page.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: point.x,
    y: point.y,
    button: "left",
    clickCount: 1,
  });
}

async function screenshot(page, filename) {
  const response = await page.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: true,
  });
  await writeFile(
    new URL(filename, ARTIFACT_DIR),
    Buffer.from(response.data, "base64"),
  );
}

async function main() {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const profile = join(tmpdir(), `mama-report-export-${process.pid}`);
  const chrome = spawn(
    chromeExecutable(),
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-background-networking",
      "--disable-component-update",
      "--disable-default-apps",
      "--disable-sync",
      "--metrics-recording-only",
      "--no-first-run",
      "--disable-popup-blocking",
      `--remote-debugging-port=${DEVTOOLS_PORT}`,
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  let mainPage;
  let reportPage;
  try {
    await waitFor(
      async () => {
        const response = await fetch(
          `http://127.0.0.1:${DEVTOOLS_PORT}/json/version`,
        );
        return response.ok;
      },
      "Chrome DevTools endpoint",
      20_000,
    );

    const targetResponse = await fetch(
      `http://127.0.0.1:${DEVTOOLS_PORT}/json/new?${encodeURIComponent(PREVIEW_URL)}`,
      { method: "PUT" },
    );
    assert(targetResponse.ok, "Could not create Mama preview target");
    const target = await targetResponse.json();
    mainPage = new CdpPage(target.webSocketDebuggerUrl);
    await mainPage.connect();

    const networkRequests = [];
    const runtimeErrors = [];
    const consoleErrors = [];
    mainPage.on("Network.requestWillBeSent", ({ request }) =>
      networkRequests.push(request.url),
    );
    mainPage.on("Runtime.exceptionThrown", ({ exceptionDetails }) =>
      runtimeErrors.push(exceptionDetails),
    );
    mainPage.on("Runtime.consoleAPICalled", ({ type, args }) => {
      if (type === "error")
        consoleErrors.push(
          args.map((arg) => arg.value ?? arg.description ?? "").join(" "),
        );
    });

    await mainPage.send("Page.enable");
    await mainPage.send("Runtime.enable");
    await mainPage.send("Network.enable");
    await mainPage.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: 1440,
      screenHeight: 900,
    });

    await waitFor(
      async () =>
        (await mainPage.evaluate("document.readyState")) === "complete" &&
        (await mainPage.evaluate(
          "document.querySelector('#policy')?.options.length ?? 0",
        )) > 1 &&
        (await mainPage.evaluate(
          "document.querySelector('#report-export') !== null",
        )),
      "Mama report export UI load",
    );

    await mainPage.evaluate(`(() => {
      window.__mamaExportGate = {
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

    const susPolicy = await mainPage.evaluate(`(() => {
      const options = [...document.querySelector('#policy').options];
      return (options.find((item) => /sus/i.test(item.textContent ?? '')) ?? options[1])?.value ?? '';
    })()`);
    assert(Boolean(susPolicy), "No SUS policy option available");

    await mainPage.evaluate(
      `window.__mamaExportGate.setValue('#policy', ${JSON.stringify(susPolicy)}); true`,
    );
    await mainPage.evaluate(
      "window.__mamaExportGate.setValue('#as-of', '2026-10-27'); true",
    );
    await mainPage.evaluate(
      "window.__mamaExportGate.setValue('#age', '55'); true",
    );
    await mainPage.evaluate(
      "window.__mamaExportGate.choose('screening-context', 'yes'); true",
    );
    await mainPage.evaluate(
      "window.__mamaExportGate.choose('relevant-breast-tissue', 'yes'); true",
    );

    for (const id of [
      "suspicious-symptoms",
      "prior-breast-cancer",
      "high-risk-genetic",
      "known-high-risk-familial",
      "high-risk-chest-radiation",
      "high-risk-lesion",
      "specific-care-active",
    ]) {
      await mainPage.evaluate(
        `window.__mamaExportGate.choose(${JSON.stringify(id)}, 'no'); true`,
      );
    }

    await waitFor(
      async () =>
        await mainPage.evaluate(
          "!document.querySelector('#history-section').classList.contains('hidden')",
        ),
      "history disclosure",
    );
    await mainPage.evaluate(
      "window.__mamaExportGate.choose('history-knowledge', 'never_performed'); true",
    );
    await waitFor(
      async () =>
        (await mainPage.evaluate(
          "document.querySelector('#result-title')?.textContent?.trim()",
        )) === "Rastreamento indicado",
      "due result",
    );
    await waitFor(
      async () =>
        await mainPage.evaluate(
          "!document.querySelector('#availability-section').classList.contains('hidden')",
        ),
      "availability disclosure",
    );

    const hiddenBeforeAvailability = await mainPage.evaluate(
      "document.querySelector('#report-export').classList.contains('hidden')",
    );
    assert(
      hiddenBeforeAvailability,
      "Export appeared before requested availability input",
    );

    await mainPage.evaluate(
      "window.__mamaExportGate.choose('mammography-availability', 'available'); true",
    );
    const hiddenBeforeSubmit = await mainPage.evaluate(
      "document.querySelector('#report-export').classList.contains('hidden')",
    );
    assert(
      hiddenBeforeSubmit,
      "Export appeared before explicit current-evaluation confirmation",
    );

    await mainPage.evaluate(
      "document.querySelector('#screening-form').requestSubmit(); true",
    );
    await waitFor(
      async () =>
        await mainPage.evaluate(
          "!document.querySelector('#report-export').classList.contains('hidden')",
        ),
      "export control after current evaluation submit",
    );

    const targetsBefore = await pageTargets();
    const priorIds = new Set(targetsBefore.map((item) => item.id));
    await trustedClick(mainPage, "#export-report");

    const reportTarget = await waitFor(
      async () => {
        const targets = await pageTargets();
        return targets.find(
          (item) => !priorIds.has(item.id) && item.webSocketDebuggerUrl,
        );
      },
      "local printable report tab",
    );

    reportPage = new CdpPage(reportTarget.webSocketDebuggerUrl);
    await reportPage.connect();
    await reportPage.send("Page.enable");
    await reportPage.send("Runtime.enable");
    await reportPage.send("Emulation.setDeviceMetricsOverride", {
      width: 1100,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: 1100,
      screenHeight: 900,
    });
    await waitFor(
      async () => (await reportPage.evaluate("document.readyState")) === "complete",
      "report document ready",
    );

    const reportTab = await reportPage.evaluate(`(() => ({
      title: document.title,
      heading: document.querySelector('h1')?.textContent?.trim(),
      bodyText: document.body.textContent,
      openerIsNull: window.opener === null,
      printButton: document.querySelector('#print-report')?.textContent?.trim(),
      scrollWidth: document.documentElement.scrollWidth,
      width: innerWidth,
      externalLoadedResources: performance.getEntriesByType('resource')
        .map((entry) => entry.name)
        .filter((url) => /^https?:/i.test(url) && !/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/i.test(url)),
    }))()`);

    assert(/Relatório Mama/i.test(reportTab.title ?? ""), "Wrong report title", reportTab);
    assert(
      /rastreamento de câncer de mama/i.test(reportTab.heading ?? ""),
      "Wrong report heading",
      reportTab,
    );
    assert(
      (reportTab.bodyText ?? "").includes("Rastreamento indicado"),
      "Report lost governed result",
      reportTab,
    );
    assert(
      (reportTab.bodyText ?? "").includes(
        "Referências utilizadas nesta conclusão",
      ),
      "Report lost provenance section",
      reportTab,
    );
    assert(
      (reportTab.bodyText ?? "").includes("track_trace"),
      "Report lost provenance carrier",
      reportTab,
    );
    assert(reportTab.openerIsNull, "Report retained window.opener", reportTab);
    assert(/Imprimir/i.test(reportTab.printButton ?? ""), "No print control", reportTab);
    assert(
      reportTab.scrollWidth <= reportTab.width + 1,
      "Printable report has horizontal overflow",
      reportTab,
    );
    assert(
      reportTab.externalLoadedResources.length === 0,
      "Report loaded external resources",
      reportTab.externalLoadedResources,
    );
    await screenshot(reportPage, "mama-report.png");

    const statusAfterOpen = await mainPage.evaluate(
      "document.querySelector('#report-export-status')?.textContent?.trim()",
    );
    assert(/nova aba/i.test(statusAfterOpen ?? ""), "Main UI did not confirm local report opening");

    await mainPage.evaluate(
      "window.__mamaExportGate.setValue('#age', '56'); true",
    );
    const hiddenAfterEdit = await mainPage.evaluate(
      "document.querySelector('#report-export').classList.contains('hidden')",
    );
    assert(hiddenAfterEdit, "Editing did not invalidate export immediately");

    const externalRequests = networkRequests.filter((url) => {
      try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) return false;
        return !["127.0.0.1", "localhost"].includes(parsed.hostname);
      } catch {
        return false;
      }
    });
    assert(externalRequests.length === 0, "Pilot made external requests", externalRequests);
    assert(runtimeErrors.length === 0, "Runtime exceptions occurred", runtimeErrors);
    assert(consoleErrors.length === 0, "console.error occurred", consoleErrors);

    const result = {
      previewUrl: PREVIEW_URL,
      hiddenBeforeAvailability,
      hiddenBeforeSubmit,
      exportVisibleAfterSubmit: true,
      reportTab: {
        title: reportTab.title,
        heading: reportTab.heading,
        openerIsNull: reportTab.openerIsNull,
        printButton: reportTab.printButton,
        scrollWidth: reportTab.scrollWidth,
        width: reportTab.width,
        externalLoadedResources: reportTab.externalLoadedResources,
      },
      statusAfterOpen,
      hiddenAfterEdit,
      externalRequests,
      runtimeErrorCount: runtimeErrors.length,
      consoleErrorCount: consoleErrors.length,
      status: "PASS",
    };
    await writeFile(
      new URL("report-export.json", ARTIFACT_DIR),
      `${JSON.stringify(result, null, 2)}\n`,
    );
    console.log(JSON.stringify(result, null, 2));
  } finally {
    reportPage?.close();
    mainPage?.close();
    chrome.kill("SIGTERM");
  }
}

main().catch(async (error) => {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(
    new URL("report-export-failure.txt", ARTIFACT_DIR),
    `${error instanceof Error ? error.stack ?? error.message : String(error)}\n`,
  );
  console.error(error);
  process.exitCode = 1;
});
