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
  private currentNodeId: string | null = null;
  private loopIndices: LoopState = {};

  /**
   * Injects dynamic index values into selectors (e.g., "div:nth-child(${index})")
   */
  private injectIndexIntoSelector(selector: string, index: number): string {
    return selector.replace(/\$\{index\}/g, index.toString());
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
        await wc.loadURL(step.value);
        break;

      case "click":
        const clickSelector = step.selector.includes("${index}")
          ? this.injectIndexIntoSelector(
              step.selector,
              this.loopIndices[this.currentNodeId!]
            )
          : step.selector;
        await wc.executeJavaScript(
          `document.querySelector("${clickSelector}")?.click();`
        );
        break;

      case "type":
        await wc.executeJavaScript(`
          (() => {
            const el = document.querySelector("${step.selector}");
            if (el) {
              el.focus();
              el.value = "${step.value}";
              el.dispatchEvent(new Event('input', { bubbles: true }));
            }
          })();
        `);
        break;

      case "wait":
        await new Promise((resolve) =>
          setTimeout(resolve, parseInt(step.value) * 1000)
        );
        break;

      case "screenshot":
        const img = await wc.capturePage();
        const timestamp = new Date()
          .toISOString()
          .replace(/[-:.]/g, "")
          .slice(0, 15);
        const savePath = step.savePath || `screenshot_${timestamp}.png`;
        await require("fs").promises.writeFile(savePath, img.toPNG());
        return img.toPNG().toString("base64");

      case "extract":
        return await wc.executeJavaScript(
          `document.querySelector("${step.selector}")?.innerText || "";`
        );

      case "extractWithLogic":
        const extractedValue = await wc.executeJavaScript(
          `document.querySelector("${step.selector}")?.innerText || "";`
        );
        let conditionMet = false;

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

      case "apiCall":
        try {
          const response = await axios({
            method: step.method || "GET",
            url: step.url,
            data: step.body ? JSON.parse(step.body) : undefined,
            headers: step.headers || {},
          });
          return response.data;
        } catch (error) {
          console.error("API call failed:", error);
          throw error;
        }

      case "scroll":
        if (step.scrollType === "toElement") {
          await wc.executeJavaScript(`
            (() => {
              const el = document.querySelector("${step.selector}");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            })();
          `);
        } else if (step.scrollType === "byAmount") {
          await wc.executeJavaScript(
            `window.scrollBy(0, ${step.scrollAmount || 0});`
          );
        }
        break;

      case "selectOption":
        await wc.executeJavaScript(`
          (() => {
            const select = document.querySelector("${step.selector}");
            if (select) {
              ${
                step.optionValue
                  ? `select.value = "${step.optionValue}";`
                  : `select.selectedIndex = ${step.optionIndex || 0};`
              }
              select.dispatchEvent(new Event('change', { bubbles: true }));
            }
          })();
        `);
        break;

      case "fileUpload":
        await wc.executeJavaScript(`
          (() => {
            const input = document.querySelector("${step.selector}");
            if (input) {
              const file = new File([""], "${step.filePath}", { type: "text/plain" });
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              input.files = dataTransfer.files;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          })();
        `);
        break;

      case "hover":
        await wc.executeJavaScript(`
          (() => {
            const el = document.querySelector("${step.selector}");
            if (el) {
              const event = new MouseEvent('mouseover', { bubbles: true });
              el.dispatchEvent(event);
            }
          })();
        `);
        break;
    }
  }

  /**
   * Evaluates a conditional node and manages loop state
   * @returns Object containing condition result, current index, and effective selector
   */
  async evaluateConditional(
    browserWindow: BrowserWindow,
    config: {
      conditionType: string;
      selector: string;
      expectedValue?: string;
      nodeId: string;
      maxIterations?: number;
      increment?: number;
      startIndex?: number;
    }
  ): Promise<{
    conditionResult: boolean;
    currentIndex?: LoopState;
    effectiveSelector?: string | null;
  }> {
    const wc = browserWindow.webContents;
    const {
      conditionType,
      selector,
      expectedValue,
      nodeId,
      maxIterations,
      increment = 1,
      startIndex = 1,
    } = config;

    // Initialize or update loop index
    if (this.loopIndices[nodeId] === undefined) {
      this.loopIndices[nodeId] = startIndex;
      this.currentNodeId = nodeId;
    } else if (
      maxIterations !== undefined &&
      this.loopIndices[nodeId] > maxIterations
    ) {
      // Reset when max iterations reached
      this.loopIndices[nodeId] = startIndex;
      return {
        conditionResult: false,
        currentIndex: this.loopIndices,
        effectiveSelector: null,
      };
    } else {
      this.loopIndices[nodeId] += increment;
    }

    const effectiveSelector = this.injectIndexIntoSelector(
      selector,
      this.loopIndices[nodeId]
    );

    let conditionResult = false;

    if (
      conditionType === "elementExists" ||
      conditionType === "loopUntilFalse"
    ) {
      conditionResult = await wc.executeJavaScript(
        `!!document.querySelector("${effectiveSelector}");`
      );
    } else if (conditionType === "valueMatches") {
      const value = await wc.executeJavaScript(
        `document.querySelector("${effectiveSelector}")?.innerText || "";`
      );
      conditionResult = value === expectedValue;
    }

    return conditionType === "loopUntilFalse"
      ? { conditionResult, currentIndex: this.loopIndices, effectiveSelector }
      : { conditionResult };
  }
}
