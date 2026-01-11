# Tool-Calling AI Agent - Quick Reference

## Node Picker Entry
**Location**: Automation Builder → Add Step → AI Steps → "AI: Agent (Tool Calling)"

## Step Type ID
```typescript
type: "aiAgent"
```

## Configuration Fields

```typescript
interface StepAIAgent extends StepBase {
  type: "aiAgent";
  provider: "openai" | "anthropic";
  model: string;                    // e.g., "gpt-4-turbo"
  goal: string;                      // What to accomplish
  systemPrompt?: string;             // Custom instructions
  temperature?: number;              // 0-1 (default: 0)
  maxTokens?: number;                // Response limit (default: 2048)
  credentialId?: string;             // From credential store
  apiKey?: string;                   // Manual API key
  baseUrl?: string;                  // Custom endpoint
  timeoutMs?: number;                // Request timeout
  storeKey?: string;                 // Result variable (default: "agentResult")
  allowedSteps?: string[];           // Tool filter (empty = all)
}
```

## Execution Flow

```
1. executeAiAgent(step) called
   ↓
2. Validate: goal, model, provider
   ↓
3. buildToolRegistry() → all available tools
   ↓
4. Filter tools by allowedSteps (if specified)
   ↓
5. Loop (max 10 iterations):
   a. callOpenAIWithTools() or callAnthropicWithTools()
   b. Parse tool_calls from response
   c. executeTool() for each call
   d. Feed results back to AI
   e. Check if goal complete → exit loop
   ↓
6. Return final result
   ↓
7. Store in step.storeKey variable
```

## Available Tools (Tool Names)

| Tool | Parameters | Returns |
|------|-----------|---------|
| `navigate` | `url` | "Successfully navigated to {url}" |
| `click` | `selector` | "Clicked on element: {selector}" |
| `type` | `selector`, `text` | "Typed text into {selector}" |
| `extract` | `selector`, `variableName` | "Extracted text: {value}" |
| `screenshot` | `variableName` (optional) | "Screenshot taken" |
| `wait` | `seconds` | "Waited {seconds} seconds" |
| `apiCall` | `method`, `url`, `body` (opt), `variableName` (opt) | "Made {method} request to {url}" |
| `setVariable` | `variableName`, `value` | "Set {varName} = {value}" |
| `getVariable` | `variableName` | "{varName} = {value}" |
| `twitterCreateTweet` | `text` | "Tweet created: {text}" |
| `twitterSearchTweets` | `query`, `variableName` (opt) | "Search results: ..." |
| `discordSendMessage` | `channelId`, `content` | "Message sent to {channelId}" |

## Provider Requirements

### OpenAI
- Models with function calling: gpt-4, gpt-4-turbo, gpt-4o
- API endpoint: https://api.openai.com/v1
- Format: Bearer token auth
- Tool capability: function calling

### Anthropic
- Models with tool use: claude-3-opus, claude-3-sonnet, claude-3-haiku
- API endpoint: https://api.anthropic.com
- Format: x-api-key header
- Tool capability: tool use (structured)

## Code Locations

| Component | File | Lines |
|-----------|------|-------|
| Type Definition | `src/types/steps.ts` | ~30 |
| UI Component | `src/components/automationBuilder/nodeDetails/stepTypes/integration/AiAgentStep.tsx` | ~130 |
| Execution | `src/main/automationExecutor.ts` | ~500 |
| Tool Registry | `src/main/toolRegistry.ts` | ~300 |
| Node Factory | `src/hooks/utils/nodeFactory.ts` | ~15 |
| Step Editor | `src/components/automationBuilder/nodeDetails/StepEditor.tsx` | +1 case |

## Default Configuration

```typescript
{
  type: "aiAgent",
  provider: "openai",
  model: "gpt-4-turbo",
  goal: "Accomplish the following task:",
  systemPrompt: "You are an AI agent that can control browser automation...",
  temperature: 0,
  maxTokens: 2048,
  storeKey: "agentResult",
  allowedSteps: []  // empty = all tools available
}
```

## Common Patterns

### Simple Web Scraping
```typescript
{
  goal: "Get the page title and store in titleVar",
  allowedSteps: ["navigate", "extract", "wait"],
  temperature: 0
}
```

