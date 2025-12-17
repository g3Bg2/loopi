# Community Node SDK - Quick Reference

## Installation & Setup

```bash
# Create a new custom node
loopi-node create my-integration

# Navigate to your node
cd my-integration

# Install dependencies
npm install

# Development watch mode
npm run dev

# Build
npm run build

# Validate
npm run validate

# List all nodes
loopi-node list
```

## Basic Node Structure

```typescript
import type { CustomNode } from "@loopi/sdk";
import { createSuccessResult, createErrorResult } from "@loopi/sdk";

export const node: CustomNode = {
  // Metadata
  metadata: {
    id: "my-node",              // Unique ID (kebab-case)
    name: "My Node",            // Display name
    version: "1.0.0",          // Semantic version
    description: "...",         // What it does
    author: "Your Name",
    license: "MIT",
    tags: ["custom"],           // Optional
    repository: "https://...",  // Optional
  },

  // Default values for new instances
  defaultStep: {
    id: "",
    type: "custom:my-node",
    description: "My Node",
  },

  // UI Configuration
  ui: {
    icon: "Zap",                    // Lucide icon name
    category: "Integration",         // Browser/Data/Integration/Custom
    color: "#3B82F6",              // Optional hex color
    initialPosition: { x: 0, y: 0 }, // Optional
  },

  // Form fields auto-generated from this
  fields: [
    {
      name: "fieldName",
      label: "Field Label",
      type: "text",                    // text/textarea/number/password/select/checkbox
      required: true,
      placeholder: "...",
      description: "...",
      options: [                       // For select type
        { label: "Option 1", value: "opt1" },
        { label: "Option 2", value: "opt2" },
      ],
      validation: {
        minLength: 5,
        maxLength: 100,
        pattern: "^[a-z]+$",          // Regex
        custom: (value) => {           // Custom validator
          return value ? null : "Error message";
        },
      },
    },
  ],

  // Execution logic
  executor: {
    // Optional: Validate before execution
    validate(step) {
      return {
        isValid: true,
        errors: [{ field: "name", message: "Error" }],
      };
    },

    // Required: Execute the step
    async execute(step, context) {
      const startTime = Date.now();

      try {
        // Access browser (if open)
        if (context.page) {
          await context.page.goto("https://example.com");
        }

        // Access variables from previous steps
        const email = context.variables.email;

        // Log output
        context.logger.info("Doing something...");

        // Return success
        return createSuccessResult(
          { result: "value" },
          Date.now() - startTime
        );
      } catch (error) {
        context.logger.error("Failed", error as Error);
        return createErrorResult(error as Error, Date.now() - startTime);
      }
    },

    // Optional: Cleanup after execution
    async cleanup(step) {
      // Close connections, release resources, etc.
    },
  },
};

export default node;
```

## Available Icons (Lucide)

Common icons for nodes:
- `Send`, `Mail`, `MessageSquare` - Communication
- `Database`, `Sheet`, `Grid` - Data
- `Globe`, `Link`, `Share2` - Web
- `Zap`, `Bolt`, `Power` - Integration
- `Settings`, `Sliders`, `Wrench` - Config
- `Check`, `X`, `AlertCircle` - Status
- `Download`, `Upload`, `FileDown` - Files
- `Clock`, `Timer`, `Hourglass` - Time
- `User`, `Users`, `Shield` - Auth

See full list: https://lucide.dev/

## Field Types

| Type | Input | Example |
|------|-------|---------|
| `text` | Single line | Username, API key |
| `textarea` | Multi-line | Message, code |
| `number` | Numeric | Count, timeout |
| `password` | Masked | Secret, token |
| `select` | Dropdown | Enum choices |
| `checkbox` | Boolean | Enable/disable |

## Validation

```typescript
// String validation
validation: {
  minLength: 5,         // Minimum length
  maxLength: 100,       // Maximum length
  pattern: "^[a-z]+$",  // Regex pattern
  custom: (value) => {  // Custom function
    if (invalid) return "Error message";
    return null;        // Valid
  },
}

// Field required
required: true
```

## Context Properties

```typescript
interface ExecutionContext {
  page?: PlaywrightPage;          // Browser page (when open)
  variables: Record<string, any>; // From previous steps
  browser?: PlaywrightBrowser;    // Browser instance
  logger: {                        // Logging
    info(msg: string): void;
    error(msg: string, err?: Error): void;
    debug(msg: string): void;
  };
  automationId?: string;           // Parent automation ID
}
```

