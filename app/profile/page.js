"use client";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/client";
import { useData } from "@/lib/useData";

const initials = (n) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

export default function Profile() {
  const { data: p, err } = useData("/api/profile");
  const [msg, setMsg] = useState(""), [show, setShow] = useState(false);
  const [pw, setPw] = useState({ cur: "", next: "", again: "" });
  if (err === "Please sign in") return <p><Link href="/login">Sign in</Link> to see your profile.</p>;
  if (!p) return <p className="meta">{err || "Loading..."}</p>;

  const saveName = async (e) => {
    e.preventDefault();
    try {
      await api("/api/profile", { method: "PUT", body: { name: new FormData(e.target).get("name") } });
      setMsg("Name updated");
      setTimeout(() => window.location.reload(), 700);
    } catch (x) { setMsg(x.message); }
  };
  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.next !== pw.again) return setMsg("The two new passwords do not match");
    try {
      await api("/api/profile", { method: "PUT", body: { name: p.name, currentPassword: pw.cur, newPassword: pw.next, confirmPassword: pw.again } });
      setPw({ cur: "", next: "", again: "" });
      setMsg("Password changed. Use your new password the next time you sign in.");
    } catch (x) { setMsg(x.message); }
  };
  const type = show ? "text" : "password";

  return (
    <>
      <h2>Profile</h2>
      {msg && <p className="msg" role="status">{msg}</p>}
      <div className="pf">
        <aside className="pf-card">
          <div className="avatar" aria-hidden="true">{initials(p.name)}</div>
          <h3>{p.name}</h3>
          <p className="meta" style={{ margin: 0 }}>{p.email}</p>
          <span className="role">{p.role}</span>
          <p className="meta" style={{ margin: "4px 0 0" }}>Joined {p.joined}</p>
          <div className="pf-stats">
            <div><b>{p.registrations}</b><span>Registrations</span></div>
            <div><b>{p.attended}</b><span>Attended</span></div>
          </div>
        </aside>

        <div className="pf-forms">
          <form onSubmit={saveName}>
            <h3>Personal details</h3>
            <label>Name<input name="name" defaultValue={p.name} required minLength={2} maxLength={100} /></label>
            <button className="pink">Save name</button>
          </form>

          <form onSubmit={savePassword}>
            <h3>Change password</h3>
            <label>Current password<input type={type} value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} required autoComplete="current-password" /></label>
            <label>New password<input type={type} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required minLength={8} autoComplete="new-password" /></label>
            <label>Confirm new password<input type={type} value={pw.again} onChange={(e) => setPw({ ...pw, again: e.target.value })} required minLength={8} autoComplete="new-password" /></label>
            <p className={"hint " + (pw.again ? (pw.next === pw.again ? "ok" : "no") : "")}>
              {pw.again ? (pw.next === pw.again ? "Passwords match" : "Passwords do not match") : "At least 8 characters, with a letter and a number. Type the new password twice."}
            </p>
            <label className="chk"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords</label>
            <button className="pink">Change password</button>
          </form>
        </div>
      </div>
    </>
  );
}
