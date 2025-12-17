# Example: Slack Integration Node

This is a complete, working example of a Loopi custom node that sends messages to Slack.

## Installation

```bash
# From the example directory
npm install
npm run build
npm run validate

# From Loopi directory
loopi-node add slack-message
```

## Features

- Send messages to Slack channels
- Support for multiple message formats
- Variable interpolation
- Error handling and logging

## Configuration

Add to your Loopi automation:

1. Create a Slack Incoming Webhook: https://api.slack.com/messaging/webhooks
2. Copy the webhook URL
3. Create a "Send Slack Message" step
4. Fill in the webhook URL, channel, and message

## Message Variables

You can reference variables from previous steps using `{{variableName}}`:

```
"message": "Hello {{userName}}, your order {{orderId}} is ready!"
```

## Webhook Format

This node uses Slack's Incoming Webhooks API. The webhook will:

- Post messages to the specified channel
- Support rich formatting (bold, italics, lists, etc.)
- Handle emoji and mentions

## Troubleshooting

**Message not appearing?**
- Check webhook URL is correct
- Verify channel name starts with # or is a user ID
- Check Slack app has permission to post

**Variable not interpolating?**
- Ensure variable name matches exactly
- Variable must be set by a previous step
- Use `{{variableName}}` syntax exactly

## Advanced Usage

You can use rich message formatting:

```json
{
  "type": "custom:slack-message",
  "webhookUrl": "https://hooks.slack.com/services/...",
  "channel": "#announcements",
  "message": "*Bold text* _italic_ `code`\n\n• Bullet 1\n• Bullet 2"
}
```

## Building on This Example

To extend this node:

1. Add thread replies: Add `threadTs` field for message threads
2. Add file uploads: Use webhook with file attachments
3. Add interactive buttons: Use Slack Block Kit format
4. Add user mentions: Parse @username references

See the [Custom Node SDK documentation](../CUSTOM_NODE_SDK.md) for more details.
