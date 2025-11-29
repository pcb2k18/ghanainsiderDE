# Ghana Insider DE - Setup Guide

Complete setup instructions to get your AI-powered German news platform running.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Anthropic API key

---

## 🚀 Quick Start (5 Steps)

### **Step 1: Install Dependencies**

```bash
npm install
```

---

### **Step 2: Set Up Supabase Database**

1. **Create a Supabase project**
   - Go to https://app.supabase.com/
   - Click "New project"
   - Choose a name (e.g., "ghanainsider-de")
   - Set a strong database password
   - Select a region close to your users

2. **Run the database schema**
   - In Supabase dashboard, go to **SQL Editor**
   - Click "New query"
   - Copy the entire contents of `supabase/schema.sql`
   - Paste and click "Run"
   - ✅ You should see: "Success. No rows returned"

3. **Verify categories were created**
   - Go to **Table Editor** → **categories**
   - You should see 4 categories:
     - Tod/Nachruf
     - Hochzeit
     - Breaking News
     - Gastbeitrag

4. **Get your API keys**
   - Go to **Settings** → **API**
   - Copy these values:
     - `Project URL` (your Supabase URL)
     - `anon public` key
     - `service_role` key (click "Reveal" to see it)

---

### **Step 3: Get Anthropic API Key**

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to **API Keys** → Click **Create Key**
4. Copy your API key (starts with `sk-ant-`)

---

### **Step 4: Configure Environment Variables**

