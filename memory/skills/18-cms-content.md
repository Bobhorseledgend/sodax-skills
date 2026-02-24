# Skill 18: CMS Content Management

## Quick Reference

**App:** `apps/web` only (not in SDK)
**API Routes:** `/api/cms/articles`, `/api/cms/news`, `/api/cms/glossary`
**Admin UI:** `/cms/` routes
**Auth:** better-auth + MongoDB
**Validation:** Zod schemas in `apps/web/lib/cms-schemas.ts`

---

## Architecture

```
Admin UI (apps/web/app/cms/)
    ↓
API Routes (apps/web/app/api/cms/)
    ↓
MongoDB (via apps/web/lib/db.ts)
```

All API routes use:
- `requirePermission()` for authorization (from `apps/web/lib/auth-utils.ts`)
- Zod validation (from `apps/web/lib/cms-schemas.ts`)
- HTML sanitization (from `apps/web/lib/sanitize.ts`)
- `force-dynamic` to prevent build-time execution

---

## Articles API

### GET `/api/cms/articles`
```
Query params: page (default 1), limit (1-100, default 20), published (boolean)
Response: { articles: Article[], total, page, limit, totalPages }
```

### POST `/api/cms/articles`
```typescript
// Request body (Zod validated):
{
  title: string;          // required, max 200
  content: string;        // required (HTML, sanitized)
  excerpt?: string;       // max 500
  image?: string;         // valid URL or empty
  metaTitle?: string;     // max 60
  metaDescription?: string; // max 160
  published?: boolean;    // default false
  tags?: string[];        // max 50 chars each
  category?: string;      // max 50
}
```

### GET/PATCH/DELETE `/api/cms/articles/[slug]`
Individual article CRUD by slug.

---

## News API

### GET `/api/cms/news`
```
Query params: page, limit, published
Response: { articles: NewsArticle[], total, page, limit, totalPages }
```

### POST `/api/cms/news`
```typescript
{
  title: string;            // required, max 200
  content: string;          // required (HTML, sanitized)
  excerpt?: string;         // max 500
  image?: string;           // valid URL
  metaTitle?: string;       // max 60
  metaDescription?: string; // max 160
  published?: boolean;      // default false
  tags?: string[];          // max 50 chars each
  categories?: string[];    // max 50 chars each
  authorId?: string;
  authorName?: string;
  publishedAt?: string;     // ISO datetime
}
```

---

## Glossary API

### GET `/api/cms/glossary`
Sorted alphabetically. Same pagination pattern.

### POST `/api/cms/glossary`
```typescript
{
  term: string;       // required
  definition: string; // required
  // Additional fields TBD
}
```

---

## Zod Schemas

```typescript
import { ArticleSchema, NewsArticleSchema, CreateUserSchema, formatZodError } from '@/lib/cms-schemas';

// Validate
const result = NewsArticleSchema.safeParse(body);
if (!result.success) {
  return Response.json({ error: formatZodError(result.error) }, { status: 400 });
}
```

### Schema Definitions

```typescript
// News
NewsArticleSchema: { title, content, excerpt?, image?, metaTitle?, metaDescription?, published, tags, categories, authorId?, authorName?, publishedAt? }
NewsArticlePatchSchema: all fields optional

// Articles
ArticleSchema: { title, content, excerpt?, image?, metaTitle?, metaDescription?, published, tags, category? }
ArticlePatchSchema: all fields optional

// Users
CreateUserSchema: { email, role: 'user'|'admin', permissions: ('news'|'articles'|'glossary')[] }
UpdateUserSchema: { userId, permissions }
```

---

## Admin UI Structure

```
apps/web/app/cms/
├── dashboard/     — Admin dashboard
├── login/         — Auth page
├── articles/      — Article editor (TipTap rich text)
├── news/          — News editor
├── glossary/      — Glossary term editor
├── users/         — User management
└── unauthorized/  — Error page
```

**Rich text editor:** TipTap (`@tiptap/*` packages) for article/news content.

---

## Public Content Routes

```
apps/web/app/news/           — News feed
apps/web/app/news/[slug]/    — Individual article
apps/web/app/news/feed.xml/  — RSS feed
apps/web/app/glossary/       — Glossary index
apps/web/app/glossary/[slug]/ — Glossary term
apps/web/app/concepts/       — Concept pages
apps/web/app/system/         — System concept pages
```

---

## Notion Integration

Some content sourced from Notion API:
- `apps/web/lib/notion.ts` — Notion API client
- Requires `NOTION_TOKEN` env var

---

## File Locations

| File | Path |
|------|------|
| CMS schemas | `apps/web/lib/cms-schemas.ts` |
| Articles API | `apps/web/app/api/cms/articles/route.ts` |
| News API | `apps/web/app/api/cms/news/route.ts` |
| Glossary API | `apps/web/app/api/cms/glossary/route.ts` |
| Auth utils | `apps/web/lib/auth-utils.ts` |
| DB connection | `apps/web/lib/db.ts` |
| Sanitize | `apps/web/lib/sanitize.ts` |
| Notion client | `apps/web/lib/notion.ts` |
| CMS admin UI | `apps/web/app/cms/` |
| CMS components | `apps/web/components/cms/` |
