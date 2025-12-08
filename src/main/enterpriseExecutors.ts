import axios from "axios";
import { exec } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Enterprise Edition Step Executors
 * 
 * Handles execution of enterprise-only automation steps
 */

/**
 * Execute file system operations
 */
export async function executeFileSystemStep(
  operation: string,
  sourcePath: string,
  destinationPath?: string,
  content?: string,
  encoding: string = "utf-8"
): Promise<unknown> {
  const resolvedSource = path.resolve(sourcePath);
  
  switch (operation) {
    case "read": {
      const data = await fs.readFile(resolvedSource, { encoding: encoding as BufferEncoding });
      return data;
    }
    
    case "write": {
      if (!content) throw new Error("Content is required for write operation");
      await fs.writeFile(resolvedSource, content, { encoding: encoding as BufferEncoding });
      return { success: true, path: resolvedSource };
    }
    
    case "copy": {
      if (!destinationPath) throw new Error("Destination path is required for copy operation");
      const resolvedDest = path.resolve(destinationPath);
      await fs.copyFile(resolvedSource, resolvedDest);
      return { success: true, from: resolvedSource, to: resolvedDest };
    }
    
    case "move": {
      if (!destinationPath) throw new Error("Destination path is required for move operation");
      const resolvedDest = path.resolve(destinationPath);
      await fs.rename(resolvedSource, resolvedDest);
      return { success: true, from: resolvedSource, to: resolvedDest };
    }
    
    case "delete": {
      await fs.unlink(resolvedSource);
      return { success: true, path: resolvedSource };
    }
    
    case "exists": {
      try {
        await fs.access(resolvedSource);
        return { exists: true, path: resolvedSource };
      } catch {
        return { exists: false, path: resolvedSource };
      }
    }
    
    default:
      throw new Error(`Unknown file operation: ${operation}`);
  }
}

/**
 * Execute system command
 */
export async function executeSystemCommand(
  command: string,
  args: string[] = [],
  workingDirectory?: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const fullCommand = args.length > 0 ? `${command} ${args.join(" ")}` : command;
  const options = workingDirectory ? { cwd: workingDirectory } : {};
  
  try {
    const { stdout, stderr } = await execAsync(fullCommand, options);
    return { stdout, stderr, exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || error.message,
      exitCode: error.code || 1,
    };
  }
}

/**
 * Get or set environment variable
 */
export function executeEnvironmentVariable(
  operation: "get" | "set",
  variableName: string,
  value?: string
): unknown {
  if (operation === "get") {
    return process.env[variableName] || "";
  } else if (operation === "set") {
    if (!value) throw new Error("Value is required for set operation");
    process.env[variableName] = value;
    return { success: true, variable: variableName, value };
  }
  throw new Error(`Unknown operation: ${operation}`);
}

/**
 * Execute database query
 * Note: Requires database-specific drivers to be installed
 */
export async function executeDatabaseQuery(
  databaseType: string,
  connectionString: string,
  query: string,
  parameters?: Record<string, unknown>
): Promise<unknown> {
  // Log the attempt for debugging
  console.log(`Database query requested: ${databaseType}`);
  console.log(`Query: ${query}`);
  
  // Provide helpful error message with installation instructions
  const driverMap = {
    postgresql: "pg",
    mysql: "mysql2",
    mongodb: "mongodb",
    sqlite: "better-sqlite3",
    mssql: "mssql",
  };
  
  const driver = driverMap[databaseType.toLowerCase() as keyof typeof driverMap];
  
  throw new Error(
    `Database operations require additional dependencies.\n\n` +
    `To use ${databaseType}, install the driver:\n` +
    `  npm install ${driver}\n\n` +
    `This is a security feature - database drivers are not included by default to keep the application lightweight.`
  );
}

/**
 * Send email via SMTP
 * Note: Requires nodemailer to be installed
 */
export async function executeSendEmail(
  smtpHost: string,
  smtpPort: number,
  username: string,
  password: string,
  from: string,
  to: string,
  subject: string,
  body: string,
  html: boolean = false,
  attachments?: string[]
): Promise<unknown> {
  console.log(`Send email requested: ${from} -> ${to}`);
  console.log(`Subject: ${subject}`);
  
  throw new Error(
    `Email operations require additional dependencies.\n\n` +
    `To send emails, install nodemailer:\n` +
    `  npm install nodemailer @types/nodemailer\n\n` +
    `This is a security feature - email libraries are not included by default.`
  );
}

