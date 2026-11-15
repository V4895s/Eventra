import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE = "ev_token";

export function sign(u) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing. Copy .env.example to .env, set it, then restart npm run dev");
  return jwt.sign({ id: u.user_id, name: u.name, role: u.role }, process.env.JWT_SECRET, { expiresIn: "2h" });
}
export function getUser() {
  const t = cookies().get(COOKIE)?.value;
  if (!t) return null;
  try { return jwt.verify(t, process.env.JWT_SECRET); } catch { return null; }
}
export function setAuthCookie(res, token) {
  res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 7200 });
  return res;
}
export function clearAuthCookie(res) {
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
