import { bad } from "./api";

export const CATS = ["Tech", "Culture", "Sports", "Workshop"];

export function text(v, name, min, max) {
  const s = String(v ?? "").trim();
  if (s.length < min || s.length > max) throw bad(`${name} must be ${min}-${max} characters`);
  return s;
}
export function email(v) {
  const s = text(v, "Email", 5, 150).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw bad("Enter a valid email address");
  return s;
}
export function password(v) {
  const s = String(v ?? "");
  if (s.length < 8 || s.length > 100 || !/\d/.test(s) || !/[A-Za-z]/.test(s)) throw bad("Password needs 8+ characters with a letter and a number");
  return s;
}
export function int(v, name, min, max) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw bad(`${name} must be a whole number from ${min} to ${max}`);
  return n;
}
export function oneOf(v, list, name) {
  if (!list.includes(v)) throw bad(`Invalid ${name}`);
  return v;
}
export function date(v) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v || "")) throw bad("Invalid date");
  return v;
}
export function time(v) {
  if (!/^\d{2}:\d{2}$/.test(v || "")) throw bad("Invalid time");
  return v;
}
