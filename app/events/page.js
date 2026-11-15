"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";

const CATS = ["All", "Tech", "Culture", "Sports", "Workshop"];

export default function Events() {
  const [q, setQ] = useState(""), [cat, setCat] = useState("All"), [list, setList] = useState(null), [err, setErr] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams();
      if (q.trim()) p.set("q", q.trim());
      if (cat !== "All") p.set("category", cat);
      api("/api/events?" + p).then((d) => { setList(d); setErr(""); }).catch((e) => setErr(e.message));
    }, 250);
    return () => clearTimeout(t);
  }, [q, cat]);
  return (
    <>
      <h2>Events</h2>
      <div className="tools">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title or description" aria-label="Search events" />
        {CATS.map((c) => <button key={c} className={"chip " + (c === cat ? "on" : "")} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      {err && <p className="msg">{err}</p>}
      <div className="grid">
        {list?.map((e) => (
          <Link key={e.id} href={`/events/${e.id}`} className="card">
            <span className="tag">{e.category}</span>
            <h3>{e.title}</h3>
            <p className="meta">{e.date} · {e.venue}</p>
            <p className="meta">{e.seatsLeft > 0 ? `${e.seatsLeft} seats left` : "Full, waitlist open"}</p>
            <div className="bar"><b style={{ width: Math.min(100, (e.taken / e.capacity) * 100) + "%" }} /></div>
          </Link>
        ))}
      </div>
      {list && !list.length && <p className="meta">No events match. Try a different search or category.</p>}
    </>
  );
}
