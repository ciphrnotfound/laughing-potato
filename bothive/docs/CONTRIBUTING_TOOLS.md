# Contributing Tools to BotHive

Welcome to the BotHive tool ecosystem! This guide will help you create and publish your own integrations.

## 🚀 Quick Start

### 1. Create a Tool in Under 5 Minutes

```typescript
// tools/myservice/index.ts
import { ToolDescriptor } from "@bothive/types";

export const myServiceSendMessage: ToolDescriptor = {
  name: "myservice.sendMessage",
  capability: "integrations.myservice",
  description: "Send a message via MyService API",
  
  async run(input, context) {
    const { message, recipient } = input as {
      message: string;
      recipient: string;
    };
    
    // Your implementation here
    const response = await fetch('https://api.myservice.com/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, recipient }),
    });
    
    if (!response.ok) {
      return {
        success: false,
        output: `Failed to send message: ${response.statusText}`,
      };
    }
    
    return {
      success: true,
      output: `✓ Message sent to ${recipient}`,
      data: await response.json(),
    };
  },
};
```

### 2. Create a Plugin Manifest

```typescript
// tools/myservice/manifest.ts
import { PluginManifest } from "@bothive/types";

export const manifest: PluginManifest = {
  name: "myservice-integration",
  version: "1.0.0",
  author: "Your Name",
  description: "Official MyService integration for BotHive",
  tools: [
    {
      name: "myServiceSendMessage",
      displayName: "Send MyService Message",
      category: "communication",
      requiresAuth: true,
      authType: "api_key",
    },
  ],
};
```

### 3. Test Your Tool

```bash
npm run test:tool -- myservice.sendMessage
```

### 4. Submit to Marketplace

```bash
npm run submit:tool -- tools/myservice
```

---

## 📚 Tool Anatomy

### Required Fields

- **name**: Unique identifier (format: `category.functionName`)
- **capability**: What the tool can do (format: `category.subcategory`)
- **description**: Clear explanation of what the tool does
- **run()**: Async function that executes the tool

### Return Format

Every tool must return:
```typescript
{
  success: boolean;      // Did it work?
  output: string;        // Human-readable message
  data?: any;           // Optional structured data
}
```

---

## 🔐 Authentication Patterns

### API Key

```typescript
async run(input, context) {
  const apiKey = context.credentials?.apiKey;
  
  if (!apiKey) {
    return {
      success: false,
      output: "API key not configured",
    };
  }
  
  // Use apiKey in your request
}
```

### OAuth 2.0

```typescript
async run(input, context) {
  const accessToken = context.credentials?.accessToken;
  
  if (!accessToken) {
    return {
      success: false,
      output: "Not authenticated. Please connect your account.",
    };
  }
  
  // Use accessToken in Authorization header
}
```

---

## ✅ Best Practices

### 1. **Error Handling**
Always wrap your code in try-catch:
```typescript
async run(input, context) {
  try {
    // Your code
  } catch (error) {
    return {
      success: false,
      output: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

### 2. **Input Validation**
Validate inputs early:
```typescript
if (!input.requiredField) {
  return {
    success: false,
    output: "Missing required field: requiredField",
  };
}
```

### 3. **Descriptive Output**
Use clear, actionable messages:
```typescript
// ✓ Good
output: "✓ Created 5 tasks in project 'Marketing'"

// ✗ Bad
output: "Done"
```

### 4. **Return Structured Data**
Include useful data for bot composition:
```typescript
return {
  success: true,
  output: "✓ User created",
  data: {
    userId: "user-123",
    email: "user@example.com",
    createdAt: new Date().toISOString(),
  },
};
```

---

## 🧪 Testing

### Unit Test Template

```typescript
import { test, expect } from 'vitest';
import { myServiceSendMessage } from './index';

test('should send message successfully', async () => {
  const result = await myServiceSendMessage.run(
    { message: "Hello", recipient: "user@example.com" },
    mockContext
  );
  
  expect(result.success).toBe(true);
  expect(result.output).toContain("Message sent");
});

test('should handle missing recipient', async () => {
  const result = await myServiceSendMessage.run(
    { message: "Hello" },
    mockContext
  );
  
  expect(result.success).toBe(false);
  expect(result.output).toContain("required");
});
```

---

## 📦 Publishing

### Categories

Choose the right category:
- **communication**: Email, SMS, chat
- **productivity**: Calendar, tasks, notes
- **data**: Databases, spreadsheets, storage
- **ai**: AI models, analysis
- **social**: Twitter, LinkedIn, Facebook
- **finance**: Payment processing, invoicing
- **developer**: GitHub, deployment, monitoring
- **other**: Everything else

### Submission Checklist

- [ ] Tool name follows `category.functionName` format
- [ ] Description is clear and concise
- [ ] Error handling is comprehensive  
- [ ] Input validation is thorough
- [ ] Tests cover success and failure cases
- [ ] Documentation is complete
- [ ] No security vulnerabilities (use validator)

### Review Process

1. **Automated Validation** - Security and structure checks
2. **Manual Review** - Code quality review by BotHive team
3. **Approval** - Tool appears in marketplace
4. **Revenue Sharing** - 70% to you, 30% platform fee

---

## 💰 Monetization

### Set as Premium

```typescript
// In your manifest
{
  name: "premium-ai-tool",
  isPremium: true,
  pricePerExecution: 0.10, // $0.10 per run
}
```

### Revenue Sharing

- **Free Tier Users**: Can't use premium tools
- **Pro Tier Users**: Can use, you get $0.07 per execution
- **Enterprise Users**: Unlimited, flat monthly payout

---

## 🎯 Examples to Learn From

Check out these official plugins:
- [`notion.ts`](../src/lib/plugins/examples/notion.ts) - OAuth 2.0 pattern
- [`airtable.ts`](../src/lib/plugins/examples/airtable.ts) - API key pattern
- [`twitter.ts`](../src/lib/integrations/twitter.ts) - Error handling

---

## 💬 Get Help

- **Discord**: https://discord.gg/bothive
- **GitHub Discussions**: https://github.com/bothive/bothive/discussions
- **Email**: developers@bothive.app

Happy building! 🐝
