# Security Setup Guide

## Database Credentials

Your database connection is configured in `.env` file.

**IMPORTANT:** Never commit `.env` to Git (it's already in `.gitignore`)

## Current Configuration

```
Host: db.vekgwgzobfnxoocmnqhs.supabase.co
Port: 5432
Database: postgres
User: postgres
SSL: Enabled (required for Supabase)
```

## Initialize Database Schema

Once connected, run:

```bash
# Option 1: Using psql
psql "postgresql://postgres:CrewlioData1!@db.vekgwgzobfnxoocmnqhs.supabase.co:5432/postgres?sslmode=require" -f database-schema.sql

# Option 2: Using Node.js script
npm run db:migrate
```

## Security Best Practices

1. **Rotate Database Password** - Change it in Supabase dashboard and update `.env`
2. **Use Environment Variables** - Never hardcode credentials
3. **Enable Row Level Security (RLS)** in Supabase for production
4. **Use Connection Pooling** - Already configured in database.ts

## Encryption at Rest

Supabase automatically encrypts:
- Database storage (AES-256)
- Backups
- Data in transit (TLS/SSL)

## API Keys

For additional security, consider using:
- Supabase API keys (anon/service)
- JWT authentication
- Row Level Security policies

## Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require
```

Current SSL mode: `rejectUnauthorized: false` (accepts self-signed certs)
For production, configure proper SSL verification.
