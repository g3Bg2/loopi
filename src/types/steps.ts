import {
  Camera,
  Clock,
  Globe,
  Mouse,
  Type as TypeIcon,
  Zap,
  FileText,
  Terminal,
  Database,
  Mail,
  Cloud,
  Webhook,
} from "lucide-react";

/**
 * Automation Step Type System
 *
 * This module defines a discriminated union for all automation step types.
 * Each step has a unique 'type' field that TypeScript uses for type narrowing.
 */

/** Base properties shared by all automation steps */
export interface StepBase {
  id: string;
  description: string;
}

/** Navigate to a URL */
export interface StepNavigate extends StepBase {
  type: "navigate";
  value: string; // URL
}

export interface StepClick extends StepBase {
  type: "click";
  selector: string;
}

export interface StepType extends StepBase {
  type: "type";
  selector: string;
  value: string;
  credentialId?: string;
}

export interface StepWait extends StepBase {
  type: "wait";
  value: string; // seconds as string (current executor parses with parseInt)
}

export interface StepScreenshot extends StepBase {
  type: "screenshot";
  savePath?: string;
}

export interface StepExtract extends StepBase {
  type: "extract";
  selector: string;
  storeKey?: string;
}

export type ComparisonOp = "equals" | "contains" | "greaterThan" | "lessThan";

export interface StepExtractWithLogic extends StepBase {
  type: "extractWithLogic";
  selector: string;
  condition: ComparisonOp;
  expectedValue: string;
}

export interface StepApiCall extends StepBase {
  type: "apiCall";
  method?: "GET" | "POST";
  url: string;
  body?: string;
  headers?: Record<string, string>;
  storeKey?: string;
}

export type ScrollType = "toElement" | "byAmount";
export interface StepScroll extends StepBase {
  type: "scroll";
  scrollType: ScrollType;
  selector?: string; // required when toElement
  scrollAmount?: number; // required when byAmount
}

export interface StepSelectOption extends StepBase {
  type: "selectOption";
  selector: string;
  optionValue?: string;
  optionIndex?: number;
}

export interface StepFileUpload extends StepBase {
  type: "fileUpload";
  selector: string;
  filePath: string;
}

export interface StepHover extends StepBase {
  type: "hover";
  selector: string;
}

// Set / define a variable (can reference other variables via {{varName}})
export interface StepSetVariable extends StepBase {
  type: "setVariable";
  variableName: string;
  value: string; // supports {{var}} substitution
}

export type ModifyOp = "set" | "increment" | "decrement" | "append";

export interface StepModifyVariable extends StepBase {
  type: "modifyVariable";
  variableName: string;
  operation: ModifyOp;
  value: string; // supports {{var}} substitution
}

// ============ Enterprise Edition Steps ============

// File System Operations
export type FileOperation = "read" | "write" | "copy" | "move" | "delete" | "exists";

export interface StepFileSystem extends StepBase {
  type: "fileSystem";
  operation: FileOperation;
  sourcePath: string; // supports {{var}} substitution
  destinationPath?: string; // for copy/move operations
  content?: string; // for write operation
  storeKey?: string; // for read operation result
  encoding?: string; // default: utf-8
}

// System Automation
export interface StepSystemCommand extends StepBase {
  type: "systemCommand";
  command: string; // shell command to execute
  args?: string[]; // command arguments
  workingDirectory?: string;
  storeKey?: string; // store command output
  storeExitCode?: string; // store exit code
}

export interface StepEnvironmentVariable extends StepBase {
  type: "environmentVariable";
  operation: "get" | "set";
  variableName: string;
  value?: string; // for set operation
  storeKey?: string; // for get operation
}

// Database Operations
export type DatabaseType = "postgresql" | "mysql" | "mongodb" | "sqlite" | "mssql";

export interface StepDatabaseQuery extends StepBase {
  type: "databaseQuery";
  databaseType: DatabaseType;
  connectionString: string;
  query: string;
  parameters?: Record<string, unknown>;
  storeKey?: string;
}

// Email Automation
export interface StepSendEmail extends StepBase {
  type: "sendEmail";
  smtpHost: string;
  smtpPort: number;
  username: string;
  password: string;
  from: string;
  to: string; // supports {{var}}
  subject: string; // supports {{var}}
  body: string; // supports {{var}}
  html?: boolean; // send as HTML
  attachments?: string[]; // file paths
}

export interface StepReadEmail extends StepBase {
  type: "readEmail";
  imapHost: string;
  imapPort: number;
  username: string;
  password: string;
  mailbox?: string; // default: INBOX
  filters?: {
    from?: string;
    subject?: string;
    unreadOnly?: boolean;
  };
  storeKey?: string;
  markAsRead?: boolean;
}

// Cloud Services
export type CloudProvider = "aws" | "azure" | "gcp";

export interface StepCloudStorage extends StepBase {
  type: "cloudStorage";
  provider: CloudProvider;
  operation: "upload" | "download" | "delete" | "list";
  credentials: {
    accessKey?: string;
    secretKey?: string;
    region?: string;
  };
  bucket: string;
  key: string; // object key/path
  localPath?: string; // for upload/download
  storeKey?: string; // for list operation
}

