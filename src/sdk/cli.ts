#!/usr/bin/env node

/**
 * Loopi Custom Node CLI
 * Manage custom nodes: add, list, remove, validate
 *
 * Usage:
 *   loopi-node add <node-id>              - Add a custom node
 *   loopi-node list                       - List installed custom nodes
 *   loopi-node remove <node-id>           - Remove a custom node
 *   loopi-node validate <path>            - Validate a node package
 *   loopi-node create <name>              - Create a new node from template
 */

import fs from "fs";
import path from "path";

// Avoid import.meta for compatibility with CommonJS module target

const command = process.argv[2];
const arg = process.argv[3];

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✓ ${message}`, "green");
}

function logError(message: string) {
  log(`✗ ${message}`, "red");
}

function logInfo(message: string) {
  log(`ℹ ${message}`, "cyan");
}

function logWarning(message: string) {
  log(`⚠ ${message}`, "yellow");
}

// Get the custom nodes directory
function getNodesDir(): string {
  const customNodesDir = path.join(process.env.HOME || "~", ".loopi", "nodes");
  if (!fs.existsSync(customNodesDir)) {
    fs.mkdirSync(customNodesDir, { recursive: true });
  }
  return customNodesDir;
}

// List installed custom nodes
function listNodes() {
  const nodesDir = getNodesDir();
  const nodes = fs.readdirSync(nodesDir);

  if (nodes.length === 0) {
    logInfo("No custom nodes installed");
    return;
  }

  log("\n📦 Installed Custom Nodes:\n", "blue");

  nodes.forEach((nodeId) => {
    const nodeDir = path.join(nodesDir, nodeId);
    const packagePath = path.join(nodeDir, "package.json");

    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
      log(`  ${nodeId} (v${pkg.version || "?"})`, "cyan");
      log(`    ${pkg.description || "No description"}`, "reset");
      if (pkg.author) {
        log(`    by ${pkg.author}`, "reset");
      }
    }
  });

  log("", "reset");
}

// Validate a node package
function validateNode(nodePath: string) {
  if (!fs.existsSync(nodePath)) {
    logError(`Node directory not found: ${nodePath}`);
    process.exit(1);
  }

  const packagePath = path.join(nodePath, "package.json");
  const indexPath = path.join(nodePath, "dist", "index.js");

  logInfo(`Validating node at ${nodePath}...`);

  // Check package.json
  if (!fs.existsSync(packagePath)) {
    logError("Missing package.json");
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

  if (!pkg.name) {
    logError("package.json missing 'name' field");
    process.exit(1);
  }

  if (!pkg.version) {
    logError("package.json missing 'version' field");
    process.exit(1);
  }

  if (!pkg.loopi?.nodeId) {
    logError("package.json missing 'loopi.nodeId' field");
    process.exit(1);
  }

  logSuccess("package.json is valid");

  // Check built files
  if (!fs.existsSync(indexPath)) {
    logWarning("No built files found. Run 'npm run build' first");
  } else {
    logSuccess("Built files found");
  }

  // Check README
  const readmePath = path.join(nodePath, "README.md");
  if (!fs.existsSync(readmePath)) {
    logWarning("Missing README.md");
  } else {
    logSuccess("README.md found");
  }

  logSuccess(`Node '${pkg.name}' is valid!`);
}

// Create a new node from template
function createNode(nodeName: string) {
  const nodeId = nodeName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const nodesDir = getNodesDir();
  const nodeDir = path.join(nodesDir, nodeId);

  if (fs.existsSync(nodeDir)) {
    logError(`Node '${nodeId}' already exists`);
    process.exit(1);
  }

  logInfo(`Creating new node: ${nodeId}...`);

  // Create directory structure
  fs.mkdirSync(nodeDir, { recursive: true });
  fs.mkdirSync(path.join(nodeDir, "src"), { recursive: true });

  // Create package.json
  const packageJson = {
    name: `@loopi/node-${nodeId}`,
    version: "0.1.0",
    description: `Custom Loopi node: ${nodeName}`,
    main: "dist/index.js",
    types: "dist/index.d.ts",
    scripts: {
      build: "tsc",
      dev: "tsc --watch",
      validate: "loopi-node validate .",
    },
    loopi: {
      nodeId: nodeId,
      category: "Custom",
    },
    author: process.env.USER || "Your Name",
    license: "MIT",
    dependencies: {
      "@loopi/sdk": "^1.0.0",
    },
    devDependencies: {
      typescript: "^5.0.0",
    },
  };

  fs.writeFileSync(path.join(nodeDir, "package.json"), JSON.stringify(packageJson, null, 2));

  // Create tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: "ES2020",
      module: "ESNext",
      lib: ["ES2020"],
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      outDir: "./dist",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ["src/**/*"],
  };

  fs.writeFileSync(path.join(nodeDir, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));

  // Create main node file
  const nodeTemplate = `import type { CustomNode, CustomNodeStep } from "@loopi/sdk";
