-- STAGE 2: DDL. Tables, constraints, indexes and views.
DROP DATABASE IF EXISTS eventra;
CREATE DATABASE eventra;
USE eventra;

CREATE TABLE users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('student','admin') NOT NULL DEFAULT 'student',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE venues (
  venue_id INT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(100) NOT NULL UNIQUE,
  building VARCHAR(100) NOT NULL,
  seating  INT NOT NULL,
  CONSTRAINT chk_seating CHECK (seating > 0)
);

CREATE TABLE events (
  event_id    INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(150) NOT NULL,
  category    ENUM('Tech','Culture','Sports','Workshop') NOT NULL,
  description TEXT,
  venue_id    INT NOT NULL,
  event_date  DATE NOT NULL,
  event_time  TIME NOT NULL,
  capacity    INT NOT NULL,
  created_by  INT NULL,
  CONSTRAINT chk_capacity CHECK (capacity > 0),
  CONSTRAINT fk_event_venue   FOREIGN KEY (venue_id)   REFERENCES venues(venue_id) ON DELETE RESTRICT,
  CONSTRAINT fk_event_creator FOREIGN KEY (created_by) REFERENCES users(user_id)   ON DELETE SET NULL,
  INDEX idx_event_date (event_date),
  INDEX idx_event_category (category),
  FULLTEXT INDEX ft_events (title, description)
);

CREATE TABLE registrations (
  registration_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  event_id        INT NOT NULL,
  status          ENUM('confirmed','waitlist') NOT NULL,
  checked_in      TINYINT(1) NOT NULL DEFAULT 0,
  checked_in_at   TIMESTAMP NULL,
  registered_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_event UNIQUE (user_id, event_id),
  CONSTRAINT fk_reg_user  FOREIGN KEY (user_id)  REFERENCES users(user_id)   ON DELETE CASCADE,
  CONSTRAINT fk_reg_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- Filled by triggers. No foreign keys on the log so history survives deletions.
CREATE TABLE cancellation_log (
  log_id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  event_id     INT NOT NULL,
  old_status   VARCHAR(10),
  cancelled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  message         VARCHAR(255) NOT NULL,
  is_read         TINYINT(1) NOT NULL DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id, is_read)
);

-- VIEW 1: confirmed seats and fill rate per event
CREATE VIEW event_fill AS
SELECT e.event_id, e.capacity,
       COUNT(r.registration_id) AS taken,
       COUNT(r.registration_id) / e.capacity AS fill
FROM events e
LEFT JOIN registrations r ON r.event_id = e.event_id AND r.status = 'confirmed'
GROUP BY e.event_id, e.capacity;

-- VIEW 2: readable registration list (4-table join)
CREATE VIEW v_registration_details AS
SELECT r.registration_id, u.name AS student, u.email, e.title AS event, v.name AS venue,
       e.event_date, r.status, r.checked_in, r.registered_at
FROM registrations r
JOIN users u  ON u.user_id  = r.user_id
JOIN events e ON e.event_id = r.event_id
JOIN venues v ON v.venue_id = e.venue_id;
