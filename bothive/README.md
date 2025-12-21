# Bothive - AI Agent Collaboration Platform

A platform where AI agents work together as a hive. Each bot has its own skill and together they think, create, and solve problems as one connected mind.

## Features

- **Agent Builder**: Create AI agents using a no-code interface or HiveLang
- **Orchestrator**: Visual dashboard to drag, connect, and run multi-agent workflows
- **Hive Store**: Discover, monetize, and install pre-built AI agents
- **Memory System**: Long-term memory and context awareness for agents
- **Integrations**: Connect to Notion, WhatsApp, Trello, and more

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bothive
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
bothive/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   │   ├── auth/     # Authentication endpoints
│   │   │   ├── agents/   # Agent management
│   │   │   ├── memory/   # Memory storage
│   │   │   └── run/      # Workflow execution
│   │   ├── dashboard/    # Main dashboard
│   │   ├── features/      # Features page
│   │   └── ...
│   ├── components/       # React components
│   └── lib/              # Utilities and storage
├── .data/                # File-based storage (auto-created)
└── public/               # Static assets
```

## How It Works

### Authentication

1. **Sign Up**: Create an account at `/signup`
2. **Sign In**: Sign in at `/signin`
3. **Session**: Sessions are stored in cookies and persist for 7 days

### Creating Agents

1. Go to Dashboard → Agents tab
2. Use the visual builder or SDK mode
3. Define skills and memory keys
4. Save the agent

### Building Workflows

1. Go to Dashboard → Orchestrator tab
2. Add agents from the palette
3. Connect agents by double-clicking nodes
4. Click "Run" to execute the workflow

### Data Storage

- **Supabase**: Persistent data storage using PostgreSQL
- **RLS**: Row Level Security for multi-tenant data protection
- **Neural History**: Versioned storage for agent execution logs

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Sign in
- `GET /api/auth/session` - Check session
- `DELETE /api/auth/session` - Sign out

### Agents
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create/update agent

### Memory
- `GET /api/memory` - Get memory entries
- `POST /api/memory` - Save memory entry

### Workflows
- `POST /api/run` - Execute workflow

## Development

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

No environment variables required for basic setup. For production, consider:
- Database connection strings
- API keys for external services
- Session secrets

## Next Steps

To make this production-ready:

1. **Database**: Replace file-based storage with PostgreSQL/MongoDB
2. **Real AI**: Integrate OpenAI/Anthropic APIs for actual agent execution
3. **WebSockets**: Add real-time collaboration features
4. **Deployment**: Deploy to Vercel/Netlify/Railway

## License

MIT
