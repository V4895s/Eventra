# Test cases
**Automated:** with the app running, `npm run smoke` runs 17 checks (validation, authentication, authorization, registration procedure, triggers, constraints, SQL injection) and prints PASS or FAIL for each. Screenshot the output.

**Manual:** the table below.

Run these against the running app (`npm run dev`) with the seed data. Record Pass/Fail and attach a screenshot for each.

| ID | Area | Steps | Expected |
|---|---|---|---|
| T1 | Signup | Create an account with a valid name, email and password | Redirected to My registrations, signed in as a student |
| T2 | Signup validation | Sign up with password `abc` | Error: password needs 8+ characters with a letter and a number |
| T3 | Duplicate email | Sign up again with the same email | Error: email already registered |
| T4 | Login | Log in with `asha@eventra.edu` / `Password@123` | Signed in |
| T5 | Bad login | Log in with a wrong password | Error: Invalid email or password |
| T6 | Authorization | Signed in as student, open `/admin`, and call `/api/admin/stats` | Page says admins only; API returns 403 |
| T7 | Unauthenticated | Signed out, call `POST /api/events/1/register` | 401 Please sign in |
| T8 | Register | As Rohan, register for the SQL Indexing workshop | Status confirmed, seats left drops by 1 |
| T9 | Duplicate registration | Register for the same event again via API | 409, no second row in `registrations` |
| T10 | Waitlist | As Divya, register for Inter-department Cricket (full) | Status waitlist |
| T11 | Promotion | As Asha, cancel her cricket seat | Oldest waitlisted student becomes confirmed; row in `cancellation_log` |
| T12 | Past event trigger | In SQL, insert a registration for an event dated yesterday | Error: event has already taken place |
| T13 | Capacity trigger | As admin, set CodeSprint capacity to 1 | Error: capacity cannot be lower than confirmed registrations |
| T14 | Full-text search | Search `hack` on the Events page | CodeSprint Hackathon is returned |
| T15 | Filter | Click the Sports chip | Only sports events listed |
| T16 | Review rule | As a user with no registration, POST a review | 403 Only registered attendees can review |
| T17 | Review | As a confirmed attendee, submit a 4-star review | Review shown, average rating updated (MongoDB) |
| T18 | Admin add and delete | As admin, add an event, then delete it | Appears in list, then disappears; its registrations are cascaded |
| T19 | SQL injection | Search for `' OR 1=1 --` | No error, no extra rows (parameterised and sanitised) |
| T20 | Transaction | Run the manual transaction block in `queries.sql` | Rows vanish inside the transaction and return after ROLLBACK |
| T21 | Notification trigger | Register for an event, then open Notifications | A new message appears and the nav badge count goes up |
| T22 | Promotion notification | Cancel a confirmed cricket seat, sign in as the promoted student | Notification says a seat opened up |
| T23 | Venue capacity trigger | Admin Events: set a Lab 3 event capacity to 999 | Error: capacity exceeds the seating of the chosen venue |
| T24 | RESTRICT | Admin Venues: delete a venue that has events | Error: item still in use; venue remains |
| T25 | Check-in | Admin Attendees: check in a confirmed student | Button turns pink; the student's My tickets shows Checked in |
| T26 | Check-in rule | Call `PATCH /api/admin/attendees/<waitlist id>` | 404, only confirmed registrations can be checked in |
| T27 | Role change | Admin Users: promote a student, then demote them again | Role updates; changing your own role is refused |
| T28 | Instant demotion | Demote an admin, then reload an admin tab as them | 403 Admins only, without signing in again |
| T29 | Password change | Profile: change password with a wrong current password | Error: current password is incorrect |
| T30 | Reports | Open Admin Reports | Rollup shows an ALL row; ranking shows overall and category ranks |
