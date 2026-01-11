# AI Agent (Tool-Calling) Guide

## Overview

The **AI Agent** node is an advanced automation feature that enables artificial intelligence to autonomously decide which automation steps to execute in order to accomplish a goal. Instead of the agent simply generating text, it acts as a planner that controls other automation nodes.

This is fundamentally different from the basic AI nodes (OpenAI, Anthropic, Ollama) which only generate text. The AI Agent uses **function calling** (OpenAI) or **tool use** (Anthropic) to invoke other automation steps.

## How It Works

1. **Goal Definition**: You provide the AI with a goal (e.g., "Find the article title on this webpage")
2. **Tool Registry**: The AI sees all available automation steps as "tools" it can call
3. **Planning**: The AI decides which tools to use in what order
4. **Execution**: Each selected tool is executed in the browser/system
5. **Feedback Loop**: The AI sees the results and decides next steps
6. **Loop**: This continues until the goal is reached or max iterations hit

### Example Flow

```
User Goal: "Find the current Bitcoin price and post it to Discord"
    ↓
AI decides: 1) Navigate to price website
    ↓
Execute: Browser navigates to URL
    ↓
AI receives: Screenshot/page content
    ↓
AI decides: 2) Extract the price text
    ↓
Execute: Element extraction returns "$42,500"
    ↓
AI decides: 3) Send Discord message with price
    ↓
Execute: Message sent to channel
    ↓
AI decides: Goal complete, return summary
    ↓
Result: "Successfully found Bitcoin price ($42,500) and posted to Discord"
```

## Node Configuration

The **AI: Agent (Tool Calling)** node is configured with:

| Field | Description | Default |
|-------|-------------|---------|
| **Provider** | `openai` or `anthropic` (tool-use capable only) | openai |
| **Model** | Model identifier (e.g., `gpt-4-turbo`, `claude-3-opus`) | gpt-4-turbo |
| **Goal** | What you want the AI to accomplish | - |
| **System Prompt** | Custom AI instructions (optional) | Default agent role |
| **Temperature** | Randomness (0-1, lower = more deterministic) | 0 |
| **Max Tokens** | Maximum response length | 2048 |
| **API Credentials** | API key from credential store or manual | - |
| **Base URL** | Custom API endpoint (for self-hosted) | Production default |
| **Result Variable** | Where to store final output (e.g., `agentResult`) | agentResult |
| **Max Iterations** | Prevents infinite loops (internal) | 10 |
| **Allowed Steps** | Restrict which step types agent can use (empty = all) | - |

## Available Tools (Automation Steps)

The AI can invoke any of these automation steps:

### Browser Control
- **navigate**: Go to a URL
  - Parameters: `url`
  - Example: Navigate to https://example.com

- **click**: Click on an element
  - Parameters: `selector` (CSS or XPath)
  - Example: Click the search button

- **type**: Type text into a field
  - Parameters: `selector`, `text`
  - Example: Type search query

- **extract**: Get text from element and store in variable
  - Parameters: `selector`, `variableName`
  - Example: Extract heading text into `pageTitle`

- **screenshot**: Capture current page state
  - Parameters: `variableName` (optional)
  - Example: Take screenshot for review

- **wait**: Pause for page loading
  - Parameters: `seconds`
  - Example: Wait 2 seconds

### Data & Variables
- **setVariable**: Create/update a variable
  - Parameters: `variableName`, `value`
  - Example: Set `temperature` = 72

- **getVariable**: Read a variable value
  - Parameters: `variableName`
  - Example: Get value of `pageTitle`

### API Integration
- **apiCall**: Make HTTP requests
  - Parameters: `method` (GET/POST), `url`, `body` (optional), `variableName`
  - Example: POST to API endpoint

### External Services
- **twitterCreateTweet**: Post to Twitter/X
  - Parameters: `text`
  - Example: Tweet "Found the answer!"

- **twitterSearchTweets**: Search tweets
  - Parameters: `query`, `variableName`
  - Example: Search tweets about topic

