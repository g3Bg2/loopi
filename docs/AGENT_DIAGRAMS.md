# AI Agent - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Loopi Automation Engine                     │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                              │ Workflow Execution
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
   ┌────▼──────────────┐              ┌────────────▼─────┐
   │  Other Step Types │              │   AI: Agent Node  │
   │  (navigate, click,│              │                   │
   │   type, extract)  │              │ - Goal Definition │
   │                   │              │ - Tool Selection  │
   └───────────────────┘              │ - Agentic Loop    │
                                      │ - Result Storage  │
                                      └────────┬──────────┘
                                               │
                    ┌──────────────────────────┴──────────────────┐
                    │                                             │
          ┌─────────▼────────────┐                   ┌────────────▼──────┐
          │   Tool Registry      │                   │  LLM Providers    │
          │                      │                   │                   │
          │ 12 Tool Definitions  │                   │ - OpenAI          │
          │ - navigate           │                   │ - Anthropic       │
          │ - click              │                   │ - Ollama (future) │
          │ - extract            │                   │                   │
          │ - setVariable        │                   │ (Function Calling/│
          │ - apiCall            │                   │  Tool Use API)    │
          │ - ... (8 more)       │                   │                   │
          │                      │                   │                   │
          └─────────┬────────────┘                   └────────┬──────────┘
                    │                                         │
                    └──────────────────┬──────────────────────┘
                                       │
                          ┌────────────▼──────────────┐
                          │   AI Agentic Loop (10x)   │
                          │                           │
                          │ 1. Call LLM with tools    │
                          │ 2. Parse tool_calls       │
                          │ 3. Execute tools          │
                          │ 4. Feed results back      │
                          │ 5. Repeat (max 10)        │
                          │                           │
                          └────────────┬──────────────┘
                                       │
                              ┌────────▼───────┐
                              │ Result Storage │
                              │ → Variable     │
                              └────────────────┘
```

## Agentic Loop Detail

```
                    ╔═════════════════════════════╗
                    ║   Agentic Loop Iteration    ║
                    ╚════════════╤════════════════╝
                                 │
                    ┌────────────▼─────────────┐
                    │ Iteration Count < 10?    │
                    └────┬──────────────┬──────┘
                         │ No           │ Yes
                         │              │
                ┌────────▼────┐    ┌────▼──────────────────┐
                │ Max Reached │    │ Call LLM API          │
                │ Return      │    │ (with tools + goal)   │
                │ Summary     │    └────┬──────────────────┘
                └─────────────┘         │
                                        ├─ OpenAI Function Call
                                        └─ Anthropic Tool Use
                                        │
                                 ┌──────▼──────────┐
                                 │ Parse Response  │
                                 └──┬──────────┬───┘
                                    │          │
                        ┌───────────▼──┐  ┌───▼──────────────┐
                        │ finish_reason│  │   stop_reason    │
                        │ = tool_calls │  │ = tool_use       │
                        │   (OpenAI)   │  │   (Anthropic)    │
                        └───────┬──────┘  └────┬─────────────┘
                                │              │
                        ┌───────▼──────────────▼──────────┐
                        │ Has tool_calls?                 │
                        └───┬──────────────────┬──────────┘
                            │ No               │ Yes
                            │                  │
                    ┌───────▼───────┐  ┌──────▼─────────────┐
                    │ Extract text  │  │ Execute each tool  │
                    │ Return final  │  │ - Tool name        │
                    │ result        │  │ - Tool arguments   │
                    └────────────────┘  └──┬────────────────┘
                            │              │
                            │     ┌────────▼──────────┐
                            │     │ executeTool()     │
                            │     │ - Run automation  │
                            │     │ - Capture result  │
                            │     │ - Handle errors   │
                            │     └────┬─────────────┘
                            │          │
                            │     ┌────▼───────────────────┐
                            │     │ Collect all tool       │
                            │     │ execution results      │
                            │     └────┬──────────────────┘
                            │          │
                            │     ┌────▼──────────────────┐
                            │     │ Add to message loop:  │
                            │     │ - Assistant: tool call│
                            │     │ - User: tool results  │
                            │     └────┬─────────────────┘
                            │          │
                            └──────────┼───────────┐
                                       │           │
                                 [Next Iteration]  │
                                       ↑           │
                                       └───────────┘
