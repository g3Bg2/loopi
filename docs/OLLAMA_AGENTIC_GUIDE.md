# Ollama Agentic Support Guide

## Overview

Loopi now supports **full agentic capabilities for Ollama**, enabling local LLM-powered automation with tool-calling support. This brings feature parity with OpenAI and Anthropic providers while maintaining the privacy and cost benefits of running models locally.

---

## Quick Start

### 1. Install & Run Ollama

```bash
# Download from ollama.ai
# Run Ollama server (default port 11434)
ollama serve

# In another terminal, pull a model
ollama pull mistral
```

### 2. Create an AI Agent Step in Loopi

1. Add a new **AI Agent** step to your automation
2. Select **Ollama (Local LLM)** as the provider
3. Enter model name (e.g., `mistral`)
4. Set your goal and configure tools
5. Run!

### 3. Example: Scrape and Summarize

```
Goal: Scrape the top 5 stories from Hacker News, extract their titles and URLs, then summarize them

Provider: Ollama
Model: mistral
Temperature: 0
Max Tokens: 2048
Allowed Steps: navigate, extract, apiCall
```

The AI agent will:
1. Navigate to Hacker News
2. Extract story titles and URLs
3. Store results in variables
4. Generate a summary

---

## Model Recommendations

### ✅ Recommended Models for Tool-Calling

| Model | Size | Speed | Quality | Notes |
|-------|------|-------|---------|-------|
| **mistral** | 7B | Fast | Good | Best for tool-calling; excellent instruction following |
| **neural-chat** | 13B | Medium | Very Good | Fine-tuned for conversations and function calls |
| **dolphin-mixtral** | 46B | Slow | Excellent | Mixture of experts; outstanding reasoning |
| **hermes2-theta** | 7B | Fast | Good | Optimized for tool use |
| **openhermes** | 7B | Fast | Good | Strong at function calling |

### ⚠️ Not Recommended

- **llama2** - Limited function-calling support
- **orca-mini** - Weak instruction following for complex tasks
- **neural-chat-7b-v3-1** - May struggle with JSON parsing for tool arguments

### Installation Commands

```bash
# Fast & reliable (recommended)
ollama pull mistral

# More powerful
ollama pull neural-chat

# Cutting edge
ollama pull dolphin-mixtral
ollama pull hermes2-theta
```

---

## Configuration Reference

### Required Fields

| Field | Example | Description |
|-------|---------|-------------|
| **Provider** | `ollama` | Must select Ollama |
| **Model** | `mistral` | Model name (as in `ollama list`) |
| **Goal** | `Find all links on this page` | Describe what agent should do |

### Optional Fields

| Field | Default | Notes |
|-------|---------|-------|
| **Base URL** | `http://localhost:11434` | For remote Ollama instances |
| **Temperature** | `0` | Keep at 0 for determinism |
| **Max Tokens** | `2048` | Increase for complex tasks |
| **System Prompt** | `You are an AI agent...` | Customize agent behavior |
| **Timeout** | `30000ms` | Increase for slow models/tasks |

### Example Configurations

#### Fast Scraping Task
```json
{
  "provider": "ollama",
  "model": "mistral",
  "goal": "Extract all product names and prices from the current page",
  "temperature": 0,
  "maxTokens": 1024,
  "timeoutMs": 20000,
  "allowedSteps": ["navigate", "extract", "screenshot"]
}
```

#### Complex Analysis Task
```json
{
  "provider": "ollama",
  "model": "dolphin-mixtral",
  "goal": "Analyze customer reviews: extract sentiment, rate 1-5, identify key issues",
  "temperature": 0,
  "maxTokens": 3000,
  "systemPrompt": "You are a customer service analyst. Be thorough and precise.",
  "timeoutMs": 45000,
  "allowedSteps": ["navigate", "extract", "apiCall", "setVariable"]
}
```

#### API Integration Task
```json
{
  "provider": "ollama",
  "model": "neural-chat",
  "goal": "Check API response, validate data structure, store results",
  "temperature": 0,
  "maxTokens": 2048,
  "allowedSteps": ["apiCall", "extract", "setVariable", "getVariable"]
}
```

---

## Tool-Calling Architecture

### How Ollama Tool-Calling Works

1. **Tool Registry**: Agent has access to 12 automation tools
   - `navigate` - Go to URL
   - `click` - Click element
   - `type` - Type text
   - `extract` - Extract element content
   - `screenshot` - Take screenshot
   - `wait` - Wait N seconds
   - `apiCall` - Make HTTP request
   - `setVariable` / `getVariable` - Manage variables
   - `twitterCreateTweet` / `twitterSearchTweets` - Twitter API
   - `discordSendMessage` - Discord API

