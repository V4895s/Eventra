-- STAGE 3 EVIDENCE: the five core advanced database concepts, one section each.
-- Run after schema.sql, routines.sql and seed.sql. Screenshot the output of every section.
USE eventra;

-- ===== 1. TRANSACTIONS =====
-- 1a. Inside a stored procedure: START TRANSACTION, row lock, COMMIT, and ROLLBACK on error
SHOW CREATE PROCEDURE register_for_event\G
CALL register_for_event(6, 3);                  -- cricket is full -> 'waitlist'
CALL register_for_event(6, 3);                  -- duplicate -> error, whole transaction rolled back
SELECT COUNT(*) AS rows_for_divya FROM registrations WHERE user_id = 6 AND event_id = 3;   -- still 1
-- 1b. Manual transaction with ROLLBACK
START TRANSACTION;
DELETE FROM registrations WHERE event_id = 1;
SELECT COUNT(*) AS inside_transaction FROM registrations WHERE event_id = 1;               -- 0
ROLLBACK;
SELECT COUNT(*) AS after_rollback FROM registrations WHERE event_id = 1;                   -- 4 again

-- ===== 2. VIEWS =====
SHOW FULL TABLES WHERE Table_type = 'VIEW';
SELECT * FROM event_fill;
SELECT * FROM v_registration_details;

-- ===== 3. STORED PROCEDURES AND FUNCTIONS =====
SHOW PROCEDURE STATUS WHERE Db = 'eventra';
SHOW FUNCTION STATUS  WHERE Db = 'eventra';
SELECT title, capacity, fn_seats_left(event_id) AS seats_left FROM events;
CALL cancel_registration(2, 3);                 -- frees a seat; oldest waitlisted student is promoted
SELECT u.name, r.status FROM registrations r JOIN users u ON u.user_id = r.user_id WHERE r.event_id = 3;

-- ===== 4. TRIGGERS =====
SHOW TRIGGERS;
SELECT u.name, n.message FROM notifications n JOIN users u ON u.user_id = n.user_id
ORDER BY n.notification_id DESC LIMIT 5;        -- rows written by notify_registration / notify_promotion
SELECT * FROM cancellation_log;                 -- rows written by log_cancel
UPDATE events SET capacity = 1   WHERE event_id = 1;   -- blocked by protect_capacity (below confirmed seats)
UPDATE events SET capacity = 999 WHERE event_id = 4;   -- blocked by protect_capacity (above venue seating)

-- ===== 5. INDEXING AND FULL-TEXT SEARCH =====
SHOW INDEX FROM events;
EXPLAIN SELECT * FROM events WHERE event_date = CURDATE() + INTERVAL 5 DAY;   -- uses idx_event_date
SELECT event_id, title FROM events
WHERE MATCH(title, description) AGAINST ('+hack*' IN BOOLEAN MODE);          -- uses ft_events
SELECT title, MATCH(title, description) AGAINST ('database indexes') AS relevance
FROM events WHERE MATCH(title, description) AGAINST ('database indexes') ORDER BY relevance DESC;

-- ===== EXTRAS: analytic SQL =====
SELECT COALESCE(e.category, 'ALL') AS category, COUNT(r.registration_id) AS registrations
FROM events e LEFT JOIN registrations r ON r.event_id = e.event_id GROUP BY e.category WITH ROLLUP;
SELECT e.title, RANK() OVER (PARTITION BY e.category ORDER BY f.taken DESC) AS rank_in_category
FROM events e JOIN event_fill f ON f.event_id = e.event_id;