import { createSuccessResult, createErrorResult } from "@loopi/sdk";

// Define your step type
export interface Step${nodeName} extends CustomNodeStep {
  type: "custom:${nodeId}";
  // Add your custom fields here
  exampleField?: string;
}

// Export the custom node
export const node: CustomNode = {
  metadata: {
    id: "${nodeId}",
    name: "${nodeName}",
    version: "0.1.0",
    description: "Description of what this node does",
    author: "${process.env.USER || "Your Name"}",
    license: "MIT",
    tags: ["custom"],
  },

  defaultStep: {
    id: "",
    type: "custom:${nodeId}",
    description: "${nodeName}",
    exampleField: "",
  },

  ui: {
    icon: "Zap", // Lucide icon name
    category: "Custom",
    color: "#3B82F6",
  },

  fields: [
    {
      name: "exampleField",
      label: "Example Field",
      description: "Description of this field",
      type: "text",
      required: true,
      placeholder: "Enter a value",
    },
  ],

  executor: {
    validate(step) {
      // Validate step configuration
      return { isValid: true };
    },

    async execute(step, context) {
      const startTime = Date.now();

      try {
        context.logger.info("Executing ${nodeName}...");

        // Your execution logic here
        // You have access to:
        // - step: The step configuration
        // - context.variables: Available variables from previous steps
        // - context.page: Playwright page object (if browser is open)
        // - context.logger: For logging

        const output = {
          message: "Step executed successfully",
        };

        return createSuccessResult(output, Date.now() - startTime);
      } catch (error) {
        context.logger.error("Execution failed", error as Error);
        return createErrorResult(error as Error, Date.now() - startTime);
      }
    },

    async cleanup(step) {
      // Optional: Clean up resources after execution
    },
  },
};

export default node;
`;

  fs.writeFileSync(path.join(nodeDir, "src", "index.ts"), nodeTemplate);

  // Create README.md
  const readme = `# ${nodeName}

A custom Loopi node for [describe what this node does].

## Installation

\`\`\`bash
loopi-node add ${nodeId}
\`\`\`

## Configuration

Describe the fields and how to use this node.

## Example

\`\`\`json
{
  "type": "custom:${nodeId}",
  "description": "${nodeName}",
  "exampleField": "value"
}
\`\`\`

## Development

\`\`\`bash
npm install
npm run dev
npm run validate
\`\`\`

## License

MIT
`;

  fs.writeFileSync(path.join(nodeDir, "README.md"), readme);

  logSuccess(`Custom node '${nodeId}' created!`);
  logInfo(`Next steps:`);
  log(`  1. cd ${nodeDir}`, "cyan");
  log(`  2. npm install`, "cyan");
  log(`  3. npm run build`, "cyan");
  log(`  4. npm run validate`, "cyan");
}

// Main command routing
switch (command) {
  case "list":
    listNodes();
    break;
  case "validate":
    if (!arg) {
      logError("Please provide a node path");
      process.exit(1);
    }
    validateNode(arg);
    break;
  case "create":
    if (!arg) {
      logError("Please provide a node name");
      process.exit(1);
    }
    createNode(arg);
    break;
  case "add":
    if (!arg) {
      logError("Please provide a node ID");
      process.exit(1);
    }
    logInfo(`Adding node '${arg}' from registry...`);
    logWarning("Registry support coming soon");
    break;
  case "remove":
    if (!arg) {
      logError("Please provide a node ID");
      process.exit(1);
    }
    logInfo(`Removing node '${arg}'...`);
    logWarning("Remove support coming soon");
    break;
  default:
    log("\n📦 Loopi Custom Node Manager\n", "blue");
    log("Usage:", "cyan");
    log("  loopi-node list                    List installed nodes", "reset");
    log("  loopi-node create <name>           Create a new node", "reset");
    log("  loopi-node validate <path>         Validate a node", "reset");
    log("  loopi-node add <node-id>           Add a node (from registry)", "reset");
    log("  loopi-node remove <node-id>        Remove a node", "reset");
    log("", "reset");
    log("Examples:", "cyan");
    log("  loopi-node create my-slack-node", "reset");
    log("  loopi-node validate ./my-slack-node", "reset");
    log("", "reset");
}