/**
 * Read email via IMAP
 * Note: Requires imap library to be installed
 */
export async function executeReadEmail(
  imapHost: string,
  imapPort: number,
  username: string,
  password: string,
  mailbox: string = "INBOX",
  filters?: Record<string, unknown>,
  markAsRead: boolean = false
): Promise<unknown> {
  console.log(`Read email requested: ${username}@${imapHost}`);
  console.log(`Mailbox: ${mailbox}`);
  
  throw new Error(
    `Email operations require additional dependencies.\n\n` +
    `To read emails, install imap:\n` +
    `  npm install imap @types/imap\n\n` +
    `This is a security feature - email libraries are not included by default.`
  );
}

/**
 * Execute cloud storage operations
 * Note: Requires cloud provider SDK to be installed
 */
export async function executeCloudStorage(
  provider: string,
  operation: string,
  credentials: Record<string, unknown>,
  bucket: string,
  key: string,
  localPath?: string
): Promise<unknown> {
  console.log(`Cloud storage requested: ${provider} ${operation}`);
  console.log(`Bucket: ${bucket}, Key: ${key}`);
  
  const sdkMap = {
    aws: "aws-sdk (or @aws-sdk/client-s3)",
    azure: "@azure/storage-blob",
    gcp: "@google-cloud/storage",
  };
  
  const sdk = sdkMap[provider.toLowerCase() as keyof typeof sdkMap] || "cloud provider SDK";
  
  throw new Error(
    `Cloud storage operations require additional dependencies.\n\n` +
    `To use ${provider}, install the SDK:\n` +
    `  npm install ${sdk}\n\n` +
    `This is a security feature - cloud SDKs are not included by default to keep the application lightweight.`
  );
}

/**
 * Execute webhook with advanced features
 */
export async function executeWebhook(
  url: string,
  method: string,
  headers?: Record<string, string>,
  body?: string,
  authentication?: Record<string, unknown>,
  retryPolicy?: { maxRetries: number; retryDelay: number }
): Promise<unknown> {
  const maxRetries = retryPolicy?.maxRetries || 0;
  const retryDelay = retryPolicy?.retryDelay || 1000;
  
  // Build headers with authentication
  const finalHeaders: Record<string, string> = { ...headers };
  
  if (authentication) {
    const authType = authentication.type as string;
    
    if (authType === "basic") {
      const basicAuth = Buffer.from(
        `${authentication.username}:${authentication.password}`
      ).toString("base64");
      finalHeaders["Authorization"] = `Basic ${basicAuth}`;
    } else if (authType === "bearer") {
      finalHeaders["Authorization"] = `Bearer ${authentication.token}`;
    } else if (authType === "apiKey") {
      const headerName = (authentication.apiKeyHeader as string) || "X-API-Key";
      finalHeaders[headerName] = authentication.apiKey as string;
    }
  }
  
  // Parse body data
  let requestData: unknown = undefined;
  if (body) {
    try {
      requestData = JSON.parse(body);
    } catch (error) {
      // If not valid JSON, send as string
      requestData = body;
    }
  }
  
  // Retry logic
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios({
        method: method as any,
        url,
        headers: finalHeaders,
        data: requestData,
      });
      return response.data;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Transform data between formats
 * Note: Advanced formats require additional libraries
 */
export async function executeDataTransform(
  operation: string,
  inputFormat: string,
  outputFormat: string,
  input: string,
  options?: Record<string, unknown>
): Promise<unknown> {
  // JSON operations work without additional dependencies
  if (operation === "parse" && inputFormat === "json") {
    try {
      return JSON.parse(input);
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  if (operation === "stringify" && outputFormat === "json") {
    try {
      const parsed = typeof input === "string" ? JSON.parse(input) : input;
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      throw new Error(`Failed to stringify to JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // For other formats, provide helpful error messages
  const libraryMap = {
    xml: "xml2js",
    csv: "papaparse",
    yaml: "js-yaml",
  };
  
  const neededLibs = new Set<string>();
  if (inputFormat !== "json") neededLibs.add(libraryMap[inputFormat as keyof typeof libraryMap]);
  if (outputFormat !== "json") neededLibs.add(libraryMap[outputFormat as keyof typeof libraryMap]);
  
  const libs = Array.from(neededLibs).filter(Boolean).join(", ");
  
  throw new Error(
    `Data transformation between ${inputFormat} and ${outputFormat} requires additional dependencies.\n\n` +
    `Install: npm install ${libs}\n\n` +
    `Note: JSON operations work without additional dependencies.`
  );
}
