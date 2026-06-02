# Shipyard Database & Cache Cheatsheet

A comprehensive guide for working with PostgreSQL and Redis in the Shipyard project. Easy for beginners, with advanced patterns for future needs.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [PostgreSQL Guide](#postgresql-guide)
3. [Redis Guide](#redis-guide)
4. [Advanced Patterns](#advanced-patterns)
5. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Check Services Are Running
```bash
docker ps
```

Look for:
- `shipyard-postgres-container` (port 5432)
- `shipyard-redis-container` (port 6379)

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

---

## PostgreSQL Guide

PostgreSQL is your **database** — stores permanent data like deployments, projects, users.

### Basic Concepts

| Term | Meaning | Example |
|------|---------|---------|
| **Table** | Collection of related data | `deployments` table stores all deployment records |
| **Row** | One record | One deployment with id=1, status="pending" |
| **Column** | Property of a record | `id`, `status`, `framework`, `created_at` |
| **Primary Key** | Unique identifier | `id` — each deployment has unique ID |
| **Foreign Key** | Link to another table | deployment.project_id links to projects.id |

### Enter PostgreSQL CLI

**Interactive mode (recommended):**
```bash
docker exec -it shipyard-postgres-container psql -U shipyard -d shipyard
```

Inside psql, you'll see: `shipyard=#`

**Exit:**
```
\q
```

---

### Basic Commands (Inside psql)

#### 📋 List Tables
```sql
\dt
```
Shows all tables in the database

#### 🔍 View Table Structure
```sql
\d deployments
```
Shows columns, types, and constraints

#### ➕ Create Table
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  repository_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Keyword | Meaning |
|---------|---------|
| `SERIAL` | Auto-incrementing number (1, 2, 3...) |
| `PRIMARY KEY` | Unique identifier, cannot be NULL |
| `VARCHAR(255)` | Text up to 255 characters |
| `TIMESTAMP` | Date and time |
| `NOT NULL` | Field is required |
| `DEFAULT CURRENT_TIMESTAMP` | Use current time if not specified |

#### 📊 View All Data
```sql
SELECT * FROM deployments;
```

**Limit results:**
```sql
SELECT * FROM deployments LIMIT 10;
```

**See first 5 deployments:**
```sql
SELECT * FROM deployments LIMIT 5;
```

#### 🔎 Find Specific Data
```sql
-- Find deployment with id=1
SELECT * FROM deployments WHERE id = 1;

-- Find all pending deployments
SELECT * FROM deployments WHERE status = 'pending';

-- Find deployments from today
SELECT * FROM deployments WHERE created_at >= CURRENT_DATE;

-- Find Vite deployments
SELECT * FROM deployments WHERE framework = 'vite';
```

#### ➕ Insert Data
```sql
INSERT INTO deployments (project_id, status, framework) 
VALUES (1, 'pending', 'vite');
```

**Insert multiple rows:**
```sql
INSERT INTO deployments (project_id, status, framework) VALUES
  (1, 'pending', 'vite'),
  (2, 'building', 'next.js'),
  (3, 'completed', 'remix');
```

#### ✏️ Update Data
```sql
-- Update one deployment
UPDATE deployments SET status = 'completed' WHERE id = 1;

-- Update multiple fields
UPDATE deployments 
SET status = 'failed', updated_at = CURRENT_TIMESTAMP 
WHERE id = 2;

-- Update all records (dangerous!)
UPDATE deployments SET status = 'pending';
```

#### 🗑️ Delete Data
```sql
-- Delete one deployment
DELETE FROM deployments WHERE id = 1;

-- Delete all pending deployments
DELETE FROM deployments WHERE status = 'pending';

-- Delete all data (DANGEROUS - no undo!)
DELETE FROM deployments;
```

#### 📈 Count Data
```sql
-- Count all deployments
SELECT COUNT(*) FROM deployments;

-- Count by status
SELECT status, COUNT(*) FROM deployments GROUP BY status;

-- Result might be:
-- status     | count
-- ----------+-------
-- pending   |     5
-- building  |     3
-- completed |    12
```

#### 📊 Aggregate Data
```sql
-- Get latest deployments
SELECT * FROM deployments ORDER BY created_at DESC LIMIT 5;

-- Average creation time grouping
SELECT 
  framework, 
  COUNT(*) as total,
  MAX(created_at) as latest
FROM deployments 
GROUP BY framework;
```

---

### One-Liner Commands (Without Entering psql)

#### View Tables
```bash
docker exec shipyard-postgres-container psql -U shipyard -d shipyard -c "\dt"
```

#### Show Specific Data
```bash
docker exec shipyard-postgres-container psql -U shipyard -d shipyard -c "SELECT * FROM deployments LIMIT 5;"
```

#### Insert Data
```bash
docker exec shipyard-postgres-container psql -U shipyard -d shipyard -c \
  "INSERT INTO deployments (project_id, status, framework) VALUES (1, 'pending', 'vite');"
```

#### Count Records
```bash
docker exec shipyard-postgres-container psql -U shipyard -d shipyard -c \
  "SELECT status, COUNT(*) FROM deployments GROUP BY status;"
```

#### Export to CSV
```bash
docker exec shipyard-postgres-container psql -U shipyard -d shipyard -c \
  "\COPY deployments TO STDOUT WITH CSV HEADER" > deployments.csv
```

#### View Database Size
```bash
docker exec shipyard-postgres-container psql -U shipyard -d shipyard -c \
  "SELECT pg_size_pretty(pg_database_size('shipyard'));"
```

---

### PostgreSQL Best Practices

✅ **Use Indexes for Frequently Searched Columns**
```sql
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_deployments_created_at ON deployments(created_at);
```
Speeds up WHERE clauses and sorting.

✅ **Use Transactions for Related Operations**
```sql
BEGIN;
  INSERT INTO projects (name) VALUES ('my-app');
  INSERT INTO deployments (project_id, status) VALUES (1, 'pending');
COMMIT;
```
Both succeed or both fail (atomic).

✅ **Use Prepared Statements (In Your Code)**
```sql
-- SAFE: Prevents SQL injection
PREPARE stmt AS SELECT * FROM deployments WHERE id = $1;
EXECUTE stmt(1);

-- UNSAFE: Never do this in real code
SELECT * FROM deployments WHERE id = 1; -- (if 1 comes from user input)
```

✅ **Back Up Your Data**
```bash
docker exec shipyard-postgres-container pg_dump -U shipyard shipyard > backup.sql
```

✅ **Monitor Performance**
```bash
docker exec shipyard-postgres-container psql -U shipyard -d shipyard -c \
  "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 5;"
```

---

## Redis Guide

Redis is your **cache** — stores temporary data like queues, sessions, and cached database records.

### Basic Concepts

| Term | Meaning | Example |
|------|---------|---------|
| **Key** | Unique identifier | `deployment:1`, `builds:queue`, `user:123:session` |
| **Value** | Data stored | String, number, list, JSON |
| **TTL** | Time to live (expiration) | 3600 seconds = 1 hour |
| **Queue** | List of jobs to process | `builds:queue` with build jobs |
| **Cache** | Temporary fast data | Deployment details cached for 1 hour |

### Enter Redis CLI

**Interactive mode:**
```bash
docker exec -it compose-shipyard-redis-1 redis-cli
```

You'll see: `127.0.0.1:6379>`

**Exit:**
```
EXIT
```

---

### Basic Commands (Inside redis-cli)

#### ➕ Create/Set Keys

**Simple key-value:**
```bash
SET mykey "hello world"
```

**With expiration (60 seconds):**
```bash
SET tempkey "value" EX 60
```

| Option | Meaning |
|--------|---------|
| `EX seconds` | Key expires after N seconds |
| `PX milliseconds` | Key expires after N milliseconds |
| `NX` | Only set if key doesn't exist |
| `XX` | Only set if key already exists |

**Set with 1 hour expiration:**
```bash
SET deployment:1 '{"id":1,"status":"pending"}' EX 3600
```

**Set multiple at once:**
```bash
MSET key1 "value1" key2 "value2" key3 "value3"
```

#### 🔍 Get Keys

**Get single key:**
```bash
GET mykey
```
Returns: `"hello world"`

**Get multiple keys:**
```bash
MGET key1 key2 key3
```
Returns list of values

**Check if key exists:**
```bash
EXISTS mykey
```
Returns: `1` (exists) or `0` (doesn't exist)

**Get key type:**
```bash
TYPE mykey
```
Returns: `string`, `list`, `hash`, `set`, `zset`, or `none`

**Get all keys:**
```bash
KEYS *
```

**Find keys by pattern:**
```bash
KEYS deployment:*
KEYS *:queue
KEYS project:*
```

#### ⏱️ Expiration (TTL)

**Get seconds until expiration:**
```bash
TTL mykey
```
Returns: `3599` (3599 seconds left), `-1` (never expires), `-2` (key doesn't exist)

**Get milliseconds until expiration:**
```bash
PTTL mykey
```

**Set expiration on existing key:**
```bash
EXPIRE mykey 3600
```

**Remove expiration:**
```bash
PERSIST mykey
```

#### 🗑️ Delete Keys

**Delete single key:**
```bash
DEL mykey
```

**Delete multiple keys:**
```bash
DEL key1 key2 key3
```

**Clear entire database (dangerous!):**
```bash
FLUSHDB
```

---

### Queue Operations (For Build Jobs)

A queue is a **list** where jobs are added and processed in order (FIFO = First In, First Out).

#### ➕ Add Jobs to Queue

**Add one job:**
```bash
LPUSH builds:queue '{"id":1,"app":"frontend"}'
```

**Add multiple jobs:**
```bash
LPUSH builds:queue '{"id":1,"app":"frontend"}'
LPUSH builds:queue '{"id":2,"app":"api-server"}'
LPUSH builds:queue '{"id":3,"app":"build-worker"}'
```

#### 📋 View Queue Jobs

**See all jobs:**
```bash
LRANGE builds:queue 0 -1
```

**See first 3 jobs:**
```bash
LRANGE builds:queue 0 2
```

**See last job:**
```bash
LRANGE builds:queue -1 -1
```

#### 📊 Queue Info

**Count jobs in queue:**
```bash
LLEN builds:queue
```
Returns: `3` (3 jobs in queue)

**Get first job without removing:**
```bash
LINDEX builds:queue 0
```

#### 🔄 Process Queue Jobs

**Get and remove first job (for worker to process):**
```bash
RPOP builds:queue
```

**Get and remove last job:**
```bash
LPOP builds:queue
```

#### 🗑️ Clear Queue

**Remove specific job:**
```bash
LREM builds:queue 0 '{"id":1,"app":"frontend"}'
```

**Delete entire queue:**
```bash
DEL builds:queue
```

---

### Cache Examples

#### 📦 Cache Database Records

**Cache deployment for 1 hour:**
```bash
SET deployment:1 '{"id":1,"status":"pending","framework":"vite"}' EX 3600
SET deployment:2 '{"id":2,"status":"building","framework":"next.js"}' EX 3600
SET deployment:3 '{"id":3,"status":"completed","framework":"remix"}' EX 3600
```

**Retrieve cached deployment:**
```bash
GET deployment:1
```

**Check remaining time:**
```bash
TTL deployment:1
```

#### 👤 Cache User Sessions

**Create session with 24 hour expiration:**
```bash
SET user:123:session '{"userId":123,"token":"abc123","role":"admin"}' EX 86400
```
(86400 seconds = 24 hours)

**Invalidate session:**
```bash
DEL user:123:session
```

#### ⚙️ Cache Configuration

**Store config values:**
```bash
SET config:redis:timeout 5000
SET config:build:max_workers 4
SET config:api:rate_limit 100
```

**Retrieve config:**
```bash
GET config:redis:timeout
```

---

### One-Liner Commands (Without Entering redis-cli)

#### Set a Key
```bash
docker exec shipyard-redis-container redis-cli SET mykey "hello"
```

#### Get a Key
```bash
docker exec shipyard-redis-container redis-cli GET mykey
```

#### Set with Expiration
```bash
docker exec shipyard-redis-container redis-cli SET tempkey "value" EX 60
```

#### Get All Keys
```bash
docker exec shipyard-redis-container redis-cli KEYS "*"
```

#### Add to Queue
```bash
docker exec shipyard-redis-container redis-cli LPUSH builds:queue '{"id":1,"app":"frontend"}'
```

#### View Queue
```bash
docker exec shipyard-redis-container redis-cli LRANGE builds:queue 0 -1
```

#### Get Queue Length
```bash
docker exec shipyard-redis-container redis-cli LLEN builds:queue
```

#### Database Size
```bash
docker exec shipyard-redis-container redis-cli DBSIZE
```

#### Memory Usage
```bash
docker exec shipyard-redis-container redis-cli INFO memory
```

---

### Redis Best Practices

✅ **Use Key Naming Conventions**
```bash
deployment:1          # Cached deployment
project:100           # Cached project
builds:queue          # Queue of build jobs
user:456:session      # User session cache
```

✅ **Always Set Expiration (TTL)**
```bash
-- BAD: Cache never expires (memory bloat)
SET deployment:1 '{"data":"..."}'

-- GOOD: Auto-cleanup after 1 hour
SET deployment:1 '{"data":"..."}' EX 3600
```

✅ **Monitor Memory Usage**
```bash
docker exec shipyard-redis-container redis-cli INFO memory
docker exec shipyard-redis-container redis-cli DBSIZE
```

✅ **Use Blocking Queue Reads (In Your Code)**
```bash
-- Poll every 100ms (wastes CPU)
RPOP builds:queue

-- Block until job available (efficient)
BRPOP builds:queue 5  # Wait up to 5 seconds
```

✅ **Backup Important Data**
```bash
docker exec shipyard-redis-container redis-cli BGSAVE
```

---

## Advanced Patterns

### Pattern 1: Cache-Aside (Most Common)

Trying cache first, falling back to database:

```bash
# 1. Check cache
GET deployment:1

# If cache miss, query database
SELECT * FROM deployments WHERE id = 1;

# 3. Store result in cache for next time
SET deployment:1 '{"id":1,"status":"pending"}' EX 3600
```

**In your code logic:**
```
1. Try to get from cache
2. If not found, get from database
3. Store in cache with TTL
4. Return to user
```

### Pattern 2: Queue-Based Worker

Build jobs processed by workers:

```bash
# Producer adds job
LPUSH builds:queue '{"deploymentId":1,"framework":"vite"}'

# Worker 1: Processes job
BRPOP builds:queue 5
# Do the work...
# Job complete

# Worker 2: Processes next job
BRPOP builds:queue 5
```

### Pattern 3: Distributed Transactions

Using database for critical data, Redis for speed:

```bash
# 1. Start database transaction
BEGIN;

# 2. Insert deployment record
INSERT INTO deployments (status) VALUES ('pending');

# 3. Add to processing queue
-- (after INSERT completes, use ID in queue)

# 4. Cache the record
SET deployment:1 '{"..."}' EX 3600

# 5. Commit all changes
COMMIT;
```

### Pattern 4: Rate Limiting

Track requests per user:

```bash
# Increment counter for today
INCR user:123:requests:2026-05-20

# Set 24-hour expiration
EXPIRE user:123:requests:2026-05-20 86400

# Check if over limit
GET user:123:requests:2026-05-20  # e.g., 95 requests
# If > 100, reject request
```

### Pattern 5: Pub/Sub (Real-Time Updates)

Broadcasting deployment status:

```bash
# Publisher: New deployment status
PUBLISH deployment:updates "Deployment 1 is now building"

# Subscriber: Listening for updates
SUBSCRIBE deployment:updates
# Receives: "Deployment 1 is now building"
```

---

## Troubleshooting

### PostgreSQL Issues

#### ❌ "Connection refused"
**Problem:** PostgreSQL not running
**Solution:**
```bash
docker-compose up -d
docker ps  # Verify container is running
```

#### ❌ "Authentication failed"
**Problem:** Wrong username/password
**Solution:**
```bash
# Check docker-compose.yml for credentials
cat docker-compose.yml | grep POSTGRES_
```

#### ❌ "Table already exists"
**Problem:** Running init script twice
**Solution:**
```bash
-- Check existing tables
\dt

-- Drop table if needed
DROP TABLE deployments;

-- Recreate it
CREATE TABLE deployments (...);
```

#### ⚠️ Slow Queries
**Problem:** Queries take too long
**Solution:**
```bash
# View slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 5;

# Add index to frequently searched column
CREATE INDEX idx_deployments_status ON deployments(status);
```

---

### Redis Issues

#### ❌ "Connection refused"
**Problem:** Redis not running
**Solution:**
```bash
docker-compose up -d
docker ps  # Verify container is running
```

#### ❌ "Out of memory"
**Problem:** Redis using too much RAM
**Solution:**
```bash
# Check size
docker exec shipyard-redis-container redis-cli DBSIZE

# View keys taking space
docker exec shipyard-redis-container redis-cli KEYS "*" | head -20

# Clear old data
docker exec shipyard-redis-container redis-cli FLUSHDB
```

#### ⚠️ Queue Jobs Not Processing
**Problem:** Jobs stuck in queue
**Solution:**
```bash
# Check queue length
docker exec shipyard-redis-container redis-cli LLEN builds:queue

# View first job
docker exec shipyard-redis-container redis-cli LRANGE builds:queue 0 0

# Remove stuck job
docker exec shipyard-redis-container redis-cli LPOP builds:queue
```

#### ⚠️ Cache Data Stale
**Problem:** Outdated cached data served to users
**Solution:**
```bash
# Set shorter TTL (e.g., 5 minutes = 300 seconds)
SET deployment:1 '{"..."}' EX 300

# Or invalidate manually
DEL deployment:1

# Verify TTL
TTL deployment:1
```

---

## Quick Reference Table

### PostgreSQL Quick Commands
| Task | Command |
|------|---------|
| List tables | `\dt` |
| View structure | `\d tablename` |
| Select all | `SELECT * FROM tablename;` |
| Count rows | `SELECT COUNT(*) FROM tablename;` |
| Insert | `INSERT INTO tablename (col) VALUES (val);` |
| Update | `UPDATE tablename SET col=val WHERE id=1;` |
| Delete | `DELETE FROM tablename WHERE id=1;` |
| Exit | `\q` |

### Redis Quick Commands
| Task | Command |
|------|---------|
| Set key | `SET key value` |
| Get key | `GET key` |
| Set with TTL | `SET key value EX 3600` |
| Add to queue | `LPUSH queue:name '{"data"}'` |
| View queue | `LRANGE queue:name 0 -1` |
| Get queue size | `LLEN queue:name` |
| Delete key | `DEL key` |
| All keys | `KEYS *` |
| Exit | `EXIT` |

---

## Learning Resources

### For PostgreSQL
- Official Docs: https://www.postgresql.org/docs/
- SQL Tutorial: https://sqlzoo.net/
- Performance: https://use-the-index-luke.com/

### For Redis
- Official Docs: https://redis.io/docs/
- Interactive Tutorial: https://try.redis.io/
- Patterns: https://redis.io/docs/manual/patterns/

### For This Project
- Start services: `docker-compose up -d`
- Check health: `docker ps`
- Read logs: `docker-compose logs -f`

---

## Summary

### PostgreSQL
- **Use for:** Permanent, structured data
- **Access:** `docker exec -it shipyard-postgres-container psql -U shipyard -d shipyard`
- **Key command:** `SELECT`, `INSERT`, `UPDATE`, `DELETE`

### Redis
- **Use for:** Temporary data, caches, queues
- **Access:** `docker exec -it shipyard-redis-container redis-cli`
- **Key command:** `SET`, `GET`, `LPUSH`, `LRANGE`, `EXPIRE`

Both work together:
1. **API receives request** → Check Redis cache first
2. **Cache miss** → Query PostgreSQL
3. **Got data** → Store in Redis (with TTL)
4. **Background jobs** → Queue in Redis, process by workers
5. **Final results** → Save to PostgreSQL

**Happy querying! 🚀**
