# Ollama Agentic Support - Quick Reference Card

## ⚡ Quick Start (30 seconds)

```bash
# 1. Start Ollama server
ollama serve

# 2. In another terminal, pull a model
ollama pull mistral

# 3. In Loopi UI:
# - Add AI Agent step
# - Provider: Ollama
# - Model: mistral
# - Goal: "Navigate to google.com and take a screenshot"
# - Click Execute!
```

---

## 📋 Configuration Template

```json
{
  "type": "aiAgent",
  "provider": "ollama",
  "model": "mistral",
  "goal": "Your automation goal here",
  "temperature": 0,
  "maxTokens": 2048,
  "baseUrl": "http://localhost:11434",
  "allowedSteps": ["navigate", "extract", "click"],
  "storeKey": "result"
}
```

---

## 🎯 Model Quick Guide

| Model | Speed | Quality | Best For | Size |
|-------|-------|---------|----------|------|
| **mistral** | ⚡⚡⚡ | ⭐⭐⭐ | Fast scraping | 7B |
| **neural-chat** | ⚡⚡ | ⭐⭐⭐⭐ | Balanced tasks | 13B |
| **dolphin-mixtral** | ⚡ | ⭐⭐⭐⭐⭐ | Complex analysis | 46B |

### Pull Models:
```bash
ollama pull mistral           # Fast & reliable
ollama pull neural-chat        # Balanced
ollama pull dolphin-mixtral    # Most powerful
```

---

## 🔧 Common Use Cases

### Web Scraping
```json
{
  "model": "mistral",
  "goal": "Extract all product titles and prices",
  "allowedSteps": ["navigate", "extract"]
}
```

### API Testing
```json
{
  "model": "neural-chat",
  "goal": "Call API, validate response, store results",
  "allowedSteps": ["apiCall", "extract", "setVariable"]
}
```

### Complex Workflows
```json
{
  "model": "dolphin-mixtral",
  "goal": "Login, navigate, extract, analyze, notify",
  "maxTokens": 3000,
  "allowedSteps": ["navigate", "click", "type", "extract", "apiCall"]
}
```

---

## 🛠️ Troubleshooting

### ❌ "Ollama connection refused"
```bash
# Make sure Ollama is running
ollama serve

# Check it's accessible
curl http://localhost:11434/api/status
```

### ❌ "Model doesn't call tools"
```json
{
  "model": "mistral",  // Use mistral instead
  "goal": "Click the button",  // More specific goal
  "maxTokens": 2048  // Give more space
}
```

### ❌ "Agent loops infinitely"
```json
{
  "goal": "Extract product price",  // Simpler goal
  "allowedSteps": ["extract"],  // Fewer tools
  "maxTokens": 1024  // Limit size
}
```

### ❌ "Timeout errors"
```json
{
  "timeoutMs": 60000,  // Increase timeout
  "model": "mistral"   // Use faster model
}
```

---

## 📊 Hardware Requirements

```
Minimal (4GB RAM):
  ├─ mistral 7B ✅
  └─ Limited to fast scraping

Standard (8GB RAM):
  ├─ mistral 7B ✅✅
  ├─ neural-chat 13B ✅
  └─ Good for most tasks

High-End (16GB+ RAM):
  ├─ neural-chat 13B ✅✅
  ├─ dolphin-mixtral 46B ✅
  └─ Everything supported
```

---

## 🚀 Available Tools (12 Total)

**Browser Tools**:
- `navigate` - Go to URL
- `click` - Click element
- `type` - Type text
- `extract` - Get element content
- `screenshot` - Capture page

**Data Tools**:
- `setVariable` - Store value
- `getVariable` - Retrieve value
- `wait` - Pause N seconds

**API Tools**:
- `apiCall` - Make HTTP request
- `twitterCreateTweet` - Post tweet
- `twitterSearchTweets` - Search tweets
- `discordSendMessage` - Send message

---

## 🎮 UI Features

### Provider Selector
```
Dropdown shows:
├─ OpenAI (GPT-4 Turbo)
├─ Anthropic (Claude 3.5)
└─ Ollama (Local LLM) ← NEW
```

### Model Field
```
Placeholder suggestions:
├─ OpenAI: gpt-4-turbo, gpt-4, gpt-3.5-turbo
├─ Anthropic: claude-3-5-sonnet, claude-3-opus
└─ Ollama: mistral, neural-chat, llama2, dolphin-mixtral
```

