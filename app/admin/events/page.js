"use client";
import { useState } from "react";
import { api } from "@/lib/client";
import { useData, denied } from "@/lib/useData";

export default function AdminEvents() {
  const ev = useData("/api/events"), ve = useData("/api/venues");
  const [msg, setMsg] = useState("");
  const act = async (fn, ok) => { try { await fn(); setMsg(ok); } catch (e) { setMsg(e.message); } ev.load(); };
  const add = (e) => { e.preventDefault(); const f = e.target; act(() => api("/api/events", { method: "POST", body: Object.fromEntries(new FormData(f)) }), "Event added"); };
  if (denied(ev.err)) return <p className="msg">{ev.err}</p>;
  return (
    <div className="split">
      <div>
        <h3>Manage events</h3>
        {msg && <p className="msg" role="status">{msg}</p>}
        {ev.data?.map((e) => (
          <div className="row" key={e.id}>
            <span>{e.title} <span className="meta">({e.taken}/{e.capacity} · {e.venue})</span></span>
            <span style={{ display: "flex", gap: 8 }}>
              <input type="number" min="1" defaultValue={e.capacity} style={{ width: 80 }} aria-label="Capacity"
                onBlur={(x) => +x.target.value !== e.capacity && act(() => api(`/api/events/${e.id}`, { method: "PATCH", body: { capacity: x.target.value } }), "Capacity updated")} />
              <button className="alt sm" onClick={() => window.confirm("Delete this event?") && act(() => api(`/api/events/${e.id}`, { method: "DELETE" }), "Event deleted")}>Delete</button>
            </span>
          </div>
        ))}
      </div>
      <form className="panel" onSubmit={add}>
        <h3>Add event</h3>
        <label>Title<input name="title" required minLength={3} /></label>
        <label>Category<select name="category">{["Tech", "Culture", "Sports", "Workshop"].map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Venue<select name="venueId" required>{ve.data?.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.seating} seats)</option>)}</select></label>
        <label>Date<input name="date" type="date" required /></label>
        <label>Time<input name="time" type="time" defaultValue="10:00" required /></label>
        <label>Capacity<input name="capacity" type="number" min="1" defaultValue="50" required /></label>
        <label>Description<textarea name="description" rows={3} maxLength={1000} /></label>
        <button className="pink">Add event</button>
      </form>
    </div>
  );
}
