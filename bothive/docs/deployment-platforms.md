# Bothive Bot Deployment Platform Integrations

This guide provides complete deployment configurations for various platforms, allowing users to deploy their bothive bots (including study buddy bots) to production environments.

## 🚀 Platform Options Overview

| Platform | Free Tier | Vision Support | Best For | Setup Complexity |
|----------|-----------|----------------|----------|------------------|
| **Vercel** | ✅ Yes | ✅ With OpenAI | Web apps, APIs | ⭐ Easy |
| **Railway** | ✅ Yes | ✅ With OpenAI | Full-stack apps | ⭐ Easy |
| **Render** | ✅ Yes | ✅ With OpenAI | Web services | ⭐ Easy |
| **Fly.io** | ✅ Yes | ✅ With OpenAI | Global apps | ⭐⭐ Medium |
| **Heroku** | ❌ Limited | ✅ With OpenAI | Enterprise | ⭐⭐ Medium |
| **Local** | ✅ Free | ✅ With OpenAI | Development | ⭐ Easy |

## 📋 Prerequisites

Before deploying, ensure you have:

1. **API Keys**:
   - Groq API key (for text-based AI)
   - OpenAI API key (optional, for vision capabilities)
   - Platform-specific credentials

2. **Bot Configuration**:
   - Your bot implementation
   - Environment variables configured
   - Dependencies installed

## 🎯 Vercel Deployment (Recommended)

