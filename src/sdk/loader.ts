/**
 * Loopi Custom Node Loader
 * Dynamically loads custom nodes from ~/.loopi/nodes/ directory
 *
 * Usage:
 *   const loader = new CustomNodeLoader();
 *   const nodes = await loader.loadCustomNodes();
 *   nodes.forEach(node => registerNode(node));
 */

import fs from "fs";
import path from "path";
import type { CustomNode, CustomNodeMetadata } from "./types";

export class CustomNodeLoader {
  private customNodesDir: string;

  constructor(customNodesDir?: string) {
    if (customNodesDir) {
      this.customNodesDir = customNodesDir;
    } else {
      // Default: ~/.loopi/nodes/
      const homeDir = process.env.HOME || process.env.USERPROFILE || "~";
      this.customNodesDir = path.join(homeDir, ".loopi", "nodes");
    }
  }

  /**
   * Load all custom nodes from the nodes directory
   */
  async loadCustomNodes(): Promise<CustomNode[]> {
    if (!fs.existsSync(this.customNodesDir)) {
      console.warn(`Custom nodes directory not found: ${this.customNodesDir}`);
      return [];
    }

    const nodes: CustomNode[] = [];
    const nodeIds = fs.readdirSync(this.customNodesDir);

    for (const nodeId of nodeIds) {
      const nodePath = path.join(this.customNodesDir, nodeId);

      // Skip if not a directory
      if (!fs.statSync(nodePath).isDirectory()) {
        continue;
      }

      try {
        const node = await this.loadNode(nodePath);
        if (node) {
          nodes.push(node);
        }
      } catch (error) {
        console.error(`Failed to load node '${nodeId}':`, error);
      }
    }

    return nodes;
  }

  /**
   * Load a single custom node from its directory
   */
  async loadNode(nodePath: string): Promise<CustomNode | null> {
    const packageJsonPath = path.join(nodePath, "package.json");
    const distPath = path.join(nodePath, "dist");
    const indexPath = path.join(distPath, "index.js");

    // Validate package.json exists
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error("Missing package.json");
    }

    // Validate built files exist
    if (!fs.existsSync(indexPath)) {
      throw new Error("Built files not found. Run 'npm run build' in node directory");
    }

    try {
      // Load and validate package.json
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

      if (!packageJson.loopi?.nodeId) {
        throw new Error("Missing 'loopi.nodeId' in package.json");
      }

      // Dynamically import the node
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // biome-ignore lint/style/noCommonJs: Dynamic loading requires CommonJS
      const nodeModule = require(indexPath);
      const node = nodeModule.default || nodeModule.node;

      if (!node || typeof node !== "object") {
        throw new Error("Node module must export a default CustomNode object");
      }

      // Validate the node
      this.validateNodeDefinition(node);

      return node as CustomNode;
    } catch (error) {
      throw new Error(
        `Failed to load node from ${indexPath}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Validate a node definition has required properties
   */
  private validateNodeDefinition(node: unknown): void {
    if (typeof node !== "object" || node === null) {
      throw new Error("Node must be an object");
    }
    const n = node as Record<string, unknown>;
    if (!n.metadata) {
      throw new Error("Node missing 'metadata' property");
    }
    const meta = n.metadata as Record<string, unknown>;
    if (!meta.id) {
      throw new Error("Node metadata missing 'id'");
    }
    if (!meta.name) {
      throw new Error("Node metadata missing 'name'");
    }
    if (!n.executor) {
      throw new Error("Node missing 'executor' property");
    }
    const exec = n.executor as Record<string, unknown>;
    if (typeof exec.execute !== "function") {
      throw new Error("Node executor missing 'execute' function");
    }
    if (!n.ui) {
      throw new Error("Node missing 'ui' property");
    }
    if (!n.fields || !Array.isArray(n.fields as unknown[])) {
      throw new Error("Node 'fields' must be an array");
    }
  }

  /**
   * Get metadata for all custom nodes (lightweight load)
   */
  async getCustomNodesMetadata(): Promise<CustomNodeMetadata[]> {
    if (!fs.existsSync(this.customNodesDir)) {
      return [];
    }

    const metadata: CustomNodeMetadata[] = [];
    const nodeIds = fs.readdirSync(this.customNodesDir);

    for (const nodeId of nodeIds) {
      const packageJsonPath = path.join(this.customNodesDir, nodeId, "package.json");

      if (!fs.existsSync(packageJsonPath)) {
        continue;
      }

      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

        if (packageJson.loopi?.nodeId) {
          metadata.push({
            id: packageJson.loopi.nodeId,
            name: packageJson.name,
            version: packageJson.version,
            description: packageJson.description || "",
            author: packageJson.author || "Unknown",
            license: packageJson.license || "Unknown",
            repository: packageJson.repository?.url,
            tags: packageJson.loopi.tags || [],
          });
        }
      } catch {
        console.warn(`Failed to read metadata for node '${nodeId}'`);
      }
    }

    return metadata;
  }

  /**
   * Register custom nodes with Loopi (called during app initialization)
   */
  async registerAllCustomNodes(registerCallback: (node: CustomNode) => void): Promise<void> {
    const nodes = await this.loadCustomNodes();
    nodes.forEach(registerCallback);

    console.log(`✓ Loaded ${nodes.length} custom node(s)`);
  }
}

/**
 * Singleton instance for app-wide usage
 */
let loaderInstance: CustomNodeLoader | null = null;

export function getCustomNodeLoader(): CustomNodeLoader {
  if (!loaderInstance) {
    loaderInstance = new CustomNodeLoader();
  }
  return loaderInstance;
}

/**
 * Initialize custom nodes in the main process
 * Call this during app startup
 */
export async function initializeCustomNodes(
  registerCallback: (node: CustomNode) => void
): Promise<void> {
  const loader = getCustomNodeLoader();
  await loader.registerAllCustomNodes(registerCallback);
}