2. **Agent Loop** (Max 10 iterations):
   - Send goal + available tools to Ollama
   - Ollama decides which tool(s) to call
   - Loopi executes tool(s)
   - Add results to conversation
   - Repeat until goal is achieved or max iterations reached

3. **Tool Calling Format**:
   - Ollama uses OpenAI-compatible format (same as GPT)
   - Each tool call includes name + JSON arguments
   - Execution results fed back to LLM
   - LLM can call multiple tools per iteration

### Example Tool Execution Flow

```
User Goal: "Find my GitHub username in trending repos"

Iteration 1:
├─ Agent thinks: "I need to search GitHub"
├─ Calls: apiCall(method: "GET", url: "https://api.github.com/search/repositories?q=...")
└─ Result: Returns JSON with repos

Iteration 2:
├─ Agent thinks: "Search didn't find my username, let me try different query"
├─ Calls: apiCall(method: "GET", url: "https://api.github.com/search/code?q=...")
└─ Result: Found username in 3 results

Iteration 3:
├─ Agent thinks: "Task complete!"
└─ Returns: "Found username in 3 trending repositories: [...]"
```

---

## Performance Tuning

### Speed vs Quality Trade-offs

**Fast Configuration** (5-15 seconds per task)
```json
{
  "model": "mistral",
  "temperature": 0,
  "maxTokens": 1024,
  "allowedSteps": ["navigate", "extract"]
}
```

**Balanced Configuration** (15-30 seconds per task)
```json
{
  "model": "neural-chat",
  "temperature": 0.2,
  "maxTokens": 2048,
  "allowedSteps": ["navigate", "extract", "apiCall", "setVariable"]
}
```

**Quality Configuration** (30-60+ seconds per task)
```json
{
  "model": "dolphin-mixtral",
  "temperature": 0.3,
  "maxTokens": 3000,
  "allowedSteps": ["navigate", "click", "type", "extract", "apiCall", "screenshot", "setVariable", "wait"]
}
```

### Hardware Requirements

| Task Complexity | GPU Memory | CPU | Recommended Model |
|----------------|------------|-----|-------------------|
| Simple (1-2 steps) | 4GB | 4-core | mistral 7B |
| Medium (3-5 steps) | 8GB | 8-core | neural-chat 13B |
| Complex (5+ steps) | 16GB+ | 16-core | dolphin-mixtral 46B |

### Remote Ollama Instance

For production deployments, run Ollama on a separate machine:

```bash
# On Ollama server
OLLAMA_HOST=0.0.0.0:11434 ollama serve

# In Loopi, set Base URL
# http://ollama-server-ip:11434
```

---

## Common Patterns

### Pattern 1: Web Scraping with AI Analysis

```json
{
  "goal": "Visit the page, extract all product titles and prices, analyze which products are trending",
  "allowedSteps": ["navigate", "extract", "screenshot"],
  "model": "mistral"
}
```

### Pattern 2: API Testing & Validation

```json
{
  "goal": "Call the API endpoint, validate response structure, extract key metrics, store in variables",
  "allowedSteps": ["apiCall", "extract", "setVariable"],
  "model": "neural-chat"
}
```

### Pattern 3: Multi-Step Automation

```json
{
  "goal": "Login, navigate to profile, extract user data, compare with previous data, send notification if changed",
  "allowedSteps": ["navigate", "click", "type", "extract", "apiCall", "setVariable"],
  "model": "dolphin-mixtral"
}
```

### Pattern 4: Data Extraction & Transformation

```json
{
  "goal": "Extract CSV data, parse each row, validate against rules, transform to JSON format",
  "allowedSteps": ["extract", "setVariable", "getVariable"],
  "model": "neural-chat"
}
```

---

## Troubleshooting

### Model Doesn't Respond to Tool Calls

**Problem**: Agent never calls tools, just responds with text

**Solutions**:
1. Switch to `mistral` or `neural-chat` (both verified for tool-calling)
2. Increase `maxTokens` to 2048+
3. Simplify the goal statement
4. Reduce `allowedSteps` to 3-4 core tools

**Example Fix**:
```json
{
  "model": "mistral",  // Switch to proven tool-caller
  "goal": "Click the login button",  // More specific goal
  "maxTokens": 2048,  // Give more space
  "allowedSteps": ["navigate", "click"]  // Fewer options
}
```

### Agent Loops Infinitely (Hits Max Iterations)

**Problem**: Agent reaches 10 iterations without completing task

**Solutions**:
1. **Simplify the goal** - Break into smaller steps
2. **Add more context** - Improve system prompt
3. **Increase maxTokens** - 3000+ for complex tasks
4. **Use better model** - Try `dolphin-mixtral`

**Before**:
```json
{
  "goal": "Analyze all social media trends from last week and create report"
}
```

**After**:
```json
{
  "goal": "Fetch today's Twitter trending topics and extract top 5 hashtags",
  "maxTokens": 3000,
  "model": "neural-chat"
}
```

