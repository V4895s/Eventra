"use client";
import { useState } from "react";
import { api } from "@/lib/client";
import { useData, denied } from "@/lib/useData";

export default function Attendees() {
  const [eid, setEid] = useState(""), [msg, setMsg] = useState("");
  const events = useData("/api/events");
  const list = useData("/api/admin/attendees" + (eid ? `?eventId=${eid}` : ""));
  const toggle = async (r) => { try { await api(`/api/admin/attendees/${r.id}`, { method: "PATCH", body: { checkedIn: !r.checkedIn } }); setMsg(""); } catch (e) { setMsg(e.message); } list.load(); };
  if (denied(list.err)) return <p className="msg">{list.err}</p>;
  return (
    <>
      <label style={{ maxWidth: 360, marginBottom: 20 }}>Event
        <select value={eid} onChange={(e) => setEid(e.target.value)}>
          <option value="">All events</option>{events.data?.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
      </label>
      {msg && <p className="msg">{msg}</p>}
      <div className="scroll"><table>
        <thead><tr><th>Student</th><th>Email</th><th>Event</th><th>Status</th><th>Check-in</th></tr></thead>
        <tbody>{list.data?.map((r) => (
          <tr key={r.id}><td>{r.student}</td><td>{r.email}</td><td>{r.event}</td><td>{r.status}</td>
            <td>{r.status === "confirmed" ? <button className={"sm " + (r.checkedIn ? "pink" : "alt")} onClick={() => toggle(r)}>{r.checkedIn ? "Checked in" : "Check in"}</button> : <span className="meta">n/a</span>}</td></tr>
        ))}</tbody>
      </table></div>
      {list.data && !list.data.length && <p className="meta">No registrations.</p>}
    </>
  );
}
