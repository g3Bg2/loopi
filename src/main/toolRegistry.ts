/**
 * Tool Registry - Describes available automation steps as tools for AI agents
 * Enables AI to call these tools via function calling APIs
 */

import type { AutomationStep } from "@app-types/steps";

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object";
  description: string;
  required: boolean;
  enum?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  category: string;
  parameters: ToolParameter[];
}

/**
 * Build tool definitions for AI to use via function calling
 * These describe available automation steps
 */
export function buildToolRegistry(): ToolDefinition[] {
  return [
    {
      name: "navigate",
      description: "Navigate to a URL in the browser",
      category: "browser",
      parameters: [
        {
          name: "url",
          type: "string",
          description: "The URL to navigate to",
          required: true,
        },
      ],
    },
    {
      name: "click",
      description: "Click on an element matching the selector",
      category: "browser",
      parameters: [
        {
          name: "selector",
          type: "string",
          description: "CSS or XPath selector for the element to click",
          required: true,
        },
      ],
    },
    {
      name: "type",
      description: "Type text into an input field",
      category: "browser",
      parameters: [
        {
          name: "selector",
          type: "string",
          description: "CSS or XPath selector for the input element",
          required: true,
        },
        {
          name: "text",
          type: "string",
          description: "Text to type into the field",
          required: true,
        },
      ],
    },
    {
      name: "extract",
      description: "Extract text from an element and store in a variable",
      category: "browser",
      parameters: [
        {
          name: "selector",
          type: "string",
          description: "CSS or XPath selector for the element to extract from",
          required: true,
        },
        {
          name: "variableName",
          type: "string",
          description: "Name of variable to store the extracted text",
          required: true,
        },
      ],
    },
    {
      name: "screenshot",
      description: "Take a screenshot of the current page",
      category: "browser",
      parameters: [
        {
          name: "variableName",
          type: "string",
          description: "Optional: variable name to store screenshot path",
          required: false,
        },
      ],
    },
    {
      name: "wait",
      description: "Wait for a specified number of seconds",
      category: "browser",
      parameters: [
        {
          name: "seconds",
          type: "number",
          description: "Number of seconds to wait",
          required: true,
        },
      ],
    },
    {
      name: "apiCall",
      description: "Make an HTTP API request (GET or POST)",
      category: "integration",
      parameters: [
        {
          name: "method",
          type: "string",
          description: "HTTP method (GET or POST)",
          required: true,
          enum: ["GET", "POST"],
        },
        {
          name: "url",
          type: "string",
          description: "The API endpoint URL",
          required: true,
        },
        {
          name: "body",
          type: "string",
          description: "JSON body for POST requests",
          required: false,
        },
        {
          name: "variableName",
          type: "string",
          description: "Variable name to store response",
          required: false,
        },
      ],
    },
    {
      name: "setVariable",
      description: "Set or define a variable with a value",
      category: "variables",
      parameters: [
        {
          name: "variableName",
          type: "string",
          description: "Name of the variable to set",
          required: true,
        },
        {
          name: "value",
          type: "string",
          description: "Value to assign (can reference other variables with {{varName}})",
          required: true,
        },
      ],
    },
    {
      name: "getVariable",
      description: "Read the value of a variable",
      category: "variables",
      parameters: [
        {
          name: "variableName",
          type: "string",
          description: "Name of the variable to read",
          required: true,
        },
      ],
    },
    {
      name: "twitterCreateTweet",
      description: "Post a tweet on Twitter/X",
      category: "twitter",
      parameters: [
        {
          name: "text",
          type: "string",
          description: "Tweet text content (max 280 chars)",
          required: true,
        },
      ],
    },
    {
      name: "twitterSearchTweets",
      description: "Search for tweets matching a query",
      category: "twitter",
      parameters: [
        {
          name: "query",
          type: "string",
          description: "Search query string",
          required: true,
        },
        {
          name: "variableName",
          type: "string",
          description: "Variable name to store search results",
          required: false,
        },
      ],
    },
    {
      name: "discordSendMessage",
      description: "Send a message to a Discord channel",
      category: "discord",
      parameters: [
        {
          name: "channelId",
          type: "string",
          description: "Discord channel ID",
          required: true,
        },
        {
          name: "content",
          type: "string",
          description: "Message content to send",
          required: true,
        },
      ],
    },
  ];
}

/**
 * Format tool registry for OpenAI function calling
 */
export function formatToolsForOpenAI(tools: ToolDefinition[]) {
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: "object",
        properties: Object.fromEntries(
          tool.parameters.map((param) => [
            param.name,
            {
              type: param.type,
              description: param.description,
              ...(param.enum && { enum: param.enum }),
            },
          ])
        ),
        required: tool.parameters.filter((p) => p.required).map((p) => p.name),
      },
    },
  }));
}

/**
 * Format tool registry for Anthropic tool use
 */
export function formatToolsForAnthropic(tools: ToolDefinition[]) {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: {
      type: "object",
      properties: Object.fromEntries(
        tool.parameters.map((param) => [
          param.name,
          {
            type: param.type,
            description: param.description,
            ...(param.enum && { enum: param.enum }),
          },
        ])
      ),
      required: tool.parameters.filter((p) => p.required).map((p) => p.name),
    },
  }));
}
