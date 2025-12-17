# Loopi SDK

Build custom nodes and extend Loopi with your own integrations.

## Quick Links

- 📖 [Full Documentation](../docs/CUSTOM_NODE_SDK.md)
- 🛠️ [API Reference](./types.ts)
- 💻 [CLI Tool](./cli.ts)
- 📦 [Node Registry](../docs/NODE_REGISTRY.json)
- 🎯 [Examples](../docs/examples/)

## Installation

The SDK is built into Loopi. To start building custom nodes:

```bash
npm install -g loopi@latest
loopi-node create my-custom-node
cd my-custom-node
npm install
npm run build
```

## Quickstart

### 1. Create a New Node

```bash
loopi-node create slack-webhook
cd slack-webhook
```

### 2. Implement `src/index.ts`

```typescript
import type { CustomNode } from "@loopi/sdk";
import { createSuccessResult, createErrorResult } from "@loopi/sdk";

export const node: CustomNode = {
  metadata: {
    id: "slack-webhook",
    name: "Send to Slack",
    version: "1.0.0",
    description: "Send a message to Slack via webhook",
    author: "Your Name",
    license: "MIT",
  },

  defaultStep: {
    id: "",
    type: "custom:slack-webhook",
    description: "Send to Slack",
    webhookUrl: "",
    message: "",
  },

  ui: {
    icon: "Send",
    category: "Integration",
  },

  fields: [
    {
      name: "webhookUrl",
      label: "Webhook URL",
      type: "password",
      required: true,
      placeholder: "https://hooks.slack.com/services/...",
    },
    {
      name: "message",
      label: "Message",
      type: "textarea",
      required: true,
      placeholder: "Your message here. Use {{varName}} for variables.",
    },
  ],

  executor: {
    async execute(step, context) {
      const startTime = Date.now();

      try {
        // Interpolate variables
        const message = step.message.replace(
          /\{\{(\w+)\}\}/g,
          (_, key) => String(context.variables[key] || "")
        );

        const response = await fetch(step.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: message }),
        });

        if (!response.ok) {
          throw new Error(`Slack API error: ${response.statusText}`);
        }

        return createSuccessResult(
          { sent: true },
          Date.now() - startTime
        );
      } catch (error) {
        return createErrorResult(error as Error, Date.now() - startTime);
      }
    },
  },
};

export default node;
```

### 3. Build and Test

```bash
npm run build
npm run validate
```

### 4. Publish

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/loopi-node-slack-webhook
git push -u origin main
```

Then submit to the registry via PR to [loopi-registry](https://github.com/Dyan-Dev/loopi-registry).

## Core API

### CustomNode

The main interface you implement:

```typescript
interface CustomNode {
  metadata: CustomNodeMetadata;
  defaultStep: Partial<CustomNodeStep>;
  ui: CustomNodeUIConfig;
  fields: NodeFieldDefinition[];
  executor: CustomNodeExecutor;
}
```

### Executor

Your node's logic:

```typescript
executor: {
  validate?: (step) => ValidationResult;
  execute: (step, context) => Promise<ExecutionResult>;
  cleanup?: (step) => Promise<void>;
}
```

### Context

Available during execution:

```typescript
interface ExecutionContext {
  page?: PlaywrightPage;          // When browser is open
  variables: Record<string, any>; // From previous steps
  browser?: PlaywrightBrowser;
  logger: { info, error, debug };
  automationId?: string;
}
```

## Utilities

Helper functions for common tasks:

```typescript
import {
  validateCustomNode,      // Validate node definition
  validateCustomStep,      // Validate step instance
  interpolateVariables,    // Replace {{var}} patterns
  extractVariableReferences,
  createSuccessResult,    // Create success result
  createErrorResult,      // Create error result
  createLogger,           // Create prefixed logger
} from "@loopi/sdk";
```

## CLI Commands

```bash
# Create a new node from template
loopi-node create my-node

# List installed nodes
loopi-node list

# Validate a node
loopi-node validate ./my-node

# Add a node from registry
loopi-node add slack-message

# Remove a node
loopi-node remove slack-message
```

## Project Structure

```
my-custom-node/
├── src/
│   └── index.ts           # Your node implementation
├── dist/                  # Compiled output
├── package.json           # Node metadata
├── tsconfig.json          # TypeScript config
└── README.md              # Documentation
```

## Examples

### Send Email (Gmail API)

```typescript
export const node: CustomNode = {
  // ... metadata, ui, fields ...
  executor: {
    async execute(step, context) {
      const startTime = Date.now();
      try {
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: step.emailUser,
            pass: step.emailPassword,
          },
        });

        await transporter.sendMail({
          from: step.from,
          to: step.to,
          subject: step.subject,
          text: step.body,
        });

        return createSuccessResult(
          { sent: true },
          Date.now() - startTime
        );
      } catch (error) {
        return createErrorResult(error as Error, Date.now() - startTime);
      }
    },
  },
};
```

### Query Database

```typescript
export const node: CustomNode = {
  // ... metadata, ui, fields ...
  executor: {
    async execute(step, context) {
      const startTime = Date.now();
      let connection;

      try {
        const mysql = require("mysql2/promise");
        connection = await mysql.createConnection({
          host: step.host,
          user: step.user,
          password: step.password,
          database: step.database,
        });

        const [rows] = await connection.execute(step.query);

        return createSuccessResult(
          { rows, count: rows.length },
          Date.now() - startTime
        );
      } catch (error) {
        return createErrorResult(error as Error, Date.now() - startTime);
      } finally {
        if (connection) await connection.end();
      }
    },
  },
};
```

### Take Screenshot and Upload

```typescript
export const node: CustomNode = {
  // ... metadata, ui, fields ...
  executor: {
    async execute(step, context) {
      const startTime = Date.now();

      try {
        if (!context.page) {
          throw new Error("Browser not available");
        }

        const screenshot = await context.page.screenshot();
        const formData = new FormData();
        formData.append("file", new Blob([screenshot]));

        const response = await fetch(step.uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        return createSuccessResult(
          { uploaded: true },
          Date.now() - startTime
        );
      } catch (error) {
        return createErrorResult(error as Error, Date.now() - startTime);
      }
    },
  },
};
```

## Testing

Add tests to your node:

```typescript
import { validateCustomNode, validateCustomStep } from "@loopi/sdk";
import { node } from "../src/index";

describe("My Custom Node", () => {
  it("should be valid", () => {
    const result = validateCustomNode(node);
    expect(result.isValid).toBe(true);
  });

  it("should execute", async () => {
    const result = await node.executor.execute(
      { ...node.defaultStep, id: "1" },
      {
        variables: {},
        logger: {
          info: jest.fn(),
          error: jest.fn(),
          debug: jest.fn(),
        },
      }
    );
    expect(result.success).toBe(true);
  });
});
```

## Publishing to NPM

```bash
npm login
npm publish
```

## Support

- 📚 [Full Documentation](../docs/CUSTOM_NODE_SDK.md)
- 💬 [GitHub Discussions](https://github.com/Dyan-Dev/loopi/discussions)
- 🐛 [Report Issues](https://github.com/Dyan-Dev/loopi/issues)
- 🤝 [Contributing](https://github.com/Dyan-Dev/loopi/blob/main/CONTRIBUTING.md)

## License

Your nodes can use any license. MIT is recommended for open-source.

---

**Happy building! 🚀**
