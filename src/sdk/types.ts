/**
 * Loopi Community Node SDK
 * TypeScript definitions for building custom automation nodes
 */

import type { AutomationStep } from "../types/steps";

/**
 * Base interface for custom node metadata
 * Every custom node must implement this
 */
export interface CustomNodeMetadata {
  /** Unique identifier for the node type */
  id: string;
  /** Human-readable name */
  name: string;
  /** Version in semantic versioning */
  version: string;
  /** Brief description of what the node does */
  description: string;
  /** Author name and optional email */
  author: string;
  /** Repository URL (GitHub, GitLab, etc.) */
  repository?: string;
  /** License type (MIT, Apache-2.0, etc.) */
  license: string;
  /** Tags for categorization (e.g., ["integration", "api", "webhook"]) */
  tags?: string[];
}

/**
 * Custom node step definition
 * Extends AutomationStep with custom properties
 */
export type CustomNodeStep = AutomationStep & {
  type: `custom:${string}`; // Custom types prefixed with "custom:"
  [key: string]: unknown; // Allow custom properties
};

/**
 * Custom node UI configuration
 * Defines how the node appears and behaves in the builder UI
 */
export interface CustomNodeUIConfig {
  /** Icon name from lucide-react or custom SVG URL */
  icon: string;
  /** Display color in hex (#RRGGBB) */
  color?: string;
  /** Category for grouping in the Add Step menu */
  category: "Browser" | "Data" | "Integration" | "Custom" | string;
  /** Position hint if initial node (x, y) */
  initialPosition?: { x: number; y: number };
}

/**
 * Field definition for node configuration
 * Used to auto-generate UI forms
 */
export interface NodeFieldDefinition {
  name: string;
  label: string;
  description?: string;
  type: "text" | "number" | "select" | "checkbox" | "textarea" | "password";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string; // Regex pattern
    custom?: (value: unknown) => string | null; // Custom validation function
  };
}

/**
 * Custom node executor configuration
 * Defines how the node is executed during automation
 */
export interface CustomNodeExecutor {
  /** Function to execute the node */
  execute: (step: CustomNodeStep, context: ExecutionContext) => Promise<ExecutionResult>;
  /** Optional validation function before execution */
  validate?: (step: CustomNodeStep) => ValidationResult;
  /** Optional cleanup function after execution */
  cleanup?: (step: CustomNodeStep) => Promise<void>;
}

/**
 * Execution context passed to node executor
 * Contains runtime data and utilities
 */
export interface ExecutionContext {
  /** Current browser page instance (Playwright Page object) */
  page?: unknown; // Playwright Page type
  /** Variables available from previous steps */
  variables: Record<string, unknown>;
  /** Browser instance */
  browser?: unknown; // Playwright Browser type
  /** Logger function for debugging */
  logger: {
    info: (message: string) => void;
    error: (message: string, error?: Error) => void;
    debug: (message: string) => void;
  };
  /** Reference to parent automation for context */
  automationId?: string;
}

/**
 * Result returned from node execution
 */
export interface ExecutionResult {
  /** Whether execution was successful */
  success: boolean;
  /** Output value(s) from the execution */
  output?: Record<string, unknown> | unknown;
  /** Error message if failed */
  error?: string;
  /** Optional screenshot data */
  screenshot?: string;
  /** Execution duration in milliseconds */
  duration: number;
}

/**
 * Validation result for node configuration
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Complete custom node definition
 * This is what node developers export from their package
 */
export interface CustomNode {
  /** Metadata about the node */
  metadata: CustomNodeMetadata;
  /** Step type interface (TypeScript interface) */
  stepInterface: unknown; // Would be the actual interface
  /** Default values for new instances */
  defaultStep: Partial<CustomNodeStep>;
  /** UI configuration */
  ui: CustomNodeUIConfig;
  /** Field definitions for auto-form generation */
  fields: NodeFieldDefinition[];
  /** Executor implementation */
  executor: CustomNodeExecutor;
}

/**
 * Node package.json structure for custom nodes
 */
export interface CustomNodePackageJson {
  name: string;
  version: string;
  description: string;
  main: string;
  loopi: {
    nodeId: string;
    category: string;
  };
  author: string;
  license: string;
  repository?: {
    type: string;
    url: string;
  };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * Registry entry for a custom node
 * Used in the node marketplace
 */
export interface NodeRegistryEntry {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  tags: string[];
  repository: string;
  npm?: string; // NPM package name
  downloads?: number;
  rating?: number;
  verified?: boolean; // Verified by Loopi team
}

/**
 * Node marketplace registry
 * Can be local or remote JSON
 */
export interface NodeRegistry {
  version: "1.0";
  lastUpdated: string;
  nodes: NodeRegistryEntry[];
}
