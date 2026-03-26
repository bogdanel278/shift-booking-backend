# Database Connection Troubleshooting

## Issue: Cannot connect to Supabase

The error `ENOTFOUND db.vekgwgzobfnxoocmnqhs.supabase.co` means the hostname cannot be resolved.

## Steps to Fix:

### 1. Verify Your Supabase Connection String

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **Database**
4. Look for **Connection string** section
5. Select **Nodejs** or **URI** format
6. Copy the correct connection string

### 2. Check Connection String Format

Your connection string should look like:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

Or:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 3. Update .env File

Once you have the correct connection string, update `.env`:

```bash
# Parse your connection string and update these:
DB_HOST=your-actual-host.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password
```

### 4. Test Connection

```bash
npm run db:test
```

### 5. Run Database Migration

Once connected:
```bash
npm run db:migrate
```

## Alternative: Use Supabase's Connection Pooler

For better performance, use the connection pooler:

```
Host: aws-0-[region].pooler.supabase.com
Port: 5432
Mode: Transaction
```

##Common Issues:

1. **New Project** - Wait ~2 minutes for project to fully initialize
2. **Paused Project** - Free tier projects pause after inactivity
3. **Wrong Region** - Ensure you're using the correct regional URL
4. **Firewall** - Check network/firewall settings

## Direct Connection (Alternative)

You can also use the direct connection (not pooled):
- Port: 5432 for direct
- Port: 6543 for pooled/transaction mode

## Need Help?

1. Check Supabase project status in dashboard
2. Verify the project is running (not paused)
3. Copy the exact connection string from Supabase dashboard