### Quick Deploy

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy your bot
vercel --prod
```

### Configuration Files

**vercel.json**:
```json
{
  "functions": {
    "api/bot/*.ts": {
      "runtime": "nodejs18.x",
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "env": {
    "GROQ_API_KEY": "@groq_api_key",
    "OPENAI_API_KEY": "@openai_api_key",
    "BOT_ENV": "production"
  },
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

**api/bot/index.ts**:
```typescript
import { StudyBuddyBot } from '@/bots/study-buddy-bot';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const bot = new StudyBuddyBot({
  name: process.env.BOT_NAME || 'Study Buddy',
  environment: process.env.BOT_ENV || 'production',
  apiKeys: {
    groq: process.env.GROQ_API_KEY,
    openai: process.env.OPENAI_API_KEY
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await bot.handleRequest(req.body);
    return res.status(200).json(response);
  } catch (error) {
    console.error('Bot error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

**package.json** (Vercel-specific):
```json
{
  "name": "bothive-study-buddy",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "@vercel/node": "^3.0.0",
    "bothive": "^1.0.0",
    "groq-sdk": "^0.3.0",
    "openai": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.0.0"
  }
}
```

### Environment Variables Setup

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:

```
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here (optional)
BOT_NAME=AI Study Buddy
BOT_ENV=production
```

## 🚂 Railway Deployment

### Quick Deploy with Railway

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Create new project
railway init

# 4. Deploy
railway up
```

**railway.json**:
```json
{
  "project": "bothive-study-buddy",
  "services": {
    "bot": {
      "build": "npm run build",
      "start": "npm start",
      "healthcheckPath": "/health",
      "healthcheckTimeout": 300,
      "restartPolicyType": "ON_FAILURE",
      "restartPolicyMaxRetries": 10
    }
  }
}
```

**Dockerfile** (Railway):
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
```

## 🎨 Render Deployment

### Render Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Create New → Web Service
3. Connect your GitHub repository
4. Configure build settings:

**render.yaml**:
```yaml
services:
  - type: web
    name: bothive-study-buddy
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: GROQ_API_KEY
        sync: false
      - key: OPENAI_API_KEY
        sync: false
      - key: NODE_ENV
        value: production
    healthCheckPath: /health
    autoDeploy: true
    plan: starter
```

## 🪰 Fly.io Deployment (Global)

### Fly.io Configuration

```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Create new app
fly launch

# 3. Configure for global deployment
fly regions add ord lhr sin
```

**fly.toml**:
```toml
app = "bothive-study-buddy"
primary_region = "ord"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  BOT_ENV = "production"

[[services]]
  internal_port = 3000
  protocol = "tcp"
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
    
  [[services.http_checks]]
    interval = "30s"
    timeout = "2s"
    grace_period = "5s"
    method = "GET"
    path = "/health"
```

## 🏠 Local Development Deployment

### Local Setup

```bash
# 1. Clone your bot repository
git clone https://github.com/yourusername/bothive-study-buddy.git
cd bothive-study-buddy

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# 4. Run in development mode
npm run dev

# 5. For production-like local deployment
npm run build
npm start
```

**docker-compose.yml** (Local with all services):
```yaml
version: '3.8'

services:
  study-buddy-bot:
    build: .
    ports:
      - "3000:3000"
    environment:
      - GROQ_API_KEY=${GROQ_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - BOT_ENV=production
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - postgres
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=study_buddy
      - POSTGRES_USER=bot
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
      
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - study-buddy-bot
    restart: unless-stopped

volumes:
  redis_data:
  postgres_data:
```

## 🔧 Platform-Specific Configurations

### Vision Capability Setup

For platforms supporting OpenAI (optional vision features):

```typescript
// Environment configuration
const config = {
  // Groq for text-based AI (always available)
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile'
  },
  
  // OpenAI for vision (optional)
  openai: process.env.OPENAI_API_KEY ? {
    apiKey: process.env.OPENAI_API_KEY,
    visionModel: 'gpt-4-vision-preview'
  } : null,
  
  // Tool selection based on available APIs
  getTools() {
    const baseTools = [...aiTools, ...contentTools, ...analyticsTools, ...agentOrchestrationTools];
    
    if (this.openai) {
      // Add vision tools if OpenAI is available
      return [...baseTools, ...visionTools];
    }
    
    return baseTools;
  }
};
```

### Scaling Configuration

**For high-traffic deployments**:

```typescript
// Auto-scaling configuration
const scalingConfig = {
  // Vercel
  vercel: {
    functions: {
      "api/bot/*.ts": {
        maxDuration: 300, // 5 minutes for complex operations
        memory: 3008, // Maximum memory
        concurrency: 10
      }
    }
  },
  
  // Railway
  railway: {
    replicas: 3,
    resources: {
      memory: "2Gi",
      cpu: "1000m"
    }
  },
  
  // Fly.io
  fly: {
    vm: {
      size: "performance-2x",
      memory: "4GB"
    },
    regions: ["ord", "lhr", "sin", "nrt"], // Global distribution
    autoscale: {
      min_machines_running: 2,
      max_machines_running: 10
    }
  }
};
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint

```typescript
// Health check for all platforms
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      groq: checkGroqConnection(),
      openai: checkOpenAiConnection(),
      database: checkDatabaseConnection()
    },
    version: process.env.npm_package_version
  };
  
  res.status(200).json(health);
});
```

### Error Tracking

```typescript
// Sentry integration for error tracking
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.BOT_ENV,
  tracesSampleRate: 1.0,
});

// Platform-specific error handling
const errorHandlers = {
  vercel: (error, req, res) => {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Internal server error' });
  },
  
  railway: (error) => {
    console.error('Railway deployment error:', error);
    // Railway automatically restarts on failure
  },
  
  local: (error) => {
    console.error('Local error:', error);
    // Development error details
    if (process.env.BOT_ENV === 'development') {
      console.error(error.stack);
    }
  }
};
```

## 🎉 Deployment Checklist

Before deploying to any platform:

- [ ] Set up API keys (Groq required, OpenAI optional)
- [ ] Configure environment variables
- [ ] Test bot locally with `npm run dev`
- [ ] Run health check endpoint test
- [ ] Verify all tools work correctly
- [ ] Set up monitoring/error tracking
- [ ] Configure auto-scaling if needed
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificates
- [ ] Test deployment in staging environment
- [ ] Set up backup/disaster recovery

## 🚀 One-Click Deploy Options

### Vercel One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/bothive-study-buddy)

### Railway One-Click Deploy
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/yourusername/bothive-study-buddy)

### Heroku Deploy
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/yourusername/bothive-study-buddy)

## 📞 Support & Troubleshooting

Each platform has specific support channels:

- **Vercel**: [Support](https://vercel.com/support)
- **Railway**: [Discord Community](https://discord.gg/railway)
- **Render**: [Community Forum](https://community.render.com)
- **Fly.io**: [Community Forum](https://community.fly.io)

Common deployment issues and solutions are documented in the troubleshooting section of each platform's documentation.

---

**Ready to deploy your bothive bot?** Choose your preferred platform and follow the configuration steps above. Each platform offers free tiers perfect for getting started, with easy upgrade paths as your bot grows!