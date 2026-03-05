---
name: supabase-baas
description: Instructions for integrating and using Supabase as the backend-as-a-service for @banhandmi
---

# Supabase BaaS Skill

## Overview

Supabase is the primary backend for @banhandmi, providing authentication, PostgreSQL database, real-time subscriptions, and file storage. The frontend connects via `@supabase/supabase-js`.

## Setup

### Installation

```bash
npm install @supabase/supabase-js
```

### Environment Variables

Store in `.env.local` (never commit):

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

### Client Initialization

Create a single shared client at `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

> **Important**: Always use the `VITE_` prefix so Vite exposes the variable to the client bundle. Never expose the `service_role` key on the client.

## Authentication

### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
})
```

### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword',
})
```

### Session Management

```typescript
// Get current session
const { data: { session } } = await supabase.auth.getSession()

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  // Handle SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
})
```

### Sign Out

```typescript
await supabase.auth.signOut()
```

## Database (PostgreSQL)

### Read (SELECT)

```typescript
const { data, error } = await supabase
  .from('treats')
  .select('*')
  .eq('dog_id', dogId)
  .order('created_at', { ascending: false })
  .limit(20)
```

### Insert

```typescript
const { data, error } = await supabase
  .from('treats')
  .insert({ name: 'Peanut Butter Bone', dog_id: dogId })
  .select()
```

### Update

```typescript
const { data, error } = await supabase
  .from('treats')
  .update({ approved: true })
  .eq('id', treatId)
  .select()
```

### Delete

```typescript
const { error } = await supabase
  .from('treats')
  .delete()
  .eq('id', treatId)
```

### Real-Time Subscriptions

```typescript
const channel = supabase
  .channel('treats-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'treats' },
    (payload) => {
      console.log('Change received:', payload)
    }
  )
  .subscribe()

// Cleanup
channel.unsubscribe()
```

## Storage

### Upload File

```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`public/${filename}`, file, {
    cacheControl: '3600',
    upsert: false,
  })
```

### Get Public URL

```typescript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('public/avatar.png')
```

### Delete File

```typescript
const { error } = await supabase.storage
  .from('avatars')
  .remove(['public/old-avatar.png'])
```

## Row Level Security (RLS)

All tables **must** have RLS enabled. Common policy patterns:

```sql
-- Anyone can read public data
CREATE POLICY "Public read access" ON treats
  FOR SELECT USING (true);

-- Only authenticated owner can insert
CREATE POLICY "Owner insert" ON treats
  FOR INSERT WITH CHECK (auth.uid() = dog_id);

-- Only authenticated owner can update their own rows
CREATE POLICY "Owner update" ON treats
  FOR UPDATE USING (auth.uid() = dog_id);
```

> **Convention**: Always enable RLS on new tables. Use `auth.uid()` to scope access to the authenticated user.

## Conventions

- **Single client instance**: Always import from `src/lib/supabase.ts` — never create multiple clients.
- **Error handling**: Always destructure `{ data, error }` and handle errors explicitly.
- **Type safety**: Generate database types with `npx supabase gen types typescript --project-id <ref> > src/types/database.ts`, then pass to `createClient<Database>(...)`.
- **Env vars**: Prefix with `VITE_`. Keep `.env.local` in `.gitignore`.
- **Migrations**: Use Supabase CLI (`supabase migration new`, `supabase db push`) for schema changes.
