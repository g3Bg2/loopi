import { BrowserWindow } from "electron";
import axios from "axios";

/**
 * State tracker for loop/conditional node execution
 */
interface LoopState {
  [nodeId: string]: number;
}

/**
 * Handles execution of automation steps in the browser window
 */
export class AutomationExecutor {
  private variables: Record<string, string> = {};

  /**
   * Initialize executor variable context with user-defined automation variables
   */
  initVariables(vars?: Record<string, string>) {
    this.variables = { ...(vars || {}) };
  }

  /**
   * Expose a shallow copy of current variables (for logging / IPC)
   */
  getVariables(): Record<string, string> {
    return { ...this.variables };
  }

  /**
   * Replace {{varName}} tokens in a string with current variable values.
   * Unknown variables resolve to an empty string.
   */
  private substituteVariables(input?: string): string {
    if (!input) return "";
    return input.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, name) => {
      return this.variables[name] ?? "";
    });
  }

  /**
   * Executes a single automation step
   * @param browserWindow - The browser window to execute the step in
   * @param step - The step configuration object
   */
  async executeStep(browserWindow: BrowserWindow, step: any): Promise<any> {
    const wc = browserWindow.webContents;

    switch (step.type) {
      case "navigate":
        await wc.loadURL(this.substituteVariables(step.value));
        break;

      case "click": {
        const clickSelector = this.substituteVariables(step.selector);
        await wc.executeJavaScript(
          `document.querySelector(${JSON.stringify(clickSelector)})?.click();`
        );
        break;
      }

      case "type": {
        const typeSelector = this.substituteVariables(step.selector);
        const typeValue = this.substituteVariables(step.value);
        await wc.executeJavaScript(`
          (() => {
            const el = document.querySelector("${typeSelector}");
            if (el) {
              el.focus();
              el.value = ${JSON.stringify(typeValue)};
              el.dispatchEvent(new Event('input', { bubbles: true }));
            }
          })();
        `);
        break;
      }

      case "wait": {
        await new Promise((resolve) => {
          const waitStr = this.substituteVariables(step.value);
          const ms = parseInt(waitStr) * 1000;
          setTimeout(resolve, isNaN(ms) ? 0 : ms);
        });
        break;
      }

      case "screenshot": {
        const img = await wc.capturePage();
        const timestamp = new Date()
          .toISOString()
          .replace(/[-:.]/g, "")
          .slice(0, 15);
        const savePath = step.savePath || `screenshot_${timestamp}.png`;
        await require("fs").promises.writeFile(savePath, img.toPNG());
        return img.toPNG().toString("base64");
      }

      case "extract": {
        const extractSelector = this.substituteVariables(step.selector);
        const extracted = await wc.executeJavaScript(
          `document.querySelector(${JSON.stringify(extractSelector)})?.innerText || "";`
        );
        if (step.storeKey) {
          this.variables[step.storeKey] = extracted;
        }
        return extracted;
      }

      case "extractWithLogic": {
        const logicSelector = this.substituteVariables(step.selector);
        const extractedValue = await wc.executeJavaScript(
          `document.querySelector(${JSON.stringify(logicSelector)})?.innerText || "";`
        );
        let conditionMet = false;

        console.log("Extracted Value:", extractedValue); // Debug log
        console.log("Expected Value:", step.expectedValue); // Debug log

        switch (step.condition) {
          case "equals":
            conditionMet = extractedValue === step.expectedValue;
            break;
          case "contains":
            conditionMet = extractedValue.includes(step.expectedValue);
            break;
          case "greaterThan":
            conditionMet =
              parseFloat(extractedValue) > parseFloat(step.expectedValue);
            break;
          case "lessThan":
            conditionMet =
              parseFloat(extractedValue) < parseFloat(step.expectedValue);
            break;
        }

        return { value: extractedValue, conditionMet };
      }

      case "apiCall": {
        try {
          const url = this.substituteVariables(step.url);
          const method = step.method || "GET";
          const rawBody = step.body ? this.substituteVariables(step.body) : undefined;
          let data: any = undefined;
          if (rawBody) {
            try {
              data = JSON.parse(rawBody);
            } catch {
              data = rawBody;
            }
          }
          const headers: Record<string, string> = {};
          if (step.headers) {
            for (const [k, v] of Object.entries(step.headers as Record<string, any>)) {
              headers[k] = this.substituteVariables(String(v));
            }
          }
          const response = await axios({ method, url, data, headers });
          const dataOut = response.data;
          if (step.storeKey) {
            try {
              this.variables[step.storeKey] = typeof dataOut === "string" ? dataOut : JSON.stringify(dataOut);
            } catch (e) {
              this.variables[step.storeKey] = String(dataOut);
            }
          }
          return dataOut;
        } catch (error) {
          console.error("API call failed:", error);
          throw error;
        }
      }

      case "scroll": {
        if (step.scrollType === "toElement") {
          const scrollSelector = this.substituteVariables(step.selector || "");
          await wc.executeJavaScript(`
            (() => {
              const el = document.querySelector(${JSON.stringify(scrollSelector)});
              if (el) el.scrollIntoView({ behavior: "smooth" });
            })();
          `);
        } else if (step.scrollType === "byAmount") {
          await wc.executeJavaScript(`window.scrollBy(0, ${step.scrollAmount || 0});`);
        }
        break;
      }

      case "selectOption": {
        const selectSelector = this.substituteVariables(step.selector);
        const optionValue = this.substituteVariables(step.optionValue);
        await wc.executeJavaScript(`
          (() => {
            const select = document.querySelector(${JSON.stringify(selectSelector)});
            if (select) {
              ${step.optionValue ? `select.value = ${JSON.stringify(optionValue)};` : `select.selectedIndex = ${step.optionIndex || 0};`}
              select.dispatchEvent(new Event('change', { bubbles: true }));
            }
          })();
        `);
        break;
      }

      case "fileUpload": {
        const fuSelector = this.substituteVariables(step.selector);
        const fuFilePath = this.substituteVariables(step.filePath);
        await wc.executeJavaScript(`
          (() => {
            const input = document.querySelector(${JSON.stringify(fuSelector)});
            if (input) {
              const file = new File([""], ${JSON.stringify(fuFilePath)}, { type: "text/plain" });
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              input.files = dataTransfer.files;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          })();
        `);
        break;
      }

      case "hover": {
        const hoverSelector = this.substituteVariables(step.selector);
        await wc.executeJavaScript(`
          (() => {
            const el = document.querySelector(${JSON.stringify(hoverSelector)});
            if (el) {
              const event = new MouseEvent('mouseover', { bubbles: true });
              el.dispatchEvent(event);
            }
          })();
        `);
        break;
      }

      case "setVariable": {
        const varName = step.variableName;
        const rawValue = this.substituteVariables(step.value);
        this.variables[varName] = rawValue;
        return rawValue;
      }

      case "modifyVariable": {
        const name = step.variableName;
        const raw = this.substituteVariables(step.value);
        const op = step.operation;
        const current = this.variables[name];
        if (op === "set") {
          this.variables[name] = raw;
          return raw;
        } else if (op === "increment") {
          const num = parseFloat(current || "0");
          const by = parseFloat(raw || "1");
          const res = num + by;
          this.variables[name] = String(res);
          return res;
        } else if (op === "decrement") {
          const num = parseFloat(current || "0");
          const by = parseFloat(raw || "1");
          const res = num - by;
          this.variables[name] = String(res);
          return res;
        } else if (op === "append") {
          const res = (current || "") + raw;
          this.variables[name] = res;
          return res;
        }
        break;
      }
    }
  }

  /**
   * Evaluates a conditional node (elementExists or valueMatches)
   */
  async evaluateConditional(
    browserWindow: BrowserWindow,
    config: {
      conditionType: string;
      selector: string;
      expectedValue?: string;
      nodeId?: string;
      transform?: {
        regex?: string;
        replace?: string;
        parseNumber?: boolean;
        stripChars?: string;
        toLower?: boolean;
      };
    }
  ): Promise<{
    conditionResult: boolean;
    effectiveSelector?: string | null;
    processedValue?: string | number | null;
  }> {
    const wc = browserWindow.webContents;
    const { conditionType, selector, expectedValue, transform } = config as any;

    const runtimeSelector = this.substituteVariables(selector);

    let conditionResult = false;
    let processedValue: string | number | null = null;

    if (conditionType === "elementExists") {
      conditionResult = await wc.executeJavaScript(`!!document.querySelector(${JSON.stringify(runtimeSelector)});`);
    } else if (conditionType === "valueMatches") {
      const raw = await wc.executeJavaScript(`document.querySelector(${JSON.stringify(runtimeSelector)})?.innerText || "";`);

      // Apply regex replacement if provided
      let processed: string = raw || "";
      if (transform?.regex) {
        try {
          const re = new RegExp(transform.regex, "g");
          processed = processed.replace(re, transform.replace ?? "");
        } catch (e) {
          console.debug("Invalid transform regex:", transform.regex, e);
        }
      }

      // Strip literal characters if provided
      if (transform?.stripChars) {
        const esc = String(transform.stripChars).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        processed = processed.replace(new RegExp("[" + esc + "]", "g"), "");
      }

      // Case normalization
      let expectedProcessed: string | undefined = expectedValue;
      if (transform?.toLower) {
        processed = processed.toLowerCase();
        expectedProcessed = expectedProcessed?.toLowerCase();
      }

      // Numeric parsing path - strip non-numeric and compare as numbers
      if (transform?.parseNumber) {
        const numA = parseFloat(processed.replace(/[^0-9.-]+/g, ""));
        const numB = expectedProcessed ? parseFloat(String(expectedProcessed).replace(/[^0-9.-]+/g, "")) : NaN;
        processedValue = isNaN(numA) ? null : numA;
        if (!isNaN(numA) && !isNaN(numB)) {
          conditionResult = numA === numB;
        } else {
          conditionResult = false;
        }
      } else {
        // String comparison
        processedValue = processed;
        conditionResult = processed === (expectedProcessed ?? "");
      }

      console.debug("[AutomationExecutor] evaluateConditional raw:", raw, "processed:", processedValue, "expected:", expectedValue);
    }

    return { conditionResult, effectiveSelector: runtimeSelector, processedValue };
  }
}
