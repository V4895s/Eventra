"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "./client";

// Small data-loading hook used by the tab pages
export function useData(url) {
  const [data, setData] = useState(null), [err, setErr] = useState("");
  const load = useCallback(() => api(url).then((d) => { setData(d); setErr(""); }).catch((e) => setErr(e.message)), [url]);
  useEffect(() => { load(); }, [load]);
  return { data, err, setErr, load };
}

export const denied = (e) => e === "Please sign in" || e === "Admins only";