```

## Message Flow - OpenAI vs Anthropic

### OpenAI Function Calling
```
┌──────────────────────────────────────────────────────────────┐
│ Request to OpenAI                                            │
├──────────────────────────────────────────────────────────────┤
│ {                                                            │
│   "model": "gpt-4-turbo",                                   │
│   "messages": [                                             │
│     {"role": "system", "content": "You are an agent..."},  │
│     {"role": "user", "content": "Get the price..."},       │
│     // ... previous tool results in conversation          │
│   ],                                                        │
│   "tools": [                                                │
│     {                                                       │
│       "type": "function",                                   │
│       "function": {                                         │
│         "name": "navigate",                                 │
│         "description": "Navigate to URL",                   │
│         "parameters": { ... }                              │
│       }                                                     │
│     },                                                      │
│     // ... more tools                                       │
│   ],                                                        │
│   "tool_choice": "auto"                                     │
│ }                                                           │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ OpenAI Response                                              │
├──────────────────────────────────────────────────────────────┤
│ {                                                            │
│   "choices": [{                                             │
│     "finish_reason": "tool_calls",                          │
│     "message": {                                            │
│       "tool_calls": [                                       │
│         {                                                   │
│           "id": "call_123",                                 │
│           "type": "function",                               │
│           "function": {                                     │
│             "name": "navigate",                             │
│             "arguments": "{\"url\": \"...\"}"              │
│           }                                                 │
│         }                                                   │
│       ]                                                     │
│     }                                                       │
│   }]                                                        │
│ }                                                           │
└──────────────────────────────────────────────────────────────┘
```

### Anthropic Tool Use
```
┌──────────────────────────────────────────────────────────────┐
│ Request to Anthropic                                         │
├──────────────────────────────────────────────────────────────┤
│ {                                                            │
│   "model": "claude-3-opus-20240229",                        │
│   "max_tokens": 2048,                                       │
│   "messages": [                                             │
│     {"role": "user", "content": "Get the price..."},       │
│     // ... previous tool results in conversation          │
│   ],                                                        │
│   "tools": [                                                │
│     {                                                       │
│       "name": "navigate",                                   │
│       "description": "Navigate to URL",                     │
│       "input_schema": {                                     │
│         "type": "object",                                   │
│         "properties": { ... }                              │
│       }                                                     │
│     },                                                      │
│     // ... more tools                                       │
│   ]                                                         │
│ }                                                           │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ Anthropic Response                                           │
├──────────────────────────────────────────────────────────────┤
│ {                                                            │
│   "stop_reason": "tool_use",                                │
│   "content": [                                              │
│     {                                                       │
│       "type": "tool_use",                                   │
│       "id": "toolu_123",                                    │
│       "name": "navigate",                                   │
│       "input": {                                            │
│         "url": "https://example.com"                       │
│       }                                                     │
│     }                                                       │
│   ]                                                         │
│ }                                                           │
└──────────────────────────────────────────────────────────────┘
```

## Tool Execution Pipeline

```
Input: Tool Name + Arguments
         │
         └─► validate tool name exists
         └─► validate required arguments
         └─► substitute variables in arguments
         │
         ├─► navigate: Send to browser engine
         │         └─► Return: URL loaded / Error
         │
         ├─► click: Find selector + click
         │       └─► Return: Element clicked / Error
         │
         ├─► extract: Find selector + get text
         │         └─► Store in variable
         │         └─► Return: Extracted text
         │
         ├─► setVariable: Set value in variable store
         │             └─► Return: Confirmation
         │
         ├─► apiCall: Make HTTP request
         │         └─► Return: Response body / Error
         │
         ├─► twitterCreateTweet: Call Twitter API
         │                    └─► Return: Tweet ID / Error
         │
         └─► discordSendMessage: Call Discord API
                             └─► Return: Message ID / Error
         │
         └─► Output: Tool Result String
                     (fedback to AI as next user message)
```

## Variable System Integration

```
┌──────────────────────────────────────────────────────────┐
│       Variables Available Throughout Workflow            │
└──────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────▼──────┐   ┌────────▼────────┐   ┌─────▼──────┐
    │ Pre-set     │   │ During Agent    │   │ After Agent│
    │ Variables   │   │ Execution       │   │ Execution  │
    │             │   │                 │   │            │
    │ User passes │   │ - Tool calls    │   │ - Final    │
    │ in initial  │   │   extract text  │   │   result   │
    │ context     │   │                 │   │ - Variables│
    │             │   │ - Tools call    │   │   set by   │
    │             │   │   setVariable   │   │   tools    │
    │             │   │                 │   │            │
    └─────┬──────┘   └────────┬────────┘   └─────┬──────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                    ┌─────────▼────────────┐
                    │ Goal Substitution:   │
                    │ "Get {{myVar}} and"  │
                    │ → "Get value1 and"   │
                    │                      │
                    │ Tool Arguments:      │
                    │ "selector": "{{sel}}"│
                    │ → "selector": "#id"  │
                    └─────────┬────────────┘
                              │
                    ┌─────────▼────────────┐
                    │ Store Final Result:  │
                    │                      │
                    │ this.variables[      │
                    │   step.storeKey      │
                    │ ] = agentResult      │
                    └──────────────────────┘
```

## Full Workflow Timeline

```
Time  Actor               Action                    State
────  ─────               ──────                    ─────
t0    User                Create AI Agent node      Goal: "Get price"
      ↓
t1    System              Load configuration        Provider: openai
      ↓                   Model: gpt-4-turbo
      ↓                   Tools: all (12)
      ↓
t2    executeAiAgent()    Build tool registry       Registry ready
      ↓
t3    callOpenAIWithTools Call OpenAI API          Request sent
      ↓
t4    OpenAI              Process request           Thinking...
      ↓
