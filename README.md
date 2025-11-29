# Ghana Insider - German News Platform

AI-assisted news platform for German content with SEO optimization, built with Next.js 14, Supabase, and Claude AI.

## Features

### 🤖 AI-Assisted Content Creation
- Paste raw, unstructured content from any source
- Select a category (Tod/Nachruf, Hochzeit, Breaking News, Gastbeitrag)
- AI automatically formats content into SEO-optimized templates
- Live SEO score with actionable suggestions
- Preview and edit before publishing

### 📊 SEO Optimization
- Automatic meta title and description generation
- Keyword placement optimization
- Schema.org markup (NewsArticle, Person, Event)
- URL slug optimization for German umlauts
- Real-time SEO scoring (0-100)

### 📰 Content Management
- Create, edit, and manage posts
- Draft/Published/Archived status
- Category organization
- Guest post management
- View count tracking

### 🗄️ Archive.org Recovery
- Import old posts from Archive.org/Wayback Machine
- AI extracts and formats archived content
- Recover lost traffic by republishing old content

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API (Anthropic)
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **Language**: TypeScript

## Quick Start

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Set Up Supabase
1. Create project at supabase.com
2. Run schema from supabase/schema.sql
3. Copy API keys

### 3. Configure Environment
Create .env.local:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
ANTHROPIC_API_KEY=your_claude_api_key
\`\`\`

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

- Public Site: http://localhost:3000/de
- Admin Dashboard: http://localhost:3000/admin

## SEO Scoring (100 points)

| Check | Points |
|-------|--------|
| Keyword in URL | 15 |
| Keyword in Title | 15 |
| Keyword in H1 | 15 |
| Keyword in First 100 Words | 10 |
| Meta Description Length | 10 |
| 3+ H2 Headings | 10 |
| Schema Markup | 10 |
| Has Excerpt | 5 |
| Has Keywords | 5 |
| Image Suggestion | 5 |

## Deployment

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

## License

Private project for Ghana Insider.
