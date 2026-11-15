export async function api(url, opt = {}) {
  const res = await fetch(url, {
    method: opt.method || "GET",
    headers: { "Content-Type": "application/json" },
    body: opt.body ? JSON.stringify(opt.body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Something went wrong");
  return data;
}
