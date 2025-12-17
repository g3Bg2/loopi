/**
 * Loopi Custom Node SDK Utilities
 * Helper functions for node developers
 */

import type {
  CustomNode,
  CustomNodeStep,
  ExecutionResult,
  NodeFieldDefinition,
  ValidationResult,
} from "./types";

/**
 * Validates a custom node definition for correctness
 */
export function validateCustomNode(node: CustomNode): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  // Validate metadata
  if (!node.metadata.id || !/^[a-z0-9-]+$/.test(node.metadata.id)) {
    errors.push({
      field: "metadata.id",
      message: "Node ID must contain only lowercase letters, numbers, and hyphens",
    });
  }

  if (!node.metadata.name) {
    errors.push({
      field: "metadata.name",
      message: "Node name is required",
    });
  }

  if (!node.metadata.version || !/^\d+\.\d+\.\d+/.test(node.metadata.version)) {
    errors.push({
      field: "metadata.version",
      message: "Version must follow semantic versioning (e.g., 1.0.0)",
    });
  }

  // Validate UI config
  if (!node.ui.category) {
    errors.push({
      field: "ui.category",
      message: "Category is required",
    });
  }

  // Validate executor
  if (!node.executor.execute || typeof node.executor.execute !== "function") {
    errors.push({
      field: "executor.execute",
      message: "Execute function is required and must be callable",
    });
  }

  // Validate fields
  if (!Array.isArray(node.fields)) {
    errors.push({
      field: "fields",
      message: "Fields must be an array",
    });
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validates a custom step instance
 */
export function validateCustomStep(
  step: CustomNodeStep,
  fields: NodeFieldDefinition[]
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  for (const field of fields) {
    const value = (step as Record<string, unknown>)[field.name];

    if (field.required && (value === undefined || value === null || value === "")) {
      errors.push({
        field: field.name,
        message: `${field.label} is required`,
      });
      continue;
    }

    if (value !== undefined && value !== null) {
      // Type validation
      if (field.type === "number" && typeof value !== "number") {
        errors.push({
          field: field.name,
          message: `${field.label} must be a number`,
        });
      }

      if (field.type === "text" && typeof value !== "string") {
        errors.push({
          field: field.name,
          message: `${field.label} must be a string`,
        });
      }

      // String validations
      if (typeof value === "string" && field.validation) {
        if (field.validation.minLength && value.length < field.validation.minLength) {
          errors.push({
            field: field.name,
            message: `${field.label} must be at least ${field.validation.minLength} characters`,
          });
        }

        if (field.validation.maxLength && value.length > field.validation.maxLength) {
          errors.push({
            field: field.name,
            message: `${field.label} must be at most ${field.validation.maxLength} characters`,
          });
        }

        if (field.validation.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            errors.push({
              field: field.name,
              message: `${field.label} format is invalid`,
            });
          }
        }
      }

      // Custom validation
      if (field.validation?.custom) {
        const customError = field.validation.custom(value);
        if (customError) {
          errors.push({
            field: field.name,
            message: customError,
          });
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Creates a successful execution result
 */
export function createSuccessResult(
  output?: Record<string, unknown> | unknown,
  duration: number = 0,
  screenshot?: string
): ExecutionResult {
  return {
    success: true,
    output,
    duration,
    screenshot,
  };
}

/**
 * Creates a failed execution result
 */
export function createErrorResult(error: string | Error, duration: number = 0): ExecutionResult {
  return {
    success: false,
    error: typeof error === "string" ? error : error.message,
    duration,
  };
}

/**
 * Interpolates variable references in strings
 * Replaces {{varName}} with actual values
 */
export function interpolateVariables(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    const value = variables[varName];
    return value !== undefined && value !== null ? String(value) : match;
  });
}

/**
 * Extracts variable references from a string
 * Returns array of variable names found
 */
export function extractVariableReferences(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g) || [];
  return matches.map((match) => match.slice(2, -2));
}

/**
 * Validates variable availability
 */
export function validateVariableReferences(
  template: string,
  availableVariables: Record<string, unknown>
): ValidationResult {
  const required = extractVariableReferences(template);
  const missing = required.filter((varName) => !(varName in availableVariables));

  return {
    isValid: missing.length === 0,
    errors:
      missing.length > 0
        ? missing.map((varName) => ({
            field: "variables",
            message: `Variable {{${varName}}} is not available`,
          }))
        : undefined,
  };
}

/**
 * Sanitizes node ID for safe usage
 */
export function sanitizeNodeId(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

/**
 * Creates a logger instance for node execution
 */
export function createLogger(nodeName: string) {
  const prefix = `[${nodeName}]`;

  return {
    info: (message: string) => console.log(`${prefix} ℹ️ ${message}`),
    error: (message: string, error?: Error) => {
      console.error(`${prefix} ❌ ${message}`);
      if (error) console.error(error);
    },
    debug: (message: string) => console.debug(`${prefix} 🐛 ${message}`),
  };
}
