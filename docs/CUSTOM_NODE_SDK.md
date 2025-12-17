# Loopi Community Node SDK

Build custom automation nodes for Loopi. Extend the platform with your own integrations, APIs, and workflows.

## Quick Start

### 1. Create a New Node

```bash
loopi-node create my-custom-node
cd my-custom-node
npm install
```

### 2. Implement Your Node

Edit `src/index.ts`:

```typescript
import type { CustomNode } from "@loopi/sdk";
import { createSuccessResult, createErrorResult } from "@loopi/sdk";

export const node: CustomNode = {
  metadata: {
    id: "my-custom-node",
    name: "My Custom Node",
    version: "1.0.0",
    description: "Does something amazing",
    author: "Your Name",
    license: "MIT",
  },

  defaultStep: {
    id: "",
    type: "custom:my-custom-node",
    description: "My Custom Node",
  },

  ui: {
    icon: "Zap",
    category: "Custom",
  },

  fields: [
    {
      name: "apiUrl",
      label: "API URL",
      type: "text",
      required: true,
      placeholder: "https://api.example.com",
    },
  ],

  executor: {
    async execute(step, context) {
      try {
        // Your logic here
        return createSuccessResult({ success: true });
      } catch (error) {
        return createErrorResult(error);
      }
    },
  },
};

export default node;
```

### 3. Build & Validate

```bash
npm run build
npm run validate
```

## Core Concepts

### Step Types

Every custom node creates a new step type with the prefix `custom:`:

```typescript
export interface StepSlackMessage extends CustomNodeStep {
  type: "custom:slack-message";
  channel: string;
  message: string;
  timestamp?: string;
}
```

### Node Metadata

Describes your node:

```typescript
metadata: {
  id: "slack-message",           // Unique ID (kebab-case)
  name: "Send Slack Message",    // Display name
  version: "1.0.0",              // Semantic versioning
  description: "Send a message to Slack",
  author: "Your Name <email@example.com>",
  license: "MIT",
  tags: ["slack", "messaging", "integration"],
  repository: "https://github.com/user/loopi-node-slack"
}
```

### UI Configuration

Controls how the node appears in the builder:

```typescript
ui: {
  icon: "Send",              // Lucide icon name
  category: "Integration",   // Browser | Data | Integration | Custom
  color: "#36C5F0",         // Optional hex color
  initialPosition: {         // Optional
    x: 0,
    y: 0
  }
}
```

### Field Definitions

Generates forms automatically:

```typescript
fields: [
  {
    name: "channel",
    label: "Channel",
    type: "text",
    required: true,
    placeholder: "#general",
    description: "Slack channel name or ID"
  },
  {
    name: "format",
    label: "Message Format",
    type: "select",
    options: [
      { label: "Plain Text", value: "text" },
      { label: "Markdown", value: "markdown" },
    ],
    required: false
  },
  {
    name: "useThread",
    label: "Reply in Thread",
    type: "checkbox",
    required: false
  }
]
```

**Supported field types:**
- `text` — Single-line text input
- `textarea` — Multi-line text input
- `number` — Numeric input
- `password` — Masked text input
- `select` — Dropdown selection
- `checkbox` — Boolean toggle

### Executor Implementation

The core logic that runs during automation:

```typescript
executor: {
  // Optional: Validate step configuration before execution
  validate(step) {
    if (!step.apiUrl?.trim()) {
      return {
        isValid: false,
        errors: [{
          field: "apiUrl",
          message: "API URL is required"
        }]
      };
    }
    return { isValid: true };
  },

  // Required: Execute the step
  async execute(step, context) {
    const startTime = Date.now();

    try {
      context.logger.info("Starting execution...");

      // Access variables from previous steps
      const userEmail = context.variables.email;

      // Execute your logic
      const result = await callExternalAPI(step.apiUrl);

      // Return success
      return {
        success: true,
        output: result,
        duration: Date.now() - startTime
      };
    } catch (error) {
      context.logger.error("Execution failed", error);
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  },

  // Optional: Cleanup after execution
  async cleanup(step) {
    // Close connections, release resources, etc.
  }
}
```

### Execution Context