### Timeout Errors

**Problem**: `Error: Ollama request timed out`

**Solutions**:
1. Increase `timeoutMs` (default 30000 = 30 seconds)
2. Use faster model (`mistral` < `neural-chat`)
3. Reduce `maxTokens`
4. Check Ollama server is responding: `curl http://localhost:11434/api/status`

**Fix**:
```json
{
  "timeoutMs": 60000,  // 60 seconds instead of 30
  "model": "mistral",  // Faster model
  "maxTokens": 2048    // Reasonable size
}
```

### Poor Tool Calling Performance

**Problem**: Agent makes wrong tool calls or misses obvious tools

**Solutions**:
1. **Provide example in system prompt**:
   ```json
   {
     "systemPrompt": "When extracting prices, use extract tool with selector '.price'. When navigating, always use navigate tool first."
   }
   ```

2. **Be more specific in goal**:
   ```json
   {
     "goal": "Click the 'Buy Now' button and extract the product price from the price element"
   }
   ```

3. **Filter allowedSteps carefully**:
   ```json
   {
     "allowedSteps": ["click", "extract"]  // Only essential tools
   }
   ```

---

## Best Practices

### ✅ DO:
- Keep goals **specific and actionable**
- Start with `mistral` for tool-calling tasks
- Use **temperature 0** for deterministic automation
- Set **reasonable timeouts** (20-60 seconds)
- **Filter allowedSteps** to essential tools only
- Test in **debug mode** before production
- Monitor **token usage** to optimize costs

### ❌ DON'T:
- Use non-tool-calling models (llama2, orca-mini)
- Set temperature > 0.5 for automation tasks
- Allow all 12 tools (agent gets confused)
- Use extremely long prompts (>1000 chars)
- Run on underpowered hardware (< 4GB VRAM)
- Send same agent request multiple times without analyzing failure

---

## Migration from OpenAI/Anthropic

### Cost Comparison

| Provider | Model | Cost per 1M tokens |
|----------|-------|-------------------|
| **OpenAI** | GPT-4 Turbo | $30 input, $60 output |
| **Anthropic** | Claude 3.5 Sonnet | $3 input, $15 output |
| **Ollama** | mistral (local) | **$0** |

### Migration Path

1. **Test with existing automations**: Set provider to Ollama, keep same goal/settings
2. **Adjust for differences**: Ollama may need more specific instructions
3. **Optimize for speed**: Reduce maxTokens if model is slower than expected
4. **Switch completely**: Once verified working, replace OpenAI/Anthropic nodes

### Compatibility Matrix

| Feature | OpenAI | Anthropic | Ollama |
|---------|--------|-----------|--------|
| Tool-calling | ✅ | ✅ | ✅ |
| API key auth | ✅ | ✅ | ❌ (local only) |
| Custom base URL | ✅ | ✅ | ✅ |
| Temperature control | ✅ | ✅ | ✅ |
| Max tokens | ✅ | ✅ | ✅ |
| System prompt | ✅ | ✅ | ✅ |
| Streaming (future) | ✅ | ✅ | ✅ |

---

## Advanced Configuration

### Custom System Prompt for Tool-Calling Optimization

```json
{
  "systemPrompt": "You are a precise automation agent with access to browser and API tools. Instructions: 1) Break complex goals into smaller steps. 2) Always navigate before clicking/typing. 3) Use extract to validate changes. 4) Store important data in variables. 5) Summarize results clearly."
}
```

### Remote Ollama with Authentication

```bash
# On server with reverse proxy
# (Ollama doesn't have built-in auth, use nginx/traefik)
location / {
  proxy_pass http://ollama:11434;
  auth_basic "Ollama API";
  auth_basic_user_file /etc/nginx/.htpasswd;
}
```

```json
{
  "baseUrl": "https://ollama.example.com",
  "model": "mistral"
}
```

### Variable Substitution in Agent Goals

```json
{
  "goal": "Search for {{searchTerm}} and extract top 5 results to {{resultsVariable}}",
  "storeKey": "completionStatus"
}
```

---

## Support & Resources

- **Ollama Website**: https://ollama.ai
- **Model Library**: https://ollama.ai/library
- **Tool-Calling Docs**: See [TOOL_CALLING_IMPLEMENTATION.md](./TOOL_CALLING_IMPLEMENTATION.md)
- **AI Agent Guide**: See [AI_AGENT_GUIDE.md](./AI_AGENT_GUIDE.md)
- **Troubleshooting**: See [DEBUG_MODE.md](./DEBUG_MODE.md)

---

## Summary

Ollama agentic support brings **local, private, cost-free LLM automation** to Loopi with full feature parity to cloud providers. Choose models based on your hardware and latency requirements, use proven tool-callers (mistral, neural-chat), and follow best practices for optimal results.