- **discordSendMessage**: Post to Discord
  - Parameters: `channelId`, `content`
  - Example: Send message to #announcements

## Usage Example

### Scenario: Automate Price Monitoring

**Goal**: "Check Bitcoin price on CoinMarketCap and if it's above $40,000, post to Discord"

**Configuration**:
- Provider: `openai`
- Model: `gpt-4-turbo`
- Goal: `Check Bitcoin price on CoinMarketCap and if above $40,000, post notification to our Discord #alerts channel`
- System Prompt: (use default)
- Temperature: `0` (deterministic)
- Max Tokens: `2048`
- Result Variable: `priceCheckResult`

**What AI Will Do**:
1. Navigate to CoinMarketCap
2. Wait for page load
3. Extract Bitcoin price
4. Compare with $40,000 threshold
5. If above threshold: Send Discord message
6. Return summary

**Result** stored in `priceCheckResult` variable

## Key Design Decisions

### Why Tool Calling?

Instead of just generating text, the AI is given a toolkit. This enables:

- **Autonomous Workflows**: AI chooses actions, not humans
- **Iterative Problem-Solving**: AI sees results and adjusts
- **Error Recovery**: AI can retry or try alternative approaches
- **Deterministic Planning**: Temperature 0 means consistent results
- **Safe Boundaries**: You control what tools are available

### Temperature = 0 by Default

Tool-calling agents should be deterministic. Random decisions would cause unpredictable automation. The default temperature of `0` means the same goal produces the same execution path every time.

### Iteration Limit

Maximum 10 iterations prevents infinite loops if:
- AI gets stuck retrying failed steps
- Tool results are ambiguous
- Goal description is impossible

You'll see a message if max iterations are reached.

### Allowed Steps Filter

By default, the AI can call any automation step. You can restrict this:

```json
{
  "allowedSteps": ["navigate", "click", "extract", "wait"]
}
```

This creates a sandbox where certain operations are forbidden (e.g., prevent Twitter posts if only monitoring).

## Integration with Variable System

Variables persist across tool calls:

```
Goal: "Get page title and count words in it"

1. Extract: selector=h1 → variableName=title → Result: "My Page Title"
2. setVariable: variableName=wordCount → value={{title.split(' ').length}}
3. Return: "Title has 3 words"
```

The `{{variableName}}` substitution syntax works in tool arguments.

## Error Handling

If a tool call fails:

- AI is notified: "Error: Selector not found for click"
- AI can retry with different selector
- AI can try alternative approach
- After 10 iterations, agent gives up

Example recovery:
```
Goal: "Click the search button and enter query"

Attempt 1: Click selector="button.search" → Error: Not found
Attempt 2: AI tries alternate selector
Attempt 3: AI navigates to search page first
Attempt 4: Success
```

## Performance Considerations

### Token Usage
- Basic tool call: ~50-100 tokens
- Complex goal: 200-500 tokens per iteration
- 10 iterations @ 300 tokens = 3000 tokens per run

### API Calls
- Each iteration = 1 API call (OpenAI/Anthropic)
- Browser operations (click, type, extract) = instant
- Dependent on: goal complexity, API latency, iteration count

### Optimization Tips
- Keep goals specific and clear
- Use `allowedSteps` to reduce tool space
- Set appropriate temperature (0 for deterministic)
- Monitor max iterations in logs
- Test with simple goals first

## Troubleshooting

### Agent Not Making Progress
**Symptom**: Agent retries same action endlessly

**Solution**: 
- Make goal more specific
- Add system prompt with step-by-step instructions
- Reduce allowed steps to prevent dead-ends

### Agent Gets Wrong Results
**Symptom**: Agent extracts wrong element or makes wrong decision

**Solution**:
- Improve goal description with examples
- Provide better selectors in system prompt
- Set temperature higher (0.3-0.5) for variation
- Add explicit filtering in goal

### API Key Errors
**Symptom**: "API key is required for OpenAI"