Available during step execution:

```typescript
interface ExecutionContext {
  // Playwright Page object (when browser is open)
  page?: Page;

  // Variables from previous steps
  variables: Record<string, unknown>;

  // Playwright Browser instance
  browser?: Browser;

  // Logger for debugging
  logger: {
    info(message: string): void;
    error(message: string, error?: Error): void;
    debug(message: string): void;
  };

  // Parent automation ID
  automationId?: string;
}
```

## Examples

### 1. Slack Integration

```typescript
import axios from "axios";
import type { CustomNode } from "@loopi/sdk";

export const slackNode: CustomNode = {
  metadata: {
    id: "slack-message",
    name: "Send Slack Message",
    version: "1.0.0",
    description: "Send a message to Slack",
    author: "Loopi Team",
    license: "MIT",
    tags: ["slack", "messaging"],
  },

  defaultStep: {
    id: "",
    type: "custom:slack-message",
    description: "Send Slack Message",
    channel: "#general",
    message: "",
  },

  ui: {
    icon: "Send",
    category: "Integration",
    color: "#36C5F0",
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
      name: "channel",
      label: "Channel",
      type: "text",
      required: true,
      placeholder: "#general",
    },
    {
      name: "message",
      label: "Message",
      type: "textarea",
      required: true,
      placeholder: "Your message here",
    },
  ],

  executor: {
    async execute(step, context) {
      const startTime = Date.now();
      try {
        // Interpolate variables: "Hello {{name}}" → "Hello John"
        const message = step.message.replace(
          /\{\{(\w+)\}\}/g,
          (_, key) => String(context.variables[key] || "")
        );

        await axios.post(step.webhookUrl, {
          channel: step.channel,
          text: message,
        });

        return {
          success: true,
          output: { messageId: Date.now() },
          duration: Date.now() - startTime,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          duration: Date.now() - startTime,
        };
      }
    },
  },
};
```

### 2. Database Query Node

```typescript
import mysql from "mysql2/promise";
import type { CustomNode } from "@loopi/sdk";

export const databaseNode: CustomNode = {
  metadata: {
    id: "mysql-query",
    name: "MySQL Query",
    version: "1.0.0",
    description: "Execute a MySQL query",
    author: "Loopi Team",
    license: "MIT",
  },

  defaultStep: {
    id: "",
    type: "custom:mysql-query",
    description: "MySQL Query",
    host: "localhost",
    query: "",
  },

  ui: {
    icon: "Database",
    category: "Data",
  },

  fields: [
    { name: "host", label: "Host", type: "text", required: true },
    { name: "user", label: "User", type: "text", required: true },
    { name: "password", label: "Password", type: "password", required: true },
    { name: "database", label: "Database", type: "text", required: true },
    { name: "query", label: "SQL Query", type: "textarea", required: true },
  ],

  executor: {
    async execute(step, context) {
      const startTime = Date.now();
      let connection;

      try {
        connection = await mysql.createConnection({
          host: step.host,
          user: step.user,
          password: step.password,
          database: step.database,
        });

        const [rows] = await connection.execute(step.query);

        return {
          success: true,
          output: { rows, count: rows.length },
          duration: Date.now() - startTime,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          duration: Date.now() - startTime,
        };
      } finally {
        if (connection) await connection.end();
      }
    },
  },
};
```

### 3. Browser-Based Node (Screenshot Upload)

```typescript
import FormData from "form-data";
import fs from "fs";
import type { CustomNode } from "@loopi/sdk";

export const uploadNode: CustomNode = {
  metadata: {
    id: "upload-screenshot",
    name: "Upload Screenshot",
    version: "1.0.0",
    description: "Take a screenshot and upload it",
    author: "Loopi Team",
    license: "MIT",
  },

  defaultStep: {
    id: "",
    type: "custom:upload-screenshot",
    description: "Upload Screenshot",
    uploadUrl: "",
  },

  ui: {
    icon: "Upload",
    category: "Browser",
  },

  fields: [
    {
      name: "uploadUrl",
      label: "Upload URL",
      type: "text",
      required: true,
      placeholder: "https://api.example.com/upload",
    },
  ],

  executor: {
    async execute(step, context) {
      const startTime = Date.now();

      try {
        if (!context.page) {
          throw new Error("Browser page not available");
        }

        // Take screenshot
        const screenshotBuffer = await context.page.screenshot({
          path: "/tmp/screenshot.png",
        });

        // Upload
        const form = new FormData();
        form.append("file", fs.createReadStream("/tmp/screenshot.png"));

        const response = await fetch(step.uploadUrl, {
          method: "POST",
          body: form,
        });

        return {
          success: true,
          output: { uploadedAt: new Date().toISOString() },
          duration: Date.now() - startTime,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          duration: Date.now() - startTime,
        };
      }
    },
  },
};
```

