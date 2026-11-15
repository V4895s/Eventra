-- STAGE 2: ALTER and DROP demonstrations. Run once, after schema.sql.
USE eventra;

ALTER TABLE users  ADD COLUMN phone VARCHAR(15) NULL;                        -- add a column
ALTER TABLE venues MODIFY building VARCHAR(150) NOT NULL;                    -- change a column type
ALTER TABLE registrations ADD INDEX idx_reg_event_status (event_id, status); -- add an index
ALTER TABLE users  ADD CONSTRAINT chk_email_format CHECK (email LIKE '%@%'); -- add a constraint
ALTER TABLE users  DROP COLUMN phone;                                        -- drop the column again
DESCRIBE users;
SHOW INDEX FROM registrations;
