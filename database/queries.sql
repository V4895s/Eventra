-- STAGE 2 + 3: queries to execute and screenshot. Run after schema, routines and seed.
USE eventra;

-- ===== DML: UPDATE / DELETE / SELECT =====
UPDATE events SET capacity = capacity + 5 WHERE event_id = 3;
UPDATE events SET capacity = 1 WHERE event_id = 1;            -- blocked: below confirmed seats
UPDATE events SET capacity = 999 WHERE event_id = 4;          -- blocked: bigger than Lab 3 seating
DELETE FROM registrations WHERE user_id = 6 AND event_id = 2; -- fires log_cancel
SELECT * FROM cancellation_log;
DELETE FROM venues WHERE venue_id = 1;                        -- blocked: events use this venue (RESTRICT)

-- ===== JOINS =====
SELECT u.name, e.title, v.name AS venue, r.status        -- 4-table inner join
FROM registrations r
JOIN users u  ON u.user_id  = r.user_id
JOIN events e ON e.event_id = r.event_id
JOIN venues v ON v.venue_id = e.venue_id
ORDER BY e.event_date, r.registered_at;
SELECT * FROM v_registration_details;

SELECT v.name, COUNT(e.event_id) AS events               -- left join: unused venues show 0
FROM venues v LEFT JOIN events e ON e.venue_id = v.venue_id
GROUP BY v.venue_id, v.name
HAVING events = 0;

-- ===== GROUP BY / HAVING / AGGREGATES / ROLLUP / WINDOW =====
SELECT e.category, COUNT(*) AS events, SUM(f.taken) AS seats_taken,
       ROUND(100 * SUM(f.taken) / SUM(f.capacity)) AS fill_pct
FROM events e JOIN event_fill f ON f.event_id = e.event_id
GROUP BY e.category HAVING COUNT(*) > 0 ORDER BY seats_taken DESC;

SELECT COALESCE(e.category, 'ALL') AS category, COUNT(r.registration_id) AS registrations
FROM events e LEFT JOIN registrations r ON r.event_id = e.event_id
GROUP BY e.category WITH ROLLUP;                          -- subtotal row

SELECT e.title, e.category, f.taken, f.capacity,
       RANK() OVER (ORDER BY f.fill DESC)                           AS overall_rank,
       RANK() OVER (PARTITION BY e.category ORDER BY f.taken DESC)  AS rank_in_category
FROM events e JOIN event_fill f ON f.event_id = e.event_id ORDER BY overall_rank;

-- ===== SUBQUERIES =====
SELECT e.title, e.category, ROUND(s.fill * 100) AS fill_pct   -- correlated
FROM event_fill s JOIN events e ON e.event_id = s.event_id
WHERE s.fill > (SELECT AVG(s2.fill) FROM event_fill s2
                JOIN events e2 ON e2.event_id = s2.event_id
                WHERE e2.category = e.category);

SELECT e.title FROM events e                                  -- correlated EXISTS
WHERE EXISTS (SELECT 1 FROM registrations r WHERE r.event_id = e.event_id AND r.status = 'waitlist');

SELECT u.name,                                                -- scalar + derived-table subquery
       (SELECT COUNT(*) FROM registrations r WHERE r.user_id = u.user_id) AS total
FROM users u
WHERE u.role = 'student'
  AND (SELECT COUNT(*) FROM registrations r WHERE r.user_id = u.user_id) >
      (SELECT AVG(c) FROM (SELECT COUNT(*) AS c FROM registrations GROUP BY user_id) t);

-- ===== ADVANCED FEATURES =====
SELECT event_id, title FROM events                            -- full-text search
WHERE MATCH(title, description) AGAINST ('+hack*' IN BOOLEAN MODE);

SELECT title, fn_seats_left(event_id) AS seats_left FROM events;   -- function

CALL register_for_event(6, 3);   -- cricket is full: 'waitlist' (and a notification is created)
CALL register_for_event(6, 3);   -- duplicate: rejected by UNIQUE, rolled back
CALL cancel_registration(2, 3);  -- frees a seat, oldest waitlisted student promoted
SELECT * FROM registrations WHERE event_id = 3;
SELECT u.name, n.message FROM notifications n JOIN users u ON u.user_id = n.user_id
ORDER BY n.notification_id DESC LIMIT 5;                      -- written by triggers

START TRANSACTION;                                            -- manual transaction
DELETE FROM registrations WHERE event_id = 1;
SELECT COUNT(*) AS rows_inside FROM registrations WHERE event_id = 1;
ROLLBACK;
SELECT COUNT(*) AS rows_after_rollback FROM registrations WHERE event_id = 1;

EXPLAIN SELECT * FROM events WHERE event_date = CURDATE();    -- index evidence
SHOW INDEX FROM events;
