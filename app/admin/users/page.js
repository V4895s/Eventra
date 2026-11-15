"use client";
import { useState } from "react";
import { api } from "@/lib/client";
import { useData, denied } from "@/lib/useData";

export default function Users() {
  const { data, err, load } = useData("/api/admin/users");
  const [msg, setMsg] = useState("");
  const setRole = async (id, role) => { try { await api(`/api/admin/users/${id}`, { method: "PATCH", body: { role } }); setMsg("Role updated"); } catch (e) { setMsg(e.message); } load(); };
  if (denied(err)) return <p className="msg">{err}</p>;
  return (
    <>
      <h3>Users</h3>
      {msg && <p className="msg" role="status">{msg}</p>}
      <div className="scroll"><table>
        <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Registrations</th><th>Role</th></tr></thead>
        <tbody>{data?.map((u) => (
          <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.joined}</td><td>{u.registrations}</td>
            <td><select value={u.role} onChange={(e) => setRole(u.id, e.target.value)} style={{ width: 120 }} aria-label={`Role for ${u.name}`}><option>student</option><option>admin</option></select></td></tr>
        ))}</tbody>
      </table></div>
    </>
  );
}
