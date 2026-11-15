"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";

export default function EventPage() {
  const { id } = useParams();
  const [ev, setEv] = useState(null), [user, setUser] = useState(null), [status, setStatus] = useState(null);
  const [fb, setFb] = useState({ reviews: [], avg: null, count: 0 }), [msg, setMsg] = useState("");
  const [rating, setRating] = useState(5), [comment, setComment] = useState("");

  const load = useCallback(async () => {
    try {
      setEv(await api(`/api/events/${id}`));
      setFb(await api(`/api/events/${id}/feedback`));
      const u = await api("/api/auth/me");
      setUser(u);
      if (u) setStatus((await api("/api/my")).find((r) => String(r.eventId) === String(id))?.status || null);
    } catch (e) { setMsg(e.message); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const act = async (fn, ok) => { try { await fn(); setMsg(ok); } catch (e) { setMsg(e.message); } load(); };
  if (!ev) return <p className="meta">{msg || "Loading..."}</p>;

  return (
    <>
      <p><Link href="/events">← Events</Link></p>
      <div className="split">
        <div>
          <span className="tag">{ev.category}</span>
          <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)" }}>{ev.title}</h1>
          <p>{ev.description}</p>

          <h3 style={{ marginTop: 48 }}>Reviews {fb.count > 0 && <span className="meta">· {fb.avg}/5 from {fb.count}</span>}</h3>
          {fb.reviews.map((r, i) => (
            <div className="row" key={i}><div><b>{r.userName}</b> <span className="meta">{r.rating}/5</span><br />{r.comment}</div></div>
          ))}
          {!fb.reviews.length && <p className="meta">No reviews yet.</p>}
          {status === "confirmed" && (
            <form style={{ marginTop: 20 }} onSubmit={(e) => { e.preventDefault(); act(() => api(`/api/events/${id}/feedback`, { method: "POST", body: { rating, comment } }), "Review saved"); }}>
              <label>Rating<select value={rating} onChange={(e) => setRating(+e.target.value)}>{[5, 4, 3, 2, 1].map((n) => <option key={n}>{n}</option>)}</select></label>
              <label>Comment<textarea rows={3} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} /></label>
              <button className="alt">Save review</button>
            </form>
          )}
        </div>
        <div className="panel">
          <p className="meta" style={{ marginTop: 0 }}>{ev.date} at {ev.time}<br />{ev.venue}, {ev.building}</p>
          <p><b>{ev.taken}</b> of {ev.capacity} seats taken</p>
          <div className="bar" style={{ marginBottom: 24 }}><b style={{ width: Math.min(100, (ev.taken / ev.capacity) * 100) + "%" }} /></div>
          {msg && <p className="msg" role="status">{msg}</p>}
          {!user && <Link className="btn pink" href="/login">Sign in to register</Link>}
          {user && !status && <button className="pink" onClick={() => act(() => api(`/api/events/${id}/register`, { method: "POST" }), "Registration saved")}>{ev.seatsLeft > 0 ? "Register" : "Join waitlist"}</button>}
          {user && status && (
            <>
              <p><b>{status === "confirmed" ? "You are registered." : "You are on the waitlist."}</b></p>
              <button className="alt" onClick={() => act(() => api(`/api/events/${id}/register`, { method: "DELETE" }), "Registration cancelled")}>Cancel registration</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
