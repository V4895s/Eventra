import AdminTabs from "@/components/AdminTabs";

export default function AdminLayout({ children }) {
  return (<><h2>Admin</h2><AdminTabs />{children}</>);
}
