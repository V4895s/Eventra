// Automated checks against the running app:  npm run dev  (one terminal)  then  npm run smoke  (another)
const BASE = process.env.BASE || "http://localhost:3000";
let pass = 0, fail = 0;
const check = (name, ok) => { console.log((ok ? "PASS  " : "FAIL  ") + name); ok ? pass++ : fail++; };

async function call(method, path, body, cookie) {
  const r = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const set = r.headers.get("set-cookie");
  let json = null;
  try { json = await r.json(); } catch {}
  return { status: r.status, json, cookie: set ? set.split(";")[0] : null };
}

(async () => {
  const email = `smoke${Date.now()}@test.edu`;
  let r = await call("POST", "/api/auth/signup", { name: "Smoke Test", email, password: "abc" });
  check("weak password rejected (400)", r.status === 400);
  r = await call("POST", "/api/auth/signup", { name: "Smoke Test", email, password: "Password1" });
  check("signup works and sets a cookie", r.status === 200 && !!r.cookie);
  const student = r.cookie;
  r = await call("POST", "/api/auth/signup", { name: "Smoke Test", email, password: "Password1" });
  check("duplicate email rejected (409)", r.status === 409);
  r = await call("POST", "/api/auth/login", { email, password: "wrong-password" });
  check("wrong password rejected (401)", r.status === 401);
  r = await call("GET", "/api/events");
  check("events list loads", r.status === 200 && r.json.length > 0);
  const ev = r.json[0];
  r = await call("GET", "/api/events?q=" + encodeURIComponent("' OR 1=1 --"));
  check("SQL injection text is harmless (200)", r.status === 200);
  r = await call("POST", `/api/events/${ev.id}/register`);
  check("registering needs sign-in (401)", r.status === 401);
  r = await call("GET", "/api/admin/stats", null, student);
  check("student blocked from admin API (403)", r.status === 403);
  r = await call("POST", `/api/events/${ev.id}/register`, null, student);
  check("registration works (procedure + transaction)", r.status === 200 && ["confirmed", "waitlist"].includes(r.json.status));
  r = await call("POST", `/api/events/${ev.id}/register`, null, student);
  check("double registration rejected (409)", r.status === 409);
  r = await call("GET", "/api/notifications", null, student);
  check("trigger created a notification", r.status === 200 && r.json.items.length >= 1);
  r = await call("POST", `/api/events/${ev.id}/feedback`, { rating: 9 }, student);
  check("invalid rating rejected (400)", r.status === 400);
  r = await call("DELETE", `/api/events/${ev.id}/register`, null, student);
  check("cancellation works", r.status === 200);
  r = await call("POST", "/api/auth/login", { email: "admin@eventra.edu", password: "Password@123" });
  const admin = r.cookie;
  check("admin login", r.status === 200 && !!admin);
  r = await call("GET", "/api/admin/reports", null, admin);
  check("admin reports (ROLLUP and window functions)", r.status === 200 && r.json.ranking.length > 0);
  r = await call("PATCH", `/api/events/${ev.id}`, { capacity: 1 }, admin);
  check("capacity below confirmed seats blocked by trigger (400)", r.status === 400);
  r = await call("DELETE", `/api/venues/${ev.venueId}`, null, admin);
  check("venue in use cannot be deleted (409)", r.status === 409);
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("Could not reach the app. Is `npm run dev` running?", e.message); process.exit(1); });
