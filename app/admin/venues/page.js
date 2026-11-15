"use client";
import { useState } from "react";
import { api } from "@/lib/client";
import { useData, denied } from "@/lib/useData";

export default function Venues() {
  const { data, err, load } = useData("/api/venues");
  const [msg, setMsg] = useState("");
  const act = async (fn, ok) => { try { await fn(); setMsg(ok); } catch (e) { setMsg(e.message); } load(); };
  const add = (e) => { e.preventDefault(); const f = e.target; act(() => api("/api/venues", { method: "POST", body: Object.fromEntries(new FormData(f)) }), "Venue added").then(() => f.reset()); };
  if (denied(err)) return <p className="msg">{err}</p>;
  return (
    <div className="split">
      <div>
        <h3>Venues</h3>
        {msg && <p className="msg" role="status">{msg}</p>}
        {data?.map((v) => (
          <div className="row" key={v.id}>
            <span>{v.name} <span className="meta">· {v.building} · {v.events} event{v.events === 1 ? "" : "s"}</span></span>
            <span style={{ display: "flex", gap: 8 }}>
              <input type="number" min="1" defaultValue={v.seating} style={{ width: 90 }} aria-label="Seating"
                onBlur={(x) => +x.target.value !== v.seating && act(() => api(`/api/venues/${v.id}`, { method: "PUT", body: { name: v.name, building: v.building, seating: x.target.value } }), "Seating updated")} />
              <button className="alt sm" onClick={() => act(() => api(`/api/venues/${v.id}`, { method: "DELETE" }), "Venue deleted")}>Delete</button>
            </span>
          </div>
        ))}
      </div>
      <form className="panel" onSubmit={add}>
        <h3>Add venue</h3>
        <label>Name<input name="name" required minLength={2} /></label>
        <label>Building<input name="building" required minLength={2} /></label>
        <label>Seating<input name="seating" type="number" min="1" defaultValue="100" required /></label>
        <button className="pink">Add venue</button>
      </form>
    </div>
  );
}
