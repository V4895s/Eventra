-- STAGE 2: DML sample data. Every seeded account has the password  Password@123
USE eventra;

INSERT INTO users (name, email, password_hash, role) VALUES
 ('Admin',        'admin@eventra.edu',   'a1b2c3d4e5f60718293a4b5c6d7e8f90:5bd760654e3225fbc5a303ef4c939c10a37bea4f6f9ed2dab65d5c259f8e88a89d1be95a9d75793ed1567532c2503dd551e3e9a3283781d6a67ea634498ca9e1', 'admin'),
 ('Asha Rao',     'asha@eventra.edu',    'a1b2c3d4e5f60718293a4b5c6d7e8f90:5bd760654e3225fbc5a303ef4c939c10a37bea4f6f9ed2dab65d5c259f8e88a89d1be95a9d75793ed1567532c2503dd551e3e9a3283781d6a67ea634498ca9e1', 'student'),
 ('Rohan Mehta',  'rohan@eventra.edu',   'a1b2c3d4e5f60718293a4b5c6d7e8f90:5bd760654e3225fbc5a303ef4c939c10a37bea4f6f9ed2dab65d5c259f8e88a89d1be95a9d75793ed1567532c2503dd551e3e9a3283781d6a67ea634498ca9e1', 'student'),
 ('Meera Nair',   'meera@eventra.edu',   'a1b2c3d4e5f60718293a4b5c6d7e8f90:5bd760654e3225fbc5a303ef4c939c10a37bea4f6f9ed2dab65d5c259f8e88a89d1be95a9d75793ed1567532c2503dd551e3e9a3283781d6a67ea634498ca9e1', 'student'),
 ('Karthik S',    'karthik@eventra.edu', 'a1b2c3d4e5f60718293a4b5c6d7e8f90:5bd760654e3225fbc5a303ef4c939c10a37bea4f6f9ed2dab65d5c259f8e88a89d1be95a9d75793ed1567532c2503dd551e3e9a3283781d6a67ea634498ca9e1', 'student'),
 ('Divya K',      'divya@eventra.edu',   'a1b2c3d4e5f60718293a4b5c6d7e8f90:5bd760654e3225fbc5a303ef4c939c10a37bea4f6f9ed2dab65d5c259f8e88a89d1be95a9d75793ed1567532c2503dd551e3e9a3283781d6a67ea634498ca9e1', 'student');

INSERT INTO venues (name, building, seating) VALUES
 ('Innovation Center', 'Tech Block',      200),
 ('Open Air Theatre',  'Central Lawn',    800),
 ('Main Ground',       'Sports Complex', 1500),
 ('Lab 3',             'CS Block',         40),
 ('Auditorium',        'Admin Block',     400);

-- Dates are relative to today so the "no past events" trigger never blocks the seed
INSERT INTO events (title, category, description, venue_id, event_date, event_time, capacity, created_by) VALUES
 ('CodeSprint Hackathon','Tech','A day-long hackathon. Form teams of up to four, pick a problem statement, and ship a working prototype by evening.',1, DATE_ADD(CURDATE(), INTERVAL 10 DAY),'10:00',20,1),
 ('Rangotsav Cultural Night','Culture','Music, dance and theatre performed by student clubs across departments.',2, DATE_ADD(CURDATE(), INTERVAL 14 DAY),'18:30',50,1),
 ('Inter-department Cricket','Sports','Knockout cricket tournament with eight teams. Captains register their squad of eleven.',3, DATE_ADD(CURDATE(), INTERVAL 12 DAY),'08:00',3,1),
 ('Intro to SQL Indexing','Workshop','Hands-on session on how indexes speed up queries, using a real event dataset.',4, DATE_ADD(CURDATE(), INTERVAL 5 DAY),'14:00',10,1),
 ('Startup Pitch Evening','Tech','Ten student teams pitch their startup ideas to a panel of alumni founders and investors.',5, DATE_ADD(CURDATE(), INTERVAL 20 DAY),'17:00',15,1);

-- The notify_registration trigger creates a notification for each of these rows
INSERT INTO registrations (user_id, event_id, status) VALUES
 (2,1,'confirmed'),(3,1,'confirmed'),(4,1,'confirmed'),(5,1,'confirmed'),
 (2,2,'confirmed'),(3,2,'confirmed'),(6,2,'confirmed'),
 (2,3,'confirmed'),(3,3,'confirmed'),(4,3,'confirmed'),(5,3,'waitlist'),
 (3,4,'confirmed'),(6,4,'confirmed'),
 (2,5,'confirmed');
