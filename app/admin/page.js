"use client";
import { useData, denied } from "@/lib/useData";

export default function Dashboard() {
  const { data: s, err } = useData("/api/admin/stats");
  if (denied(err)) return <p className="msg">{err}. <a href="/login">Sign in</a> with an admin account.</p>;
  if (!s) return <p className="meta">{err || "Loading..."}</p>;
  const t = s.totals;
  return (
    <>
      <div className="stats">
        <div className="stat"><b>{t.events}</b>Events</div><div className="stat"><b>{t.students}</b>Students</div>
        <div className="stat"><b>{t.confirmed}</b>Confirmed seats</div><div className="stat"><b>{t.waitlisted}</b>On waitlists</div>
      </div>
      <div className="split">
        <div>
          <h3>By category</h3>
          <div className="scroll"><table><thead><tr><th>Category</th><th>Events</th><th>Seats taken</th><th>Fill</th></tr></thead>
            <tbody>{s.byCategory.map((c) => <tr key={c.category}><td>{c.category}</td><td>{c.events}</td><td>{c.seatsTaken}</td><td>{c.fillPct}%</td></tr>)}</tbody></table></div>
          <h3 style={{ marginTop: 36 }}>Filling faster than their category average</h3>
          {s.hot.map((h) => <div className="row" key={h.title}><span>{h.title}</span><span className="meta">{h.fillPct}% full</span></div>)}
          {!s.hot.length && <p className="meta">None right now.</p>}
        </div>
        <div>
          <h3>Recent activity <span className="meta">(MongoDB)</span></h3>
          {s.activity.map((a, i) => <div className="row" key={i}><span>{a.userName} {a.action}</span><span className="meta">{new Date(a.at).toLocaleString()}</span></div>)}
          {!s.activity.length && <p className="meta">No activity yet.</p>}
        </div>
      </div>
    </>
  );
}