### API Integration
```typescript
{
  goal: "Call weather API and post result to Discord",
  allowedSteps: ["apiCall", "setVariable", "discordSendMessage"],
  temperature: 0
}
```

### Multi-Step Workflow
```typescript
{
  goal: "Search for keyword, click first result, extract summary",
  allowedSteps: ["navigate", "type", "click", "extract", "wait"],
  temperature: 0.1  // slight variation for resilience
}
```

### With Custom Instructions
```typescript
{
  goal: "Find and list top 5 results",
  systemPrompt: "You are a research assistant. Extract data in JSON format. Be thorough.",
  temperature: 0.5,
  allowedSteps: ["navigate", "extract", "apiCall"]
}
```

## Debug & Monitoring

Check logs for:
- `AI Agent` debug messages showing iteration count
- Tool execution results
- Loop termination reason (goal met vs max iterations)

In automationExecutor:
```typescript
debugLogger.debug("AI Agent", "Starting agentic loop", {...});
debugLogger.debug("AI Agent", `Iteration ${i}/${maxIterations}`, {...});
debugLogger.debug("AI Agent", `Tool executed: ${toolName}`, {...});
debugLogger.error("AI Agent", `Tool failed: ${toolName}`, error);
debugLogger.debug("AI Agent", "Agentic loop completed", {...});
```

## Error Scenarios

| Error | Cause | Recovery |
|-------|-------|----------|
| "API key is required" | Missing credentials | Add to credential store or manual entry |
| "Invalid provider" | Wrong provider selected | Use "openai" or "anthropic" only |
| "Max iterations reached" | Goal not completable | Simplify goal or add system prompt |
| Tool error in loop | Selector/API issue | AI retries with different approach |
| Timeout | Long-running tool | Increase timeoutMs, add wait steps |

## Performance Tips

1. **Keep goals specific**: "Get Bitcoin price" not "Research crypto"
2. **Filter tools**: Use allowedSteps to reduce decision space
3. **Temperature=0**: Deterministic execution (default)
4. **Preload data**: Use setVariable before agent for context
5. **Monitor iterations**: Check debug logs for efficiency

## Testing Helpers

Test AI agent with:

```typescript
// Minimal working example
{
  type: "aiAgent",
  provider: "openai",
  model: "gpt-4-turbo",
  goal: "Set variable testResult to hello-world",
  allowedSteps: ["setVariable", "getVariable"]
}
// Expected: agentResult = "Set variable testResult = hello-world"
```

## Related Methods

In AutomationExecutor:
- `executeAiAgent(step)` - Main entry point
- `callOpenAIWithTools(...)` - OpenAI API call
- `callAnthropicWithTools(...)` - Anthropic API call
- `executeTool(toolName, args)` - Individual tool execution
- `buildToolRegistry()` - Tool definition list

## Imports

```typescript
import { StepAIAgent } from "@app-types/steps";
import { 
  buildToolRegistry, 
  formatToolsForOpenAI, 
  formatToolsForAnthropic 
} from "./toolRegistry";
```

## Variable Substitution

Agent can use variables in tool arguments:

```typescript
// Goal defined with variables
goal: "Navigate to {{baseUrl}} and extract title from {{selector}}",

// Variables available:
{
  baseUrl: "https://example.com",
  selector: "h1.title"
}

// Results in actual goal:
"Navigate to https://example.com and extract title from h1.title"
```

## Return Value

Method returns: **string**

- Success: Final summary or result text
- Timeout: "Max iterations reached. Agent loop completed."
- Error: Exception thrown

Stored in: `step.storeKey` variable (default: "agentResult")

## Future Extensions

Placeholder for custom tool registration:
```typescript
// Not yet implemented
const customTools = [
  { name: "myTool", description: "...", parameters: [...] }
];
agent.registerTools(customTools);
```

## See Also

- [AI Agent Guide](./AI_AGENT_GUIDE.md) - User documentation
- [Implementation Details](./TOOL_CALLING_IMPLEMENTATION.md) - Technical overview
- [Tool Registry](../src/main/toolRegistry.ts) - Tool definitions
- [Automation Executor](../src/main/automationExecutor.ts) - Execution logic
