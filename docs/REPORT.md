# Eventra: final project report (template)
Replace every (placeholder) and paste your screenshots. Most of the text can be copied from `docs/DESIGN.md`.

## 1. Problem statement and objectives
(From your Stage 1 submission: why campuses need an event registration system, and the goals.)

## 2. Scope and features
Student side: search events, calendar, register or join a waitlist, tickets, notifications, profile, reviews.
Admin side: dashboard, event and venue management, attendee check-in, user roles, reports, audit log.

## 3. Technology choices
| Part | Choice | Reason |
|---|---|---|
| Frontend and backend | Next.js (React pages and API routes) | one project, simple deployment |
| Core database | MySQL | structured data with strict integrity, transactions, triggers |
| NoSQL | MongoDB | flexible review and activity documents, aggregation |
| Authentication | scrypt hashes plus JWT in an httpOnly cookie | no external service or API key |

## 4. Database design (Stage 2)
ER diagram, relational schema and constraints: see `docs/DESIGN.md`. (Paste the rendered ER diagram.)

## 5. SQL implementation evidence (Stage 2)
Screenshots of each, as executed in MySQL:
1. `schema.sql` run successfully, then `SHOW TABLES;`
2. `alter.sql` (ALTER and DROP COLUMN) and `DESCRIBE users;`
3. `seed.sql` (INSERT) and `SELECT * FROM events;`
4. UPDATE and DELETE from `queries.sql`, including the trigger errors
5. Join, GROUP BY, HAVING, ORDER BY, aggregate and subquery outputs

## 6. Advanced features evidence (Stage 3)
Run `database/evidence.sql` and screenshot each of its five sections: 1 transactions, 2 views, 3 procedures and function, 4 triggers, 5 indexing and full-text search. Then add the ROLLUP and window-function output as extras.

## 7. NoSQL implementation
MongoDB collections `reviews` and `activity`: screenshot `db.reviews.find()`, `db.activity.find()` and the average-rating aggregation. Justification is in `docs/DESIGN.md`.

## 8. Application screenshots
Events, Event detail, Calendar, My tickets, Notifications, Profile, and every Admin tab.

## 9. Security and validation
See the Security section of `docs/DESIGN.md`. Include test results T2, T3, T6, T7, T19 and T28.

## 10. Test results
Output of `npm run smoke` and the completed table from `docs/TESTING.md`.

## 11. Team contributions
From `docs/TEAM.md` and the GitHub commit history.

## 12. Conclusion and future work
(Examples: email notifications, QR-code check-in, payments.)
