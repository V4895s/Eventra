-- STAGE 3: function, stored procedures (transactions) and triggers.
USE eventra;
DROP FUNCTION  IF EXISTS fn_seats_left;
DROP PROCEDURE IF EXISTS register_for_event;
DROP PROCEDURE IF EXISTS cancel_registration;
DROP TRIGGER   IF EXISTS block_past_events;
DROP TRIGGER   IF EXISTS log_cancel;
DROP TRIGGER   IF EXISTS check_venue_capacity;
DROP TRIGGER   IF EXISTS protect_capacity;
DROP TRIGGER   IF EXISTS notify_registration;
DROP TRIGGER   IF EXISTS notify_promotion;

DELIMITER //

CREATE FUNCTION fn_seats_left(p_event INT) RETURNS INT
READS SQL DATA
BEGIN
  RETURN (SELECT capacity FROM events WHERE event_id = p_event)
       - (SELECT COUNT(*) FROM registrations WHERE event_id = p_event AND status = 'confirmed');
END //

-- Transaction: confirm if a seat is free, otherwise waitlist. FOR UPDATE locks the event row.
CREATE PROCEDURE register_for_event(IN p_user INT, IN p_event INT)
BEGIN
  DECLARE v_cap INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN ROLLBACK; RESIGNAL; END;

  START TRANSACTION;
  SELECT capacity INTO v_cap FROM events WHERE event_id = p_event FOR UPDATE;
  INSERT INTO registrations (user_id, event_id, status)
  VALUES (p_user, p_event, IF(fn_seats_left(p_event) > 0, 'confirmed', 'waitlist'));
  COMMIT;

  SELECT status FROM registrations WHERE user_id = p_user AND event_id = p_event;
END //

-- Transaction: cancel, then promote the longest-waiting student (fires notify_promotion)
CREATE PROCEDURE cancel_registration(IN p_user INT, IN p_event INT)
BEGIN
  DECLARE v_status VARCHAR(10);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN ROLLBACK; RESIGNAL; END;

  START TRANSACTION;
  SELECT status INTO v_status FROM registrations
   WHERE user_id = p_user AND event_id = p_event FOR UPDATE;
  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You are not registered for this event';
  END IF;
  DELETE FROM registrations WHERE user_id = p_user AND event_id = p_event;
  IF v_status = 'confirmed' THEN
    UPDATE registrations SET status = 'confirmed'
     WHERE event_id = p_event AND status = 'waitlist'
     ORDER BY registered_at, registration_id LIMIT 1;
  END IF;
  COMMIT;
END //

-- TRIGGER 1: no registering for events that already happened
CREATE TRIGGER block_past_events BEFORE INSERT ON registrations
FOR EACH ROW
BEGIN
  IF (SELECT event_date FROM events WHERE event_id = NEW.event_id) < CURDATE() THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This event has already taken place';
  END IF;
END //

-- TRIGGER 2: audit trail for cancellations
CREATE TRIGGER log_cancel AFTER DELETE ON registrations
FOR EACH ROW
BEGIN
  INSERT INTO cancellation_log (user_id, event_id, old_status)
  VALUES (OLD.user_id, OLD.event_id, OLD.status);
END //

-- TRIGGER 3: an event cannot be larger than its venue
CREATE TRIGGER check_venue_capacity BEFORE INSERT ON events
FOR EACH ROW
BEGIN
  IF NEW.capacity > (SELECT seating FROM venues WHERE venue_id = NEW.venue_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Capacity exceeds the seating of the chosen venue';
  END IF;
END //

-- TRIGGER 4: on update, keep capacity within venue seating and above confirmed seats
CREATE TRIGGER protect_capacity BEFORE UPDATE ON events
FOR EACH ROW
BEGIN
  IF NEW.capacity > (SELECT seating FROM venues WHERE venue_id = NEW.venue_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Capacity exceeds the seating of the chosen venue';
  END IF;
  IF NEW.capacity < (SELECT COUNT(*) FROM registrations
                     WHERE event_id = OLD.event_id AND status = 'confirmed') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Capacity cannot be lower than confirmed registrations';
  END IF;
END //

-- TRIGGER 5: notify the student after registering
CREATE TRIGGER notify_registration AFTER INSERT ON registrations
FOR EACH ROW
BEGIN
  INSERT INTO notifications (user_id, message)
  VALUES (NEW.user_id, CONCAT(
    IF(NEW.status = 'confirmed', 'You are registered for "', 'You are on the waitlist for "'),
    (SELECT title FROM events WHERE event_id = NEW.event_id), '"'));
END //

-- TRIGGER 6: notify a waitlisted student when a seat opens up
CREATE TRIGGER notify_promotion AFTER UPDATE ON registrations
FOR EACH ROW
BEGIN
  IF OLD.status = 'waitlist' AND NEW.status = 'confirmed' THEN
    INSERT INTO notifications (user_id, message)
    VALUES (NEW.user_id, CONCAT('A seat opened up. You are now confirmed for "',
            (SELECT title FROM events WHERE event_id = NEW.event_id), '"'));
  END IF;
END //

DELIMITER ;
