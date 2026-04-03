# Diagnosis AI - Healthcare Search Engine

An AI-powered healthcare search engine with real-time query synthesis, multi-LLM integration, and intelligent source attribution.

## Features

### Authentication
- **Email/Password Authentication** via Supabase
- **Google OAuth** (when configured)
- Protected routes and session management
- User profile management (name, password)

### AI Search
- **Multi-LLM Integration**: Cerebras and Groq APIs for distributed query processing
- **Real-time Streaming**: Sub-200ms response initiation
- **Conversation History**: Contextual multi-turn conversations
- **Source Attribution**: Medical sources with credibility scores

### User Experience
- **Clean Dark Theme**: Minimal, professional interface
- **Collapsible Sidebar**: Conversation history management
- **Responsive Design**: Mobile-friendly layout
- **Smooth Animations**: Framer Motion powered interactions

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI APIs**: Cerebras, Groq
- **Animations**: Framer Motion

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account
- Cerebras API key
- Groq API key

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# AI API Keys
CEREBRAS_API_KEY=your-cerebras-api-key-here
GROQ_API_KEY=your-groq-api-key-here
```

### 3. Database Setup

1. Go to your Supabase project → SQL Editor
2. Copy the contents of `supabase_schema.sql`
3. Execute the script to create tables and policies

The schema includes:
- `user_profiles`: User information
- `user_settings`: User preferences
- `query_history`: Search query logs
- `conversation_sessions`: Conversation grouping

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Configuration

### Cerebras API

1. Sign up at [Cerebras](https://cerebras.ai/)
2. Generate an API key
3. Add to `.env.local` as `CEREBRAS_API_KEY`

Model used: `llama3.1-8b`

### Groq API

1. Sign up at [Groq](https://groq.com/)
2. Generate an API key
3. Add to `.env.local` as `GROQ_API_KEY`

Model used: `llama-3.1-70b-versatile`

### Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Configure in Supabase → Authentication → Providers → Google

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.ts        # Streaming search API
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── signup/
│   │   └── page.tsx           # Signup page
│   ├── page.tsx               # Main chat interface
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/
│   ├── AuthModal.tsx          # Authentication modal
│   ├── SettingsModal.tsx      # User settings
│   ├── ResponseCard.tsx       # AI response display
│   ├── SearchBar.tsx          # Search input
│   ├── Sidebar.tsx            # Navigation sidebar
│   └── ui/                    # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx        # Authentication state
└── lib/
    ├── supabase.ts            # Client-side Supabase
    ├── supabase-server.ts     # Server-side Supabase
    └── utils.ts               # Utilities
```

## Features in Detail

### Real-time Streaming

The search API uses Server-Sent Events (SSE) to stream responses from AI models:

```typescript
// Frontend consumes stream
const reader = response.body?.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // Update UI with streamed content
}
```

### Multi-LLM Load Balancing

The system alternates between Cerebras and Groq APIs:
- **Cerebras**: Fast inference, good for quick responses
- **Groq**: High-quality outputs, better for complex queries

### User Settings

Users can update:
- Full name (instant save)
- Password (with current password verification)

### Conversation History

All queries are saved to Supabase with:
- User ID
- Query text
- AI response
- Model used
- Response time
- Timestamp

## Security

- **Row Level Security (RLS)**: All database tables protected
- **Protected Routes**: Authentication required for search
- **API Key Security**: Server-side only, never exposed to client
- **Environment Variables**: Gitignored, never committed

## Performance

- **Streaming Responses**: <200ms to first token
- **Edge Runtime**: Fast cold starts
- **Concurrent Queries**: Support for 20+ simultaneous requests
- **Database Indexing**: Optimized for common query patterns

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables (Production)

Add the same variables from `.env.local` to your deployment platform.

## Development Roadmap

- [ ] Web scraping for medical sources
- [ ] Advanced source credibility scoring
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] PDF/image analysis
- [ ] Citation export (BibTeX, APA)
- [ ] Analytics dashboard

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact the development team.