## Utilities

```typescript
import {
  validateCustomNode,           // Validate definition
  validateCustomStep,           // Validate instance
  interpolateVariables,         // Replace {{var}}
  extractVariableReferences,    // Get [[var]] list
  validateVariableReferences,   // Check if vars exist
  createSuccessResult,          // Build success
  createErrorResult,            // Build error
  sanitizeNodeId,               // Safe ID
  createLogger,                 // Prefixed logger
} from "@loopi/sdk";
```

## Variables in Steps

```typescript
// Use {{variableName}} in text fields
"message": "Hello {{firstName}}, your order {{orderId}} is ready!"

// Interpolate at runtime
const msg = interpolateVariables(step.message, context.variables);
// "Hello John, your order #12345 is ready!"

// Extract variable names from template
const vars = extractVariableReferences(step.message);
// ["firstName", "orderId"]

// Validate required variables exist
const result = validateVariableReferences(step.message, context.variables);
if (!result.isValid) {
  context.logger.error("Missing variables:", result.errors);
}
```

## Return Types

```typescript
// Success
createSuccessResult(
  output,        // Any data to return
  duration,      // Execution time in ms
  screenshot     // Optional screenshot
)

// Error
createErrorResult(
  error,         // Error object or string
  duration       // Execution time in ms
)

// Both return ExecutionResult
interface ExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  screenshot?: string;
  duration: number;
}
```

## Browser Operations

```typescript
// When browser is open
if (context.page) {
  // Navigation
  await context.page.goto("https://example.com");

  // Element interaction
  await context.page.click("selector");
  await context.page.fill("selector", "text");
  await context.page.select("selector", "value");

  // Data extraction
  const text = await context.page.textContent("selector");
  const html = await context.page.innerHTML("selector");

  // Screenshot
  await context.page.screenshot({ path: "screenshot.png" });

  // Wait
  await context.page.waitForSelector("selector");
  await context.page.waitForTimeout(1000);
}
```

## Examples

### Send HTTP Request

```typescript
async execute(step, context) {
  try {
    const response = await fetch(step.url, {
      method: step.method || "GET",
      headers: { "Content-Type": "application/json" },
      body: step.body ? JSON.stringify(JSON.parse(step.body)) : undefined,
    });

    const data = await response.json();
    return createSuccessResult(data);
  } catch (error) {
    return createErrorResult(error as Error);
  }
}
```

### Fill Form

```typescript
async execute(step, context) {
  try {
    if (!context.page) throw new Error("Browser not open");

    await context.page.fill(step.selector, step.value);
    await context.page.click(step.submitButton);

    return createSuccessResult({ submitted: true });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}
```

### Query Database

```typescript
async execute(step, context) {
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
    return createSuccessResult({ rows });
  } catch (error) {
    return createErrorResult(error as Error);
  } finally {
    if (connection) await connection.end();
  }
}
```

## Publishing

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/loopi-node-xxx
git push -u origin main
```

### 2. Publish to NPM (Optional)

```bash
npm login
npm publish
```

### 3. Submit to Registry

Create PR to [loopi-registry](https://github.com/Dyan-Dev/loopi-registry) with node info.

## File Structure

```
my-custom-node/
├── src/
│   └── index.ts          # Your node (auto-generated)
├── dist/                 # Compiled (auto-generated)
├── node_modules/         # Dependencies
├── package.json          # Metadata (auto-generated)
├── tsconfig.json         # TypeScript config (auto-generated)
├── README.md             # Documentation (auto-generated)
└── .gitignore
```

## Common Issues

**Node won't validate?**
```bash
npm run build
npm run validate
```

**TypeScript errors?**
```bash
npm install typescript@latest --save-dev
npm run build
```

**Variables not working?**
- Use exact `{{varName}}` syntax
- Variable must be set by previous step
- Check variable names match

**Browser context missing?**
- Check if page is open: `if (context.page) { ... }`
- Use browser context only for browser-based operations

## Resources

- 📖 [Full Documentation](../CUSTOM_NODE_SDK.md)
- 🎯 [Example: Slack](./CUSTOM_NODE_SLACK_EXAMPLE.md)
- 💻 [SDK API](./README.md)
- 🔗 [Main Docs](../DOCUMENTATION_MAP.md)

---

Happy building! 🚀
