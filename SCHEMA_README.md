# Complete Database Schema

This file contains the **production-ready PostgreSQL schema** for the Shift Booking Marketplace MVP.

## 📋 Contents

### Tables (11)
1. **users** - Core user accounts (workers & businesses)
2. **worker_profiles** - Extended worker information
3. **business_profiles** - Extended business information
4. **shifts** - Job postings by businesses
5. **bookings** - Worker shift bookings
6. **timesheets** - Time tracking for shifts
7. **payouts** - Payment processing
8. **reviews** - Bidirectional review system
9. **notifications** - User notifications
10. **documents** - Document verification
11. **audit_logs** - System audit trail

### Features Included

✅ **10 ENUM types** for status fields  
✅ **Primary keys** on all tables (UUID)  
✅ **Foreign keys** with proper CASCADE/SET NULL  
✅ **Constraints**: NOT NULL, UNIQUE, CHECK  
✅ **67 Indexes** for query performance  
✅ **Soft deletes** (deleted_at columns)  
✅ **Timestamps** (created_at, updated_at)  
✅ **9 Database triggers**:
- Auto-update timestamps
- Full-text search vectors
- Prevent double bookings
- Enforce shift capacity
- Audit logging

## 🚀 How to Use

### Option 1: Fresh Database (Recommended)

If you're starting fresh or want to recreate the database:

```bash
# Using the migration script (recommended)
node scripts/migrate-complete.js

# Or manually with psql
psql -h <host> -U <user> -d <database> -f database-schema-complete.sql
```

### Option 2: Existing Database (Caution!)

⚠️ **Warning**: This will DROP existing types and may affect existing data.

```bash
# Backup first!
pg_dump -h <host> -U <user> <database> > backup.sql

# Then run the schema
psql -h <host> -U <user> -d <database> -f database-schema-complete.sql
```

### Option 3: Selective Updates

If you only want specific tables, extract the relevant sections from the schema file.

## 📊 Schema Diagram

```
users (base account)
├── worker_profiles (1:1)
├── business_profiles (1:1)
├── shifts (1:many for businesses)
├── bookings (1:many for workers)
├── reviews (1:many as reviewer/reviewee)
├── documents (1:many)
└── notifications (1:many)

shifts
├── bookings (1:many)
└── business_id → users

bookings
├── shift_id → shifts
├── worker_id → users
├── timesheets (1:1)
└── reviews (1:many)

timesheets
├── booking_id → bookings
├── worker_id → users
├── business_id → users
└── payouts (1:many)

payouts
├── worker_id → users
└── timesheet_id → timesheets
```

## 🔐 Security Features

1. **Email validation** - CHECK constraint on email format
2. **Audit logging** - All important operations tracked
3. **Soft deletes** - Data is never truly lost
4. **User verification** - is_verified flags
5. **Document verification** - Verification workflow

## ⚡ Performance Optimizations

- **Partial indexes** on deleted_at IS NULL (excludes soft-deleted records)
- **GIN indexes** on array columns (skills, search_vector)
- **Composite indexes** on frequently joined columns
- **Index on foreign keys** for faster JOINs

## 🛡️ Data Integrity

- **CHECK constraints** ensure valid data (ratings 1-5, positive amounts, etc.)
- **UNIQUE constraints** prevent duplicates (email, worker_shift pair)
- **Foreign keys** maintain referential integrity
- **NOT NULL** enforces required fields
- **Triggers** enforce business rules at database level

## 🔧 Maintenance Commands

```sql
-- View all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- View all indexes
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public' ORDER BY tablename;

-- Check table sizes
SELECT 
  schemaname as schema,
  tablename as table,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM shifts WHERE status = 'published';
```

## 📝 Migration Notes

- **From basic schema**: This schema is backward compatible if you're migrating from the basic 3-table schema
- **Seed data**: Add your seed data at the end of the schema file or in a separate seed script
- **Application user**: Update the GRANT statements at the end to match your database user

## 🧪 Testing

After running the schema:

```sql
-- Test user creation
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Test User', 'test@example.com', 'hashed_password', 'worker');

-- Verify constraints work
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Duplicate', 'test@example.com', 'password', 'worker');
-- Should fail with unique constraint error

-- Test foreign key constraints
INSERT INTO worker_profiles (user_id, bio) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Test');
-- Should fail with foreign key error
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- Backend implementation: See `/src/models/` for model definitions

## 🆘 Troubleshooting

**Problem**: "relation already exists" errors  
**Solution**: Drop existing types/tables or use `DROP TYPE IF EXISTS ... CASCADE`

**Problem**: Migration fails with "current transaction is aborted"  
**Solution**: Connect to database and run `ROLLBACK;` then retry

**Problem**: Triggers not firing  
**Solution**: Check trigger ownership and enable_trigger settings

**Problem**: Slow queries  
**Solution**: Run `ANALYZE` on tables to update statistics

## 📞 Support

For issues or questions, check:
1. [DATABASE_AUDIT_REPORT.md](DATABASE_AUDIT_REPORT.md) - Comprehensive audit
2. [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) - Backend implementation details
3. Your application logs for specific errors

---

**Version**: 1.0.0  
**Last Updated**: 2026-03-11  
**Status**: ✅ Production Ready
