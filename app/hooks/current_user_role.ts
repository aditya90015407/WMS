"use client";

import { useEffect, useState } from "react";

type RoleResponse = {
  success?: boolean;
  data?: any;
  message?: string;
};

export function useCurrentUserRole(empCode: string) {
  const [roleData, setRoleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRole = async () => {
      if (!empCode) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/GetData/GetRole", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ EmpCode: empCode }),
        });

        const data: RoleResponse = await res.json();
        //  console.log(data)
        if (!res.ok || !data.success) {
          setError(data.message || "Failed to load role");
          setRoleData(null);
          return;
        }

        setRoleData(data.data);
      } catch (err) {
        console.error("Failed to load role", err);
        setError("Failed to load role");
        setRoleData(null);
      } finally {
        setLoading(false);
      }
    };

    void loadRole();
  }, [empCode]);

  return { roleData, loading, error };
}