### Base URL
```
Smart defaults:
├─ OpenAI: https://api.openai.com/v1
├─ Anthropic: https://api.anthropic.com
└─ Ollama: http://localhost:11434
```

### Auth Section
```
OpenAI/Anthropic:
├─ Use Saved Credential
└─ Enter API Key

Ollama:
└─ (Hidden - no API key needed!)
```

---

## 💰 Cost Comparison

| Provider | Cost | Privacy | Setup |
|----------|------|---------|-------|
| OpenAI | $$ per 1M tokens | Remote | 2 min |
| Anthropic | $ per 1M tokens | Remote | 2 min |
| **Ollama** | **$0** | **Local** | **5 min** |

---

## 📈 Performance Tips

### Make It Faster ⚡
```json
{
  "model": "mistral",
  "temperature": 0,
  "maxTokens": 512,
  "allowedSteps": ["navigate", "extract"]
}
```

### Make It Better ⭐
```json
{
  "model": "neural-chat",
  "temperature": 0.1,
  "maxTokens": 2048,
  "allowedSteps": ["navigate", "extract", "click", "apiCall"]
}
```

### Make It Perfect 🎯
```json
{
  "model": "dolphin-mixtral",
  "temperature": 0.2,
  "maxTokens": 3000,
  "allowedSteps": ["navigate", "click", "type", "extract", "apiCall", "screenshot"],
  "timeoutMs": 60000
}
```

---

## 🔐 Security Notes

**Ollama (Local)**:
- ✅ All data stays on your machine
- ✅ No API keys sent anywhere
- ✅ Runs entirely offline
- ✅ Perfect for sensitive data

**Cloud Providers**:
- ⚠️ Data sent to API
- ⚠️ Requires API keys
- ⚠️ Internet required
- ⚠️ Potential compliance issues

---

## 📝 Full Configuration Options

```json
{
  // Required
  "type": "aiAgent",
  "provider": "ollama",  // "openai" | "anthropic" | "ollama"
  "model": "mistral",    // Any Ollama model
  "goal": "...",         // What to accomplish

  // Optional - Defaults shown
  "temperature": 0,                              // 0-1, lower = deterministic
  "maxTokens": 2048,                            // 256-8192
  "baseUrl": "http://localhost:11434",          // Custom endpoint
  "timeoutMs": 30000,                           // ms before timeout
  "systemPrompt": "You are an AI agent...",    // Custom instructions
  "allowedSteps": ["navigate", "extract"],     // Available tools
  "storeKey": "agentResult"                    // Variable to save result
}
```

---

## 🔗 Resource Links

- **Ollama**: https://ollama.ai
- **Models**: https://ollama.ai/library
- **Docker**: `docker pull ollama/ollama`
- **Documentation**: See docs/OLLAMA_AGENTIC_GUIDE.md

---

## ✅ Verification Checklist

Before going to production:

- [ ] Ollama running: `ollama serve`
- [ ] Model pulled: `ollama list` shows your model
- [ ] Network accessible: `curl http://localhost:11434/api/status`
- [ ] Test simple goal: "Navigate to google.com"
- [ ] Check tool calls in debug log
- [ ] Verify result stored in variable
- [ ] Review execution time
- [ ] Test with real automation goal

---

## 🎓 Learning Resources

### Beginner
1. Follow quick start above
2. Test with simple goal
3. Try scraping example

### Intermediate
4. Add more tools to allowedSteps
5. Test with API calls
6. Try multiple iterations

### Advanced
7. Tune temperature and tokens
8. Use custom system prompt
9. Deploy to production
10. Monitor and optimize

---

## 📞 Support

**Common Issues**:
- See Troubleshooting section above
- Check docs/OLLAMA_AGENTIC_GUIDE.md
- Enable debug mode to see tool calls

**Advanced Help**:
- Full guide: docs/OLLAMA_AGENTIC_GUIDE.md
- Verification: docs/OLLAMA_AGENTIC_VERIFICATION.md
- Complete: docs/OLLAMA_AGENTIC_COMPLETE.md

---

## 🎉 You're Ready!

1. ✅ Install Ollama: `ollama serve`
2. ✅ Pull model: `ollama pull mistral`
3. ✅ Create agent in Loopi
4. ✅ Set goal
5. ✅ Execute!

**That's it! You now have local, private, free AI automation!**

---

**Version**: 1.0  
**Last Updated**: January 10, 2026  
**Status**: Production Ready ✅