t5    OpenAI              Return tool_calls        Response: [navigate]
      ↓
t6    executeAiAgent()    Parse tool_calls         Tool: navigate
      ↓
t7    executeTool()       Execute navigate         Browser navigated
      ↓
t8    executeAiAgent()    Collect result           Result: "Page loaded"
      ↓
t9    executeAiAgent()    Add to messages          Loop continues
      ↓
t10   callOpenAIWithTools Call OpenAI again       Request sent (iter 2)
      ↓
t11   OpenAI              Process with history     Thinking...
      ↓
t12   OpenAI              Return tool_calls       Response: [extract]
      ↓
t13   executeTool()       Execute extract         Text: "Price: $42,500"
      ↓
t14   executeAiAgent()    Collect result          Added to loop
      ↓
t15   callOpenAIWithTools Call OpenAI (iter 3)   Final decision?
      ↓
t16   OpenAI              Return text response    No more tools needed
      ↓
t17   executeAiAgent()    Extract text response   Summary: "Found price"
      ↓
t18   executeAiAgent()    Store in variable       agentResult = "Found..."
      ↓
t19   Workflow            Next step uses result   ✓ Complete
```

## State Machine

```
                    ┌─────────────────┐
                    │   START         │
                    │ executeAiAgent()│
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Initialize Loop │
                    │ iteration = 0   │
                    │ max = 10        │
                    └────────┬────────┘
                             │
                    ╔════════▼════════╗
                    ║  LOOP ACTIVE    ║  iteration < max
                    ║  CHECK CONDITION║
                    ╚════╤═════╤══════╝
                         │     └──────────┐
                       No│                 │Yes
                         │                 │
                ┌────────▼──────┐  ┌──────▼─────────┐
                │ Loop Timeout  │  │ Call LLM API   │
                │ return summary│  │ with tools     │
                └────────────────┘  └──────┬────────┘
                         ▲                  │
                         │         ┌────────▼─────────┐
                         │         │ Parse Response   │
                         │         └──┬─────────┬─────┘
                         │            │         │
                         │    ┌───────▼──┐  ┌──▼──────────┐
                         │    │tool_calls│  │text_response│
                         │    │ or       │  │ (final)     │
                         │    │tool_use  │  │             │
                         │    └────┬─────┘  └──┬──────────┘
                         │         │           │
                    ┌────▼────┐   │           │
                    │Execute  │   │      ┌────▼──────────┐
                    │Tools    │   │      │Return Result  │
                    └────┬────┘   │      │Store Variable │
                         │        │      └────┬──────────┘
                    ┌────▼────────▼──┐        │
                    │Collect Results │        │
                    │Add to Loop     │        │
                    │iteration++     │        │
                    └────┬───────────┘        │
                         │                   │
                         └─────────┬─────────┘
                                   │
                            ┌──────▼───────┐
                            │ END          │
                            │ return value │
                            └──────────────┘
```

## Provider Decision Tree

```
Provider Selection
    │
    ├─► OpenAI (gpt-4-turbo)
    │   │
    │   ├─ Strengths:
    │   │  • Fastest function calling
    │   │  • Best for complex planning
    │   │  • Most mature API
    │   │
    │   ├─ Weaknesses:
    │   │  • Costs more per token
    │   │  • Requires API key
    │   │
    │   └─ Best for: Complex multi-step automation
    │
    ├─► Anthropic (claude-3)
    │   │
    │   ├─ Strengths:
    │   │  • Excellent reasoning
    │   │  • More transparent planning
    │   │  • Good error handling
    │   │
    │   ├─ Weaknesses:
    │   │  • Slightly slower
    │   │  • Requires API key
    │   │
    │   └─ Best for: Careful, deliberate automation
    │
    └─► Ollama (coming soon)
        │
        ├─ Strengths:
        │  • Free (local)
        │  • No API key needed
        │  • Privacy-preserving
        │
        ├─ Weaknesses:
        │  • Tool use support limited
        │  • Slower inference
        │  • Setup required
        │
        └─ Best for: Development, privacy-critical
```

## Error Recovery Flow

```
Tool Execution Error
         │
    ┌────▼────────────────────────┐
    │ Catch error, format message │
    │ "Error: Selector not found"  │
    └────┬───────────────────────┘
         │
    ┌────▼────────────────────────┐
    │ Add to loop message:         │
    │ "User: Tool error..."        │
    └────┬───────────────────────┘
         │
    ┌────▼────────────────────────┐
    │ iteration++ (continue loop)  │
    └────┬───────────────────────┘
         │
    ┌────▼────────────────────────┐
    │ Call LLM again with context  │
    │ "You tried selector X,       │
    │  got error: not found.       │
    │  Try alternative approach"   │
    └────┬───────────────────────┘
         │
    ┌────▼────────────────────────┐
    │ AI decides next action:      │
    │ - Retry different selector   │
    │ - Navigate to different page │
    │ - Try different tool         │
    │ - Give up (goal impossible)  │
    └────────────────────────────┘
```

These diagrams illustrate the complete architecture and execution flow of the AI Agent tool-calling system.