## Publishing Your Node

### 1. GitHub

Push your node to a public GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/loopi-node-xxx
git push -u origin main
```

### 2. NPM (Optional)

Publish to npm for easy installation:

```bash
npm publish
```

### 3. Loopi Registry

Submit your node to the community registry by opening a PR to the [loopi registry repository](https://github.com/Dyan-Dev/loopi-registry).

## Validation & Testing

### Use the Validator

```bash
loopi-node validate /path/to/your/node
```

### Unit Testing

```typescript
import { validateCustomNode, validateCustomStep } from "@loopi/sdk";

describe("My Custom Node", () => {
  it("should validate node definition", () => {
    const result = validateCustomNode(node);
    expect(result.isValid).toBe(true);
  });

  it("should execute successfully", async () => {
    const result = await node.executor.execute(
      { type: "custom:my-node", id: "1", description: "" },
      { variables: {}, logger: { info: () => {}, error: () => {}, debug: () => {} } }
    );
    expect(result.success).toBe(true);
  });
});
```

## Utility Functions

The SDK includes helpers for common tasks:

```typescript
import {
  validateCustomNode,
  validateCustomStep,
  interpolateVariables,
  extractVariableReferences,
  createSuccessResult,
  createErrorResult,
  createLogger,
} from "@loopi/sdk";

// Interpolate variables
const message = interpolateVariables(
  "Hello {{name}}, your email is {{email}}",
  { name: "John", email: "john@example.com" }
); // "Hello John, your email is john@example.com"

// Extract variable references
const vars = extractVariableReferences("Hello {{name}}, your email is {{email}}");
// ["name", "email"]

// Create results
const success = createSuccessResult({ data: "..." }, 100);
const error = createErrorResult(new Error("Failed"), 100);

// Create logger
const logger = createLogger("MyNode");
logger.info("Starting...");
logger.error("Failed!", new Error("details"));
```

## Best Practices

1. **Type Safety** — Use TypeScript for full type checking
2. **Error Handling** — Catch errors gracefully and provide clear messages
3. **Logging** — Use the context logger for debugging
4. **Validation** — Validate step configuration before execution
5. **Documentation** — Write clear README and inline comments
6. **Testing** — Test your nodes thoroughly before publishing
7. **Security** — Don't hardcode secrets; use credentials or environment variables
8. **Performance** — Return execution duration for monitoring
9. **Naming** — Use kebab-case for IDs, PascalCase for TypeScript interfaces
10. **Versioning** — Follow semantic versioning (MAJOR.MINOR.PATCH)

## Troubleshooting

### "Cannot find module '@loopi/sdk'"

Make sure you installed dependencies:

```bash
npm install
npm link @loopi/sdk  # Link the local SDK
```

### Type errors

Check that TypeScript version matches:

```bash
npm install typescript@^5.0.0 --save-dev
npm run build
```

### Validation fails

Run the validator to see detailed errors:

```bash
loopi-node validate .
```

## Getting Help

- 📖 [Documentation](https://github.com/Dyan-Dev/loopi/tree/main/docs)
- 💬 [GitHub Discussions](https://github.com/Dyan-Dev/loopi/discussions)
- 🐛 [Report Issues](https://github.com/Dyan-Dev/loopi/issues)
- 🤝 [Contributing Guide](https://github.com/Dyan-Dev/loopi/blob/main/CONTRIBUTING.md)

## License

Your custom nodes can use any license. We recommend MIT for open-source contributions.
