"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useData } from "@/lib/useData";

const pad = (n) => String(n).padStart(2, "0");
const key = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Calendar() {
  const { data, err } = useData("/api/events");
  const now = new Date();
  const todayKey = key(now.getFullYear(), now.getMonth(), now.getDate());
  const [cur, setCur] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [sel, setSel] = useState(null);
  const byDay = useMemo(() => {
    const m = {};
    for (const e of data || []) (m[e.date] ??= []).push(e);
    return m;
  }, [data]);
  if (!data) return <p className="meta">{err || "Loading..."}</p>;

  const first = new Date(cur.y, cur.m, 1);
  const offset = (first.getDay() + 6) % 7; // week starts on Monday
  const days = new Date(cur.y, cur.m + 1, 0).getDate();
  const go = (delta) => { const d = new Date(cur.y, cur.m + delta, 1); setCur({ y: d.getFullYear(), m: d.getMonth() }); setSel(null); };
  const monthKey = `${cur.y}-${pad(cur.m + 1)}`;
  const list = sel ? byDay[sel] || [] : data.filter((e) => e.date.startsWith(monthKey));
  const selLabel = sel && new Date(+sel.slice(0, 4), +sel.slice(5, 7) - 1, +sel.slice(8)).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <h2>Calendar</h2>
      <div className="cal-head">
        <h3>{first.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</h3>
        <div className="cal-nav">
          <button className="alt sm" onClick={() => go(-1)} aria-label="Previous month">←</button>
          <button className="alt sm" onClick={() => { setCur({ y: now.getFullYear(), m: now.getMonth() }); setSel(null); }}>Today</button>
          <button className="alt sm" onClick={() => go(1)} aria-label="Next month">→</button>
        </div>
      </div>

      <div className="cal">
        {DOW.map((d) => <div key={d} className="dow">{d}</div>)}
        {Array.from({ length: offset }, (_, i) => <div key={"b" + i} className="blank" />)}
        {Array.from({ length: days }, (_, i) => {
          const d = i + 1, k = key(cur.y, cur.m, d), ev = byDay[k] || [];
          return (
            <button key={k} className={"day " + (k === todayKey ? "today " : "") + (k === sel ? "sel " : "") + (k < todayKey ? "past" : "")}
              onClick={() => setSel(k === sel ? null : k)} aria-pressed={k === sel}
              aria-label={`${d} ${first.toLocaleDateString("en-IN", { month: "long" })}, ${ev.length} event${ev.length === 1 ? "" : "s"}`}>
              <span className="num">{d}</span>
              {ev.slice(0, 2).map((e) => <span key={e.id} className="evchip">{e.time} {e.title}</span>)}
              {ev.length > 2 && <span className="more">+{ev.length - 2} more</span>}
              {ev.length > 0 && <span className="dots">{ev.slice(0, 3).map((e) => <i key={e.id} />)}</span>}
            </button>
          );
        })}
      </div>

      <h3 style={{ marginTop: 40 }}>{sel ? selLabel : "Events this month"}</h3>
      {list.map((e) => {
        const [Y, M, D] = e.date.split("-");
        const mon = new Date(+Y, +M - 1, +D).toLocaleDateString("en-IN", { month: "short" });
        return (
          <Link key={e.id} href={`/events/${e.id}`} className="ag">
            <div className="d"><b>{+D}</b><span>{mon}</span></div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.25rem" }}>{e.title}</h3>
              <span className="meta">{e.time} · {e.venue}, {e.building} · {e.category}</span>
            </div>
            <span className="tag">{e.seatsLeft > 0 ? `${e.seatsLeft} seats left` : "Full · waitlist"}</span>
          </Link>
        );
      })}
      {!list.length && <p className="meta">{sel ? "No events on this day." : "No events this month. Use the arrows to look at another month."}</p>}
    </>
  );
}