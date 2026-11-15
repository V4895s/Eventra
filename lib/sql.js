// Shared SELECT for event cards: joins venues, uses the event_fill VIEW and fn_seats_left() FUNCTION.
export const EVENT_SELECT = `
  SELECT e.event_id AS id, e.title, e.category,
         DATE_FORMAT(e.event_date, '%Y-%m-%d') AS date,
         TIME_FORMAT(e.event_time, '%H:%i') AS time,
         v.name AS venue, v.building, e.venue_id AS venueId,
         e.description, e.capacity, f.taken,
         fn_seats_left(e.event_id) AS seatsLeft
  FROM events e
  JOIN venues v     ON v.venue_id = e.venue_id
  JOIN event_fill f ON f.event_id = e.event_id`;
