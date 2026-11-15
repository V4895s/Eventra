"use client";
import { useData, denied } from "@/lib/useData";

export default function Audit() {
  const { data: d, err } = useData("/api/admin/audit");
  if (denied(err)) return <p className="msg">{err}</p>;
  if (!d) return <p className="meta">{err || "Loading..."}</p>;
  return (
    <div className="split">
      <div>
        <h3>Cancellations <span className="meta">(MySQL trigger: log_cancel)</span></h3>
        {d.cancellations.map((c) => <div className="row" key={c.id}><span>{c.student} cancelled {c.event} <span className="meta">({c.oldStatus})</span></span><span className="meta">{new Date(c.at).toLocaleString()}</span></div>)}
        {!d.cancellations.length && <p className="meta">No cancellations yet.</p>}
      </div>
      <div>
        <h3>Activity <span className="meta">(MongoDB)</span></h3>
        {d.activity.map((a, i) => <div className="row" key={i}><span>{a.userName} {a.action}</span><span className="meta">{new Date(a.at).toLocaleString()}</span></div>)}
        {!d.activity.length && <p className="meta">No activity yet.</p>}
      </div>
    </div>
  );
}
