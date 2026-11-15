"use client";
import { useData, denied } from "@/lib/useData";

const Table = ({ title, note, cols, rows }) => (
  <div style={{ marginBottom: 40 }}>
    <h3>{title}</h3><p className="meta" style={{ marginTop: -8 }}>{note}</p>
    <div className="scroll"><table>
      <thead><tr>{cols.map(([, l]) => <th key={l}>{l}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{cols.map(([k]) => <td key={k}>{r[k]}</td>)}</tr>)}</tbody>
    </table></div>
  </div>
);

export default function Reports() {
  const { data: d, err } = useData("/api/admin/reports");
  if (denied(err)) return <p className="msg">{err}</p>;
  if (!d) return <p className="meta">{err || "Loading..."}</p>;
  return (
    <>
      <Table title="Registrations by category" note="GROUP BY ... WITH ROLLUP (the ALL row is the grand total)" cols={[["category", "Category"], ["registrations", "Registrations"]]} rows={d.rollup} />
      <Table title="Event ranking" note="Window functions: RANK() OVER (ORDER BY ...) and RANK() OVER (PARTITION BY category ...)" cols={[["title", "Event"], ["category", "Category"], ["taken", "Taken"], ["capacity", "Capacity"], ["overallRank", "Overall rank"], ["categoryRank", "Rank in category"]]} rows={d.ranking} />
      <Table title="Registrations per day" note="GROUP BY on a date expression" cols={[["day", "Day"], ["registrations", "Registrations"]]} rows={d.daily} />
      <Table title="Most active students" note="JOIN, SUM, GROUP BY, ORDER BY, LIMIT" cols={[["name", "Student"], ["total", "Registrations"], ["attended", "Checked in"]]} rows={d.topStudents} />
      <Table title="Venue usage" note="LEFT JOIN with aggregates" cols={[["name", "Venue"], ["seating", "Seating"], ["events", "Events"], ["largestEvent", "Largest event"]]} rows={d.venues} />
    </>
  );
}
