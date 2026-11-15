"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [["/admin", "Dashboard"], ["/admin/events", "Events"], ["/admin/attendees", "Attendees"], ["/admin/venues", "Venues"],
              ["/admin/users", "Users"], ["/admin/reports", "Reports"], ["/admin/audit", "Audit log"]];

export default function AdminTabs() {
  const path = usePathname();
  return <div className="tabs">{TABS.map(([href, label]) => <Link key={href} href={href} className={path === href ? "on" : ""}>{label}</Link>)}</div>;
}
