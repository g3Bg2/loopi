import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactFlowEdge, ReactFlowNode } from "../types";

interface UseExecutionArgs {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  setNodes: Dispatch<SetStateAction<ReactFlowNode[]>>;
}

/**
 * useExecution - Manages browser automation execution state and graph traversal
 *
 * Handles:
 * - Browser window lifecycle (open/close)
 * - Automation execution state (running/paused/stopped)
 * - Graph-based flow execution with conditional branching
 * - Node-by-node step execution with visual feedback
 *
 * @param nodes - ReactFlow nodes representing automation steps
 * @param edges - ReactFlow edges defining execution order
 * @param setNodes - Function to update node state (for visual feedback)
 */
export default function useExecution({ nodes, edges, setNodes }: UseExecutionArgs) {
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const stopGraphExecutionRef = useRef(false);

  useEffect(() => {
    const handleBrowserClosed = () => {
      setIsBrowserOpen(false);
      setIsAutomationRunning(false);
      setCurrentNodeId(null);
    };
    // register browser closed callback if available
    window.electronAPI?.onBrowserClosed(handleBrowserClosed);
    return () => {
      try {
        window.electronAPI?.removeBrowserClosed?.();
      } catch (_e) {
        // ignore
      }
    };
  }, []);

  const openBrowser = useCallback(async (url?: string) => {
    try {
      await window.electronAPI?.openBrowser(url || "https://google.com");
      setIsBrowserOpen(true);
    } catch (err) {
      console.error("Failed to open browser", err);
    }
  }, []);

  const closeBrowser = useCallback(async () => {
    try {
      await window.electronAPI?.closeBrowser();
      setIsBrowserOpen(false);
      setIsAutomationRunning(false);
      setCurrentNodeId(null);
    } catch (err) {
      console.error("Failed to close browser", err);
    }
  }, []);

  const executeNode = useCallback(
    async (node: ReactFlowNode) => {
      setCurrentNodeId(node.id);
      setNodes((nds: ReactFlowNode[]) =>
        nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, nodeRunning: true } } : n))
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (node.type === "automationStep" && node.data.step) {
        return await window.electronAPI?.runStep(node.data.step);
      } else if (node.type === "conditional") {
        const conditionParams = {
          conditionType: node.data.conditionType,
          selector: node.data.selector,
          expectedValue: node.data.expectedValue,
          condition: node.data.condition,
          transformType: node.data.transformType,
          transformPattern: node.data.transformPattern,
          transformReplace: node.data.transformReplace,
          transformChars: node.data.transformChars,
          parseAsNumber: node.data.parseAsNumber,
        };

        type ConditionalResponse = { conditionResult?: boolean; effectiveSelector?: string | null };
        const res = await window.electronAPI!.runConditional(conditionParams);
        const response = res as ConditionalResponse;
        const conditionResult = response.conditionResult;
        const _effectiveSelector = response.effectiveSelector; // Keep as unused variable

        return {
          conditionResult,
        };
      }
    },
    [setNodes]
  );

  const runAutomation = useCallback(async () => {
    if (nodes.length === 0) {
      alert("No nodes to execute");
      return;
    }

    if (!isBrowserOpen) {
      await openBrowser();
    }

    // Initialize executor variables from automation-level variables if provided
    try {
      // Collect automation-level variables from nodes or a top-level automation export
      // For now, look for a node with type 'automationVars' or fall back to none
      const vars: Record<string, string> | undefined = window.automation?.variables;
      if (window.electronAPI?.initVariables) {
        await window.electronAPI.initVariables(vars);
      }
    } catch (_e) {
      // Initialization failed — keep as debug-level behavior without noisy logging
    }

    setIsAutomationRunning(true);
    setCurrentNodeId(null);

    try {
      const visited = new Set<string>();
      const executeGraph = async (nodeId: string) => {
        if (stopGraphExecutionRef.current) return;
        visited.add(nodeId);

        const node = nodes.find((n) => n.id === nodeId) as ReactFlowNode | undefined;
        if (!node) return;

        const result = await executeNode(node);
        const execResult = result as { conditionResult?: boolean } | undefined | null;
        setNodes((nds: ReactFlowNode[]) =>
          nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, nodeRunning: false } } : n))
        );
        let nextNodes: string[] = [];

        if (node.type === "conditional" && execResult?.conditionResult !== undefined) {
          const branch = execResult.conditionResult ? "if" : "else";
          nextNodes = edges
            .filter((e) => e.source === nodeId && e.sourceHandle === branch)
            .map((e) => e.target);
        } else {
          nextNodes = edges.filter((e) => e.source === nodeId).map((e) => e.target);
        }

        for (const nextNodeId of nextNodes) {
          await executeGraph(nextNodeId);
        }
      };

      await executeGraph("1");
      alert("Automation completed successfully!");
    } catch (error) {
      console.error("Automation failed:", error);
      alert("Automation failed. Check console for details.");
    } finally {
      setIsAutomationRunning(false);
      setCurrentNodeId(null);
      stopGraphExecutionRef.current = false;
    }
  }, [nodes, edges, executeNode, openBrowser, setNodes, isBrowserOpen]);

  const pauseAutomation = useCallback(() => {
    setIsAutomationRunning(false);
  }, []);

  const stopAutomation = useCallback(() => {
    stopGraphExecutionRef.current = true;
    setIsAutomationRunning(false);
    setCurrentNodeId(null);
  }, []);

  return {
    isBrowserOpen,
    isAutomationRunning,
    currentNodeId,
    openBrowser,
    closeBrowser,
    runAutomation,
    pauseAutomation,
    stopAutomation,
  };
}