1. **Update `.env.local`** with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-xxx...

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://ghanainsider.com
NEXT_PUBLIC_SITE_NAME=Ghana Insider
```

**⚠️ IMPORTANT:** Never commit `.env.local` to git!

---

### **Step 5: Run the Development Server**

```bash
npm run dev
```

Visit:
- **Admin Dashboard:** http://localhost:3000/admin
- **Public Site:** http://localhost:3000/de

---

## 🎯 Testing the Setup

### **Test 1: AI Content Formatting**

1. Go to http://localhost:3000/admin/create
2. Select category: **Tod/Nachruf**
3. Paste this test content:

```
David Müller, der bekannte deutsche Schauspieler, ist im Alter von 75 Jahren verstorben.
Er starb am 15. Januar 2025 in Berlin. Müller war verheiratet mit Anna Müller und hatte zwei Kinder.
Seine Karriere begann 1970 und er wurde bekannt durch seine Rolle in "Das Leben".
```

4. Click **Format with AI**
5. ✅ You should see:
   - Formatted article with proper structure
   - SEO score (should be 70+)
   - Meta title and description
   - URL slug

### **Test 2: Guest Post Creation**

1. Go to http://localhost:3000/admin/posts/new
2. Fill in:
   - Title: "Test Guest Post"
   - Content: `<h2>Einleitung</h2><p>Test content here...</p>`
3. Click **Save Draft**
4. ✅ Should redirect to edit page

### **Test 3: Archive Import**

1. Go to http://localhost:3000/admin/archive
2. Paste an archive.org URL (example format):
   ```
   https://web.archive.org/web/20250115124628/https://ghanainsider.com/de/index.php/article-slug/
   ```
3. Click **Import**
4. ✅ Should create a draft post

---

## 🗄️ Database Structure

Your Supabase database has these tables:

- **posts** - All articles (AI-assisted, guest posts, manual)
- **categories** - Content templates (Tod, Hochzeit, etc.)
- **seo_metadata** - Meta tags, schema markup
- **guest_submissions** - Guest post tracking
- **archive_imports** - Import history from Archive.org
- **agencies** - Guest post agency contacts

---

## 📊 Workflows

### **Workflow 1: AI-Assisted Article (Breaking News)**

1. Copy raw content from German news source
2. Go to `/admin/create`
3. Select category (Tod, Hochzeit, Breaking News)
4. Paste content → Click "Format with AI"
5. Review SEO score and suggestions
6. Edit if needed
7. Publish or Save as Draft

### **Workflow 2: Guest Post (Manual)**

1. Go to `/admin/posts/new`
2. Enter title, content, author info
3. Set category and SEO metadata
4. Publish or Save as Draft

### **Workflow 3: Archive Recovery**

1. Find old URLs on Archive.org
2. Go to `/admin/archive`
3. Paste archive.org URL
4. AI extracts content → Creates draft
5. Edit and publish

---

## 🚨 Troubleshooting

### **Problem: "No categories available"**

**Solution:** Run the database schema again
```bash
# In Supabase SQL Editor, run:
DELETE FROM categories;
-- Then run the full schema.sql again
```

### **Problem: "Failed to format content" / AI errors**

**Causes:**
1. ❌ Invalid `ANTHROPIC_API_KEY`
2. ❌ No API credits remaining
3. ❌ Typo in API key

**Solution:**
- Verify API key at https://console.anthropic.com/
- Check your usage limits
- Regenerate API key if needed

### **Problem: "Supabase connection error"**

**Causes:**
1. ❌ Wrong `SUPABASE_URL` or keys
2. ❌ RLS (Row Level Security) blocking requests

**Solution:**
```bash
# Verify your Supabase URL format:
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
# NOT: https://app.supabase.com/...
```

### **Problem: Categories exist but can't create posts**

**Check:**
1. RLS policies are enabled
2. Service role key is correct
3. No typos in environment variables

---

## 🌐 Deployment to Vercel

### **Step 1: Push to GitHub**

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

### **Step 2: Deploy to Vercel**

1. Go to https://vercel.com/
2. Click "Import Project"
3. Select your GitHub repository
4. Add environment variables:
   - Copy from `.env.local`
   - Paste into Vercel Environment Variables
5. Click "Deploy"

### **Step 3: Configure Domain**

1. In Vercel, go to **Settings** → **Domains**
2. Add your domain: `ghanainsider.com`
3. Update DNS records as instructed

---

## 📈 SEO Features Already Configured

✅ **Schema.org markup** (NewsArticle, Person, Event)
✅ **German umlauts in URLs** (ä→ae, ö→oe, ü→ue)
✅ **Meta tags optimization** (title 60 chars, description 155 chars)
✅ **Keyword placement** (URL, title, H1, first paragraph)
✅ **Automatic SEO scoring** (0-100 scale)

---

## 🎨 Customization

### **Change Site Colors**

Edit `tailwind.config.ts`:

```typescript
colors: {
  brand: {
    400: '#your-color', // Primary brand color
    500: '#your-color',
  },
}
```

### **Add New Category Template**

1. Add to `supabase/schema.sql`:
```sql
INSERT INTO categories (name, slug, description, template_structure, seo_defaults) VALUES
('Your Category', 'your-slug', 'Description', '{...}', '{...}');
```

2. Add prompt to `src/lib/ai/prompts.ts`:
```typescript
'your-slug': `Your AI prompt template...`
```

---

## 🆘 Support

**Issues?**
- Check `SETUP.md` (this file)
- Review `.env.local` configuration
- Verify Supabase schema ran successfully
- Check browser console for errors

**Need help?**
- Open an issue on GitHub
- Check Next.js 14 docs: https://nextjs.org/docs
- Supabase docs: https://supabase.com/docs

---

## ✅ Setup Complete Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] Supabase project created
- [ ] Database schema executed
- [ ] 4 categories visible in Supabase
- [ ] Anthropic API key obtained
- [ ] `.env.local` configured with all keys
- [ ] Dev server running (`npm run dev`)
- [ ] AI formatting test successful
- [ ] Guest post creation works
- [ ] Archive import tested

**All done?** 🎉 You're ready to start publishing!

---

## 📝 Next Steps

1. **Import old posts** from Archive.org
2. **Reach out to agencies** about guest posts
3. **Publish breaking news** using AI formatting
4. **Monitor SEO scores** and improve content
5. **Deploy to production** on Vercel

Good luck with Ghana Insider DE! 🚀