// Advanced API Features
export interface StepWebhook extends StepBase {
  type: "webhook";
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: string;
  authentication?: {
    type: "basic" | "bearer" | "apiKey";
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
  retryPolicy?: {
    maxRetries: number;
    retryDelay: number; // milliseconds
  };
  storeKey?: string;
}

// Data Transformation
export type DataFormat = "json" | "xml" | "csv" | "yaml";

export interface StepDataTransform extends StepBase {
  type: "dataTransform";
  operation: "parse" | "stringify" | "convert";
  inputFormat: DataFormat;
  outputFormat: DataFormat;
  input: string; // supports {{var}}
  storeKey?: string;
  options?: Record<string, unknown>; // format-specific options
}

// Union of all supported steps used throughout the app
export type AutomationStep =
  | StepNavigate
  | StepClick
  | StepType
  | StepWait
  | StepScreenshot
  | StepExtract
  | StepExtractWithLogic
  | StepApiCall
  | StepScroll
  | StepSelectOption
  | StepFileUpload
  | StepHover
  | StepSetVariable
  | StepModifyVariable
  // Enterprise Edition Steps
  | StepFileSystem
  | StepSystemCommand
  | StepEnvironmentVariable
  | StepDatabaseQuery
  | StepSendEmail
  | StepReadEmail
  | StepCloudStorage
  | StepWebhook
  | StepDataTransform;

// UI meta for step type picker
export interface StepTypeMetadata {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: "browser" | "api" | "data" | "filesystem" | "system" | "database" | "email" | "cloud";
  enterprise?: boolean;
}

export const stepTypes: readonly StepTypeMetadata[] = [
  // Browser Automation (Community)
  { value: "navigate", label: "Navigate", icon: Globe, description: "Go to a URL", category: "browser" },
  { value: "click", label: "Click", icon: Mouse, description: "Click an element", category: "browser" },
  { value: "type", label: "Type", icon: TypeIcon, description: "Enter text", category: "browser" },
  {
    value: "selectOption",
    label: "Select Option",
    icon: TypeIcon,
    description: "Select an option from a dropdown",
    category: "browser",
  },
  { value: "wait", label: "Wait", icon: Clock, description: "Wait for a duration", category: "browser" },
  { value: "screenshot", label: "Screenshot", icon: Camera, description: "Take a screenshot", category: "browser" },
  {
    value: "extract",
    label: "Extract",
    icon: TypeIcon,
    description: "Extract text and store in variable",
    category: "browser",
  },
  {
    value: "scroll",
    label: "Scroll",
    icon: Mouse,
    description: "Scroll the page or to an element",
    category: "browser",
  },
  {
    value: "hover",
    label: "Hover",
    icon: Mouse,
    description: "Hover over an element",
    category: "browser",
  },
  {
    value: "fileUpload",
    label: "File Upload",
    icon: FileText,
    description: "Upload a file to an input",
    category: "browser",
  },
  
  // API & Data (Community)
  {
    value: "apiCall",
    label: "API Call",
    icon: Zap,
    description: "Make HTTP request (GET/POST)",
    category: "api",
  },
  {
    value: "setVariable",
    label: "Set Variable",
    icon: TypeIcon,
    description: "Define or update a variable",
    category: "data",
  },
  {
    value: "modifyVariable",
    label: "Modify Variable",
    icon: TypeIcon,
    description: "Increment / decrement / edit a variable",
    category: "data",
  },
  
  // File System (Enterprise)
  {
    value: "fileSystem",
    label: "File System",
    icon: FileText,
    description: "Read, write, copy, move, or delete files",
    category: "filesystem",
    enterprise: true,
  },
  
  // System (Enterprise)
  {
    value: "systemCommand",
    label: "System Command",
    icon: Terminal,
    description: "Execute shell commands",
    category: "system",
    enterprise: true,
  },
  {
    value: "environmentVariable",
    label: "Environment Variable",
    icon: Terminal,
    description: "Get or set environment variables",
    category: "system",
    enterprise: true,
  },
  
  // Database (Enterprise)
  {
    value: "databaseQuery",
    label: "Database Query",
    icon: Database,
    description: "Execute SQL queries on databases",
    category: "database",
    enterprise: true,
  },
  
  // Email (Enterprise)
  {
    value: "sendEmail",
    label: "Send Email",
    icon: Mail,
    description: "Send emails via SMTP",
    category: "email",
    enterprise: true,
  },
  {
    value: "readEmail",
    label: "Read Email",
    icon: Mail,
    description: "Read emails via IMAP",
    category: "email",
    enterprise: true,
  },
  
  // Cloud (Enterprise)
  {
    value: "cloudStorage",
    label: "Cloud Storage",
    icon: Cloud,
    description: "Upload/download files to cloud storage",
    category: "cloud",
    enterprise: true,
  },
  
  // Advanced API (Enterprise)
  {
    value: "webhook",
    label: "Webhook",
    icon: Webhook,
    description: "Advanced HTTP requests with auth & retry",
    category: "api",
    enterprise: true,
  },
  
  // Data Transform (Enterprise)
  {
    value: "dataTransform",
    label: "Data Transform",
    icon: Zap,
    description: "Convert between JSON, XML, CSV, YAML",
    category: "data",
    enterprise: true,
  },
] as const;
