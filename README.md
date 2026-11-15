# Eventra v2: smart campus event registration
Next.js (frontend + API routes) → MySQL (core data) + MongoDB (reviews and activity feed).
All SQL is written by hand with `mysql2`. There is no ORM and no third-party API key.

## Setup
Requirements: Node.js 18+, MySQL 8.0.16+, MongoDB 6+ running locally.

```bash
# 1. Database (run in this order; schema.sql recreates the eventra database)
mysql -u root -p < database/schema.sql
mysql -u root -p < database/routines.sql
mysql -u root -p < database/seed.sql
mysql -u root -p < database/alter.sql     # optional: ALTER demo

# 2. App
cp .env.example .env      # set DB_PASSWORD and a long random JWT_SECRET
npm install
npm run dev               # http://localhost:3000
```
Run the automated checks in a second terminal with `npm run smoke`.
Demo accounts (password `Password@123`): `admin@eventra.edu` (admin), `asha@eventra.edu` (student).
MongoDB collections (`reviews`, `activity`) are created automatically on first write.

## Tabs
- **Everyone:** Events, Event detail, Calendar
- **Students:** My tickets, Notifications, Profile
- **Admin:** Dashboard, Events, Attendees, Venues, Users, Reports, Audit log

## Requirement checklist

### Stage 2: design and SQL
| Requirement | Where |
|---|---|
| ER diagram and relational schema | `docs/DESIGN.md` |
| Entities, keys, relationships, constraints | `docs/DESIGN.md`, `database/schema.sql` |
| CREATE, ALTER, DROP | `schema.sql` (CREATE, DROP), `alter.sql` (ALTER, DROP COLUMN) |
| Integrity constraints and indexes | `schema.sql` |
| INSERT sample data | `database/seed.sql` |
| UPDATE, DELETE, SELECT | `database/queries.sql` |
| JOIN, GROUP BY, HAVING, ORDER BY, aggregates, subqueries | `database/queries.sql` |
| Short design document | `docs/DESIGN.md` |

### Stage 3: advanced features and integration
| Requirement | Where |
|---|---|
| 5 advanced concepts (4 required) | 1 transactions, 2 views, 3 procedures and function, 4 triggers, 5 indexing and full-text search. Evidence: `database/evidence.sql`. Extras: ROLLUP and window functions, MongoDB |
| Next.js interface with forms, tables, search, filter, dashboards | `app/` (13 tabs and pages) |
| Integration through API routes | `app/api/**`, `lib/db.js` |
| Authentication and two roles | `lib/auth.js`, `lib/api.js`, roles `student` and `admin` |
| Validation, integrity, security | `lib/validate.js`, constraints, `docs/DESIGN.md` (Security) |
| NoSQL | MongoDB reviews and activity: `lib/mongo.js`, `app/api/events/[id]/feedback`, `app/api/admin/audit` |
| GitHub and team contributions | `docs/TEAM.md` |
| Test cases, screenshots, report | `docs/TESTING.md`, `scripts/smoke-test.js`, `docs/REPORT.md` |

## What you still have to do yourself
The files here have not been run against live MySQL or MongoDB, because neither was available where this was built.
1. Run every SQL file, plus `queries.sql` and `evidence.sql`, in a MySQL client and **screenshot the real output**. Your instructor wants executed statements, not just code.
2. Walk through `docs/TESTING.md`, fill in the results and add screenshots.
3. Fill in `docs/TEAM.md`, commit as a team, and push to GitHub.
4. Write the final report from `docs/REPORT.md`. Due 15 November 2026, 23:59.
5. If anything fails on first run, send me the error and I'll fix it.

## Demo script
1. Show `schema.sql`, then run `queries.sql` section by section in the MySQL console.
2. Sign in as a student and register for the full cricket event: the waitlist appears, and a notification arrives from a trigger.
3. Cancel a confirmed seat, then show the waitlist promotion, the notification and the `cancellation_log` row.
4. Search for "hack" and show the `MATCH ... AGAINST` query in `app/api/events/route.js`.
5. Submit a review, then show the document in MongoDB (`db.reviews.find()`).
6. Sign in as admin and walk through the tabs: Dashboard, Attendees (check-in), Venues (try deleting one in use), Users, Reports (ROLLUP and RANK), Audit log.
