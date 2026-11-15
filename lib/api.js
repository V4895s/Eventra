import { NextResponse } from "next/server";
import { getUser } from "./auth";
import { db } from "./db";

export const bad = (message, status = 400) => Object.assign(new Error(message), { status });
const send = (error, status) => NextResponse.json({ error }, { status });

// Wraps a route handler: authentication, role check (authorization) and error mapping.
// role: undefined = public, true = any signed-in user, "admin" = admins only
export const wrap = (fn, role) => async (req, ctx) => {
  try {
    const user = getUser();
    if (role && !user) return send("Please sign in", 401);
    if (role === "admin") {
      // Re-check the role in the database so a demoted admin loses access immediately
      const [r] = await db.query("SELECT role FROM users WHERE user_id = ?", [user.id]);
      if (!r.length || r[0].role !== "admin") return send("Admins only", 403);
    }
    return await fn(req, ctx, user);
  } catch (e) {
    if (e.status) return send(e.message, e.status);
    if (e.code === "ER_DUP_ENTRY") return send("That entry already exists", 409);
    if (e.code === "ER_ROW_IS_REFERENCED_2") return send("This item is still in use and cannot be deleted", 409);
    if (e.code === "ER_NO_REFERENCED_ROW_2") return send("Invalid reference (for example, a venue that does not exist)", 400);
    if (e.sqlState === "45000") return send(e.sqlMessage, 400); // raised by MySQL triggers/procedures
    console.error(e);
    // In development show the real reason on screen; in production keep it generic
    return send(process.env.NODE_ENV === "production" ? "Server error" : `Server error: ${e.message}`, 500);
  }
};