**Solution**:
- Check credentials are saved in Loopi
- Verify API key has tool-use permission
- For OpenAI: Needs latest model with function calling
- For Anthropic: Needs Claude 3+ model

### Max Iterations Reached
**Symptom**: Agent completes without full result

**Solution**:
- Goal may be ambiguous or impossible
- Agent spent iterations exploring
- Try simpler goal or more specific instructions
- Check debug logs for what agent was trying

## Advanced Features

### Custom System Prompts

Default: Generic agent instructions

You can provide custom instructions:

```
You are an expert web researcher. 
When extracting prices:
1. Always look for USD currency symbol ($)
2. Remove commas from numbers (42,000 → 42000)
3. If multiple prices, pick the highest
4. Store results in JSON format
```

### Self-Hosted Models

For Anthropic through Claude API proxy:

- Set Base URL: `https://your-api-proxy.com`
- Use custom API key
- Model should match proxy's available models

For OpenAI-compatible endpoints:

- Set Base URL: `https://your-openai-compatible.com/v1`
- Model: Whatever the endpoint supports
- API key format: Matches endpoint requirements

## Comparison to Other AI Nodes

| Feature | AI OpenAI | AI Anthropic | AI Ollama | **AI Agent** |
|---------|-----------|--------------|-----------|-------------|
| Text Generation | ✅ | ✅ | ✅ | ✅ |
| Function Calling | ❌ | ❌ | ❌ | ✅ |
| Tool Use | ❌ | ❌ | ❌ | ✅ |
| Autonomous Actions | ❌ | ❌ | ❌ | ✅ |
| Loop/Iteration | ❌ | ❌ | ❌ | ✅ |
| Best For | Quick text generation | Nuanced writing | Fast local inference | Autonomous workflows |

## Technical Details

### Tool Schema Format

For OpenAI (function calling):
```json
{
  "type": "function",
  "function": {
    "name": "click",
    "description": "Click on an element matching the selector",
    "parameters": {
      "type": "object",
      "properties": {
        "selector": {
          "type": "string",
          "description": "CSS or XPath selector"
        }
      },
      "required": ["selector"]
    }
  }
}
```

For Anthropic (tool use):
```json
{
  "name": "click",
  "description": "Click on an element matching the selector",
  "input_schema": {
    "type": "object",
    "properties": {
      "selector": {
        "type": "string",
        "description": "CSS or XPath selector"
      }
    },
    "required": ["selector"]
  }
}
```

### Message Format

Conversation maintains chat history:

```
System: [Agent instructions]
User: [Initial goal]
Assistant: {"tool_calls": [{"name": "navigate", "arguments": {...}}]}
User: [Tool results: "Successfully navigated to URL"]
Assistant: {"tool_calls": [{"name": "extract", "arguments": {...}}]}
User: [Tool results: "Extracted text: Bitcoin price is $42,500"]
...continues until goal met or max iterations
```

### Supported Providers

- **OpenAI**: gpt-4, gpt-4-turbo, gpt-4o (with function calling)
- **Anthropic**: claude-3-opus, claude-3-sonnet (with tool use)
- **Ollama**: Coming soon (planned for local tool-use models)

## Future Enhancements

Planned additions:
- Streaming support for real-time feedback
- Custom tool registration (user-defined steps as tools)
- Tool result validation and constraints
- Memory system (long-term variable storage)
- Tool execution parallelization
- Trajectory logging and replay

## FAQs

**Q: Can the AI agent handle multiple goals simultaneously?**
A: Not in single node. Chain multiple agent nodes for sequential compound goals.

**Q: What if a tool takes a long time to execute?**
A: Agent waits (timeout configurable). Recommend waiting first before long operations.

**Q: Can the agent learn from previous runs?**
A: Not yet. Each run starts fresh. Future: persistence layer.

**Q: Is the agent's plan visible to the user?**
A: Debug logs show each iteration and tool call. Full trajectory is logged.

**Q: Can we constrain the agent to use specific tools in a certain order?**
A: Not directly. You can create separate workflows with sequential agent nodes.
